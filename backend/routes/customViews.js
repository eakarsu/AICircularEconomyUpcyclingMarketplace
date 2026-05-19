/*
 * Custom Views router — 4 endpoints for the Impact Views feature pack.
 *
 *   VIZ   : POST /material-flow-sankey         -> Sankey nodes+links for waste→reuse→product
 *   VIZ   : POST /listing-category-heatmap     -> category x month heatmap (counts)
 *   NONVIZ: POST /impact-report-pdf            -> printable HTML for environmental impact report
 *   NONVIZ: GET/POST/PUT/DELETE /rules         -> listing/category rules editor (CRUD, in-memory)
 *
 * Each AI-backed endpoint synthesizes a small prompt against OpenRouter when the
 * key is configured. When the key is missing, the endpoint falls back to a
 * deterministic synthesizer so the UI remains usable in dev.
 */
const express = require('express');
const https = require('https');
const auth = require('../middleware/auth');
const router = express.Router();

function callOpenRouter(prompt, systemPrompt, maxTokens = 1200) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return reject(Object.assign(new Error('OPENROUTER_API_KEY not configured'), { code: 'MISSING_KEY' }));
    const body = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
    });
    const req = https.request({
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 30000,
    }, (resp) => {
      let data = '';
      resp.on('data', (c) => (data += c));
      resp.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('OpenRouter timeout')));
    req.write(body);
    req.end();
  });
}

function parseAIJson(text) {
  if (!text) return null;
  if (typeof text === 'object') return text;
  try { return JSON.parse(text); } catch (_) {}
  const fence = String(text).match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) { try { return JSON.parse(fence[1]); } catch (_) {} }
  const obj = String(text).match(/\{[\s\S]*\}/);
  if (obj) { try { return JSON.parse(obj[0]); } catch (_) {} }
  return null;
}

router.use(auth);

// ---------- VIZ 1: Material Flow Sankey (waste -> reuse -> product) ----------
router.post('/material-flow-sankey', async (req, res) => {
  const { region = 'Portland', period = 'Q2 2026' } = req.body || {};
  const fallback = {
    region, period,
    nodes: [
      { id: 'Textile Waste' }, { id: 'Wood Scrap' }, { id: 'Plastic' },
      { id: 'Metal' }, { id: 'Glass' },
      { id: 'Cleaned + Sorted' }, { id: 'Designer Workshops' }, { id: 'Repair Hubs' },
      { id: 'Upcycled Listings' }, { id: 'Resold Products' }, { id: 'Landfill Diverted' },
    ],
    links: [
      { source: 'Textile Waste', target: 'Cleaned + Sorted', value: 420 },
      { source: 'Wood Scrap', target: 'Cleaned + Sorted', value: 310 },
      { source: 'Plastic', target: 'Cleaned + Sorted', value: 280 },
      { source: 'Metal', target: 'Cleaned + Sorted', value: 190 },
      { source: 'Glass', target: 'Cleaned + Sorted', value: 110 },
      { source: 'Cleaned + Sorted', target: 'Designer Workshops', value: 520 },
      { source: 'Cleaned + Sorted', target: 'Repair Hubs', value: 360 },
      { source: 'Designer Workshops', target: 'Upcycled Listings', value: 480 },
      { source: 'Repair Hubs', target: 'Upcycled Listings', value: 290 },
      { source: 'Upcycled Listings', target: 'Resold Products', value: 610 },
      { source: 'Resold Products', target: 'Landfill Diverted', value: 610 },
    ],
    notes: 'Synthetic baseline; values are tons. Flow: waste -> reuse -> product.',
  };
  try {
    if (!process.env.OPENROUTER_API_KEY) return res.json({ ...fallback, ai: false });
    const sys = 'You are a circular-economy data analyst. Respond with strict JSON only.';
    const prompt = `Produce a small material-flow Sankey dataset for the region "${region}" during ${period} showing flow from waste -> reuse -> finished product. Return JSON {"nodes":[{"id":string}],"links":[{"source":string,"target":string,"value":number}],"notes":string}. Values are tons. Keep nodes <= 12, links <= 14.`;
    const ai = await callOpenRouter(prompt, sys);
    const content = ai?.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content);
    if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
      return res.json({ region, period, ...parsed, ai: true });
    }
    return res.json({ ...fallback, ai: false, ai_error: 'unparseable' });
  } catch (e) {
    return res.json({ ...fallback, ai: false, ai_error: String(e.message || e) });
  }
});

// ---------- VIZ 2: Listing Category Heatmap (category x month) ----------
router.post('/listing-category-heatmap', async (req, res) => {
  const { year = 2026 } = req.body || {};
  const categories = ['Home Goods', 'Apparel', 'Furniture', 'Electronics', 'Jewelry', 'Garden'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fallbackMatrix = categories.map((cat, ci) =>
    months.map((_, mi) => Math.round(20 + Math.abs(Math.sin((ci + 1) * (mi + 1))) * 80 + (mi * 3))),
  );
  const fallback = { year, categories, months, matrix: fallbackMatrix, unit: 'listings' };
  try {
    if (!process.env.OPENROUTER_API_KEY) return res.json({ ...fallback, ai: false });
    const sys = 'You are an analyst for an upcycling marketplace. Respond with strict JSON only.';
    const prompt = `Generate a listing-count heatmap for year ${year}. Return JSON {"categories":[string],"months":[string],"matrix":[[number]]}. Use these categories: ${categories.join(', ')}. Months Jan..Dec. Values 0-150 plausible per month.`;
    const ai = await callOpenRouter(prompt, sys);
    const parsed = parseAIJson(ai?.choices?.[0]?.message?.content || '');
    if (parsed && Array.isArray(parsed.matrix) && Array.isArray(parsed.categories) && Array.isArray(parsed.months)) {
      return res.json({ year, ...parsed, unit: 'listings', ai: true });
    }
    return res.json({ ...fallback, ai: false, ai_error: 'unparseable' });
  } catch (e) {
    return res.json({ ...fallback, ai: false, ai_error: String(e.message || e) });
  }
});

// ---------- NON-VIZ 1: Environmental Impact Report PDF (printable HTML) ----------
router.post('/impact-report-pdf', async (req, res) => {
  const {
    org = 'Local Reuse Co-op',
    period = 'Q2 2026',
    tons_diverted = 312,
    listings = 480,
    repairs = 90,
  } = req.body || {};
  let summary = `During ${period}, ${org} diverted ${tons_diverted} tons of material from landfill across ${listings} upcycled listings, avoiding an estimated ${(tons_diverted * 1.4).toFixed(1)} tCO2e.`;
  let highlights = [
    `${tons_diverted} tons diverted from landfill`,
    `${listings} upcycled product listings`,
    `${repairs} repair-cafe sessions held`,
    `${(tons_diverted * 1.4).toFixed(1)} tCO2e avoided (factor 1.4)`,
  ];
  let recommendations = [
    'Expand textile sortation line in Q3',
    'Add two new community collection points',
    'Launch buyer-side carbon receipts',
  ];
  try {
    if (process.env.OPENROUTER_API_KEY) {
      const sys = 'You write concise environmental impact reports. Return strict JSON.';
      const prompt = `Compose an environmental impact report for ${org} covering ${period}. Inputs: tons_diverted=${tons_diverted}, listings=${listings}, repairs=${repairs}. Return JSON {"summary":string,"highlights":[string],"recommendations":[string]}.`;
      const ai = await callOpenRouter(prompt, sys, 700);
      const parsed = parseAIJson(ai?.choices?.[0]?.message?.content || '');
      if (parsed?.summary) summary = parsed.summary;
      if (Array.isArray(parsed?.highlights)) highlights = parsed.highlights.slice(0, 8);
      if (Array.isArray(parsed?.recommendations)) recommendations = parsed.recommendations.slice(0, 6);
    }
  } catch (_) { /* keep defaults */ }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Impact Report — ${org}</title>
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 32px; color: #1f2937; max-width: 760px; margin: 0 auto; }
  h1 { margin: 0 0 4px 0; color: #065f46; }
  .meta { color: #6b7280; margin: 4px 0 24px; }
  h2 { margin-top: 28px; color: #047857; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  .kpi-row { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
  .kpi { flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; min-width: 140px; }
  .kpi strong { font-size: 1.4rem; color: #065f46; display: block; }
  ul { margin: 8px 0 0 18px; line-height: 1.7; }
  footer { margin-top: 40px; font-size: 0.8rem; color: #9ca3af; text-align: center; }
</style></head><body>
  <h1>Environmental Impact Report</h1>
  <div class="meta">${org} • ${period}</div>
  <div class="kpi-row">
    <div class="kpi"><strong>${tons_diverted}</strong> tons diverted</div>
    <div class="kpi"><strong>${listings}</strong> listings</div>
    <div class="kpi"><strong>${repairs}</strong> repairs</div>
    <div class="kpi"><strong>${(tons_diverted * 1.4).toFixed(1)}</strong> tCO2e avoided</div>
  </div>
  <h2>Executive Summary</h2>
  <p>${summary}</p>
  <h2>Highlights</h2>
  <ul>${highlights.map((b) => `<li>${b}</li>`).join('')}</ul>
  <h2>Recommendations</h2>
  <ul>${recommendations.map((b) => `<li>${b}</li>`).join('')}</ul>
  <footer>Generated by Impact Views • Printable environmental report</footer>
</body></html>`;

  res.json({
    org, period, tons_diverted, listings, repairs,
    summary, highlights, recommendations,
    pdf_html: html,
    ai: !!process.env.OPENROUTER_API_KEY,
  });
});

// ---------- NON-VIZ 2: Listing / Category Rules Editor (CRUD, in-memory) ----------
let RULES_STORE = [
  { id: 1, category: 'Furniture', material: 'wood', min_price: 25, max_price: 1500, requires_photo: true, active: true, notes: 'Solid wood only; no laminate.' },
  { id: 2, category: 'Apparel', material: 'textile', min_price: 5, max_price: 400, requires_photo: true, active: true, notes: 'Must be cleaned before listing.' },
  { id: 3, category: 'Electronics', material: 'mixed', min_price: 10, max_price: 800, requires_photo: true, active: false, notes: 'Battery items pending compliance review.' },
];
let RULES_SEQ = 4;

router.get('/rules', (req, res) => {
  res.json({ rules: RULES_STORE });
});

router.post('/rules', (req, res) => {
  const b = req.body || {};
  if (!b.category) return res.status(400).json({ error: 'category required' });
  const rule = {
    id: RULES_SEQ++,
    category: String(b.category),
    material: String(b.material || 'mixed'),
    min_price: Number(b.min_price) || 0,
    max_price: Number(b.max_price) || 0,
    requires_photo: b.requires_photo !== false,
    active: b.active !== false,
    notes: String(b.notes || ''),
  };
  RULES_STORE.push(rule);
  res.json({ rule });
});

router.put('/rules/:id', (req, res) => {
  const id = Number(req.params.id);
  const i = RULES_STORE.findIndex((r) => r.id === id);
  if (i < 0) return res.status(404).json({ error: 'rule not found' });
  const b = req.body || {};
  const r = RULES_STORE[i];
  RULES_STORE[i] = {
    ...r,
    category: b.category != null ? String(b.category) : r.category,
    material: b.material != null ? String(b.material) : r.material,
    min_price: b.min_price != null ? Number(b.min_price) : r.min_price,
    max_price: b.max_price != null ? Number(b.max_price) : r.max_price,
    requires_photo: b.requires_photo != null ? !!b.requires_photo : r.requires_photo,
    active: b.active != null ? !!b.active : r.active,
    notes: b.notes != null ? String(b.notes) : r.notes,
  };
  res.json({ rule: RULES_STORE[i] });
});

router.delete('/rules/:id', (req, res) => {
  const id = Number(req.params.id);
  const before = RULES_STORE.length;
  RULES_STORE = RULES_STORE.filter((r) => r.id !== id);
  if (RULES_STORE.length === before) return res.status(404).json({ error: 'rule not found' });
  res.json({ ok: true, id });
});

router.get('/health', (req, res) => res.json({ feature: 'custom_views', ok: true, ai_configured: !!process.env.OPENROUTER_API_KEY }));

module.exports = router;

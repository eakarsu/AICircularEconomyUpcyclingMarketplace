const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');
const pool = require('../db');
const router = express.Router();

const SERVICE_TITLE = 'AI Circular Economy Upcycling Marketplace';

async function callOpenRouter(prompt, systemPrompt, model) {
  const chosenModel = model || process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': SERVICE_TITLE,
    },
    body: JSON.stringify({
      model: chosenModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 3000,
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  return {
    content: data.choices[0].message.content,
    model: chosenModel,
    tokens: data.usage?.total_tokens || null,
  };
}

async function persistResult(userId, endpoint, params, result) {
  try {
    await pool.query(
      `INSERT INTO ai_results (user_id, endpoint, request_params, result_text, model_used, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, endpoint, JSON.stringify(params), result.content, result.model, result.tokens]
    );
  } catch (err) {
    console.error('Failed to persist AI result:', err.message);
  }
}

async function ensureAiTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_results (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      endpoint VARCHAR(100) NOT NULL,
      request_params JSONB,
      result_text TEXT NOT NULL,
      model_used VARCHAR(100),
      tokens_used INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}
ensureAiTables().catch(console.error);

router.get('/history', auth, async (req, res) => {
  try {
    const { endpoint, limit = 20, offset = 0 } = req.query;
    let query = `SELECT id, endpoint, request_params, result_text, model_used, tokens_used, created_at
                 FROM ai_results WHERE user_id = $1`;
    const params = [req.user.id];
    if (endpoint) {
      params.push(endpoint);
      query += ` AND endpoint = $${params.length}`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ results: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 1. Upcycle idea generator: turn raw materials into product ideas
router.post('/upcycle-idea', auth, async (req, res) => {
  try {
    const { materials, sellerSkills, toolsAvailable, targetMarket } = req.body;
    const prompt = `Generate 5 distinct upcycle product ideas from the following:
MATERIALS: ${materials || 'Unspecified'}
SELLER SKILLS: ${sellerSkills || 'General DIY'}
TOOLS AVAILABLE: ${toolsAvailable || 'Hand tools'}
TARGET MARKET: ${targetMarket || 'Eco-conscious consumers'}

For each idea: name, transformation steps (5-8), estimated retail price, target buyer persona, and unique selling angle.`;
    const systemPrompt = `You are a circular-economy product designer. Suggest realistic, profitable upcycle products. Always quantify time and materials.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'upcycle-idea', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Material valuation: estimate value of waste/raw materials
router.post('/material-valuation', auth, async (req, res) => {
  try {
    const { materialDescription, quantity, condition, region } = req.body;
    const prompt = `Estimate marketplace value for these reclaimed/waste materials:
DESCRIPTION: ${materialDescription || 'Not specified'}
QUANTITY: ${quantity || 'Unknown'}
CONDITION: ${condition || 'Unknown'}
REGION: ${region || 'Global'}

Provide: low/median/high price range, comparable transactions, recommended listing price, and which buyer segments would pay most.`;
    const systemPrompt = `You are a reclaimed-materials appraiser. Be realistic about resale economics. Reference comparable typical marketplace prices.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'material-valuation', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Listing optimizer: improve listing copy for circular-economy items
router.post('/listing-optimizer', auth, async (req, res) => {
  try {
    const { currentTitle, currentDescription, materials, photos } = req.body;
    const prompt = `Optimize this circular-economy marketplace listing:
CURRENT TITLE: ${currentTitle || 'None'}
CURRENT DESCRIPTION: ${currentDescription || 'None'}
MATERIALS USED: ${materials || 'Unspecified'}
PHOTOS PROVIDED: ${photos || 'Unknown'}

Produce: 3 SEO-optimized title variants, a sustainability-forward description (~150 words), key selling bullets, and recommended search tags.`;
    const systemPrompt = `You are a marketplace listing copywriter focused on circular economy. Highlight environmental impact in measurable terms (kg CO2 avoided, kg landfill diverted).`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'listing-optimizer', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Carbon-impact estimator: estimate avoided CO2 / landfill diversion
router.post('/carbon-impact', auth, async (req, res) => {
  try {
    const { materialType, weightKg, displacedProduct } = req.body;
    const prompt = `Estimate environmental impact of upcycling this item:
MATERIAL: ${materialType || 'Unknown'}
WEIGHT: ${weightKg || 'Unknown'} kg
DISPLACED NEW PRODUCT: ${displacedProduct || 'Equivalent virgin product'}

Provide: kg CO2 avoided, kg landfill diverted, water saved (L), energy saved (kWh). Show calculation methodology and cite emission factor sources commonly used.`;
    const systemPrompt = `You are a circular-economy LCA analyst. Use standard emission factors (e.g., DEFRA, EPA) and clearly state assumptions.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'carbon-impact', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Buyer-seller matching: match a buyer's need to upcycle inventory
router.post('/buyer-match', auth, async (req, res) => {
  try {
    const { buyerNeed, budget, location, sustainabilityGoals } = req.body;
    const inventory = await pool.query(
      `SELECT id, endpoint, request_params, result_text FROM ai_results
       WHERE user_id=$1 AND endpoint IN ('upcycle-idea','listing-optimizer') ORDER BY created_at DESC LIMIT 30`,
      [req.user.id]
    );
    const prompt = `Match this buyer to upcycle inventory:
BUYER NEED: ${buyerNeed || 'Unspecified'}
BUDGET: ${budget || 'Unspecified'}
LOCATION: ${location || 'Unspecified'}
SUSTAINABILITY GOALS: ${sustainabilityGoals || 'Reduce waste'}

INVENTORY (recent listings/ideas in this seller's history):
${inventory.rows.map(r => `- [${r.endpoint}] ${r.result_text.substring(0, 200)}`).join('\n') || 'No inventory recorded yet'}

Recommend top 3 matches with reasoning, plus suggested counter-offers / bundling.`;
    const systemPrompt = `You are a circular-economy marketplace matchmaker. Prioritize matches with high sustainability value AND realistic transaction probability.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'buyer-match', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Repair-vs-resell decision
router.post('/repair-or-resell', auth, async (req, res) => {
  try {
    const { itemDescription, currentCondition, repairCost, asIsValue, repairedValue } = req.body;
    const prompt = `Should this item be repaired before sale, sold as-is, or upcycled?
ITEM: ${itemDescription || 'Unspecified'}
CONDITION: ${currentCondition || 'Unspecified'}
REPAIR COST ESTIMATE: ${repairCost || 'Unknown'}
AS-IS RESALE VALUE: ${asIsValue || 'Unknown'}
REPAIRED RESALE VALUE: ${repairedValue || 'Unknown'}

Provide: clear recommendation, expected ROI of each path, time estimate, and risk factors.`;
    const systemPrompt = `You are a circular-economy refurbishment economist. Compute ROI explicitly and recommend the highest-margin path.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'repair-or-resell', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Pricing strategy
router.post('/pricing-strategy', auth, async (req, res) => {
  try {
    const { item, materialCost, laborHours, hourlyRate, marketTier } = req.body;
    const prompt = `Recommend pricing strategy for this upcycled item:
ITEM: ${item || 'Unspecified'}
MATERIAL COST: ${materialCost || 0}
LABOR HOURS: ${laborHours || 0}
HOURLY RATE: ${hourlyRate || 25}
TARGET MARKET TIER: ${marketTier || 'Mid-market'}

Provide: floor price, recommended price, premium price, justifications for each, and pricing-experiment plan to test elasticity.`;
    const systemPrompt = `You are a pricing strategist for handmade and upcycled goods. Always show cost breakdown and margin %.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'pricing-strategy', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Trend forecast: which categories of upcycle products are trending
router.post('/trend-forecast', auth, async (req, res) => {
  try {
    const { region, timeframe, category } = req.body;
    const prompt = `Forecast circular-economy / upcycle product trends:
REGION: ${region || 'Global'}
TIMEFRAME: ${timeframe || 'Next 12 months'}
CATEGORY FOCUS: ${category || 'All'}

Provide: top 5 trending material categories, top 5 trending finished-product types, demographic drivers, regulatory tailwinds, and 3 specific product ideas a seller could launch in 30 days.`;
    const systemPrompt = `You are a sustainable-commerce market analyst. Cite consumer behavior signals (search interest, regulation, demographics).`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'trend-forecast', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Authenticity / sustainability claim verification
router.post('/sustainability-verify', auth, async (req, res) => {
  try {
    const { claim, supportingEvidence, materialChain } = req.body;
    const prompt = `Audit this sustainability claim for a marketplace listing:
CLAIM: ${claim || 'Unspecified'}
EVIDENCE PROVIDED: ${supportingEvidence || 'None'}
MATERIAL CHAIN: ${materialChain || 'Unknown'}

Output: claim defensibility score 0-100, greenwashing risk level, missing documentation, suggested rewording that is accurate and still compelling.`;
    const systemPrompt = `You are a sustainability claims auditor. Be rigorous about greenwashing. Cite the specific FTC Green Guides / ISO 14021 principles when relevant.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'sustainability-verify', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. Seller growth coach
router.post('/seller-coach', auth, async (req, res) => {
  try {
    const { sellerStage, monthlyRevenue, topProducts, growthGoal } = req.body;
    const prompt = `Coach this circular-economy seller toward their growth goal:
STAGE: ${sellerStage || 'Hobbyist'}
MONTHLY REVENUE: ${monthlyRevenue || 0}
TOP PRODUCTS: ${topProducts || 'Unspecified'}
GROWTH GOAL: ${growthGoal || 'Double revenue in 90 days'}

Provide: 30/60/90-day action plan, 3 key metrics to track, marketing channel priorities (Etsy / Depop / Instagram / local markets), and inventory expansion plan.`;
    const systemPrompt = `You are a small-business coach for upcycle sellers. Be actionable, week-by-week, and realistic about hobbyist constraints.`;
    const result = await callOpenRouter(prompt, systemPrompt);
    await persistResult(req.user.id, 'seller-coach', req.body, result);
    res.json({ result: result.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

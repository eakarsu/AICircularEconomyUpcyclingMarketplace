import React, { useEffect, useState } from 'react';
import { apiFetch, postJson } from './api.js';
import AIFieldPresets, { completeExample } from './components/AIFieldPresets';
import AIResultView, { readableLabel } from './components/AIResultView';
import useCancelableAI from './components/useCancelableAI';

export default function AiToolPage({ title, intro, endpoint, fields = [] }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((field) => [field.name, field.default ?? ''])));
  const aiRequest = useCancelableAI();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const data = await apiFetch(`/api/ai/history?endpoint=${encodeURIComponent(endpoint)}&limit=20`);
      setHistory(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    setHistoryLoading(true);
    setHistoryError('');
    apiFetch(`/api/ai/history?endpoint=${encodeURIComponent(endpoint)}&limit=20`)
      .then((data) => { if (active) setHistory(Array.isArray(data.results) ? data.results : []); })
      .catch((error) => { if (active) setHistoryError(error.message); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [endpoint]);

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const onSubmit = async (event) => {
    event.preventDefault();
    const generated = await aiRequest.run((options) => {
      const payload = { ...form };
      for (const field of fields) {
        if (field.required && (payload[field.name] === '' || payload[field.name] === undefined)) throw new Error(field.label + ' is required.');
        if (field.type === 'json' && typeof payload[field.name] === 'string' && payload[field.name].trim()) { try { payload[field.name] = JSON.parse(payload[field.name]); } catch (_) { throw new Error(field.label + ': enter valid structured data.'); } }
        if (field.type === 'number' && payload[field.name] !== '') payload[field.name] = Number(payload[field.name]);
      }
      return postJson('/api/ai/' + endpoint, payload, options);
    });
    if (generated) await loadHistory();
  };
  return <div className="sr-ai-workspace"><h2>{title}</h2>{intro && <p className="muted">{intro}</p>}<div className="card"><form onSubmit={onSubmit}><AIFieldPresets fields={fields} context={title} disabled={aiRequest.loading} onFill={(sample, index) => { setForm(completeExample(fields, sample, index, title, form)); aiRequest.setResult(null); }} />{fields.map((field) => <div className="form-row" key={field.name}><label htmlFor={'ai-' + field.name}>{field.label}<span className="muted">{field.required ? ' · Required' : ' · Optional'}</span></label>{field.type === 'select' ? <select id={'ai-' + field.name} value={form[field.name] ?? ''} required={field.required} onChange={(event) => update(field.name, event.target.value)}><option value="">Select…</option>{(field.options || []).map((option) => <option key={typeof option === 'object' ? option.value : option} value={typeof option === 'object' ? option.value : option}>{typeof option === 'object' ? option.label : option}</option>)}</select> : field.type === 'textarea' || field.type === 'json' ? <textarea id={'ai-' + field.name} rows={field.rows || 4} value={form[field.name] ?? ''} required={field.required} placeholder={field.placeholder || ''} onChange={(event) => update(field.name, event.target.value)} /> : <input id={'ai-' + field.name} type={field.type || 'text'} min={field.min} max={field.max} step={field.step} value={form[field.name] ?? ''} required={field.required} placeholder={field.placeholder || ''} onChange={(event) => update(field.name, event.target.value)} />}</div>)}<div className="sr-actions"><button type="submit" className="primary" disabled={aiRequest.loading}>{aiRequest.loading ? 'Preparing report…' : 'Generate with OpenRouter'}</button>{aiRequest.loading && <button type="button" onClick={aiRequest.cancel}>Cancel</button>}</div></form></div>{aiRequest.notice && <div className="sr-notice" role="status">{aiRequest.notice}</div>}<AIResultView result={aiRequest.result} loading={aiRequest.loading} error={aiRequest.error} title={title} />
    <section className="sr-saved-results" aria-labelledby={`${endpoint}-saved-heading`}>
      <header className="sr-saved-header">
        <div><span className="sr-eyebrow">History</span><h2 id={`${endpoint}-saved-heading`}>Saved AI results</h2><p>Generated results are shown with the same readable report layout.</p></div>
        <button type="button" className="btn secondary btn-secondary" onClick={loadHistory} disabled={historyLoading}>{historyLoading ? 'Loading…' : 'Refresh'}</button>
      </header>
      {historyError && <div className="sr-alert" role="alert">Saved results could not be loaded: {historyError}</div>}
      {!historyLoading && !historyError && history.length === 0 && <p className="muted">No saved results for this tool yet.</p>}
      <div className="sr-saved-list">{history.map((item) => <details className="sr-saved-card" key={item.id}>
        <summary><span><strong>{title}</strong><small>{new Date(item.created_at).toLocaleString()}</small></span><span>Open saved result</span></summary>
        <div className="sr-saved-inputs"><h3>Request inputs</h3><dl>{Object.entries(item.request_params || {}).map(([key, value]) => <div key={key}><dt>{readableLabel(key)}</dt><dd>{String(value ?? 'Not provided')}</dd></div>)}</dl></div>
        <AIResultView response={{ result: item.result_text, model_used: item.model_used, tokens_used: item.tokens_used }} title={title} label="Saved result" />
      </details>)}</div>
    </section>
  </div>;
}

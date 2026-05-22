import React, { useState } from 'react';
import { postJson } from '../api.js';

export default function ListingPdf() {
  const [form, setForm] = useState({
    title: 'Reclaimed Oak Side Table',
    description: 'Hand-finished from salvaged oak floorboards.',
    price: 145,
    material: 'reclaimed oak',
    condition: 'Refinished',
    seller: 'Greenwood Atelier',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function generate() {
    setLoading(true); setError(''); setResult(null);
    try {
      const d = await postJson('/api/custom-views/listing-pdf', form);
      setResult(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  function openPreview() {
    if (!result?.pdf_html) return;
    const w = window.open('', '_blank');
    if (w) { w.document.write(result.pdf_html); w.document.close(); }
  }
  function downloadHtml() {
    if (!result?.pdf_html) return;
    const blob = new Blob([result.pdf_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${form.title.replace(/\W+/g, '_')}.html`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Marketplace Listing PDF</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {Object.entries(form).map(([k, v]) => (
          <div key={k} className="form-row" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11 }}>{k}</label>
            <input value={v} onChange={(e) => up(k, e.target.value)} />
          </div>
        ))}
      </div>
      <button className="primary" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate Listing PDF'}</button>
      {error && <div className="error">{error}</div>}
      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={openPreview}>Preview</button>
            <button onClick={downloadHtml}>Download HTML</button>
            <span className="muted" style={{ fontSize: 11, alignSelf: 'center' }}>{result.ai ? 'AI copy' : 'fallback copy'}</span>
          </div>
          <iframe title="listing-preview" srcDoc={result.pdf_html} style={{ width: '100%', height: 320, border: '1px solid #e5e7eb', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

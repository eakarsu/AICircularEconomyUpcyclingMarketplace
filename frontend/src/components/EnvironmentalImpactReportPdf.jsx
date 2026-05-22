import React, { useState } from 'react';
import { postJson } from '../api.js';

/*
 * Environmental Impact Report PDF — printable HTML report.
 * Renders a preview iframe and a "Print / Save as PDF" button.
 */
export default function EnvironmentalImpactReportPdf() {
  const [org, setOrg] = useState('Local Reuse Co-op');
  const [period, setPeriod] = useState('Q2 2026');
  const [tonsDiverted, setTonsDiverted] = useState(312);
  const [listings, setListings] = useState(480);
  const [repairs, setRepairs] = useState(90);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const d = await postJson('/api/custom-views/impact-report-pdf', {
        org, period,
        tons_diverted: Number(tonsDiverted),
        listings: Number(listings),
        repairs: Number(repairs),
      });
      setData(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  function printReport() {
    if (!data?.pdf_html) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(data.pdf_html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Environmental Impact Report (PDF)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
        <input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Organization" />
        <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Period" />
        <input type="number" value={tonsDiverted} onChange={(e) => setTonsDiverted(e.target.value)} placeholder="Tons diverted" />
        <input type="number" value={listings} onChange={(e) => setListings(e.target.value)} placeholder="Listings" />
        <input type="number" value={repairs} onChange={(e) => setRepairs(e.target.value)} placeholder="Repair sessions" />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="primary" onClick={load} disabled={loading}>{loading ? 'Generating…' : 'Generate Report'}</button>
        <button onClick={printReport} disabled={!data}>Print / Save as PDF</button>
      </div>
      {error && <div className="error">{error}</div>}
      {data && (
        <>
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <strong style={{ color: '#065f46' }}>Summary:</strong>
            <div style={{ marginTop: 4, fontSize: 14 }}>{data.summary}</div>
          </div>
          <iframe
            title="impact-report-preview"
            srcDoc={data.pdf_html}
            style={{ width: '100%', height: 420, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff' }}
          />
          <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
            {data.highlights?.length || 0} highlights • {data.recommendations?.length || 0} recommendations • {data.ai ? 'AI-drafted' : 'fallback'}
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { postJson } from '../api.js';

/*
 * Listing Category Heatmap — categories x months grid of listing counts.
 * Pure SVG, no chart library. Cells colored by intensity vs. matrix max.
 */
export default function ListingCategoryHeatmap() {
  const [year, setYear] = useState(2026);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const d = await postJson('/api/custom-views/listing-category-heatmap', { year: Number(year) });
      setData(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data.matrix)) return null;
    let max = 0;
    data.matrix.forEach((row) => row.forEach((v) => { if (v > max) max = v; }));
    return { max: max || 1 };
  }, [data]);

  function colorFor(v) {
    if (!stats) return '#f3f4f6';
    const t = Math.min(1, Math.max(0, v / stats.max));
    // green ramp: light -> dark
    const r = Math.round(220 - 180 * t);
    const g = Math.round(252 - 90 * t);
    const b = Math.round(220 - 170 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const cellW = 50, cellH = 30, padL = 110, padT = 30;
  const cols = data?.months?.length || 12;
  const rows = data?.categories?.length || 0;
  const svgW = padL + cellW * cols + 20;
  const svgH = padT + cellH * rows + 20;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Listing Category Heatmap (category × month)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" style={{ width: 110 }} />
        <button className="primary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="error">{error}</div>}
      {data && (
        <div style={{ overflowX: 'auto' }}>
          <svg width={svgW} height={svgH} style={{ background: '#f9fafb', borderRadius: 8 }}>
            {data.months.map((m, mi) => (
              <text key={mi} x={padL + mi * cellW + cellW / 2} y={padT - 8} textAnchor="middle" fontSize="10" fill="#374151">{m}</text>
            ))}
            {data.categories.map((c, ci) => (
              <text key={ci} x={padL - 6} y={padT + ci * cellH + cellH / 2 + 4} textAnchor="end" fontSize="11" fill="#374151">{c}</text>
            ))}
            {data.matrix.map((row, ri) => row.map((v, mi) => (
              <g key={`${ri}-${mi}`}>
                <rect x={padL + mi * cellW} y={padT + ri * cellH} width={cellW - 2} height={cellH - 2}
                  fill={colorFor(v)} stroke="#fff" strokeWidth="1" rx="2" />
                <text x={padL + mi * cellW + (cellW - 2) / 2} y={padT + ri * cellH + (cellH - 2) / 2 + 4}
                  textAnchor="middle" fontSize="10" fill={v / stats.max > 0.5 ? '#fff' : '#1f2937'}>{v}</text>
              </g>
            )))}
          </svg>
        </div>
      )}
      {data && (
        <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
          {rows} categories × {cols} months • unit: {data.unit || 'listings'} • {data.ai ? 'AI-synthesized' : 'fallback'}
        </div>
      )}
    </div>
  );
}

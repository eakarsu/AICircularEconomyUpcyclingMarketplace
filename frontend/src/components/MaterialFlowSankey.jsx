import React, { useEffect, useMemo, useState } from 'react';
import { postJson } from '../api.js';

/*
 * Material Flow Sankey — waste -> reuse -> product.
 * Self-contained SVG, no external chart library.
 */
export default function MaterialFlowSankey() {
  const [region, setRegion] = useState('Portland');
  const [period, setPeriod] = useState('Q2 2026');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const d = await postJson('/api/custom-views/material-flow-sankey', { region, period });
      setData(d);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* initial */ }, []);

  const layout = useMemo(() => {
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) return null;
    const col = {};
    function depth(id, seen = new Set()) {
      if (col[id] != null) return col[id];
      if (seen.has(id)) return 0;
      seen.add(id);
      const parents = data.links.filter((l) => l.target === id).map((l) => l.source);
      if (parents.length === 0) return (col[id] = 0);
      return (col[id] = 1 + Math.max(...parents.map((p) => depth(p, seen))));
    }
    data.nodes.forEach((n) => depth(n.id));
    const cols = {};
    Object.entries(col).forEach(([id, c]) => { (cols[c] = cols[c] || []).push(id); });
    const maxCol = Math.max(...Object.keys(cols).map(Number));
    const W = 760, H = 380, padX = 80, padY = 20;
    const colWidth = (W - 2 * padX) / Math.max(1, maxCol);
    const nodePositions = {};
    Object.entries(cols).forEach(([c, ids]) => {
      const ch = (H - 2 * padY) / ids.length;
      ids.forEach((id, i) => {
        nodePositions[id] = { x: padX + Number(c) * colWidth, y: padY + i * ch + ch / 2 };
      });
    });
    const maxValue = Math.max(...data.links.map((l) => l.value || 1));
    return { nodePositions, W, H, maxValue };
  }, [data]);

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Material Flow Sankey (waste → reuse → product)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Region" />
        <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Period" />
        <button className="primary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="error">{error}</div>}
      {layout && (
        <svg width={layout.W} height={layout.H} style={{ background: '#f9fafb', borderRadius: 8 }}>
          {data.links.map((l, i) => {
            const a = layout.nodePositions[l.source]; const b = layout.nodePositions[l.target];
            if (!a || !b) return null;
            const w = Math.max(1, (l.value / layout.maxValue) * 18);
            const mx = (a.x + b.x) / 2;
            return <path key={i} d={`M${a.x + 60} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`}
              stroke="#16a34a" strokeOpacity="0.35" strokeWidth={w} fill="none" />;
          })}
          {Object.entries(layout.nodePositions).map(([id, p]) => (
            <g key={id}>
              <rect x={p.x} y={p.y - 9} width={60} height={18} rx={4} fill="#1f2937" />
              <text x={p.x + 30} y={p.y + 4} textAnchor="middle" fontSize="9" fill="#fff">{id.slice(0, 10)}</text>
            </g>
          ))}
        </svg>
      )}
      {data && (
        <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
          {data.nodes?.length || 0} nodes • {data.links?.length || 0} links • {data.ai ? 'AI-synthesized' : 'fallback'} • {data.notes || ''}
        </div>
      )}
    </div>
  );
}

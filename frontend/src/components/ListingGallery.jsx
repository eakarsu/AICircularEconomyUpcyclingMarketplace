import React, { useEffect, useState } from 'react';
import { postJson } from '../api.js';

export default function ListingGallery() {
  const [category, setCategory] = useState('home goods');
  const [count, setCount] = useState(8);
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({});

  async function load() {
    setLoading(true); setError('');
    try {
      const d = await postJson('/api/custom-views/listing-gallery', { category, count: Number(count) });
      setTiles(Array.isArray(d.tiles) ? d.tiles : []);
      setMeta({ ai: d.ai });
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Upcycled Listing Gallery</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        <input type="number" value={count} onChange={(e) => setCount(e.target.value)} placeholder="Count" style={{ width: 80 }} />
        <button className="primary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div className="error">{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {tiles.map((t, i) => (
          <div key={t.id || i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: 90, background: t.color || '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {String(t.material || '').slice(0, 8)}
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
              <div style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>{t.price}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{t.badge} • {t.co2_saved_kg} kg CO2 saved</div>
            </div>
          </div>
        ))}
      </div>
      {tiles.length > 0 && <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>{tiles.length} listings • {meta.ai ? 'AI-curated' : 'fallback'}</div>}
    </div>
  );
}

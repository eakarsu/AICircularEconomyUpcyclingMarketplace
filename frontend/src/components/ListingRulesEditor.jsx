import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';

/*
 * Listing / Category Rules Editor — CRUD against /api/custom-views/rules.
 * Allows admins to author min/max prices per category, photo requirement,
 * and active flag. In-memory backend persistence (process-local).
 */
const EMPTY = {
  category: '', material: 'mixed', min_price: 0, max_price: 0,
  requires_photo: true, active: true, notes: '',
};

export default function ListingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const d = await apiFetch('/api/custom-views/rules');
      setRules(Array.isArray(d.rules) ? d.rules : []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startEdit(r) {
    setEditingId(r.id);
    setDraft({ ...r });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  async function save() {
    setError('');
    try {
      if (editingId != null) {
        await apiFetch(`/api/custom-views/rules/${editingId}`, {
          method: 'PUT', body: JSON.stringify(draft),
        });
      } else {
        await apiFetch('/api/custom-views/rules', {
          method: 'POST', body: JSON.stringify(draft),
        });
      }
      cancelEdit();
      load();
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    if (!confirm('Delete this rule?')) return;
    try {
      await apiFetch(`/api/custom-views/rules/${id}`, { method: 'DELETE' });
      load();
    } catch (e) { setError(e.message); }
  }

  function fld(key, val) { setDraft((d) => ({ ...d, [key]: val })); }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Listing / Category Rules Editor</h3>
      <p className="muted" style={{ marginTop: 0 }}>
        Author marketplace rules per category — price bands, photo requirements, active state.
      </p>
      {error && <div className="error">{error}</div>}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12, background: '#f9fafb' }}>
        <strong style={{ display: 'block', marginBottom: 8 }}>{editingId != null ? `Edit rule #${editingId}` : 'Add a new rule'}</strong>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
          <input value={draft.category} onChange={(e) => fld('category', e.target.value)} placeholder="Category" />
          <input value={draft.material} onChange={(e) => fld('material', e.target.value)} placeholder="Material" />
          <input type="number" value={draft.min_price} onChange={(e) => fld('min_price', Number(e.target.value))} placeholder="Min $" />
          <input type="number" value={draft.max_price} onChange={(e) => fld('max_price', Number(e.target.value))} placeholder="Max $" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={!!draft.requires_photo} onChange={(e) => fld('requires_photo', e.target.checked)} />
            Photo required
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={!!draft.active} onChange={(e) => fld('active', e.target.checked)} />
            Active
          </label>
        </div>
        <input value={draft.notes} onChange={(e) => fld('notes', e.target.value)} placeholder="Notes" style={{ marginTop: 8, width: '100%' }} />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button className="primary" onClick={save} disabled={!draft.category}>{editingId != null ? 'Update Rule' : 'Add Rule'}</button>
          {editingId != null && <button onClick={cancelEdit}>Cancel</button>}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Category</th>
              <th style={{ padding: 8 }}>Material</th>
              <th style={{ padding: 8 }}>Min $</th>
              <th style={{ padding: 8 }}>Max $</th>
              <th style={{ padding: 8 }}>Photo</th>
              <th style={{ padding: 8 }}>Active</th>
              <th style={{ padding: 8 }}>Notes</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: 8 }}>{r.id}</td>
                <td style={{ padding: 8 }}>{r.category}</td>
                <td style={{ padding: 8 }}>{r.material}</td>
                <td style={{ padding: 8 }}>{r.min_price}</td>
                <td style={{ padding: 8 }}>{r.max_price}</td>
                <td style={{ padding: 8 }}>{r.requires_photo ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8, color: r.active ? '#16a34a' : '#9ca3af' }}>{r.active ? 'Active' : 'Disabled'}</td>
                <td style={{ padding: 8, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => startEdit(r)} style={{ marginRight: 4 }}>Edit</button>
                  <button onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!loading && rules.length === 0 && (
              <tr><td colSpan={9} style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>No rules yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
        {rules.length} rule(s) loaded {loading ? '…' : ''}
      </div>
    </div>
  );
}

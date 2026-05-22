import React, { useState } from 'react';
import { postJson } from '../api.js';

export default function ImpactReportWizard() {
  const [form, setForm] = useState({
    org: 'Local Reuse Co-op',
    period: 'Q2 2026',
    tons_diverted: 312,
    listings: 480,
    repairs: 90,
  });
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ai, setAi] = useState(false);

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function run() {
    setLoading(true); setError(''); setSteps([]); setActiveStep(0);
    try {
      const d = await postJson('/api/custom-views/impact-report-wizard', form);
      setSteps(Array.isArray(d.steps) ? d.steps : []);
      setAi(!!d.ai);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Impact Report Wizard</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        {Object.entries(form).map(([k, v]) => (
          <div key={k} className="form-row" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: 11 }}>{k}</label>
            <input value={v} onChange={(e) => up(k, e.target.value)} />
          </div>
        ))}
      </div>
      <button className="primary" onClick={run} disabled={loading}>{loading ? 'Composing…' : 'Generate Report'}</button>
      {error && <div className="error">{error}</div>}
      {steps.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {steps.map((s, i) => (
              <button key={i} onClick={() => setActiveStep(i)}
                style={{ padding: '4px 10px', borderRadius: 4, border: 0, cursor: 'pointer',
                  background: i === activeStep ? '#2563eb' : '#e5e7eb',
                  color: i === activeStep ? '#fff' : '#1f2937', fontSize: 12 }}>
                {s.step ?? i + 1}. {s.title?.slice(0, 22) || `Step ${i + 1}`}
              </button>
            ))}
          </div>
          <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <h4 style={{ marginTop: 0 }}>{steps[activeStep]?.title}</h4>
            <p style={{ margin: 0 }}>{steps[activeStep]?.body}</p>
          </div>
          <div className="muted" style={{ marginTop: 8, fontSize: 11 }}>{steps.length} steps • {ai ? 'AI-drafted' : 'fallback draft'}</div>
        </div>
      )}
    </div>
  );
}

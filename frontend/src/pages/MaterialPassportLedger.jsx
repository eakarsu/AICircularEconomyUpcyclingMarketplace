import React, { useEffect, useState } from 'react';

export default function MaterialPassportLedger() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/material-passport-ledger').then((res) => res.json()).then(setData).catch(() => setData(null));
  }, []);
  return (
    <section>
      <h1>Material Passport Ledger</h1>
      <p>Verify source, condition, carbon savings, and resale readiness for reclaimed materials.</p>
      <div className="tool-grid">
        {data && Object.entries(data.summary).map(([key, value]) => <div className="card" key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{value}</strong></div>)}
      </div>
      <div className="card">
        {(data?.passports || []).map((item) => <div key={item.material} style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}><strong>{item.material}</strong><div>{item.origin} - grade {item.grade} - {item.chain} - {item.co2e_saved_kg} kg CO2e</div></div>)}
      </div>
    </section>
  );
}

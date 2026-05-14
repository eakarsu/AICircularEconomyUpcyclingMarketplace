import React from 'react';
import { Link } from 'react-router-dom';
import { TOOLS } from '../tools.js';

export default function Home() {
  return (
    <div>
      <h2>AI Circular Economy Upcycling Marketplace</h2>
      <p className="muted">Suite of AI tools for upcycle sellers, buyers, and marketplace operators.</p>
      <div className="tools-grid">
        {TOOLS.map((t) => (
          <Link key={t.path} to={t.path} className="tool-tile">
            <h3>{t.title}</h3>
            <p>{t.intro}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

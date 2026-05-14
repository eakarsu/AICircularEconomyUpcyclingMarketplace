import React from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { TOOLS } from './tools.js';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import UpcycleIdea from './pages/UpcycleIdea.jsx';
import MaterialValuation from './pages/MaterialValuation.jsx';
import ListingOptimizer from './pages/ListingOptimizer.jsx';
import CarbonImpact from './pages/CarbonImpact.jsx';
import BuyerMatch from './pages/BuyerMatch.jsx';
import RepairOrResell from './pages/RepairOrResell.jsx';
import PricingStrategy from './pages/PricingStrategy.jsx';
import TrendForecast from './pages/TrendForecast.jsx';
import SustainabilityVerify from './pages/SustainabilityVerify.jsx';
import SellerCoach from './pages/SellerCoach.jsx';

function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  function onLogout() { logout(); nav('/'); }
  return (
    <nav className="sidebar">
      <h1>Circular Economy AI</h1>
      <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
      <div style={{ marginTop: 12, fontSize: '0.75rem', textTransform: 'uppercase', color: '#9ca3af' }}>AI Tools</div>
      {TOOLS.map((t) => (
        <NavLink key={t.path} to={t.path} className={({ isActive }) => isActive ? 'active' : ''}>
          {t.title}
        </NavLink>
      ))}
      <div className="user-box">
        <div>Signed in as</div>
        <div><strong>{user?.name || user?.email}</strong></div>
        <button onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  );
}

function ProtectedShell({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return (
    <div className="app">
      <Sidebar />
      <div className="main">{children}</div>
    </div>
  );
}

export default function App() {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<ProtectedShell><Home /></ProtectedShell>} />
      <Route path="/tools/upcycle-idea" element={<ProtectedShell><UpcycleIdea /></ProtectedShell>} />
      <Route path="/tools/material-valuation" element={<ProtectedShell><MaterialValuation /></ProtectedShell>} />
      <Route path="/tools/listing-optimizer" element={<ProtectedShell><ListingOptimizer /></ProtectedShell>} />
      <Route path="/tools/carbon-impact" element={<ProtectedShell><CarbonImpact /></ProtectedShell>} />
      <Route path="/tools/buyer-match" element={<ProtectedShell><BuyerMatch /></ProtectedShell>} />
      <Route path="/tools/repair-or-resell" element={<ProtectedShell><RepairOrResell /></ProtectedShell>} />
      <Route path="/tools/pricing-strategy" element={<ProtectedShell><PricingStrategy /></ProtectedShell>} />
      <Route path="/tools/trend-forecast" element={<ProtectedShell><TrendForecast /></ProtectedShell>} />
      <Route path="/tools/sustainability-verify" element={<ProtectedShell><SustainabilityVerify /></ProtectedShell>} />
      <Route path="/tools/seller-coach" element={<ProtectedShell><SellerCoach /></ProtectedShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

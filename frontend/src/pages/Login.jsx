import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const demoLoginLock = useRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD;
  const demoConfigured = Boolean(demoEmail && demoPassword);

  async function onSubmit(event) {
    event.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await login(email, password);
      nav('/');
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFillDemoCredentials() {
    if (demoConfigured) { setEmail(demoEmail); setPassword(demoPassword); setErr(''); return; }
    try {
      const res = await fetch('/api/auth/demo-credentials', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (data && data.email && data.password) { setEmail(data.email); setPassword(data.password); setErr(''); return; }
    } catch {}
    setErr('Demo credentials are not configured for this environment.');
  }

  async function onDemoLogin() {
    if (demoLoginLock.current) return;
    demoLoginLock.current = true;
    setDemoLoginBusy(true);
    setErr('');
    try {
      const response = await fetch('/api/auth/demo-credentials', { cache: 'no-store' });
      const credentials = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(credentials.error || 'Demo credentials are unavailable');
      if (typeof credentials.email !== 'string' || !credentials.email || typeof credentials.password !== 'string' || !credentials.password) throw new Error('Demo credentials are unavailable');
      setEmail(credentials.email);
      setPassword(credentials.password);
      await login(credentials.email, credentials.password);
      nav('/');
    } catch (error) {
      setErr(error.message);
    } finally {
      demoLoginLock.current = false;
      setDemoLoginBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <h2>Sign in</h2>
      <p className="muted">Access your circular-economy marketplace tools.</p>
      <form onSubmit={onSubmit}>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <div className="error">{err}</div>}
        <button
          type="button"
          disabled={busy || demoLoginBusy}
          onClick={onDemoLogin}
          aria-label="Log in as Demo"
          style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
        >
          {demoLoginBusy ? 'Logging in as Demo…' : 'Log in as Demo'}
        </button>
        <button
          type="button"
          disabled={busy || demoLoginBusy}
          onClick={handleFillDemoCredentials}
          aria-label="Fill demo credentials"
          style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
        >
          Fill demo credentials
        </button>
        <button className="primary" disabled={busy || demoLoginBusy}>{busy ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="muted" style={{ marginTop: 16 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

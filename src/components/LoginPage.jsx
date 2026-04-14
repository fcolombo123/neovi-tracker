import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg3)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: '12px',
        padding: '32px', maxWidth: '380px', width: '90%', textAlign: 'center'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: '4px' }}>
          Neovi
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>Project Tracker</h1>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '24px' }}>
          Sign in with your email to continue
        </p>

        {sent ? (
          <div style={{
            background: 'var(--green-bg)', borderRadius: '8px', padding: '14px',
            fontSize: '13px', color: 'var(--green-text)'
          }}>
            Check your email for a magic link to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: '100%', padding: '10px 12px', fontSize: '14px',
                border: '0.5px solid var(--border2)', borderRadius: '8px',
                background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit',
                outline: 'none', marginBottom: '12px', boxSizing: 'border-box'
              }}
            />
            {error && (
              <div style={{
                background: 'var(--red-bg)', borderRadius: '8px', padding: '8px 12px',
                fontSize: '12px', color: 'var(--red-text)', marginBottom: '12px'
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '10px', fontSize: '14px', fontWeight: 500,
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: submitting ? 'wait' : 'pointer',
                fontFamily: 'inherit', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text3)' }}>
          No password needed — we'll email you a sign-in link
        </div>
      </div>
    </div>
  );
}

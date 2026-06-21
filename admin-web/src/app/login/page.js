'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Redirect to dashboard
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: 'var(--background)'
    }}>
      <div className="card glass-card" style={{
        maxWidth: 400,
        width: '100%',
        padding: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <h1 style={{ color: 'var(--accent-color)', fontSize: 32, letterSpacing: '-1px', marginBottom: 8 }}>
            BKJ<span style={{ color: 'white' }}> ADMIN</span>
          </h1>
          <p className="subtitle" style={{ fontSize: 14 }}>Sign in to manage your platform</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 8,
              color: '#ef4444',
              fontSize: 14,
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--card-border)',
                padding: '14px 16px',
                borderRadius: 12,
                color: 'white',
                fontSize: 16,
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--card-border)',
                padding: '14px 16px',
                borderRadius: 12,
                color: 'white',
                fontSize: 16,
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--accent-color)',
              color: '#000',
              fontWeight: 600,
              fontSize: 16,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 10,
              boxShadow: '0 4px 12px rgba(232, 245, 66, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(232, 245, 66, 0.05) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
    </div>
  );
}

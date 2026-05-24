import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { label: 'Directeur', slug: 'directeur', email: 'directeur@travaux.ma', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Chef chantier', slug: 'chef_chantier', email: 'chef@travaux.ma', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { label: 'Commercial', slug: 'commercial', email: 'commercial@travaux.ma', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Finance', slug: 'finance', email: 'finance@travaux.ma', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Admin', slug: 'admin', email: 'admin@travaux.ma', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'RH', slug: 'rh', email: 'rh@travaux.ma', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleRoleSelect = (role) => {
    setSelectedRole(role.slug);
    setEmail(role.email);
    setPassword('password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);
    try {
      const user = await login(email, password);
      const role = user?.role?.slug;
      if (role === 'directeur' || role === 'admin' || role === 'super_admin') navigate('/dashboard/director');
      else if (role === 'commercial') navigate('/dashboard/commercial');
      else if (role === 'chef_chantier') navigate('/dashboard/project-manager');
      else if (role === 'finance') navigate('/dashboard/finance');
      else navigate(from);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Vérifiez vos données.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', padding: '20px 16px' }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 12, overflow: 'hidden' }}>
        {/* Card header dark */}
        <div style={{ background: '#1C1C1C', padding: '20px 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: '#C85A2A', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>A</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>Atlas Works</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>ERP · BTP Maroc</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Gestion chantiers · Facturation · Paie · CRM</div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {/* Role selector */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#71717A', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Connexion rapide par rôle</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {ROLES.map((role) => (
                <button
                  key={role.slug}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    border: selectedRole === role.slug ? '1px solid #C85A2A' : '0.5px solid #E4E4E7',
                    borderRadius: 7,
                    padding: '8px 4px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: selectedRole === role.slug ? '#FDF0EA' : '#fff',
                    transition: 'all 0.1s',
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={selectedRole === role.slug ? '#C85A2A' : '#71717A'} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 3px' }}>
                    <path d={role.icon} />
                  </svg>
                  <div style={{ fontSize: 10, color: selectedRole === role.slug ? '#993C1D' : '#71717A', fontWeight: selectedRole === role.slug ? 500 : 400, lineHeight: 1.2 }}>{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', color: '#A1A1AA', fontSize: 11 }}>
            <div style={{ flex: 1, height: '0.5px', background: '#E4E4E7' }} />
            ou saisissez manuellement
            <div style={{ flex: 1, height: '0.5px', background: '#E4E4E7' }} />
          </div>

          {error && (
            <div style={{ background: '#FBEAEA', border: '0.5px solid #F7C1C1', borderRadius: 7, padding: '8px 12px', fontSize: 12, color: '#A32D2D', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#71717A', marginBottom: 5, letterSpacing: '0.03em' }}>Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="directeur@travaux.ma"
                style={{ width: '100%', border: '0.5px solid #D4D4D8', borderRadius: 7, padding: '9px 12px', fontSize: 13, background: '#fff', color: '#18181B', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#C85A2A'}
                onBlur={e => e.target.style.borderColor = '#D4D4D8'}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#71717A', marginBottom: 5, letterSpacing: '0.03em' }}>Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', border: '0.5px solid #D4D4D8', borderRadius: 7, padding: '9px 12px', fontSize: 13, background: '#fff', color: '#18181B', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#C85A2A'}
                onBlur={e => e.target.style.borderColor = '#D4D4D8'}
              />
            </div>

            <button
              type="submit"
              disabled={loadingSubmit}
              style={{ width: '100%', padding: '10px', background: loadingSubmit ? '#A8481F' : '#C85A2A', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: loadingSubmit ? 'default' : 'pointer', opacity: loadingSubmit ? 0.8 : 1, transition: 'opacity 0.15s' }}
            >
              {loadingSubmit ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: '#A1A1AA' }}>
            Mot de passe démo : <strong>password</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    try {
      const user = await login(email, password);
      if (user?.role?.slug === 'directeur' || user?.role?.slug === 'admin') {
        navigate('/dashboard/director');
      } else {
        navigate(from);
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur de connexion. Veuillez vérifier votre réseau.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      <div className="flex-1 min-h-[420px] flex flex-col justify-between px-8 py-10 md:px-14 md:py-16 text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/15 shadow-lg shadow-black/10 mb-4">
            <span className="text-2xl font-black">A</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Atlas Works</h1>
            <p className="text-lg text-slate-200 max-w-lg">
              Portail ERP & CRM dédié aux équipes BTP. Gestion fluide des devis, chantiers, factures et équipes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white/10 border border-white/15 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200/80 font-semibold mb-3">ERP & CRM BTP</p>
            <p className="text-sm leading-6 text-blue-100/80">
              Un espace clair, fonctionnel et performant pour piloter votre activité BTP sans effort.
            </p>
          </div>
          <p className="text-xs text-slate-200/80 max-w-sm">
            Pour toute question, contactez l'équipe Atlas Works et commencez votre journée en toute sérénité.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 md:px-14 md:py-16">
        <div className="w-full max-w-lg bg-white rounded-[28px] shadow-[0_40px_80px_rgba(0,0,0,0.08)] p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Bienvenue</h2>
            <p className="text-sm text-slate-500">Connectez-vous pour accéder à votre tableau de bord Atlas Works.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition"
                placeholder="directeur@exemple.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                Se souvenir de moi
              </label>
              <a href="#" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full rounded-3xl py-3 px-4 text-sm font-bold text-white transition-shadow shadow-[0_16px_30px_rgba(26,71,49,0.25)]"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loadingSubmit ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">Gestion des projets, des finances et du suivi commercial au même endroit.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

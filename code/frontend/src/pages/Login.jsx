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

  // Déterminer la redirection de retour ou par défaut
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    try {
      const user = await login(email, password);
      // Redirection dynamique basée sur le rôle de l'utilisateur
      if (user?.role?.slug === 'directeur' || user?.role?.slug === 'admin') {
        navigate('/dashboard/director');
      } else {
        // Autres tableaux de bord ou redirection par défaut
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic/Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-950/30 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Identity / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-4">
            <span className="text-white text-2xl font-extrabold tracking-wider">A</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Atlas <span className="text-blue-500">Works</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Portail ERP & CRM BTP • Maroc
          </p>
        </div>

        {/* Card Form container */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Connexion</h2>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-sm flex items-start space-x-2 animate-shake">
              <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="directeur@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 mr-2 cursor-pointer h-4 w-4" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-blue-500 hover:underline font-medium">Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-900/30 hover:bg-blue-500 hover:shadow-blue-500/20 active:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {loadingSubmit ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <circle className="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30 150" fill="transparent" />
                  </svg>
                  <span>Authentification en cours...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </form>
        </div>

        {/* Support or Info Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Besoin d'assistance ? Contactez le support technique Atlas Works.
        </p>
      </div>
    </div>
  );
};

export default Login;

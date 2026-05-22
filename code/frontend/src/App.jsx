import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/NotificationToast';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardRedirect from './components/common/DashboardRedirect';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import DirectorDashboard from './pages/DirectorDashboard';
import CommercialDashboard from './pages/CommercialDashboard';
import ProjectManagerDashboard from './pages/ProjectManagerDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import AccountList from './pages/AccountList';
import AccountDetail from './pages/AccountDetail';
import QuoteList from './pages/QuoteList';
import QuoteDetail from './pages/QuoteDetail';
import QuoteForm from './pages/QuoteForm';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import ProjectForm from './pages/ProjectForm';
import WorkLogForm from './pages/WorkLogForm';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import PaymentForm from './pages/PaymentForm';

// Création du client React Query pour la gestion d'état serveur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <Routes>
            {/* Route Publique : Connexion */}
            <Route path="/login" element={<Login />} />

            {/* Routes Protégées sous le Layout principal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Route index /dashboard -> redirige dynamiquement selon le rôle */}
              <Route index element={<DashboardRedirect />} />

              {/* Tableaux de bord par rôles */}
              <Route
                path="director"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin']}>
                    <DirectorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="commercial"
                element={
                  <ProtectedRoute allowedRoles={['commercial']}>
                    <CommercialDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="project-manager"
                element={
                  <ProtectedRoute allowedRoles={['chef_chantier']}>
                    <ProjectManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="finance"
                element={
                  <ProtectedRoute allowedRoles={['finance']}>
                    <FinanceDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Module CRM : Liste & Détail Comptes */}
              <Route
                path="accounts"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <AccountList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="accounts/:id"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <AccountDetail />
                  </ProtectedRoute>
                }
              />

              {/* Module Devis (Quotes) */}
              <Route
                path="quotes"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <QuoteList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quotes/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <QuoteForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quotes/:id"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <QuoteDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="quotes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <QuoteForm />
                  </ProtectedRoute>
                }
              />

              {/* Module Chantiers & Projets */}
              <Route
                path="projects"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier', 'technicien']}>
                    <ProjectList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin']}>
                    <ProjectForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:id"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier', 'technicien']}>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:id/work-logs/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier', 'technicien']}>
                    <WorkLogForm />
                  </ProtectedRoute>
                }
              />

              {/* Module RH — placeholder */}
              <Route
                path="rh"
                element={
                  <ProtectedRoute allowedRoles={['rh', 'admin', 'super_admin']}>
                    <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
                      <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">🏗️</div>
                      <h2 className="text-xl font-black text-slate-900">Module RH</h2>
                      <p className="text-slate-500 text-sm">Ce module est en cours de développement. Il couvrira la gestion du personnel, des contrats et des validations de pointage.</p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* Module Factures & Règlements */}
              <Route
                path="invoices"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'finance']}>
                    <InvoiceList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'finance']}>
                    <InvoiceForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/:id"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'finance']}>
                    <InvoiceDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoices/:id/payments/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'finance']}>
                    <PaymentForm />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirection Racine vers le hub de Dashboard */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* Écran d'accès refusé / non autorisé */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                  <div className="max-w-md p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                      ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Accès Non Autorisé</h2>
                    <p className="text-slate-500 text-sm mb-6">Votre rôle actuel ne vous donne pas accès à cette section.</p>
                    <a href="/login" className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md transition-all">
                      Retour à la connexion
                    </a>
                  </div>
                </div>
              }
            />

            {/* Page 404 de repli */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
                  <div className="text-center">
                    <h1 className="text-6xl font-black text-slate-350 tracking-wider mb-4">404</h1>
                    <p className="text-slate-500 font-semibold mb-6">La page que vous cherchez n'existe pas.</p>
                    <a href="/" className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-white transition-all text-sm font-bold text-slate-700">
                      Retour à l'accueil
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Router>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

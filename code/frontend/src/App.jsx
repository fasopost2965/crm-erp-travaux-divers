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
import WorkLogList from './pages/WorkLogList';
import ReceptionPV from './pages/ReceptionPV';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceForm from './pages/InvoiceForm';
import PaymentForm from './pages/PaymentForm';
import AccountForm from './pages/AccountForm';
import ContactList from './pages/ContactList';
import ContactForm from './pages/ContactForm';
import LeadList from './pages/LeadList';
import LeadForm from './pages/LeadForm';
import OpportunityList from './pages/OpportunityList';
import OpportunityForm from './pages/OpportunityForm';
import Tresorerie from './pages/Tresorerie';
import Situations from './pages/Situations';
import PointageJournalier from './pages/PointageJournalier';
import Parametres from './pages/Parametres';

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

              {/* Module CRM : Comptes */}
              <Route
                path="accounts"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <AccountList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="accounts/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <AccountForm />
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
              <Route
                path="accounts/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <AccountForm />
                  </ProtectedRoute>
                }
              />

              {/* Module CRM : Contacts */}
              <Route
                path="contacts"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <ContactList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="contacts/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <ContactForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="contacts/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <ContactForm />
                  </ProtectedRoute>
                }
              />

              {/* Module CRM : Leads */}
              <Route
                path="leads"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <LeadList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <LeadForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <LeadForm />
                  </ProtectedRoute>
                }
              />

              {/* Module CRM : Opportunités */}
              <Route
                path="opportunities"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <OpportunityList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="opportunities/new"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <OpportunityForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="opportunities/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'commercial']}>
                    <OpportunityForm />
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
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier']}>
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
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier']}>
                    <ProjectDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="projects/:id/work-logs"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier', 'technicien']}>
                    <WorkLogList />
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
              <Route
                path="projects/:id/pv-reception"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'chef_chantier']}>
                    <ReceptionPV />
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

              {/* Module Trésorerie */}
              <Route
                path="tresorerie"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'super_admin', 'finance']}>
                    <Tresorerie />
                  </ProtectedRoute>
                }
              />

              {/* Module Situations de travaux */}
              <Route
                path="situations"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'super_admin', 'finance']}>
                    <Situations />
                  </ProtectedRoute>
                }
              />

              {/* Module Pointage journalier */}
              <Route
                path="pointage"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'super_admin', 'chef_chantier']}>
                    <PointageJournalier />
                  </ProtectedRoute>
                }
              />

              {/* Module Paramètres */}
              <Route
                path="parametres"
                element={
                  <ProtectedRoute allowedRoles={['directeur', 'admin', 'super_admin']}>
                    <Parametres />
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
                    <a href="/login" className="py-2.5 px-6 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white text-sm font-bold transition-all">
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

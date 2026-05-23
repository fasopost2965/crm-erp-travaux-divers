import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CommercialDashboard = () => {
  // Récupérer les statistiques du Dashboard Commercial via React Query depuis l'API Laravel
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['commercialDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/commercial');
      return response.data.data || response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement des données commerciales..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 font-medium">
        ⚠️ Erreur lors de la récupération des données : {error.message}. Veuillez vérifier votre connexion.
      </div>
    );
  }

  // Formatage des montants monétaires en Dirhams marocains (DH)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  const stats = dashboardData || {};

  return (
    <div className="space-y-6">
      
      {/* En-tête de la page */}
      <PageHeader 
        title="Tableau de Bord Commercial" 
        breadcrumb={[{ label: "Commercial" }, { label: "Statistiques" }]} 
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Nouveaux Leads (7j)"
          value={stats.newLeadsCount || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        />
        <KPICard
          title="Relances du Jour"
          value={stats.todayFollowUpsCount || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Pipeline Opportunités"
          value={formatCurrency(stats.activeOpportunities?.pipelineAmount || 0)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.568-.373-1.81.588-1.81h4.906a1 1 0 00.95-.69l1.519-4.674z" />
            </svg>
          }
        />
        <KPICard
          title="Mon Taux de Conversion"
          value={`${Math.round(stats.personalConversionRate || 0)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid for content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column - Upcoming Meetings list */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Prochains Rendez-vous & Relances</span>
          </h2>

          {!stats.upcomingMeetings || stats.upcomingMeetings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium text-sm">
              Aucun rendez-vous planifié.
            </div>
          ) : (
            <div className="relative border-l border-slate-100 ml-4 space-y-8 py-2">
              {stats.upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="relative pl-8 group">
                  {/* Timeline bullet dot */}
                  <div className="absolute left-0 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white bg-blue-600 group-hover:scale-125 transition-transform"></div>
                  
                  <div className="bg-slate-50/50 backdrop-blur-sm border border-slate-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 hover:border-slate-200 transition-all duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {meeting.type}
                        </span>
                        <StatusBadge status={meeting.status} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {meeting.subject}
                      </h4>
                      {meeting.description && (
                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-lg">
                          {meeting.description}
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right shrink-0">
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(meeting.dueDate).toLocaleDateString('fr-FR', {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {new Date(meeting.dueDate).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Actions & Pipeline Stats */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Actions Rapides
            </h3>
            <div className="flex flex-col space-y-3">
              <button className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 transition-all cursor-pointer flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Nouveau Client / Compte</span>
              </button>
              <button className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Créer un Devis Provisoire</span>
              </button>
            </div>
          </div>

          {/* Opportunities Pipeline Card */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            {/* Visual glow bg */}
            <div className="absolute top-[-50%] right-[-30%] w-60 h-60 rounded-full bg-blue-600/20 blur-[60px] pointer-events-none"></div>

            <h3 className="text-sm font-bold text-white mb-4 relative z-10">
              Pipeline des Opportunités
            </h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Total Opportunités Actives</span>
                <span className="text-sm font-black">{stats.activeOpportunities?.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Valeur Totale du Portefeuille</span>
                <span className="text-sm font-black text-blue-450">
                  {formatCurrency(stats.activeOpportunities?.pipelineAmount || 0)}
                </span>
              </div>
              
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-450">
                <span>Acceptation moyenne estimée</span>
                <span className="font-bold text-white">~ 75%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CommercialDashboard;

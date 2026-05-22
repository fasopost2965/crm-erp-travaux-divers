import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProjectManagerDashboard = () => {
  // Récupérer les statistiques du Dashboard Chef de Chantier via React Query depuis l'API Laravel
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['projectManagerDashboard'],
    queryFn: async () => {
      const response = await api.get('/dashboard/project-manager');
      return response.data.data || response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement des données chantiers..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
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
        title="Suivi de Chantier & Opérations" 
        breadcrumb={[{ label: "Chef de Chantier" }, { label: "Tableau de bord" }]} 
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Chantiers Actifs"
          value={stats.activeProjects?.length || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <KPICard
          title="Tâches en Cours"
          value={stats.tasksStats?.inProgressCount || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <KPICard
          title="Retards & Alertes"
          value={stats.tasksStats?.lateCount || 0}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <KPICard
          title="Heures Validées"
          value={`${stats.hoursStats?.validatedHours || 0} h`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Main Grid for operational content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Supervised projects list & Deadlines (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Projects card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m8 1v-3m-18 2h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Mes Chantiers Actifs</span>
            </h2>

            {!stats.activeProjects || stats.activeProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-sm">
                Aucun chantier en cours de supervision active.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.activeProjects.map((project) => (
                  <div key={project.id} className="border border-slate-100 dark:border-slate-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300">
                    <div className="space-y-1 flex-1 min-w-0 pr-4">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {project.title}
                      </h4>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <StatusBadge status={project.status} />
                        <span className="text-xs text-slate-400 font-semibold">
                          Budget : {formatCurrency(project.budget)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-450">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Début</p>
                        <p className="mt-0.5">{new Date(project.startDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="border-l border-slate-100 dark:border-slate-800 pl-4">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Fin Prévue</p>
                        <p className="mt-0.5">{new Date(project.endDatePlanned).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming deadlines card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Prochaines Échéances / Tâches de Chantier</span>
            </h2>

            {!stats.upcomingDeadlines || stats.upcomingDeadlines.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-medium text-sm">
                Aucune échéance de tâche imminente.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between space-x-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {deadline.title}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        Chantier : {deadline.projectName || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                        {new Date(deadline.endDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - Blockage alerts & Photo Tracking Gallery (1/3 width) */}
        <div className="space-y-6">
          
          {/* Blockage Alert Card (only styled prominently if blocages > 0) */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            (stats.reportedBlocksCount || 0) > 0 
              ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800/80 text-rose-800' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white'
          }`}>
            <h3 className="text-sm font-bold flex items-center space-x-2">
              <svg className={`w-5 h-5 ${(stats.reportedBlocksCount || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className={(stats.reportedBlocksCount || 0) > 0 ? 'text-rose-800 dark:text-rose-400' : 'text-slate-800 dark:text-white'}>
                Blocages / Points Critiques
              </span>
            </h3>
            
            <div className="mt-4">
              <p className={`text-xs font-semibold ${
                (stats.reportedBlocksCount || 0) > 0 ? 'text-rose-700 dark:text-rose-450' : 'text-slate-450 dark:text-slate-500'
              }`}>
                {(stats.reportedBlocksCount || 0) > 0 
                  ? `ATTENTION : ${stats.reportedBlocksCount} tâche(s) de chantier sont actuellement signalée(s) comme bloquée(s) sur le terrain.`
                  : 'Parfait : Aucun blocage ou point bloquant n\'est actuellement signalé sur vos chantiers.'
                }
              </p>
            </div>
          </div>

          {/* Photo Gallery Track Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
              Galerie Suivi Terrain (Photos)
            </h3>

            {!stats.recentPhotos || stats.recentPhotos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium text-xs">
                Aucune photo récente téléversée.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stats.recentPhotos.map((photo) => (
                  <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                    <img 
                      src={`http://localhost:8000/storage/${photo.filePath}`}
                      alt={photo.title}
                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback fallback visual illustration
                        e.target.src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=300&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[10px] font-bold text-white truncate">{photo.title}</p>
                      <p className="text-[8px] text-slate-350 truncate uppercase tracking-wider">{photo.stage || 'Étape Chantier'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProjectManagerDashboard;

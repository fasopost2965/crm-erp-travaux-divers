import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const WorkLogForm = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [taskId, setTaskId] = useState('');
  const [hours, setHours] = useState('8');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  useEffect(() => {
    captureGps();
  }, []);

  const captureGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Géolocalisation non supportée par ce navigateur.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError('Position GPS indisponible : ' + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['projectDetailLog', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    }
  });

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['projectTasksForLog', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      return res.data.data || res.data || [];
    }
  });

  const logMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/api/projects/${projectId}/work-logs`, payload);
    },
    onSuccess: () => {
      showToast('Heures de travail enregistrées avec succès !');
      queryClient.invalidateQueries(['projectWorkLogs', projectId]);
      queryClient.invalidateQueries(['projectDetail', projectId]);
      navigate(`/dashboard/projects/${projectId}`);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la saisie d'heures : ${errMsg}`, 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hours || parseFloat(hours) <= 0) {
      showToast('Le nombre d\'heures doit être positif.', 'error');
      return;
    }
    if (!workDate) {
      showToast('Veuillez spécifier la date.', 'error');
      return;
    }
    const payload = {
      project_task_id: taskId ? parseInt(taskId) : null,
      work_date: workDate,
      hours_worked: parseFloat(hours),
      description: description.trim() || null,
      latitude: gpsCoords?.lat ?? null,
      longitude: gpsCoords?.lng ?? null,
    };
    logMutation.mutate(payload);
  };

  if (isProjectLoading || isTasksLoading) {
    return <LoadingSpinner fullPage message="Ouverture du terminal de pointage..." />;
  }

  if (projectError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        Impossible d'ouvrir la saisie d'heures : {projectError.message}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="⏱️ Pointer des heures"
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project.title, link: `/dashboard/projects/${projectId}` },
          { label: 'Saisie d\'Heures' }
        ]}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">

        {/* Info chantier */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Chantier</span>
          <span className="text-sm font-black text-slate-850 dark:text-white block">{project.title}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">📍 {project.address}, {project.city}</span>
        </div>

        {/* Bloc GPS */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold ${
          gpsCoords
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400'
            : gpsError
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 text-slate-500'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="text-base shrink-0">
              {gpsLoading ? '🔄' : gpsCoords ? '📡' : gpsError ? '⚠️' : '📍'}
            </span>
            <div>
              {gpsLoading && <span>Acquisition de la position GPS...</span>}
              {gpsCoords && (
                <span>
                  GPS capturé — {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                  <span className="ml-1 text-[10px] opacity-60">(±{Math.round(gpsCoords.accuracy)} m)</span>
                </span>
              )}
              {gpsError && <span>{gpsError}</span>}
              {!gpsLoading && !gpsCoords && !gpsError && <span>Position GPS non capturée</span>}
            </div>
          </div>
          {!gpsLoading && (
            <button
              type="button"
              onClick={captureGps}
              className="ml-2 shrink-0 text-[10px] font-bold underline underline-offset-2 cursor-pointer"
            >
              {gpsCoords ? 'Actualiser' : 'Réessayer'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Tâche associée (Recommandé)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
            >
              <option value="">Sélectionner une tâche en cours...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status} — Priorité : {t.priority})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Date d'intervention
              </label>
              <input
                type="date"
                required
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Heures travaillées
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="block w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[10px]">HRS</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Observations / Rapport technique
            </label>
            <textarea
              placeholder="Décrire succinctement les travaux réalisés, les fournitures consommées, ou les éventuels points de blocage..."
              rows="5"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={logMutation.isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold tracking-wide shadow-md shadow-blue-900/10 transition-colors cursor-pointer"
            >
              {logMutation.isLoading ? 'Envoi en cours...' : 'Enregistrer le pointage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkLogForm;

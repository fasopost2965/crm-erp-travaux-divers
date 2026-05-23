import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const QUICK_HOURS = [1, 2, 4, 8, 10];

const WorkLogForm = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Form state
  const [taskId, setTaskId] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputMode, setInputMode] = useState('direct'); // 'direct' | 'timestamps'
  const [hours, setHours] = useState('8');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('submitted');
  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'loading' | 'captured' | 'error'

  // Fetch Project details
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['projectDetailLog', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    }
  });

  // Fetch Tasks for dropdown
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['projectTasksForLog', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      return res.data.data || res.data || [];
    }
  });

  // Compute hours from timestamps
  const computeHoursFromTimestamps = () => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const totalMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (totalMinutes <= 0) return null;
    return (totalMinutes / 60).toFixed(2);
  };

  // GPS capture
  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      showToast('La géolocalisation n\'est pas supportée par ce navigateur.', 'error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationLat(position.coords.latitude.toFixed(7));
        setLocationLng(position.coords.longitude.toFixed(7));
        setGpsStatus('captured');
        showToast('Position GPS capturée avec succès.');
      },
      (err) => {
        setGpsStatus('error');
        showToast(`Impossible de capturer la position : ${err.message}`, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Mutation to log hours
  const logMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/api/projects/${projectId}/work-logs`, payload);
    },
    onSuccess: () => {
      showToast('Heures de travail enregistrées avec succès !');
      queryClient.invalidateQueries(['projectWorkLogs', projectId]);
      queryClient.invalidateQueries(['projectDetail', projectId]);
      navigate(`/dashboard/projects/${projectId}/work-logs`);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la saisie d'heures : ${errMsg}`, 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalHours;
    if (inputMode === 'timestamps') {
      finalHours = computeHoursFromTimestamps();
      if (!finalHours) {
        showToast('L\'heure de fin doit être postérieure à l\'heure de début.', 'error');
        return;
      }
    } else {
      finalHours = parseFloat(hours);
      if (!finalHours || finalHours <= 0) {
        showToast('Le nombre d\'heures doit être positif.', 'error');
        return;
      }
    }

    if (!workDate) {
      showToast('Veuillez spécifier la date.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Les observations sont requises.', 'error');
      return;
    }

    const payload = {
      project_task_id: taskId ? parseInt(taskId) : null,
      work_date: workDate,
      hours_worked: parseFloat(finalHours),
      description: description.trim(),
      status,
      ...(inputMode === 'timestamps' && {
        start_time: startTime,
        end_time: endTime,
      }),
      ...(locationLat !== null && {
        location_lat: parseFloat(locationLat),
        location_lng: parseFloat(locationLng),
      }),
    };

    logMutation.mutate(payload);
  };

  if (isProjectLoading || isTasksLoading) {
    return <LoadingSpinner fullPage message="Ouverture du terminal de pointage..." />;
  }

  if (projectError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        Impossible d'ouvrir la saisie d'heures pour ce chantier : {projectError.message}.
      </div>
    );
  }

  const computedHours = inputMode === 'timestamps' ? computeHoursFromTimestamps() : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="Pointer des heures"
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project.title, link: `/dashboard/projects/${projectId}` },
          { label: 'Tous les pointages', link: `/dashboard/projects/${projectId}/work-logs` },
          { label: 'Nouveau pointage' }
        ]}
      />

      {/* Project badge */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-1">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Chantier en cours</span>
        <span className="text-sm font-black text-slate-800 dark:text-white block">{project.title}</span>
        {project.address && (
          <span className="text-[10px] text-slate-400 font-semibold block">
            {project.address}{project.city ? `, ${project.city}` : ''}
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs font-semibold">

          {/* Tâche */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Tâche associée (optionnel)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
            >
              <option value="">Sélectionner une tâche (optionnel)...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} — {t.status} (Priorité: {t.priority})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Date d'intervention
            </label>
            <input
              type="date"
              required
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* Mode de saisie */}
          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Mode de saisie du temps
            </label>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setInputMode('direct')}
                className={`flex-1 py-2.5 px-4 text-xs font-bold transition-colors cursor-pointer ${
                  inputMode === 'direct'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Duree directe
              </button>
              <button
                type="button"
                onClick={() => setInputMode('timestamps')}
                className={`flex-1 py-2.5 px-4 text-xs font-bold transition-colors cursor-pointer ${
                  inputMode === 'timestamps'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Horodatage (Entree / Sortie)
              </button>
            </div>

            {/* Mode direct */}
            {inputMode === 'direct' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2">
                  {QUICK_HOURS.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(String(h))}
                      className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        parseFloat(hours) === h
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required={inputMode === 'direct'}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Saisir un nombre d'heures personnalisé..."
                    className="block w-full pl-4 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase tracking-wider">heures</span>
                </div>
              </div>
            )}

            {/* Mode horodatage */}
            {inputMode === 'timestamps' && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Heure d'arrivee
                    </label>
                    <input
                      type="time"
                      required={inputMode === 'timestamps'}
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                      Heure de depart
                    </label>
                    <input
                      type="time"
                      required={inputMode === 'timestamps'}
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
                {computedHours && (
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-center">
                    <span className="text-green-700 dark:text-green-400 font-bold text-sm">
                      Duree calculee : {computedHours} heures
                    </span>
                  </div>
                )}
                {!computedHours && startTime && endTime && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-center">
                    <span className="text-red-600 dark:text-red-400 font-bold text-xs">
                      L'heure de fin doit etre apres l'heure d'arrivee
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GPS */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Localisation GPS (optionnel)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCaptureGPS}
                disabled={gpsStatus === 'loading'}
                className={`py-2.5 px-5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  gpsStatus === 'captured'
                    ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                    : gpsStatus === 'error'
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {gpsStatus === 'loading' && (
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {gpsStatus === 'idle' && 'Capturer ma position'}
                {gpsStatus === 'loading' && 'Localisation...'}
                {gpsStatus === 'captured' && 'Position capturee'}
                {gpsStatus === 'error' && 'Erreur GPS — Reessayer'}
              </button>
              {gpsStatus === 'captured' && locationLat && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {parseFloat(locationLat).toFixed(4)}, {parseFloat(locationLng).toFixed(4)}
                </span>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Statut du pointage
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="cursor-pointer accent-slate-500"
                />
                <span className={`text-xs font-bold ${status === 'draft' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'}`}>
                  Brouillon
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="submitted"
                  checked={status === 'submitted'}
                  onChange={() => setStatus('submitted')}
                  className="cursor-pointer accent-blue-600"
                />
                <span className={`text-xs font-bold ${status === 'submitted' ? 'text-blue-600' : 'text-slate-400'}`}>
                  Soumis
                </span>
              </label>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Observations / Rapport technique <span className="text-red-400">*</span>
            </label>
            <textarea
              placeholder="Décrire les travaux réalisés, les fournitures utilisées, les points de blocage..."
              rows="5"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/projects/${projectId}/work-logs`)}
              className="w-1/3 py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={logMutation.isPending}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {logMutation.isPending ? 'Enregistrement...' : 'Enregistrer le pointage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkLogForm;

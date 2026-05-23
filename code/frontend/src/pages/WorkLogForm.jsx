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

  const [taskId, setTaskId] = useState('');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputMode, setInputMode] = useState('direct'); // 'direct' | 'timestamps'
  const [hours, setHours] = useState('8');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('submitted');
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | captured | error
  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);

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
    mutationFn: async (payload) => api.post(`/api/projects/${projectId}/work-logs`, payload),
    onSuccess: () => {
      showToast('Heures enregistrées avec succès !');
      queryClient.invalidateQueries(['projectWorkLogs', projectId]);
      queryClient.invalidateQueries(['projectDetail', projectId]);
      navigate(`/dashboard/projects/${projectId}/work-logs`);
    },
    onError: (err) => {
      showToast(`Erreur : ${err.response?.data?.message || err.message}`, 'error');
    }
  });

  const computeHoursFromTimestamps = () => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? (diff / 60).toFixed(2) : null;
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      showToast('GPS non disponible sur cet appareil.', 'warning');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLat(pos.coords.latitude);
        setLocationLng(pos.coords.longitude);
        setGpsStatus('captured');
      },
      () => {
        setGpsStatus('error');
        showToast('Impossible de récupérer votre position.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalHours = parseFloat(hours);

    if (inputMode === 'timestamps') {
      const computed = computeHoursFromTimestamps();
      if (!computed) {
        showToast('Heure de fin doit être après l\'heure de début.', 'error');
        return;
      }
      finalHours = parseFloat(computed);
    }

    if (!finalHours || finalHours <= 0) {
      showToast('Le nombre d\'heures doit être positif.', 'error');
      return;
    }

    const payload = {
      project_task_id: taskId ? parseInt(taskId) : null,
      work_date: workDate,
      hours_worked: finalHours,
      status,
      description: description.trim() || null,
    };

    if (inputMode === 'timestamps' && startTime && endTime) {
      payload.start_time = startTime;
      payload.end_time = endTime;
    }

    if (locationLat && locationLng) {
      payload.location_lat = locationLat;
      payload.location_lng = locationLng;
    }

    logMutation.mutate(payload);
  };

  if (isProjectLoading || isTasksLoading) return <LoadingSpinner fullPage message="Ouverture du terminal de pointage..." />;

  if (projectError) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        ⚠️ Impossible d'ouvrir la saisie d'heures : {projectError.message}
      </div>
    );
  }

  const computedHours = inputMode === 'timestamps' ? computeHoursFromTimestamps() : null;

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <PageHeader
        title="Pointer des heures"
        breadcrumb={[
          { label: 'Chantiers', path: '/dashboard/projects' },
          { label: project?.title, path: `/dashboard/projects/${projectId}` },
          { label: 'Saisie d\'heures' }
        ]}
      />

      {/* Project banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mb-1">Chantier</p>
        <p className="text-sm font-bold text-slate-900">{project?.title}</p>
        {project?.city && <p className="text-xs text-slate-500 mt-0.5">📍 {project.address ? `${project.address}, ` : ''}{project.city}</p>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">

        {/* Task selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tâche associée</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une tâche (optionnel)</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} — {t.status}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date d'intervention</label>
          <input
            type="date"
            required
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Input mode toggle */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mode de saisie</label>
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setInputMode('direct')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                inputMode === 'direct' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Durée directe
            </button>
            <button
              type="button"
              onClick={() => setInputMode('timestamps')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-l border-slate-200 ${
                inputMode === 'timestamps' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Entrée / Sortie
            </button>
          </div>

          {inputMode === 'direct' ? (
            <div className="space-y-2">
              {/* Quick hour buttons */}
              <div className="flex gap-2 flex-wrap">
                {QUICK_HOURS.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHours(String(h))}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      hours === String(h)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
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
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="block w-full pl-4 pr-16 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">heures</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Arrivée</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Départ</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {computedHours && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-emerald-600 text-sm">✓</span>
                  <span className="text-sm font-bold text-emerald-700">{computedHours}h calculées automatiquement</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* GPS Capture */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Position GPS</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsStatus === 'loading'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                gpsStatus === 'captured'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : gpsStatus === 'error'
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {gpsStatus === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Localisation...
                </>
              ) : gpsStatus === 'captured' ? (
                <>📍 Position capturée</>
              ) : gpsStatus === 'error' ? (
                <>⚠️ Réessayer</>
              ) : (
                <>📍 Capturer ma position</>
              )}
            </button>
            {gpsStatus === 'captured' && locationLat && (
              <span className="text-xs text-slate-400 font-mono">
                {locationLat.toFixed(4)}, {locationLng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut du pointage</label>
          <div className="flex gap-3">
            {[
              { value: 'draft', label: 'Brouillon', color: 'text-slate-600 border-slate-200' },
              { value: 'submitted', label: 'Soumettre', color: 'text-blue-600 border-blue-200' },
            ].map(({ value, label, color }) => (
              <label key={value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors text-sm font-semibold ${
                status === value ? 'bg-blue-600 text-white border-blue-600' : `bg-white ${color} hover:bg-slate-50`
              }`}>
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={status === value}
                  onChange={() => setStatus(value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rapport / Observations</label>
          <textarea
            placeholder="Décrire les travaux réalisés, matériaux utilisés, éventuels blocages..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/projects/${projectId}`)}
            className="w-1/3 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={logMutation.isLoading}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60"
          >
            {logMutation.isLoading ? 'Enregistrement...' : 'Enregistrer le pointage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkLogForm;

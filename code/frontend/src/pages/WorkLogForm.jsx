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
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState('8');
  const [status, setStatus] = useState('submitted');
  const [description, setDescription] = useState('');
  const [locationLat, setLocationLat] = useState(null);
  const [locationLng, setLocationLng] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | loading | ok | denied

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLat(pos.coords.latitude);
        setLocationLng(pos.coords.longitude);
        setGpsStatus('ok');
      },
      () => setGpsStatus('denied'),
      { timeout: 8000 }
    );
  }, []);

  // Auto-calculate hours when both times are set
  useEffect(() => {
    if (!startTime || !endTime) return;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff > 0) setHours((diff / 60).toFixed(1));
  }, [startTime, endTime]);

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
      showToast('Pointage enregistré avec succès !');
      queryClient.invalidateQueries(['projectWorkLogs', projectId]);
      queryClient.invalidateQueries(['projectDetail', projectId]);
      navigate(`/dashboard/projects/${projectId}`);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors du pointage : ${errMsg}`, 'error');
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

    logMutation.mutate({
      project_task_id: taskId ? parseInt(taskId) : null,
      work_date: workDate,
      start_time: startTime || null,
      end_time: endTime || null,
      hours_worked: parseFloat(hours),
      location_lat: locationLat,
      location_lng: locationLng,
      status,
      description: description.trim() || null,
    });
  };

  if (isProjectLoading || isTasksLoading) {
    return <LoadingSpinner fullPage message="Ouverture du terminal de pointage..." />;
  }

  if (projectError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
        âš ï¸ Impossible d'ouvrir la saisie d'heures pour ce chantier : {projectError.message}.
      </div>
    );
  }

  const gpsLabel = {
    idle: null,
    loading: <span className="text-[10px] text-[#C85A2A] font-semibold animate-pulse">Localisation en cours...</span>,
    ok: <span className="text-[10px] text-emerald-600 font-semibold">âœ“ GPS capté ({locationLat?.toFixed(4)}, {locationLng?.toFixed(4)})</span>,
    denied: <span className="text-[10px] text-amber-500 font-semibold">Localisation refusée "” pointage sans GPS</span>,
  }[gpsStatus];

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="â±ï¸ Pointer des heures"
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project.title, link: `/dashboard/projects/${projectId}` },
          { label: 'Saisie d\'Heures' }
        ]}
      />

      <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Project info strip */}
        <div className="p-4 rounded-2xl bg-[#FDF0EA] border border-blue-100 space-y-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Chantier</span>
          <span className="text-sm font-black text-slate-850 block">{project.title}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">ðŸ“ {project.address}, {project.city}</span>
        </div>

        {/* GPS status */}
        {gpsLabel && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">{gpsLabel}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">

          {/* Task */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Tâche associée (Recommandé)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="block w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer font-bold"
            >
              <option value="">Sélectionner une tâche en cours...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status} "” Priorité : {t.priority})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Date d'intervention
            </label>
            <input
              type="date"
              required
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
            />
          </div>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Heure début</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Heure fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
              />
            </div>
          </div>

          {/* Hours worked */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Heures travaillées
              {startTime && endTime && (
                <span className="ml-2 text-[#C85A2A] normal-case font-normal">(calculé depuis les horaires)</span>
              )}
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
                className="block w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[10px]">HRS</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut du pointage</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'draft', label: 'Brouillon' },
                { value: 'submitted', label: 'Soumis' },
                { value: 'validated', label: 'Validé' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-colors cursor-pointer ${
                    status === value
                      ? 'bg-[#C85A2A] text-white border-[#C85A2A]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Observations / Rapport technique
            </label>
            <textarea
              placeholder="Décrire succinctement les travaux réalisés, les fournitures consommées, ou les éventuels points de blocage..."
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={logMutation.isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold tracking-wide shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-60"
            >
              {logMutation.isLoading
                ? 'Envoi en cours...'
                : status === 'draft'
                  ? 'Sauvegarder (brouillon)'
                  : 'Enregistrer le pointage'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkLogForm;

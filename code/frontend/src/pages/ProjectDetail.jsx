import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FileUploader from '../components/common/FileUploader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  // Sub-resource modals/creation states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Moyenne');
  const [taskStatus, setTaskStatus] = useState('À faire');

  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  const [logHours, setLogHours] = useState('4');
  const [logDesc, setLogDesc] = useState('');
  const [logTaskId, setLogTaskId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const [photoTitle, setPhotoTitle] = useState('');
  const [photoStage, setPhotoStage] = useState('Fondations');
  const [uploadedPhotoFile, setUploadedPhotoFile] = useState(null);

  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('Plan technique');
  const [uploadedDocFile, setUploadedDocFile] = useState(null);

  // Fetch Project
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projectDetail', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}`);
      return res.data.data || res.data;
    },
  });

  // Fetch Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasks', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}/tasks`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch WorkLogs
  const { data: workLogs = [] } = useQuery({
    queryKey: ['projectWorkLogs', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}/work-logs`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch Photos
  const { data: photos = [] } = useQuery({
    queryKey: ['projectPhotos', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}/photos`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch Documents
  const { data: documents = [] } = useQuery({
    queryKey: ['projectDocuments', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}/documents`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch Signatures
  const { data: signatures = [] } = useQuery({
    queryKey: ['projectSignatures', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}/signatures`);
      return res.data.data || res.data || [];
    },
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post(`/api/projects/${id}/tasks`, payload);
    },
    onSuccess: () => {
      showToast('Nouvelle tâche créée avec succès !');
      queryClient.invalidateQueries(['projectTasks', id]);
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
    },
    onError: (err) => showToast(`Erreur: ${err.message}`, 'error'),
  });

  // Update Task Status Mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      await api.put(`/api/projects/${id}/tasks/${taskId}`, { status, priority: 'Moyenne' });
    },
    onSuccess: () => {
      showToast('Statut de la tâche mis à jour.');
      queryClient.invalidateQueries(['projectTasks', id]);
    },
    onError: (err) => showToast(`Erreur: ${err.message}`, 'error'),
  });

  // Create WorkLog Mutation
  const createWorkLogMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post(`/api/projects/${id}/work-logs`, payload);
    },
    onSuccess: () => {
      showToast('Heures de travail enregistrées.');
      queryClient.invalidateQueries(['projectWorkLogs', id]);
      setIsWorkLogModalOpen(false);
      setLogDesc('');
    },
    onError: (err) => showToast(`Erreur: ${err.message}`, 'error'),
  });

  // Upload Photo Mutation — multipart/form-data réel
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file, title, stage }) => {
      const form = new FormData();
      form.append('photo', file);
      form.append('title', title);
      form.append('stage', stage);
      await api.post(`/api/projects/${id}/photos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      showToast('Photo de chantier ajoutée avec succès.');
      queryClient.invalidateQueries(['projectPhotos', id]);
      setPhotoTitle('');
      setUploadedPhotoFile(null);
    },
    onError: (err) => showToast(`Erreur: ${err.response?.data?.message || err.message}`, 'error'),
  });

  // Upload Document Mutation
  const uploadDocMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post(`/api/projects/${id}/documents`, payload);
    },
    onSuccess: () => {
      showToast('Pièce jointe enregistrée.');
      queryClient.invalidateQueries(['projectDocuments', id]);
      setDocTitle('');
      setUploadedDocFile(null);
    },
    onError: (err) => showToast(`Erreur: ${err.message}`, 'error'),
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du tableau de bord chantier..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        ⚠️ Impossible d'ouvrir la fiche chantier : {error.message}.
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDesc,
      status: taskStatus,
      priority: taskPriority,
    });
  };

  const handleWorkLogSubmit = (e) => {
    e.preventDefault();
    createWorkLogMutation.mutate({
      project_task_id: logTaskId ? parseInt(logTaskId) : null,
      hours_worked: parseFloat(logHours),
      description: logDesc,
      work_date: logDate,
    });
  };

  const handlePhotoUploadSubmit = (e) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      showToast('Le titre de la photo est requis.', 'error');
      return;
    }
    if (!uploadedPhotoFile) {
      showToast('Veuillez sélectionner une photo à téléverser.', 'error');
      return;
    }
    uploadPhotoMutation.mutate({ file: uploadedPhotoFile, title: photoTitle, stage: photoStage });
  };

  const handleDocUploadSubmit = (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      showToast('Le titre du document est requis.', 'error');
      return;
    }
    uploadDocMutation.mutate({
      title: docTitle,
      type: docType,
      file_path: uploadedDocFile ? `documents/${uploadedDocFile.name}` : `docs/plan_${Date.now()}.pdf`,
    });
  };

  // Progression calculation based on Tasks
  const completedTasks = tasks.filter(t => t.status === 'Terminé').length;
  const totalTasksCount = tasks.length;
  const progression = totalTasksCount > 0 ? Math.round((completedTasks / totalTasksCount) * 100) : 0;

  // Work hours sum
  const totalHoursLogged = workLogs.reduce((sum, log) => sum + parseFloat(log.hoursWorked || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Chantier : ${project.title}`}
        breadcrumb={[
          { label: 'Chantiers' },
          { label: 'Registre', link: '/dashboard/projects' },
          { label: project.title }
        ]}
        actions={
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}
              className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold text-xs tracking-wide transition-colors cursor-pointer"
            >
              ✏️ Éditer
            </button>
            <button
              onClick={() => setIsWorkLogModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wide transition-all cursor-pointer"
            >
              ⏱️ Pointer des heures
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
            >
              ➕ Ajouter une tâche
            </button>
          </div>
        }
      />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Progression Technique</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{progression}%</span>
            <span className="text-xs text-slate-400 font-bold">{completedTasks}/{totalTasksCount} tâches</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${progression}%` }}></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Conducteur de Travaux</span>
          <div className="flex items-center space-x-2.5 pt-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center font-bold text-xs text-blue-600 uppercase">
              {project.manager?.name ? project.manager.name.charAt(0) : 'C'}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-xs">{project.manager?.name || 'Non désigné'}</p>
              <p className="text-[9px] text-slate-400 font-semibold">{project.manager?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Heures Consommées</span>
          <p className="text-3xl font-black text-slate-800 dark:text-white pt-1">{totalHoursLogged} Hrs</p>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Pointées par l'équipe</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Alloué</span>
          <p className="text-3xl font-black text-slate-850 dark:text-white pt-1">{formatCurrency(project.budget)}</p>
          <span className="text-[9px] text-blue-550 font-bold">Devis : {project.quote?.quoteNumber || '-'}</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-100 dark:border-slate-800 flex space-x-6 text-xs font-bold text-slate-400 uppercase tracking-wide">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'overview' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          🔍 Fiche
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'tasks' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          📋 Tâches (Kanban)
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'hours' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          ⏱️ Heures
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'photos' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          📸 Photos & Docs
        </button>
        <button
          onClick={() => setActiveTab('signatures')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'signatures' ? 'text-blue-600 border-blue-600' : 'border-transparent hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          ✍️ Signatures PV
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-xs font-semibold text-slate-655 dark:text-slate-350">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Description & Spécifications du Chantier</h3>
              <p className="leading-relaxed whitespace-pre-line text-slate-500 font-semibold">{project.description || "Aucun descriptif rédigé pour ce chantier."}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adresse de livraison</span>
                  <p className="text-slate-800 dark:text-white">{project.address || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ville</span>
                  <p className="text-slate-800 dark:text-white">📍 {project.city || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 text-xs">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">Fiche d'identité</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Client</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{project.account?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Statut du Chantier</span>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Date de démarrage</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Échéance Planifiée</span>
                  <span className="font-bold text-rose-500">
                    {project.endDatePlanned ? new Date(project.endDatePlanned).toLocaleDateString('fr-FR') : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KANBAN BOARD */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columns definitions */}
            {['À faire', 'En cours', 'Terminé'].map((colStatus) => {
              const colTasks = tasks.filter(t => t.status === colStatus);
              return (
                <div key={colStatus} className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-3xl p-4 flex flex-col space-y-4 min-h-[400px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-850">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{colStatus}</span>
                    <span className="text-[10px] font-black py-0.5 px-2 bg-slate-200 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded-full">{colTasks.length}</span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold text-center py-8">Aucune tâche</p>
                    ) : (
                      colTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3 hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{task.title}</h4>
                            <span className={`text-[8px] font-black uppercase py-0.5 px-1.5 rounded ${
                              task.priority === 'Haute' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                            }`}>{task.priority}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{task.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-850">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              👤 {task.assignee?.name || 'Non assigné'}
                            </span>
                            
                            {/* Simple state shifter */}
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatusMutation.mutate({ taskId: task.id, status: e.target.value })}
                              className="text-[9px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded px-1.5 py-0.5 font-bold cursor-pointer"
                            >
                              <option value="À faire">À faire</option>
                              <option value="En cours">En cours</option>
                              <option value="Terminé">Terminé</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: WORK HOURS POINTING */}
        {activeTab === 'hours' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Work log register */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">Journal des heures déclarées</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase text-[9px] tracking-wider text-left">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Collaborateur</th>
                      <th className="px-4 py-2">Tâche</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {workLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">Aucun pointage d'heures.</td>
                      </tr>
                    ) : (
                      workLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                          <td className="px-4 py-3 text-slate-400">{new Date(log.workDate).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{log.user?.name || 'Collaborateur'}</td>
                          <td className="px-4 py-3 text-blue-500 font-bold">{log.task?.title || '-'}</td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.description || '-'}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-800 dark:text-white">{log.hoursWorked} h</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Saisie Terrain Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850">
                ⚡ Saisie rapide heures (Mobile)
              </h3>
              <form onSubmit={handleWorkLogSubmit} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Tâche associée (optionnel)</label>
                  <select
                    value={logTaskId}
                    onChange={(e) => setLogTaskId(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Sélectionner une tâche...</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre d'heures</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Observations / Travail réalisé</label>
                  <textarea
                    required
                    placeholder="Description succincte..."
                    rows="3"
                    value={logDesc}
                    onChange={(e) => setLogDesc(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={createWorkLogMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  {createWorkLogMutation.isLoading ? 'Enregistrement...' : 'Enregistrer le pointage'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: PHOTOS & DOCUMENTS */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photos Zone */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-white text-xs uppercase tracking-wider">Galerie de photos chantier</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {photos.length === 0 ? (
                  <p className="col-span-2 text-center text-xs text-slate-400 py-8 font-semibold">Aucune photo téléversée.</p>
                ) : (
                  photos.map(p => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 aspect-video group bg-slate-100 dark:bg-slate-800">
                      {p.fileUrl ? (
                        <img
                          src={p.fileUrl}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl">📷</div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 p-3 flex flex-col justify-end text-white z-10">
                        <span className="text-[8px] uppercase tracking-wider font-black text-blue-400 bg-blue-900/40 py-0.5 px-1.5 rounded self-start mb-1">{p.stage}</span>
                        <h4 className="text-[10px] font-black truncate">{p.title}</h4>
                        <p className="text-[8px] text-slate-300 font-semibold mt-0.5">Le {new Date(p.createdAt).toLocaleDateString('fr-FR')} par {p.uploader?.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Photo Upload Form */}
              <form onSubmit={handlePhotoUploadSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4 text-xs font-semibold">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">📷 Ajouter une photo d'avancement</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pose charpente"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phase / Étape</label>
                    <select
                      value={photoStage}
                      onChange={(e) => setPhotoStage(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Fondations">Fondations</option>
                      <option value="Gros Œuvre">Gros Œuvre</option>
                      <option value="Charpente & Clos Couvert">Charpente & Clos Couvert</option>
                      <option value="Second Œuvre">Second Œuvre</option>
                      <option value="Finitions / Réception">Finitions / Réception</option>
                    </select>
                  </div>
                </div>

                <FileUploader
                  accept="image/*"
                  onFileSelect={(file) => setUploadedPhotoFile(file)}
                />

                <button
                  type="submit"
                  disabled={uploadPhotoMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  {uploadPhotoMutation.isLoading ? 'Envoi...' : 'Téléverser la Photo'}
                </button>
              </form>
            </div>

            {/* Documents Zone */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-white text-xs uppercase tracking-wider">Pièces jointes administratives & plans</h3>
              
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8 font-semibold">Aucune pièce jointe.</p>
                ) : (
                  documents.map(d => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">📁</span>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white leading-snug">{d.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{d.type} — {d.uploader?.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          showToast(`Téléchargement de ${d.title}...`);
                          setTimeout(() => showToast('Fichier téléchargé.'), 1000);
                        }}
                        className="text-[10px] py-1 px-2.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 font-bold transition-all cursor-pointer"
                      >
                        Télécharger
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Doc Upload Form */}
              <form onSubmit={handleDocUploadSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4 text-xs font-semibold">
                <h4 className="font-bold text-slate-800 dark:text-white text-xs">📂 Joindre un plan PDF ou un contrat</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Plan électrique Verrière"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="Plan technique">Plan technique</option>
                      <option value="Contrat de sous-traitance">Contrat de sous-traitance</option>
                      <option value="PV d'avancement technique">PV d'avancement technique</option>
                      <option value="Rapport de sécurité">Rapport de sécurité</option>
                    </select>
                  </div>
                </div>

                <FileUploader
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(file) => setUploadedDocFile(file)}
                />

                <button
                  type="submit"
                  disabled={uploadDocMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  {uploadDocMutation.isLoading ? 'Envoi...' : 'Ajouter le Document'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: SIGNATURES (PV RECEPTION) */}
        {activeTab === 'signatures' && (
          <div className="space-y-4 text-xs font-semibold">
            {/* Signatures existantes */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">PV de Réception & Signatures</h3>
                <button
                  onClick={() => navigate(`/dashboard/projects/${id}/reception-pv`)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  ✍️ Signer un PV
                </button>
              </div>
              <div className="space-y-3">
                {signatures.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <span className="text-3xl block">📋</span>
                    <p className="text-slate-400 font-semibold">Aucune signature enregistrée.</p>
                    <button
                      onClick={() => navigate(`/dashboard/projects/${id}/reception-pv`)}
                      className="py-2 px-5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      Créer le premier PV de réception
                    </button>
                  </div>
                ) : (
                  signatures.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white">{s.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                          Signé le {new Date(s.signedAt).toLocaleDateString('fr-MA', { dateStyle: 'long' })}
                          {s.signer?.name && ` — validé par ${s.signer.name}`}
                        </p>
                      </div>
                      {s.signatureData && (
                        <div className="w-20 h-12 rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden bg-white shrink-0 ml-4">
                          <img src={s.signatureData} alt="Signature" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase">📋 Créer une tâche</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 font-bold text-base hover:text-slate-655 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Peinture verrière sous-couche"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  placeholder="Détail technique..."
                  rows="3"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Priorité</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Statut initial</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="À faire">À faire</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isLoading}
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold transition-all cursor-pointer"
                >
                  {createTaskMutation.isLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saisie d'heures Modal */}
      {isWorkLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase">⏱️ Pointer des heures</h3>
              <button onClick={() => setIsWorkLogModalOpen(false)} className="text-slate-400 font-bold text-base hover:text-slate-655 cursor-pointer">×</button>
            </div>

            <form onSubmit={handleWorkLogSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tâche associée (optionnel)</label>
                <select
                  value={logTaskId}
                  onChange={(e) => setLogTaskId(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Sélectionner une tâche...</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Durée (en heures)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Observations / Rapport succinct</label>
                <textarea
                  required
                  placeholder="Travaux réalisés..."
                  rows="3"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWorkLogModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-400 font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createWorkLogMutation.isLoading}
                  className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold transition-all cursor-pointer"
                >
                  {createWorkLogMutation.isLoading ? 'Enregistrement...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

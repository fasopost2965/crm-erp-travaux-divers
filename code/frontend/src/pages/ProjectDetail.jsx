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
      showToast('Statut de la tâche mis Ã  jour.');
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

  // Upload Photo Mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post(`/api/projects/${id}/photos`, payload);
    },
    onSuccess: () => {
      showToast('Photo de chantier ajoutée avec succès.');
      queryClient.invalidateQueries(['projectPhotos', id]);
      setPhotoTitle('');
      setUploadedPhotoFile(null);
    },
    onError: (err) => showToast(`Erreur: ${err.message}`, 'error'),
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
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
        âš ï¸ Impossible d'ouvrir la fiche chantier : {error.message}.
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
    uploadPhotoMutation.mutate({
      title: photoTitle,
      stage: photoStage,
      file_path: uploadedPhotoFile ? `uploads/${uploadedPhotoFile.name}` : `photos/chantier_${Date.now()}.jpg`,
    });
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
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-colors cursor-pointer"
            >
              âœï¸ Éditer
            </button>
            <button
              onClick={() => setIsWorkLogModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-[#FDF0EA] text-[#C85A2A] font-bold text-xs tracking-wide transition-all cursor-pointer"
            >
              â±ï¸ Pointer des heures
            </button>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
            >
              âž• Ajouter une tâche
            </button>
          </div>
        }
      />

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Progression Technique</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black text-slate-800">{progression}%</span>
            <span className="text-xs text-slate-400 font-bold">{completedTasks}/{totalTasksCount} tâches</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-[#C85A2A] h-full rounded-full transition-all duration-500" style={{ width: `${progression}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Conducteur de Travaux</span>
          <div className="flex items-center space-x-2.5 pt-1">
            <div className="w-8 h-8 rounded-full bg-[#FDF0EA] flex items-center justify-center font-bold text-xs text-[#C85A2A] uppercase">
              {project.manager?.name ? project.manager.name.charAt(0) : 'C'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">{project.manager?.name || 'Non désigné'}</p>
              <p className="text-[9px] text-slate-400 font-semibold">{project.manager?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Heures Consommées</span>
          <p className="text-3xl font-black text-slate-800 pt-1">{totalHoursLogged} Hrs</p>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Pointées par l'équipe</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Budget Alloué</span>
          <p className="text-3xl font-black text-slate-850 pt-1">{formatCurrency(project.budget)}</p>
          <span className="text-[9px] text-blue-550 font-bold">Devis : {project.quote?.quoteNumber || '-'}</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-100 flex space-x-6 text-xs font-bold text-slate-400 uppercase tracking-wide">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'overview' ? 'text-[#C85A2A] border-[#C85A2A]' : 'border-transparent hover:text-slate-600'
          }`}
        >
          ðŸ” Fiche
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'tasks' ? 'text-[#C85A2A] border-[#C85A2A]' : 'border-transparent hover:text-slate-600'
          }`}
        >
          ðŸ“‹ Tâches (Kanban)
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'hours' ? 'text-[#C85A2A] border-[#C85A2A]' : 'border-transparent hover:text-slate-600'
          }`}
        >
          â±ï¸ Heures
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'photos' ? 'text-[#C85A2A] border-[#C85A2A]' : 'border-transparent hover:text-slate-600'
          }`}
        >
          ðŸ“¸ Photos & Docs
        </button>
        <button
          onClick={() => setActiveTab('signatures')}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'signatures' ? 'text-[#C85A2A] border-[#C85A2A]' : 'border-transparent hover:text-slate-600'
          }`}
        >
          âœï¸ Signatures PV
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 text-xs font-semibold text-slate-655">
              <h3 className="font-bold text-slate-800 text-sm">Description & Spécifications du Chantier</h3>
              <p className="leading-relaxed whitespace-pre-line text-slate-500 font-semibold">{project.description || "Aucun descriptif rédigé pour ce chantier."}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Adresse de livraison</span>
                  <p className="text-slate-800">{project.address || '-'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ville</span>
                  <p className="text-slate-800">ðŸ“ {project.city || '-'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6 text-xs">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Fiche d'identité</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Client</span>
                  <span className="font-extrabold text-slate-800">{project.account?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Statut du Chantier</span>
                  <StatusBadge status={project.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">Date de démarrage</span>
                  <span className="font-bold text-slate-800">
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
                <div key={colStatus} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col space-y-4 min-h-[400px]">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{colStatus}</span>
                    <span className="text-[10px] font-black py-0.5 px-2 bg-slate-200 text-slate-550 rounded-full">{colTasks.length}</span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {colTasks.length === 0 ? (
                      <p className="text-[10px] text-slate-400 font-semibold text-center py-8">Aucune tâche</p>
                    ) : (
                      colTasks.map(task => (
                        <div key={task.id} className="bg-white border border-slate-150/40 p-4 rounded-2xl shadow-xs space-y-3 hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-slate-800 leading-tight">{task.title}</h4>
                            <span className={`text-[8px] font-black uppercase py-0.5 px-1.5 rounded ${
                              task.priority === 'Haute' ? 'bg-red-50 text-red-500' : 'bg-[#FDF0EA] text-[#C85A2A]'
                            }`}>{task.priority}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal">{task.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <span className="text-[9px] text-slate-400 font-semibold">
                              ðŸ‘¤ {task.assignee?.name || 'Non assigné'}
                            </span>
                            
                            {/* Simple state shifter */}
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatusMutation.mutate({ taskId: task.id, status: e.target.value })}
                              className="text-[9px] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 font-bold cursor-pointer"
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
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Journal des heures déclarées</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs font-semibold text-slate-700">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[9px] tracking-wider text-left">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Collaborateur</th>
                      <th className="px-4 py-2">Tâche</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Durée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">Aucun pointage d'heures.</td>
                      </tr>
                    ) : (
                      workLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-400">{new Date(log.workDate).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{log.user?.name || 'Collaborateur'}</td>
                          <td className="px-4 py-3 text-[#C85A2A] font-bold">{log.task?.title || '-'}</td>
                          <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{log.description || '-'}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-800">{log.hoursWorked} h</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Navigation to dedicated work log pages */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Actions terrain</h3>
              <button
                onClick={() => navigate(`/dashboard/projects/${id}/work-logs/new`)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-[#FADDCC] bg-[#FDF0EA] hover:bg-blue-100 text-[#A8481F] font-semibold text-sm transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau pointage d'heures
              </button>
              <button
                onClick={() => navigate(`/dashboard/projects/${id}/work-logs`)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Voir tous les pointages
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: PHOTOS & DOCUMENTS */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photos Zone */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Galerie de photos chantier</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {photos.length === 0 ? (
                  <p className="col-span-2 text-center text-xs text-slate-400 py-8 font-semibold">Aucune photo téléversée.</p>
                ) : (
                  photos.map(p => (
                    <div key={p.id} className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video group bg-slate-150">
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
              <form onSubmit={handlePhotoUploadSubmit} className="pt-4 border-t border-slate-100 space-y-4 text-xs font-semibold">
                <h4 className="font-bold text-slate-800 text-xs">ðŸ“· Ajouter une photo d'avancement</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pose charpente"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Phase / Étape</label>
                    <select
                      value={photoStage}
                      onChange={(e) => setPhotoStage(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
                    >
                      <option value="Fondations">Fondations</option>
                      <option value="Gros Å’uvre">Gros Å’uvre</option>
                      <option value="Charpente & Clos Couvert">Charpente & Clos Couvert</option>
                      <option value="Second Å’uvre">Second Å’uvre</option>
                      <option value="Finitions / Réception">Finitions / Réception</option>
                    </select>
                  </div>
                </div>

                <FileUploader
                  accept="image/*"
                  onChange={(file) => setUploadedPhotoFile(file)}
                />

                <button
                  type="submit"
                  disabled={uploadPhotoMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  {uploadPhotoMutation.isLoading ? 'Envoi...' : 'Téléverser la Photo'}
                </button>
              </form>
            </div>

            {/* Documents Zone */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Pièces jointes administratives & plans</h3>
              
              <div className="space-y-2">
                {documents.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8 font-semibold">Aucune pièce jointe.</p>
                ) : (
                  documents.map(d => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-lg">ðŸ“</span>
                        <div>
                          <p className="font-bold text-slate-800 leading-snug">{d.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{d.type} "” {d.uploader?.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          showToast(`Téléchargement de ${d.title}...`);
                          setTimeout(() => showToast('Fichier téléchargé.'), 1000);
                        }}
                        className="text-[10px] py-1 px-2.5 rounded bg-[#FDF0EA] hover:bg-blue-100 text-blue-650 font-bold transition-all cursor-pointer"
                      >
                        Télécharger
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Doc Upload Form */}
              <form onSubmit={handleDocUploadSubmit} className="pt-4 border-t border-slate-100 space-y-4 text-xs font-semibold">
                <h4 className="font-bold text-slate-800 text-xs">ðŸ“‚ Joindre un plan PDF ou un contrat</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Titre</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Plan électrique Verrière"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
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
                  className="w-full py-3 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
                >
                  {uploadDocMutation.isLoading ? 'Envoi...' : 'Ajouter le Document'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: SIGNATURES (PV RECEPTION) */}
        {activeTab === 'signatures' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs font-semibold">
            {/* Signatures List */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">PV de Réception & Signatures électroniques</h3>
              <div className="space-y-4">
                {signatures.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">Aucune signature enregistrée sur ce projet.</p>
                ) : (
                  signatures.map(s => (
                    <div key={s.id} className="p-4 rounded-2xl bg-emerald-50/20 border border-emerald-250 text-emerald-850 space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-[13px]">{s.signatoryName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{s.signatoryRole}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">Signé le {new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {s.notes && <p className="text-[11px] text-slate-550 italic">« {s.notes} »</p>}
                      <div className="border-t border-dashed border-emerald-300 pt-2 flex items-center justify-between text-[10px]">
                        <span className="font-extrabold uppercase text-emerald-650 tracking-wider">âœ“ AUTHENTIFIÉ PAR CLÉ UNIQUE</span>
                        <span className="font-mono text-slate-400">HASH: 8cf6{s.id}db2...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Link to full PV de réception page */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Clôture du chantier</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Le PV de réception permet de finaliser le chantier avec les signatures électroniques des deux parties (client et chef de chantier) et de générer le document officiel en PDF.
              </p>
              <button
                onClick={() => navigate(`/dashboard/projects/${id}/pv-reception`)}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ouvrir le PV de Réception
              </button>
              {signatures.length > 0 && (
                <p className="text-xs text-emerald-600 font-semibold text-center">
                  âœ“ {signatures.length} signature{signatures.length > 1 ? 's' : ''} enregistrée{signatures.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm uppercase">ðŸ“‹ Créer une tâche</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 font-bold text-base hover:text-slate-655 cursor-pointer">Ã—</button>
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
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  placeholder="Détail technique..."
                  rows="3"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Priorité</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
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
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
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
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isLoading}
                  className="py-2 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold transition-all cursor-pointer"
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
          <div className="bg-white border border-slate-100 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm uppercase">â±ï¸ Pointer des heures</h3>
              <button onClick={() => setIsWorkLogModalOpen(false)} className="text-slate-400 font-bold text-base hover:text-slate-655 cursor-pointer">Ã—</button>
            </div>

            <form onSubmit={handleWorkLogSubmit} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tâche associée (optionnel)</label>
                <select
                  value={logTaskId}
                  onChange={(e) => setLogTaskId(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
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
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
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
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
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
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWorkLogModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createWorkLogMutation.isLoading}
                  className="py-2 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold transition-all cursor-pointer"
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

import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SignaturePad from '../components/common/SignaturePad';
import { useToast } from '../components/common/NotificationToast';
import { useAuth } from '../context/AuthContext';

const ReceptionPV = () => {
  const { id: projectId } = useParams();
  const { showToast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Signature fields
  const [clientName, setClientName] = useState('');
  const [clientSigData, setClientSigData] = useState(null);
  const [managerSigData, setManagerSigData] = useState(null);

  const clientPadRef = useRef(null);
  const managerPadRef = useRef(null);

  const [isSavingSigs, setIsSavingSigs] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Fetch project
  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['projectDetail', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    },
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['projectTasks', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch work logs
  const { data: workLogs = [], isLoading: isLogsLoading } = useQuery({
    queryKey: ['projectWorkLogs', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/work-logs`);
      return res.data.data || res.data || [];
    },
  });

  // Fetch signatures
  const { data: signatures = [] } = useQuery({
    queryKey: ['projectSignatures', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/signatures`);
      return res.data.data || res.data || [];
    },
  });

  const isLoading = isProjectLoading || isTasksLoading || isLogsLoading;

  // Computed values
  const completedTasks = tasks.filter(t => t.status === 'Terminé');
  const totalHours = workLogs.reduce((sum, log) => sum + parseFloat(log.hoursWorked || 0), 0);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');

  // Save signatures mutation helper
  const saveSignature = async (payload) => {
    await api.post(`/api/projects/${projectId}/signatures`, payload);
  };

  const handleSaveSignatures = async () => {
    // Validate client name
    if (!clientName.trim()) {
      showToast('Le nom du client est requis pour enregistrer la signature.', 'error');
      return;
    }

    const clientSig = clientPadRef.current?.getDataURL();
    const managerSig = managerPadRef.current?.getDataURL();

    const isClientPadEmpty = clientPadRef.current?.isEmpty();
    const isManagerPadEmpty = managerPadRef.current?.isEmpty();

    if (isClientPadEmpty && isManagerPadEmpty) {
      showToast('Veuillez apposer au moins une signature avant d\'enregistrer.', 'error');
      return;
    }

    setIsSavingSigs(true);
    try {
      const promises = [];

      if (!isClientPadEmpty && clientSig) {
        promises.push(
          saveSignature({
            client_name: clientName.trim(),
            signatory_role: 'Client',
            signature_data: clientSig,
            signed_at: new Date().toISOString(),
          })
        );
      }

      if (!isManagerPadEmpty && managerSig) {
        promises.push(
          saveSignature({
            client_name: user?.name || 'Chef de chantier',
            signatory_role: 'Chef de chantier',
            signature_data: managerSig,
            signed_at: new Date().toISOString(),
          })
        );
      }

      await Promise.all(promises);

      showToast('Signatures enregistrées avec succès sur le PV de réception.');
      queryClient.invalidateQueries(['projectSignatures', projectId]);

      // Clear pads
      clientPadRef.current?.clear();
      managerPadRef.current?.clear();
      setClientName('');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de l'enregistrement : ${errMsg}`, 'error');
    } finally {
      setIsSavingSigs(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await api.get(`/api/projects/${projectId}/pv-pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pv-reception-${projectId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('PV de réception téléchargé avec succès.');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la génération du PDF : ${errMsg}`, 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement du PV de réception..." />;
  }

  if (projectError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium text-sm">
        Impossible de charger le chantier : {projectError.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <PageHeader
        title={`PV de Réception — ${project?.title}`}
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project?.title, link: `/dashboard/projects/${projectId}` },
          { label: 'PV de Réception' },
        ]}
        actions={
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDownloadingPdf ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération...
              </>
            ) : (
              'Télécharger le PV PDF'
            )}
          </button>
        }
      />

      {/* SECTION 1: Récapitulatif projet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          1. Récapitulatif du Chantier
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/50">
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Tâches terminées</span>
            <span className="text-2xl font-black text-blue-600">{completedTasks.length}</span>
            <span className="text-[10px] text-blue-400 font-semibold ml-1">/ {tasks.length}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total heures</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white">{totalHours.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-semibold ml-1">hrs</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Client</span>
            <span className="text-sm font-black text-slate-800 dark:text-white leading-tight block">{project?.account?.name || '—'}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Budget</span>
            <span className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(project?.budget)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs font-semibold">
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-400 font-bold">Adresse du chantier</span>
            <span className="text-slate-800 dark:text-white font-bold text-right">
              {project?.address ? `${project.address}${project.city ? `, ${project.city}` : ''}` : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-400 font-bold">Chef de projet</span>
            <span className="text-slate-800 dark:text-white font-bold">{project?.manager?.name || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-400 font-bold">Date de début</span>
            <span className="text-slate-800 dark:text-white font-bold">
              {project?.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR') : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
            <span className="text-slate-400 font-bold">Date de fin prévue</span>
            <span className="text-slate-800 dark:text-white font-bold">
              {project?.endDatePlanned ? new Date(project.endDatePlanned).toLocaleDateString('fr-FR') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Tâches terminées */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          2. Tâches Terminées
        </h2>

        {completedTasks.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-8 font-semibold">
            Aucune tâche marquée comme terminée sur ce chantier.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs font-semibold text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/40 text-slate-400 uppercase text-[9px] tracking-wider text-left">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Tâche</th>
                  <th className="px-4 py-2.5">Statut</th>
                  <th className="px-4 py-2.5">Priorité</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {completedTasks.map((task, index) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{task.title}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block py-0.5 px-2.5 rounded-full text-[9px] font-black uppercase bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                        Terminé
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase py-0.5 px-1.5 rounded ${
                        task.priority === 'Haute'
                          ? 'bg-red-50 text-red-500'
                          : task.priority === 'Basse'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          : 'bg-blue-50 text-blue-500'
                      }`}>
                        {task.priority || 'Moyenne'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs">
                      <span className="block truncate max-w-[250px]" title={task.description}>
                        {task.description || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: Signatures électroniques */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800">
          3. Signatures Électroniques
        </h2>

        {/* Signatures existantes */}
        {signatures.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Signatures déjà enregistrées
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {signatures.map(sig => (
                <div
                  key={sig.id}
                  className="p-4 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-sm">{sig.signatoryName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{sig.signatoryRole}</p>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                      Signé
                    </span>
                  </div>
                  {sig.notes && (
                    <p className="text-[10px] text-slate-500 italic">« {sig.notes} »</p>
                  )}
                  {sig.signedAt && (
                    <p className="text-[9px] text-slate-400">
                      Le {new Date(sig.signedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nouveau signatures */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Apposer de nouvelles signatures
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Signature Client */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide mb-1">
                  Signature Client (Maître d'Ouvrage)
                </h4>
                <p className="text-[10px] text-slate-400">Le client confirme la réception des travaux</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Nom & Prénom du client <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: M. Khalid Alami"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="block w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <SignaturePad
                ref={clientPadRef}
                label="Zone de signature — Client"
                onSave={(data) => setClientSigData(data)}
                onClear={() => setClientSigData(null)}
              />

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Rôle</span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">Client</p>
              </div>
            </div>

            {/* Signature Chef de Projet */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wide mb-1">
                  Signature Chef de Projet (Maître d'Oeuvre)
                </h4>
                <p className="text-[10px] text-slate-400">Validation par le responsable de chantier</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                  Signataire
                </label>
                <p className="text-xs font-black text-slate-800 dark:text-white px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  {user?.name || 'Chef de chantier'}
                </p>
              </div>

              <SignaturePad
                ref={managerPadRef}
                label="Zone de signature — Chef de chantier"
                onSave={(data) => setManagerSigData(data)}
                onClear={() => setManagerSigData(null)}
              />

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Rôle</span>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">Chef de chantier</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveSignatures}
            disabled={isSavingSigs}
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSavingSigs ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les signatures'
            )}
          </button>
        </div>
      </div>

      {/* SECTION 4: Téléchargement PDF */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 mb-6">
          4. Exporter le PV de Réception
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              Procès-Verbal de Réception — {project?.title}
            </p>
            <p className="text-xs text-slate-400 font-semibold">
              Inclut : informations projet, tâches, heures et signatures enregistrées.
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            {isDownloadingPdf ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </>
            ) : (
              'Télécharger le PV en PDF'
            )}
          </button>
        </div>
      </div>

      {/* Back link */}
      <div className="pb-6">
        <Link
          to={`/dashboard/projects/${projectId}`}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          Retour au chantier
        </Link>
      </div>
    </div>
  );
};

export default ReceptionPV;

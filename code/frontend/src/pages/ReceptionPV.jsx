import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SignaturePad from '../components/common/SignaturePad';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../components/common/NotificationToast';

const ReceptionPV = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const clientPadRef = useRef(null);
  const managerPadRef = useRef(null);

  const [clientName, setClientName] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [managerNotes, setManagerNotes] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projectPV', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['projectTasksPV', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      return res.data.data || res.data || [];
    }
  });

  const { data: workLogs = [] } = useQuery({
    queryKey: ['projectWorkLogsPV', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/work-logs`);
      return res.data.data || res.data || [];
    }
  });

  const { data: signatures = [], refetch: refetchSignatures } = useQuery({
    queryKey: ['projectSignaturesPV', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/signatures`);
      return res.data.data || res.data || [];
    }
  });

  const signatureMutation = useMutation({
    mutationFn: async (payload) => api.post(`/api/projects/${projectId}/signatures`, payload),
  });

  const totalHours = workLogs.reduce((s, l) => s + (l.hoursWorked || 0), 0);
  const tasksCompleted = tasks.filter(t => t.status === 'Terminé').length;

  const handleSaveSignatures = async () => {
    if (!clientName.trim()) {
      showToast('Veuillez saisir le nom du représentant client.', 'error');
      return;
    }
    if (clientPadRef.current?.isEmpty() && managerPadRef.current?.isEmpty()) {
      showToast('Au moins une signature est requise.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const promises = [];

    if (!clientPadRef.current?.isEmpty()) {
      promises.push(
        signatureMutation.mutateAsync({
          client_name: clientName,
          signatory_role: 'client',
          notes: clientNotes.trim() || null,
          signature_data: clientPadRef.current.getDataURL(),
          signed_at: now,
        })
      );
    }

    if (!managerPadRef.current?.isEmpty()) {
      promises.push(
        signatureMutation.mutateAsync({
          client_name: project?.manager?.name || 'Chef de Chantier',
          signatory_role: 'chef_chantier',
          notes: managerNotes.trim() || null,
          signature_data: managerPadRef.current.getDataURL(),
          signed_at: now,
        })
      );
    }

    try {
      await Promise.all(promises);
      showToast('Signatures enregistrées avec succès !');
      queryClient.invalidateQueries(['projectSignaturesPV', projectId]);
      refetchSignatures();
      clientPadRef.current?.clear();
      managerPadRef.current?.clear();
    } catch (err) {
      showToast(`Erreur lors de la sauvegarde : ${err.message}`, 'error');
    }
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const res = await api.get(`/api/projects/${projectId}/pv-pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `PV-Reception-${projectId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Erreur lors de la génération du PDF.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage message="Chargement du PV de réception..." />;
  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        âš ï¸ {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="PV de Réception"
        breadcrumb={[
          { label: 'Chantiers', path: '/dashboard/projects' },
          { label: project?.title, path: `/dashboard/projects/${projectId}` },
          { label: 'PV de Réception' }
        ]}
        actions={
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60"
          >
            {pdfLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Télécharger PDF
              </>
            )}
          </button>
        }
      />

      {/* Project summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Informations du chantier</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div><span className="text-slate-400">Projet :</span> <span className="font-semibold text-slate-800">{project?.title}</span></div>
          <div><span className="text-slate-400">Client :</span> <span className="font-semibold text-slate-800">{project?.account?.name || '—'}</span></div>
          <div><span className="text-slate-400">Chef :</span> <span className="font-semibold text-slate-800">{project?.manager?.name || '—'}</span></div>
          <div><span className="text-slate-400">Statut :</span> <StatusBadge status={project?.status} /></div>
          <div><span className="text-slate-400">Ville :</span> <span className="font-semibold text-slate-800">{project?.city || '—'}</span></div>
          <div><span className="text-slate-400">Budget :</span> <span className="font-semibold text-slate-800">{project?.budget ? `${Number(project.budget).toLocaleString('fr-MA')} DH` : '—'}</span></div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-emerald-600">{tasksCompleted}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Tâches terminées</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-[#C85A2A]">{tasks.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Tâches totales</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
          <p className="text-3xl font-black text-slate-800">{totalHours.toFixed(1)}h</p>
          <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Heures pointées</p>
        </div>
      </div>

      {/* Completed tasks */}
      {tasks.filter(t => t.status === 'Terminé').length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Tâches réceptionnées</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tâche</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Priorité</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.filter(t => t.status === 'Terminé').map(t => (
                <tr key={t.id}>
                  <td className="px-5 py-3 font-medium text-slate-800">{t.title}</td>
                  <td className="px-5 py-3 text-slate-500">{t.priority || '—'}</td>
                  <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Existing signatures */}
      {signatures.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-emerald-800 mb-3">Signatures enregistrées ({signatures.length})</h3>
          <div className="grid grid-cols-2 gap-4">
            {signatures.map(sig => (
              <div key={sig.id} className="bg-white rounded-xl p-4 border border-emerald-200">
                <p className="text-sm font-bold text-slate-800">{sig.signatoryName}</p>
                <p className="text-xs text-slate-500">{sig.signatoryRole || 'Signataire'}</p>
                {sig.signatureData && sig.signatureData.startsWith('data:image/') && (
                  <img src={sig.signatureData} alt="Signature" className="mt-2 h-12 w-full object-contain border border-slate-100 rounded" />
                )}
                <p className="text-xs text-slate-400 mt-1">{sig.signedAt ? new Date(sig.signedAt).toLocaleDateString('fr-FR') : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature pads */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-900">Signatures des parties</h3>

        {/* Client signature */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Maître d'ouvrage (Client)</p>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Nom du représentant *</label>
            <input
              type="text"
              placeholder="Nom complet du signataire client"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
            />
          </div>
          <SignaturePad ref={clientPadRef} label="Signature client" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Observations / Réserves</label>
            <input
              type="text"
              placeholder="Sans réserve - ou mentionner les réserves éventuelles"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
            />
          </div>
        </div>

        {/* Manager signature */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chef de Chantier (BATIPLUS)</p>
          <div className="px-4 py-3 bg-[#FDF0EA] border border-[#FADDCC] rounded-xl">
            <p className="text-sm font-semibold text-blue-800">{project?.manager?.name || 'Chef de Chantier'}</p>
            <p className="text-xs text-[#C85A2A]">Conducteur de travaux "' BATIPLUS SARL</p>
          </div>
          <SignaturePad ref={managerPadRef} label="Signature chef de chantier" />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Observations</label>
            <input
              type="text"
              placeholder="Notes du conducteur de travaux"
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="block w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSignatures}
          disabled={signatureMutation.isLoading}
          className="w-full py-3 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60"
        >
          {signatureMutation.isLoading ? 'Enregistrement...' : 'Enregistrer les signatures'}
        </button>
      </div>

      <button
        onClick={() => navigate(`/dashboard/projects/${projectId}`)}
        className="text-sm text-slate-500 hover:text-[#C85A2A] font-medium transition-colors"
      >
        â† Retour Ã  la fiche projet
      </button>
    </div>
  );
};

export default ReceptionPV;

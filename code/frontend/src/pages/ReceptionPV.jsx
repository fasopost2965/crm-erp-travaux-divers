import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SignaturePad from '../components/common/SignaturePad';
import { useToast } from '../components/common/NotificationToast';

const ReceptionPV = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [clientName, setClientName] = useState('');
  const [signatureData, setSignatureData] = useState(null);
  const [signedAt, setSignedAt] = useState(new Date().toISOString().slice(0, 16));

  const { data: project, isLoading: isProjectLoading, error: projectError } = useQuery({
    queryKey: ['projectForPV', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}`);
      return res.data.data || res.data;
    }
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['projectSignatures', projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/signatures`);
      return res.data.data || res.data || [];
    }
  });

  const signMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/api/projects/${projectId}/signatures`, payload);
    },
    onSuccess: () => {
      showToast('PV de réception signé et enregistré.');
      queryClient.invalidateQueries(['projectSignatures', projectId]);
      navigate(`/dashboard/projects/${projectId}`);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Erreur lors de la signature.', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      showToast('Le nom du client ou signataire est requis.', 'error');
      return;
    }
    if (!signatureData) {
      showToast('Veuillez apposer votre signature avant de valider.', 'error');
      return;
    }
    signMutation.mutate({
      client_name: clientName.trim(),
      signature_data: signatureData,
      signed_at: new Date(signedAt).toISOString(),
    });
  };

  if (isProjectLoading) return <LoadingSpinner fullPage message="Chargement du PV..." />;
  if (projectError) return (
    <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-3xl text-red-700 text-sm font-medium">
      Impossible de charger le chantier : {projectError.message}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="PV de Réception"
        breadcrumb={[
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: project.title, link: `/dashboard/projects/${projectId}` },
          { label: 'Procès-Verbal de Réception' }
        ]}
      />

      {/* En-tête PV officiel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Procès-Verbal de Réception de Travaux</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Conformément aux dispositions contractuelles</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
            {project.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { label: 'Chantier', value: project.title },
            { label: 'Référence', value: project.reference || `PRJ-${projectId}` },
            { label: 'Adresse', value: `${project.address || ''}, ${project.city || ''}` },
            { label: 'Budget', value: project.budget ? `${parseFloat(project.budget).toLocaleString('fr-MA')} MAD` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signatures existantes */}
      {signatures.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
            Signatures enregistrées ({signatures.length})
          </h3>
          <div className="space-y-3">
            {signatures.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block">{sig.clientName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Signé le {new Date(sig.signedAt).toLocaleDateString('fr-MA', { dateStyle: 'long' })}
                  </span>
                </div>
                <div className="w-16 h-10 rounded-lg border border-emerald-200 dark:border-emerald-800 overflow-hidden bg-white">
                  {sig.signatureData && (
                    <img src={sig.signatureData} alt="Signature" className="w-full h-full object-contain" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire de signature */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-5">
          Nouvelle signature
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Nom du signataire / Client
              </label>
              <input
                type="text"
                required
                placeholder="Prénom et Nom complet"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Date et heure de réception
              </label>
              <input
                type="datetime-local"
                required
                value={signedAt}
                onChange={(e) => setSignedAt(e.target.value)}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Signature manuscrite
            </label>
            <SignaturePad onChange={setSignatureData} width={600} height={200} />
          </div>

          <div className="pt-2 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-relaxed">
            En apposant votre signature, vous certifiez avoir pris connaissance des travaux réalisés et les accepter conformément aux termes du contrat. Ce PV engage les deux parties.
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/projects/${projectId}`)}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={signMutation.isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-wide shadow-md shadow-emerald-900/10 transition-colors cursor-pointer"
            >
              {signMutation.isLoading ? 'Enregistrement...' : 'Valider et signer le PV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReceptionPV;

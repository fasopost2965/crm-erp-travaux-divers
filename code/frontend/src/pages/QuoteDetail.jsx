import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isAcceptOpen, setIsAcceptOpen] = useState(false);
  const [isRefuseOpen, setIsRefuseOpen] = useState(false);
  const [isSendOpen, setIsSendOpen] = useState(false);

  // Fetch Quote Detail
  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['quoteDetail', id],
    queryFn: async () => {
      const res = await api.get(`/api/quotes/${id}`);
      return res.data.data || res.data;
    },
  });

  // Mutate Status
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.put(`/api/quotes/${id}`, {
        status: newStatus,
        title: quote.title,
        valid_until: quote.validUntil,
        account_id: quote.accountId,
        opportunity_id: quote.opportunityId,
      });
      return res.data;
    },
    onSuccess: (data, newStatus) => {
      showToast(`Devis mis Ã  jour avec le statut: ${newStatus}`);
      queryClient.invalidateQueries(['quoteDetail', id]);
      setIsAcceptOpen(false);
      setIsRefuseOpen(false);
      setIsSendOpen(false);
    },
    onError: (err) => {
      showToast(`Erreur lors de la mise Ã  jour: ${err.message}`, 'error');
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement de la fiche devis..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
        âš ï¸ Erreur de chargement de la fiche devis : {error.message}.
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');
  };

  const handleExportPdf = async () => {
    try {
      showToast(`Génération du PDF pour le devis ${quote.quoteNumber}...`);
      const response = await api.get(`/api/quotes/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${quote.quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`PDF du devis ${quote.quoteNumber} téléchargé avec succès.`, 'success');
    } catch (err) {
      showToast(`Erreur lors de la génération du PDF: ${err.message}`, 'error');
    }
  };

  const handleConvertToProject = () => {
    // Navigate to create new project screen with quote data pre-filled
    navigate(`/dashboard/projects/new?quoteId=${quote.id}`);
  };

  const items = quote.items || [];
  const taxAmount = quote.totalHt * 0.20; // Default 20% TVA in Morocco

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Fiche Devis : ${quote.quoteNumber}`}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Devis', link: '/dashboard/quotes' },
          { label: quote.quoteNumber }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/dashboard/quotes/${quote.id}/edit`)}
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-all cursor-pointer"
            >
              âœï¸ Éditer
            </button>
            <button
              onClick={handleExportPdf}
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-all cursor-pointer"
            >
              ðŸ' PDF
            </button>
            {quote.status === 'Brouillon' && (
              <button
                onClick={() => setIsSendOpen(true)}
                className="py-2 px-4 rounded-xl bg-[#FDF0EA] text-[#C85A2A] font-bold text-xs tracking-wide transition-all cursor-pointer"
              >
                âœ‰ï¸ Envoyer
              </button>
            )}
            {quote.status === 'Envoyé' && (
              <>
                <button
                  onClick={() => setIsAcceptOpen(true)}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                >
                  âœ… Accepter
                </button>
                <button
                  onClick={() => setIsRefuseOpen(true)}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-550 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
                >
                  âŒ Refuser
                </button>
              </>
            )}
            {quote.status === 'Accepté' && (
              <button
                onClick={handleConvertToProject}
                className="py-2.5 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer"
              >
                ðŸ—ï¸ Convertir en Projet
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Document Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-6 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
            {/* Header branding */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-black tracking-tighter text-[#C85A2A]">ATLAS WORKS</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 py-0.5 px-2 rounded">Divers Pro</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Atlas Works S.A.R.L. "' Travaux Divers & Rénovation<br />
                  Casablanca, Maroc | IF: 52367489 | RC: 94827
                </p>
              </div>
              <div className="text-right sm:text-right space-y-1">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">DEVIS</h2>
                <p className="text-xs font-bold text-[#C85A2A]">{quote.quoteNumber}</p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Date d'émission : {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString('fr-FR') : '-'}
                </p>
                <p className="text-[10px] text-rose-500 font-bold">
                  Valide jusqu'au : {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>
            </div>

            {/* Client and Partner details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Émetteur</h3>
                <p className="font-bold text-slate-800">Atlas Works SARL</p>
                <p className="text-slate-500">
                  12 Rue des Hôpitaux, Maarif<br />
                  Casablanca, Maroc
                </p>
                <p className="text-slate-400">contact@atlasworks.ma | +212 522 34 56 78</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Destinataire</h3>
                <p className="font-bold text-slate-800">{quote.account?.name || 'Société Client'}</p>
                {quote.account?.address && (
                  <p className="text-slate-500">
                    {quote.account.address}<br />
                    {quote.account.city || 'Maroc'}
                  </p>
                )}
                <p className="text-slate-400">
                  {quote.account?.email || 'Pas d\'email'} {quote.account?.phone && `| ${quote.account.phone}`}
                </p>
              </div>
            </div>

            {/* Prestation lines table */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-800 tracking-tight">
                Détail des prestations - {quote.title}
              </h3>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3">Description / Section</th>
                      <th scope="col" className="px-4 py-3 text-center w-16">U</th>
                      <th scope="col" className="px-4 py-3 text-right w-20">Qté</th>
                      <th scope="col" className="px-4 py-3 text-right w-28">P.U. HT</th>
                      <th scope="col" className="px-4 py-3 text-right w-32">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-medium">
                          Aucune ligne de prestation saisie pour ce devis.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 max-w-xs">
                            {item.section && (
                              <span className="block text-[9px] font-black uppercase text-[#C85A2A] tracking-wider mb-0.5">
                                [{item.section}]
                              </span>
                            )}
                            <span className="text-slate-800">{item.description}</span>
                          </td>
                          <td className="px-4 py-3.5 text-center text-slate-400 uppercase text-[10px]">
                            {item.unit || 'U'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-extrabold">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {formatCurrency(item.unitPriceHt)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                            {formatCurrency(item.totalPriceHt || (item.quantity * item.unitPriceHt))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial summaries */}
            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>Total HT</span>
                  <span className="text-slate-800">{formatCurrency(quote.totalHt)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="h-px bg-slate-100 my-1"></div>
                <div className="flex justify-between items-center text-slate-850 font-black text-sm">
                  <span>Total TTC</span>
                  <span className="text-[#C85A2A]">{formatCurrency(quote.totalTtc)}</span>
                </div>
              </div>
            </div>

            {/* Notes & legal terms */}
            <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed space-y-2">
              <p className="font-bold text-slate-600">Conditions & Modalités de Paiement :</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Validité de l'offre : 30 jours Ã  compter de la date d'émission.</li>
                <li>Modalités de règlement : 30% d'acompte Ã  la signature de la commande, le solde selon avancement sur situations mensuelles de travaux.</li>
                <li>Toutes les réclamations concernant l'exécution des prestations doivent être signalées sous 48 heures.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Status & Timeline */}
        <div className="space-y-6">
          {/* Status info card */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">État du Devis</h3>
            <div className="flex items-center space-x-3">
              <StatusBadge status={quote.status} />
              <span className="text-xs text-slate-400 font-semibold">
                Modifié le {quote.updatedAt ? new Date(quote.updatedAt).toLocaleDateString('fr-FR') : '-'}
              </span>
            </div>
            {quote.marginEstimated > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>Marge estimée (HT)</span>
                  <span className="text-slate-800 font-extrabold">{formatCurrency(quote.marginEstimated)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold">
                  <span>Taux de rétention</span>
                  <span className="text-slate-800 font-extrabold">{quote.retentionRate || 0}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">Historique d'activité</h3>
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-100">
              {/* Brouillon state */}
              <div className="flex items-start space-x-3 relative">
                <div className="w-6 h-6 rounded-full bg-[#FDF0EA]0 border-4 border-white z-10 shrink-0 flex items-center justify-center text-[10px] text-white">âœ'</div>
                <div className="text-xs">
                  <p className="font-bold text-slate-850">Création du devis</p>
                  <p className="text-[10px] text-slate-400">Le devis a été initialisé au format Brouillon.</p>
                </div>
              </div>

              {/* Envoyé state */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-6 h-6 rounded-full border-4 border-white z-10 shrink-0 flex items-center justify-center text-[10px] ${
                  ['Envoyé', 'Accepté', 'Refusé'].includes(quote.status)
                    ? 'bg-[#FDF0EA]0 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {['Envoyé', 'Accepté', 'Refusé'].includes(quote.status) ? '✓' : '—'}
                </div>
                <div className="text-xs">
                  <p className={`font-bold ${['Envoyé', 'Accepté', 'Refusé'].includes(quote.status) ? 'text-slate-850' : 'text-slate-400'}`}>
                    Envoyé au client
                  </p>
                  <p className="text-[10px] text-slate-400">Le devis a été partagé avec le client pour négociation.</p>
                </div>
              </div>

              {/* Accepté / Refusé state */}
              <div className="flex items-start space-x-3 relative">
                <div className={`w-6 h-6 rounded-full border-4 border-white z-10 shrink-0 flex items-center justify-center text-[10px] ${
                  quote.status === 'Accepté'
                    ? 'bg-emerald-500 text-white'
                    : quote.status === 'Refusé'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {quote.status === 'Accepté' ? '✓' : quote.status === 'Refusé' ? 'âœ—' : '—'}
                </div>
                <div className="text-xs">
                  <p className={`font-bold ${['Accepté', 'Refusé'].includes(quote.status) ? 'text-slate-850' : 'text-slate-400'}`}>
                    {quote.status === 'Refusé' ? 'Devis Refusé' : 'Devis Accepté / Gagné'}
                  </p>
                  <p className="text-[10px] text-slate-400">La décision commerciale finale du client a été enregistrée.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isSendOpen}
        title="Marquer comme envoyé ?"
        message="Voulez-vous notifier le système que ce devis a été envoyé au client ? Son statut passera Ã  'Envoyé'."
        confirmText="Confirmer l'envoi"
        cancelText="Annuler"
        type="info"
        loading={statusMutation.isLoading}
        onConfirm={() => statusMutation.mutate('Envoyé')}
        onCancel={() => setIsSendOpen(false)}
      />

      <ConfirmDialog
        isOpen={isAcceptOpen}
        title="Accepter le devis ?"
        message="ÃŠtes-vous sûr de vouloir marquer ce devis comme accepté ? Cette action validera le budget et vous permettra de le convertir en chantier."
        confirmText="Devis Accepté"
        cancelText="Annuler"
        type="success"
        loading={statusMutation.isLoading}
        onConfirm={() => statusMutation.mutate('Accepté')}
        onCancel={() => setIsAcceptOpen(false)}
      />

      <ConfirmDialog
        isOpen={isRefuseOpen}
        title="Refuser le devis ?"
        message="ÃŠtes-vous sûr de vouloir classer ce devis comme refusé ?"
        confirmText="Devis Refusé"
        cancelText="Annuler"
        type="danger"
        loading={statusMutation.isLoading}
        onConfirm={() => statusMutation.mutate('Refusé')}
        onCancel={() => setIsRefuseOpen(false)}
      />
    </div>
  );
};

export default QuoteDetail;

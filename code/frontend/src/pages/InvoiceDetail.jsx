import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isSendOpen, setIsSendOpen] = useState(false);

  // Fetch Invoice Detail
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoiceDetail', id],
    queryFn: async () => {
      const res = await api.get(`/api/invoices/${id}`);
      return res.data.data || res.data;
    },
  });

  // Mutate Invoice Status (Brouillon -> Envoyée)
  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const res = await api.put(`/api/invoices/${id}`, {
        status: newStatus,
        title: invoice.title,
        type: invoice.type,
        due_date: invoice.dueDate,
        account_id: invoice.accountId,
        quote_id: invoice.quoteId,
      });
      return res.data;
    },
    onSuccess: (data, newStatus) => {
      showToast(`Facture mise à jour : ${newStatus}`);
      queryClient.invalidateQueries(['invoiceDetail', id]);
      setIsSendOpen(false);
    },
    onError: (err) => {
      showToast(`Erreur de mise à jour : ${err.message}`, 'error');
    },
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Ouverture de la facture..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 font-medium">
        ⚠️ Impossible d'ouvrir la facture : {error.message}.
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
      showToast(`Génération du PDF pour la facture ${invoice.invoiceNumber}...`);
      const response = await api.get(`/api/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`PDF de la facture ${invoice.invoiceNumber} téléchargé.`, 'success');
    } catch (err) {
      showToast(`Erreur lors de la génération du PDF : ${err.message}`, 'error');
    }
  };

  const items = invoice.items || [];
  const payments = invoice.payments || [];

  const amountPaid = invoice.amountPaid ?? 0;
  const amountRemaining = invoice.amountRemaining ?? invoice.totalTtc;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Fiche Facture : ${invoice.invoiceNumber}`}
        breadcrumb={[
          { label: 'Finances' },
          { label: 'Factures', link: '/dashboard/invoices' },
          { label: invoice.invoiceNumber }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/dashboard/invoices/${invoice.id}/edit`)}
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-colors cursor-pointer"
            >
              ✏️ Éditer
            </button>
            <button
              onClick={handleExportPdf}
              className="py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs tracking-wide transition-colors cursor-pointer"
            >
              📁 PDF
            </button>
            {invoice.status === 'Brouillon' && (
              <button
                onClick={() => setIsSendOpen(true)}
                className="py-2 px-4 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs tracking-wide transition-all cursor-pointer"
              >
                ✉️ Envoyer Facture
              </button>
            )}
            {invoice.status !== 'Payée' && (
              <button
                onClick={() => navigate(`/dashboard/invoices/${invoice.id}/payments/new`)}
                className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md transition-colors cursor-pointer"
              >
                💳 Enregistrer Règlement
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice PDF layout representation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 relative overflow-hidden">
            {/* Header branding */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black tracking-tighter text-blue-600">ATLAS WORKS</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 py-0.5 px-2 rounded">Facturation</span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Atlas Works S.A.R.L. — Travaux Divers & Rénovation<br />
                  Casablanca, Maroc | IF: 52367489 | RC: 94827 | ICE: 001548792000145
                </p>
              </div>
              <div className="text-right sm:text-right space-y-1">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">FACTURE</h2>
                <p className="text-xs font-bold text-blue-600">{invoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Date d'émission : {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('fr-FR') : '-'}
                </p>
                <p className="text-[10px] text-rose-500 font-bold">
                  Date d'échéance : {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : 'Immédiate'}
                </p>
              </div>
            </div>

            {/* Entities details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Émetteur</h3>
                <p className="font-bold text-slate-800">Atlas Works SARL</p>
                <p className="text-slate-500">
                  12 Rue des Hôpitaux, Maarif<br />
                  Casablanca, Maroc
                </p>
                <p className="text-slate-400">billing@atlasworks.ma | +212 522 34 56 78</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <h3 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest">Facturé à (Client)</h3>
                <p className="font-bold text-slate-800">{invoice.account?.name || 'Société Client'}</p>
                {invoice.account?.address && (
                  <p className="text-slate-500">
                    {invoice.account.address}<br />
                    {invoice.account.city || 'Maroc'}
                  </p>
                )}
                {invoice.account?.ice && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">ICE : {invoice.account.ice}</p>
                )}
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="font-extrabold text-xs text-slate-800 tracking-tight">
                  Prestations facturées — {invoice.title}
                </h3>
                {invoice.situationPercentage > 0 && (
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    Facturation de situation : {invoice.situationPercentage}%
                  </span>
                )}
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3">Description Prestation</th>
                      <th scope="col" className="px-4 py-3 text-center w-16">U</th>
                      <th scope="col" className="px-4 py-3 text-right w-20">Qté</th>
                      <th scope="col" className="px-4 py-3 text-right w-28">P.U. HT</th>
                      <th scope="col" className="px-4 py-3 text-right w-32">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                          Aucune ligne sur cette facture.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 max-w-xs text-slate-800">
                            {item.description}
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
                            {formatCurrency(item.quantity * item.unitPriceHt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>Montant HT</span>
                  <span className="text-slate-800">{formatCurrency(invoice.totalHt)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-bold">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(invoice.totalHt * 0.20)}</span>
                </div>
                <div className="h-px bg-slate-100 my-1"></div>
                <div className="flex justify-between items-center text-slate-850 font-black text-sm">
                  <span>Total TTC</span>
                  <span className="text-blue-600">{formatCurrency(invoice.totalTtc)}</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-medium leading-relaxed">
              <p className="font-bold text-slate-600">Informations & Coordonnées Bancaires :</p>
              <p className="mt-1">
                Virement en faveur de : <strong>Atlas Works S.A.R.L.</strong><br />
                Banque : Attijariwafa Bank - Agence Maarif Casablanca<br />
                RIB : 007 780 0001234567890123 45
              </p>
            </div>
          </div>
        </div>

        {/* Payments Ledger Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider">État de Trésorerie</h3>
            
            <div className="flex items-center space-x-3">
              <StatusBadge status={invoice.status} />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total TTC</span>
                <span className="text-slate-800 font-black">{formatCurrency(invoice.totalTtc)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-550 font-bold">Total Réglé</span>
                <span className="text-emerald-650 font-black">{formatCurrency(amountPaid)}</span>
              </div>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="flex justify-between items-center">
                <span className="text-rose-550 font-bold">Reste à Recouvrer</span>
                <span className="text-rose-650 font-black text-sm">{formatCurrency(amountRemaining)}</span>
              </div>
            </div>

            {amountPaid > 0 && (
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((amountPaid / invoice.totalTtc) * 100))}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Payments History Register */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              Historique des encaissements ({payments.length})
            </h3>
            
            <div className="space-y-3">
              {payments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4 font-semibold">Aucun encaissement sur cette facture.</p>
              ) : (
                payments.map(pay => (
                  <div key={pay.id} className="p-3.5 rounded-2xl bg-emerald-50/20 border border-emerald-250 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-black text-emerald-850">{formatCurrency(pay.amount)}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{pay.paymentMethod} {pay.reference && `— ref : ${pay.reference}`}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">{new Date(pay.paymentDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={isSendOpen}
        title="Marquer comme envoyée ?"
        message="Voulez-vous marquer cette facture comme envoyée au client ? Son statut passera à 'Envoyée'."
        confirmText="Confirmer l'envoi"
        cancelText="Annuler"
        type="info"
        loading={statusMutation.isLoading}
        onConfirm={() => statusMutation.mutate('Envoyée')}
        onCancel={() => setIsSendOpen(false)}
      />
    </div>
  );
};

export default InvoiceDetail;

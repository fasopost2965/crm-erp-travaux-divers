import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const PaymentForm = () => {
  const { id: invoiceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Virement');
  const [reference, setReference] = useState('');
  const [bank, setBank] = useState('');
  const [notes, setNotes] = useState('');

  // Chèque et Effet nécessitent une date d'échéance
  const requiresDueDate = ['Chèque', 'Effet'].includes(paymentMethod);

  // Fetch Invoice details to display info and prefill amount
  const { data: invoice, isLoading: isInvoiceLoading, error: invoiceError } = useQuery({
    queryKey: ['invoiceDetail', invoiceId],
    queryFn: async () => {
      const res = await api.get(`/api/invoices/${invoiceId}`);
      return res.data.data || res.data;
    }
  });

  // Prefill outstanding balance when invoice details are loaded
  useEffect(() => {
    if (invoice) {
      const remaining = invoice.amountRemaining ?? (invoice.totalTtc - (invoice.amountPaid ?? 0));
      setAmount(remaining > 0 ? remaining.toString() : '');
    }
  }, [invoice]);

  // Mutation to store the payment
  const paymentMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post(`/api/invoices/${invoiceId}/payments`, payload);
    },
    onSuccess: () => {
      showToast('Règlement enregistré avec succès !');
      // Invalidate caches
      queryClient.invalidateQueries(['invoiceDetail', invoiceId]);
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['financeDashboard']);
      queryClient.invalidateQueries(['directorDashboard']);
      
      // Navigate back to the invoice page
      navigate(`/dashboard/invoices/${invoiceId}`);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de l'enregistrement du règlement : ${errMsg}`, 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Le montant du règlement doit être supérieur à 0.', 'error');
      return;
    }

    if (!paymentDate) {
      showToast('Veuillez spécifier la date de paiement.', 'error');
      return;
    }

    if (!paymentMethod) {
      showToast('Veuillez choisir un mode de règlement.', 'error');
      return;
    }

    if (requiresDueDate && !dueDate) {
      showToast(`La date d'échéance est obligatoire pour un règlement par ${paymentMethod}.`, 'error');
      return;
    }

    const payload = {
      amount: parsedAmount,
      payment_date: paymentDate,
      due_date: dueDate || null,
      payment_method: paymentMethod,
      reference: reference.trim() || null,
      bank: bank.trim() || null,
      notes: notes.trim() || null
    };

    paymentMutation.mutate(payload);
  };

  if (isInvoiceLoading) {
    return <LoadingSpinner fullPage message="Chargement de la facture..." />;
  }

  if (invoiceError) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-3xl text-red-700 dark:text-red-400 font-medium">
        ⚠️ Impossible de charger la facture pour ce règlement : {invoiceError.message}.
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val || 0)
      .replace('MAD', 'DH');
  };

  const amountRemaining = invoice.amountRemaining ?? (invoice.totalTtc - (invoice.amountPaid ?? 0));

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      <PageHeader
        title="💳 Enregistrer un Règlement"
        breadcrumb={[
          { label: 'Finances', link: '/dashboard/invoices' },
          { label: invoice.invoiceNumber, link: `/dashboard/invoices/${invoiceId}` },
          { label: 'Règlement' }
        ]}
      />

      {/* Recapitulatif Facture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 text-xs">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Facture</span>
            <span className="text-sm font-black text-slate-850 dark:text-white block">{invoice.invoiceNumber}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">{invoice.title}</span>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Client</span>
            <span className="text-sm font-black text-slate-850 dark:text-white block truncate">{invoice.account?.name || 'Client'}</span>
            <span className="text-[10px] text-slate-400 font-semibold block">Situation : {invoice.situationPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center border-b border-slate-100 dark:border-slate-850 pb-6 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total TTC</span>
            <p className="text-sm font-black text-slate-800 dark:text-white">{formatCurrency(invoice.totalTtc)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Déjà réglé</span>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(invoice.amountPaid)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-rose-500 font-bold uppercase">Reste à payer</span>
            <p className="text-sm font-black text-rose-600 dark:text-rose-450">{formatCurrency(amountRemaining)}</p>
          </div>
        </div>

        {amountRemaining <= 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 text-emerald-700 dark:text-emerald-400 text-xs font-bold text-center">
            🎉 Cette facture a déjà été intégralement réglée.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          {/* Montant */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Montant du règlement (DH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={amountRemaining <= 0}
                className="block w-full pl-4 pr-16 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-900 dark:text-white font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-xs">DH TTC</span>
            </div>
            {parseFloat(amount) > amountRemaining ? (
              <p className="text-[10px] text-amber-500 font-bold">
                ⚠️ Attention: Le montant saisi dépasse le reste à payer de la facture ({formatCurrency(amountRemaining)}).
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Mode de règlement */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Mode de règlement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={amountRemaining <= 0}
                className="block w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold disabled:opacity-50"
              >
                <option value="Virement">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Espèces">Espèces</option>
                <option value="Effet">Effet de commerce</option>
                <option value="Carte bancaire">Carte bancaire</option>
              </select>
            </div>

            {/* Date de paiement */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Date de réception
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                disabled={amountRemaining <= 0}
                className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
            </div>
          </div>

          {/* Date d'échéance — obligatoire pour Chèque et Effet */}
          {requiresDueDate && (
            <div className="space-y-2 animate-fadeIn">
              <label className="text-[11px] font-bold text-amber-500 uppercase tracking-wide flex items-center gap-1">
                Date d'échéance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={paymentDate}
                disabled={amountRemaining <= 0}
                className="block w-full px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer disabled:opacity-50"
              />
              <p className="text-[10px] text-amber-500 font-semibold">
                Date à laquelle le {paymentMethod.toLowerCase()} sera présenté à l'encaissement.
              </p>
            </div>
          )}

          {/* Reference & Banque (conditional but simple visual groups) */}
          {['Virement', 'Chèque', 'Effet', 'Carte bancaire'].includes(paymentMethod) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
              {/* Référence */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Numéro de référence / Chèque
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  disabled={amountRemaining <= 0}
                  placeholder={paymentMethod === 'Chèque' ? 'Ex: CHQ-8472910' : 'Ex: VIR-948172635'}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Banque */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Banque émettrice
                </label>
                <input
                  type="text"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  disabled={amountRemaining <= 0}
                  placeholder="Ex: Attijariwafa Bank, BCP, BMCE..."
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Notes de transaction
            </label>
            <textarea
              placeholder="Renseigner ici toute note relative au règlement (ex: règlement partiel de situation, acompte, retenue de garantie...)"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={amountRemaining <= 0}
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/invoices/${invoiceId}`)}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={paymentMutation.isLoading || amountRemaining <= 0}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold tracking-wide shadow-md shadow-blue-900/10 transition-colors cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {paymentMutation.isLoading ? 'Enregistrement...' : 'Enregistrer le règlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;

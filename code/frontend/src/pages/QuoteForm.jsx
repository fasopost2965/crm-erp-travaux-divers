import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutocompleteSelect from '../components/common/AutocompleteSelect';
import { useToast } from '../components/common/NotificationToast';

const QuoteForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Local Form State
  const [title, setTitle] = useState('');
  const [quoteNumber, setQuoteNumber] = useState(`DEV-${Date.now().toString().slice(-6)}`);
  const [accountId, setAccountId] = useState('');
  const [opportunityId, setOpportunityId] = useState('');
  const [status, setStatus] = useState('Brouillon');
  const [validUntil, setValidUntil] = useState('');
  const [marginEstimated, setMarginEstimated] = useState('0');
  const [retentionRate, setRetentionRate] = useState('0');
  
  // Prestations State
  const [items, setItems] = useState([
    { section: 'Gros Œuvre', description: '', unit: 'm²', quantity: 1, unitPriceHt: 0 }
  ]);

  // Fetch Accounts list
  const { data: accountsData } = useQuery({
    queryKey: ['accountsListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/accounts');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Opportunities list
  const { data: opportunitiesData } = useQuery({
    queryKey: ['opportunitiesListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/opportunities');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Quote if in Edit Mode
  const { isLoading: isQuoteLoading } = useQuery({
    queryKey: ['quoteDetailEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/quotes/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (quote) => {
      setTitle(quote.title || '');
      setQuoteNumber(quote.quoteNumber || '');
      setAccountId(quote.accountId || '');
      setOpportunityId(quote.opportunityId || '');
      setStatus(quote.status || 'Brouillon');
      if (quote.validUntil) {
        setValidUntil(quote.validUntil.split('T')[0]);
      }
      setMarginEstimated(String(quote.marginEstimated || '0'));
      setRetentionRate(String(quote.retentionRate || '0'));
      if (quote.items && quote.items.length > 0) {
        setItems(quote.items.map(it => ({
          section: it.section || '',
          description: it.description || '',
          unit: it.unit || 'm²',
          quantity: it.quantity || 1,
          unitPriceHt: it.unitPriceHt || 0
        })));
      }
    }
  });

  // Mutation for creation or edition
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return await api.put(`/api/quotes/${id}`, payload);
      } else {
        return await api.post('/api/quotes', payload);
      }
    },
    onSuccess: () => {
      showToast(`Devis ${isEdit ? 'mis à jour' : 'créé'} avec succès !`);
      queryClient.invalidateQueries(['quotesList']);
      if (isEdit) {
        queryClient.invalidateQueries(['quoteDetail', id]);
      }
      navigate('/dashboard/quotes');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la sauvegarde : ${errMsg}`, 'error');
    }
  });

  // Row interaction
  const handleAddItemRow = () => {
    setItems([
      ...items,
      { section: items[items.length - 1]?.section || 'Gros Œuvre', description: '', unit: 'm²', quantity: 1, unitPriceHt: 0 }
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length <= 1) {
      showToast('Un devis doit comporter au moins une ligne de prestation.', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  // Calculations
  const calculateTotalHt = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPriceHt || 0)), 0);
  };

  const totalHt = calculateTotalHt();
  const taxAmount = totalHt * 0.20; // 20% TVA Morocco
  const totalTtc = totalHt + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!accountId) {
      showToast('Veuillez sélectionner un compte client.', 'error');
      return;
    }
    if (!opportunityId) {
      showToast('Veuillez sélectionner une opportunité associée.', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Le titre du devis est obligatoire.', 'error');
      return;
    }

    // Validate items
    const invalidItem = items.find(it => !it.description.trim() || it.quantity <= 0 || it.unitPriceHt < 0);
    if (invalidItem) {
      showToast('Veuillez remplir les descriptions, quantités (>0) et prix HT pour toutes les lignes.', 'error');
      return;
    }

    const payload = {
      title,
      quote_number: quoteNumber,
      account_id: parseInt(accountId),
      opportunity_id: parseInt(opportunityId),
      status,
      valid_until: validUntil || null,
      margin_estimated: parseFloat(marginEstimated || 0),
      retention_rate: parseFloat(retentionRate || 0),
      tva_rate: 20, // fixed 20%
      items: items.map(it => ({
        section: it.section || null,
        description: it.description,
        unit: it.unit,
        quantity: parseFloat(it.quantity),
        unit_price_ht: parseFloat(it.unitPriceHt)
      }))
    };

    saveMutation.mutate(payload);
  };

  if (isEdit && isQuoteLoading) {
    return <LoadingSpinner fullPage message="Chargement du devis..." />;
  }

  const accountOptions = (accountsData || []).map(acc => ({
    value: acc.id,
    label: acc.name
  }));

  const opportunityOptions = (opportunitiesData || []).map(opp => ({
    value: opp.id,
    label: `💼 ${opp.title} (${opp.account?.name || 'Client inconnu'})`
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? `Édition Devis : ${quoteNumber}` : 'Nouveau Devis Client'}
        breadcrumb={[
          { label: 'Ventes' },
          { label: 'Devis', link: '/dashboard/quotes' },
          { label: isEdit ? 'Édition' : 'Nouveau' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850">
                Informations Générales
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Numéro de devis</label>
                  <input
                    type="text"
                    required
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Titre du projet / Objet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rénovation verrière et peinture"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Compte client</label>
                  <AutocompleteSelect
                    options={accountOptions}
                    value={accountId}
                    onChange={(val) => {
                      setAccountId(val);
                      // Try auto-matching opportunity if exists
                      const matchedOpp = (opportunitiesData || []).find(opp => opp.accountId === val);
                      if (matchedOpp) {
                        setOpportunityId(matchedOpp.id);
                      }
                    }}
                    placeholder="Rechercher et sélectionner un client..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Opportunité commerciale associée</label>
                  <AutocompleteSelect
                    options={opportunityOptions}
                    value={opportunityId}
                    onChange={(val) => {
                      setOpportunityId(val);
                      // Try auto-matching account if exists
                      const matchedOpp = (opportunitiesData || []).find(opp => opp.id === val);
                      if (matchedOpp && matchedOpp.accountId) {
                        setAccountId(matchedOpp.accountId);
                      }
                    }}
                    placeholder="Rechercher et sélectionner l'opportunité..."
                  />
                </div>
              </div>
            </div>

            {/* Prestation items dynamic table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-850">
                <h3 className="font-bold text-slate-800 dark:text-white text-xs uppercase tracking-wider">
                  Lignes de prestation
                </h3>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>+ Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="w-full sm:w-1/4 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Section</label>
                      <input
                        type="text"
                        placeholder="Ex: Maçonnerie"
                        value={item.section}
                        onChange={(e) => handleItemChange(idx, 'section', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-full sm:flex-1 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Description de prestation</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Fourniture et pose de dalle carrelage 60x60"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-20 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Unité</label>
                      <input
                        type="text"
                        required
                        placeholder="U"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-24 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Qté</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <div className="w-32 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">P.U. HT (DH)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={item.unitPriceHt}
                        onChange={(e) => handleItemChange(idx, 'unitPriceHt', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-slate-800 dark:text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 cursor-pointer shrink-0 transition-colors"
                      title="Supprimer la ligne"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar calculations & settings */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 dark:text-white text-xs uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850">
                Paramètres & Totaux
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-350 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="Envoyé">Envoyé</option>
                    <option value="Accepté">Accepté</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date de validité</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Marge Estimée (HT)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={marginEstimated}
                    onChange={(e) => setMarginEstimated(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Retenue de garantie (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={retentionRate}
                    onChange={(e) => setRetentionRate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Instant invoice total card */}
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-3.5 text-xs font-semibold text-slate-655 dark:text-slate-350">
                <div className="flex justify-between items-center">
                  <span>Sous-total HT</span>
                  <span className="text-slate-850 dark:text-white font-extrabold">{formatCurrency(totalHt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-800/80 my-1"></div>
                <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-white">
                  <span>Total TTC</span>
                  <span className="text-blue-650 dark:text-blue-400">{formatCurrency(totalTtc)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 hover:shadow-blue-500/15 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {saveMutation.isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer le Devis'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuoteForm;

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutocompleteSelect from '../components/common/AutocompleteSelect';
import { useToast } from '../components/common/NotificationToast';

const InvoiceForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const queryQuoteId = searchParams.get('quoteId');

  // Form State
  const [title, setTitle] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`FAC-${Date.now().toString().slice(-6)}`);
  const [accountId, setAccountId] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [type, setType] = useState('Standard');
  const [situationPercentage, setSituationPercentage] = useState('100');
  const [status, setStatus] = useState('Brouillon');
  const [dueDate, setDueDate] = useState('');
  const [tvaRate, setTvaRate] = useState('20');

  // Line items state
  const [items, setItems] = useState([
    { section: 'Gros Œuvre', description: '', unit: 'm²', quantity: 1, unitPriceHt: 0 }
  ]);

  // Fetch Quotes list
  const { data: quotesData } = useQuery({
    queryKey: ['quotesListForInvoiceSelect'],
    queryFn: async () => {
      const res = await api.get('/api/quotes');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Accounts list
  const { data: accountsData } = useQuery({
    queryKey: ['accountsListForInvoiceSelect'],
    queryFn: async () => {
      const res = await api.get('/api/accounts');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Quote Details if quoteId is passed as query parameter or selected
  const [refQuoteId, setRefQuoteId] = useState(queryQuoteId || '');
  const { isLoading: isQuotePreloadLoading } = useQuery({
    queryKey: ['quoteDetailsForInvoicePreFill', refQuoteId],
    queryFn: async () => {
      const res = await api.get(`/api/quotes/${refQuoteId}`);
      return res.data.data || res.data;
    },
    enabled: !!refQuoteId && !isEdit,
    onSuccess: (quote) => {
      setQuoteId(quote.id);
      setAccountId(quote.accountId || quote.account?.id || '');
      setTitle(`Facture : ${quote.title}`);
      
      if (quote.items && quote.items.length > 0) {
        setItems(quote.items.map(it => ({
          section: it.section || '',
          description: it.description || '',
          unit: it.unit || 'U',
          quantity: it.quantity || 1,
          unitPriceHt: it.unitPriceHt || 0
        })));
      }
      showToast('Détails du devis répliqués dans la facture.');
    },
    onError: (err) => {
      showToast(`Erreur lors du pré-remplissage à partir du devis : ${err.message}`, 'error');
    }
  });

  // Fetch Invoice details if in Edit Mode
  const { isLoading: isInvoiceLoading } = useQuery({
    queryKey: ['invoiceDetailEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/invoices/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (inv) => {
      setTitle(inv.title || '');
      setInvoiceNumber(inv.invoiceNumber || '');
      setAccountId(inv.accountId || inv.account?.id || '');
      setQuoteId(inv.quoteId || inv.quote?.id || '');
      setType(inv.type || 'Standard');
      setSituationPercentage(String(inv.situationPercentage || '100'));
      setStatus(inv.status || 'Brouillon');
      setTvaRate(String(inv.tvaRate ?? '20'));
      if (inv.dueDate) {
        setDueDate(inv.dueDate.split('T')[0]);
      }
      if (inv.items && inv.items.length > 0) {
        setItems(inv.items.map(it => ({
          section: it.section || '',
          description: it.description || '',
          unit: it.unit || 'U',
          quantity: it.quantity || 1,
          unitPriceHt: it.unitPriceHt || 0
        })));
      }
    },
    onError: (err) => {
      showToast(`Erreur de chargement : ${err.message}`, 'error');
    }
  });

  // Mutation for creation or edition
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return await api.put(`/api/invoices/${id}`, payload);
      } else {
        return await api.post('/api/invoices', payload);
      }
    },
    onSuccess: () => {
      showToast(`Facture ${isEdit ? 'mise à jour' : 'créée'} avec succès !`);
      queryClient.invalidateQueries(['invoicesList']);
      if (isEdit) {
        queryClient.invalidateQueries(['invoiceDetail', id]);
      }
      navigate('/dashboard/invoices');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la sauvegarde : ${errMsg}`, 'error');
    }
  });

  const handleAddItemRow = () => {
    setItems([
      ...items,
      { section: items[items.length - 1]?.section || 'Gros Œuvre', description: '', unit: 'U', quantity: 1, unitPriceHt: 0 }
    ]);
  };

  const handleRemoveItemRow = (idx) => {
    if (items.length <= 1) {
      showToast('Une facture doit comporter au moins une ligne.', 'error');
      return;
    }
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const calculateTotalHt = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPriceHt || 0)), 0);
  };

  const totalHt = calculateTotalHt();
  const taxAmount = totalHt * (parseFloat(tvaRate || 0) / 100);
  const totalTtc = totalHt + taxAmount;

  // Apply percentage helper (e.g. for situation billing)
  const handleApplySituationPercentage = () => {
    const pct = parseFloat(situationPercentage || 100) / 100;
    if (pct <= 0 || pct > 1) {
      showToast('Veuillez spécifier un pourcentage valide entre 1% et 100%.', 'error');
      return;
    }

    if (!quoteId && !refQuoteId) {
      showToast('Sélectionnez d\'abord un devis de référence pour charger les prix d\'origine.', 'error');
      return;
    }

    // If we have refQuoteId pre-filled, the onSuccess already loaded the items at 100%.
    // We can scale the quantities according to the percentage!
    const scaledItems = items.map(it => ({
      ...it,
      quantity: parseFloat((it.quantity * pct).toFixed(2))
    }));
    setItems(scaledItems);
    showToast(`Pourcentage de situation de ${situationPercentage}% appliqué aux quantités.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!quoteId) {
      showToast('Le devis de référence associé est obligatoire.', 'error');
      return;
    }
    if (!accountId) {
      showToast('Le compte client est obligatoire.', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Le titre de la facture est obligatoire.', 'error');
      return;
    }

    // Validate items
    const invalidItem = items.find(it => !it.description.trim() || it.quantity <= 0 || it.unitPriceHt < 0);
    if (invalidItem) {
      showToast('Toutes les lignes doivent avoir une description, une quantité positive et un prix HT supérieur ou égal à 0.', 'error');
      return;
    }

    const payload = {
      quote_id: parseInt(quoteId),
      account_id: parseInt(accountId),
      invoice_number: invoiceNumber,
      title,
      type,
      situation_percentage: type === 'Situation' ? parseFloat(situationPercentage || 100) : null,
      status,
      tva_rate: parseFloat(tvaRate || 20),
      due_date: dueDate || null,
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

  if ((isEdit && isInvoiceLoading) || (!!refQuoteId && isQuotePreloadLoading)) {
    return <LoadingSpinner fullPage message="Chargement du formulaire de facturation..." />;
  }

  const quoteOptions = (quotesData || []).map(q => ({
    value: q.id,
    label: `${q.quoteNumber} — ${q.title}`
  }));

  const accountOptions = (accountsData || []).map(acc => ({
    value: acc.id,
    label: acc.name
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? `Modification Facture : ${invoiceNumber}` : 'Nouvelle Facture Comptable'}
        breadcrumb={[
          { label: 'Finances' },
          { label: 'Factures', link: '/dashboard/invoices' },
          { label: isEdit ? 'Édition' : 'Nouveau' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main forms inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                Informations Facturation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Numéro de facture</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Objet / Libellé de facturation</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Facture de situation n° 1 — Plomberie Anfa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Devis de référence associé</label>
                  <AutocompleteSelect
                    options={quoteOptions}
                    value={quoteId}
                    onChange={(val) => {
                      setQuoteId(val);
                      setRefQuoteId(val); // triggers React Query details fetch
                    }}
                    placeholder="Sélectionner le devis d'origine..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Client facturé</label>
                  <AutocompleteSelect
                    options={accountOptions}
                    value={accountId}
                    onChange={setAccountId}
                    placeholder="Sélectionner le client..."
                  />
                </div>
              </div>
            </div>

            {/* Line items dynamic ledger */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-880 text-xs uppercase tracking-wider">
                  Lignes de Facture
                </h3>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="py-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>+ Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="w-full sm:w-1/4 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Section</label>
                      <input
                        type="text"
                        placeholder="Section"
                        value={item.section}
                        onChange={(e) => handleItemChange(idx, 'section', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-150 text-slate-850 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div className="w-full sm:flex-1 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Prestation facturée</label>
                      <input
                        type="text"
                        required
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-150 text-slate-850 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div className="w-16 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Unité</label>
                      <input
                        type="text"
                        required
                        placeholder="U"
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-150 text-slate-850 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div className="w-20 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Qté</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-150 text-slate-850 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <div className="w-28 space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">P.U. HT (DH)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={item.unitPriceHt}
                        onChange={(e) => handleItemChange(idx, 'unitPriceHt', parseFloat(e.target.value) || 0)}
                        className="block w-full px-3 py-2 rounded-xl bg-white border border-slate-150 text-slate-850 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-2 rounded-xl hover:bg-red-50 text-red-500 cursor-pointer shrink-0 transition-colors"
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
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                Paramètres fiscaux & Type
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Type de Facture</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
                  >
                    <option value="Standard">Standard (Complète)</option>
                    <option value="Acompte">Acompte à la signature</option>
                    <option value="Situation">Facture de situation (Avancement)</option>
                    <option value="Solde">Facture de Solde</option>
                  </select>
                </div>

                {type === 'Situation' && (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Pourcentage d'avancement (%)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={situationPercentage}
                        onChange={(e) => setSituationPercentage(e.target.value)}
                        className="block w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplySituationPercentage}
                        className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-[10px] uppercase shrink-0 cursor-pointer transition-colors"
                      >
                        Appliquer
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold leading-normal block">
                      Cliquez sur "Appliquer" pour multiplier les quantités de chaque ligne de devis d'origine par le taux d'avancement spécifié.
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">État initial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="Envoyée">Envoyée</option>
                    <option value="Payée">Payée</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date d'échéance réglementaire</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Taux de TVA (%)</label>
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-bold"
                  >
                    <option value="20">20% (Taux standard Maroc)</option>
                    <option value="14">14% (Taux réduit)</option>
                    <option value="10">10%</option>
                    <option value="7">7%</option>
                    <option value="0">Exonéré (0%)</option>
                  </select>
                </div>
              </div>

              {/* Instant calculations summary */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 space-y-3.5 text-xs font-semibold text-slate-655">
                <div className="flex justify-between items-center">
                  <span>Sous-total HT</span>
                  <span className="text-slate-850 font-extrabold">{formatCurrency(totalHt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>TVA ({tvaRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex justify-between items-center text-sm font-black text-slate-800">
                  <span>Total TTC</span>
                  <span className="text-blue-650">{formatCurrency(totalTtc)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {saveMutation.isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Émettre la Facture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AutocompleteSelect from '../components/common/AutocompleteSelect';
import { useToast } from '../components/common/NotificationToast';

const ProjectForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const queryQuoteId = searchParams.get('quoteId');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [status, setStatus] = useState('Planifié');
  const [budget, setBudget] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDatePlanned, setEndDatePlanned] = useState('');
  const [endDateActual, setEndDateActual] = useState('');
  const [quoteId, setQuoteId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');

  // Fetch Quotes list for select
  const { data: quotesData } = useQuery({
    queryKey: ['quotesListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/quotes');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Accounts list for select
  const { data: accountsData } = useQuery({
    queryKey: ['accountsListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/accounts');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Users (Project Managers) list from our new /api/users endpoint
  const { data: usersData } = useQuery({
    queryKey: ['usersListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/users');
      return res.data.data || res.data || [];
    }
  });

  // Fetch Quote Details if quoteId is passed as query parameter
  const { isLoading: isPreFillQuoteLoading } = useQuery({
    queryKey: ['quotePreFillDetails', queryQuoteId],
    queryFn: async () => {
      const res = await api.get(`/api/quotes/${queryQuoteId}`);
      return res.data.data || res.data;
    },
    enabled: !!queryQuoteId && !isEdit,
    onSuccess: (quote) => {
      setQuoteId(quote.id);
      setAccountId(quote.accountId || quote.account?.id || '');
      setTitle(`Chantier : ${quote.title}`);
      setBudget(String(quote.totalHt || '0'));
      
      const itemsList = quote.items || [];
      const generatedDesc = `Projet créé Ã  partir du devis n° ${quote.quoteNumber}.\n\nPrestations prévues :\n` + 
        itemsList.map(it => `- [${it.section || 'Général'}] ${it.description} (${it.quantity} ${it.unit} x ${it.unitPriceHt} DH)`).join('\n');
      setDescription(generatedDesc);
      
      if (quote.account?.address) {
        setAddress(quote.account.address);
      }
      if (quote.account?.city) {
        setCity(quote.account.city);
      }
      showToast('Détails du devis pré-remplis avec succès.');
    },
    onError: (err) => {
      showToast(`Impossible de charger le devis de référence : ${err.message}`, 'error');
    }
  });

  // Fetch Project Details if in Edit Mode
  const { isLoading: isProjectLoading } = useQuery({
    queryKey: ['projectDetailEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (proj) => {
      setTitle(proj.title || '');
      setDescription(proj.description || '');
      setAddress(proj.address || '');
      setCity(proj.city || 'Casablanca');
      setStatus(proj.status || 'Planifié');
      setBudget(String(proj.budget || '0'));
      if (proj.startDate) setStartDate(proj.startDate.split('T')[0]);
      if (proj.endDatePlanned) setEndDatePlanned(proj.endDatePlanned.split('T')[0]);
      if (proj.endDateActual) setEndDateActual(proj.endDateActual.split('T')[0]);
      setQuoteId(proj.quoteId || proj.quote?.id || '');
      setAccountId(proj.accountId || proj.account?.id || '');
      setProjectManagerId(proj.projectManagerId || proj.manager?.id || '');
    },
    onError: (err) => {
      showToast(`Impossible de charger les détails du projet : ${err.message}`, 'error');
    }
  });

  // Mutation for creation or edition
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return await api.put(`/api/projects/${id}`, payload);
      } else {
        return await api.post('/api/projects', payload);
      }
    },
    onSuccess: () => {
      showToast(`Chantier ${isEdit ? 'mis Ã  jour' : 'créé'} avec succès !`);
      queryClient.invalidateQueries(['projectsList']);
      if (isEdit) {
        queryClient.invalidateQueries(['projectDetail', id]);
      }
      navigate('/dashboard/projects');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || err.message;
      showToast(`Erreur lors de la sauvegarde : ${errMsg}`, 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!quoteId) {
      showToast('Le devis de référence est obligatoire.', 'error');
      return;
    }
    if (!accountId) {
      showToast('Le compte client associé est obligatoire.', 'error');
      return;
    }
    if (!projectManagerId) {
      showToast('Le conducteur de travaux (Chef de chantier) est obligatoire.', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Le titre du projet est obligatoire.', 'error');
      return;
    }
    if (!startDate) {
      showToast('La date de démarrage est obligatoire.', 'error');
      return;
    }
    if (!endDatePlanned) {
      showToast('La date de fin prévisionnelle est obligatoire.', 'error');
      return;
    }

    const payload = {
      quote_id: parseInt(quoteId),
      account_id: parseInt(accountId),
      title,
      description,
      address,
      city,
      status,
      budget: parseFloat(budget || 0),
      start_date: startDate,
      end_date_planned: endDatePlanned,
      end_date_actual: endDateActual || null,
      project_manager_id: parseInt(projectManagerId)
    };

    saveMutation.mutate(payload);
  };

  if ((isEdit && isProjectLoading) || (!!queryQuoteId && isPreFillQuoteLoading)) {
    return <LoadingSpinner fullPage message="Chargement des formulaires..." />;
  }

  // Map options for selects
  const quoteOptions = (quotesData || []).map(q => ({
    value: q.id,
    label: `${q.quoteNumber} "” ${q.title}`
  }));

  const accountOptions = (accountsData || []).map(acc => ({
    value: acc.id,
    label: acc.name
  }));

  // Filter project managers (role code 'chef_chantier' or similar, or just any user)
  const managerOptions = (usersData || []).map(usr => ({
    value: usr.id,
    label: `ðŸ‘¤ ${usr.name} (${usr.role?.name || 'Collaborateur'})`
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? `Modification Chantier : ${title}` : 'Nouveau Chantier (Projet)'}
        breadcrumb={[
          { label: 'Opérations' },
          { label: 'Chantiers', link: '/dashboard/projects' },
          { label: isEdit ? 'Édition' : 'Nouveau' }
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                Informations du Projet
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Titre du Projet / Chantier</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chantier Plomberie et Climatisation Anfa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Descriptif Technique & Plan de charge</label>
                  <textarea
                    placeholder="Saisir la description des travaux, les jalons clés ou les contraintes techniques..."
                    rows="6"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Adresse du Chantier</label>
                    <input
                      type="text"
                      placeholder="Ex: Angle Boulevard Anfa et Rue Ali"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Ville</label>
                    <input
                      type="text"
                      placeholder="Casablanca"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Relations */}
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                Liaisons Administratives & Relations
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Devis de référence (Obligatoire)</label>
                  <AutocompleteSelect
                    options={quoteOptions}
                    value={quoteId}
                    onChange={(val) => {
                      setQuoteId(val);
                      // Auto populate client & budget if possible
                      const matched = (quotesData || []).find(q => q.id === val);
                      if (matched) {
                        setAccountId(matched.accountId || matched.account?.id || '');
                        setBudget(String(matched.totalHt || '0'));
                        if (!title) {
                          setTitle(`Chantier : ${matched.title}`);
                        }
                      }
                    }}
                    placeholder="Sélectionner le devis d'origine..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Client associé (Compte)</label>
                  <AutocompleteSelect
                    options={accountOptions}
                    value={accountId}
                    onChange={setAccountId}
                    placeholder="Sélectionner le client..."
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Conducteur de travaux (Chef de chantier assigné)</label>
                  <AutocompleteSelect
                    options={managerOptions}
                    value={projectManagerId}
                    onChange={setProjectManagerId}
                    placeholder="Désigner le responsable terrain..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar parameters & dates */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-850 text-xs uppercase tracking-wider pb-3 border-b border-slate-100">
                Planification & Statut
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Statut</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer font-bold"
                  >
                    <option value="À commencer">À commencer</option>
                    <option value="En cours">En cours</option>
                    <option value="Suspendu">Suspendu</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Enveloppe budgétaire (HT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="block w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs font-black focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-[10px]">DH</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date d'ouverture chantier</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Échéance de réception planifiée</label>
                  <input
                    type="date"
                    required
                    value={endDatePlanned}
                    onChange={(e) => setEndDatePlanned(e.target.value)}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer font-bold"
                  />
                </div>

                {isEdit && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Date de réception définitive (Effective)</label>
                    <input
                      type="date"
                      value={endDateActual}
                      onChange={(e) => setEndDateActual(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer font-bold"
                    />
                  </div>
                )}
              </div>

              {budget > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Budget du Chantier</span>
                  <span className="text-xl font-black text-slate-850">{formatCurrency(parseFloat(budget))}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="w-full py-3 px-5 rounded-xl bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all cursor-pointer"
                >
                  {saveMutation.isLoading ? 'Enregistrement...' : isEdit ? 'Sauvegarder les modifications' : 'Lancer le Chantier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;

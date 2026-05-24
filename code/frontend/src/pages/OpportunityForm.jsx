import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const OPP_STATUSES = ['Prospect', 'Qualification', 'Proposition', 'Négociation', 'Gagnée', 'Perdue'];

const OpportunityForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    account_id: '', title: '', estimated_budget: '',
    probability: '50', status: 'Prospect', close_date: '',
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accountsListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/accounts?per_page=100');
      return res.data.data || [];
    },
  });

  const { isLoading: isFetching } = useQuery({
    queryKey: ['opportunityEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/opportunities/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (o) => {
      setForm({
        account_id: String(o.accountId || ''),
        title: o.title || '',
        estimated_budget: String(o.estimatedBudget || ''),
        probability: String(o.probability || '50'),
        status: o.status || 'Prospect',
        close_date: o.closeDate ? o.closeDate.split('T')[0] : '',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/api/opportunities/${id}`, data)).data;
      return (await api.post('/api/opportunities', data)).data;
    },
    onSuccess: () => {
      showToast(isEdit ? 'Opportunité mise Ã  jour.' : 'Opportunité créée avec succès.');
      queryClient.invalidateQueries(['opportunitiesList']);
      navigate('/dashboard/opportunities');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      showToast(`Erreur : ${msg}`, 'error');
    },
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      estimated_budget: parseFloat(form.estimated_budget),
      probability: parseInt(form.probability, 10),
    });
  };

  if (isEdit && isFetching) return <LoadingSpinner fullPage message="Chargement de l'opportunité..." />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? "Modifier l'Opportunité" : 'Nouvelle Opportunité'}
        breadcrumb={[{ label: 'CRM' }, { label: 'Opportunités', href: '/dashboard/opportunities' }, { label: isEdit ? 'Modifier' : 'Nouveau' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Détails de l'Opportunité</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Client <span className="text-red-500">*</span></label>
            <select
              name="account_id"
              value={form.account_id}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer"
            >
              <option value="">Sélectionner un client...</option>
              {(accountsData || []).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Titre <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Travaux de peinture extérieure..." className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Budget estimé (DH HT) <span className="text-red-500">*</span></label>
              <input type="number" name="estimated_budget" value={form.estimated_budget} onChange={handleChange} required min="0" step="0.01" placeholder="250000" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Probabilité de succès : {form.probability}%</label>
              <input type="range" name="probability" value={form.probability} onChange={handleChange} min="0" max="100" step="5" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Statut <span className="text-red-500">*</span></label>
              <select name="status" value={form.status} onChange={handleChange} required className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer">
                {OPP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Date de clôture prévue <span className="text-red-500">*</span></label>
              <input type="date" name="close_date" value={form.close_date} onChange={handleChange} required className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button type="submit" disabled={mutation.isLoading} className="py-2.5 px-6 rounded-xl bg-[#C85A2A] hover:bg-[#FDF0EA]0 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all disabled:opacity-50 cursor-pointer">
            {mutation.isLoading ? 'Enregistrement...' : isEdit ? "Mettre Ã  jour" : "Créer l'Opportunité"}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/opportunities')} className="py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default OpportunityForm;

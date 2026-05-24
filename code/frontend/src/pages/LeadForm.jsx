import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const LEAD_SOURCES = ['Appel entrant', 'Appel d\'offres', 'Recommandation', 'RÃ©seaux sociaux', 'Site web', 'Salon', 'Autre'];
const LEAD_STATUSES = ['Nouveau', 'ContactÃ©', 'QualifiÃ©', 'Perdu'];

const LeadForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '', account_name: '', contact_name: '',
    email: '', phone: '', source: '', status: 'Nouveau', notes: '',
  });

  const { isLoading: isFetching } = useQuery({
    queryKey: ['leadEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/leads/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (l) => {
      setForm({
        title: l.title || '',
        account_name: l.accountName || '',
        contact_name: l.contactName || '',
        email: l.email || '',
        phone: l.phone || '',
        source: l.source || '',
        status: l.status || 'Nouveau',
        notes: l.notes || '',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/api/leads/${id}`, data)).data;
      return (await api.post('/api/leads', data)).data;
    },
    onSuccess: () => {
      showToast(isEdit ? 'Lead mis Ã  jour.' : 'Lead crÃ©Ã© avec succÃ¨s.');
      queryClient.invalidateQueries(['leadsList']);
      navigate('/dashboard/leads');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      showToast(`Erreur : ${msg}`, 'error');
    },
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(form); };

  if (isEdit && isFetching) return <LoadingSpinner fullPage message="Chargement du lead..." />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? 'Modifier le Lead' : 'Nouveau Lead'}
        breadcrumb={[{ label: 'CRM' }, { label: 'Leads', href: '/dashboard/leads' }, { label: isEdit ? 'Modifier' : 'Nouveau' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Informations du Lead</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Titre / Objet <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="RÃ©novation Ã©lectrique siÃ¨ge..." className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Entreprise <span className="text-red-500">*</span></label>
              <input type="text" name="account_name" value={form.account_name} onChange={handleChange} required placeholder="Nom de l'entreprise" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Contact</label>
              <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="Nom du contact" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="contact@entreprise.ma" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">TÃ©lÃ©phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+212 6XX XX XX XX" className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Source</label>
              <select name="source" value={form.source} onChange={handleChange} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer">
                <option value="">SÃ©lectionner...</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Statut</label>
              <select name="status" value={form.status} onChange={handleChange} className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all cursor-pointer">
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Contexte, besoins spÃ©cifiques, historique des Ã©changes..."
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button type="submit" disabled={mutation.isLoading} className="py-2.5 px-6 rounded-xl bg-[#C85A2A] hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all disabled:opacity-50 cursor-pointer">
            {mutation.isLoading ? 'Enregistrement...' : isEdit ? 'Mettre Ã  jour' : 'CrÃ©er le Lead'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/leads')} className="py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const ContactForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    account_id: '', first_name: '', last_name: '',
    email: '', phone: '', position: '',
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accountsListSelect'],
    queryFn: async () => {
      const res = await api.get('/api/accounts?per_page=100');
      return res.data.data || [];
    },
  });

  const { isLoading: isFetching } = useQuery({
    queryKey: ['contactEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/contacts/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (c) => {
      setForm({
        account_id: String(c.accountId || ''),
        first_name: c.firstName || '',
        last_name: c.lastName || '',
        email: c.email || '',
        phone: c.phone || '',
        position: c.position || '',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return (await api.put(`/api/contacts/${id}`, data)).data;
      return (await api.post('/api/contacts', data)).data;
    },
    onSuccess: () => {
      showToast(isEdit ? 'Contact mis Ã  jour.' : 'Contact créé.');
      queryClient.invalidateQueries(['contactsList']);
      navigate('/dashboard/contacts');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      showToast(`Erreur : ${msg}`, 'error');
    },
  });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isEdit && isFetching) return <LoadingSpinner fullPage message="Chargement du contact..." />;

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? 'Modifier le Contact' : 'Nouveau Contact'}
        breadcrumb={[{ label: 'CRM' }, { label: 'Contacts', href: '/dashboard/contacts' }, { label: isEdit ? 'Modifier' : 'Nouveau' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Informations du Contact</h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Client <span className="text-red-500">*</span></label>
            <select
              name="account_id"
              value={form.account_id}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
            >
              <option value="">Sélectionner un client...</option>
              {(accountsData || []).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Prénom', name: 'first_name', required: true, placeholder: 'Mohammed' },
              { label: 'Nom', name: 'last_name', required: true, placeholder: 'Alami' },
              { label: 'Poste', name: 'position', placeholder: 'Directeur Technique' },
              { label: 'Téléphone', name: 'phone', placeholder: '+212 6XX XX XX XX' },
            ].map(({ label, name, required, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required={required}
                  placeholder={placeholder}
                  className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@entreprise.ma"
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="py-2.5 px-6 rounded-xl bg-[#C85A2A] hover:bg-[#FDF0EA]0 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutation.isLoading ? 'Enregistrement...' : isEdit ? 'Mettre Ã  jour' : 'Créer le Contact'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/contacts')}
            className="py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;

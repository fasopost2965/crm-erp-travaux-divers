import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const AccountForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '', ice: '', rc: '', patente: '', iff: '',
    email: '', phone: '', address: '', city: '',
  });

  const { isLoading: isFetching } = useQuery({
    queryKey: ['accountEdit', id],
    queryFn: async () => {
      const res = await api.get(`/api/accounts/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
    onSuccess: (acc) => {
      setForm({
        name: acc.name || '',
        ice: acc.ice || '',
        rc: acc.rc || '',
        patente: acc.patente || '',
        iff: acc.iff || '',
        email: acc.email || '',
        phone: acc.phone || '',
        address: acc.address || '',
        city: acc.city || '',
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) {
        const res = await api.put(`/api/accounts/${id}`, data);
        return res.data;
      } else {
        const res = await api.post('/api/accounts', data);
        return res.data;
      }
    },
    onSuccess: (data) => {
      showToast(isEdit ? 'Client mis Ã  jour avec succÃ¨s.' : 'Client crÃ©Ã© avec succÃ¨s.');
      queryClient.invalidateQueries(['accountsList']);
      const accountId = data.data?.id || data.id || id;
      navigate(`/dashboard/accounts/${accountId}`);
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
      name: form.name,
      ice: form.ice,
      rc: form.rc,
      patente: form.patente,
      iff: form.iff,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
    });
  };

  if (isEdit && isFetching) return <LoadingSpinner fullPage message="Chargement du client..." />;

  const Field = ({ label, name, type = 'text', required = false, placeholder = '' }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
      />
    </div>
  );

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={isEdit ? 'Modifier le Client' : 'Nouveau Client'}
        breadcrumb={[{ label: 'CRM' }, { label: 'Clients', href: '/dashboard/accounts' }, { label: isEdit ? 'Modifier' : 'Nouveau' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        {/* Informations gÃ©nÃ©rales */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Informations GÃ©nÃ©rales</h3>
          <Field label="Raison Sociale" name="name" required placeholder="Atlas Works S.A.R.L." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" name="email" type="email" placeholder="contact@entreprise.ma" />
            <Field label="TÃ©lÃ©phone" name="phone" placeholder="+212 5XX XX XX XX" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Adresse" name="address" placeholder="Rue Mohammed V" />
            <Field label="Ville" name="city" placeholder="Casablanca" />
          </div>
        </div>

        {/* Identifiants fiscaux marocains */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3">Identifiants Fiscaux (Maroc)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ICE" name="ice" placeholder="000000000000000" />
            <Field label="RC (Registre du Commerce)" name="rc" placeholder="123456" />
            <Field label="Patente" name="patente" placeholder="98765432" />
            <Field label="IF (Identifiant Fiscal)" name="iff" placeholder="12345678" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="py-2.5 px-6 rounded-xl bg-[#C85A2A] hover:bg-blue-500 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-900/10 transition-all disabled:opacity-50 cursor-pointer"
          >
            {mutation.isLoading ? 'Enregistrement...' : isEdit ? 'Mettre Ã  jour' : 'CrÃ©er le Client'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/accounts')}
            className="py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;

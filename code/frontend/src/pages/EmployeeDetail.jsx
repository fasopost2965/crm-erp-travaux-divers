import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const STATUS_COLORS = {
  'Actif':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Inactif':  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'En congé': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Suspendu': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const CONTRACT_STATUS_COLORS = {
  'En cours': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Expiré':   'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'Résilié':  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const ContractForm = ({ employeeId, onSuccess, onCancel }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    type: 'CDI', start_date: new Date().toISOString().split('T')[0],
    end_date: '', salary: '', reference: '', status: 'En cours', notes: '',
  });

  const mutation = useMutation({
    mutationFn: (payload) => api.post(`/api/employees/${employeeId}/contracts`, payload),
    onSuccess: () => { showToast('Contrat ajouté.'); onSuccess(); },
    onError: (err) => showToast(err.response?.data?.message || 'Erreur.', 'error'),
  });

  return (
    <div className="border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 bg-blue-50/50 dark:bg-blue-950/10 space-y-4">
      <h4 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Nouveau contrat</h4>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'type', label: 'Type', type: 'select', options: ['CDI', 'CDD', 'Interim', 'Freelance', 'Stage'] },
          { key: 'status', label: 'Statut', type: 'select', options: ['En cours', 'Expiré', 'Résilié'] },
          { key: 'start_date', label: 'Date début', type: 'date' },
          { key: 'end_date', label: 'Date fin', type: 'date' },
          { key: 'salary', label: 'Salaire (MAD)', type: 'number' },
          { key: 'reference', label: 'Référence', type: 'text' },
        ].map(({ key, label, type, options }) => (
          <div key={key} className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{label}</label>
            {type === 'select' ? (
              <select
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
          className="block w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex space-x-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
          Annuler
        </button>
        <button
          type="button"
          disabled={mutation.isPending || !form.salary}
          onClick={() => mutation.mutate({ ...form, salary: parseFloat(form.salary), end_date: form.end_date || undefined })}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
        >
          {mutation.isPending ? 'Ajout...' : 'Ajouter le contrat'}
        </button>
      </div>
    </div>
  );
};

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showContractForm, setShowContractForm] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const { data: employee, isLoading, error } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await api.get(`/api/employees/${id}`);
      return res.data.data || res.data;
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['employeeContracts', id],
    queryFn: async () => {
      const res = await api.get(`/api/employees/${id}/contracts`);
      return res.data.data || res.data || [];
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.delete(`/api/employees/${id}`),
    onSuccess: () => {
      showToast('Employé archivé.');
      queryClient.invalidateQueries(['employees']);
      navigate('/dashboard/rh');
    },
    onError: (err) => showToast(err.response?.data?.message || 'Erreur.', 'error'),
  });

  if (isLoading) return <LoadingSpinner fullPage message="Chargement du dossier employé..." />;
  if (error) return <div className="p-6 text-red-600 text-sm">{error.message}</div>;

  const tabs = [
    { key: 'info', label: 'Informations' },
    { key: 'contracts', label: `Contrats (${contracts.length})` },
  ];

  const info = [
    { label: 'Email', value: employee.email },
    { label: 'Téléphone', value: employee.phone },
    { label: 'Département', value: employee.department },
    { label: 'CIN', value: employee.cin },
    { label: 'CNSS', value: employee.cnss },
    { label: "Date d'embauche", value: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-MA') : null },
    { label: 'Date de fin', value: employee.endDate ? new Date(employee.endDate).toLocaleDateString('fr-MA') : null },
    { label: 'Salaire', value: employee.salary ? `${parseFloat(employee.salary).toLocaleString('fr-MA')} MAD / mois` : null },
    { label: 'Adresse', value: employee.address },
  ].filter(i => i.value);

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <PageHeader
        title={employee.fullName}
        breadcrumb={[
          { label: 'RH & Personnel', link: '/dashboard/rh' },
          { label: employee.fullName },
        ]}
        actions={
          <Link
            to={`/dashboard/rh/${id}/edit`}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Modifier
          </Link>
        }
      />

      {/* Card principale */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-2xl flex items-center justify-center shrink-0">
            {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{employee.fullName}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{employee.position}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${STATUS_COLORS[employee.status] || ''}`}>
                {employee.status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {employee.contractType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Informations */}
      {activeTab === 'info' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {info.map(({ label, value }) => (
              <div key={label}>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">{label}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{value}</span>
              </div>
            ))}
          </div>
          {employee.notes && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Notes</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{employee.notes}</p>
            </div>
          )}

          {/* Danger zone */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { if (window.confirm('Archiver cet employé ?')) archiveMutation.mutate(); }}
              disabled={archiveMutation.isPending}
              className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
            >
              Archiver l'employé
            </button>
          </div>
        </div>
      )}

      {/* Tab: Contrats */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            {contracts.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">Aucun contrat enregistré</p>
            ) : (
              <div className="space-y-3">
                {contracts.map((c) => (
                  <div key={c.id} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-800 dark:text-white">{c.type}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${CONTRACT_STATUS_COLORS[c.status] || ''}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {new Date(c.startDate).toLocaleDateString('fr-MA')}
                        {c.endDate ? ` → ${new Date(c.endDate).toLocaleDateString('fr-MA')}` : ' → CDI'}
                      </p>
                      {c.reference && <p className="text-[10px] text-slate-400">Réf : {c.reference}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {parseFloat(c.salary).toLocaleString('fr-MA')} MAD
                      </span>
                      <span className="text-[10px] text-slate-400 block">/mois</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showContractForm ? (
              <ContractForm
                employeeId={id}
                onSuccess={() => {
                  setShowContractForm(false);
                  queryClient.invalidateQueries(['employeeContracts', id]);
                }}
                onCancel={() => setShowContractForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowContractForm(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors cursor-pointer"
              >
                + Ajouter un contrat
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;

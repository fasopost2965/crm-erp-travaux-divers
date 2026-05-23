import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const FIELDS = [
  { key: 'first_name', label: 'Prénom', type: 'text', required: true, span: 1 },
  { key: 'last_name', label: 'Nom de famille', type: 'text', required: true, span: 1 },
  { key: 'email', label: 'Email professionnel', type: 'email', required: false, span: 1 },
  { key: 'phone', label: 'Téléphone', type: 'tel', required: false, span: 1 },
  { key: 'position', label: 'Poste / Titre', type: 'text', required: true, span: 1 },
  { key: 'department', label: 'Département / Service', type: 'text', required: false, span: 1 },
  { key: 'hire_date', label: "Date d'embauche", type: 'date', required: true, span: 1 },
  { key: 'end_date', label: 'Date de fin (si CDD)', type: 'date', required: false, span: 1 },
  { key: 'salary', label: 'Salaire mensuel (MAD)', type: 'number', required: false, span: 1 },
  { key: 'cin', label: 'N° CIN', type: 'text', required: false, span: 1 },
  { key: 'cnss', label: 'N° CNSS', type: 'text', required: false, span: 1 },
  { key: 'address', label: 'Adresse', type: 'text', required: false, span: 2 },
];

const SELECT_FIELDS = {
  contract_type: { label: 'Type de contrat', options: ['CDI', 'CDD', 'Interim', 'Freelance', 'Stage'], required: true },
  status: { label: 'Statut', options: ['Actif', 'Inactif', 'En congé', 'Suspendu'], required: true },
};

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', position: '',
    department: '', contract_type: 'CDI', hire_date: new Date().toISOString().split('T')[0],
    end_date: '', salary: '', status: 'Actif', cin: '', cnss: '', address: '', notes: '',
  });

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      const res = await api.get(`/api/employees/${id}`);
      return res.data.data || res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.firstName || '',
        last_name: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        position: employee.position || '',
        department: employee.department || '',
        contract_type: employee.contractType || 'CDI',
        hire_date: employee.hireDate || '',
        end_date: employee.endDate || '',
        salary: employee.salary || '',
        status: employee.status || 'Actif',
        cin: employee.cin || '',
        cnss: employee.cnss || '',
        address: employee.address || '',
        notes: employee.notes || '',
      });
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) return api.put(`/api/employees/${id}`, payload);
      return api.post('/api/employees', payload);
    },
    onSuccess: (res) => {
      const emp = res.data.data || res.data;
      showToast(isEdit ? 'Employé mis à jour avec succès.' : 'Employé créé avec succès.');
      queryClient.invalidateQueries(['employees']);
      if (isEdit) queryClient.invalidateQueries(['employee', id]);
      navigate(`/dashboard/rh/${emp.id}`);
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Erreur lors de la sauvegarde.', 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.email) delete payload.email;
    if (!payload.end_date) delete payload.end_date;
    if (!payload.salary) delete payload.salary;
    mutation.mutate(payload);
  };

  if (isLoading) return <LoadingSpinner fullPage message="Chargement..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <PageHeader
        title={isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
        breadcrumb={[
          { label: 'RH & Personnel', link: '/dashboard/rh' },
          { label: isEdit ? (employee?.fullName || 'Employé') : 'Nouvel employé' },
        ]}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Identité */}
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Identité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {FIELDS.map(({ key, label, type, required, span }) => (
                <div key={key} className={`space-y-2 ${span === 2 ? 'sm:col-span-2' : ''}`}>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    value={form[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}

              {Object.entries(SELECT_FIELDS).map(([key, { label, options, required }]) => (
                <div key={key} className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                    {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <select
                    required={required}
                    value={form[key]}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                  >
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Notes internes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Compétences spécifiques, remarques RH, équipements attribués..."
              className="block w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/dashboard/rh/${id}` : '/dashboard/rh')}
              className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-900/10 transition-colors cursor-pointer"
            >
              {mutation.isPending ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer l\'employé')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const TYPE_COLORS = {
  CDI: { bg: '#EFF6FF', text: '#1D4ED8' },
  CDD: { bg: '#FDF0EA', text: '#C85A2A' },
  journalier: { bg: '#FEF9C3', text: '#854D0E' },
  sous_traitant: { bg: '#F0FDF4', text: '#166534' },
};

const STATUT_COLORS = {
  actif: { bg: '#F0FDF4', text: '#166534' },
  inactif: { bg: '#F8FAFC', text: '#64748B' },
  conge: { bg: '#FDF0EA', text: '#C85A2A' },
  suspendu: { bg: '#FFF1F2', text: '#BE123C' },
};

const PersonnelList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['personnels', page, search, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page, ...(search && { search }), ...(typeFilter && { type_contrat: typeFilter }) });
      const res = await api.get(`/api/personnels?${params}`);
      return res.data;
    },
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/api/personnels/${id}`); },
    onSuccess: () => {
      showToast('Employé supprimé.');
      queryClient.invalidateQueries(['personnels']);
      setIsDeleteOpen(false);
    },
    onError: () => showToast('Erreur lors de la suppression.', 'error'),
  });

  const rawData = responseData?.data || [];
  const meta = responseData?.meta || { current_page: 1, last_page: 1, total: 0 };

  const fmt = (n) => n ? new Intl.NumberFormat('fr-MA').format(n) + ' MAD' : '—';

  const columns = [
    {
      header: 'Matricule',
      accessor: 'matricule',
      cell: (row) => <span className="font-extrabold text-[#C85A2A] text-[11px]">{row.matricule}</span>,
    },
    {
      header: 'Nom & Prénom',
      accessor: 'nom',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800 text-[12px]">{row.prenom} {row.nom}</p>
          <p className="text-[10px] text-slate-400">{row.poste || row.specialite || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Contrat',
      accessor: 'type_contrat',
      cell: (row) => {
        const c = TYPE_COLORS[row.type_contrat] || { bg: '#F8FAFC', text: '#64748B' };
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: c.bg, color: c.text }}>
            {row.type_contrat}
          </span>
        );
      },
    },
    {
      header: 'Taux / Salaire',
      accessor: 'taux_journalier',
      cell: (row) => (
        <span className="text-[12px] font-semibold text-slate-700">
          {row.type_contrat === 'journalier' ? fmt(row.taux_journalier) + '/j' : fmt(row.salaire_base) + '/mois'}
        </span>
      ),
    },
    {
      header: 'Contact',
      accessor: 'telephone',
      cell: (row) => (
        <span className="text-[11px] text-slate-500">{row.telephone || '—'}</span>
      ),
    },
    {
      header: 'Statut',
      accessor: 'statut',
      cell: (row) => {
        const c = STATUT_COLORS[row.statut] || { bg: '#F8FAFC', text: '#64748B' };
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: c.bg, color: c.text }}>
            {row.statut}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setEditTarget(row); setShowForm(true); }}
            className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
            title="Éditer"
          >✏️</button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setIsDeleteOpen(true); }}
            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
            title="Supprimer"
          >🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 font-sans">
      <PageHeader
        title="RH — Registre du Personnel"
        breadcrumb={[{ label: 'RH & Paie' }, { label: 'Personnel' }]}
        actions={
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="py-2 px-4 rounded-lg bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-[11px] tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>+ Ajouter employé</span>
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, CIN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="block w-full pl-3 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A] focus:border-transparent transition-all"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-full md:w-44 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A] cursor-pointer"
        >
          <option value="">Tous les contrats</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="journalier">Journalier</option>
          <option value="sous_traitant">Sous-traitant</option>
        </select>
        {(search || typeFilter) && (
          <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="text-[11px] text-slate-500 hover:text-[#C85A2A] cursor-pointer">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total effectif', val: meta.total || 0, color: '#C85A2A' },
          { label: 'CDI/CDD', val: (rawData.filter(p => p.type_contrat === 'CDI' || p.type_contrat === 'CDD').length), color: '#1D4ED8' },
          { label: 'Journaliers', val: rawData.filter(p => p.type_contrat === 'journalier').length, color: '#854D0E' },
          { label: 'Sous-traitants', val: rawData.filter(p => p.type_contrat === 'sous_traitant').length, color: '#166534' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm" style={{ borderTop: `2px solid ${s.color}` }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl p-8"><LoadingSpinner message="Chargement du personnel..." /></div>
      ) : (
        <DataTable
          columns={columns}
          data={rawData}
          emptyTitle="Aucun employé"
          emptyDescription="Ajoutez votre premier employé pour commencer."
          paginationMeta={{ currentPage: meta.current_page, lastPage: meta.last_page, total: meta.total }}
          onPageChange={setPage}
        />
      )}

      {showForm && (
        <PersonnelFormModal
          personnel={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { queryClient.invalidateQueries(['personnels']); setShowForm(false); setEditTarget(null); }}
          showToast={showToast}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer cet employé ?"
        message={`Voulez-vous supprimer ${deleteTarget?.prenom} ${deleteTarget?.nom} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        loading={deleteMutation.isLoading}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};

const PersonnelFormModal = ({ personnel, onClose, onSaved, showToast }) => {
  const [form, setForm] = useState({
    nom: personnel?.nom || '',
    prenom: personnel?.prenom || '',
    cin: personnel?.cin || '',
    telephone: personnel?.telephone || '',
    email: personnel?.email || '',
    type_contrat: personnel?.type_contrat || 'CDI',
    poste: personnel?.poste || '',
    specialite: personnel?.specialite || '',
    taux_journalier: personnel?.taux_journalier || '',
    salaire_base: personnel?.salaire_base || '',
    numero_cnss: personnel?.numero_cnss || '',
    date_embauche: personnel?.date_embauche?.split('T')[0] || '',
    statut: personnel?.statut || 'actif',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (personnel?.id) {
        await api.put(`/api/personnels/${personnel.id}`, form);
        showToast('Employé mis à jour.');
      } else {
        await api.post('/api/personnels', form);
        showToast('Employé créé.');
      }
      onSaved();
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, name, type = 'text', options = null, required = false }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}{required && ' *'}</label>
      {options ? (
        <select
          value={form[name]}
          onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
        >
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[name]}
          onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
          required={required}
          className="block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#1C1C1C' }}>
          <h2 className="text-sm font-bold text-white">{personnel ? 'Modifier employé' : 'Nouvel employé'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <F label="Prénom" name="prenom" required />
          <F label="Nom" name="nom" required />
          <F label="CIN" name="cin" />
          <F label="Téléphone" name="telephone" />
          <F label="Email" name="email" type="email" />
          <F label="Poste" name="poste" />
          <F label="Spécialité" name="specialite" />
          <F label="Type de contrat" name="type_contrat" options={[
            { v: 'CDI', l: 'CDI' }, { v: 'CDD', l: 'CDD' },
            { v: 'journalier', l: 'Journalier' }, { v: 'sous_traitant', l: 'Sous-traitant' },
          ]} />
          <F label="Taux journalier (MAD)" name="taux_journalier" type="number" />
          <F label="Salaire de base (MAD)" name="salaire_base" type="number" />
          <F label="N° CNSS" name="numero_cnss" />
          <F label="Date d'embauche" name="date_embauche" type="date" />
          <F label="Statut" name="statut" options={[
            { v: 'actif', l: 'Actif' }, { v: 'inactif', l: 'Inactif' },
            { v: 'conge', l: 'En congé' }, { v: 'suspendu', l: 'Suspendu' },
          ]} />
          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer hover:bg-slate-50 transition-all">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-[#C85A2A] hover:bg-[#A8481F] text-white text-[11px] font-bold cursor-pointer transition-all disabled:opacity-60">
              {loading ? 'Enregistrement...' : (personnel ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelList;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../components/common/NotificationToast';

const ENGIN_TYPES = ['grue', 'pelleteuse', 'camion', 'compacteur', 'pompe_beton', 'echafaudage', 'autre'];

const STATUT_COLORS = {
  disponible: { bg: '#F0FDF4', text: '#166534' },
  en_chantier: { bg: '#FDF0EA', text: '#C85A2A' },
  en_maintenance: { bg: '#FFF7ED', text: '#C2410C' },
  retire: { bg: '#F8FAFC', text: '#94A3B8' },
};

const TYPE_ICONS = {
  grue: '🏗️', pelleteuse: '🚜', camion: '🚛', compacteur: '🛞',
  pompe_beton: '🏭', echafaudage: '🔧', autre: '⚙️',
};

const ParcEngins = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [statutFilter, setStatutFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: responseData, isLoading } = useQuery({
    queryKey: ['engins', statutFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(statutFilter && { statut: statutFilter }) });
      const res = await api.get(`/api/engins?${params}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => { await api.delete(`/api/engins/${id}`); },
    onSuccess: () => {
      showToast('Engin supprimé.');
      queryClient.invalidateQueries(['engins']);
      setIsDeleteOpen(false);
    },
  });

  const rawData = responseData?.data || [];
  const meta = responseData?.meta || {};

  const fmt = (n) => n ? new Intl.NumberFormat('fr-MA').format(n) + ' MAD/j' : '—';

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => <span className="font-extrabold text-[#C85A2A] text-[11px]">{row.code}</span>,
    },
    {
      header: 'Désignation',
      accessor: 'designation',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-base">{TYPE_ICONS[row.type] || '⚙️'}</span>
          <div>
            <p className="font-bold text-slate-800 text-[12px]">{row.designation}</p>
            <p className="text-[10px] text-slate-400">{row.marque} {row.modele}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (row) => <span className="text-[11px] text-slate-600 capitalize">{row.type.replace('_', ' ')}</span>,
    },
    {
      header: 'Immat.',
      accessor: 'immatriculation',
      cell: (row) => <span className="text-[11px] font-mono text-slate-600">{row.immatriculation || '—'}</span>,
    },
    {
      header: 'Taux loc.',
      accessor: 'taux_location_journalier',
      cell: (row) => <span className="text-[12px] font-semibold text-slate-700">{fmt(row.taux_location_journalier)}</span>,
    },
    {
      header: 'Prochaine révision',
      accessor: 'prochaine_revision',
      cell: (row) => {
        if (!row.prochaine_revision) return <span className="text-[11px] text-slate-400">—</span>;
        const d = new Date(row.prochaine_revision);
        const isUrgent = d < new Date(Date.now() + 30 * 86400000);
        return <span className={`text-[11px] font-semibold ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>{d.toLocaleDateString('fr-FR')}</span>;
      },
    },
    {
      header: 'Statut',
      accessor: 'statut',
      cell: (row) => {
        const c = STATUT_COLORS[row.statut] || { bg: '#F8FAFC', text: '#64748B' };
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: c.bg, color: c.text }}>
            {row.statut.replace('_', ' ')}
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
          >✏️</button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); setIsDeleteOpen(true); }}
            className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 cursor-pointer transition-colors"
          >🗑️</button>
        </div>
      ),
    },
  ];

  const statsByStatut = ENGIN_TYPES.reduce((acc, t) => {
    acc[t] = rawData.filter(e => e.type === t).length;
    return acc;
  }, {});

  const kpis = [
    { label: 'Parc total', val: meta.total || rawData.length, color: '#1C1C1C' },
    { label: 'Disponibles', val: rawData.filter(e => e.statut === 'disponible').length, color: '#166534' },
    { label: 'En chantier', val: rawData.filter(e => e.statut === 'en_chantier').length, color: '#C85A2A' },
    { label: 'En maintenance', val: rawData.filter(e => e.statut === 'en_maintenance').length, color: '#C2410C' },
  ];

  return (
    <div className="space-y-5 font-sans">
      <PageHeader
        title="Parc Engins & Matériel"
        breadcrumb={[{ label: 'Équipements' }, { label: 'Parc Engins' }]}
        actions={
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="py-2 px-4 rounded-lg bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-[11px] tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <span>+ Nouvel engin</span>
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm" style={{ borderTop: `2px solid ${k.color}` }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-2xl font-black text-slate-900">{k.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
        <span className="text-[11px] font-semibold text-slate-500">Filtrer par statut :</span>
        {['', 'disponible', 'en_chantier', 'en_maintenance', 'retire'].map(s => (
          <button
            key={s}
            onClick={() => setStatutFilter(s)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all"
            style={{
              backgroundColor: statutFilter === s ? '#1C1C1C' : '#F8FAFC',
              color: statutFilter === s ? '#FFFFFF' : '#64748B',
            }}
          >
            {s || 'Tous'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-100 rounded-xl p-8"><LoadingSpinner message="Chargement du parc..." /></div>
      ) : (
        <DataTable columns={columns} data={rawData} emptyTitle="Aucun engin" emptyDescription="Commencez par ajouter votre premier engin." />
      )}

      {showForm && (
        <EnginFormModal
          engin={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSaved={() => { queryClient.invalidateQueries(['engins']); setShowForm(false); setEditTarget(null); }}
          showToast={showToast}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Supprimer cet engin ?"
        message={`Supprimer ${deleteTarget?.designation} ? Cette action est irréversible.`}
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

const EnginFormModal = ({ engin, onClose, onSaved, showToast }) => {
  const [form, setForm] = useState({
    designation: engin?.designation || '',
    type: engin?.type || 'autre',
    marque: engin?.marque || '',
    modele: engin?.modele || '',
    immatriculation: engin?.immatriculation || '',
    annee_fabrication: engin?.annee_fabrication || '',
    taux_location_journalier: engin?.taux_location_journalier || '',
    statut: engin?.statut || 'disponible',
    prochaine_revision: engin?.prochaine_revision?.split('T')[0] || '',
    observations: engin?.observations || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (engin?.id) {
        await api.put(`/api/engins/${engin.id}`, form);
        showToast('Engin mis à jour.');
      } else {
        await api.post('/api/engins', form);
        showToast('Engin créé.');
      }
      onSaved();
    } catch {
      showToast('Erreur lors de l\'enregistrement.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, name, type = 'text', options = null }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</label>
      {options ? (
        <select value={form[name]} onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A]">
          {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name]} onChange={(e) => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="block w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A]" />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100" style={{ backgroundColor: '#1C1C1C' }}>
          <h2 className="text-sm font-bold text-white">{engin ? 'Modifier engin' : 'Nouvel engin'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2"><F label="Désignation *" name="designation" /></div>
          <F label="Type" name="type" options={ENGIN_TYPES.map(t => ({ v: t, l: t.replace('_', ' ') }))} />
          <F label="Marque" name="marque" />
          <F label="Modèle" name="modele" />
          <F label="Immatriculation" name="immatriculation" />
          <F label="Année fabrication" name="annee_fabrication" type="number" />
          <F label="Taux location/jour (MAD)" name="taux_location_journalier" type="number" />
          <F label="Statut" name="statut" options={[
            { v: 'disponible', l: 'Disponible' }, { v: 'en_chantier', l: 'En chantier' },
            { v: 'en_maintenance', l: 'En maintenance' }, { v: 'retire', l: 'Retiré' },
          ]} />
          <F label="Prochaine révision" name="prochaine_revision" type="date" />
          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer hover:bg-slate-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-[#C85A2A] hover:bg-[#A8481F] text-white text-[11px] font-bold cursor-pointer disabled:opacity-60">
              {loading ? 'Enregistrement...' : (engin ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParcEngins;

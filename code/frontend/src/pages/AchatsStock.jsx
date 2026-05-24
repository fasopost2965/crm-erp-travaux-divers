import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/NotificationToast';

const TABS = ['Bons de commande', 'Articles & Stock', 'Fournisseurs'];

const STATUT_BC_COLORS = {
  brouillon: { bg: '#F8FAFC', text: '#64748B' },
  envoye: { bg: '#EFF6FF', text: '#1D4ED8' },
  en_cours: { bg: '#FDF0EA', text: '#C85A2A' },
  livre: { bg: '#F0FDF4', text: '#166534' },
  annule: { bg: '#FFF1F2', text: '#BE123C' },
};

const AchatsStock = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [statutBC, setStatutBC] = useState('');
  const [searchArticle, setSearchArticle] = useState('');
  const [showBCForm, setShowBCForm] = useState(false);

  const { data: bonsData, isLoading: loadingBC } = useQuery({
    queryKey: ['bons-commande', statutBC],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(statutBC && { statut: statutBC }) });
      const res = await api.get(`/api/stock/bons-commande?${params}`);
      return res.data;
    },
    enabled: activeTab === 0,
  });

  const { data: articlesData, isLoading: loadingArticles } = useQuery({
    queryKey: ['articles', searchArticle],
    queryFn: async () => {
      const params = new URLSearchParams({ ...(searchArticle && { search: searchArticle }) });
      const res = await api.get(`/api/stock/articles?${params}`);
      return res.data;
    },
    enabled: activeTab === 1,
  });

  const { data: fournisseursData } = useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => { const res = await api.get('/api/stock/fournisseurs'); return res.data; },
    enabled: activeTab === 2,
  });

  const fmt = (n) => new Intl.NumberFormat('fr-MA').format(n || 0) + ' MAD';

  const bcColumns = [
    {
      header: 'N° BC',
      accessor: 'numero',
      cell: (row) => <span className="font-extrabold text-[#C85A2A] text-[11px]">{row.numero}</span>,
    },
    {
      header: 'Fournisseur',
      accessor: 'fournisseur',
      cell: (row) => <span className="text-[12px] font-semibold text-slate-800">{row.fournisseur?.raison_sociale || '—'}</span>,
    },
    {
      header: 'Chantier',
      accessor: 'project',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.project?.name || '—'}</span>,
    },
    {
      header: 'Date commande',
      accessor: 'date_commande',
      cell: (row) => <span className="text-[11px] text-slate-500">{new Date(row.date_commande).toLocaleDateString('fr-FR')}</span>,
    },
    {
      header: 'Montant TTC',
      accessor: 'montant_ttc',
      cell: (row) => <span className="text-[12px] font-black text-slate-800">{fmt(row.montant_ttc)}</span>,
    },
    {
      header: 'Livraison prévue',
      accessor: 'date_livraison_prevue',
      cell: (row) => {
        if (!row.date_livraison_prevue) return <span className="text-[11px] text-slate-400">—</span>;
        const d = new Date(row.date_livraison_prevue);
        const overdue = d < new Date() && row.statut !== 'livre';
        return <span className={`text-[11px] font-semibold ${overdue ? 'text-red-600' : 'text-slate-600'}`}>{d.toLocaleDateString('fr-FR')}</span>;
      },
    },
    {
      header: 'Statut',
      accessor: 'statut',
      cell: (row) => {
        const c = STATUT_BC_COLORS[row.statut] || { bg: '#F8FAFC', text: '#64748B' };
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: c.bg, color: c.text }}>{row.statut}</span>;
      },
    },
  ];

  const articleColumns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => <span className="font-extrabold text-[#C85A2A] text-[11px]">{row.code}</span>,
    },
    {
      header: 'Désignation',
      accessor: 'designation',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-800 text-[12px]">{row.designation}</p>
          <p className="text-[10px] text-slate-400">{row.categorie || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Unité',
      accessor: 'unite',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.unite}</span>,
    },
    {
      header: 'Stock actuel',
      accessor: 'stock_actuel',
      cell: (row) => {
        const enRupture = parseFloat(row.stock_actuel) <= parseFloat(row.stock_min);
        return (
          <div className="flex items-center gap-1.5">
            <span className={`text-[12px] font-black ${enRupture ? 'text-red-600' : 'text-slate-800'}`}>
              {row.stock_actuel} {row.unite}
            </span>
            {enRupture && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-bold">RUPTURE</span>}
          </div>
        );
      },
    },
    {
      header: 'Stock min.',
      accessor: 'stock_min',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.stock_min} {row.unite}</span>,
    },
    {
      header: 'P.U.',
      accessor: 'prix_unitaire',
      cell: (row) => <span className="text-[12px] font-semibold text-slate-700">{fmt(row.prix_unitaire)}</span>,
    },
    {
      header: 'Valeur stock',
      accessor: 'val',
      cell: (row) => <span className="text-[12px] font-bold text-slate-800">{fmt(row.stock_actuel * row.prix_unitaire)}</span>,
    },
  ];

  const fournisseurColumns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (row) => <span className="font-extrabold text-[#C85A2A] text-[11px]">{row.code}</span>,
    },
    {
      header: 'Raison sociale',
      accessor: 'raison_sociale',
      cell: (row) => <span className="font-semibold text-slate-800 text-[12px]">{row.raison_sociale}</span>,
    },
    {
      header: 'ICE',
      accessor: 'ice',
      cell: (row) => <span className="text-[11px] font-mono text-slate-500">{row.ice || '—'}</span>,
    },
    {
      header: 'Catégorie',
      accessor: 'categorie',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.categorie || '—'}</span>,
    },
    {
      header: 'Téléphone',
      accessor: 'telephone',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.telephone || '—'}</span>,
    },
    {
      header: 'Ville',
      accessor: 'ville',
      cell: (row) => <span className="text-[11px] text-slate-500">{row.ville || '—'}</span>,
    },
  ];

  const stats = articlesData?.stats || {};

  return (
    <div className="space-y-5 font-sans">
      <PageHeader
        title="Achats & Stock"
        breadcrumb={[{ label: 'Achats' }, { label: 'Stock' }]}
        actions={
          activeTab === 0 ? (
            <button
              onClick={() => setShowBCForm(true)}
              className="py-2 px-4 rounded-lg bg-[#C85A2A] hover:bg-[#A8481F] text-white font-bold text-[11px] tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>+ Bon de commande</span>
            </button>
          ) : null
        }
      />

      {activeTab === 1 && stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total articles', val: stats.total_articles || 0, color: '#1C1C1C' },
            { label: 'En rupture', val: stats.en_rupture || 0, color: '#DC2626' },
            { label: 'Valeur totale stock', val: new Intl.NumberFormat('fr-MA').format(stats.valeur_stock || 0) + ' MAD', color: '#166534' },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm" style={{ borderTop: `2px solid ${k.color}` }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
              <p className="text-xl font-black text-slate-900">{k.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm">
        <div className="flex border-b border-slate-100">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="px-5 py-3 text-[11px] font-bold transition-all cursor-pointer"
              style={{
                color: activeTab === i ? '#C85A2A' : '#94A3B8',
                borderBottom: activeTab === i ? '2px solid #C85A2A' : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">Statut :</span>
                {['', 'brouillon', 'envoye', 'en_cours', 'livre', 'annule'].map(s => (
                  <button key={s} onClick={() => setStatutBC(s)}
                    className="px-3 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-all"
                    style={{ backgroundColor: statutBC === s ? '#1C1C1C' : '#F8FAFC', color: statutBC === s ? '#FFF' : '#64748B' }}>
                    {s || 'Tous'}
                  </button>
                ))}
              </div>
              {loadingBC ? <LoadingSpinner message="Chargement des BCs..." /> : (
                <DataTable columns={bcColumns} data={bonsData?.data || []} emptyTitle="Aucun bon de commande" emptyDescription="Créez votre premier bon de commande." />
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                className="block w-full md:w-72 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C85A2A]"
              />
              {loadingArticles ? <LoadingSpinner message="Chargement articles..." /> : (
                <DataTable columns={articleColumns} data={articlesData?.data || []} emptyTitle="Aucun article" emptyDescription="Ajoutez vos premiers articles au catalogue." />
              )}
            </div>
          )}

          {activeTab === 2 && (
            <DataTable columns={fournisseurColumns} data={fournisseursData?.data || []} emptyTitle="Aucun fournisseur" emptyDescription="Ajoutez vos fournisseurs pour les bons de commande." />
          )}
        </div>
      </div>
    </div>
  );
};

export default AchatsStock;

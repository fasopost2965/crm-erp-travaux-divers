import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const fmt = (n) => new Intl.NumberFormat('fr-MA').format(Math.round(n || 0)) + ' MAD';

const MOCK_DECAISSEMENTS = {
  1: [
    { date: '2026-05-01', desc: 'Paie équipe — mai', cat: 'Paie', montant: -48000 },
    { date: '2026-05-05', desc: 'Achat matériaux SGTM', cat: 'Achats', montant: -32000 },
    { date: '2026-05-15', desc: 'CNSS mai', cat: 'Charges', montant: -8500 },
  ],
  2: [
    { date: '2026-05-02', desc: 'Paie équipe — mai', cat: 'Paie', montant: -36000 },
    { date: '2026-05-08', desc: 'Achat béton préfabriqué', cat: 'Achats', montant: -21000 },
  ],
  3: [
    { date: '2026-05-03', desc: 'Paie équipe — mai', cat: 'Paie', montant: -52000 },
    { date: '2026-05-10', desc: 'Achat charpente', cat: 'Achats', montant: -87000 },
    { date: '2026-05-15', desc: 'CNSS mai', cat: 'Charges', montant: -11200 },
  ],
};

const STATUS_COLORS = {
  'En cours': '#2D8A5E',
  'Terminé': '#2A6CB8',
  'En attente': '#BA7517',
  'Annulé': '#C84242',
};

const BADGE_STYLES = {
  'Payée': { background: '#DCFCE7', color: '#2D8A5E' },
  'Impayée': { background: '#FEE2E2', color: '#C84242' },
  'Partielle': { background: '#FEF3C7', color: '#BA7517' },
  'Partiellement Payée': { background: '#FEF3C7', color: '#BA7517' },
  default: { background: '#F3F4F6', color: '#71717A' },
};

function Badge({ label, style }) {
  const s = BADGE_STYLES[label] || BADGE_STYLES.default;
  const merged = { fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600, ...s, ...style };
  return <span style={merged}>{label}</span>;
}

function KpiCard({ label, value, borderColor, sub }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      borderTop: `2px solid ${borderColor}`,
      border: '0.5px solid #E4E4E7',
      borderTopWidth: 2,
      borderTopColor: borderColor,
      padding: '14px 18px',
      minWidth: 0,
    }}>
      <p style={{ fontSize: 11, color: '#71717A', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#18181B', letterSpacing: '-0.5px' }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: '#71717A', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

export default function Tresorerie() {
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: projectsData, isLoading: projLoading } = useQuery({
    queryKey: ['tresorerie-projects'],
    queryFn: async () => {
      const res = await api.get('/api/projects');
      return res.data?.data || res.data || [];
    },
  });

  const { data: invoicesData, isLoading: invLoading } = useQuery({
    queryKey: ['tresorerie-invoices'],
    queryFn: async () => {
      const res = await api.get('/api/invoices');
      return res.data?.data || res.data || [];
    },
  });

  const projects = projectsData || [];
  const invoices = invoicesData || [];

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const paidThisMonth = invoices
    .filter((inv) => {
      const status = (inv.status || '').toLowerCase();
      if (!status.includes('pay')) return false;
      const d = inv.due_date || inv.dueDate || '';
      if (!d) return false;
      const dt = new Date(d);
      return dt.getMonth() === thisMonth && dt.getFullYear() === thisYear;
    })
    .reduce((s, inv) => s + parseFloat(inv.total_ttc || inv.totalTtc || 0), 0);

  const decaissements = 850000;

  const unpaid = invoices
    .filter((inv) => {
      const status = (inv.status || '').toLowerCase();
      return !status.includes('pay') || status.includes('partiel');
    })
    .reduce((s, inv) => s + parseFloat(inv.total_ttc || inv.totalTtc || 0), 0);

  const solde = paidThisMonth - decaissements;

  // Build transactions for selected project
  const selectedProj = projects.find((p) => p.id === selectedProject);
  const projInvoices = selectedProject
    ? invoices.filter((inv) => {
        const pid = inv.project_id || inv.project?.id;
        return pid === selectedProject;
      })
    : [];

  const encaissements = projInvoices.map((inv) => ({
    date: inv.due_date || inv.dueDate || '',
    desc: inv.invoice_number || inv.invoiceNumber || `Facture #${inv.id}`,
    cat: 'Encaissement',
    montant: parseFloat(inv.total_ttc || inv.totalTtc || 0),
    statut: inv.status || 'En attente',
    isEnc: true,
  }));

  const mockDec = (MOCK_DECAISSEMENTS[selectedProject] || []).map((d) => ({
    ...d,
    statut: 'Réglé',
    isEnc: false,
  }));

  const transactions = [...encaissements, ...mockDec].sort((a, b) =>
    (a.date || '').localeCompare(b.date || '')
  );

  const projBalance =
    encaissements.reduce((s, t) => s + t.montant, 0) +
    mockDec.reduce((s, t) => s + t.montant, 0);

  const isLoading = projLoading || invLoading;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F4F4F5', minHeight: '100vh', padding: 0 }}>
      {/* Title bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E4E4E7', padding: '14px 24px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: 0 }}>Trésorerie</p>
        <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Flux financiers par chantier</p>
      </div>

      <div style={{ padding: 20 }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <KpiCard
            label="Encaissements du mois"
            value={fmt(paidThisMonth)}
            borderColor="#2D8A5E"
            sub="Factures payées ce mois"
          />
          <KpiCard
            label="Décaissements du mois"
            value={fmt(decaissements)}
            borderColor="#C84242"
            sub="Charges & achats"
          />
          <KpiCard
            label="Solde prévisionnel"
            value={fmt(solde)}
            borderColor="#C85A2A"
            sub={solde >= 0 ? 'Positif' : 'Déficitaire'}
          />
          <KpiCard
            label="Créances en cours"
            value={fmt(unpaid)}
            borderColor="#2A6CB8"
            sub="Factures non réglées"
          />
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Project list */}
          <div style={{
            width: 240,
            flexShrink: 0,
            background: '#fff',
            border: '0.5px solid #E4E4E7',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Chantiers
              </p>
            </div>
            {isLoading ? (
              <p style={{ padding: 16, fontSize: 12, color: '#71717A' }}>Chargement…</p>
            ) : projects.length === 0 ? (
              <p style={{ padding: 16, fontSize: 12, color: '#71717A' }}>Aucun chantier</p>
            ) : (
              projects.map((proj) => {
                const isActive = proj.id === selectedProject;
                const dotColor = STATUS_COLORS[proj.status] || '#71717A';
                const projInvs = invoices.filter((inv) => {
                  const pid = inv.project_id || inv.project?.id;
                  return pid === proj.id;
                });
                const balance = projInvs.reduce((s, inv) => s + parseFloat(inv.total_ttc || inv.totalTtc || 0), 0);
                return (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj.id)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderLeft: isActive ? '3px solid #C85A2A' : '3px solid transparent',
                      background: isActive ? '#FDF0EA' : '#fff',
                      borderBottom: '0.5px solid #E4E4E7',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0, flex: 1 }}>
                        {proj.name}
                      </p>
                    </div>
                    <div style={{ paddingLeft: 14 }}>
                      <span style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 8,
                        fontWeight: 600,
                        background: balance >= 0 ? '#DCFCE7' : '#FEE2E2',
                        color: balance >= 0 ? '#2D8A5E' : '#C84242',
                      }}>
                        {fmt(balance)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {!selectedProject ? (
              <div style={{
                background: '#fff',
                border: '0.5px solid #E4E4E7',
                borderRadius: 10,
                padding: 40,
                textAlign: 'center',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E4E4E7" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                </svg>
                <p style={{ fontSize: 13, color: '#71717A' }}>Sélectionnez un chantier pour afficher les flux</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden' }}>
                {/* Dark topbar */}
                <div style={{ background: '#1C1C1C', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{selectedProj?.name || 'Chantier'}</p>
                    <p style={{ fontSize: 10, color: '#A1A1AA', margin: 0 }}>Flux de trésorerie</p>
                  </div>
                  <Badge label={selectedProj?.status || 'En cours'} style={{ background: '#2A3A2A', color: '#6EE7A0' }} />
                </div>

                {/* Transaction table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E4E4E7' }}>
                        {['Date', 'Désignation', 'Catégorie', 'Montant', 'Statut'].map((h) => (
                          <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#71717A', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px 12px', textAlign: 'center', color: '#71717A', fontSize: 12 }}>
                            Aucune transaction pour ce chantier
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t, i) => (
                          <tr key={i} style={{ borderBottom: '0.5px solid #F4F4F5' }}>
                            <td style={{ padding: '8px 12px', color: '#71717A', whiteSpace: 'nowrap' }}>
                              {t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '—'}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#18181B', fontWeight: 500 }}>{t.desc}</td>
                            <td style={{ padding: '8px 12px' }}>
                              <span style={{
                                fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600,
                                background: t.isEnc ? '#EFF6FF' : '#F9F1FF',
                                color: t.isEnc ? '#2A6CB8' : '#7C3AED',
                              }}>
                                {t.cat}
                              </span>
                            </td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, whiteSpace: 'nowrap', color: t.isEnc ? '#2D8A5E' : '#C84242' }}>
                              {t.isEnc ? '+' : ''}{fmt(t.montant)}
                            </td>
                            <td style={{ padding: '8px 12px' }}>
                              <Badge label={t.statut} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Balance bar */}
                <div style={{ padding: '14px 16px', borderTop: '0.5px solid #E4E4E7', background: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Solde chantier :</p>
                  <div style={{ flex: 1, height: 8, background: '#E4E4E7', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, Math.abs(projBalance) / 100000 * 100)}%`,
                      background: projBalance >= 0 ? '#2D8A5E' : '#C84242',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: projBalance >= 0 ? '#2D8A5E' : '#C84242', margin: 0, whiteSpace: 'nowrap' }}>
                    {projBalance >= 0 ? '+' : ''}{fmt(projBalance)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

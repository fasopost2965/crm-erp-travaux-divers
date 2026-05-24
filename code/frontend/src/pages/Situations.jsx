import React, { useState } from 'react';

const fmt = (n) => new Intl.NumberFormat('fr-MA').format(Math.round(n || 0)) + ' MAD';

const MOCK_SITUATIONS = [
  {
    id: 1,
    numero: 'SIT-001',
    chantier: 'Résidence Al Fath',
    periode: 'Mai 2026',
    avancement: 65,
    montantHT: 480000,
    tva: 96000,
    retenue: 48000,
    netAPayer: 528000,
    statut: 'Validée',
    postes: [
      { designation: 'Maçonnerie & coffrage', qte: 450, puHT: 650, pctPrecedent: 40, pctCeMois: 25 },
      { designation: 'Ferraillage', qte: 12000, puHT: 8.5, pctPrecedent: 50, pctCeMois: 15 },
      { designation: 'Béton armé (m³)', qte: 180, puHT: 1200, pctPrecedent: 30, pctCeMois: 20 },
    ],
  },
  {
    id: 2,
    numero: 'SIT-002',
    chantier: 'Villa Aïn Diab',
    periode: 'Mai 2026',
    avancement: 42,
    montantHT: 215000,
    tva: 43000,
    retenue: 21500,
    netAPayer: 236500,
    statut: 'Soumise',
    postes: [
      { designation: 'Gros œuvre', qte: 1, puHT: 180000, pctPrecedent: 25, pctCeMois: 17 },
      { designation: 'Électricité courants forts', qte: 1, puHT: 85000, pctPrecedent: 0, pctCeMois: 15 },
    ],
  },
  {
    id: 3,
    numero: 'SIT-003',
    chantier: 'Entrepôt Aïn Sebaâ',
    periode: 'Avr 2026',
    avancement: 88,
    montantHT: 695000,
    tva: 139000,
    retenue: 69500,
    netAPayer: 764500,
    statut: 'Facturée',
    postes: [
      { designation: 'Charpente métallique', qte: 1, puHT: 420000, pctPrecedent: 60, pctCeMois: 28 },
      { designation: 'Toiture & étanchéité', qte: 1, puHT: 275000, pctPrecedent: 50, pctCeMois: 38 },
    ],
  },
];

const STATUT_STYLES = {
  Brouillon: { background: '#F3F4F6', color: '#71717A' },
  Soumise: { background: '#EFF6FF', color: '#2A6CB8' },
  Validée: { background: '#DCFCE7', color: '#2D8A5E' },
  Facturée: { background: '#FDF0EA', color: '#C85A2A' },
};

function StatutBadge({ statut }) {
  const s = STATUT_STYLES[statut] || STATUT_STYLES.Brouillon;
  return (
    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600, ...s }}>
      {statut}
    </span>
  );
}

function ProgressBar({ value }) {
  const color = value >= 80 ? '#2D8A5E' : value >= 50 ? '#C85A2A' : '#BA7517';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#E4E4E7', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32 }}>{value}%</span>
    </div>
  );
}

function Toast({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1C1C1C', color: '#fff',
      padding: '12px 20px', borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'fadeInUp 0.2s ease',
    }}>
      <span style={{ color: '#2D8A5E' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  );
}

export default function Situations() {
  const [selectedSituation, setSelectedSituation] = useState(null);
  const [filterChantier, setFilterChantier] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterPeriode, setFilterPeriode] = useState('');
  const [toast, setToast] = useState(null);

  const chantiers = [...new Set(MOCK_SITUATIONS.map((s) => s.chantier))];
  const periodes = [...new Set(MOCK_SITUATIONS.map((s) => s.periode))];

  const filtered = MOCK_SITUATIONS.filter((s) => {
    if (filterChantier && s.chantier !== filterChantier) return false;
    if (filterStatut && s.statut !== filterStatut) return false;
    if (filterPeriode && s.periode !== filterPeriode) return false;
    return true;
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const detail = selectedSituation
    ? MOCK_SITUATIONS.find((s) => s.id === selectedSituation)
    : null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F4F4F5', minHeight: '100vh' }}>
      {/* Title bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E4E4E7', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: 0 }}>Situations de Travaux</p>
          <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Facturation d'avancement mensuel</p>
        </div>
        <button
          onClick={() => showToast('Formulaire nouvelle situation — à implémenter')}
          style={{
            background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 8,
            padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouvelle situation
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {/* Filter bar */}
        <div style={{
          background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10,
          padding: '10px 14px', marginBottom: 14,
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <select
            value={filterChantier}
            onChange={(e) => setFilterChantier(e.target.value)}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, border: '0.5px solid #E4E4E7', color: '#18181B', background: '#FAFAFA', cursor: 'pointer' }}
          >
            <option value="">Tous les chantiers</option>
            {chantiers.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, border: '0.5px solid #E4E4E7', color: '#18181B', background: '#FAFAFA', cursor: 'pointer' }}
          >
            <option value="">Toutes les périodes</option>
            {periodes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            style={{ fontSize: 12, padding: '6px 10px', borderRadius: 7, border: '0.5px solid #E4E4E7', color: '#18181B', background: '#FAFAFA', cursor: 'pointer' }}
          >
            <option value="">Tous les statuts</option>
            {['Brouillon', 'Soumise', 'Validée', 'Facturée'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 11, color: '#71717A', marginLeft: 'auto' }}>{filtered.length} situation(s)</span>
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Table */}
          <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E4E4E7' }}>
                    {['N° Situation', 'Chantier', 'Période', 'Avancement', 'Montant HT', 'TVA 20%', 'Retenue 10%', 'Net à payer', 'Statut', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#71717A', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sit) => (
                    <tr
                      key={sit.id}
                      onClick={() => setSelectedSituation(sit.id === selectedSituation ? null : sit.id)}
                      style={{
                        borderBottom: '0.5px solid #F4F4F5',
                        cursor: 'pointer',
                        background: sit.id === selectedSituation ? '#FDF0EA' : '#fff',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { if (sit.id !== selectedSituation) e.currentTarget.style.background = '#FAFAFA'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = sit.id === selectedSituation ? '#FDF0EA' : '#fff'; }}
                    >
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: '#C85A2A' }}>{sit.numero}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, color: '#18181B' }}>{sit.chantier}</td>
                      <td style={{ padding: '9px 12px', color: '#71717A' }}>{sit.periode}</td>
                      <td style={{ padding: '9px 12px', minWidth: 120 }}><ProgressBar value={sit.avancement} /></td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(sit.montantHT)}</td>
                      <td style={{ padding: '9px 12px', color: '#71717A', whiteSpace: 'nowrap' }}>{fmt(sit.tva)}</td>
                      <td style={{ padding: '9px 12px', color: '#C84242', whiteSpace: 'nowrap' }}>-{fmt(sit.retenue)}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap' }}>{fmt(sit.netAPayer)}</td>
                      <td style={{ padding: '9px 12px' }}><StatutBadge statut={sit.statut} /></td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedSituation(sit.id === selectedSituation ? null : sit.id); }}
                            title="Voir le détail"
                            style={{ background: '#EFF6FF', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#2A6CB8' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          </button>
                          {sit.statut === 'Validée' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); showToast(`Facture générée pour ${sit.numero}`); }}
                              title="Générer facture"
                              style={{ background: '#FDF0EA', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#C85A2A', fontSize: 10, fontWeight: 600 }}
                            >
                              FAC
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          {detail && (
            <div style={{
              width: 420, flexShrink: 0,
              background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10,
              overflow: 'hidden',
            }}>
              {/* Panel header */}
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#1C1C1C', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{detail.numero}</p>
                  <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0 }}>{detail.chantier} — {detail.periode}</p>
                </div>
                <button
                  onClick={() => setSelectedSituation(null)}
                  style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
                >×</button>
              </div>

              {/* Postes table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E4E4E7' }}>
                      {['Poste', 'Qté', 'P.U. HT', '% Préc.', '% Ce mois', 'Montant'].map((h) => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#71717A', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.postes.map((p, i) => {
                      const montant = (p.pctCeMois / 100) * p.qte * p.puHT;
                      return (
                        <tr key={i} style={{ borderBottom: '0.5px solid #F4F4F5' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 500, color: '#18181B' }}>{p.designation}</td>
                          <td style={{ padding: '8px 10px', color: '#71717A' }}>{new Intl.NumberFormat('fr-MA').format(p.qte)}</td>
                          <td style={{ padding: '8px 10px', color: '#71717A' }}>{new Intl.NumberFormat('fr-MA').format(p.puHT)}</td>
                          <td style={{ padding: '8px 10px', color: '#71717A' }}>{p.pctPrecedent}%</td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#2D8A5E' }}>{p.pctCeMois}%</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#18181B', whiteSpace: 'nowrap' }}>{fmt(montant)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ padding: '12px 14px', borderTop: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
                {[
                  { label: 'Montant HT', value: detail.montantHT, color: '#18181B' },
                  { label: 'TVA 20%', value: detail.tva, color: '#71717A' },
                  { label: 'Retenue garantie 10%', value: -detail.retenue, color: '#C84242' },
                  { label: 'Net à payer', value: detail.netAPayer, color: '#C85A2A', bold: true },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: row.bold ? 'none' : '0.5px solid #F4F4F5' }}>
                    <span style={{ fontSize: 12, color: '#71717A', fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: row.bold ? 700 : 600, color: row.color }}>
                      {row.value < 0 ? '-' : ''}{fmt(Math.abs(row.value))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action */}
              {detail.statut === 'Validée' && (
                <div style={{ padding: '12px 14px', borderTop: '0.5px solid #E4E4E7' }}>
                  <button
                    onClick={() => showToast(`Facture générée pour ${detail.numero} — ${fmt(detail.netAPayer)}`)}
                    style={{
                      width: '100%',
                      background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '9px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Générer Facture
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

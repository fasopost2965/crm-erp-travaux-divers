import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Formatage monétaire Dirhams marocains
const formatCurrency = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
    .format(val || 0)
    .replace('MAD', 'DH');

// Formatage date courte française
const formatDate = (d) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d));
};

// Calcul du nombre de jours de retard ou restants
const daysFromToday = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date().setHours(0, 0, 0, 0) - new Date(dateStr).setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Badge coloré
const Badge = ({ label, color = 'blue' }) => {
  const map = {
    blue: { bg: '#e8f0fb', text: '#0066cc' },
    green: { bg: '#e6f9ed', text: '#34c759' },
    red: { bg: '#fff0ee', text: '#ff3b30' },
    orange: { bg: '#fff4e5', text: '#ff9500' },
    grey: { bg: '#f0f0f0', text: '#7a7a7a' },
  };
  const { bg, text } = map[color] || map.grey;
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 9999,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};

// Anneau CSS grand format (hero)
const RingChartHero = ({ percent = 0, size = 120, stroke = 12 }) => {
  const clamp = Math.min(100, Math.max(0, Math.round(percent)));
  const inner = size - stroke * 2;
  const color = clamp >= 80 ? '#34c759' : clamp >= 50 ? '#0066cc' : '#ff9500';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${clamp * 3.6}deg, rgba(255,255,255,0.15) ${clamp * 3.6}deg)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: inner,
          height: inner,
          borderRadius: '50%',
          background: '#272729',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', lineHeight: 1 }}>
          {clamp}%
        </span>
        <span style={{ fontSize: 10, color: '#7a7a7a', marginTop: 2 }}>encaisse</span>
      </div>
    </div>
  );
};

// Card KPI
const KpiCard = ({ title, value, sub, highlight, badge, badgeColor }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: 18,
      padding: 24,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.224px' }}>{title}</span>
      {badge !== undefined && badge > 0 && (
        <Badge label={`${badge}`} color={badgeColor || 'grey'} />
      )}
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        color: highlight || '#1d1d1f',
        letterSpacing: '-0.374px',
        lineHeight: 1.1,
        marginBottom: 6,
      }}
    >
      {value}
    </div>
    {sub && <div style={{ fontSize: 13, color: '#7a7a7a' }}>{sub}</div>}
  </div>
);

const FinanceDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/finance');
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Erreur dashboard finance', err);
        setError('Impossible de charger les donnees financieres.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Chargement des donnees comptables..." />;

  if (error) {
    return (
      <div
        style={{
          padding: 24,
          background: '#fff0ee',
          border: '1px solid #ff3b30',
          borderRadius: 18,
          color: '#ff3b30',
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {error}
      </div>
    );
  }

  const d = stats || {};
  const collectionRate = Math.round(d.collectionRate || 0);
  const paymentsReceived = d.paymentsReceivedAmount || 0;
  const invoicesIssuedAmount = d.invoicesIssued?.amount || 0;
  const invoicesIssuedCount = d.invoicesIssued?.count || 0;
  const unpaidList = d.unpaidInvoices?.list || [];
  const unpaidTotal = d.unpaidInvoices?.totalAmount || 0;
  const upcomingList = d.upcomingDueDates?.list || [];
  const upcomingTotal = d.upcomingDueDates?.totalAmount || 0;

  // Pourcentage d'encaissement pour la barre de progression
  const encaissementPct =
    invoicesIssuedAmount > 0 ? Math.min(100, Math.round((paymentsReceived / invoicesIssuedAmount) * 100)) : 0;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
        background: '#f5f5f7',
        minHeight: '100vh',
        padding: '32px 24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Hero card sombre avec ring chart */}
      <div
        style={{
          background: '#272729',
          borderRadius: 18,
          padding: '32px 40px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 28,
        }}
      >
        {/* Gauche — ring + taux */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <RingChartHero percent={collectionRate} size={120} stroke={12} />
          <div>
            <p style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 600, marginBottom: 8 }}>
              Tresorerie & Recouvrement — {user?.name || 'Finance'}
            </p>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.374px',
                marginBottom: 8,
              }}
            >
              Taux d'encaissement global
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
                {formatCurrency(paymentsReceived)}
              </span>
              <span style={{ fontSize: 14, color: '#7a7a7a' }}>encaisses ce mois</span>
            </div>
          </div>
        </div>

        {/* Droite — stats rapides */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>Factures emises</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
              {invoicesIssuedCount}
            </div>
            <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 4 }}>{formatCurrency(invoicesIssuedAmount)}</div>
          </div>
          <div
            style={{
              background: unpaidList.length > 0 ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${unpaidList.length > 0 ? 'rgba(255,59,48,0.25)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14,
              padding: '14px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>Impayes</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: unpaidList.length > 0 ? '#ff3b30' : '#ffffff', letterSpacing: '-0.5px' }}>
              {unpaidList.length}
            </div>
            <div style={{ fontSize: 12, color: unpaidList.length > 0 ? '#ff3b30' : '#7a7a7a', marginTop: 4 }}>
              {formatCurrency(unpaidTotal)}
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>Echeances 7j</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#ff9500', letterSpacing: '-0.5px' }}>
              {upcomingList.length}
            </div>
            <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 4 }}>{formatCurrency(upcomingTotal)}</div>
          </div>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KpiCard
          title="Factures Emises"
          value={formatCurrency(invoicesIssuedAmount)}
          sub={`${invoicesIssuedCount} facture${invoicesIssuedCount > 1 ? 's' : ''} ce mois`}
        />
        <KpiCard
          title="Paiements Recus"
          value={formatCurrency(paymentsReceived)}
          sub="Tresorerie encaissee"
          highlight="#34c759"
        />
        <KpiCard
          title="Impayes"
          value={formatCurrency(unpaidTotal)}
          sub={`${unpaidList.length} facture${unpaidList.length > 1 ? 's' : ''} en souffrance`}
          highlight={unpaidList.length > 0 ? '#ff3b30' : '#34c759'}
          badge={unpaidList.length}
          badgeColor="red"
        />
        <KpiCard
          title="Echeances 7 jours"
          value={formatCurrency(upcomingTotal)}
          sub={`${upcomingList.length} facture${upcomingList.length > 1 ? 's' : ''} a venir`}
          highlight={upcomingList.length > 0 ? '#ff9500' : '#1d1d1f'}
          badge={upcomingList.length}
          badgeColor="orange"
        />
      </div>

      {/* Barre d'encaissement */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px' }}>
              Progression d'encaissement
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a', marginTop: 2 }}>
              Paiements recus par rapport aux factures emises
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#7a7a7a' }}>
              {formatCurrency(paymentsReceived)}
              <span style={{ color: '#e0e0e0', margin: '0 6px' }}>/</span>
              {formatCurrency(invoicesIssuedAmount)}
            </span>
            <Badge
              label={`${encaissementPct}% encaisse`}
              color={encaissementPct >= 80 ? 'green' : encaissementPct >= 50 ? 'blue' : 'orange'}
            />
          </div>
        </div>
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 9999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.max(1, encaissementPct)}%`,
              height: '100%',
              background: encaissementPct >= 80 ? '#34c759' : encaissementPct >= 50 ? '#0066cc' : '#ff9500',
              borderRadius: 9999,
              transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#7a7a7a' }}>
          <span>0 DH</span>
          <span>{formatCurrency(invoicesIssuedAmount)}</span>
        </div>
      </div>

      {/* Grille tableau impayés + échéances */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 16 }}>
        {/* Tableau des impayés */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px' }}>
                Suivi des creances impayees
              </h2>
              <p style={{ fontSize: 13, color: '#7a7a7a', marginTop: 2 }}>Facturation en souffrance — a relancer</p>
            </div>
            {unpaidList.length > 0 && (
              <Badge label={`${unpaidList.length} facture${unpaidList.length > 1 ? 's' : ''}`} color="red" />
            )}
          </div>

          {unpaidList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: '#34c759',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Aucun impaye — encaissement a jour
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    {['N Facture', 'Client / Libelle', 'Montant TTC', 'Echeance', 'Retard', 'Action'].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: '8px 12px',
                          textAlign: i >= 4 ? 'right' : 'left',
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#7a7a7a',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unpaidList.map((inv, i) => {
                    const delay = daysFromToday(inv.dueDate);
                    const isUrgent = delay !== null && delay > 30;
                    const isMedium = delay !== null && delay > 7 && delay <= 30;
                    const rowBg = i % 2 === 0 ? '#ffffff' : '#fafafa';
                    const delayColor = isUrgent ? '#ff3b30' : isMedium ? '#ff9500' : '#7a7a7a';
                    return (
                      <tr
                        key={inv.id || i}
                        style={{ background: rowBg, borderBottom: '1px solid #f0f0f0' }}
                      >
                        <td style={{ padding: '12px 12px', fontWeight: 700, color: '#1d1d1f', whiteSpace: 'nowrap' }}>
                          {inv.invoiceNumber || inv.invoice_number || `#${inv.id}`}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#7a7a7a', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inv.account?.name || inv.title || 'Client inconnu'}
                        </td>
                        <td style={{ padding: '12px 12px', fontWeight: 700, color: '#1d1d1f', whiteSpace: 'nowrap' }}>
                          {formatCurrency(inv.totalTtc || inv.total_ttc)}
                        </td>
                        <td style={{ padding: '12px 12px', color: '#7a7a7a', whiteSpace: 'nowrap' }}>
                          {formatDate(inv.dueDate || inv.due_date)}
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {delay !== null && delay > 0 ? (
                            <span
                              style={{
                                background: isUrgent ? '#fff0ee' : isMedium ? '#fff4e5' : '#f0f0f0',
                                color: delayColor,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 9999,
                              }}
                            >
                              +{delay}j
                            </span>
                          ) : (
                            <span style={{ color: '#7a7a7a', fontSize: 11 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                          <button
                            style={{
                              background: '#0066cc',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 9999,
                              padding: '6px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'transform 0.1s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          >
                            Relancer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Ligne total */}
                <tfoot>
                  <tr style={{ borderTop: '2px solid #e0e0e0', background: '#f5f5f7' }}>
                    <td
                      colSpan={2}
                      style={{ padding: '12px 12px', fontSize: 12, fontWeight: 700, color: '#7a7a7a' }}
                    >
                      Total en souffrance
                    </td>
                    <td
                      colSpan={4}
                      style={{ padding: '12px 12px', fontSize: 14, fontWeight: 700, color: '#ff3b30' }}
                    >
                      {formatCurrency(unpaidTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Colonne echéances 7j */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px', marginBottom: 4 }}>
            Echeances a venir
          </h2>
          <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 16 }}>7 prochains jours</p>

          {/* Total encadré */}
          <div
            style={{
              background: '#e8f0fb',
              border: '1px solid rgba(0,102,204,0.2)',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 13, color: '#0066cc', fontWeight: 600 }}>Total a percevoir</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0066cc' }}>{formatCurrency(upcomingTotal)}</span>
          </div>

          {upcomingList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#7a7a7a', fontSize: 13, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Aucune facture n'arrive a echeance cette semaine
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {upcomingList.map((inv, i) => {
                const delay = daysFromToday(inv.dueDate || inv.due_date);
                // Pour les echéances futures, delay est negatif (pas encore echu)
                const daysLeft = delay !== null ? -delay : null;
                const isClose = daysLeft !== null && daysLeft <= 2;
                return (
                  <div
                    key={inv.id || i}
                    style={{
                      background: isClose ? '#fff4e5' : '#f5f5f7',
                      border: isClose ? '1px solid rgba(255,149,0,0.25)' : '1px solid transparent',
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 3 }}>
                        {inv.invoiceNumber || inv.invoice_number || `#${inv.id}`}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.account?.name || inv.title || 'Client inconnu'}
                      </div>
                      <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>
                        Echeance : {formatDate(inv.dueDate || inv.due_date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>
                        {formatCurrency(inv.totalTtc || inv.total_ttc)}
                      </div>
                      {daysLeft !== null && daysLeft >= 0 && (
                        <div style={{ fontSize: 11, color: isClose ? '#ff9500' : '#7a7a7a', marginTop: 2, fontWeight: 600 }}>
                          J-{daysLeft}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Formatage monétaire Dirhams marocains
const formatCurrency = (val) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
    .format(val || 0)
    .replace('MAD', 'DH');

// Formatage date longue française
const formatDateLong = (date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

// Badge de statut coloré
const Badge = ({ label, color = 'blue' }) => {
  const palette = {
    blue: { bg: '#e8f0fb', text: '#0066cc' },
    green: { bg: '#e6f9ed', text: '#34c759' },
    red: { bg: '#fff0ee', text: '#ff3b30' },
    orange: { bg: '#fff4e5', text: '#ff9500' },
    dark: { bg: '#3a3a3c', text: '#ffffff' },
  };
  const { bg, text } = palette[color] || palette.blue;
  return (
    <span
      style={{
        backgroundColor: bg,
        color: text,
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 9999,
        letterSpacing: '-0.1px',
        display: 'inline-block',
      }}
    >
      {label}
    </span>
  );
};

// Anneau CSS (conic-gradient) pour indicateur circulaire
const RingChart = ({ percent = 0, size = 64, stroke = 7, color = '#0066cc', bg = '#e0e0e0', label, sublabel }) => {
  const clamp = Math.min(100, Math.max(0, percent));
  const gradient = `conic-gradient(${color} ${clamp * 3.6}deg, ${bg} ${clamp * 3.6}deg)`;
  const inner = size - stroke * 2;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: gradient,
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
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.3px' }}>
            {clamp}%
          </span>
        </div>
      </div>
      {(label || sublabel) && (
        <div>
          {label && <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>{label}</div>}
          {sublabel && <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 2 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
};

// Card KPI principale
const KpiCard = ({ title, value, sub, ring, trendBars, badge, badgeColor }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: 18,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.224px' }}>{title}</span>
      {badge !== undefined && (
        <Badge
          label={badge > 0 ? `${badge} alerte${badge > 1 ? 's' : ''}` : 'OK'}
          color={badge > 0 ? badgeColor || 'red' : 'green'}
        />
      )}
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.374px', lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 13, color: '#7a7a7a' }}>{sub}</div>}
    {ring && <div style={{ marginTop: 4 }}>{ring}</div>}
    {trendBars && (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28, marginTop: 4 }}>
        {trendBars.map((h, i) => (
          <div
            key={i}
            title={h.label}
            style={{
              flex: 1,
              height: `${Math.max(15, h.pct)}%`,
              background: i === trendBars.length - 1 ? '#0066cc' : '#e0e0e0',
              borderRadius: 3,
              transition: 'height 0.3s ease',
            }}
          />
        ))}
      </div>
    )}
  </div>
);

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/director');
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Erreur dashboard directeur', err);
        setError('Impossible de charger les données. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Chargement du tableau de bord Directeur..." />;

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

  // Calcul du taux de marge
  const marginRate = d.turnoverMonth > 0 ? Math.round((d.estimatedMargin / d.turnoverMonth) * 100) : 0;

  // Taux de conversion devis
  const conversionRate = Math.round(d.quotesWon?.conversionRate || 0);

  // Calcul barres sparkline evolution CA
  const evolution = d.monthlyEvolution || [];
  const maxTurnover = evolution.length > 0 ? Math.max(...evolution.map((e) => e.turnover || 0), 1) : 1;
  const trendBarsData = evolution.map((e) => ({
    pct: Math.round(((e.turnover || 0) / maxTurnover) * 100),
    label: e.month,
  }));

  // Calcul barres graphique CA 3 mois
  const barMax = maxTurnover;

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
      {/* Hero card sombre pleine largeur */}
      <div
        style={{
          background: '#272729',
          borderRadius: 18,
          padding: '36px 40px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        {/* Bloc gauche */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#34c759',
                display: 'inline-block',
                boxShadow: '0 0 6px #34c759',
              }}
            />
            <span style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 600, letterSpacing: '0.08em' }}>
              EN DIRECT
            </span>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#ffffff',
              letterSpacing: '-0.374px',
              marginBottom: 4,
            }}
          >
            Bonjour, {user?.name || 'Directeur'}
          </h1>
          <p style={{ fontSize: 14, color: '#7a7a7a', marginBottom: 28 }}>
            {formatDateLong(new Date())}
          </p>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-1.5px',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {formatCurrency(d.turnoverMonth)}
          </div>
          <p style={{ fontSize: 15, color: '#7a7a7a', letterSpacing: '-0.2px' }}>
            Chiffre d'affaires mensuel HT &nbsp;&middot;&nbsp; Marge estimee{' '}
            <span style={{ color: '#34c759', fontWeight: 600 }}>{formatCurrency(d.estimatedMargin)}</span>
          </p>
        </div>

        {/* Bloc droit — indicateurs synthétiques */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '16px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 600, marginBottom: 8 }}>Projets actifs</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
              {d.activeProjectsCount || 0}
            </div>
          </div>
          <div
            style={{
              background: (d.unpaidInvoices?.count || 0) > 0 ? 'rgba(255,59,48,0.12)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${(d.unpaidInvoices?.count || 0) > 0 ? 'rgba(255,59,48,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14,
              padding: '16px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 600, marginBottom: 8 }}>Impayés</div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: (d.unpaidInvoices?.count || 0) > 0 ? '#ff3b30' : '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              {d.unpaidInvoices?.count || 0}
            </div>
            {(d.unpaidInvoices?.count || 0) > 0 && (
              <div style={{ fontSize: 12, color: '#ff3b30', marginTop: 4, fontWeight: 600 }}>
                {formatCurrency(d.unpaidInvoices?.amount)}
              </div>
            )}
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '16px 20px',
              minWidth: 130,
            }}
          >
            <div style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 600, marginBottom: 8 }}>Devis gagnés</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#34c759', letterSpacing: '-0.5px' }}>
              {d.quotesWon?.count || 0}
            </div>
            <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 4 }}>Taux {conversionRate}%</div>
          </div>
        </div>
      </div>

      {/* Grille 4 KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <KpiCard
          title="CA Mensuel HT"
          value={formatCurrency(d.turnoverMonth)}
          sub={`Devis envoyés : ${formatCurrency(d.quotesSent?.amount)}`}
          trendBars={trendBarsData.length > 0 ? trendBarsData : undefined}
        />
        <KpiCard
          title="Marge Estimée"
          value={formatCurrency(d.estimatedMargin)}
          ring={
            <RingChart
              percent={marginRate}
              size={60}
              stroke={6}
              color="#34c759"
              label={`${marginRate}% du CA`}
              sublabel="Marge nette estimée"
            />
          }
        />
        <KpiCard
          title="Projets Actifs"
          value={d.activeProjectsCount || 0}
          sub="Chantiers en cours de livraison"
          badge={d.activeProjectsCount || 0}
          badgeColor="blue"
        />
        <KpiCard
          title="Factures Impayées"
          value={formatCurrency(d.unpaidInvoices?.amount)}
          sub={`${d.quotesSent?.count || 0} devis envoyés ce mois`}
          badge={d.unpaidInvoices?.count || 0}
          badgeColor="red"
        />
      </div>

      {/* Grille principale 2 colonnes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Graphique CA 3 mois */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.374px',
                marginBottom: 4,
              }}
            >
              Evolution du chiffre d'affaires
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a' }}>3 derniers mois — barres relatives</p>
          </div>

          {evolution.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#7a7a7a', fontSize: 14 }}>
              Aucune donnee d'evolution disponible
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {evolution.map((item, i) => {
                const pct = Math.round(((item.turnover || 0) / barMax) * 100);
                const isLatest = i === evolution.length - 1;
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: '#1d1d1f', fontWeight: isLatest ? 600 : 400 }}>{item.month}</span>
                      <span style={{ color: '#1d1d1f', fontWeight: 600 }}>{formatCurrency(item.turnover)}</span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: '#f0f0f0',
                        borderRadius: 9999,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(4, pct)}%`,
                          height: '100%',
                          background: isLatest ? '#0066cc' : '#b0c8e8',
                          borderRadius: 9999,
                          transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tunnel de conversion */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.374px',
                marginBottom: 4,
              }}
            >
              Tunnel de conversion
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a' }}>De la prospection au projet signé</p>
          </div>

          {(() => {
            const stages = [
              {
                label: 'Devis envoyés',
                count: d.quotesSent?.count || 0,
                amount: d.quotesSent?.amount || 0,
                color: '#0066cc',
              },
              {
                label: 'Devis gagnés',
                count: d.quotesWon?.count || 0,
                amount: d.quotesWon?.amount || 0,
                color: '#34c759',
              },
              {
                label: 'Projets actifs',
                count: d.activeProjectsCount || 0,
                amount: null,
                color: '#ff9500',
              },
              {
                label: 'Impayés',
                count: d.unpaidInvoices?.count || 0,
                amount: d.unpaidInvoices?.amount || 0,
                color: '#ff3b30',
              },
            ];
            const maxCount = Math.max(...stages.map((s) => s.count), 1);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stages.map((s, i) => {
                  const pct = Math.round((s.count / maxCount) * 100);
                  return (
                    <div key={i}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 5,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: s.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: '#1d1d1f', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{s.count}</span>
                          {s.amount !== null && (
                            <span style={{ fontSize: 12, color: '#7a7a7a', marginLeft: 6 }}>
                              {formatCurrency(s.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: '#f0f0f0',
                          borderRadius: 9999,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(4, pct)}%`,
                            height: '100%',
                            background: s.color,
                            borderRadius: 9999,
                            opacity: 0.85,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Alertes urgentes — factures impayées */}
      {(d.unpaidInvoices?.count || 0) > 0 && (
        <div
          style={{
            background: '#fff0ee',
            border: '1px solid rgba(255,59,48,0.25)',
            borderRadius: 18,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,59,48,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ff3b30" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ff3b30', marginBottom: 2 }}>
                {d.unpaidInvoices.count} facture{d.unpaidInvoices.count > 1 ? 's' : ''} impayee{d.unpaidInvoices.count > 1 ? 's' : ''} — action requise
              </div>
              <div style={{ fontSize: 13, color: '#7a7a7a' }}>
                Total en souffrance : <strong style={{ color: '#1d1d1f' }}>{formatCurrency(d.unpaidInvoices.amount)}</strong>
              </div>
            </div>
          </div>
          <button
            style={{
              background: '#ff3b30',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9999,
              padding: '11px 22px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.2px',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Voir les factures →
          </button>
        </div>
      )}

      {/* Section résumé synthétique bas de page */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 16,
        }}
      >
        {[
          {
            label: 'Devis envoyés',
            val: `${d.quotesSent?.count || 0} devis`,
            sub: formatCurrency(d.quotesSent?.amount),
            col: '#0066cc',
          },
          {
            label: 'Taux de conversion',
            val: `${conversionRate}%`,
            sub: `${d.quotesWon?.count || 0} devis gagnés`,
            col: '#34c759',
          },
          {
            label: 'Heures terrain',
            val: `${d.activeProjectsCount || 0} proj.`,
            sub: 'Chantiers supervisés',
            col: '#ff9500',
          },
          {
            label: 'Marge / CA',
            val: `${marginRate}%`,
            sub: formatCurrency(d.estimatedMargin),
            col: '#0066cc',
          },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 18,
              padding: '18px 20px',
            }}
          >
            <div style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 600, marginBottom: 8 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.col, letterSpacing: '-0.374px' }}>{item.val}</div>
            <div style={{ fontSize: 13, color: '#7a7a7a', marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectorDashboard;

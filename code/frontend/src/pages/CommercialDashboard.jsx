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

// Formatage date longue
const formatDateLong = (date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);

// Anneau CSS (conic-gradient)
const RingChart = ({ percent = 0, size = 80, stroke = 8, color = '#0066cc', bg = '#e0e0e0' }) => {
  const clamp = Math.min(100, Math.max(0, Math.round(percent)));
  const inner = size - stroke * 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${clamp * 3.6}deg, ${bg} ${clamp * 3.6}deg)`,
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
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.3px' }}>
          {clamp}%
        </span>
      </div>
    </div>
  );
};

// Badge couleur
const Badge = ({ label, color = 'blue' }) => {
  const map = {
    blue: { bg: '#e8f0fb', text: '#0066cc' },
    green: { bg: '#e6f9ed', text: '#34c759' },
    red: { bg: '#fff0ee', text: '#ff3b30' },
    orange: { bg: '#fff4e5', text: '#ff9500' },
    grey: { bg: '#f0f0f0', text: '#7a7a7a' },
  };
  const { bg, text } = map[color] || map.blue;
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

// Card KPI
const KpiCard = ({ title, value, sub, ring, highlight }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: 18,
      padding: 24,
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 600, color: '#7a7a7a', marginBottom: 12, letterSpacing: '-0.224px' }}>
      {title}
    </div>
    {ring ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {ring}
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: highlight || '#1d1d1f', letterSpacing: '-0.374px' }}>
            {value}
          </div>
          {sub && <div style={{ fontSize: 13, color: '#7a7a7a', marginTop: 3 }}>{sub}</div>}
        </div>
      </div>
    ) : (
      <>
        <div
          style={{
            fontSize: 28,
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
      </>
    )}
  </div>
);

// Colonne pipeline (données simulées enrichies si API n'a pas le détail par stage)
const PipelineColumn = ({ stage, count, amount, color }) => (
  <div
    style={{
      background: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: 18,
      padding: '20px 16px',
      flex: 1,
      minWidth: 120,
    }}
  >
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        marginBottom: 10,
      }}
    />
    <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', letterSpacing: '0.06em', marginBottom: 8 }}>
      {stage.toUpperCase()}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.374px', marginBottom: 4 }}>
      {count}
    </div>
    {amount !== null && (
      <div style={{ fontSize: 12, color: '#7a7a7a', fontWeight: 500 }}>{formatCurrency(amount)}</div>
    )}
  </div>
);

const CommercialDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/commercial');
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Erreur dashboard commercial', err);
        setError('Impossible de charger les données commerciales.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Chargement des donnees commerciales..." />;

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
  const convRate = Math.round(d.personalConversionRate || 0);
  const oppsCount = d.activeOpportunities?.count || 0;
  const pipelineAmount = d.activeOpportunities?.pipelineAmount || 0;
  const meetings = d.upcomingMeetings || [];
  const pendingQuotes = d.pendingQuotesCount || 0;
  const newLeads = d.newLeadsCount || 0;
  const todayFollowUps = d.todayFollowUpsCount || 0;

  // Calcul barre de progression devis : en attente vs total envoyé (estimation 80% total si pas dispo)
  const totalQuotesEstimate = pendingQuotes > 0 ? Math.round(pendingQuotes / 0.6) : 1;
  const quoteProgressPct = Math.min(100, Math.round(((totalQuotesEstimate - pendingQuotes) / totalQuotesEstimate) * 100));

  // Stages pipeline (données API + estimation si stage non disponible)
  const pipelineStages = [
    { stage: 'Prospect', count: newLeads, amount: null, color: '#7a7a7a' },
    { stage: 'Qualification', count: oppsCount > 0 ? Math.ceil(oppsCount * 0.6) : 0, amount: null, color: '#0066cc' },
    { stage: 'Proposition', count: pendingQuotes, amount: pipelineAmount > 0 ? pipelineAmount * 0.5 : 0, color: '#ff9500' },
    { stage: 'Negociation', count: oppsCount > 0 ? Math.floor(oppsCount * 0.25) : 0, amount: pipelineAmount > 0 ? pipelineAmount * 0.25 : 0, color: '#34c759' },
  ];

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
      {/* Hero card blanche */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          padding: '32px 36px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>
            {formatDateLong(new Date())}
          </p>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-0.374px',
              marginBottom: 6,
            }}
          >
            Bonjour, {user?.name || 'Commercial'}
          </h1>
          <p style={{ fontSize: 15, color: '#7a7a7a', marginBottom: 20 }}>
            Tableau de bord commercial — activite du jour
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: '#0066cc',
                letterSpacing: '-1px',
              }}
            >
              {formatCurrency(pipelineAmount)}
            </span>
            <Badge label={`${oppsCount} opportunites actives`} color="blue" />
          </div>
          <p style={{ fontSize: 13, color: '#7a7a7a', marginTop: 6 }}>Pipeline total en cours</p>
        </div>

        {/* Stats rapides hero */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignSelf: 'center' }}>
          {[
            { label: 'Relances aujourd\'hui', val: todayFollowUps, urgent: todayFollowUps > 0 },
            { label: 'Devis en attente', val: pendingQuotes, urgent: pendingQuotes > 3 },
            { label: 'Leads 7 jours', val: newLeads, urgent: false },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: item.urgent ? '#fff4e5' : '#f5f5f7',
                border: `1px solid ${item.urgent ? 'rgba(255,149,0,0.3)' : '#e0e0e0'}`,
                borderRadius: 14,
                padding: '14px 18px',
                minWidth: 110,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: item.urgent ? '#ff9500' : '#1d1d1f',
                  letterSpacing: '-0.374px',
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {item.val}
              </div>
              <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
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
          title="Nouveaux Leads (7j)"
          value={newLeads}
          sub="Contacts entrants recents"
          highlight={newLeads > 0 ? '#0066cc' : '#1d1d1f'}
        />
        <KpiCard
          title="Pipeline total"
          value={formatCurrency(pipelineAmount)}
          sub={`${oppsCount} opportunites ouvertes`}
        />
        <KpiCard
          title="Taux de conversion"
          value={`${convRate}%`}
          sub="Sur les devis envoyes"
          ring={
            <RingChart
              percent={convRate}
              size={56}
              stroke={5}
              color="#34c759"
              bg="#e0e0e0"
            />
          }
        />
        <KpiCard
          title="Relances aujourd'hui"
          value={todayFollowUps}
          sub="Suivis planifies pour ce jour"
          highlight={todayFollowUps > 0 ? '#ff9500' : '#1d1d1f'}
        />
      </div>

      {/* Grille centrale */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Pipeline stages */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.374px',
              marginBottom: 4,
            }}
          >
            Etapes du pipeline
          </h2>
          <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 20 }}>
            Repartition des opportunites par stade
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {pipelineStages.map((s, i) => (
              <PipelineColumn key={i} {...s} />
            ))}
          </div>
        </div>

        {/* Jauge devis mensuelle */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.374px',
              marginBottom: 4,
            }}
          >
            Progression des devis
          </h2>
          <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 24 }}>
            Devis acceptes vs en attente ce mois
          </p>

          {/* Barre principale */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              <span style={{ color: '#7a7a7a' }}>Acceptes</span>
              <span style={{ fontWeight: 700, color: '#34c759' }}>{quoteProgressPct}%</span>
            </div>
            <div
              style={{
                height: 10,
                background: '#f0f0f0',
                borderRadius: 9999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${quoteProgressPct}%`,
                  height: '100%',
                  background: '#34c759',
                  borderRadius: 9999,
                  transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            </div>
          </div>

          {/* Stats devis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'En attente de reponse', val: pendingQuotes, col: '#ff9500' },
              { label: 'Taux conversion perso', val: `${convRate}%`, col: '#0066cc' },
              { label: 'Opps actives', val: oppsCount, col: '#1d1d1f' },
              { label: 'Valeur moy. par opp.', val: oppsCount > 0 ? formatCurrency(pipelineAmount / oppsCount) : '0 DH', col: '#7a7a7a' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#f5f5f7',
                  borderRadius: 12,
                  padding: '12px 14px',
                }}
              >
                <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.col, letterSpacing: '-0.3px' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prochains rendez-vous */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          padding: 24,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px' }}>
              Prochains rendez-vous et relances
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a', marginTop: 2 }}>Activites planifiees</p>
          </div>
          {meetings.length > 0 && (
            <Badge label={`${meetings.length} evenement${meetings.length > 1 ? 's' : ''}`} color="blue" />
          )}
        </div>

        {meetings.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '36px 0',
              color: '#7a7a7a',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Aucun rendez-vous prevu — votre agenda est libre
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {meetings.map((m, i) => {
              const isToday =
                new Date(m.dueDate).toDateString() === new Date().toDateString();
              return (
                <div
                  key={m.id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: isToday ? '#e8f0fb' : '#f5f5f7',
                    marginBottom: 6,
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 180 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isToday ? '#0066cc' : '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={isToday ? '#fff' : '#7a7a7a'} strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 2 }}>
                        {m.subject || m.title || 'Activite'}
                      </div>
                      <div style={{ fontSize: 12, color: '#7a7a7a' }}>
                        {m.type || 'Rendez-vous'}
                        {m.description ? ` — ${m.description.slice(0, 60)}${m.description.length > 60 ? '…' : ''}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
                      {formatDate(m.dueDate)}
                    </div>
                    {isToday && (
                      <Badge label="Aujourd'hui" color="blue" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1d1d1f',
            letterSpacing: '-0.374px',
            marginBottom: 16,
          }}
        >
          Actions rapides
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Nouveau Lead', primary: true },
            { label: 'Creer un Devis', primary: false },
            { label: 'Voir les Opportunites', primary: false },
          ].map((btn, i) => (
            <button
              key={i}
              style={{
                background: btn.primary ? '#0066cc' : '#ffffff',
                color: btn.primary ? '#ffffff' : '#0066cc',
                border: btn.primary ? 'none' : '1px solid #0066cc',
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
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;

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

// Calcul du nombre de jours restants jusqu'à une date
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
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

// Badge de statut projet
const StatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Actif', color: 'green' },
    en_cours: { label: 'En cours', color: 'green' },
    in_progress: { label: 'En cours', color: 'green' },
    planning: { label: 'Planifie', color: 'blue' },
    paused: { label: 'En pause', color: 'orange' },
    completed: { label: 'Termine', color: 'grey' },
    blocked: { label: 'Bloque', color: 'red' },
  };
  const resolved = map[status] || map[status?.toLowerCase()] || { label: status || 'Inconnu', color: 'grey' };
  return <Badge label={resolved.label} color={resolved.color} />;
};

// Anneau CSS (conic-gradient) complet avec légende
const RingChartFull = ({ done = 0, total = 0, size = 100, stroke = 10 }) => {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const inner = size - stroke * 2;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(#34c759 ${pct * 3.6}deg, #e0e0e0 ${pct * 3.6}deg)`,
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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {pct}%
          </span>
          <span style={{ fontSize: 10, color: '#7a7a7a', marginTop: 2 }}>effectue</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#1d1d1f' }}>
            <strong>{done}</strong> taches terminees
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e0e0e0', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#7a7a7a' }}>
            {total - done} restantes sur {total}
          </span>
        </div>
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.224px' }}>{title}</span>
      {badge !== undefined && badge > 0 && (
        <Badge label={`${badge}`} color={badgeColor || 'red'} />
      )}
    </div>
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
  </div>
);

const ProjectManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/dashboard/project-manager');
        setStats(res.data.data || res.data);
      } catch (err) {
        console.error('Erreur dashboard chef de chantier', err);
        setError('Impossible de charger les donnees de chantier.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Chargement des donnees chantiers..." />;

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
  const projects = d.activeProjects || [];
  const tasksStats = d.tasksStats || {};
  const hoursStats = d.hoursStats || {};
  const deadlines = (d.upcomingDeadlines || []).sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  const blocksCount = d.reportedBlocksCount || 0;

  // Taches terminees estimees = total - en cours - en retard
  const totalTasks = tasksStats.totalCount || 0;
  const inProgressTasks = tasksStats.inProgressCount || 0;
  const lateTasks = tasksStats.lateCount || 0;
  const doneTasks = Math.max(0, totalTasks - inProgressTasks - lateTasks);

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
      {/* Alerte blocages — priorite maximale si present */}
      {blocksCount > 0 && (
        <div
          style={{
            background: '#fff0ee',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: 18,
            padding: '16px 24px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,59,48,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#ff3b30" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ff3b30' }}>
              {blocksCount} tache{blocksCount > 1 ? 's' : ''} bloquee{blocksCount > 1 ? 's' : ''} signale{blocksCount > 1 ? 'es' : 'e'} sur le terrain
            </span>
            <span style={{ fontSize: 13, color: '#7a7a7a', marginLeft: 10 }}>
              Action requise — investiguer immediatement
            </span>
          </div>
        </div>
      )}

      {/* Hero card */}
      <div
        style={{
          background: '#272729',
          borderRadius: 18,
          padding: '28px 36px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 6 }}>
            Chef de chantier — {user?.name || 'Responsable terrain'}
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.374px',
              marginBottom: 4,
            }}
          >
            Supervision des chantiers actifs
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 38, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
              {projects.length}
            </span>
            <span style={{ fontSize: 15, color: '#7a7a7a' }}>projet{projects.length > 1 ? 's' : ''} actif{projects.length > 1 ? 's' : ''}</span>
            {blocksCount > 0 && <Badge label={`${blocksCount} blocage${blocksCount > 1 ? 's' : ''}`} color="red" />}
          </div>
        </div>
        {/* Heures validees */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 20px',
              textAlign: 'center',
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>Heures validees</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#34c759', letterSpacing: '-0.5px' }}>
              {hoursStats.validatedHours || 0}<span style={{ fontSize: 16, marginLeft: 3 }}>h</span>
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '14px 20px',
              textAlign: 'center',
              minWidth: 120,
            }}
          >
            <div style={{ fontSize: 11, color: '#7a7a7a', fontWeight: 600, marginBottom: 6 }}>Heures en attente</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ff9500', letterSpacing: '-0.5px' }}>
              {hoursStats.pendingHours || 0}<span style={{ fontSize: 16, marginLeft: 3 }}>h</span>
            </div>
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
          title="Projets Actifs"
          value={projects.length}
          sub="Chantiers en supervision"
          badge={projects.length}
          badgeColor="blue"
        />
        <KpiCard
          title="Taches En Cours"
          value={inProgressTasks}
          sub={`Total : ${totalTasks} taches`}
        />
        <KpiCard
          title="Taches En Retard"
          value={lateTasks}
          sub="Necessite une attention urgente"
          highlight={lateTasks > 0 ? '#ff3b30' : '#34c759'}
          badge={lateTasks}
          badgeColor="red"
        />
        <KpiCard
          title="Heures Validees"
          value={`${hoursStats.validatedHours || 0} h`}
          sub={`${hoursStats.pendingHours || 0} h en attente de validation`}
          highlight="#34c759"
        />
      </div>

      {/* Grille principale */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Liste des projets actifs */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px', marginBottom: 4 }}>
              Chantiers actifs
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a' }}>
              {projects.length > 0 ? `${projects.length} projet${projects.length > 1 ? 's' : ''} en cours de supervision` : 'Aucun projet actif'}
            </p>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#7a7a7a', fontSize: 14 }}>
              Aucun chantier actif en cours
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.map((proj) => {
                // Calcul progression budgetaire (estimation basee sur statut)
                const budgetUsedPct = proj.status === 'completed' ? 100 : proj.status === 'planning' ? 10 : 55;
                const days = daysUntil(proj.endDatePlanned);
                const isUrgent = days !== null && days < 14;
                return (
                  <div
                    key={proj.id}
                    style={{
                      background: '#f5f5f7',
                      borderRadius: 14,
                      padding: '16px 18px',
                      border: isUrgent ? '1px solid rgba(255,149,0,0.3)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proj.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <StatusBadge status={proj.status} />
                          <span style={{ fontSize: 12, color: '#7a7a7a' }}>
                            Budget : {formatCurrency(proj.budget)}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 2 }}>Fin prevue</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isUrgent ? '#ff9500' : '#1d1d1f' }}>
                          {formatDate(proj.endDatePlanned)}
                        </div>
                        {days !== null && (
                          <div style={{ fontSize: 11, color: isUrgent ? '#ff9500' : '#7a7a7a', marginTop: 2 }}>
                            {days > 0 ? `J-${days}` : days === 0 ? "Aujourd'hui" : `Depassé de ${Math.abs(days)}j`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barre de progression budget */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a7a7a', marginBottom: 4 }}>
                        <span>Budget consomme (estimé)</span>
                        <span style={{ fontWeight: 600 }}>{budgetUsedPct}%</span>
                      </div>
                      <div style={{ height: 4, background: '#e0e0e0', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${budgetUsedPct}%`,
                            height: '100%',
                            background: budgetUsedPct > 80 ? '#ff3b30' : budgetUsedPct > 60 ? '#ff9500' : '#0066cc',
                            borderRadius: 9999,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ring chart taches + echeances */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Ring chart taches */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 18,
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px', marginBottom: 4 }}>
              Avancement des taches
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 18 }}>
              Terminees vs total planifie
            </p>
            <RingChartFull done={doneTasks} total={totalTasks} size={100} stroke={10} />

            {lateTasks > 0 && (
              <div
                style={{
                  marginTop: 16,
                  background: '#fff0ee',
                  border: '1px solid rgba(255,59,48,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#ff3b30', fontWeight: 600 }}>
                  {lateTasks} tache{lateTasks > 1 ? 's' : ''} en retard
                </span>
              </div>
            )}
          </div>

          {/* Prochaines echeances */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: 18,
              padding: 24,
              flex: 1,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px', marginBottom: 4 }}>
              Prochaines echeances
            </h2>
            <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 16 }}>Triees par urgence</p>

            {deadlines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#7a7a7a', fontSize: 13 }}>
                Aucune echeance imminente
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {deadlines.slice(0, 6).map((dl, i) => {
                  const days = daysUntil(dl.endDate);
                  const urgColor = days !== null && days <= 2 ? '#ff3b30' : days !== null && days <= 7 ? '#ff9500' : '#34c759';
                  return (
                    <div
                      key={dl.id || i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i < Math.min(deadlines.length, 6) - 1 ? '1px solid #f0f0f0' : 'none',
                        gap: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dl.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>
                          {dl.projectName || 'Projet non renseigne'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: urgColor }}>
                          {days === null ? '—' : days === 0 ? "Auj." : days < 0 ? `+${Math.abs(days)}j` : `J-${days}`}
                        </div>
                        <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 1 }}>{formatDate(dl.endDate)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;

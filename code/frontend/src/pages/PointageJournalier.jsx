import React, { useState } from 'react';

const fmt = (n) => new Intl.NumberFormat('fr-MA').format(Math.round(n || 0)) + ' MAD';

const MOCK_CDI = [
  { id: 1, nom: 'Mohamed Benkiran', poste: 'Maçon', taux: 280, present: true, hs: 0 },
  { id: 2, nom: 'Khalid Amrani', poste: 'Ferrailleur', taux: 310, present: true, hs: 2 },
  { id: 3, nom: 'Youssef Ouali', poste: 'Électricien', taux: 350, present: false, hs: 0 },
  { id: 4, nom: 'Hassan Benali', poste: 'Chef équipe', taux: 450, present: true, hs: 4 },
  { id: 5, nom: 'Ahmed Ziani', poste: 'Maçon', taux: 280, present: true, hs: 0 },
];

const MOCK_TEMP = [
  { id: 10, nom: 'Omar Tazi', poste: 'Manœuvre', taux: 220, present: true, hs: 0 },
  { id: 11, nom: 'Ali Fahsi', poste: 'Maçon', taux: 250, present: true, hs: 0 },
];

const MOCK_PROJECTS = ['Résidence Al Fath', 'Villa Aïn Diab', 'Entrepôt Aïn Sebaâ'];

const TASK_CATEGORIES = ['Maçonnerie', 'Ferraillage', 'Électricité', 'Plomberie', 'Peinture', 'Nettoyage'];

const FLUX_STEPS = ['Saisie', 'Calcul', 'Cumul RH', 'Bulletin', 'Virement'];

function initials(name) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function KpiCard({ label, value, borderColor, sub }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '0.5px solid #E4E4E7',
      borderTop: `2px solid ${borderColor}`,
      padding: '14px 18px',
    }}>
      <p style={{ fontSize: 11, color: '#71717A', margin: 0, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#18181B', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 10, color: '#71717A', margin: 0, marginTop: 2 }}>{sub}</p>}
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

function PersonnelCard({ person, onToggle, onChangeHs, compact }) {
  const bgInitials = person.present ? '#C85A2A' : '#E4E4E7';
  const colorInitials = person.present ? '#fff' : '#71717A';

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px',
        borderBottom: '0.5px solid #F4F4F5',
        cursor: 'pointer',
        background: person.present ? '#FAFFFE' : '#FAFAFA',
        transition: 'background 0.1s',
      }}
      onClick={() => onToggle(person.id)}
    >
      {/* Avatar */}
      <div style={{
        width: compact ? 28 : 32, height: compact ? 28 : 32,
        borderRadius: '50%',
        background: bgInitials,
        color: colorInitials,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: compact ? 9 : 10, fontWeight: 700,
        flexShrink: 0,
        transition: 'background 0.15s',
      }}>
        {initials(person.nom)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {person.nom}
        </p>
        <p style={{ fontSize: 10, color: '#71717A', margin: 0 }}>{person.poste} — {person.taux} MAD/j</p>
      </div>

      {/* HS */}
      {person.present && (
        <select
          value={person.hs}
          onChange={(e) => { e.stopPropagation(); onChangeHs(person.id, parseInt(e.target.value)); }}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: 10, padding: '3px 6px', borderRadius: 6,
            border: '0.5px solid #E4E4E7', color: '#18181B', background: '#fff',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <option value={0}>+0h HS</option>
          <option value={2}>+2h HS</option>
          <option value={4}>+4h HS</option>
        </select>
      )}

      {/* Status icon */}
      <div style={{ flexShrink: 0 }}>
        {person.present ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D8A5E" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C84242" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function PointageJournalier() {
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [personnel, setPersonnel] = useState(MOCK_CDI);
  const [temporaires, setTemporaires] = useState(MOCK_TEMP);
  const [newNom, setNewNom] = useState('');
  const [newMetier, setNewMetier] = useState('');
  const [newTaux, setNewTaux] = useState('');
  const [taskStates, setTaskStates] = useState(
    TASK_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: false }), {})
  );
  const [toast, setToast] = useState(null);

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const togglePersonnel = (id) => {
    setPersonnel((prev) => prev.map((p) => p.id === id ? { ...p, present: !p.present, hs: !p.present ? p.hs : 0 } : p));
  };

  const changeHsCdi = (id, hs) => {
    setPersonnel((prev) => prev.map((p) => p.id === id ? { ...p, hs } : p));
  };

  const toggleTemp = (id) => {
    setTemporaires((prev) => prev.map((p) => p.id === id ? { ...p, present: !p.present } : p));
  };

  const changeHsTemp = (id, hs) => {
    setTemporaires((prev) => prev.map((p) => p.id === id ? { ...p, hs } : p));
  };

  const addJournalier = () => {
    if (!newNom.trim()) return;
    const entry = {
      id: Date.now(),
      nom: newNom.trim(),
      poste: newMetier.trim() || 'Manœuvre',
      taux: parseFloat(newTaux) || 200,
      present: true,
      hs: 0,
    };
    setTemporaires((prev) => [...prev, entry]);
    setNewNom('');
    setNewMetier('');
    setNewTaux('');
  };

  const allPresent = [...personnel, ...temporaires].filter((p) => p.present);
  const presents = allPresent.length;
  const heuresNormales = presents * 8;
  const heuresSup = allPresent.reduce((s, p) => s + (p.hs || 0), 0);
  const masseJournee = allPresent.reduce((s, p) => {
    return s + p.taux + (p.hs * (p.taux / 8) * 1.25);
  }, 0);

  const handleValider = () => {
    setToast(`Pointage validé pour ${selectedProject} — ${today} — ${presents} présents`);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F4F4F5', minHeight: '100vh' }}>
      {/* Dark topbar */}
      <div style={{
        background: '#1C1C1C',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
            Pointage journalier — {selectedProject}
          </p>
          <p style={{ fontSize: 11, color: '#A1A1AA', margin: 0, textTransform: 'capitalize' }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{
              fontSize: 12, padding: '6px 10px', borderRadius: 7,
              border: '0.5px solid #3F3F3F', background: '#2A2A2A', color: '#fff',
              cursor: 'pointer',
            }}
          >
            {MOCK_PROJECTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button
            onClick={handleValider}
            style={{
              background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Valider & envoyer
          </button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <KpiCard label="Présents aujourd'hui" value={presents} borderColor="#C85A2A" sub={`sur ${personnel.length + temporaires.length} personnel`} />
          <KpiCard label="Heures normales" value={`${heuresNormales}h`} borderColor="#2D8A5E" sub="8h × présents" />
          <KpiCard label="Heures supplémentaires" value={`${heuresSup}h`} borderColor="#BA7517" sub="× 125% majorées" />
          <KpiCard label="Masse journée" value={fmt(masseJournee)} borderColor="#2A6CB8" sub="Coût main-d'œuvre" />
        </div>

        {/* Two column: CDI + Temp */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* CDI/CDD */}
          <div style={{ background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0 }}>Personnel CDI / CDD</p>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#EFF6FF', color: '#2A6CB8', fontWeight: 600 }}>
                {personnel.filter((p) => p.present).length}/{personnel.length}
              </span>
            </div>
            {personnel.map((p) => (
              <PersonnelCard key={p.id} person={p} onToggle={togglePersonnel} onChangeHs={changeHsCdi} compact={false} />
            ))}
          </div>

          {/* Temporaires */}
          <div style={{ background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0 }}>Personnel journalier (temporaire)</p>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: '#FDF0EA', color: '#C85A2A', fontWeight: 600 }}>
                {temporaires.filter((p) => p.present).length}/{temporaires.length}
              </span>
            </div>
            {temporaires.map((p) => (
              <PersonnelCard key={p.id} person={p} onToggle={toggleTemp} onChangeHs={changeHsTemp} compact={true} />
            ))}

            {/* Add journalier */}
            <div style={{ padding: '10px 12px', borderTop: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', margin: '0 0 8px' }}>Ajouter un journalier</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <input
                  placeholder="Nom complet"
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  style={{ flex: 2, minWidth: 100, fontSize: 11, padding: '6px 8px', borderRadius: 6, border: '0.5px solid #E4E4E7', color: '#18181B' }}
                />
                <input
                  placeholder="Métier"
                  value={newMetier}
                  onChange={(e) => setNewMetier(e.target.value)}
                  style={{ flex: 1, minWidth: 70, fontSize: 11, padding: '6px 8px', borderRadius: 6, border: '0.5px solid #E4E4E7', color: '#18181B' }}
                />
                <input
                  placeholder="Taux MAD/j"
                  type="number"
                  value={newTaux}
                  onChange={(e) => setNewTaux(e.target.value)}
                  style={{ width: 80, fontSize: 11, padding: '6px 8px', borderRadius: 6, border: '0.5px solid #E4E4E7', color: '#18181B' }}
                />
                <button
                  onClick={addJournalier}
                  style={{
                    background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 6,
                    padding: '6px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 14, lineHeight: 1,
                  }}
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks recap */}
        <div style={{ background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0 }}>Récapitulatif tâches du jour</p>
          </div>
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {TASK_CATEGORIES.map((cat) => (
              <label
                key={cat}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `0.5px solid ${taskStates[cat] ? '#C85A2A' : '#E4E4E7'}`,
                  background: taskStates[cat] ? '#FDF0EA' : '#FAFAFA',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <input
                  type="checkbox"
                  checked={taskStates[cat]}
                  onChange={() => setTaskStates((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                  style={{ accentColor: '#C85A2A', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 12, fontWeight: taskStates[cat] ? 600 : 400, color: taskStates[cat] ? '#C85A2A' : '#18181B' }}>
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Flux paie */}
        <div style={{ background: '#fff', border: '0.5px solid #E4E4E7', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0 }}>Flux paie</p>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
            {FLUX_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  minWidth: 80,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i === 0 ? '#C85A2A' : '#F4F4F5',
                    border: `2px solid ${i === 0 ? '#C85A2A' : '#E4E4E7'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i === 0 ? '#fff' : '#71717A',
                    fontWeight: 700, fontSize: 12,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: i === 0 ? '#C85A2A' : '#71717A', fontWeight: i === 0 ? 600 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {i < FLUX_STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2,
                    background: '#E4E4E7',
                    minWidth: 20,
                    marginBottom: 20,
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

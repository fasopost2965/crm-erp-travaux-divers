import React, { useState } from 'react';

const SECTIONS = [
  { id: 'societe', label: 'Ma Société' },
  { id: 'utilisateurs', label: 'Utilisateurs' },
  { id: 'cnss', label: 'Barèmes CNSS' },
  { id: 'facturation', label: 'Facturation' },
  { id: 'notifications', label: 'Notifications' },
];

const DEMO_USERS = [
  { id: 1, nom: 'Karim El Idrissi', email: 'k.elidrissi@atlasworks.ma', role: 'Directeur', statut: 'Actif' },
  { id: 2, nom: 'Fatima Zahra Bennani', email: 'fz.bennani@atlasworks.ma', role: 'Comptable', statut: 'Actif' },
  { id: 3, nom: 'Hassan Tazi', email: 'h.tazi@atlasworks.ma', role: 'Chef de chantier', statut: 'Actif' },
  { id: 4, nom: 'Nadia Chraibi', email: 'n.chraibi@atlasworks.ma', role: 'Commercial', statut: 'Actif' },
  { id: 5, nom: 'Youssef Belkadi', email: 'y.belkadi@atlasworks.ma', role: 'RH', statut: 'Inactif' },
];

const CNSS_RATES = [
  { libelle: 'AMO', salariale: '2,26%', patronale: '4,11%' },
  { libelle: 'Retraite CMR', salariale: '4,29%', patronale: '8,60%' },
  { libelle: 'Allocations familiales', salariale: '0%', patronale: '6,40%' },
  { libelle: 'Accidents travail BTP', salariale: '0%', patronale: '3,26%', note: true },
  { libelle: 'TOTAL', salariale: '6,74%', patronale: '22,37%', total: true },
];

const ROLE_BADGE = {
  Directeur: { background: '#FDF0EA', color: '#C85A2A' },
  Comptable: { background: '#EFF6FF', color: '#2A6CB8' },
  'Chef de chantier': { background: '#DCFCE7', color: '#2D8A5E' },
  Commercial: { background: '#F9F1FF', color: '#7C3AED' },
  RH: { background: '#FEF9C3', color: '#BA7517' },
};

function Badge({ label, customStyle }) {
  const s = customStyle || { background: '#F3F4F6', color: '#71717A' };
  return (
    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, fontWeight: 600, ...s }}>
      {label}
    </span>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 38, height: 22, borderRadius: 11,
        background: checked ? '#C85A2A' : '#E4E4E7',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3, left: checked ? 19 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        fontSize: 12, padding: '7px 10px', borderRadius: 7,
        border: '0.5px solid #E4E4E7',
        color: readOnly ? '#71717A' : '#18181B',
        background: readOnly ? '#FAFAFA' : '#fff',
        outline: 'none', width: '100%', boxSizing: 'border-box',
      }}
    />
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

// ---------- Section components ----------

function SectionSociete() {
  const [form, setForm] = useState({
    raisonSociale: 'Atlas Works SARL',
    ice: '001234567890012',
    if_: 'IF-45678901',
    rc: 'RC-Casa-123456',
    cnss: 'CNSS-7654321',
    adresse: '14, Rue Ibn Sina, Quartier des Affaires',
    ville: 'Casablanca',
    pays: 'Maroc',
    tva: '20',
  });
  const [toast, setToast] = useState(null);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', margin: 0 }}>Ma Société</p>
        <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Informations légales de l'entreprise</p>
      </div>
      <div style={{ padding: 20 }}>
        {/* Logo placeholder */}
        <div style={{
          width: '100%', height: 80, borderRadius: 8,
          border: '1.5px dashed #E4E4E7',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, background: '#FAFAFA', cursor: 'pointer',
        }}>
          <div style={{ textAlign: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.5" style={{ margin: '0 auto 6px', display: 'block' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Cliquer pour uploader le logo</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FieldRow label="Raison sociale">
            <Input value={form.raisonSociale} onChange={set('raisonSociale')} />
          </FieldRow>
          <FieldRow label="ICE (15 chiffres)">
            <Input value={form.ice} onChange={set('ice')} placeholder="000000000000000" />
          </FieldRow>
          <FieldRow label="Identifiant Fiscal (IF)">
            <Input value={form.if_} onChange={set('if_')} />
          </FieldRow>
          <FieldRow label="Registre de Commerce (RC)">
            <Input value={form.rc} onChange={set('rc')} />
          </FieldRow>
          <FieldRow label="N° CNSS">
            <Input value={form.cnss} onChange={set('cnss')} />
          </FieldRow>
          <FieldRow label="TVA par défaut (%)">
            <Input value={form.tva} onChange={set('tva')} type="number" />
          </FieldRow>
          <div style={{ gridColumn: '1 / -1' }}>
            <FieldRow label="Adresse">
              <Input value={form.adresse} onChange={set('adresse')} />
            </FieldRow>
          </div>
          <FieldRow label="Ville">
            <Input value={form.ville} onChange={set('ville')} />
          </FieldRow>
          <FieldRow label="Pays">
            <Input value={form.pays} onChange={set('pays')} />
          </FieldRow>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => { setToast('Paramètres société enregistrés.'); setTimeout(() => setToast(null), 3000); }}
            style={{
              background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function SectionUtilisateurs() {
  const [users, setUsers] = useState(DEMO_USERS);
  const [toast, setToast] = useState(null);

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setToast('Utilisateur supprimé.');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', margin: 0 }}>Utilisateurs</p>
          <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Gestion des accès et rôles</p>
        </div>
        <button
          onClick={() => setToast('Formulaire ajout utilisateur — à implémenter')}
          style={{
            background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 7,
            padding: '7px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '0.5px solid #E4E4E7' }}>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#71717A', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '0.5px solid #F4F4F5' }}>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: '#18181B' }}>{u.nom}</td>
                <td style={{ padding: '9px 12px', color: '#71717A' }}>{u.email}</td>
                <td style={{ padding: '9px 12px' }}>
                  <Badge label={u.role} customStyle={ROLE_BADGE[u.role]} />
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <Badge
                    label={u.statut}
                    customStyle={u.statut === 'Actif' ? { background: '#DCFCE7', color: '#2D8A5E' } : { background: '#F3F4F6', color: '#71717A' }}
                  />
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setToast(`Modification de ${u.nom} — à implémenter`)}
                      style={{ background: '#EFF6FF', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#2A6CB8' }}
                      title="Modifier"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      style={{ background: '#FEE2E2', border: 'none', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', color: '#C84242' }}
                      title="Supprimer"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function SectionCnss() {
  return (
    <div>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', margin: 0 }}>Barèmes CNSS</p>
        <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Taux en vigueur — BTP Maroc 2026</p>
      </div>
      <div style={{ padding: 20 }}>
        <div style={{
          background: '#FEF3C7', border: '0.5px solid #FCD34D',
          borderRadius: 8, padding: '8px 12px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={{ fontSize: 11, color: '#BA7517', margin: 0, fontWeight: 500 }}>
            Taux AT 3,26% spécifique BTP — verrouillé. Mise à jour réglementaire uniquement.
          </p>
        </div>

        <div style={{ border: '0.5px solid #E4E4E7', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1C1C1C' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#A1A1AA', fontWeight: 600, fontSize: 11 }}>Cotisation</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#6EE7A0', fontWeight: 600, fontSize: 11 }}>Part salariale</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#FCA5A5', fontWeight: 600, fontSize: 11 }}>Part patronale</th>
              </tr>
            </thead>
            <tbody>
              {CNSS_RATES.map((r, i) => (
                <tr
                  key={r.libelle}
                  style={{
                    borderBottom: i < CNSS_RATES.length - 1 ? '0.5px solid #F4F4F5' : 'none',
                    background: r.total ? '#FAFAFA' : '#fff',
                  }}
                >
                  <td style={{ padding: '9px 14px', color: '#18181B', fontWeight: r.total ? 700 : 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {r.note && (
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 5, background: '#FEF3C7', color: '#BA7517', fontWeight: 600 }}>BTP</span>
                    )}
                    {r.libelle}
                    {r.note && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    )}
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: r.total ? 700 : 600, color: r.total ? '#2D8A5E' : '#18181B' }}>
                    {r.salariale}
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: r.total ? 700 : 600, color: r.total ? '#C84242' : '#18181B' }}>
                    {r.patronale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SectionFacturation() {
  const [form, setForm] = useState({
    prefixeDevis: 'DEV-',
    prefixeFacture: 'FAC-',
    prefixeSituation: 'SIT-',
    conditionsPaiement: '30',
    retenueGarantie: '10',
    piedPage: 'Atlas Works SARL — ICE: 001234567890012 — CNSS: 7654321\nBanque: Attijariwafa Bank — RIB: 007 780 0001234567890145 23\nMerci de votre confiance.',
  });
  const [toast, setToast] = useState(null);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', margin: 0 }}>Facturation</p>
        <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Paramètres de numérotation et conditions</p>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Numérotation</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <FieldRow label="Préfixe devis">
            <Input value={form.prefixeDevis} onChange={set('prefixeDevis')} />
          </FieldRow>
          <FieldRow label="Préfixe facture">
            <Input value={form.prefixeFacture} onChange={set('prefixeFacture')} />
          </FieldRow>
          <FieldRow label="Préfixe situation">
            <Input value={form.prefixeSituation} onChange={set('prefixeSituation')} />
          </FieldRow>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 12 }}>Conditions financières</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <FieldRow label="Délai de paiement par défaut (jours)">
            <Input value={form.conditionsPaiement} onChange={set('conditionsPaiement')} type="number" />
          </FieldRow>
          <FieldRow label="Retenue de garantie (%)">
            <Input value={form.retenueGarantie} onChange={set('retenueGarantie')} type="number" />
          </FieldRow>
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>Pied de page facture</p>
        <textarea
          value={form.piedPage}
          onChange={set('piedPage')}
          rows={4}
          style={{
            width: '100%', fontSize: 11, padding: '8px 10px', borderRadius: 7,
            border: '0.5px solid #E4E4E7', color: '#18181B', resize: 'vertical',
            fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', outline: 'none',
          }}
        />

        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => { setToast('Paramètres de facturation enregistrés.'); setTimeout(() => setToast(null), 3000); }}
            style={{
              background: '#C85A2A', color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function SectionNotifications() {
  const [notifs, setNotifs] = useState({
    factureImpayee: true,
    stockSeuil: true,
    chantierRetard: true,
    demandeDevis: false,
  });

  const items = [
    { key: 'factureImpayee', label: 'Facture impayée > 30 jours', desc: 'Alerte si une facture dépasse 30j sans règlement' },
    { key: 'stockSeuil', label: 'Stock sous seuil', desc: 'Notification quand une ressource atteint le seuil minimal' },
    { key: 'chantierRetard', label: 'Chantier en retard', desc: 'Alerter si le planning prévu est dépassé' },
    { key: 'demandeDevis', label: 'Nouvelle demande de devis', desc: 'Notifier à chaque nouvelle demande entrante' },
  ];

  return (
    <div>
      <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#18181B', margin: 0 }}>Notifications</p>
        <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>Alertes et déclencheurs automatiques</p>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px',
              border: '0.5px solid #E4E4E7', borderRadius: 8,
              background: notifs[item.key] ? '#FDF0EA' : '#fff',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ flex: 1, marginRight: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#18181B', margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 11, color: '#71717A', margin: 0 }}>{item.desc}</p>
            </div>
            <Toggle
              checked={notifs[item.key]}
              onChange={() => setNotifs((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main component ----------

export default function Parametres() {
  const [activeSection, setActiveSection] = useState('societe');

  const renderContent = () => {
    switch (activeSection) {
      case 'societe': return <SectionSociete />;
      case 'utilisateurs': return <SectionUtilisateurs />;
      case 'cnss': return <SectionCnss />;
      case 'facturation': return <SectionFacturation />;
      case 'notifications': return <SectionNotifications />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F4F4F5', minHeight: '100vh' }}>
      {/* Title bar */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #E4E4E7', padding: '14px 24px' }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#18181B', margin: 0 }}>Paramètres</p>
        <p style={{ fontSize: 12, color: '#71717A', margin: 0 }}>Configuration de l'application Atlas Works</p>
      </div>

      <div style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{
          width: 200, flexShrink: 0,
          background: '#fff', border: '0.5px solid #E4E4E7',
          borderRadius: 10, overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '0.5px solid #E4E4E7', background: '#FAFAFA' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#71717A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Sections
            </p>
          </div>
          {SECTIONS.map((sec) => {
            const isActive = sec.id === activeSection;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 14px',
                  background: isActive ? '#FDF0EA' : '#fff',
                  borderLeft: isActive ? '3px solid #C85A2A' : '3px solid transparent',
                  border: 'none',
                  borderBottom: '0.5px solid #F4F4F5',
                  color: isActive ? '#C85A2A' : '#18181B',
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#fff'; }}
              >
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Content panel */}
        <div style={{
          flex: 1, minWidth: 0,
          background: '#fff', border: '0.5px solid #E4E4E7',
          borderRadius: 10, overflow: 'hidden',
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

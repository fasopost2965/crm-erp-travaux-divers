import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IC = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  accounts: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  contact: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8',
  leads: 'M22 12h-4l-3 9L9 3l-3 9H2',
  opportunity: 'M18 20V10M12 20V4M6 20v-6',
  quote: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  project: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  pointage: 'M12 2a10 10 0 100 20A10 10 0 0012 2M12 6v6l4 2',
  situations: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  invoice: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  tresorerie: 'M3 3h18v4H3zM3 10h18v4H3zM3 17h18v4H3z',
  parametres: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  reports: 'M12 20V10M18 20V4M6 20v-6',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
};

const NavSection = ({ label, children, show }) => {
  if (!show) return null;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ padding: '10px 14px 4px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </div>
      {children}
    </div>
  );
};

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '8px 14px',
      margin: '1px 6px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: active ? 500 : 400,
      color: active ? '#E8784A' : 'rgba(255,255,255,0.55)',
      background: active ? 'rgba(200,90,42,0.18)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.12s',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
  >
    <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>
      <IC d={ICONS[icon]} size={15} />
    </span>
    {label}
  </Link>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role?.slug;

  const getDashboardPath = () => {
    switch (role) {
      case 'directeur': case 'admin': case 'super_admin': return '/dashboard/director';
      case 'commercial': return '/dashboard/commercial';
      case 'chef_chantier': return '/dashboard/project-manager';
      case 'finance': return '/dashboard/finance';
      default: return '/dashboard';
    }
  };

  const isActive = (path) => {
    if (path === getDashboardPath()) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const has = (...roles) => roles.includes(role);
  const isCRM = has('directeur', 'admin', 'super_admin', 'commercial');
  const isChantier = has('directeur', 'admin', 'super_admin', 'chef_chantier');
  const isFinance = has('directeur', 'admin', 'super_admin', 'finance');
  const isAdmin = has('admin', 'super_admin', 'directeur');

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1C1C1C' }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 14px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, background: '#C85A2A', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>Atlas Works</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>ERP · BTP Maroc</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <NavSection label="Tableau de bord" show>
          <NavItem to={getDashboardPath()} icon="dashboard" label="Tableau de bord" active={isActive(getDashboardPath())} />
        </NavSection>

        <NavSection label="Commercial" show={isCRM}>
          <NavItem to="/dashboard/accounts" icon="accounts" label="Clients & CRM" active={isActive('/dashboard/accounts')} />
          <NavItem to="/dashboard/contacts" icon="contact" label="Contacts" active={isActive('/dashboard/contacts')} />
          <NavItem to="/dashboard/leads" icon="leads" label="Leads" active={isActive('/dashboard/leads')} />
          <NavItem to="/dashboard/opportunities" icon="opportunity" label="Opportunités" active={isActive('/dashboard/opportunities')} />
          <NavItem to="/dashboard/quotes" icon="quote" label="Devis" active={isActive('/dashboard/quotes')} />
        </NavSection>

        <NavSection label="Chantiers" show={isChantier || isFinance}>
          {isChantier && <NavItem to="/dashboard/projects" icon="project" label="Projets & Chantiers" active={isActive('/dashboard/projects')} />}
          {isChantier && <NavItem to="/dashboard/pointage" icon="pointage" label="Pointage journalier" active={isActive('/dashboard/pointage')} />}
          {(isAdmin || isFinance) && <NavItem to="/dashboard/situations" icon="situations" label="Situations de travaux" active={isActive('/dashboard/situations')} />}
        </NavSection>

        <NavSection label="Finance" show={isFinance}>
          <NavItem to="/dashboard/invoices" icon="invoice" label="Factures & Règlements" active={isActive('/dashboard/invoices')} />
          <NavItem to="/dashboard/tresorerie" icon="tresorerie" label="Trésorerie" active={isActive('/dashboard/tresorerie')} />
        </NavSection>

        <NavSection label="Général" show>
          {isAdmin && <NavItem to="/dashboard/parametres" icon="parametres" label="Paramètres" active={isActive('/dashboard/parametres')} />}
        </NavSection>
      </div>

      {/* User footer */}
      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C85A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            {userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{user?.role?.name}</div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, borderRadius: 4 }}
            title="Déconnexion"
          >
            <IC d={ICONS.logout} size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 200, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', flexDirection: 'column' }} className="hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}
          onClick={() => setMobileOpen(false)}
        >
          <div style={{ width: 200, height: '100%' }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: 44, background: '#fff', borderBottom: '0.5px solid #E4E4E7', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', padding: 4 }}
          >
            <IC d={ICONS.menu} size={18} />
          </button>
          <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 22, height: 22, background: '#C85A2A', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>A</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#18181B' }}>Atlas Works</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F4F4F5', borderRadius: 6, padding: '4px 10px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C85A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {userInitial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#18181B' }}>{user?.name}</span>
                <span style={{ fontSize: 10, color: '#71717A' }}>{user?.role?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1C1C1C', borderTop: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', zIndex: 30 }}>
        {[
          { to: getDashboardPath(), icon: 'dashboard', label: 'Accueil' },
          ...(isCRM ? [{ to: '/dashboard/accounts', icon: 'accounts', label: 'CRM' }] : []),
          ...(isChantier ? [{ to: '/dashboard/projects', icon: 'project', label: 'Chantiers' }] : []),
          ...(isFinance ? [{ to: '/dashboard/invoices', icon: 'invoice', label: 'Finance' }] : []),
          ...(isAdmin ? [{ to: '/dashboard/parametres', icon: 'parametres', label: 'Réglages' }] : []),
        ].slice(0, 5).map((item, i) => {
          const active = isActive(item.to);
          return (
            <Link key={i} to={item.to} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', color: active ? '#E8784A' : 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 10, gap: 3 }}>
              <IC d={ICONS[item.icon]} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;

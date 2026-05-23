import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/common/NotificationBell';

/* ── Nav items grouped by section ──────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: null,
    items: [
      {
        key: 'dashboard',
        label: 'Tableau de bord',
        path: null, // dynamic, resolved below
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial', 'chef_chantier', 'finance', 'technicien'],
      },
    ],
  },
  {
    label: 'CRM & Commercial',
    items: [
      {
        key: 'accounts',
        label: 'Clients & CRM',
        path: '/dashboard/accounts',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial'],
      },
      {
        key: 'leads',
        label: 'Leads',
        path: '/dashboard/leads',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial'],
      },
      {
        key: 'opportunities',
        label: 'Opportunités',
        path: '/dashboard/opportunities',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial'],
      },
      {
        key: 'contacts',
        label: 'Contacts',
        path: '/dashboard/contacts',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial'],
      },
      {
        key: 'quotes',
        label: 'Devis',
        path: '/dashboard/quotes',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial'],
      },
    ],
  },
  {
    label: 'Terrain & Production',
    items: [
      {
        key: 'projects',
        label: 'Chantiers',
        path: '/dashboard/projects',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'chef_chantier', 'technicien'],
      },
    ],
  },
  {
    label: 'Finance & RH',
    items: [
      {
        key: 'invoices',
        label: 'Factures',
        path: '/dashboard/invoices',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'finance'],
      },
      {
        key: 'rh',
        label: 'RH & Personnel',
        path: '/dashboard/rh',
        icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></>,
        allowedRoles: ['directeur', 'admin', 'super_admin', 'rh'],
      },
    ],
  },
  {
    label: 'Pilotage',
    items: [
      {
        key: 'analytics',
        label: 'Analytique',
        path: '/dashboard/analytics',
        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
        allowedRoles: ['directeur', 'admin', 'super_admin'],
      },
    ],
  },
];

/* ── Dashboard paths by role ──────────────────────────────────────── */
const getDashPath = (role) => {
  switch (role) {
    case 'directeur': case 'admin': case 'super_admin': return '/dashboard/director';
    case 'commercial': return '/dashboard/commercial';
    case 'chef_chantier': return '/dashboard/project-manager';
    case 'finance': return '/dashboard/finance';
    case 'technicien': return '/dashboard/projects';
    case 'rh': return '/dashboard/rh';
    default: return '/dashboard';
  }
};

/* ── Nav Icon wrapper ─────────────────────────────────────────────── */
const NavIcon = ({ paths, className = '' }) => (
  <svg className={`w-[18px] h-[18px] shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    {paths}
  </svg>
);

/* ── Single sidebar link ──────────────────────────────────────────── */
const SidebarLink = ({ item, isActive, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/20'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <NavIcon
      paths={item.icon}
      className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors'}
    />
    <span className="truncate">{item.label}</span>
  </Link>
);

/* ══════════════════════════════════════════════════════════════════ */
const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const role = user?.role?.slug;
  const dashPath = getDashPath(role);

  const resolveItem = (item) => ({
    ...item,
    path: item.path ?? dashPath,
  });

  const isActive = (path) => {
    if (!path) return false;
    if (path === dashPath && (location.pathname === dashPath || location.pathname === '/dashboard')) return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  /* Flatten items for mobile bottom bar */
  const allItems = NAV_SECTIONS.flatMap(s => s.items)
    .map(resolveItem)
    .filter(i => i.allowedRoles.includes(role));

  const mobileBottomItems = allItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-slate-950 flex font-sans">

      {/* ═══════════════════════════════════════════
          OVERLAY MOBILE
      ═══════════════════════════════════════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════ */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        flex flex-col w-60 shrink-0
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="h-14 px-5 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-sm shadow-blue-600/30">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div className="min-w-0">
            <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Atlas Works</span>
            <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest leading-none">BTP & Chantiers</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section, si) => {
            const visibleItems = section.items
              .map(resolveItem)
              .filter(i => i.allowedRoles.includes(role));
            if (!visibleItems.length) return null;
            return (
              <div key={si} className="space-y-0.5">
                {section.label && (
                  <p className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                    {section.label}
                  </p>
                )}
                {visibleItems.map((item) => (
                  <SidebarLink
                    key={item.key}
                    item={item}
                    isActive={isActive(item.path)}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-black text-white text-xs shrink-0">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate uppercase tracking-wider font-semibold">{user?.role?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN AREA
      ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">

        {/* ── Topbar ─────────────────────────────── */}
        <header className="h-14 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">

          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb-style current section title on desktop */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              {allItems.find(i => isActive(i.path)) && (
                <>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">
                    {NAV_SECTIONS.find(s => s.items.some(i => isActive(resolveItem(i).path)))?.label ?? 'Tableau de bord'}
                  </span>
                  <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-slate-800 dark:text-white font-semibold">
                    {allItems.find(i => isActive(i.path))?.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <NotificationBell />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-black text-white text-xs">
                  {user?.name?.charAt(0) ?? 'U'}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-300">{user?.name?.split(' ')[0]}</span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Page content ───────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM BAR
      ═══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 flex items-center justify-around px-2 safe-area-inset-bottom">
        {mobileBottomItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <NavIcon paths={item.icon} className={active ? 'text-blue-600 dark:text-blue-400' : ''} />
              <span className="text-[9px] font-bold truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        {/* More button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[9px] font-bold">Menu</span>
        </button>
      </nav>

    </div>
  );
};

export default DashboardLayout;

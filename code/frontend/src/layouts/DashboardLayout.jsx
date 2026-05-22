import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const role = user?.role?.slug;

  // Déterminer la route du Dashboard principal selon le rôle de l'utilisateur
  const getDashboardHomePath = () => {
    switch (role) {
      case 'directeur':
      case 'admin':
      case 'super_admin':
        return '/dashboard/director';
      case 'commercial':
        return '/dashboard/commercial';
      case 'chef_chantier':
        return '/dashboard/project-manager';
      case 'finance':
        return '/dashboard/finance';
      default:
        return '/dashboard';
    }
  };

  // Liste globale des liens de navigation configurée dynamiquement selon le rôle (RBAC)
  const navItems = [
    {
      label: 'Tableau de bord',
      path: getDashboardHomePath(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial', 'chef_chantier', 'finance']
    },
    {
      label: 'Clients & CRM',
      path: '/dashboard/accounts',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial']
    },
    {
      label: 'Devis',
      path: '/dashboard/quotes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin', 'commercial']
    },
    {
      label: 'Chantiers & Projets',
      path: '/dashboard/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin', 'chef_chantier']
    },
    {
      label: 'Factures & Paiements',
      path: '/dashboard/invoices',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin', 'finance']
    },
    {
      label: 'Saisie d\'Heures',
      path: '/dashboard/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      allowedRoles: ['chef_chantier']
    },
    {
      label: 'Rapports & Audit',
      path: '#', // Structure
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      allowedRoles: ['directeur', 'admin', 'super_admin']
    },
    {
      label: 'Paramètres',
      path: '#', // Structure
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      allowedRoles: ['admin', 'super_admin']
    }
  ];

  // Filtrer les onglets de navigation par rôle
  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans">
      
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 text-slate-350 border-r border-slate-800 relative z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center font-black text-white text-base">
            A
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">
            Atlas <span className="text-blue-500">Works</span>
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} transition-colors`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-extrabold text-sm flex items-center justify-center">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-none mb-1">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate leading-none uppercase tracking-wider">{user?.role?.name}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-850 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* 2. TOPBAR FOR MOBILE AND MAIN AREA CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
          {/* Logo on mobile / Sidebar collapse button */}
          <div className="flex items-center md:hidden space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              A
            </div>
            <span className="text-slate-900 dark:text-white font-black text-base tracking-tight">Atlas Works</span>
          </div>

          <div className="hidden md:block text-sm font-semibold text-slate-400 dark:text-slate-500">
            Portail Professionnel BTP
          </div>

          {/* User actions / notifications */}
          <div className="flex items-center space-x-4 relative">
            {/* Mock Notification bell */}
            <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-450 relative hover:scale-105 transition-transform cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </button>

            {/* User Dropdown Toggle */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-450 font-extrabold text-xs flex items-center justify-center">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <>
                  {/* Backdrop close */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)}></div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-850">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{user?.role?.name}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN SCROLLABLE CONTENT SLOT */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 4. MOBILE BOTTOM BAR NAVIGATION (DIRECT ACTION MENU FOR THUMB) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 z-30 flex items-center justify-around px-4 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
        {/* We present a maximum of 4 compact links appropriate for thumb actions on mobile */}
        {filteredNavItems.slice(0, 4).map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-500 scale-105' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-[9px] font-bold mt-1 tracking-tight truncate max-w-[70px]">
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
};

export default DashboardLayout;

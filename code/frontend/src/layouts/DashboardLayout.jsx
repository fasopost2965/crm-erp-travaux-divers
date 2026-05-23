import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const primaryNav = filteredNavItems.filter((item) => !['Rapports & Audit', 'Paramètres'].includes(item.label));
  const secondaryNav = filteredNavItems.filter((item) => ['Rapports & Audit', 'Paramètres'].includes(item.label));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white text-slate-900 border-r border-slate-200 relative z-30">
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-200">
          <div className="w-11 h-11 rounded-3xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Atlas Works</p>
            <p className="text-xs text-slate-500">Portail BTP</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">Menu</p>
            <div className="space-y-2">
              {primaryNav.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 mb-3">Général</p>
            <div className="space-y-2">
              {secondaryNav.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-5">
          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl text-white flex items-center justify-center font-black" style={{ backgroundColor: 'var(--color-primary)' }}>
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.role?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-2xl bg-slate-900 text-white py-2 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <header className="h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black" style={{ backgroundColor: 'var(--color-primary)' }}>A</div>
              <span className="text-slate-900 font-bold">Atlas Works</span>
            </div>
            <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-3 py-2 gap-3 shadow-sm">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
              </svg>
              <input
                type="search"
                placeholder="Rechercher"
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 w-52"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18V8H3v8z" />
              </svg>
            </button>
            <button className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 inline-flex h-2.5 w-2.5 rounded-full border border-white" style={{ backgroundColor: 'var(--color-accent)' }}></span>
            </button>
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-slate-100 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left leading-none">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role?.name}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

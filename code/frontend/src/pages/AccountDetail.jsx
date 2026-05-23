import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Récupérer le compte client détaillé via React Query depuis l'API Laravel
  const { data: account, isLoading, error } = useQuery({
    queryKey: ['accountDetail', id],
    queryFn: async () => {
      // Laravel preloads ['contacts', 'opportunities'] in AccountController@show
      const response = await api.get(`/api/accounts/${id}`);
      return response.data.data || response.data;
    }
  });

  if (isLoading) {
    return <LoadingSpinner fullPage message="Chargement de la fiche client..." />;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-red-700 font-medium">
        ⚠️ Erreur lors de la récupération de la fiche client : {error.message}.
      </div>
    );
  }

  // Formatage des montants monétaires en Dirhams marocains (DH)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })
      .format(val)
      .replace('MAD', 'DH');
  };

  const acc = account || {};

  return (
    <div className="space-y-6">
      
      {/* Page Header with breadcrumb and return actions */}
      <PageHeader 
        title={acc.name || "Fiche Client"} 
        breadcrumb={[
          { label: "CRM", path: "/dashboard/accounts" }, 
          { label: "Détails du Client" }
        ]}
        actions={
          <button 
            onClick={() => navigate('/dashboard/accounts')}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour à l'annuaire</span>
          </button>
        }
      />

      {/* 360 Client Header Summary Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
            {acc.name?.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-850 leading-none">
              {acc.name}
            </h2>
            <p className="text-xs font-semibold text-slate-400 flex items-center">
              📍 {acc.address ? `${acc.address}, ${acc.city}` : acc.city}
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-bold text-slate-500">
              {acc.email && (
                <a href={`mailto:${acc.email}`} className="hover:text-blue-500 flex items-center space-x-1">
                  <span>✉️</span> <span className="underline">{acc.email}</span>
                </a>
              )}
              {acc.phone && (
                <a href={`tel:${acc.phone}`} className="hover:text-blue-500 flex items-center space-x-1">
                  <span>📞</span> <span>{acc.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Legal Moroccan Identity Identifiers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ICE</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{acc.ice || 'Non spécifié'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RC</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{acc.rc || 'Non spécifié'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patente</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{acc.patente || 'Non spécifié'}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IF</p>
            <p className="text-xs font-black text-slate-800 mt-0.5">{acc.iff || 'Non spécifié'}</p>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 relative transition-all cursor-pointer ${
            activeTab === 'overview' 
              ? 'text-blue-650' 
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          Aperçu
          {activeTab === 'overview' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`pb-3 relative transition-all cursor-pointer ${
            activeTab === 'contacts' 
              ? 'text-blue-650' 
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          Contacts ({acc.contacts?.length || 0})
          {activeTab === 'contacts' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 relative transition-all cursor-pointer ${
            activeTab === 'opportunities' 
              ? 'text-blue-650' 
              : 'text-slate-450 hover:text-slate-700'
          }`}
        >
          Opportunités ({acc.opportunities?.length || 0})
          {activeTab === 'opportunities' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Tab Contents Container */}
      <div className="space-y-6">
        
        {/* Tab 1: OVERVIEW COMPONENT */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Legal Information Summary Grid */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Fiche d'identité Fiscale & Légale (Maroc)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Nom Légal de l'Entreprise</span>
                  <span className="text-slate-800 font-extrabold block mt-0.5">{acc.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Siège Social / Adresse</span>
                  <span className="text-slate-800 font-bold block mt-0.5">
                    {acc.address ? `${acc.address}, ${acc.city}` : `${acc.city}, Maroc`}
                  </span>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Identifiant Commun de l'Entreprise (ICE)</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{acc.ice || 'Non renseigné'}</span>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Registre du Commerce (RC)</span>
                  <span className="text-slate-800 font-bold block mt-0.5">
                    {acc.rc ? `N° ${acc.rc} (${acc.city})` : 'Non renseigné'}
                  </span>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Identifiant Fiscal (IF)</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{acc.iff || 'Non renseigné'}</span>
                </div>
                <div className="border-t border-slate-50 pt-4">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Taxe Professionnelle (Patente)</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{acc.patente || 'Non renseigné'}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Overview - Timeline of account history */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                Activité récente du compte
              </h3>
              
              <div className="relative border-l border-slate-100 ml-3 space-y-6 py-2">
                <div className="relative pl-6 group">
                  <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600"></div>
                  <h4 className="text-xs font-bold text-slate-800">Création du Compte CRM</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Non spécifiée'}
                  </p>
                </div>
                <div className="relative pl-6 group">
                  <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-400"></div>
                  <h4 className="text-xs font-bold text-slate-800">Dernière mise à jour</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {acc.updatedAt ? new Date(acc.updatedAt).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Non spécifiée'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: CONTACTS LIST */}
        {activeTab === 'contacts' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6">
              Interlocuteurs & Contacts Associés
            </h3>

            {!acc.contacts || acc.contacts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">
                Aucun contact associé à ce compte pour le moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {acc.contacts.map((contact) => (
                  <div key={contact.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col justify-between hover:border-slate-200 transition-all duration-300">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {contact.position || 'Interlocuteur'}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-800 pt-1">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <div className="text-xs font-semibold text-slate-500 pt-1 space-y-1">
                        {contact.email && (
                          <p className="flex items-center space-x-1.5">
                            <span>✉️</span> <a href={`mailto:${contact.email}`} className="underline hover:text-blue-500">{contact.email}</a>
                          </p>
                        )}
                        {contact.phone && (
                          <p className="flex items-center space-x-1.5">
                            <span>📞</span> <a href={`tel:${contact.phone}`} className="hover:text-blue-500">{contact.phone}</a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: OPPORTUNITIES LIST */}
        {activeTab === 'opportunities' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-6">
              Pipeline des Opportunités Associées
            </h3>

            {!acc.opportunities || acc.opportunities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium text-sm">
                Aucune opportunité commerciale rattachée à ce client.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {acc.opportunities.map((opp) => (
                  <div key={opp.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {opp.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400">
                        <span>Échéance de signature : {opp.closeDate ? new Date(opp.closeDate).toLocaleDateString('fr-FR') : 'Non renseignée'}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-bold">Probabilité : {opp.probability || 0}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 self-start sm:self-auto">
                      <span className="text-sm font-black text-slate-850">
                        {formatCurrency(opp.estimatedBudget || 0)}
                      </span>
                      <StatusBadge status={opp.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default AccountDetail;

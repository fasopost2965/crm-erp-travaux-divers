import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  // Définir la configuration des couleurs HSL en fonction du statut
  const getStatusStyle = (val) => {
    const s = val.toLowerCase().trim();

    switch (s) {
      // Positif / Succès / Complété
      case 'payée':
      case 'gagnée':
      case 'accepté':
      case 'terminé':
      case 'validé':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';

      case 'en cours':
      case 'émise':
      case 'contacté':
      case 'qualifié':
      case 'qualification':
      case 'proposition':
      case 'négociation':
      case 'envoyé':
        return 'bg-blue-50 text-blue-700 border border-blue-200';

      case 'à commencer':
      case 'à faire':
      case 'partiellement payée':
      case 'nouveau':
      case 'soumis':
      case 'planifié':
        return 'bg-amber-50 text-amber-700 border border-amber-200';

      case 'en retard':
      case 'bloqué':
      case 'suspendu':
      case 'refusé':
      case 'perdu':
      case 'rejeté':
        return 'bg-rose-50 text-rose-700 border border-rose-200';

      case 'brouillon':
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold leading-relaxed tracking-wide ${getStatusStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {status}
    </span>
  );
};

export default StatusBadge;

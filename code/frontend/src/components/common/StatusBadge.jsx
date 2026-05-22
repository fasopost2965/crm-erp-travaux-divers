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
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';

      // En cours / Actif
      case 'en cours':
      case 'émise':
      case 'contacté':
      case 'qualifié':
      case 'qualification':
      case 'proposition':
      case 'négociation':
      case 'envoyé':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';

      // En attente / Attention modérée
      case 'à commencer':
      case 'à faire':
      case 'partiellement payée':
      case 'nouveau':
      case 'soumis':
      case 'planifié':
        return 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/20';

      // Négatif / Bloqué / En retard
      case 'en retard':
      case 'bloqué':
      case 'suspendu':
      case 'refusé':
      case 'perdu':
      case 'rejeté':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';

      // Neutre / Brouillon
      case 'brouillon':
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
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

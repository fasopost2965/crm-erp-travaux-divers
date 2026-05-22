import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  onRowClick = null,
  emptyTitle = "Aucune donnée",
  emptyDescription = "Aucun élément ne correspond à votre recherche ou filtre.",
  // Pagination optional props
  paginationMeta = null, // { currentPage, lastPage, perPage, total }
  onPageChange = null
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <LoadingSpinner message="Chargement du tableau..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      {/* Table container with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, rowIdx) => (
              <tr 
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={`px-6 py-4 text-sm text-slate-655 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors ${col.className || ''}`}
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Actions */}
      {paginationMeta && onPageChange && paginationMeta.lastPage > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between">
          <span className="text-xs text-slate-450 dark:text-slate-500 font-medium">
            Affichage de la page <strong className="text-slate-700 dark:text-slate-350">{paginationMeta.currentPage}</strong> sur <strong className="text-slate-700 dark:text-slate-350">{paginationMeta.lastPage}</strong>
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(paginationMeta.currentPage - 1)}
              disabled={paginationMeta.currentPage === 1}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer transition-all"
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(paginationMeta.currentPage + 1)}
              disabled={paginationMeta.currentPage === paginationMeta.lastPage}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer transition-all"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

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
  paginationMeta = null,
  onPageChange = null
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <LoadingSpinner message="Chargement du tableau..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderTop: '2px solid #C85A2A', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FAFAFA' }}>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                style={{ ':hover': {} }}
                onMouseEnter={e => { if (onRowClick) e.currentTarget.style.backgroundColor = '#FDF0EA'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-2.5 text-[12px] text-slate-700 font-medium ${col.className || ''}`}
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginationMeta && onPageChange && paginationMeta.lastPage > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Page <strong className="text-slate-700">{paginationMeta.currentPage}</strong> sur <strong className="text-slate-700">{paginationMeta.lastPage}</strong>
            {paginationMeta.total && <span className="ml-2 text-slate-400">— {paginationMeta.total} résultats</span>}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(paginationMeta.currentPage - 1)}
              disabled={paginationMeta.currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold text-slate-600 transition-all cursor-pointer"
            >
              ← Précédent
            </button>
            <button
              onClick={() => onPageChange(paginationMeta.currentPage + 1)}
              disabled={paginationMeta.currentPage === paginationMeta.lastPage}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold text-slate-600 transition-all cursor-pointer"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

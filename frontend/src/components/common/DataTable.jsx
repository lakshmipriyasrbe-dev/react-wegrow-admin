import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function DataTable({ title, columns, data = [], onAdd, addLabel = "Add New", searchPlaceholder = "Search..." }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = data.filter((row) =>
    columns.some((col) => {
      const val = row[col.accessor];
      return val ? String(val).toLowerCase().includes(search.toLowerCase()) : false;
    })
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${title || 'Export'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
      {/* Header controls */}
      <div className="p-5 border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-brand-950">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} total records found</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={exportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            title="Export Excel"
          >
            <i className="fa-solid fa-file-excel text-green-600"></i>
            <span>Export</span>
          </button>

          {onAdd && (
            <button
              onClick={onAdd}
              className="px-4 py-2 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus"></i>
              <span>{addLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-surface-border">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-5 py-3.5">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {paginated.length > 0 ? (
              paginated.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-5 py-3.5 font-medium">
                      {col.render ? col.render(row) : (row[col.accessor] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 font-medium">
                  No records found matching criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3.5 border-t border-surface-border flex items-center justify-between text-xs text-slate-500">
        <span>Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

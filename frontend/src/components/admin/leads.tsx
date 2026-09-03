import { useEffect, useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { LuRefreshCcw, LuDownload } from "react-icons/lu";

export type Lead = {
  _id?: string;
  name: string;
  phone: string;
  source?: string;
  createdAt?: string;
};

export default function LeadsManagement() {
  const { showToast } = useStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const apiUrl = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';
      const res = await fetch(`${apiUrl}/api/leads`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        showToast((json && (json.error || json.message)) || 'Failed to fetch leads', 'error');
        setLeads([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Expecting an array of leads; normalize if returned as { leads: [] }
      const arr = Array.isArray(data) ? data : data.leads || [];
      // sort by createdAt desc if present
      arr.sort((a: any, b: any) => {
        const ta = new Date(a.createdAt || a.savedAt || 0).getTime();
        const tb = new Date(b.createdAt || b.savedAt || 0).getTime();
        return tb - ta;
      });
      setLeads(arr);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to fetch leads', 'error');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };


  const totalPages = Math.max(1, Math.ceil(leads.length / rowsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(
    () => leads.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [leads, page],
  );

  // Export currently visible page to CSV (Excel-compatible)
  const exportCsv = () => {
    if (!paginated || paginated.length === 0) {
      showToast('No leads to export for this page', 'warning');
      return;
    }

    const headers = ['Name', 'Phone', 'Source'];
    const rows = paginated.map((l) => [
      l.name || '',
      l.phone || '',
      l.source || '',
    ]);

    const escapeCell = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      const escaped = s.replace(/"/g, '""');
      if (/[",\n]/.test(s)) return `"${escaped}"`;
      return escaped;
    };

    const csvContent = [headers, ...rows]
      .map((r) => r.map(escapeCell).join(','))
      .join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-page-${page}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gold-100">
        <div>
          <h2 className="text-lg font-display font-bold text-maroon-900">Leads</h2>
          <p className="text-xs text-maroon-700/70 mt-1">All collected leads (name, phone and source)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            title="Export current page"
            className="inline-flex items-center gap-2 rounded-full bg-maroon-50 text-maroon-700 px-3 py-2 hover:bg-maroon-100 transition-colors text-sm"
          >
            <LuDownload />
            Export
          </button>
          <button
            onClick={loadLeads}
            title="Refresh"
            className="inline-flex items-center gap-2 rounded-full bg-maroon-50 text-maroon-700 px-3 py-2 hover:bg-maroon-100 transition-colors text-sm"
          >
            <LuRefreshCcw />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="rounded-2xl border border-gold-100 bg-gold-50 p-8 text-center text-sm text-maroon-900">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-gold-100 bg-gold-50 p-8 text-center text-sm text-maroon-900">No leads found.</div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gold-100">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-maroon-50 text-maroon-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {paginated.map((l, idx) => (
                    <tr key={l._id || idx} className="hover:bg-maroon-50 transition-colors">
                      <td className="px-4 py-4 text-maroon-900 font-medium">{l.name || '-'}</td>
                      <td className="px-4 py-4 text-maroon-700 whitespace-nowrap">{l.phone || '-'}</td>
                      <td className="px-4 py-4 text-maroon-900">{l.source || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-maroon-700">
              <div>
                Showing {paginated.length} of {leads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`px-3 py-2 rounded-full border transition-colors ${page === 1
                    ? 'border-gold-200 bg-gold-50 text-maroon-400 cursor-not-allowed'
                    : 'border-gold-200 bg-white text-maroon-900 hover:bg-maroon-50'
                    }`}
                >
                  Previous
                </button>
                <span className="font-semibold">Page {page} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-3 py-2 rounded-full border transition-colors ${page === totalPages
                    ? 'border-gold-200 bg-gold-50 text-maroon-400 cursor-not-allowed'
                    : 'border-gold-200 bg-white text-maroon-900 hover:bg-maroon-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

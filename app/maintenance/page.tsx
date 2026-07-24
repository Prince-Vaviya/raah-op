"use client";
import { useState, useEffect } from "react";
import { Wrench, CheckCircle, Clock, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { API_URL, fetchMaintenance } from "../../lib/api";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async (force: boolean = false) => {
    try {
      if (force) {
        const { clearCache } = await import("../../lib/api");
        clearCache('maintenance');
      }
      const data = await fetchMaintenance();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => fetchLogs(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLogs(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const markResolved = async (id: string) => {
    // Optimistically update list state immediately
    setLogs(prev => prev.map(log => log.id === id ? { ...log, status: 'RESOLVED' } : log));
    try {
      await fetch(`${API_URL}/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      await fetchLogs(true);
    } catch (e) {
      console.error(e);
      await fetchLogs(true);
    }
  };

  const pendingCount = logs.filter(l => l.status && l.status.toUpperCase() === 'PENDING').length;
  const resolvedCount = logs.filter(l => l.status && l.status.toUpperCase() === 'RESOLVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900"></h1>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{logs.length}</div>
            <div className="text-xs font-semibold text-slate-500">Total Reported Logs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
            <div className="text-xs font-semibold text-slate-500">Pending Attention</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{resolvedCount}</div>
            <div className="text-xs font-semibold text-slate-500">Resolved Issues</div>
          </div>
        </div>
      </div>

      {/* Full-width Responsive Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Bus / Route</th>
                <th className="px-6 py-4">Issue Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Reported Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <Wrench size={44} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-bold text-base text-slate-700">No maintenance logs found</p>
                    <p className="text-xs text-slate-400 mt-1">All depot buses are operating smoothly without logged faults.</p>
                  </td>
                </tr>
              )}
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-slate-900">{log.trip?.busNumber || log.busNumber || 'MH013388'}</div>
                    <div className="text-slate-500 font-medium text-[11px] mt-0.5">{log.trip?.route?.name || 'Central Express Route'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      {log.issueType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 max-w-md">
                    {log.description && log.description !== '-' ? (
                      <span>{log.description}</span>
                    ) : (
                      <span className="text-slate-400 italic">No additional details provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    {log.status && log.status.toUpperCase() === 'PENDING' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock size={14} /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle size={14} /> Resolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {log.status && log.status.toUpperCase() === 'PENDING' ? (
                      <button 
                        onClick={() => markResolved(log.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">No action needed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


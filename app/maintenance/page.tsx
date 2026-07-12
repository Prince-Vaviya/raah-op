"use client";
import { useState, useEffect } from "react";
import { Wrench, CheckCircle, Clock } from "lucide-react";
import { API_URL } from "../../lib/api";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/maintenance`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const markResolved = async (id: string) => {
    try {
      await fetch(`${API_URL}/maintenance/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-black text-slate-800 mb-2">Depot & Maintenance</h1>
      <p className="text-slate-500 mb-8">Review non-emergency bus health logs submitted by conductors.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <th className="px-6 py-4 font-semibold">Bus / Route</th>
              <th className="px-6 py-4 font-semibold">Issue Type</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Reported</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <Wrench size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="font-medium text-lg">No maintenance logs found</p>
                  <p>All buses are operating normally.</p>
                </td>
              </tr>
            )}
            {logs.map(log => (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{log.trip?.busNumber || 'Unknown'}</div>
                  <div className="text-sm text-slate-500">{log.trip?.route?.name || 'Unknown Route'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-sm">
                    {log.issueType}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600 max-w-[250px] truncate">
                  {log.description || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4">
                  {log.status === 'PENDING' ? (
                    <span className="flex items-center gap-1.5 text-amber-600 font-medium text-sm">
                      <Clock size={16} /> Pending
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                      <CheckCircle size={16} /> Resolved
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {log.status === 'PENDING' && (
                    <button 
                      onClick={() => markResolved(log.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

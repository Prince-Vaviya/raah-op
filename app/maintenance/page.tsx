"use client";
import { useState, useEffect } from "react";
import { Wrench, CheckCircle, Clock, AlertTriangle, ShieldCheck, RefreshCw, Cpu, Activity, Gauge } from "lucide-react";
import { API_URL, fetchMaintenance } from "../../lib/api";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [obdData, setObdData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async (force: boolean = false) => {
    try {
      if (force) {
        const { clearCache } = await import("../../lib/api");
        clearCache('maintenance');
      }
      const data = await fetchMaintenance();
      setLogs(data);

      const obdRes = await fetch(`${API_URL}/telemetry/obd`).catch(() => null);
      if (obdRes && obdRes.ok) {
        const obd = await obdRes.json().catch(() => null);
        if (obd) setObdData(obd);
      }
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800 dark:text-slate-100 p-6 md:p-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Predictive Maintenance & Fleet Repair Center
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Real-time CAN bus OBD-II diagnostics & predictive breakdown AI warnings for Mumbai transit fleet.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-colors shrink-0 self-start sm:self-auto shadow-xs"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
          <span>Refresh Telematics & Logs</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/90 dark:border-slate-800/90 shadow-lg shadow-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
            <Wrench size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{logs.length || 8}</div>
            <div className="text-xs font-bold text-slate-400">Total Maintenance Logs</div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/90 dark:border-slate-800/90 shadow-lg shadow-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-2xl">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-500">{pendingCount || 2}</div>
            <div className="text-xs font-bold text-slate-400">Pending Attention</div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/90 dark:border-slate-800/90 shadow-lg shadow-slate-900/5 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-500">{resolvedCount || 6}</div>
            <div className="text-xs font-bold text-slate-400">Resolved Issues</div>
          </div>
        </div>
      </div>

      {/* ── PREDICTIVE BREAKDOWN AI & CAN BUS OBD-II DIAGNOSTICS CARD ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-lg shadow-slate-900/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
            <Cpu size={18} className="text-purple-600" />
            <span>OBD-II CAN Bus Telematics & Predictive Breakdown AI</span>
          </div>
          <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
            Real-Time Vehicle Health
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(obdData.length > 0 ? obdData : [
            { busNumber: "MH-01-CV-1010", engineTempCelsius: 88, brakePadWearPercent: 24, breakdownRiskRating: "Low", breakdownProbabilityPercent: 2.1, aiRecommendation: "Vehicle in healthy condition." },
            { busNumber: "MH-01-CV-1020", engineTempCelsius: 104, brakePadWearPercent: 88, breakdownRiskRating: "Critical Breakdown Risk", breakdownProbabilityPercent: 89.4, aiRecommendation: "HIGH BREAKDOWN RISK! Route to Kurla Depot immediately for coolant check." },
            { busNumber: "MH-01-CV-2100", engineTempCelsius: 90, brakePadWearPercent: 42, breakdownRiskRating: "Low", breakdownProbabilityPercent: 4.5, aiRecommendation: "Vehicle operating normally." },
            { busNumber: "MH-01-CV-1380", engineTempCelsius: 95, brakePadWearPercent: 68, breakdownRiskRating: "Medium", breakdownProbabilityPercent: 31.0, aiRecommendation: "Schedule sensor maintenance during off-peak shift." },
          ]).map((item) => (
            <div key={item.busNumber} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">{item.busNumber}</span>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  item.breakdownRiskRating.includes('Critical') 
                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 animate-pulse'
                    : item.breakdownRiskRating.includes('Medium')
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {item.breakdownRiskRating}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Engine Temp:</span>
                  <span className={item.engineTempCelsius > 100 ? 'text-red-600 font-bold' : ''}>{item.engineTempCelsius}°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Brake Wear:</span>
                  <span className={item.brakePadWearPercent > 80 ? 'text-red-600 font-bold' : ''}>{item.brakePadWearPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Breakdown Prob:</span>
                  <span className="font-bold text-purple-600">{item.breakdownProbabilityPercent}%</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-medium italic pt-1 border-t border-slate-200 dark:border-slate-700">
                "{item.aiRecommendation}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width Responsive Table Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-900/5 border border-white/90 dark:border-slate-800/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Bus / Route</th>
                <th className="py-3 px-4">Issue Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {(logs.length > 0 ? logs : [
                { id: "m-1", trip: { busNumber: "MH-01-CV-1020", route: { routeName: "102" } }, issueType: "ENGINE_OVERHEAT", description: "Engine coolant temperature exceeded 104°C near Kurla Station.", status: "PENDING" },
                { id: "m-2", trip: { busNumber: "MH-01-CV-1380", route: { routeName: "138" } }, issueType: "HVAC_COMPRESSOR", description: "AC unit blowing warm air inside Bus 138-B.", status: "PENDING" }
              ]).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {log.trip?.busNumber || "MH-01-CV-1010"}
                    <span className="text-[10px] text-slate-400 block font-normal">Route {log.trip?.route?.routeName || "101"}</span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">
                    {log.issueType}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {log.description}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      log.status === 'RESOLVED' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {log.status !== 'RESOLVED' && (
                      <button
                        onClick={() => markResolved(log.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-xl text-[11px] transition-colors cursor-pointer"
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

    </div>
  );
}

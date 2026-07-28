"use client";
import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Bus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { API_URL, fetchMaintenance } from "../../lib/api";

// Circular Ring Progress Gauge
function HealthCircularRing({ percentage, label, color }: { percentage: number; label: string; color: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
      <div className="relative w-11 h-11 flex items-center justify-center">
        <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3.5"
            fill="transparent"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={color}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] font-black text-slate-900 dark:text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// Front View Bus Graphic
function BusFrontGraphic({ color = "#2563eb" }: { color?: string }) {
  return (
    <div className="w-7 h-7 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="5" width="24" height="21" rx="4" fill="#ffffff" stroke="#334155" strokeWidth="2" />
        <rect x="6" y="7" width="20" height="8" rx="2" fill="#0f172a" />
        <rect x="8" y="8" width="16" height="2" rx="1" fill="#38bdf8" opacity="0.6" />
        <circle cx="8" cy="21" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <circle cx="24" cy="21" r="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <rect x="12" y="21" width="8" height="2" rx="1" fill={color} />
        <rect x="6" y="26" width="4" height="3" rx="1" fill="#1e293b" />
        <rect x="22" y="26" width="4" height="3" rx="1" fill="#1e293b" />
      </svg>
    </div>
  );
}

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedActionModal, setSelectedActionModal] = useState<any | null>(null);

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
    }
  };

  // 4 Vehicles Health Cards matching screenshot
  const vehicleHealthList = [
    {
      busNumber: "MH-01-CV-1010",
      riskLevel: "Low Risk",
      riskType: "LOW",
      engine: 92,
      brake: 76,
      battery: 94,
      breakdownProb: "2.1%",
      ringColor: "#22c55e",
      probColor: "text-emerald-600"
    },
    {
      busNumber: "MH-01-CV-1020",
      riskLevel: "Critical Risk",
      riskType: "CRITICAL",
      engine: 45,
      brake: 12,
      battery: 60,
      breakdownProb: "89.4%",
      ringColor: "#ef4444",
      probColor: "text-red-600 text-base font-black"
    },
    {
      busNumber: "MH-01-CV-2100",
      riskLevel: "Medium Risk",
      riskType: "MEDIUM",
      engine: 68,
      brake: 42,
      battery: 85,
      breakdownProb: "31.2%",
      ringColor: "#f59e0b",
      probColor: "text-amber-600"
    },
    {
      busNumber: "MH-01-CV-1380",
      riskLevel: "Low Risk",
      riskType: "LOW",
      engine: 90,
      brake: 68,
      battery: 93,
      breakdownProb: "4.5%",
      ringColor: "#22c55e",
      probColor: "text-emerald-600"
    }
  ];

  // Maintenance Queue Rows matching screenshot
  const queueRows = [
    {
      id: "mq-1",
      priority: "Critical",
      priorityType: "CRITICAL",
      busNumber: "MH-01-CV-1020",
      routeName: "Route 204",
      issueType: "Coolant Leak",
      confidence: "95%",
      eta: "Today, 6:00 PM",
      depot: "Kurla Depot",
      action: "Replace coolant hose",
      status: "PENDING"
    },
    {
      id: "mq-2",
      priority: "Medium",
      priorityType: "MEDIUM",
      busNumber: "MH-01-CV-2100",
      routeName: "Route 122",
      issueType: "Brake Wear",
      confidence: "88%",
      eta: "Tomorrow, 11:00 AM",
      depot: "Wadala Depot",
      action: "Replace brake pads",
      status: "PENDING"
    },
    {
      id: "mq-3",
      priority: "Low",
      priorityType: "LOW",
      busNumber: "MH-01-CV-1380",
      routeName: "Route 138",
      issueType: "Sensor Calibration",
      confidence: "78%",
      eta: "Tomorrow, 3:00 PM",
      depot: "Dadar Depot",
      action: "Calibrate sensors",
      status: "SCHEDULED"
    },
    {
      id: "mq-4",
      priority: "Medium",
      priorityType: "MEDIUM",
      busNumber: "MH-01-CV-1755",
      routeName: "Route 307",
      issueType: "Battery Health",
      confidence: "85%",
      eta: "31 Jul, 10:00 AM",
      depot: "Borivali Depot",
      action: "Battery check & replace",
      status: "SCHEDULED"
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans text-slate-800 dark:text-slate-100 p-6 md:p-8">
      
      {/* 1. HEADER SECTION (Shield Icon + Title + Subtitle + Refresh) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shrink-0 mt-0.5">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Fleet Intelligence Center
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              AI-powered predictive maintenance & real-time fleet health monitoring
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-2xl text-xs font-bold cursor-pointer transition-all shadow-xs shrink-0 self-start md:self-auto"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
          <span>Refresh Telematics</span>
        </button>
      </div>

      {/* 2. TOP METRIC CARDS GRID (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Fleet Availability */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Bus size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Fleet Availability</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">97.4%</div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
              <span className="text-[10px]">▲</span>
              <span>3.2% vs last week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Vehicles Needing Inspection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Vehicles Needing Inspection</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">8</div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
              <span className="text-[10px]">▲</span>
              <span>2 vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Breakdown Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Critical Breakdown Risk</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">3</div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 mt-1">
              <span className="text-[10px]">▼</span>
              <span>1 vs yesterday</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. AI RECOMMENDATION HIGHLIGHT BANNER */}
      <div className="relative bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 dark:from-indigo-950/60 dark:via-purple-950/40 dark:to-blue-950/60 border border-purple-200/80 dark:border-purple-800/60 rounded-3xl p-6 md:p-7 shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Sparkles size={16} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                AI Recommendation
                <span className="bg-purple-200 dark:bg-purple-900/90 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  AI
                </span>
              </h3>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Bus MH-01-CV-1020 has an 89% breakdown probability.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Complete Route 204, then redirect to Kurla Depot.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Replacement bus MH-01-CV-1187 is available 2.3 km away.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0 self-end lg:self-center">
            <button
              onClick={() => alert("Redirecting Bus MH-01-CV-1020 to Kurla Depot. Replacement Bus MH-01-CV-1187 dispatched!")}
              className="border border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-xs cursor-pointer transition-all hover:scale-105"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* 4. VEHICLE HEALTH OVERVIEW SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Vehicle Health Overview
          </h2>
          <a href="/insights" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <span>View All Vehicles</span>
            <ArrowRight size={14} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicleHealthList.map((item) => (
            <div 
              key={item.busNumber}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xs space-y-3 transition-all ${
                item.riskType === 'CRITICAL' 
                  ? 'border-2 border-red-400 dark:border-red-600 bg-red-50/20 dark:bg-red-950/20'
                  : item.riskType === 'MEDIUM'
                  ? 'border border-amber-200 dark:border-amber-900/60'
                  : 'border border-emerald-200 dark:border-emerald-900/60'
              }`}
            >
              {/* Header: Bus Number + Risk Pill */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">{item.busNumber}</span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  item.riskType === 'CRITICAL'
                    ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 animate-pulse'
                    : item.riskType === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {item.riskLevel}
                </span>
              </div>

              {/* 3 Circular Ring Progress Gauges */}
              <div className="flex items-center justify-around pt-1">
                <HealthCircularRing percentage={item.engine} label="Engine" color={item.engine < 50 ? "#ef4444" : item.engine < 75 ? "#f59e0b" : "#22c55e"} />
                <HealthCircularRing percentage={item.brake} label="Brake" color={item.brake < 50 ? "#ef4444" : item.brake < 75 ? "#f59e0b" : "#22c55e"} />
                <HealthCircularRing percentage={item.battery} label="Battery" color={item.battery < 50 ? "#ef4444" : item.battery < 75 ? "#f59e0b" : "#22c55e"} />
              </div>

              {/* Footer: Breakdown Probability + Front Bus Vector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Breakdown Prob.</span>
                  <span className={`text-xs font-extrabold ${item.probColor}`}>
                    {item.breakdownProb}
                  </span>
                </div>
                <BusFrontGraphic color={item.ringColor} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. MAINTENANCE QUEUE TABLE SECTION */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Maintenance Queue
        </h2>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Bus / Route</th>
                  <th className="py-3.5 px-4">Issue Type</th>
                  <th className="py-3.5 px-4 text-center">AI Confidence</th>
                  <th className="py-3.5 px-4">ETA to Repair</th>
                  <th className="py-3.5 px-4">Assigned Depot</th>
                  <th className="py-3.5 px-4">Recommended Action</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
                {queueRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Priority */}
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                        row.priorityType === 'CRITICAL'
                          ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300'
                          : row.priorityType === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {row.priority}
                      </span>
                    </td>

                    {/* Bus / Route */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{row.busNumber}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{row.routeName}</div>
                    </td>

                    {/* Issue Type */}
                    <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-200">
                      {row.issueType}
                    </td>

                    {/* AI Confidence */}
                    <td className="py-4 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {row.confidence}
                    </td>

                    {/* ETA to Repair */}
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">
                      {row.eta}
                    </td>

                    {/* Assigned Depot */}
                    <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                      {row.depot}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Wrench size={13} className="text-slate-400 shrink-0" />
                        <span>{row.action}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                        row.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {row.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      {row.status === 'PENDING' ? (
                        <button
                          onClick={() => alert(`Taking action on ${row.busNumber}: Work order dispatched to ${row.depot}!`)}
                          className="border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 font-extrabold px-3 py-1 rounded-xl text-xs shadow-2xs cursor-pointer transition-all"
                        >
                          Take Action
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Viewing maintenance schedule for ${row.busNumber}`)}
                          className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold px-3 py-1 rounded-xl text-xs shadow-2xs cursor-pointer transition-all"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
            <a href="/reports" className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
              <span>View All Maintenance Logs</span>
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}

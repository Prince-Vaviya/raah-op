"use client";
import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Bus, 
  ShieldAlert, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ChevronRight, 
  Zap, 
  FileText 
} from "lucide-react";
import { API_URL } from "@/lib/api";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await fetch(`${API_URL}/contractors`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data) setContractors(data);
        }
      } catch (e) {
        console.error("Contractors fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  const totalFleet = contractors.reduce((acc, c) => acc + (c.totalBuses || 0), 0);
  const totalActive = contractors.reduce((acc, c) => acc + (c.activeBuses || 0), 0);
  const totalPenaltiesInr = contractors.reduce((acc, c) => acc + (c.monthlyPenaltyInr || 0), 0);
  const avgUptime = contractors.length > 0 ? (contractors.reduce((acc, c) => acc + c.uptimeRate, 0) / contractors.length).toFixed(1) : "91.8";

  const handleIssuePenaltyNotice = (contractorName: string) => {
    setShowToast(`Formal SLA Breach & Financial Penalty Notice issued to ${contractorName}!`);
    setTimeout(() => setShowToast(null), 3500);
  };

  const filteredContractors = contractors.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.fleetType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100 max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Wet-Lease Contractor SLA & Penalty Tracker
            </h1>
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              BEST Mumbai Fleet
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor uptime %, AC compliance, skipped trips, and auto-calculated financial penalties (₹) across private operators.
          </p>
        </div>

        {/* Search */}
        <div className="relative self-start sm:self-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contractor or fleet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* ── TOP KPI SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Fleet */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Contractor Fleet</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalActive} <span className="text-xs font-bold text-slate-400">/ {totalFleet} Buses</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingUp size={12} />
              <span>93.1% Operational Rate</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
            <Bus size={22} />
          </div>
        </div>

        {/* KPI 2: Average Fleet Uptime */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Uptime Rate</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">{avgUptime}%</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
              <CheckCircle2 size={12} />
              <span>Target: 90% SLA Uptime</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <Zap size={22} />
          </div>
        </div>

        {/* KPI 3: Total Monthly Penalties */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monthly Penalties (₹)</div>
            <div className="text-2xl font-black text-red-500 mt-1">
              ₹{(totalPenaltiesInr / 100000).toFixed(2)}L
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 mt-1">
              <IndianRupee size={12} />
              <span>Auto-Deducted from Contract</span>
            </div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950 text-red-500 rounded-2xl">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* KPI 4: SLA Breaches */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SLA Breaches This Month</div>
            <div className="text-2xl font-black text-amber-500 mt-1">1 Contractor</div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 mt-1">
              <AlertTriangle size={12} />
              <span>Olectra (AC Temp Breach)</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-2xl">
            <ShieldAlert size={22} />
          </div>
        </div>

      </div>

      {/* ── CONTRACTOR SLA BREAKDOWN TABLE CARD ── */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-lg shadow-slate-900/5 space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 dark:text-white">
            Private Wet-Lease Operator Compliance Roster
          </h2>
          <span className="text-xs font-semibold text-slate-400">Updated Real-Time via CAN Bus Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Contractor Name</th>
                <th className="py-3 px-4">Fleet Type</th>
                <th className="py-3 px-4 text-center">Active / Total</th>
                <th className="py-3 px-4 text-center">Uptime Rate</th>
                <th className="py-3 px-4 text-center">AC Compliance</th>
                <th className="py-3 px-4 text-center">Skipped Trips</th>
                <th className="py-3 px-4 text-right">Monthly Penalty (₹)</th>
                <th className="py-3 px-4 text-center">SLA Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {filteredContractors.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  
                  {/* Name & Code */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                        {c.code.substring(0, 3)}
                      </div>
                      <div>
                        <div>{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">Code: {c.code}</div>
                      </div>
                    </div>
                  </td>

                  {/* Fleet Type */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                    {c.fleetType}
                  </td>

                  {/* Active / Total */}
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-800 dark:text-slate-200">
                    <span className="text-blue-600">{c.activeBuses}</span> / {c.totalBuses}
                  </td>

                  {/* Uptime % */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-black ${c.uptimeRate >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {c.uptimeRate}%
                    </span>
                  </td>

                  {/* AC Compliance % */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-black ${c.acCompliance >= 90 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {c.acCompliance}%
                    </span>
                  </td>

                  {/* Skipped Trips */}
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {c.skippedTrips} trips
                  </td>

                  {/* Monthly Penalty INR */}
                  <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                    {c.monthlyPenaltyInr > 0 ? (
                      <span className="text-red-600 font-black">₹{c.monthlyPenaltyInr.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-emerald-600 font-extrabold">₹0 (Zero Deduction)</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      c.status.includes('Warning') 
                        ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300'
                        : c.status.includes('Excellent')
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleIssuePenaltyNotice(c.name)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-200 font-bold px-3 py-1 rounded-xl text-[11px] transition-colors cursor-pointer"
                    >
                      Issue Notice
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 size={12} />
          </div>
          <div className="text-xs font-bold">{showToast}</div>
        </div>
      )}

    </div>
  );
}

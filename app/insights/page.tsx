"use client";
import React, { useState, useEffect } from "react";
import { 
  Info, 
  Clock, 
  Activity, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Sparkles, 
  ChevronRight, 
  HeartHandshake, 
  Gauge, 
  AlertCircle,
  MapPin,
  Calendar,
  Minus
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area 
} from "recharts";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useData } from "@/providers/DataProvider";
import { API_URL } from "@/lib/api";

// AI Copilot Mascot SVG Illustration
function AiCopilotMascot() {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm shrink-0">
      <rect x="8" y="18" width="48" height="38" rx="14" fill="#2563eb" />
      <path d="M16 18 C16 10, 48 10, 48 18 Z" fill="#0f172a" />
      <rect x="22" y="15" width="20" height="4" rx="2" fill="#3b82f6" />
      <text x="32" y="14" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">RAAH</text>
      <rect x="13" y="24" width="38" height="18" rx="7" fill="#ffffff" />
      <ellipse cx="24" cy="33" rx="3" ry="4" fill="#0f172a" />
      <ellipse cx="40" cy="33" rx="3" ry="4" fill="#0f172a" />
      <circle cx="25" cy="31" r="1" fill="#ffffff" />
      <circle cx="41" cy="31" r="1" fill="#ffffff" />
      <path d="M29 38 Q32 40 35 38" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="19" cy="35" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="45" cy="35" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="18" cy="56" r="4" fill="#0f172a" />
      <circle cx="46" cy="56" r="4" fill="#0f172a" />
      <circle cx="18" cy="56" r="2" fill="#94a3b8" />
      <circle cx="46" cy="56" r="2" fill="#94a3b8" />
      <path d="M52 42 L60 56 H44 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
      <text x="52" y="53" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">!</text>
    </svg>
  );
}

// 24-Hour Headway Trend Data
const defaultHeadwayTrendData = [
  { time: "00:00", r101: 5.2, r102: 4.0, r138: 4.8, r210: 1.8, r500: 6.2 },
  { time: "04:00", r101: 4.8, r102: 5.8, r138: 4.2, r210: 2.8, r500: 7.5 },
  { time: "08:00", r101: 7.5, r102: 6.5, r138: 7.2, r210: 3.1, r500: 9.1 },
  { time: "12:00", r101: 5.8, r102: 8.2, r138: 6.5, r210: 2.0, r500: 8.0 },
  { time: "16:00", r101: 6.9, r102: 11.2, r138: 5.1, r210: 2.9, r500: 7.2 },
  { time: "20:00", r101: 7.8, r102: 9.5, r138: 7.5, r210: 1.5, r500: 12.0 },
  { time: "24:00", r101: 4.5, r102: 7.8, r138: 4.2, r210: 2.5, r500: 11.2 },
];

export default function InsightsPage() {
  const { metrics, activities, routeHealth, peakHourData, delayTrend } = useData();
  const [dateRange, setDateRange] = useState("Today, 21 Jul");
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("All Routes");
  const [heatmapStops, setHeatmapStops] = useState<any[]>([]);

  // Fetch real heatmap surge data from backend endpoint
  useEffect(() => {
    const fetchBackendHeatmap = async () => {
      try {
        const res = await fetch(`${API_URL}/routes/stops/heatmap`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setHeatmapStops(data);
          }
        }
      } catch (err) {
        console.warn("Backend heatmap connection notice:", err);
      }
    };
    fetchBackendHeatmap();
  }, []);

  // Compute dynamic values from real backend state
  const networkHealthScore = metrics.healthScore || 92;
  const avgHeadwayVal = metrics.avgDelay ? (5.0 + metrics.avgDelay).toFixed(1) : "7.6";
  const bunchingCount = activities.length > 0 ? activities.length : (metrics.delayedBuses || 24);
  const ridershipVal = metrics.totalRidership > 0 ? `${metrics.totalRidership.toFixed(2)}M` : "1.24M";
  const onTimePerf = metrics.onTimeRate ? Math.round(metrics.onTimeRate) : 72;

  // Format backend peakHourData for Ridership Trend chart
  const formattedRidershipChart = peakHourData && peakHourData.length > 0 
    ? peakHourData.map(p => ({ time: p.time, passengers: p.passengers * 1000 }))
    : [
        { time: "00:00", passengers: 100000 },
        { time: "04:00", passengers: 350000 },
        { time: "08:00", passengers: 1450000 },
        { time: "12:00", passengers: 950000 },
        { time: "16:00", passengers: 1520000 },
        { time: "20:00", passengers: 880000 },
        { time: "24:00", passengers: 220000 },
      ];

  // Dynamic Routes Needing Attention from Backend
  const filteredHealth = routeHealth && routeHealth.length > 0 ? routeHealth.filter(r => r.score < 85) : [];
  const routesNeedingAttention = (filteredHealth.length > 0 ? filteredHealth : (routeHealth && routeHealth.length > 0 ? routeHealth : [])).slice(0, 3).map((r: any, idx: number) => ({
    badge: r.routeName || r.name || (idx === 0 ? "210" : idx === 1 ? "102" : "138"),
    badgeBg: (r.score || 70) < 50 ? "bg-red-600" : (r.score || 70) < 80 ? "bg-amber-500" : "bg-purple-600",
    title: r.startStop && r.endStop ? `${r.startStop} → ${r.endStop}` : (idx === 0 ? "Borivali (W) → Bandra (W)" : idx === 1 ? "Mantralaya → Kurla" : "Ghatkopar → Andheri (E)"),
    subtitle: (r.score || 70) < 50 ? "High bunching risk" : (r.score || 70) < 80 ? "Delays increasing" : "Irregular headways",
    riskLevel: (r.score || 70) < 50 ? "High" : "Medium",
    riskBg: (r.score || 70) < 50 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700",
    incidents: `${Math.max(2, Math.round((100 - (r.score || 70)) / 8))} incidents`
  }));

  const finalRoutesNeedingAttention = routesNeedingAttention.length > 0 ? routesNeedingAttention : [
    { badge: "210", badgeBg: "bg-red-600", title: "Borivali (W) → Bandra (W)", subtitle: "High bunching risk", riskLevel: "High", riskBg: "bg-red-100 text-red-600", incidents: "6 incidents" },
    { badge: "102", badgeBg: "bg-amber-500", title: "Mantralaya → Kurla", subtitle: "Delays increasing", riskLevel: "Medium", riskBg: "bg-amber-100 text-amber-700", incidents: "4 incidents" },
    { badge: "138", badgeBg: "bg-purple-600", title: "Ghatkopar → Andheri (E)", subtitle: "Irregular headways", riskLevel: "Medium", riskBg: "bg-amber-100 text-amber-700", incidents: "3 incidents" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100 max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* ── PAGE TITLE HEADER & DATE SELECTOR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Insights
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time performance analytics across the network
          </p>
        </div>

        {/* Glass Date Selector Pill */}
        <div className="relative self-start sm:self-auto">
          <button className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:shadow flex items-center gap-2 cursor-pointer transition-all">
            <Calendar size={14} className="text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          ROW 1: Network Overview Metrics Bar (8 cols) + AI Insight (4 cols)
      ═════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Network Overview Metrics Bar (8 Cols) */}
        <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Metric 1: Network Health */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-1">
              <span>Network Health</span>
              <Info size={12} className="text-slate-400 cursor-pointer" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-500 leading-none">{networkHealthScore}%</span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                {networkHealthScore >= 80 ? "Good" : "Fair"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1.5">
              <TrendingUp size={12} />
              <span>↑ 4% vs yesterday</span>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-12 bg-slate-200 dark:bg-slate-800"></div>

          {/* Metric 2: Avg Headway */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
              <div className="p-1 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-lg">
                <Clock size={12} />
              </div>
              <span>Avg Headway</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {avgHeadwayVal} <span className="text-sm font-bold text-slate-500">min</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1.5">
              <TrendingDown size={12} />
              <span>↓ 0.8 min</span>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-12 bg-slate-200 dark:bg-slate-800"></div>

          {/* Metric 3: Bunching Events */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
              <div className="p-1 bg-rose-50 dark:bg-rose-950 text-rose-500 rounded-lg">
                <Activity size={12} />
              </div>
              <span>Bunching Events</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {bunchingCount}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1.5">
              <TrendingDown size={12} />
              <span>↓ 6 vs yesterday</span>
            </div>
          </div>

          <div className="hidden sm:block w-[1px] h-12 bg-slate-200 dark:bg-slate-800"></div>

          {/* Metric 4: Passengers Today */}
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
              <div className="p-1 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-lg">
                <Users size={12} />
              </div>
              <span>Passengers Today</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {ridershipVal}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1.5">
              <TrendingUp size={12} />
              <span>↑ 6.3% vs yesterday</span>
            </div>
          </div>

        </div>

        {/* RIGHT: AI Insight Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AiCopilotMascot />
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  AI Insight
                </h3>
              </div>
            </div>

            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
              High Confidence
            </span>
          </div>

          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            {activities.length > 0 ? (
              `AI Detected ${activities.length} active alerts. ${activities[0].title}: ${activities[0].aiSummary}`
            ) : (
              "Route 102 and 210 are most likely to experience bunching in the next 30 minutes due to high traffic near Sion."
            )}
          </p>

          <a href="#" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1">
            View Details <ChevronRight size={14} />
          </a>
        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════
          ROW 2: Headway Trend Chart (8 cols) + Performance Summary (4 cols)
      ═════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: Headway Trend Line Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
              <span>Headway Trend</span>
              <Info size={13} className="text-slate-400 cursor-pointer" />
            </div>

            {/* Legend Pills for Routes */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span> 101
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> 102
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span> 138
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> 210
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 500
              </span>
            </div>

            {/* Filter Dropdown */}
            <button className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              {selectedRouteFilter} <ChevronDown size={12} />
            </button>
          </div>

          {/* Line Chart */}
          <div className="w-full h-64 relative pt-2">
            
            {/* Time Badge Callout Overlay at 19:45 */}
            <div className="absolute top-2 left-[78%] -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md z-10">
              19:45
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultHeadwayTrendData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                />
                <Line type="monotone" dataKey="r101" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="r102" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="r138" stroke="#a855f7" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="r210" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="r500" stroke="#22c55e" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* RIGHT: Performance Summary List (4 Cols) */}
        <div className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col justify-between space-y-4">
          
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            Performance Summary
          </h3>

          <div className="space-y-3 flex-1 flex flex-col justify-around">
            
            {/* Item 1: On-time Performance */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
                  <HeartHandshake size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  On-time Performance
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">{onTimePerf}%</span>
                <span className="text-[10px] font-bold text-emerald-600">↑ 8%</span>
              </div>
            </div>

            {/* Item 2: Reliability */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-2xl">
                  <Gauge size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reliability
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">{networkHealthScore - 1}%</span>
                <span className="text-[10px] font-bold text-emerald-600">↑ 6%</span>
              </div>
            </div>

            {/* Item 3: Crowding Index */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-2xl">
                  <Users size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Crowding Index
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">Medium</span>
                <span className="text-[10px] font-bold text-slate-400">—</span>
              </div>
            </div>

            {/* Item 4: Disrupted Services */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-2xl">
                  <Clock size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Disrupted Services
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {activities.filter(a => a.type === 'error').length || 3}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">↓ 2</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════
          ROW 3: 3 EQUAL COLUMNS (Bunching Heatmap, Ridership Trend, Routes Needing Attention)
      ═════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: Bunching Heatmap */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col space-y-3 h-80 relative overflow-hidden">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
            <span>Bunching Heatmap</span>
            <Info size={13} className="text-slate-400 cursor-pointer" />
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden relative">
            <Map
              initialViewState={{
                longitude: 72.8650,
                latitude: 19.0500,
                zoom: 10.5
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              mapLib={maplibregl}
              style={{ width: "100%", height: "100%" }}
            >
              {/* Backend Heatmap Stops */}
              {(heatmapStops.length > 0 ? heatmapStops.slice(0, 5) : [
                { id: "hs-1", name: "Dadar", lat: 19.0180, lng: 72.8430, isCritical: true },
                { id: "hs-2", name: "Sion", lat: 19.0400, lng: 72.8640, isCritical: true },
                { id: "hs-3", name: "Kurla", lat: 19.0600, lng: 72.8700, isCritical: false },
                { id: "hs-4", name: "Andheri", lat: 19.1150, lng: 72.8350, isCritical: false },
                { id: "hs-5", name: "Colaba", lat: 18.9067, lng: 72.8258, isCritical: false },
              ]).map((stop: any) => (
                <Marker key={`hs-${stop.id}`} longitude={stop.lng} latitude={stop.lat} anchor="center">
                  <div className="relative flex items-center justify-center">
                    {stop.isCritical && (
                      <div className="w-16 h-16 bg-red-600/40 rounded-full animate-ping absolute"></div>
                    )}
                    <div className={`w-9 h-9 ${stop.isCritical ? 'bg-red-600/90' : 'bg-amber-500/80'} rounded-full shadow-lg border-2 border-white flex items-center justify-center text-[8px] font-black text-white`}>
                      {stop.name}
                    </div>
                  </div>
                </Marker>
              ))}
            </Map>

            {/* Bottom Scale Bar Overlay */}
            <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[9px] font-bold shadow-md z-10">
              <span className="text-slate-500">Low</span>
              <div className="w-16 h-2 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-red-600"></div>
              <span className="text-slate-900 dark:text-white">High</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Ridership Trend */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col space-y-3 h-80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
              <span>Ridership Trend</span>
              <Info size={13} className="text-slate-400 cursor-pointer" />
            </div>

            <button className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer">
              Today <ChevronDown size={12} />
            </button>
          </div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Passengers
          </div>

          <div className="flex-1 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRidershipChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ridershipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                  formatter={(val: any) => [`${(Number(val)/1000).toFixed(0)}K Passengers`]}
                />
                <Area type="monotone" dataKey="passengers" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#ridershipGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 3: Routes Needing Attention */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex flex-col space-y-3 h-80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Routes Needing Attention
            </h3>
            <a href="#" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">View all</a>
          </div>

          <div className="space-y-2.5 flex-1 flex flex-col justify-around">
            {finalRoutesNeedingAttention.map((routeItem) => (
              <div 
                key={routeItem.badge}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl ${routeItem.badgeBg} text-white font-black text-xs flex items-center justify-center shrink-0`}>
                    {routeItem.badge}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {routeItem.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {routeItem.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`${routeItem.riskBg} text-[9px] font-extrabold px-2 py-0.5 rounded-full`}>
                    {routeItem.riskLevel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{routeItem.incidents}</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}

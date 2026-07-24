"use client";
import React, { useState } from "react";
import { 
  Users, 
  Bus, 
  Snowflake, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Check, 
  Search, 
  UserPlus, 
  FileText, 
  Plus, 
  Minus, 
  Crosshair,
  Radio
} from "lucide-react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CctvModal from "@/components/CctvModal";

// Cute AI Mascot illustration matching Screenshot
function AiMascotIllustration() {
  return (
    <svg width="42" height="42" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 drop-shadow-xs">
      <rect x="12" y="20" width="40" height="34" rx="12" fill="#8b5cf6" />
      <rect x="16" y="25" width="32" height="16" rx="6" fill="#ffffff" />
      <circle cx="25" cy="33" r="2.5" fill="#0f172a" />
      <circle cx="39" cy="33" r="2.5" fill="#0f172a" />
      <path d="M29 37 Q32 39 35 37" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="35" r="2" fill="#f43f5e" opacity="0.4" />
      <circle cx="44" cy="35" r="2" fill="#f43f5e" opacity="0.4" />
    </svg>
  );
}

// Sample reports list
const initialReports = [
  {
    id: "RPT-2025-07-101-01",
    title: "Overcrowding in Bus 101",
    location: "Dadar TT Circle (W)",
    priority: "High",
    priorityBg: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300 border-red-200",
    time: "07:35 PM Today",
    icon: Users,
    iconBg: "bg-red-500 text-white",
    route: "Route 101",
    reporter: "Reported by Commuter",
    description: "Bus was extremely crowded near Dadar TT Circle. People had to travel standing all the way till Worli. Need more buses on this route during peak hours.",
    aiInsight: "7 similar reports have been received from this location in the last 7 days. Consider adding extra buses between Dadar TT Circle and Worli Naka during 6 PM – 9 PM.",
    evidenceImages: ["/images/crowd1.jpg", "/images/crowd2.jpg"]
  },
  {
    id: "RPT-2025-07-210-02",
    title: "Bus 210 Skipped Stop",
    location: "Kurla Station (E)",
    priority: "Medium",
    priorityBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
    time: "06:20 PM Today",
    icon: Bus,
    iconBg: "bg-amber-500 text-white",
    route: "Route 210",
    reporter: "Reported by Commuter",
    description: "Bus 210 did not stop at Kurla Station (E) despite passengers waiting. Driver passed by in high speed.",
    aiInsight: "3 skip-stop reports flagged for Driver ID #4812 in past 14 days. Review route compliance.",
    evidenceImages: ["/images/crowd1.jpg"]
  },
  {
    id: "RPT-2025-07-138-03",
    title: "AC Not Working in 138",
    location: "Sion Koliwada (E)",
    priority: "Low",
    priorityBg: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
    time: "05:15 PM Today",
    icon: Snowflake,
    iconBg: "bg-purple-500 text-white",
    route: "Route 138",
    reporter: "Reported by Passenger",
    description: "Air conditioning unit is blowing warm air inside Bus 138-B. Passengers complaining of suffocation.",
    aiInsight: "HVAC compressor maintenance recommended for Bus 138-B.",
    evidenceImages: []
  },
  {
    id: "RPT-2025-07-004-04",
    title: "Driver Behaviour",
    location: "Bandra Reclamation (W)",
    priority: "Medium",
    priorityBg: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200",
    time: "04:40 PM Today",
    icon: UserCheck,
    iconBg: "bg-amber-500 text-white",
    route: "Route 500",
    reporter: "Reported by Commuter",
    description: "Sudden harsh braking and rough driving reported near Bandra Reclamation.",
    aiInsight: "Telematics telemetry recorded 4 harsh braking events between 4:30 PM and 4:40 PM.",
    evidenceImages: []
  },
  {
    id: "RPT-2025-07-005-05",
    title: "Bus Delay",
    location: "Malad Depot (W)",
    priority: "Low",
    priorityBg: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
    time: "03:10 PM Today",
    icon: Clock,
    iconBg: "bg-purple-500 text-white",
    route: "Route 202",
    reporter: "Reported by Dispatcher",
    description: "Bus delayed by 25 minutes departing Malad Depot due to driver late arrival.",
    aiInsight: "Staffing gap detected at Malad Depot. Reassign backup driver.",
    evidenceImages: []
  }
];

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(initialReports[0].id);
  const [reportStatusStep, setReportStatusStep] = useState(1); // 1: Received, 2: Under Review, 3: Action Taken, 4: Resolved
  const [operatorNotes, setOperatorNotes] = useState("");
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showCctvModal, setShowCctvModal] = useState(false);

  const activeReport = initialReports.find(r => r.id === selectedReportId) || initialReports[0];

  const handleActionClick = (actionName: string, targetStep?: number) => {
    if (targetStep) setReportStatusStep(targetStep);
    setShowToast(`${actionName} completed!`);
    setTimeout(() => setShowToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100 max-w-7xl mx-auto space-y-5 pb-16">
      
      {/* ═════════════════════════════════════════════════════════
          PANORAMIC MAP HEADER BANNER CARD
      ═════════════════════════════════════════════════════════ */}
      <div className="w-full h-56 rounded-3xl overflow-hidden border border-white/90 dark:border-slate-800/90 shadow-lg relative bg-slate-200 dark:bg-slate-900">
        <Map
          initialViewState={{
            longitude: 72.8650,
            latitude: 19.0500,
            zoom: 11
          }}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          mapLib={maplibregl}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Map Markers for Reports */}
          <Marker longitude={72.8430} latitude={19.0180} anchor="center">
            <div className="w-9 h-9 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
          </Marker>

          <Marker longitude={72.8550} latitude={18.9900} anchor="center">
            <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
              <Bus size={14} />
            </div>
          </Marker>

          <Marker longitude={72.8700} latitude={19.0600} anchor="center">
            <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
              <Snowflake size={14} />
            </div>
          </Marker>

          <Marker longitude={72.9050} latitude={19.0850} anchor="center">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
              <UserCheck size={14} />
            </div>
          </Marker>
        </Map>

        {/* TOP-LEFT OVERLAY CARD: Reports Summary Badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl w-56 space-y-3">
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              28 <span className="text-xs font-semibold text-slate-500">Reports Today</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
                  <Users size={11} />
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">8</span>
              </div>
              <span className="text-slate-500 text-[11px]">High Priority</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                  <Bus size={11} />
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">12</span>
              </div>
              <span className="text-slate-500 text-[11px]">Medium Priority</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">
                  <Snowflake size={11} />
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">5</span>
              </div>
              <span className="text-slate-500 text-[11px]">Low Priority</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  <UserCheck size={11} />
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200">3</span>
              </div>
              <span className="text-slate-500 text-[11px]">Resolved</span>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT MAP ZOOM CONTROLS */}
        <div className="absolute top-4 right-4 z-10 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/90 dark:border-slate-800/90 rounded-2xl shadow-lg overflow-hidden">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer border-b border-slate-100 dark:border-slate-800">
            <Plus size={16} />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer border-b border-slate-100 dark:border-slate-800">
            <Minus size={16} />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
            <Crosshair size={16} />
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          MAIN CONTENT GRID: 3 COLUMNS
      ═════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── COLUMN 1: RECENT REPORTS TIMELINE (3 COLS) ── */}
        <div className="lg:col-span-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Recent Reports Timeline
            </h2>
            <button className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
              Newest First <ChevronDown size={12} />
            </button>
          </div>

          {/* Timeline Stack */}
          <div className="space-y-3 relative">
            <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

            {initialReports.map((report) => {
              const isActive = selectedReportId === report.id;
              const IconComp = report.icon;

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border relative z-10 flex items-start gap-3 ${
                    isActive 
                      ? 'bg-red-50/70 dark:bg-red-950/40 border-red-200 dark:border-red-900 shadow-md ring-1 ring-red-200' 
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${report.iconBg} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
                    <IconComp size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {report.title}
                      </div>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${report.priorityBg} shrink-0`}>
                        {report.priority}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      {report.location}
                    </div>

                    <div className="text-[9px] text-slate-400 font-semibold mt-1">
                      {report.time}
                    </div>
                  </div>

                  <ChevronRight size={14} className="text-slate-400 shrink-0 self-center" />
                </button>
              );
            })}
          </div>

          <button className="w-full text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer">
            View older reports v
          </button>
        </div>

        {/* ── COLUMN 2: REPORT DETAIL INSPECTION CARD (6 COLS) ── */}
        <div className="lg:col-span-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-lg shadow-slate-900/5 space-y-5">
          
          {/* Detail Header */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Users size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">
                    High Priority
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeReport.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500 mt-1">
                  <span>🚌 {activeReport.route}</span>
                  <span>•</span>
                  <span>📍 {activeReport.location}</span>
                  <span>•</span>
                  <span>Report ID: {activeReport.id}</span>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400 mt-1">
                  <span>👤 {activeReport.reporter}</span>
                  <span>🕒 {activeReport.time}</span>
                  <button
                    onClick={() => setShowCctvModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer shadow-xs transition-transform hover:scale-105 ml-2"
                  >
                    <Radio size={11} className="animate-pulse text-white" />
                    <span>Stream Cabin Camera</span>
                  </button>
                </div>
              </div>
            </div>

            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <MoreHorizontal size={18} />
            </button>
          </div>

          {/* Description & AI Insight Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 space-y-1.5">
              <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Description
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {activeReport.description}
              </p>
            </div>

            {/* AI Insight Box with Mascot */}
            <div className="md:col-span-5 bg-purple-50/80 dark:bg-purple-950/50 rounded-2xl p-4 border border-purple-100 dark:border-purple-900 flex flex-col justify-between space-y-2 relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300">
                <Sparkles size={14} />
                <span>AI Insight</span>
              </div>

              <p className="text-[11px] text-purple-900 dark:text-purple-200 font-medium leading-relaxed z-10">
                {activeReport.aiInsight}
              </p>

              <div className="self-end z-10 pt-1">
                <AiMascotIllustration />
              </div>
            </div>
          </div>

          {/* Reported Along Route */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Reported Along Route
            </h4>

            <div className="relative flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 px-2">
              <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

              {/* Stop 1 (Active Red) */}
              <div className="flex flex-col items-center">
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white ring-4 ring-red-100 shadow-xs mb-1"></div>
                <span className="text-red-600 font-black text-center max-w-[80px]">Dadar TT Circle (W)</span>
              </div>

              {/* Stop 2 */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white mb-1"></div>
                <span className="text-slate-400 text-center">Parel Naka</span>
              </div>

              {/* Stop 3 */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white mb-1"></div>
                <span className="text-slate-400 text-center">Worli Naka</span>
              </div>

              {/* Stop 4 */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white mb-1"></div>
                <span className="text-slate-400 text-center">Sewri Depot</span>
              </div>
            </div>
          </div>

          {/* Evidence (2) Gallery */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Evidence (2)
            </h4>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <div className="w-36 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <img src="/images/crowd1.jpg" alt="Evidence 1" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>

              <div className="w-36 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <img src="/images/crowd2.jpg" alt="Evidence 2" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>

              <button className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors shrink-0 cursor-pointer">
                <Upload size={16} />
                <span className="text-[10px] font-bold mt-1">Add more</span>
              </button>
            </div>
          </div>

          {/* Operator Notes Box */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Operator Notes
            </h4>

            <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl p-3 border border-amber-200/70 dark:border-amber-900">
              <textarea
                className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none font-medium"
                rows={2}
                placeholder="Write internal notes. These are not visible to reporters."
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* ── COLUMN 3: CURRENT STATUS & OPERATOR ACTIONS (3 COLS) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Current Status Tracker Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 space-y-4">
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Current Status
            </h3>

            <div className="space-y-4 relative pl-1">
              <div className="absolute left-[13px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

              {/* Step 1: Received */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  reportStatusStep >= 1 ? 'bg-blue-600 shadow-xs' : 'border-2 border-slate-300 bg-white'
                }`}>
                  {reportStatusStep >= 1 && <Check size={12} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">Received</span>
                    <span className="text-[9px] font-semibold text-slate-400">07:35 PM</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Report has been received and logged.
                  </p>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  reportStatusStep >= 2 ? 'bg-blue-600 shadow-xs' : 'border-2 border-slate-300 bg-white'
                }`}>
                  {reportStatusStep >= 2 && <Check size={12} />}
                </div>

                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Under Review</div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Report is being investigated by the team.
                  </p>
                </div>
              </div>

              {/* Step 3: Action Taken */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  reportStatusStep >= 3 ? 'bg-blue-600 shadow-xs' : 'border-2 border-slate-300 bg-white'
                }`}>
                  {reportStatusStep >= 3 && <Check size={12} />}
                </div>

                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Action Taken</div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Action has been taken or planned.
                  </p>
                </div>
              </div>

              {/* Step 4: Resolved */}
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 ${
                  reportStatusStep >= 4 ? 'bg-emerald-600 shadow-xs' : 'border-2 border-slate-300 bg-white'
                }`}>
                  {reportStatusStep >= 4 && <Check size={12} />}
                </div>

                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Resolved</div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Issue resolved and report closed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Actions Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 space-y-3">
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              Operator Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => handleActionClick("Report Acknowledged", 2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Acknowledge Report</span>
              </button>

              <button
                onClick={() => handleActionClick("Investigation Started", 2)}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Search size={14} />
                <span>Investigate</span>
              </button>

              <button
                onClick={() => handleActionClick("Assigned to Route Team", 3)}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Assign to Team</span>
              </button>

              <button
                onClick={() => handleActionClick("Internal Note Saved")}
                className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileText size={14} />
                <span>Add Internal Note</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={12} />
          </div>
          <div className="text-xs font-bold">{showToast}</div>
        </div>
      )}

      {/* LIVE CCTV STREAM MODAL */}
      {showCctvModal && (
        <CctvModal
          busNumber="MH-01-CV-1010"
          routeName="Route 101 (Colaba → Bandra)"
          tripId={activeReport.id}
          onClose={() => setShowCctvModal(false)}
        />
      )}

    </div>
  );
}

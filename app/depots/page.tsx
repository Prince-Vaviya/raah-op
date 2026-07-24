"use client";
import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Bus, 
  Zap, 
  Users, 
  Wrench, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  ChevronRight, 
  ShieldCheck 
} from "lucide-react";
import Map, { Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { API_URL } from "@/lib/api";

export default function DepotsPage() {
  const [depots, setDepots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepotId, setSelectedDepotId] = useState<string>("dep-wadala");
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepots = async () => {
      try {
        const res = await fetch(`${API_URL}/depots`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          if (data) setDepots(data);
        }
      } catch (e) {
        console.error("Depots fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDepots();
  }, []);

  const selectedDepot = depots.find(d => d.id === selectedDepotId) || depots[0] || {
    name: "Wadala Central Depot & Command Hub",
    code: "WDL",
    zone: "Central Mumbai",
    totalBuses: 240,
    activeEnRoute: 198,
    inMaintenance: 14,
    evChargersTotal: 32,
    evChargersOccupied: 26,
    activeShiftDrivers: 310,
    depotManager: "R. K. Patil (Sr. Dispatcher)",
    status: "Optimal"
  };

  const totalDepotBuses = depots.reduce((acc, d) => acc + (d.totalBuses || 0), 0);
  const totalEvChargers = depots.reduce((acc, d) => acc + (d.evChargersTotal || 0), 0);
  const occupiedEvChargers = depots.reduce((acc, d) => acc + (d.evChargersOccupied || 0), 0);
  const totalDrivers = depots.reduce((acc, d) => acc + (d.activeShiftDrivers || 0), 0);

  const filteredDepots = depots.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.zone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReassignRoster = () => {
    setShowToast(`Backup Driver Shift Roster dispatched to ${selectedDepot.name}!`);
    setTimeout(() => setShowToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8 font-sans text-slate-800 dark:text-slate-100 max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              27-Depot Management & EV Charging Roster
            </h1>
            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Mumbai Depot Ops
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor real-time depot check-ins, maintenance bays, EV charging slot queues, and driver shift handovers.
          </p>
        </div>

        {/* Search */}
        <div className="relative self-start sm:self-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search depot or zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
          />
        </div>
      </div>

      {/* ── TOP SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Depots & Fleet */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depot Fleet Assigned</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              27 <span className="text-xs font-bold text-slate-400">Depots • {totalDepotBuses} Buses</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">
              Wadala CCC Central Hub
            </div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-2xl">
            <Building2 size={22} />
          </div>
        </div>

        {/* Card 2: EV Charging Slots */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">EV Charging Slot Load</div>
            <div className="text-2xl font-black text-emerald-500 mt-1">
              {occupiedEvChargers} <span className="text-xs font-bold text-slate-400">/ {totalEvChargers} Active Slots</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">
              {totalEvChargers - occupiedEvChargers} Slots Available
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-2xl">
            <Zap size={22} />
          </div>
        </div>

        {/* Card 3: Active Shift Drivers */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Shift Drivers</div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {totalDrivers} <span className="text-xs font-bold text-slate-400">Crew</span>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 mt-1">
              Shift Roster Synchronized
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-2xl">
            <Users size={22} />
          </div>
        </div>

        {/* Card 4: Depot Maintenance Bays */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Depot Bay Maintenance</div>
            <div className="text-2xl font-black text-amber-500 mt-1">88 Buses</div>
            <div className="text-[10px] font-bold text-amber-600 mt-1">
              Active Service Repairs
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-500 rounded-2xl">
            <Wrench size={22} />
          </div>
        </div>

      </div>

      {/* ── MAIN CONTENT GRID: 2 COLUMNS (Depot Roster List + Depot Inspector) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── LEFT: DEPOT ROSTER LIST (5 COLS) ── */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-5 shadow-lg shadow-slate-900/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Mumbai Depot Roster ({filteredDepots.length})
            </h2>
            <span className="text-xs font-bold text-slate-400">Select Depot to Inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredDepots.map((depot) => {
              const isSelected = selectedDepotId === depot.id;

              return (
                <div
                  key={depot.id}
                  onClick={() => setSelectedDepotId(depot.id)}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer border flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900 shadow-md ring-1 ring-purple-200'
                      : 'bg-white/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {depot.code}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {depot.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Zone: {depot.zone} • {depot.totalBuses} Buses
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                      depot.status.includes('Optimal') 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' 
                        : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {depot.status}
                    </span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: SELECTED DEPOT INSPECTOR (7 COLS) ── */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-lg shadow-slate-900/5 space-y-5">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                {selectedDepot.code}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                    Depot Manager: {selectedDepot.depotManager}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedDepot.name}
                </h2>

                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  Zone: {selectedDepot.zone} • Lat/Lng: {selectedDepot.lat}, {selectedDepot.lng}
                </div>
              </div>
            </div>

            <button 
              onClick={handleReassignRoster}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Reassign Roster
            </button>
          </div>

          {/* Depot Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Fleet En-Route</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                {selectedDepot.activeEnRoute} <span className="text-xs font-bold text-slate-400">/ {selectedDepot.totalBuses} Buses</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-1">
                {Math.round((selectedDepot.activeEnRoute / selectedDepot.totalBuses) * 100)}% Operational
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EV Charging Queue</div>
              <div className="text-xl font-black text-emerald-500 mt-1">
                {selectedDepot.evChargersOccupied} <span className="text-xs font-bold text-slate-400">/ {selectedDepot.evChargersTotal} Slots</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 mt-1">
                {selectedDepot.evChargersTotal - selectedDepot.evChargersOccupied} Slots Free
              </div>
            </div>

            <div className="bg-slate-50/70 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift Roster Crew</div>
              <div className="text-xl font-black text-blue-600 mt-1">
                {selectedDepot.activeShiftDrivers} <span className="text-xs font-bold text-slate-400">Drivers</span>
              </div>
              <div className="text-[10px] font-bold text-blue-600 mt-1">
                Shift Handover Sync OK
              </div>
            </div>
          </div>

          {/* Interactive Depot Location Map Preview */}
          <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
            <Map
              initialViewState={{
                longitude: selectedDepot.lng || 72.8570,
                latitude: selectedDepot.lat || 19.0270,
                zoom: 13
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              mapLib={maplibregl}
              style={{ width: "100%", height: "100%" }}
            >
              <Marker longitude={selectedDepot.lng || 72.8570} latitude={selectedDepot.lat || 19.0270} anchor="center">
                <div className="w-9 h-9 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-xs">
                  {selectedDepot.code}
                </div>
              </Marker>
            </Map>

            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200">
              📍 Depot Location: {selectedDepot.name}
            </div>
          </div>

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

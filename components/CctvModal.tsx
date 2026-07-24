"use client";
import React, { useState } from "react";
import { X, Camera, ShieldAlert, Maximize2, RefreshCw, Radio, Eye } from "lucide-react";

interface CctvModalProps {
  busNumber?: string;
  routeName?: string;
  tripId?: string;
  onClose: () => void;
}

export default function CctvModal({
  busNumber = "MH-01-CV-1010",
  routeName = "Route 101 (Colaba → Bandra)",
  tripId = "TRIP-101-01",
  onClose
}: CctvModalProps) {
  const [activeCam, setActiveCam] = useState<"cabin" | "driver" | "door">("cabin");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 text-red-500 rounded-xl border border-red-500/30 flex items-center gap-2">
              <Radio size={16} className="animate-pulse" />
              <span className="text-xs font-black tracking-wider uppercase">LIVE ON-BUS CCTV STREAM</span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">{busNumber}</h3>
              <p className="text-[11px] text-slate-400 font-medium">{routeName} • ID: {tripId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh Stream"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin text-blue-400" : ""} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Camera Selector Tabs */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCam("cabin")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeCam === "cabin"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Camera size={14} />
              <span>CAM 1: Passenger Cabin</span>
            </button>

            <button
              onClick={() => setActiveCam("driver")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeCam === "driver"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Eye size={14} />
              <span>CAM 2: Driver & Road</span>
            </button>

            <button
              onClick={() => setActiveCam("door")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeCam === "door"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              <Camera size={14} />
              <span>CAM 3: Rear Door & Aisle</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>1080P @ 30FPS • 244 KB/S</span>
          </div>
        </div>

        {/* Video Surface Viewport */}
        <div className="flex-1 bg-black relative min-h-[340px] flex items-center justify-center overflow-hidden">
          {/* Simulated Live Video Feed */}
          {activeCam === "cabin" && (
            <img 
              src="/images/crowd1.jpg" 
              alt="Live Passenger Cabin Camera Feed" 
              className="w-full h-full object-cover filter contrast-105"
            />
          )}

          {activeCam === "driver" && (
            <img 
              src="/images/crowd2.jpg" 
              alt="Live Driver Road View Camera Feed" 
              className="w-full h-full object-cover filter contrast-105"
            />
          )}

          {activeCam === "door" && (
            <img 
              src="/images/crowd1.jpg" 
              alt="Live Rear Door Camera Feed" 
              className="w-full h-full object-cover filter contrast-105 scale-x-[-1]"
            />
          )}

          {/* OSD Timestamp Overlay */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white font-mono text-[11px] space-y-0.5">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              REC • ON-BUS NVR-400
            </div>
            <div>{new Date().toISOString().replace('T', ' ').substring(0, 19)} IST</div>
            <div className="text-slate-400 text-[10px]">FPS: 29.97 | TEMP: 42°C | GPS: FIX (3D)</div>
          </div>

          {/* OSD Watermark Logo */}
          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-blue-400" />
            <span>BEST CONTROL ROOM SECURITY FEED</span>
          </div>
        </div>

        {/* Footer Metrics Bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-4">
            <span>Speed: <strong className="text-white">24 km/h</strong></span>
            <span>Occupancy: <strong className="text-red-400">88% (Heavy Crowd)</strong></span>
            <span>Panic SOS: <strong className="text-emerald-400">NORMAL</strong></span>
          </div>

          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
          >
            Close Feed
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";
import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface Vehicle3DMarkerProps {
  busNumber?: string;
  routeName?: string;
  color?: string;
  status?: "NORMAL" | "ON_TIME" | "DELAYED" | "ALERT";
  heading?: number;
  occupancy?: number;
}

export default function Vehicle3DMarker({
  busNumber = "MH-01-CV-4921",
  routeName = "101",
  color = "#3b82f6",
  status = "NORMAL",
  heading = 45,
  occupancy = 42
}: Vehicle3DMarkerProps) {
  const isAlert = status === "ALERT";
  const isDelayed = status === "DELAYED";

  // Use crisp vehicle body colors (Red for alert, Amber for delayed, or BEST Red/Blue/Green theme)
  const primaryColor = isAlert ? "#dc2626" : isDelayed ? "#d97706" : color || "#2563eb";
  const accentColor = isAlert ? "#991b1b" : isDelayed ? "#92400e" : "#1d4ed8";

  return (
    <div className="relative group cursor-pointer select-none">
      {/* Dynamic Ground Warning Halo */}
      {isAlert && (
        <div className="absolute -inset-4 bg-red-600/30 rounded-full animate-ping z-0 pointer-events-none"></div>
      )}
      {isDelayed && (
        <div className="absolute -inset-3 bg-amber-400/30 rounded-full animate-pulse z-0 pointer-events-none"></div>
      )}

      {/* 3D Volumetric Vehicle Perspective Container */}
      <div 
        className="relative z-10 transition-transform duration-300 group-hover:scale-125"
        style={{
          transform: `rotate(${heading}deg)`,
          perspective: "600px",
          transformStyle: "preserve-3d"
        }}
      >
        {/* Realistic Volumetric Ground Shadow (Matching Image 2 Perspective) */}
        <div 
          className="absolute -top-1 -left-2 w-16 h-8 bg-slate-950/50 rounded-2xl blur-[2px] transform skew-x-12 translate-y-4 translate-x-2"
          style={{ transform: "rotateX(60deg) scale(1.1)" }}
        ></div>

        {/* 3D BEST Electric Bus Body (High-Fidelity Volumetric Mesh) */}
        <div 
          className="relative w-16 h-8 rounded-xl shadow-2xl flex items-center justify-between p-1 border border-white/50"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            transformStyle: "preserve-3d",
            transform: "rotateX(45deg) rotateY(-12deg) translateZ(12px)",
            boxShadow: `0 12px 24px -4px ${primaryColor}90, 0 6px 10px -2px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)`
          }}
        >
          {/* Front Bumper & Windshield Section */}
          <div className="flex items-center gap-0.5 z-20">
            {/* Front Windshield Glass */}
            <div className="w-3 h-5 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 rounded-sm border border-cyan-300/60 shadow-inner flex flex-col items-center justify-center">
              <div className="w-2 h-1.5 bg-cyan-300/40 rounded-2xs backdrop-blur-xs"></div>
            </div>
            {/* Front Headlights */}
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1.5 bg-amber-200 rounded-full shadow-[0_0_8px_#fef08a]"></div>
              <div className="w-1 h-1.5 bg-amber-200 rounded-full shadow-[0_0_8px_#fef08a]"></div>
            </div>
          </div>

          {/* Roof Structure & Aerodynamic AC Unit */}
          <div className="flex-1 flex flex-col items-center justify-center px-1.5 z-20">
            {/* LED Destination Board */}
            <div className="bg-slate-950/90 px-1.5 py-0.5 rounded-xs border border-amber-400/60 shadow-xs flex items-center justify-center leading-none mb-0.5">
              <span className="text-[7.5px] font-black text-amber-300 font-mono tracking-tighter truncate max-w-[32px]">
                {routeName}
              </span>
            </div>

            {/* Aerodynamic Dual Roof VAE Cooling Unit */}
            <div className="w-6 h-1.5 bg-slate-100/90 dark:bg-slate-200/90 rounded-xs border border-slate-400 shadow-sm flex items-center justify-around px-0.5">
              <div className="w-1.5 h-0.5 bg-slate-400 rounded-2xs"></div>
              <div className="w-1.5 h-0.5 bg-slate-400 rounded-2xs"></div>
            </div>
          </div>

          {/* Rear Window & Glowing LED Brake Lights (Matching Image 2 Rear Lights) */}
          <div className="flex items-center gap-0.5 z-20">
            {/* Glowing Red LED Taillights */}
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
              <div className="w-1 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
            </div>
            {/* Rear Windshield Glass */}
            <div className="w-2.5 h-5 bg-gradient-to-bl from-slate-900 to-slate-800 rounded-sm border border-slate-700"></div>
          </div>

          {/* 3D Side Windows Panel */}
          <div className="absolute inset-x-4 -top-1 h-1.5 flex justify-between px-0.5 z-30">
            <div className="w-2 h-1.5 bg-cyan-200/90 rounded-2xs border border-cyan-400/50 shadow-xs"></div>
            <div className="w-2 h-1.5 bg-cyan-200/90 rounded-2xs border border-cyan-400/50 shadow-xs"></div>
            <div className="w-2 h-1.5 bg-cyan-200/90 rounded-2xs border border-cyan-400/50 shadow-xs"></div>
          </div>

          {/* Side Mirrors */}
          <div className="absolute -top-1.5 left-2 w-1 h-1.5 bg-slate-800 rounded-full border border-white/50"></div>
          <div className="absolute -bottom-1.5 left-2 w-1 h-1.5 bg-slate-800 rounded-full border border-white/50"></div>

          {/* 3D Rubber Wheels with Metallic Rims (Front & Rear) */}
          <div className="absolute -bottom-1.5 left-3 w-3 h-2 bg-slate-950 rounded-sm border border-slate-700 shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1 bg-slate-400 rounded-full"></div>
          </div>
          <div className="absolute -bottom-1.5 right-3 w-3 h-2 bg-slate-950 rounded-sm border border-slate-700 shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Problem Alert Badge */}
      {isAlert && (
        <div className="absolute -top-3 -right-2 bg-red-600 text-white p-1 rounded-full shadow-xl z-30 border-2 border-white animate-bounce">
          <AlertTriangle size={11} />
        </div>
      )}

      {/* Delayed Badge */}
      {isDelayed && (
        <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xl z-30 border-2 border-white">
          <Clock size={11} />
        </div>
      )}

      {/* Hover Tooltip */}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-40">
        <div className="bg-slate-900/95 text-white text-xs rounded-xl p-2.5 whitespace-nowrap shadow-2xl border border-slate-700 backdrop-blur-md flex flex-col items-center">
          <div className="flex items-center gap-2 font-black text-xs">
            <span>{busNumber}</span>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
          </div>
          <span className="text-slate-300 text-[10px] font-semibold mt-0.5">
            Route {routeName} • {status === 'ALERT' ? 'Problem Alert' : status === 'DELAYED' ? 'Delayed' : 'On Time'}
          </span>
          <div className="text-[10px] font-bold text-emerald-400 mt-1">
            🚌 3D BEST Electric Bus ({occupancy} passengers)
          </div>
        </div>
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-slate-900"></div>
      </div>
    </div>
  );
}

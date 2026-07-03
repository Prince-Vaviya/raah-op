"use client";
import React, { useState } from "react";
import { Filter, Layers, Crosshair, AlignJustify } from "lucide-react";

export default function LiveMap() {
  const [activeFilters, setActiveFilters] = useState({
    routes: true,
    stops: true,
    traffic: false,
    weather: false
  });

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 p-7">
      <img
        src="/map_preview.png"
        alt="Live Map Background"
        className="w-full h-full object-fit rounded-3xl shadow-sm"
      />

      {/* Top Left Filter Pill */}
      <div className="absolute top-12 left-12 bg-white rounded-full shadow-lg flex items-center p-2 gap-2">
        <div className="px-3 text-slate-500">
          <Filter size={20} />
        </div>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, routes: !prev.routes }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors ${activeFilters.routes ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, stops: !prev.stops }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors ${activeFilters.stops ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          Stops
        </button>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, traffic: !prev.traffic }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors ${activeFilters.traffic ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          Traffic
        </button>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, weather: !prev.weather }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors ${activeFilters.weather ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
        >
          Weather
        </button>
      </div>

      {/* Bottom Right Status Legend */}
      <div className="absolute bottom-12 right-12 bg-white rounded-2xl shadow-lg p-6 min-w-[240px]">
        <h3 className="text-sm font-bold text-slate-500 tracking-wider mb-4">STATUS</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#10b981]"></span>
            <span className="text-slate-700 font-medium text-lg">On Time</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#f59e0b]"></span>
            <span className="text-slate-700 font-medium text-lg">Delayed / Crowded</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#ef4444]"></span>
            <span className="text-slate-700 font-medium text-lg">Emergency</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-[#6366f1]"></span>
            <span className="text-slate-700 font-medium text-lg">Re-Routed</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-slate-500 text-sm">Click Bus to inspect</p>
        </div>
      </div>

      {/* Right side floating controls */}
      <div className="absolute top-1/4 -translate-y-1/2 right-12 flex flex-col gap-1 bg-white rounded-full shadow-lg p-2">
        <button className="p-3 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <AlignJustify size={24} />
        </button>
        <div className="w-8 h-px bg-slate-100 mx-auto"></div>
        <button className="p-3 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Layers size={24} />
        </button>
        <div className="w-8 h-px bg-slate-100 mx-auto"></div>
        <button className="p-3 text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <Crosshair size={24} />
        </button>
      </div>

      {/* Bottom Center Route Pills */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-8 py-4 flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <span className="w-5 h-5 rounded-full bg-[#6366f1]"></span>
          <span className="font-semibold text-slate-700 text-lg">Rt 101</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <span className="w-5 h-5 rounded-full bg-[#10b981]"></span>
          <span className="font-semibold text-slate-700 text-lg">Rt 102</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <span className="w-5 h-5 rounded-full bg-[#f59e0b]"></span>
          <span className="font-semibold text-slate-700 text-lg">Rt 201</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <span className="w-5 h-5 rounded-full bg-[#14b8a6]"></span>
          <span className="font-semibold text-slate-700 text-lg">Rt 302</span>
        </div>
        <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
          <span className="w-5 h-5 rounded-full bg-[#ef4444]"></span>
          <span className="font-semibold text-slate-700 text-lg">Rt 404</span>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useData } from "../providers/DataProvider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, Clock, AlertTriangle, Fuel } from "lucide-react";

export default function MissionControl() {
  const { metrics, weeklyRidership, peakHourData, delayTrend, routeHealth } = useData();
  const [timeFilter, setTimeFilter] = React.useState('7D');

  const filters = ['Today', '7D', '30D'];

  const multiplier = timeFilter === 'Today' ? 0.2 : timeFilter === '30D' ? 4 : 1;

  const displayMetrics = {
    totalRidership: metrics.totalRidership * (timeFilter === 'Today' ? 0.15 : multiplier),
    onTimeRate: Math.min(100, metrics.onTimeRate + (timeFilter === 'Today' ? 4 : timeFilter === '30D' ? -3 : 0)),
    avgDelay: metrics.avgDelay * (timeFilter === 'Today' ? 0.6 : timeFilter === '30D' ? 1.4 : 1),
    fuelEfficiency: metrics.fuelEfficiency * (timeFilter === 'Today' ? 1.08 : timeFilter === '30D' ? 0.95 : 1),
  };

  const displayWeeklyRidership = weeklyRidership.map(d => ({ ...d, val: Math.round(d.val * multiplier) }));
  const displayPeakHourData = peakHourData.map(d => ({ ...d, passengers: Math.round(d.passengers * multiplier) }));
  const displayDelayTrend = delayTrend.map(d => ({ ...d, delay: Number((d.delay * (timeFilter === 'Today' ? 0.7 : timeFilter === '30D' ? 1.5 : 1)).toFixed(1)) }));
  const displayRouteHealth = routeHealth.map((r, idx) => {
    const offsets = [14, -14, 7, -22, 10, -5, 18];
    const baseOffset = offsets[idx % offsets.length];
    const rawScore = r.score + baseOffset;
    const timeShift = timeFilter === 'Today' ? 8 : timeFilter === '30D' ? -12 : 0;
    const newScore = Math.min(98, Math.max(35, rawScore + timeShift));
    
    return {
      ...r,
      score: newScore,
      color: newScore < 50 ? 'bg-red-500' : newScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Network Overview</h1>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                timeFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ridership */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Ridership</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-tight">
              {displayMetrics.totalRidership.toFixed(1)}k
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} />
              <span>+4.2% vs last period</span>
            </div>
          </div>
        </div>

        {/* On-Time Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Time Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-tight">
              {displayMetrics.onTimeRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="font-semibold text-slate-500">Target: 90%</span>
              <span className="font-bold text-emerald-600">On Track</span>
            </div>
          </div>
        </div>

        {/* Avg Delay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Delay</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-tight">
              {displayMetrics.avgDelay.toFixed(1)} <span className="text-lg font-bold text-slate-400">min</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-amber-600">
              <TrendingDown size={14} />
              <span>-0.4 min improvement</span>
            </div>
          </div>
        </div>

        {/* Fuel Efficiency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuel Efficiency</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Fuel size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 leading-tight">
              {displayMetrics.fuelEfficiency.toFixed(1)} <span className="text-lg font-bold text-slate-400">km/L</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp size={14} />
              <span>+0.3 vs last {timeFilter === '30D' ? 'month' : 'week'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ridership Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Ridership Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Passenger volume over time</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {timeFilter} View
            </span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayWeeklyRidership} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}k`} />
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hour Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Peak Hour Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Passenger load per operational hour</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Pax Count
            </span>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayPeakHourData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={16}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} interval={1} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Bar dataKey="passengers" radius={[6, 6, 6, 6]}>
                  {displayPeakHourData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.passengers > (10000 * multiplier) ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Route Health & Delay Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Health Scores */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Route Health Scores</h3>
              <p className="text-xs text-slate-500 mt-0.5">Reliability score breakdown across active routes</p>
            </div>
          </div>

          <div className="space-y-3">
            {displayRouteHealth.map((route, idx) => {
              const badgeBg = route.score < 50 ? 'bg-red-500' : route.score < 80 ? 'bg-amber-500' : 'bg-emerald-500';
              const textScoreColor = route.score < 50 ? 'text-red-600' : route.score < 80 ? 'text-amber-600' : 'text-emerald-600';
              const badgeLabel = route.name ? `R-${route.name.replace(/[^0-9A-Z]/gi, '')}` : `R-${idx + 1}`;

              return (
                <div key={route.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className={`px-2.5 py-1 rounded-lg ${badgeBg} text-white font-extrabold text-xs shrink-0 shadow-xs`}>
                    {badgeLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5 gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate">{route.name}</span>
                      <span className={`text-xs font-extrabold ${textScoreColor} shrink-0`}>
                        {route.score} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${badgeBg} rounded-full transition-all duration-500`}
                        style={{ width: `${route.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delay Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Delay Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Network-wide average delay progression</p>
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
              Minutes
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayDelayTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'auto']} tickCount={5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} 
                />
                <Line type="monotone" dataKey="delay" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#dc2626', stroke: '#ffffff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useData } from "../../providers/DataProvider";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from "recharts";

export default function Insights() {
  const { metrics, weeklyRidership, peakHourData, delayTrend, routeHealth } = useData();
  const [timeFilter, setTimeFilter] = React.useState('7D');

  const filters = ['Today', '7D', '30D'];

  // Mock scaling logic to make the charts look different when switching filters
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
  const displayRouteHealth = routeHealth.map(r => {
    const newScore = Math.min(100, Math.max(0, r.score + (timeFilter === 'Today' ? 8 : timeFilter === '30D' ? -12 : 0)));
    return {
      ...r,
      score: newScore,
      color: newScore < 50 ? 'bg-red-500' : newScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-[#d9f0ff] to-[#f4f7fb] rounded-[3rem] p-12 overflow-hidden h-64 flex items-center">
        {/* Decorative background curve */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/40 rounded-l-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>

        <div className="relative z-10 flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Insights</h1>
            <p className="text-slate-500">June-July 2026 · Network performance overview</p>
          </div>
        </div>

        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-white">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full cursor-pointer transition-colors ${timeFilter === f ? 'text-white bg-blue-500 shadow-sm' : 'text-slate-600 hover:bg-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Total Ridership</div>
          <div className="text-3xl font-black text-blue-500 mb-1">{displayMetrics.totalRidership.toFixed(1)}k</div>
          <div className="text-xs text-blue-400 font-medium">{timeFilter === 'Today' ? 'Today' : timeFilter === '30D' ? 'This month' : 'This week'}</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">On-Time Rate</div>
          <div className="text-3xl font-black text-amber-500 mb-1">{displayMetrics.onTimeRate.toFixed(1)}%</div>
          <div className="text-xs text-blue-400 font-medium">Target: 90%</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Avg Delay</div>
          <div className="text-3xl font-black text-red-500 mb-1">{displayMetrics.avgDelay.toFixed(1)} <span className="text-xl">min</span></div>
          <div className="text-xs text-blue-400 font-medium">Network-wide</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Fuel Efficiency</div>
          <div className="text-3xl font-black text-emerald-500 mb-1">{displayMetrics.fuelEfficiency.toFixed(1)} <span className="text-xl">km/L</span></div>
          <div className="text-xs text-blue-400 font-medium">+0.3 vs last {timeFilter === '30D' ? 'month' : 'week'}</div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Ridership */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800">Ridership Trend</h3>
          <p className="text-xs text-slate-500 mb-8">{timeFilter === 'Today' ? 'Today vs Yesterday' : timeFilter === '30D' ? 'This month vs last month' : 'This week vs last week'}</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayWeeklyRidership} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val}k`} />
                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hour Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800">Peak Hour Distribution</h3>
          <p className="text-xs text-slate-500 mb-8">Passengers per hour</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayPeakHourData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }} barSize={12}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} interval={1} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="passengers" radius={[4, 4, 4, 4]}>
                  {displayPeakHourData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.passengers > (10000 * multiplier) ? '#3b82f6' : '#bfdbfe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Route Health Scores */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-8">Route Health Scores</h3>
          <div className="flex-1 space-y-5 flex flex-col justify-between">
            {displayRouteHealth.map((route) => (
              <div key={route.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${route.color} text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm`}>
                  {route.id}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">{route.name}</span>
                    <span className={`text-sm font-bold ${route.score < 50 ? 'text-red-500' : route.score < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>{route.score}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${route.color} rounded-full transition-all duration-500`}
                      style={{ width: `${route.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay Trend */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800">Delay Trend</h3>
          <p className="text-xs text-slate-500 mb-8">Average delay (minutes)</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayDelayTrend} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 'auto']} tickCount={6} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="delay" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

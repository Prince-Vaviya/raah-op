"use client";
import { useData } from "../providers/DataProvider";
import Link from "next/link";
import { Route, Lightbulb, ArrowRight, AlertTriangle, AlertCircle, PlayCircle, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function MissionControl() {
  const { metrics, activities, weeklyRidership } = useData();

  return (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Buses", value: metrics.activeBuses, color: "bg-blue-50 text-blue-600" },
          { label: "Running Routes", value: metrics.runningRoutes, color: "bg-emerald-50 text-emerald-600" },
          { label: "Health Score", value: `${metrics.healthScore}/100`, color: "bg-indigo-50 text-indigo-600" },
          { label: "Delayed Buses", value: metrics.delayedBuses, color: "bg-orange-50 text-orange-600" }
        ].map((stat, i) => (
          <div key={i} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden min-h-[117px] flex items-center">
            <img src="/light-grey.svg" alt="" className="absolute right-0 top-0 h-full w-auto object-cover pointer-events-none z-0" />
            <img src="/dark-grey.svg" alt="" className="absolute right-0 top-0 h-full w-auto object-cover pointer-events-none z-0" />

            <div className="relative z-10 px-6 py-4 flex flex-col">
              <span className="text-4xl font-bold text-[#183247] tracking-tight">{stat.value}</span>
              <span className="text-sm font-medium text-slate-500 leading-tight mt-1 w-min">
                {stat.label.split(' ').map((word, index) => <span key={index} className="block">{word}</span>)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Left Column (Map & Chart) */}
        <div className="col-span-2 space-y-6">
          {/* Map Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative h-96 group">
            <img src="/map_preview.png" alt="Map Preview" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg font-semibold text-slate-800 shadow-sm border border-slate-100">
              Live Map Preview
            </div>
            <Link href="/livemap">
              <button className="absolute bottom-4 right-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg flex items-center gap-2 transition-colors">
                Full Map <ArrowRight size={16} />
              </button>
            </Link>
          </div>

          {/* Weekly Chart Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Weekly Ridership</h3>
                <p className="text-sm text-slate-500">Total passengers per day</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span>↑</span> 8.2% WoW
              </div>
            </div>

            {/* Area Chart */}
            <div className="h-64 pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyRidership} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    tickFormatter={(value) => `${value}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (Activity Feed) */}
        <div className="col-span-1 flex flex-col gap-6">

          {/* Live Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-900">Live Activity</h3>
              <span className="text-xs text-slate-500 font-medium">Last 30 min</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
                    {activity.type === 'error' ? <AlertTriangle size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insight */}
            <div className="m-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100/50 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-indigo-600" />
                <span className="text-xs font-bold tracking-wider uppercase text-indigo-600">AI Insight</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Route 102 is experiencing bus bunching near Silk Board. Recommend holding Bus 102B for 3 minutes.
              </p>
            </div>
          </div>

          {/* Mascot Decor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-center h-48 relative overflow-hidden">
            <img src="/mascot_bird_standing Background Removed.svg" alt="Mascot" className="h-32 object-contain" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
          </div>

        </div>
      </div>
    </>
  );
}

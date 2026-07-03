"use client";
import { useState, useEffect } from "react";
import { LayoutDashboard, Map as MapIcon, Route, Lightbulb, Bell, Search, CloudRain, Clock, ArrowRight, AlertTriangle, AlertCircle, PlayCircle, Zap } from "lucide-react";

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [metrics] = useState({
    activeBuses: 247,
    runningRoutes: 14,
    healthScore: 78,
    delayedBuses: 23,
    temperature: 29
  });

  const [activities] = useState([
    { id: 1, title: 'Bus Bunching Detected on Route 102', time: 'Rt 102 · 2 min ago', type: 'error' },
    { id: 2, title: 'Bus B-404 Breakdown – HSR Layout', time: 'Rt 404 · 8 min ago', type: 'error' },
    { id: 3, title: 'High Occupancy Warning – Route 102', time: 'Rt 102 · 15 min ago', type: 'warning' },
    { id: 4, title: 'Route 201 Minor Delay – Road Work', time: 'Rt 201 · 22 min ago', type: 'warning' },
  ]);

  return (
    <div className="flex h-screen w-full bg-[#f4f7fb] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">RAAH</h1>
            <p className="text-xs text-slate-500 mt-1">Keeping Mumbai Moving</p>
          </div>
          <nav className="px-4 space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <LayoutDashboard size={20} /> Mission Control
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
              <MapIcon size={20} /> Live Map
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
              <Route size={20} /> Route Inspector
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
              <Lightbulb size={20} /> Insights
            </a>
            <a href="#" className="flex flex-1 items-center justify-between px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors group">
              <div className="flex items-center gap-3">
                <Bell size={20} /> Alerts
              </div>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
            </a>
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-2 overflow-hidden flex items-center justify-center">
              <img src="/assets/mascot_bird_megaphone.png" alt="Mascot" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm font-semibold text-blue-700">Hello Operator!</p>
            <p className="text-xs text-slate-600 mt-1">Let's make Mumbai move smarter today!</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search routes, buses, or alerts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <CloudRain className="text-slate-400" size={18} />
              <div className="text-sm">
                <span className="font-semibold text-slate-700">{metrics.temperature}°C</span>
                <span className="text-slate-500 ml-1">Partly cloudy</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-slate-400" size={18} />
              <div className="text-sm text-right">
                <div className="font-semibold text-slate-700">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</div>
                <div className="text-xs text-slate-500">{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/assets/avatar_operator.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">Arjun Singh</div>
                <div className="text-xs text-slate-500">Operator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Title */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Mission Control</h2>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Active Buses", value: metrics.activeBuses, color: "bg-blue-50 text-blue-600", icon: PlayCircle },
                { label: "Running Routes", value: metrics.runningRoutes, color: "bg-emerald-50 text-emerald-600", icon: Route },
                { label: "Health Score", value: `${metrics.healthScore}/100`, color: "bg-indigo-50 text-indigo-600", icon: Zap },
                { label: "Delayed Buses", value: metrics.delayedBuses, color: "bg-orange-50 text-orange-600", icon: AlertCircle }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm font-medium text-slate-500">{stat.label}</div>
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
                  <img src="/assets/map_preview.png" alt="Map Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg font-semibold text-slate-800 shadow-sm border border-slate-100">
                    Live Map Preview
                  </div>
                  <button className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium shadow-lg flex items-center gap-2 transition-colors">
                    Full Map <ArrowRight size={16} />
                  </button>
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

                  {/* CSS Bar Chart */}
                  <div className="h-48 flex items-end justify-between gap-4 pt-4 border-t border-slate-100">
                    {[
                      { day: 'Mon', val: 40 },
                      { day: 'Tue', val: 55 },
                      { day: 'Wed', val: 45 },
                      { day: 'Thu', val: 70 },
                      { day: 'Fri', val: 85 },
                      { day: 'Sat', val: 95 },
                      { day: 'Sun', val: 65 }
                    ].map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-blue-100 rounded-t-sm relative transition-all group-hover:bg-blue-200" style={{ height: `${d.val}%` }}>
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold text-slate-700 transition-opacity">
                            {d.val}k
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500">{d.day}</span>
                      </div>
                    ))}
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
                  <img src="/assets/mascot_bird_standing.png" alt="Mascot" className="h-32 object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

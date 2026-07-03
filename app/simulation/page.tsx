"use client";
import React from "react";
import { useData } from "../../providers/DataProvider";
import { Settings2, Save, Activity, Plus, BarChart2 } from "lucide-react";

export default function SimulationPanel() {
  const { 
    metrics, setMetrics, 
    weeklyRidership, setWeeklyRidership, 
    setActivities, 
    routeHealth, setRouteHealth,
    setPeakHourData, setDelayTrend 
  } = useData();

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({
      ...prev,
      [name]: Number(value) || 0
    }));
  };

  const handleRidershipChange = (index: number, value: string) => {
    const newWeekly = [...weeklyRidership];
    newWeekly[index].val = parseInt(value) || 0;
    setWeeklyRidership(newWeekly);
  };

  const handleRouteChange = (id: string, value: string) => {
    const score = parseInt(value) || 0;
    const color = score < 50 ? 'bg-red-500' : score < 80 ? 'bg-amber-500' : 'bg-emerald-500';
    setRouteHealth(prev => prev.map(r => r.id === id ? { ...r, score, color } : r));
  };

  const randomizeCharts = () => {
    setPeakHourData(prev => prev.map(p => ({ ...p, passengers: Math.floor(Math.random() * 15000) + 2000 })));
    setDelayTrend(prev => prev.map(d => ({ ...d, delay: Number((Math.random() * 12 + 1).toFixed(1)) })));
  };

  const addRandomActivity = () => {
    const types = ["error", "warning"];
    const titles = [
      "Bus Breakdown Reported",
      "Route Deviation Detected",
      "Heavy Traffic Alert",
      "Passenger Emergency",
      "Speed Limit Exceeded"
    ];
    
    setActivities(prev => {
      const newId = prev.length ? Math.max(...prev.map(a => a.id)) + 1 : 1;
      const newActivity = {
        id: newId,
        title: titles[Math.floor(Math.random() * titles.length)],
        time: `Rt ${Math.floor(Math.random() * 500)} · Just now`,
        type: types[Math.floor(Math.random() * types.length)],
      };
      return [newActivity, ...prev].slice(0, 10);
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Global Metrics</h2>
            <p className="text-sm text-slate-500">Adjust the numbers to see changes reflect on the Mission Control & Insights dashboards instantly.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Active Buses</label>
            <input type="number" name="activeBuses" value={metrics.activeBuses} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Running Routes</label>
            <input type="number" name="runningRoutes" value={metrics.runningRoutes} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Health Score</label>
            <input type="number" name="healthScore" max="100" value={metrics.healthScore} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Delayed Buses</label>
            <input type="number" name="delayedBuses" value={metrics.delayedBuses} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          
          {/* Insights KPIs */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Total Ridership (k)</label>
            <input type="number" step="0.1" name="totalRidership" value={metrics.totalRidership} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">On-Time Rate (%)</label>
            <input type="number" step="0.1" name="onTimeRate" max="100" value={metrics.onTimeRate} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Avg Delay (min)</label>
            <input type="number" step="0.1" name="avgDelay" value={metrics.avgDelay} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Fuel Effic. (km/L)</label>
            <input type="number" step="0.1" name="fuelEfficiency" value={metrics.fuelEfficiency} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Weekly Ridership Data</h2>
              <p className="text-sm text-slate-500">Edit the graph values (in thousands)</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {weeklyRidership.map((dayData, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-12 font-medium text-slate-700">{dayData.day}</span>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={dayData.val} 
                  onChange={(e) => handleRidershipChange(i, e.target.value)}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="w-12 text-right font-semibold text-slate-600">{dayData.val}k</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Route Health Scores</h2>
              <p className="text-sm text-slate-500">Adjust health scores to see progress bar changes on Insights.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {routeHealth.map((route) => (
              <div key={route.id} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">{route.name}</span>
                  <span className="font-semibold text-slate-600">{route.score}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={route.score} 
                  onChange={(e) => handleRouteChange(route.id, e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-4 h-[200px]">
          <h2 className="text-xl font-bold text-slate-800">Randomize Insights Charts</h2>
          <p className="text-slate-500 max-w-sm text-sm">
            Instantly generate random data for the Peak Hour Distribution and Delay Trend charts.
          </p>
          <button 
            onClick={randomizeCharts}
            className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all active:scale-95"
          >
            <BarChart2 size={18} /> Randomize Charts
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-4 h-[200px]">
          <h2 className="text-xl font-bold text-slate-800">Activity Generator</h2>
          <p className="text-slate-500 max-w-sm text-sm">
            Push a random alert or warning into the Live Activity feed on the main dashboard to test the real-time stream.
          </p>
          <button 
            onClick={addRandomActivity}
            className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-lg transition-all active:scale-95"
          >
            <Plus size={18} /> Inject Random Activity
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";
import React from "react";
import { useData } from "../../providers/DataProvider";
import { Settings2, Save, Activity, Plus } from "lucide-react";

export default function SimulationPanel() {
  const { metrics, setMetrics, weeklyRidership, setWeeklyRidership, setActivities } = useData();

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleRidershipChange = (index: number, value: string) => {
    const newWeekly = [...weeklyRidership];
    newWeekly[index].val = parseInt(value) || 0;
    setWeeklyRidership(newWeekly);
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
      return [newActivity, ...prev].slice(0, 10); // Keep latest 10
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
            <p className="text-sm text-slate-500">Adjust the numbers to see changes reflect on the Mission Control dashboard instantly.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase">Temperature (°C)</label>
            <input type="number" name="temperature" value={metrics.temperature} onChange={handleMetricChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-4 h-[400px]">
          <h2 className="text-xl font-bold text-slate-800">Activity Generator</h2>
          <p className="text-slate-500 max-w-sm">
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

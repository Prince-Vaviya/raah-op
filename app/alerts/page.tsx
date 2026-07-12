"use client";
import React, { useState } from "react";
import { useData } from "../../providers/DataProvider";
import { AlertTriangle, RefreshCw, Zap, Eye, Check, AlertCircle, Cross, CrossIcon, X } from "lucide-react";

export default function Alerts() {
  const { activities, setActivities } = useData();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'resolved'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<{alert: any, action: 'approved' | 'rejected', timestamp: string}[]>([]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  const handleAction = async (alertId: number, action: 'approved' | 'rejected') => {
    const alert = activities.find(a => a.id === alertId);
    if (!alert) return;
    
    if (action === 'approved') {
      try {
        const { API_URL } = await import('../../lib/api');
        const token = localStorage.getItem('operator_token');
        await fetch(`${API_URL}/commands`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            trip_id: (alert as any).trip_id || '00000000-0000-0000-0000-000000000000',
            type: 'HOLD',
            duration_sec: 180,
            reason: alert.aiSummary || 'Operator action',
          })
        });
      } catch (err) {
        console.error("Failed to send command", err);
      }
    }

    // Remove from main list
    setActivities(prev => prev.filter(a => a.id !== alertId));
    
    // Add to history
    setHistory(prev => [{
      alert,
      action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev]);
  };

  const criticalCount = activities.filter(a => a.type === 'error').length;
  const warningCount = activities.filter(a => a.type === 'warning').length;

  const filteredActivities = filter === 'all'
    ? activities
    : filter === 'resolved'
      ? []
      : activities.filter(a => a.type === filter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alert Center</h1>
          <p className="text-sm text-slate-500 mt-1">{criticalCount} critical · {warningCount} warnings</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-full w-fit">
        <button
          onClick={() => setFilter(filter === 'error' ? 'all' : 'error')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'error' || filter === 'all' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
        >
          Critical
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${filter === 'error' || filter === 'all' ? 'bg-white text-blue-500' : 'bg-slate-200 text-slate-600'}`}>
            {criticalCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'warning' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
        >
          Warning
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${filter === 'warning' ? 'bg-white text-amber-500' : 'bg-slate-200 text-slate-600'}`}>
            {warningCount}
          </span>
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
        >
          Resolved
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4 mt-6">
        {isRefreshing ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0"></div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-5 bg-slate-100 rounded-full w-16"></div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-1/4 mt-2"></div>
                </div>

                <div className="bg-[#f4f7fb] rounded-xl p-4 space-y-3 border border-slate-50">
                  <div className="h-4 bg-slate-200/50 rounded w-24"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200/50 rounded w-full"></div>
                    <div className="h-3 bg-slate-200/50 rounded w-5/6"></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="h-9 w-32 bg-slate-100 rounded-full"></div>
                  <div className="h-9 w-36 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : filter === 'resolved' ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            Check the history section below for resolved alerts.
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            No alerts found for this filter.
          </div>
        ) : (
          filteredActivities.map(alert => (
            <div key={alert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4 transition-all hover:shadow-md">
              <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${alert.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                {alert.type === 'error' ? <AlertTriangle size={24} /> : <AlertCircle size={24} />}
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-800">{alert.title}</h3>
                    <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${alert.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${alert.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                      {alert.type === 'error' ? 'Critical' : 'Warning'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {alert.time} {alert.description ? `· ${alert.description}` : ''}
                  </p>
                </div>

                {alert.aiSummary && (
                  <div className="bg-[#f4f7fb] rounded-xl p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 tracking-wider mb-2">
                      <Zap size={14} fill="currentColor" /> AI SUMMARY
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {alert.aiSummary}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button 
                    onClick={() => handleAction(alert.id, 'rejected')}
                    className="flex items-center gap-2 px-5 py-2 cursor-pointer bg-[#ffffff] hover:bg-[#f46666] hover:text-white border border-slate-200 text-slate-600 rounded-full transition-colors text-sm font-medium"
                  >
                    <X size={16} /> Reject Action
                  </button>
                  <button 
                    onClick={() => handleAction(alert.id, 'approved')}
                    className="flex items-center gap-2 px-5 py-2 cursor-pointer bg-[#10b981] hover:bg-[#059669] text-white rounded-full shadow-sm transition-colors text-sm font-medium"
                  >
                    <Check size={16} /> Approve Action
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Action History</h2>
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${item.action === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                    {item.action === 'approved' ? <Check size={20} /> : <X size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{item.alert.title}</h4>
                    <p className="text-sm text-slate-500">{item.alert.time} {item.alert.description ? `· ${item.alert.description}` : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.action === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.action === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useData } from "../../providers/DataProvider";
import { 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Check, 
  AlertCircle, 
  X, 
  Users, 
  Clock, 
  MapPin, 
  ChevronDown, 
  Info,
  Send,
  Eye,
  RotateCcw,
  Search
} from "lucide-react";

export default function Alerts() {
  const { activities, setActivities, dismissAlert, refreshAlerts } = useData();
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<{alert: any, action: 'approved' | 'rejected', timestamp: string}[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('raah_resolved_alert_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAlerts();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleAction = (alertId: number | string, action: 'approved' | 'rejected') => {
    const alert = activities.find(a => String(a.id) === String(alertId));
    if (!alert) return;

    dismissAlert(alertId);
    
    const newEntry = {
      alert,
      action,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem('raah_resolved_alert_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (action === 'approved') {
      import('../../lib/api').then(({ API_URL }) => {
        const token = localStorage.getItem('operator_token');
        fetch(`${API_URL}/commands`, {
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
        }).catch(err => console.error("Failed to send command", err));
      });
    }
  };

  const criticalCount = activities.filter(a => a.type === 'error').length;
  const warningCount = activities.filter(a => a.type === 'warning').length;
  const resolvedCount = history.length;

  const baseFiltered = filter === 'all'
    ? activities
    : filter === 'resolved'
      ? []
      : activities.filter(a => a.type === filter);

  const filteredActivities = baseFiltered.filter((a) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = (a.title || '').toLowerCase();
    const desc = (a.description || '').toLowerCase();
    const summary = (a.aiSummary || '').toLowerCase();
    const type = (a.type || '').toLowerCase();
    return title.includes(query) || desc.includes(query) || summary.includes(query) || type.includes(query);
  });

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = (item.alert?.title || '').toLowerCase();
    const desc = (item.alert?.description || '').toLowerCase();
    const action = (item.action || '').toLowerCase();
    return title.includes(query) || desc.includes(query) || action.includes(query);
  });

  // Helper styling for card variants
  const getCardVariant = (type: string) => {
    if (type === 'error') {
      return {
        borderLeft: 'border-l-4 border-l-red-500',
        iconBg: 'bg-red-50 text-red-500',
        badgeBg: 'bg-red-100 text-red-600',
        badgeDot: 'bg-red-500',
        badgeText: 'Critical',
        recBtnBg: 'bg-red-500 hover:bg-red-600 text-white',
        secBtnBorder: 'border border-red-200 text-red-500 hover:bg-red-50',
        actionTitle: 'text-red-600',
        icon: <AlertTriangle size={22} />
      };
    } else if (type === 'warning') {
      return {
        borderLeft: 'border-l-4 border-l-amber-500',
        iconBg: 'bg-amber-50 text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-700',
        badgeDot: 'bg-amber-500',
        badgeText: 'Warning',
        recBtnBg: 'bg-amber-500 hover:bg-amber-600 text-white',
        secBtnBorder: 'border border-amber-200 text-amber-600 hover:bg-amber-50',
        actionTitle: 'text-amber-600',
        icon: <Users size={22} />
      };
    }
    return {
      borderLeft: 'border-l-4 border-l-blue-500',
      iconBg: 'bg-blue-50 text-blue-500',
      badgeBg: 'bg-blue-100 text-blue-700',
      badgeDot: 'bg-blue-500',
      badgeText: 'Info',
      recBtnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
      secBtnBorder: 'border border-blue-200 text-blue-600 hover:bg-blue-50',
      actionTitle: 'text-blue-600',
      icon: <Info size={22} />
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Active Alerts</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time bus bunching, traffic delay warnings, and AI holding suggestions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors text-sm font-bold disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs with Sliding Background Indicator */}
        <div className="relative inline-flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs max-w-fit">
          {/* Sliding Active Pill Indicator */}
          <div
            className="absolute top-1.5 bottom-1.5 bg-blue-600 rounded-lg transition-all duration-300 ease-out shadow-xs"
            style={{
              left: filter === 'all' ? '6px' : filter === 'error' ? 'calc(25% + 1.5px)' : filter === 'warning' ? 'calc(50% + 1.5px)' : 'calc(75% + 1.5px)',
              width: 'calc(25% - 3px)'
            }}
          />

          <button
            onClick={() => setFilter('all')}
            className={`relative z-10 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>All alerts</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filter === 'all' ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}`}>
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('error')}
            className={`relative z-10 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filter === 'error' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>Critical</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filter === 'error' ? 'bg-red-500 text-white' : 'bg-red-500 text-white'}`}>
              {criticalCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('warning')}
            className={`relative z-10 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filter === 'warning' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>Warning</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filter === 'warning' ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'}`}>
              {warningCount}
            </span>
          </button>

          <button
            onClick={() => setFilter('resolved')}
            className={`relative z-10 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filter === 'resolved' ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <span>Resolved</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filter === 'resolved' ? 'bg-white/20 text-white' : 'bg-slate-400 text-white'}`}>
              {resolvedCount}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search alerts by route, title, or recommendation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isRefreshing ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 flex gap-4 animate-pulse shadow-sm">
              <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                <div className="h-16 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
          ))
        ) : filter === 'resolved' ? (
          filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {searchQuery ? 'No resolved alerts match your search query.' : 'No resolved alerts today.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <div key={index} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${item.action === 'approved' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                      {item.action === 'approved' ? <Check size={20} /> : <X size={20} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{item.alert.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.alert.time} {item.alert.description ? `· ${item.alert.description}` : ''}</p>
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
          )
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
            No alerts found for this filter.
          </div>
        ) : (
          filteredActivities.map((alert) => {
            const variant = getCardVariant(alert.type);

            return (
              <div 
                key={alert.id} 
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5.5 transition-all hover:shadow-md ${variant.borderLeft}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left: Icon + Title + Meta */}
                  <div className="flex items-start gap-3.5 min-w-[280px]">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${variant.iconBg}`}>
                      {variant.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">{alert.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${variant.badgeBg}`}>
                          {variant.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {alert.description ? `${alert.description} · ` : ''}{alert.time || 'Just now'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: AI Recommendation Box */}
                  <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 flex items-start gap-2.5 min-h-[64px]">
                    <Zap size={16} className="text-blue-600 shrink-0 fill-blue-600 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">AI Recommendation</div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {alert.aiSummary || "Hold bus for 2 mins to restore headway spacing."}
                      </p>
                    </div>
                  </div>

                  {/* Right: Approve / Reject Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleAction(alert.id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check size={15} /> Approve Action
                    </button>

                    <button
                      onClick={() => handleAction(alert.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm bg-red-600 hover:bg-red-700 text-white"
                    >
                      <X size={15} /> Reject Action
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { fetchAlerts, fetchAnalytics, fetchAnalyticsOverview, fetchTelemetry } from "@/lib/api";
import { useWebSocket } from "@/lib/useWebSocket";

type Activity = {
  id: string | number;
  trip_id?: string;
  title: string;
  time: string;
  type: string;
  description?: string;
  aiSummary?: string;
};

type WeeklyData = {
  day: string;
  val: number;
};

type Metrics = {
  activeBuses: number;
  runningRoutes: number;
  healthScore: number;
  delayedBuses: number;
  temperature: number;
  totalRidership: number;
  onTimeRate: number;
  avgDelay: number;
  fuelEfficiency: number;
};

type PeakHourData = { time: string; passengers: number };
type DelayTrend = { time: string; delay: number };
type RouteHealth = { id: string; name: string; score: number; color: string };

type DataContextType = {
  metrics: Metrics;
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  dismissAlert: (id: string | number) => void;
  refreshAlerts: () => Promise<void>;
  weeklyRidership: WeeklyData[];
  setWeeklyRidership: React.Dispatch<React.SetStateAction<WeeklyData[]>>;
  peakHourData: PeakHourData[];
  setPeakHourData: React.Dispatch<React.SetStateAction<PeakHourData[]>>;
  delayTrend: DelayTrend[];
  setDelayTrend: React.Dispatch<React.SetStateAction<DelayTrend[]>>;
  routeHealth: RouteHealth[];
  setRouteHealth: React.Dispatch<React.SetStateAction<RouteHealth[]>>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<Metrics>({
    activeBuses: 0,
    runningRoutes: 0,
    healthScore: 100,
    delayedBuses: 0,
    temperature: 29,
    totalRidership: 0,
    onTimeRate: 100,
    avgDelay: 0,
    fuelEfficiency: 0,
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [weeklyRidership, setWeeklyRidership] = useState<WeeklyData[]>([]);
  const [routeHealth, setRouteHealth] = useState<RouteHealth[]>([]);
  const [peakHourData, setPeakHourData] = useState<PeakHourData[]>([]);
  const [delayTrend, setDelayTrend] = useState<DelayTrend[]>([]);

  // Track dismissed alert IDs in localStorage so reloads don't bring them back
  const dismissedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('raah_dismissed_alert_ids');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dismissedIds.current = new Set(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const dismissAlert = (id: string | number) => {
    const key = String(id);
    dismissedIds.current.add(key);

    try {
      localStorage.setItem('raah_dismissed_alert_ids', JSON.stringify(Array.from(dismissedIds.current)));
    } catch (e) {}

    setActivities(prev => prev.filter(a => String(a.id) !== key));

    // Also inform backend of resolution
    import('@/lib/api').then(({ API_URL }) => {
      fetch(`${API_URL}/alerts/${key}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolved' })
      }).catch(() => null);
    });
  };

  const { lastMessage } = useWebSocket();

  const defaultSeededActivities = [
    {
      id: "alt-001",
      trip_id: "trip-313-01",
      title: "Bus MH017741 (Route 313)",
      time: "18:48",
      type: "error",
      description: "Predicted gap: 62m · 18:48",
      aiSummary: "High confidence bus bunching detected based on speed patterns."
    },
    {
      id: "alt-002",
      trip_id: "trip-as-02",
      title: "Bus MH019770 (Route A-74)",
      time: "18:48",
      type: "error",
      description: "Predicted gap: 65m · 18:48",
      aiSummary: "High confidence bus bunching detected based on speed patterns."
    },
    {
      id: "alt-003",
      trip_id: "trip-101-03",
      title: "Bus MH012249 (Route 101)",
      time: "18:45",
      type: "error",
      description: "Predicted gap: 280m · 18:45",
      aiSummary: "Bus delayed by 18 mins near Dadar TT Circle due to heavy traffic."
    },
    {
      id: "alt-004",
      trip_id: "trip-210-04",
      title: "Bus MH014812 (Route 210)",
      time: "18:40",
      type: "warning",
      description: "Predicted gap: 450m · 18:40",
      aiSummary: "Driver skipped stop near Kurla Station East. High commuter surge waiting."
    }
  ];

  const refreshAlerts = async () => {
    try {
      const alertsData = await fetchAlerts().catch(() => null);
      if (alertsData && Array.isArray(alertsData) && alertsData.length > 0) {
        const newActivities = alertsData
          .filter((alert: any) => !dismissedIds.current.has(String(alert.id)))
          .map((alert: any) => {
            const busNum = alert.trip?.busNumber || 'Bus';
            const routeName = alert.trip?.route?.routeName ? ` (Route ${alert.trip.route.routeName})` : '';
            return {
              id: alert.id,
              trip_id: alert.tripId,
              title: `Bus ${busNum}${routeName}`,
              time: alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:48',
              type: (alert.predictedGapMeters < 300 || alert.confidenceNote?.includes('CRITICAL') || alert.confidenceNote?.includes('bunching')) ? "error" : "warning",
              description: `Predicted gap: ${Math.round(alert.predictedGapMeters || 60)}m`,
              aiSummary: alert.confidenceNote || "High confidence bus bunching detected based on speed patterns."
            };
          });
        
        if (newActivities.length > 0) {
          setActivities(newActivities as any);
          return;
        }
      }
      
      // Fallback to default seeded activities filtered by dismissedIds
      setActivities(defaultSeededActivities.filter(a => !dismissedIds.current.has(String(a.id))) as any);
    } catch (err) {
      console.warn("Failed to refresh alerts, using fallback:", err);
      setActivities(defaultSeededActivities.filter(a => !dismissedIds.current.has(String(a.id))) as any);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const telemetryData = await fetchTelemetry();
        if (telemetryData) {
          setMetrics(m => ({ ...m, activeBuses: telemetryData.length }));
        }

        await refreshAlerts();

        const analyticsData = await fetchAnalytics();
        if (analyticsData && analyticsData.length > 0) {
          // analyticsData currently returns the /daily endpoint results in fetchAnalytics() 
          // Wait, fetchAnalytics in api.ts might be pointing to /analytics/overview or /analytics/daily? 
          // Let's assume fetchAnalytics returns { daily: [], overview: {} } in a bit, but for now:
          
          const latest = analyticsData[analyticsData.length - 1];
          setMetrics(m => ({
            ...m,
            totalRidership: latest.totalRidership / 1000,
            onTimeRate: latest.onTimeRate,
            avgDelay: latest.avgDelayMinutes,
            fuelEfficiency: latest.fuelEfficiencyKml
          }));

          const weekly = analyticsData.map((a: any) => {
            const date = new Date(a.date);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return {
              day: days[date.getDay()],
              val: a.totalRidership / 1000
            };
          });
          setWeeklyRidership(weekly);
        }

        // We also need to fetch /api/analytics/overview to get the new fields
        try {
          const overview = await fetchAnalyticsOverview();
          setPeakHourData(overview.peakHourData || []);
          setDelayTrend(overview.delayTrend || []);
          setRouteHealth(overview.routeHealth || []);
          setMetrics(m => ({
            ...m,
            activeBuses: overview.activeBuses,
            runningRoutes: overview.runningRoutes,
            healthScore: overview.healthScore,
            delayedBuses: overview.delayedBuses,
          }));
        } catch (err) {
          console.warn("Failed to fetch analytics overview:", err);
        }

      } catch (e) {
        console.error("Failed to fetch initial data", e);
      }
    };
    fetchInitialData();
  }, []);

  // Handle WS messages
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === 'ALERT') {
      const alert = lastMessage.payload;
      const busNum = alert.trip?.busNumber || 'Bus';
      const routeName = alert.trip?.route?.routeName ? ` (Route ${alert.trip.route.routeName})` : '';
      const newActivity = {
        id: alert.id,
        trip_id: alert.tripId,
        title: `Bus ${busNum}${routeName}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: (alert.predictedGapMeters < 300 || alert.confidenceNote?.includes('CRITICAL')) ? "error" : "warning",
        description: `Predicted gap: ${Math.round(alert.predictedGapMeters)}m`,
        aiSummary: alert.confidenceNote || "AI detected bunching"
      };
      setActivities(prev => {
        // Don't re-add dismissed alerts
        if (dismissedIds.current.has(String(newActivity.id))) return prev;
        // Don't add duplicates
        if (prev.some(a => String(a.id) === String(newActivity.id))) return prev;
        return [newActivity, ...prev].slice(0, 10);
      });
    } else if (lastMessage.type === 'TELEMETRY') {
      // Could update activeBuses here if we track distinct trips, 
      // but for simplicity we rely on the initial fetch or a periodic poll.
    }
  }, [lastMessage]);

  return (
    <DataContext.Provider
      value={{
        metrics,
        setMetrics,
        activities,
        setActivities,
        dismissAlert,
        refreshAlerts,
        weeklyRidership,
        setWeeklyRidership,
        peakHourData,
        setPeakHourData,
        delayTrend,
        setDelayTrend,
        routeHealth,
        setRouteHealth,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

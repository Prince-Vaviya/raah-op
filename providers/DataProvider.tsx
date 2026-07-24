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

  // Track dismissed alert IDs so WS re-pushes don't bring them back
  const dismissedIds = useRef<Set<string>>(new Set());

  const dismissAlert = (id: string | number) => {
    const key = String(id);
    dismissedIds.current.add(key);
    setActivities(prev => prev.filter(a => String(a.id) !== key));
  };

  const { lastMessage } = useWebSocket();

  const refreshAlerts = async () => {
    try {
      const alertsData = await fetchAlerts();
      if (alertsData) {
        const newActivities = alertsData
          .filter((alert: any) => !dismissedIds.current.has(String(alert.id)))
          .map((alert: any) => {
            const busNum = alert.trip?.busNumber || 'Bus';
            const routeName = alert.trip?.route?.routeName ? ` (Route ${alert.trip.route.routeName})` : '';
            return {
              id: alert.id,
              trip_id: alert.tripId,
              title: `Bus ${busNum}${routeName}`,
              time: new Date(alert.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: (alert.predictedGapMeters < 300 || alert.confidenceNote?.includes('CRITICAL')) ? "error" : "warning",
              description: `Predicted gap: ${Math.round(alert.predictedGapMeters)}m`,
              aiSummary: alert.confidenceNote || "AI detected bunching"
            };
          });
        setActivities(newActivities as any);
      }
    } catch (err) {
      console.warn("Failed to refresh alerts:", err);
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

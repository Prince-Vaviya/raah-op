"use client";
import React, { createContext, useContext, useState } from "react";

type Activity = {
  id: number;
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
    activeBuses: 247,
    runningRoutes: 14,
    healthScore: 78,
    delayedBuses: 23,
    temperature: 29,
    totalRidership: 311.1,
    onTimeRate: 82.4,
    avgDelay: 3.8,
    fuelEfficiency: 4.2,
  });

  const [activities, setActivities] = useState<Activity[]>([
    { 
      id: 1, 
      title: "Bus Bunching Detected on Route 102", 
      time: "Rt 102 · 2 min ago", 
      type: "error",
      description: "Traffic congestion at Silk Board Junction",
      aiSummary: "Two buses are within 90 seconds of each other near Koramangala. Holding Bus 102B for 3 minutes will restore 8-minute headway with 91% confidence."
    },
    { 
      id: 2, 
      title: "Bus B-404 Breakdown – HSR Layout", 
      time: "Rt 404 · 8 min ago", 
      type: "error",
      description: "Mechanical failure - engine overheating",
      aiSummary: "Bus B-404 has stopped at HSR Layout. Recovery team dispatched. Estimated service gap: 25 min. Recommend deploying standby bus from Sector 12 depot."
    },
    { 
      id: 3, 
      title: "High Occupancy Warning – Route 102", 
      time: "Rt 102 · 15 min ago", 
      type: "warning",
      description: "Passenger load exceeding 90% capacity",
      aiSummary: "Morning rush crowd is unusually high due to a local event. Consider deploying an extra shuttle on this route for the next 2 hours."
    },
    { 
      id: 4, 
      title: "Route 201 Minor Delay – Road Work", 
      time: "Rt 201 · 22 min ago", 
      type: "warning",
      description: "Slow traffic near Indiranagar Metro",
      aiSummary: "Temporary lane closure causing 5-minute delays. Traffic should clear by 11:00 AM based on current flow patterns."
    },
  ]);

  const [weeklyRidership, setWeeklyRidership] = useState<WeeklyData[]>([
    { day: "Mon", val: 40 },
    { day: "Tue", val: 55 },
    { day: "Wed", val: 45 },
    { day: "Thu", val: 70 },
    { day: "Fri", val: 85 },
    { day: "Sat", val: 95 },
    { day: "Sun", val: 65 },
  ]);

  const [peakHourData, setPeakHourData] = useState<PeakHourData[]>([
    { time: "6am", passengers: 3000 },
    { time: "7am", passengers: 8500 },
    { time: "8am", passengers: 16000 },
    { time: "9am", passengers: 11000 },
    { time: "10am", passengers: 7000 },
    { time: "11am", passengers: 5500 },
    { time: "12pm", passengers: 6500 },
    { time: "1pm", passengers: 6800 },
    { time: "2pm", passengers: 5500 },
    { time: "3pm", passengers: 7000 },
    { time: "4pm", passengers: 9500 },
    { time: "5pm", passengers: 15500 },
    { time: "6pm", passengers: 12500 },
    { time: "7pm", passengers: 8000 },
    { time: "8pm", passengers: 5000 },
  ]);

  const [delayTrend, setDelayTrend] = useState<DelayTrend[]>([
    { time: "06:00", delay: 1 },
    { time: "07:30", delay: 2.5 },
    { time: "09:00", delay: 8 },
    { time: "10:30", delay: 3 },
    { time: "12:00", delay: 2 },
    { time: "13:30", delay: 2.5 },
    { time: "15:00", delay: 2 },
    { time: "16:30", delay: 6 },
    { time: "18:00", delay: 10 },
  ]);

  const [routeHealth, setRouteHealth] = useState<RouteHealth[]>([
    { id: "101", name: "Central - Airport Express", score: 94, color: "bg-emerald-500" },
    { id: "102", name: "MG Road - Electronic City", score: 61, color: "bg-amber-500" },
    { id: "201", name: "Whitefield - Hebbal Ring", score: 89, color: "bg-emerald-500" },
    { id: "302", name: "Indiranagar Loop", score: 97, color: "bg-emerald-500" },
    { id: "404", name: "HSR - BTM Express", score: 34, color: "bg-red-500" },
  ]);

  return (
    <DataContext.Provider
      value={{
        metrics,
        setMetrics,
        activities,
        setActivities,
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

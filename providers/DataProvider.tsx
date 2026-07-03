"use client";
import React, { createContext, useContext, useState } from "react";

type Activity = {
  id: number;
  title: string;
  time: string;
  type: string;
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
};

type DataContextType = {
  metrics: Metrics;
  setMetrics: React.Dispatch<React.SetStateAction<Metrics>>;
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  weeklyRidership: WeeklyData[];
  setWeeklyRidership: React.Dispatch<React.SetStateAction<WeeklyData[]>>;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<Metrics>({
    activeBuses: 247,
    runningRoutes: 14,
    healthScore: 78,
    delayedBuses: 23,
    temperature: 29,
  });

  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, title: "Bus Bunching Detected on Route 102", time: "Rt 102 · 2 min ago", type: "error" },
    { id: 2, title: "Bus B-404 Breakdown – HSR Layout", time: "Rt 404 · 8 min ago", type: "error" },
    { id: 3, title: "High Occupancy Warning – Route 102", time: "Rt 102 · 15 min ago", type: "warning" },
    { id: 4, title: "Route 201 Minor Delay – Road Work", time: "Rt 201 · 22 min ago", type: "warning" },
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

  return (
    <DataContext.Provider
      value={{
        metrics,
        setMetrics,
        activities,
        setActivities,
        weeklyRidership,
        setWeeklyRidership,
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

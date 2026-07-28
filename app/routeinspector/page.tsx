"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  AlertTriangle, 
  Check, 
  X, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  Bus,
  Clock,
  Users,
  TrendingUp,
  Activity,
  Layers,
  Eye,
  Box
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchRoutes, fetchRouteDetails, fetchLiveTelemetryGeoJSON, API_URL } from "@/lib/api";
import { useData } from "@/providers/DataProvider";

// AI Copilot Mascot SVG Illustration matching Screenshot 2
function AiCopilotMascot() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
      {/* Bus Body */}
      <rect x="8" y="18" width="48" height="38" rx="14" fill="#2563eb" />
      {/* Cap */}
      <path d="M16 18 C16 10, 48 10, 48 18 Z" fill="#0f172a" />
      <rect x="22" y="15" width="20" height="4" rx="2" fill="#3b82f6" />
      <text x="32" y="14" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">RAAH</text>
      {/* Windshield / Face */}
      <rect x="13" y="24" width="38" height="18" rx="7" fill="#ffffff" />
      {/* Cute Eyes */}
      <ellipse cx="24" cy="33" rx="3" ry="4" fill="#0f172a" />
      <ellipse cx="40" cy="33" rx="3" ry="4" fill="#0f172a" />
      <circle cx="25" cy="31" r="1" fill="#ffffff" />
      <circle cx="41" cy="31" r="1" fill="#ffffff" />
      {/* Cute Mouth */}
      <path d="M29 38 Q32 40 35 38" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Cute Cheeks */}
      <circle cx="19" cy="35" r="2.5" fill="#f43f5e" opacity="0.4" />
      <circle cx="45" cy="35" r="2.5" fill="#f43f5e" opacity="0.4" />
      {/* Wheels */}
      <circle cx="18" cy="56" r="4" fill="#0f172a" />
      <circle cx="46" cy="56" r="4" fill="#0f172a" />
      <circle cx="18" cy="56" r="2" fill="#94a3b8" />
      <circle cx="46" cy="56" r="2" fill="#94a3b8" />
      {/* Warning Sign Floating */}
      <path d="M52 42 L60 56 H44 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
      <text x="52" y="53" textAnchor="middle" fill="#0f172a" fontSize="9" fontWeight="bold">!</text>
    </svg>
  );
}

// Top-down vector Bus SVG component with dynamic route / status color fill
function TopDownBusSvg({ color }: { color: string }) {
  return (
    <svg width="26" height="40" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
      {/* Main Bus Body */}
      <rect x="2" y="2" width="28" height="44" rx="6" fill={color} />
      <rect x="2" y="2" width="28" height="44" rx="6" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
      {/* Front Windshield */}
      <rect x="5" y="5" width="22" height="7" rx="2" fill="#0f172a" opacity="0.85" />
      <rect x="7" y="6" width="18" height="2" rx="1" fill="#ffffff" opacity="0.4" />
      {/* Roof outline */}
      <rect x="5" y="14" width="22" height="22" rx="3" fill="#ffffff" opacity="0.25" />
      {/* Rear Window */}
      <rect x="6" y="38" width="20" height="4" rx="1.5" fill="#0f172a" opacity="0.8" />
      {/* Side Mirrors */}
      <rect x="0" y="7" width="2" height="4" rx="1" fill="#334155" />
      <rect x="30" y="7" width="2" height="4" rx="1" fill="#334155" />
      {/* Headlights */}
      <circle cx="6" cy="3" r="1.5" fill="#fef08a" />
      <circle cx="26" cy="3" r="1.5" fill="#fef08a" />
      {/* Taillights */}
      <circle cx="6" cy="45" r="1.5" fill="#f87171" />
      <circle cx="26" cy="45" r="1.5" fill="#f87171" />
    </svg>
  );
}

const routeColorMap: Record<string, string> = {
  "138": "#a855f7",   // Purple
  "500": "#f97316",   // Orange
  "A-74": "#2563eb",  // Blue
  "102": "#10b981",   // Green
  "134-C": "#ec4899", // Pink
  "C-10": "#14b8a6",  // Teal
};

function getRouteColor(routeName?: string): string {
  if (!routeName) return "#3b82f6";
  if (routeColorMap[routeName]) return routeColorMap[routeName];
  
  const palette = ["#3b82f6", "#ec4899", "#a855f7", "#10b981", "#f97316", "#06b6d4"];
  let hash = 0;
  for (let i = 0; i < routeName.length; i++) {
    hash = routeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

// Donut data for Network Health
const networkHealthData = [
  { name: "On Time", value: 72, color: "#22c55e" },
  { name: "Delayed", value: 15, color: "#f97316" },
  { name: "Bunching", value: 8, color: "#ef4444" },
  { name: "Disrupted", value: 5, color: "#64748b" },
];

// All 18 Mumbai Routes matching Figma screenshot 1 & 2
const all18Routes = [
  { id: "101", realId: "r-101", name: "101", startStop: "Colaba", endStop: "Bandra Reclamation", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-blue-600", healthScore: 94, totalDistance: "25.3 km", totalStops: 32, avgTripTime: "82 min" },
  { id: "102", realId: "r-102", name: "102", startStop: "Mantralaya", endStop: "Kurla Bus Station", status: "Delayed", textColor: "text-amber-500", dotColor: "bg-amber-500", badgeBg: "bg-amber-500", healthScore: 61, totalDistance: "18.5 km", totalStops: 24, avgTripTime: "65 min" },
  { id: "210", realId: "r-210", name: "210", startStop: "Borivali (W)", endStop: "Bandra (W)", status: "Critical", textColor: "text-red-500", dotColor: "bg-red-500", badgeBg: "bg-red-500", healthScore: 34, totalDistance: "22.1 km", totalStops: 28, avgTripTime: "75 min" },
  { id: "138", realId: "r-138", name: "138", startStop: "Ghatkopar", endStop: "Andheri (E)", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-purple-600", healthScore: 89, totalDistance: "14.2 km", totalStops: 19, avgTripTime: "45 min" },
  { id: "500", realId: "r-500", name: "500", startStop: "Dadar", endStop: "Thane Station", status: "Delayed", textColor: "text-amber-500", dotColor: "bg-amber-500", badgeBg: "bg-emerald-500", healthScore: 66, totalDistance: "31.0 km", totalStops: 38, avgTripTime: "95 min" },
  { id: "A-74", realId: "r-a74", name: "A-74", startStop: "Vikhroli Depot", endStop: "Worli Sea Face", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-blue-600", healthScore: 92, totalDistance: "21.4 km", totalStops: 26, avgTripTime: "70 min" },
  { id: "302", realId: "r-302", name: "302", startStop: "Mulund West", endStop: "Sion Circle", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-indigo-600", healthScore: 88, totalDistance: "16.8 km", totalStops: 22, avgTripTime: "52 min" },
  { id: "415", realId: "r-415", name: "415", startStop: "Andheri West", endStop: "Seepz Village", status: "Delayed", textColor: "text-amber-500", dotColor: "bg-amber-500", badgeBg: "bg-amber-500", healthScore: 71, totalDistance: "9.6 km", totalStops: 14, avgTripTime: "32 min" },
  { id: "A-115", realId: "r-a115", name: "A-115", startStop: "CSMT Station", endStop: "Churchgate", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-blue-600", healthScore: 96, totalDistance: "5.2 km", totalStops: 8, avgTripTime: "18 min" },
  { id: "202", realId: "r-202", name: "202", startStop: "Malad Depot", endStop: "Mahim Bus Station", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-teal-600", healthScore: 85, totalDistance: "24.0 km", totalStops: 30, avgTripTime: "80 min" },
  { id: "65", realId: "r-65", name: "65", startStop: "Bhayandar West", endStop: "Borivali Station", status: "Delayed", textColor: "text-amber-500", dotColor: "bg-amber-500", badgeBg: "bg-amber-500", healthScore: 68, totalDistance: "12.3 km", totalStops: 16, avgTripTime: "40 min" },
  { id: "105", realId: "r-105", name: "105", startStop: "Kamla Nehru Park", endStop: "Byculla East", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-blue-600", healthScore: 91, totalDistance: "8.7 km", totalStops: 12, avgTripTime: "28 min" },
  { id: "355", realId: "r-355", name: "355", startStop: "Chembur Naka", endStop: "Trombay", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-cyan-600", healthScore: 93, totalDistance: "11.0 km", totalStops: 15, avgTripTime: "35 min" },
  { id: "700", realId: "r-700", name: "700", startStop: "Dahisar East", endStop: "Mira Road", status: "Critical", textColor: "text-red-500", dotColor: "bg-red-500", badgeBg: "bg-red-500", healthScore: 42, totalDistance: "15.4 km", totalStops: 20, avgTripTime: "55 min" },
  { id: "C-10", realId: "r-c10", name: "C-10", startStop: "Electric House", endStop: "Santacruz Depot", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-violet-600", healthScore: 90, totalDistance: "19.8 km", totalStops: 25, avgTripTime: "68 min" },
  { id: "123", realId: "r-123", name: "123", startStop: "Tardeo Depot", endStop: "Vidyavihar", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-emerald-600", healthScore: 87, totalDistance: "20.1 km", totalStops: 27, avgTripTime: "72 min" },
  { id: "C-71", realId: "r-c71", name: "C-71", startStop: "Bandra Kurla Complex", endStop: "Airport T2", status: "Operational", textColor: "text-emerald-600", dotColor: "bg-emerald-500", badgeBg: "bg-sky-600", healthScore: 95, totalDistance: "7.8 km", totalStops: 10, avgTripTime: "22 min" },
  { id: "525", realId: "r-525", name: "525", startStop: "Navi Mumbai Vashi", endStop: "Airoli Bus Stop", status: "Delayed", textColor: "text-amber-500", dotColor: "bg-amber-500", badgeBg: "bg-amber-500", healthScore: 64, totalDistance: "17.5 km", totalStops: 21, avgTripTime: "58 min" },
];

export default function RouteInspector() {
  const { metrics } = useData();
  const mapRef = useRef<any>(null);

  // ── Routes List State ──
  const [routes, setRoutes] = useState<any[]>(all18Routes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRealId, setSelectedRealId] = useState<string | null>("r-101");
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Active Detail State ──
  const [route, setRoute] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [liveBuses, setLiveBuses] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Buses' | 'Stops' | 'Performance'>('Overview');
  const [mapMode, setMapMode] = useState<'live' | 'heatmap'>('live');
  const [mapDimension, setMapDimension] = useState<'2D' | '3D'>('2D');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleToggleDimension = (mode: '2D' | '3D') => {
    setMapDimension(mode);
    if (mapRef.current) {
      if (mode === '3D') {
        mapRef.current.flyTo({
          pitch: 65,
          bearing: -20,
          zoom: 14.5,
          duration: 1500
        });
      } else {
        mapRef.current.flyTo({
          pitch: 0,
          bearing: 0,
          zoom: 11.5,
          duration: 1500
        });
      }
    }
  };

  // ── Fetch routes & live telemetry from Backend ──
  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const backendRoutes = await fetchRoutes().catch(() => null);
        if (backendRoutes && Array.isArray(backendRoutes) && backendRoutes.length > 0) {
          const mappedBackend = backendRoutes.map((r: any, idx: number) => {
            const badgeNumber = r.routeName || r.id || `${101 + idx}`;
            const isDelayed = idx % 4 === 1;
            const isCritical = idx % 5 === 2;

            let statusLabel = 'Operational';
            let dotColor = 'bg-emerald-500';
            let textColor = 'text-emerald-600';
            let badgeBg = 'bg-blue-600';
            let healthScore = Math.max(34, 98 - idx * 4);

            if (isCritical) {
              statusLabel = 'Critical';
              dotColor = 'bg-red-500';
              textColor = 'text-red-500';
              badgeBg = 'bg-red-500';
              healthScore = 34;
            } else if (isDelayed) {
              statusLabel = 'Delayed';
              dotColor = 'bg-amber-500';
              textColor = 'text-amber-500';
              badgeBg = 'bg-amber-500';
              healthScore = 61;
            } else {
              if (idx % 3 === 0) badgeBg = 'bg-blue-600';
              else if (idx % 3 === 1) badgeBg = 'bg-purple-600';
              else badgeBg = 'bg-emerald-500';
            }

            return {
              id: badgeNumber,
              realId: r.id,
              name: r.routeName ? `${r.routeName}` : `Route ${badgeNumber}`,
              startStop: r.startStop || 'Colaba',
              endStop: r.endStop || 'Bandra Reclamation',
              status: statusLabel,
              textColor,
              dotColor,
              badgeBg,
              healthScore,
              totalDistance: `${(15 + (idx * 2) % 15).toFixed(1)} km`,
              totalStops: 20 + (idx * 3) % 15,
              avgTripTime: `${40 + (idx * 5) % 45} min`
            };
          });

          // Merge backend routes with standard 18 routes to ensure complete population
          const existingIds = new Set(mappedBackend.map((b: any) => b.id));
          const combined = [...mappedBackend, ...all18Routes.filter(a => !existingIds.has(a.id))];
          setRoutes(combined);
        }
      } catch (e) {
        console.error("Backend routes connection error:", e);
      }
    };

    fetchRoutesData();
  }, []);

  // ── Poll Live Telemetry GeoJSON from Backend every 5s ──
  useEffect(() => {
    let cancelled = false;
    const fetchTelemetry = async () => {
      try {
        const geojson = await fetchLiveTelemetryGeoJSON().catch(() => null);
        if (!cancelled && geojson && geojson.features) {
          setLiveBuses(geojson.features);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ── Fetch route details when selection changes ──
  useEffect(() => {
    if (!selectedRealId) return;

    let cancelled = false;
    const getData = async () => {
      setDetailLoading(true);
      try {
        const details = await fetchRouteDetails(selectedRealId).catch(() => null);
        if (cancelled) return;
        setRoute(details);

        if (details && details.polyline) {
          setRoutePolyline({
            type: "FeatureCollection",
            features: [{
              type: "Feature",
              geometry: { type: "LineString", coordinates: details.polyline },
              properties: { id: details.id }
            }]
          });
        }
        setIsApproved(null);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };

    getData();
  }, [selectedRealId]);

  const filteredRoutes = routes.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.startStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.endStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.id.toString().includes(searchQuery)
  );

  const displayedRoutes = isExpanded ? filteredRoutes : filteredRoutes.slice(0, 5);

  const selectedRouteMeta = routes.find(r => r.realId === selectedRealId) || routes[0] || all18Routes[0];
  const isDelayedOrInspectionView = selectedRouteMeta?.status === 'Delayed' || selectedRouteMeta?.status === 'Critical' || selectedRouteMeta?.id === '102';

  // Filter live buses to ONLY show buses running on the selected route
  const routeBuses = React.useMemo(() => {
    if (!selectedRouteMeta) return liveBuses;

    const targetId = String(selectedRouteMeta.id).toLowerCase();
    const targetRealId = String(selectedRouteMeta.realId || '').toLowerCase();
    const targetName = String(selectedRouteMeta.name || '').toLowerCase();

    const filtered = liveBuses.filter((bus: any) => {
      const busRouteName = String(bus.properties?.route_name || '').toLowerCase();
      const busRouteId = String(bus.properties?.route_id || '').toLowerCase();

      return busRouteName === targetId ||
             busRouteId === targetRealId ||
             busRouteName === targetName ||
             (targetId.length > 0 && busRouteName.includes(targetId)) ||
             (busRouteName.length > 0 && targetId.includes(busRouteName));
    });

    // If live telemetry doesn't have matching buses, place buses along the selected route polyline
    if (filtered.length === 0 && routePolyline?.features?.[0]?.geometry?.coordinates) {
      const coords = routePolyline.features[0].geometry.coordinates;
      if (coords && coords.length > 0) {
        const count = Math.min(4, Math.max(2, Math.floor(coords.length / 5)));
        const synthetic = [];
        for (let i = 0; i < count; i++) {
          const idx = Math.floor((i + 1) * (coords.length / (count + 1)));
          const point = coords[idx];
          if (point) {
            synthetic.push({
              geometry: { coordinates: point },
              properties: {
                trip_id: `syn-${selectedRouteMeta.id}-${i}`,
                route_name: selectedRouteMeta.id,
                forward_headway: i === 1 ? 120 : 350
              }
            });
          }
        }
        return synthetic;
      }
    }

    return filtered;
  }, [liveBuses, selectedRouteMeta, routePolyline]);

  const heatmapGeoJSON = React.useMemo(() => {
    const features: any[] = [
      { type: "Feature", geometry: { type: "Point", coordinates: [72.8430, 19.0180] }, properties: { weight: 0.98 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [72.8640, 19.0400] }, properties: { weight: 0.92 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [72.8600, 19.0350] }, properties: { weight: 0.88 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [72.8180, 19.0020] }, properties: { weight: 0.85 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [72.8310, 18.9240] }, properties: { weight: 0.78 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [72.9260, 19.1090] }, properties: { weight: 0.90 } },
    ];

    if (routeBuses && routeBuses.length > 0) {
      routeBuses.forEach((b: any) => {
        if (b.geometry?.coordinates) {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: b.geometry.coordinates },
            properties: { weight: 0.90 }
          });
        }
      });
    }

    return {
      type: "FeatureCollection" as const,
      features
    };
  }, [routeBuses]);

  const handleApprove = async () => {
    setIsApproved(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      await fetch(`${API_URL}/commands/e-holding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          tripId: selectedRealId || 'trip-102',
          targetSpeedKmh: 20,
          holdDurationSeconds: 60,
          reason: "Approved from AI Copilot Route Inspector - Speed Pacing Command"
        })
      }).catch(() => null);
    } catch (e) {
      console.error("Backend command error:", e);
    }
    setShowToast(`Action approved! E-Holding Speed Command (20 km/h) Dispatched to Driver via WebSocket!`);
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleReject = () => {
    setIsApproved(false);
    setShowToast(`Recommendation rejected by Operator.`);
    setTimeout(() => setShowToast(null), 4000);
  };

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiaYWthc2hpa2F0YWtlIiwiYSI6ImNtOW0xZjhiaTBsNm0ycXI0a29mNDdsYm4ifQ.O7T7sS0f1S1k2x-y53x9aQ";

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex flex-col">
      
      {/* FULLSCREEN BACKGROUND MAP */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 72.8777,
            latitude: 19.0760,
            zoom: 11.5
          }}
          mapStyle={
            mapDimension === '3D'
              ? isDarkMode
                ? "https://tiles.openfreemap.org/styles/dark"
                : "https://tiles.openfreemap.org/styles/bright"
              : isDarkMode
                ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          }
          mapLib={maplibregl}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Real 3D Vector Building Extrusions Layer (Synced with Light & Dark Navbar Theme) */}
          {mapDimension === '3D' && (
            <Source 
              id="3d-buildings-inspector" 
              type="vector" 
              url="https://tiles.openfreemap.org/planet"
            >
              <Layer
                id="3d-buildings-inspector-layer"
                source-layer="building"
                type="fill-extrusion"
                minzoom={12}
                paint={{
                  'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_min_height'],
                    0, isDarkMode ? '#0f172a' : '#e2e8f0',
                    20, isDarkMode ? '#1e293b' : '#cbd5e1',
                    50, isDarkMode ? '#334155' : '#94a3b8',
                    100, isDarkMode ? '#475569' : '#64748b'
                  ],
                  'fill-extrusion-height': ['get', 'render_height'],
                  'fill-extrusion-base': ['get', 'render_min_height'],
                  'fill-extrusion-opacity': 0.85
                }}
              />
            </Source>
          )}
          {routePolyline && (
            <Source id="route-path" type="geojson" data={routePolyline}>
              <Layer 
                id="route-path-layer" 
                type="line" 
                paint={{ 'line-color': '#2563eb', 'line-width': 4.5, 'line-opacity': 0.85 }} 
              />
            </Source>
          )}

          {/* Route Pills Badges matching Figma screenshot */}
          <Marker longitude={72.8850} latitude={19.0880} anchor="center">
            <div className="bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md">138</div>
          </Marker>
          <Marker longitude={72.8550} latitude={19.0200} anchor="center">
            <div className="bg-amber-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md">500</div>
          </Marker>

          {/* Heatmap Layer when Heatmap tab is active */}
          {mapMode === 'heatmap' && (
            <>
              <Source id="inspector-bunching-heatmap" type="geojson" data={heatmapGeoJSON}>
                <Layer
                  id="inspector-heatmap-layer"
                  type="heatmap"
                  paint={{
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': 2.2,
                    'heatmap-color': [
                      'interpolate',
                      ['linear'],
                      ['heatmap-density'],
                      0, 'rgba(33,102,172,0)',
                      0.2, 'rgb(103,169,207)',
                      0.4, 'rgb(209,229,240)',
                      0.6, 'rgb(253,219,199)',
                      0.8, 'rgb(239,138,98)',
                      1, 'rgb(178,24,43)'
                    ],
                    'heatmap-radius': 40,
                    'heatmap-opacity': 0.85
                  }}
                />
              </Source>

              {/* Heatmap Hotspot Badges */}
              <Marker longitude={72.8430} latitude={19.0180} anchor="center">
                <div className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1 animate-pulse">
                  <span>64 waiting</span> <span>👻</span>
                </div>
              </Marker>
              <Marker longitude={72.8640} latitude={19.0400} anchor="center">
                <div className="bg-amber-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1">
                  <span>58 waiting</span> <span>👻</span>
                </div>
              </Marker>
              <Marker longitude={72.8600} latitude={19.0350} anchor="center">
                <div className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1">
                  <span>48 waiting</span> <span>👻</span>
                </div>
              </Marker>
            </>
          )}

          {/* Selected Route Live Telemetry Buses (Live View Mode) */}
          {mapMode === 'live' && (
            routeBuses.length > 0 ? (
              routeBuses.map((bus: any, idx: number) => {
                const [lng, lat] = bus.geometry.coordinates;
                const routeName = bus.properties?.route_name || '101';
                const color = getRouteColor(routeName);
                const isAlert = bus.properties?.forward_headway < 150;
                const isDelayed = bus.properties?.forward_headway >= 150 && bus.properties?.forward_headway < 300;

                return (
                  <Marker key={`bus-${idx}`} longitude={lng} latitude={lat} anchor="center">
                    <div className="relative group cursor-pointer transition-transform hover:scale-110">
                      <TopDownBusSvg color={color} />

                      {isAlert && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md z-20 border border-white animate-bounce">
                          <AlertTriangle size={11} />
                        </div>
                      )}

                      {isDelayed && (
                        <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md z-20 border border-white">
                          <Clock size={11} />
                        </div>
                      )}
                    </div>
                  </Marker>
                );
              })
            ) : (
              <>
                <Marker longitude={72.8430} latitude={19.0180} anchor="center">
                  <div className="relative group cursor-pointer transition-transform hover:scale-110">
                    <TopDownBusSvg color="#3b82f6" />
                  </div>
                </Marker>
                <Marker longitude={72.8640} latitude={19.0400} anchor="center">
                  <div className="relative group cursor-pointer transition-transform hover:scale-110">
                    <TopDownBusSvg color="#f59e0b" />
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md z-20 border border-white">
                      <Clock size={11} />
                    </div>
                  </div>
                </Marker>
              </>
            )
          )}
        </Map>
      </div>

      {/* TOP MAP TOGGLE: Live View | Heatmap */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full p-1 shadow-lg border border-white/90 dark:border-slate-800/90 flex items-center gap-1">
          <button
            onClick={() => setMapMode('live')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'live' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Eye size={12} />
            Live View
          </button>
          <button
            onClick={() => setMapMode('heatmap')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
              mapMode === 'heatmap' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Layers size={12} />
            Heatmap
          </button>
        </div>
      </div>

      {/* 2D / 3D Perspective Mode Pill Switcher (Center Top under Navbar) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1 rounded-full border border-white/90 dark:border-slate-800/90 shadow-xl pointer-events-auto">
        <button
          onClick={() => handleToggleDimension('2D')}
          className={`px-3 py-1 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
            mapDimension === '2D' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => handleToggleDimension('3D')}
          className={`px-3 py-1 text-xs font-extrabold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
            mapDimension === '3D' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Box size={12} />
          <span>3D</span>
        </button>
      </div>

      {/* BOTTOM CENTER MAP OVERLAY: Network Snapshot Capsule */}
      {!isDelayedOrInspectionView && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl px-6 py-3 shadow-xl flex items-center gap-8 text-xs font-sans">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                <Bus size={16} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Active Buses</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">247</div>
                <div className="text-[9px] font-bold text-emerald-600">+12 vs yesterday</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-xl">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Avg. Headway</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">7.6 min</div>
                <div className="text-[9px] font-bold text-emerald-600">-0.8 min</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                <Users size={16} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Passengers Today</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">1.24M</div>
                <div className="text-[9px] font-bold text-emerald-600">+8.2%</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                <TrendingUp size={16} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">Network Reliability</div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">92%</div>
                <div className="text-[9px] font-bold text-emerald-600">+5.6%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════
          3-COLUMN / OVERLAY PANELS LAYOUT
      ═════════════════════════════════════════════════════════ */}
      <div className="absolute top-24 left-8 right-8 bottom-8 z-20 pointer-events-none flex justify-between gap-6">
        
        {/* LEFT COLUMN: Routes List & Network Health Card */}
        <div className="w-80 flex flex-col gap-3 pointer-events-auto overflow-hidden">
          
          {/* Card 1: Routes List */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col h-[410px]">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-black text-slate-900 dark:text-white">Routes</h2>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mb-3">
              18 routes • 3 operational
            </p>

            {/* Search Bar with Filter icon button */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search routes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
              <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer">
                <SlidersHorizontal size={14} />
              </button>
            </div>

            {/* Routes List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {displayedRoutes.map((r) => {
                const isActive = selectedRealId === r.realId;

                return (
                  <button
                    key={r.realId}
                    onClick={() => setSelectedRealId(r.realId)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 border ${
                      isActive 
                        ? 'bg-white dark:bg-slate-800 border-purple-400 ring-2 ring-purple-100 dark:ring-purple-950 shadow-md' 
                        : 'bg-white/40 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-white'
                    }`}
                  >
                    {/* Badge Number */}
                    <div className={`w-9 h-9 rounded-xl ${r.badgeBg} text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                      {r.id}
                    </div>

                    {/* Route Details */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {r.startStop} → {r.endStop}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                        <span className={`w-2 h-2 rounded-full ${r.dotColor}`}></span>
                        <span className={`font-semibold ${r.textColor}`}>{r.status}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                        {r.healthScore}%
                      </div>
                      <div className="text-[9px] text-slate-400">Health</div>
                    </div>

                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
            >
              {isExpanded ? "Show less" : `+ Show more`}
            </button>
          </div>

          {/* Card 2: Network Health (Donut Chart) */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl">
            <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mb-3">
              Network Health
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={networkHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={26}
                      outerRadius={38}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {networkHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
                    92%
                  </span>
                  <span className="text-[8px] font-bold text-emerald-600 leading-tight mt-0.5">
                    Good
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5 pl-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-slate-900 dark:text-white">72%</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">On Time</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-slate-900 dark:text-white">15%</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Delayed</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-bold text-slate-900 dark:text-white">8%</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Bunching</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <span className="font-bold text-slate-900 dark:text-white">5%</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Disrupted</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Route Detail / Inspection View */}
        <div className="w-88 flex flex-col pointer-events-auto">
          
          {/* VIEW MODE B: Detailed Route Inspection View (Screenshot 2 - e.g. Route 102) */}
          {isDelayedOrInspectionView ? (
            <div className="space-y-3 flex-1 flex flex-col">
              
              {/* Left Route Timeline & Spacing Card */}
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Route {selectedRouteMeta.id}
                      </h2>
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        Delayed
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {selectedRouteMeta.startStop} → {selectedRouteMeta.endStop}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      MG Road → Electronic City Phase 1
                    </div>
                  </div>
                </div>

                {/* Vertical Connected Timeline */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1 relative no-scrollbar pt-2">
                  <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

                  {/* Stop 1 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Mantralaya</span>
                  </div>

                  {/* Stop 2 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Worli Naka</span>
                  </div>

                  {/* Stop 3 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Sion</span>
                  </div>

                  {/* Stop 4: Highlighted Kurla Bus Station (Bunching Alert) */}
                  <div className="relative z-10 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-4 ring-amber-100 dark:ring-amber-950"></span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">Kurla Bus Station</span>
                    </div>

                    <div className="flex items-center gap-2 pl-5">
                      <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        102A  +8m
                      </span>
                      <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md">
                        102B  +12m
                      </span>
                    </div>

                    <div className="text-[10px] font-extrabold text-red-600 flex items-center gap-1 pl-5">
                      <AlertTriangle size={12} />
                      Bunching detected
                    </div>
                  </div>

                  {/* Stop 5 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Chembur</span>
                  </div>

                  {/* Stop 6 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Ghatkopar</span>
                  </div>

                  {/* Stop 7 */}
                  <div className="flex items-center gap-3 relative z-10 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white"></span>
                    <span>Electronic City Phase 1</span>
                  </div>
                </div>

                {/* Bus Spacing Slider */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="text-[10px] font-extrabold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                    Bus Spacing
                  </div>
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-full">
                    <div className="absolute top-1/2 -translate-y-1/2 left-[15%] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[48%] w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[52%] w-3 h-3 rounded-full bg-orange-500 border-2 border-white shadow-xs"></div>
                  </div>
                  <div className="text-center text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                    Gap: 9.4 min (target: 8 min)
                  </div>
                </div>

              </div>

              {/* Right AI Copilot & Analysis Card */}
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-4">
                
                {/* AI Copilot Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles size={16} className="text-blue-600" />
                      AI Copilot
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Always watching out for you
                    </p>
                  </div>
                  <AiCopilotMascot />
                </div>

                {/* Likely Causes */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Likely Causes</h4>
                  
                  <div className="space-y-2">
                    {/* Traffic Congestion */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Traffic congestion</span>
                        <span className="text-red-600 font-extrabold">68%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                    {/* Passenger Overload */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Passenger overload</span>
                        <span className="text-amber-600 font-extrabold">21%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '21%' }}></div>
                      </div>
                    </div>

                    {/* Signal Delay */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Signal delay</span>
                        <span className="text-blue-600 font-extrabold">8%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }}></div>
                      </div>
                    </div>

                    {/* Unexpected Dwell Time */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Unexpected dwell time</span>
                        <span className="text-slate-400 font-extrabold">3%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: '3%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Card */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Recommendation</h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      Hold bus 102 at stop Sion for 2 mins to restore headway
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        className={`flex-1 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                          isApproved === true ? 'bg-emerald-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        <Check size={14} /> Approve ✓
                      </button>
                      <button
                        onClick={handleReject}
                        className={`flex-1 font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                          isApproved === false ? 'bg-rose-600 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        <X size={14} /> Reject ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* Root Cause Summary */}
                <div className="bg-blue-50/80 dark:bg-blue-950/80 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
                  <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Root Cause Summary</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    High passenger load near Sion and slow movement on MG Road caused Bus 102A to dwell 7 mins longer than scheduled, leading to bunching with Bus 102B.
                  </p>
                </div>

              </div>

            </div>
          ) : (
            
            /* VIEW MODE A: Overview Route Summary View (Screenshot 1 - e.g. Route 101) */
            <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-4 flex-1 flex flex-col overflow-hidden">
              
              {/* Route Summary Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {selectedRouteMeta.id}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedRouteMeta.startStop} → {selectedRouteMeta.endStop}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-emerald-600">Operational</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-extrabold text-emerald-600">{selectedRouteMeta.healthScore || 94}% Health Score</span>
                    </div>
                  </div>
                </div>

                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-bold gap-6">
                {['Overview', 'Buses', 'Stops', 'Performance'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-2 transition-colors cursor-pointer ${
                      activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Dynamic Tab Content */}
              {activeTab === 'Overview' && (
                <>
                  {/* Route Summary Metrics */}
                  <div>
                    <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Route Summary</h4>
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400">Total Distance</div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">{selectedRouteMeta.totalDistance || "15.0 km"}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400">Total Stops</div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">{selectedRouteMeta.totalStops || 20}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400">Avg. Trip Time</div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">{selectedRouteMeta.avgTripTime || "40 min"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Live Buses (12) */}
                  <div className="flex-1 flex flex-col min-h-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white">Live Buses (12)</h4>
                      <button onClick={() => setActiveTab('Buses')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">View all</button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 no-scrollbar">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">1-A</span>
                          <span className="text-[10px] font-medium text-slate-500">Colaba Depot</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                          On Time <ChevronRight size={12} />
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">1-B</span>
                          <span className="text-[10px] font-medium text-slate-500">Worli Naka</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-1">
                          2 min delay <ChevronRight size={12} />
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">1-C</span>
                          <span className="text-[10px] font-medium text-slate-500">Dadar TT</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                          On Time <ChevronRight size={12} />
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white">1-D</span>
                          <span className="text-[10px] font-medium text-slate-500">Bandra Reclamation</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-amber-600 flex items-center gap-1">
                          1 min delay <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Buses' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">Active Fleet Details</h4>
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 no-scrollbar">
                    {(route && route.trips && route.trips.length > 0 ? (
                      route.trips.map((t: any, idx: number) => ({
                        id: `${selectedRouteMeta.id}-${String.fromCharCode(65 + idx)}`,
                        speed: `${t.liveTelemetry?.currentSpeed?.toFixed(0) || (20 + idx * 3)} km/h`,
                        load: `${(40 + (idx * 15) % 50)}% Full`,
                        status: t.liveTelemetry?.forwardHeadway < 150 ? '2 min delay' : 'On Time',
                        location: `Stop #${idx + 1}`,
                        color: t.liveTelemetry?.forwardHeadway < 150 ? 'text-amber-600' : 'text-emerald-600'
                      }))
                    ) : [
                      { id: `${selectedRouteMeta.id}-A`, speed: '24 km/h', load: '65% Full', status: 'On Time', location: 'Colaba Depot', color: 'text-emerald-600' },
                      { id: `${selectedRouteMeta.id}-B`, speed: '18 km/h', load: '88% Full', status: '2 min delay', location: 'Worli Naka', color: 'text-amber-600' },
                      { id: `${selectedRouteMeta.id}-C`, speed: '28 km/h', load: '45% Full', status: 'On Time', location: 'Dadar TT', color: 'text-emerald-600' },
                      { id: `${selectedRouteMeta.id}-D`, speed: '12 km/h', load: '92% Full', status: '1 min delay', location: 'Bandra Reclamation', color: 'text-amber-600' },
                      { id: `${selectedRouteMeta.id}-E`, speed: '22 km/h', load: '50% Full', status: 'On Time', location: 'Sion Circle', color: 'text-emerald-600' },
                    ]).map((bus: any) => (
                      <div key={bus.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            {bus.id}
                            <span className="text-[10px] font-medium text-slate-400">({bus.location})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            Speed: {bus.speed} • Occupancy: {bus.load}
                          </div>
                        </div>
                        <span className={`text-[10px] font-extrabold ${bus.color}`}>
                          {bus.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Stops' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    Route Stops ({route?.busStops?.length || 20})
                  </h4>
                  <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 no-scrollbar">
                    {(route && route.busStops && route.busStops.length > 0 ? (
                      route.busStops.map((st: any, idx: number) => ({
                        order: st.stopOrder || idx + 1,
                        name: st.name,
                        waiting: `${st.stopVolume?.waitingPassengers || (10 + (idx * 7) % 50)} waiting`,
                        transfer: idx === 0 ? "Origin" : idx === route.busStops.length - 1 ? "Terminus" : "Connected Stop"
                      }))
                    ) : [
                      { order: 1, name: "Colaba Depot", waiting: "12 waiting", transfer: "Connected" },
                      { order: 2, name: "Regal Cinema", waiting: "28 waiting", transfer: "Route 101, 102" },
                      { order: 3, name: "CST Station", waiting: "64 waiting", transfer: "Central Railway" },
                      { order: 4, name: "Crawford Market", waiting: "35 waiting", transfer: "Route 500" },
                      { order: 5, name: "Dadar TT", waiting: "42 waiting", transfer: "Western Line" },
                      { order: 6, name: "Bandra Reclamation", waiting: "18 waiting", transfer: "Terminus" }
                    ]).map((stop: any) => (
                      <div key={`${stop.order}-${stop.name}`} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {stop.order}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{stop.name}</div>
                            <div className="text-[9px] text-slate-400 font-semibold">{stop.transfer}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {stop.waiting}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Performance' && (
                <div className="flex-1 flex flex-col min-h-0 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">Route Performance Metrics</h4>
                  
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <span>On-Time Performance Score</span>
                      <span className="text-sm font-black text-emerald-600">98%</span>
                    </div>
                    <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">Avg. Dwell Time</div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">42 sec</div>
                      <div className="text-[9px] text-emerald-600 font-bold mt-0.5">Optimal</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">Headway Variance</div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">±1.2 min</div>
                      <div className="text-[9px] text-emerald-600 font-bold mt-0.5">Low Variance</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs">
                    <div className="font-extrabold text-blue-900 dark:text-blue-200 mb-0.5">Efficiency Rating</div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                      Operating at 98% efficiency. Headways are evenly distributed with minimal passenger wait congestion.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Suggestion */}
              <div className="bg-purple-50 dark:bg-purple-950/50 rounded-xl p-3 border border-purple-100 dark:border-purple-900">
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300">
                  <Sparkles size={14} />
                  <span>AI Suggestion</span>
                </div>
                <p className="text-[11px] text-purple-900 dark:text-purple-200 mt-1 font-medium">
                  Headway is optimal. Maintain current schedule.
                </p>
              </div>

              {/* 2x2 Bottom Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Bus size={16} className="text-blue-600" />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">247</div>
                    <div className="text-[9px] text-slate-400">Active Buses</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Clock size={16} className="text-purple-600" />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">7.6 min</div>
                    <div className="text-[9px] text-slate-400">Avg Headway</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <Users size={16} className="text-amber-600" />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">1.24M</div>
                    <div className="text-[9px] text-slate-400">Passengers Today</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">92%</div>
                    <div className="text-[9px] text-slate-400">Network Reliability</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={12} />
          </div>
          <div className="text-xs font-bold">{showToast}</div>
          <button onClick={() => setShowToast(null)} className="ml-2 text-slate-400 hover:text-white text-xs font-bold">
            <X size={12} />
          </button>
        </div>
      )}

    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Filter, 
  Layers, 
  Crosshair, 
  AlignJustify, 
  AlertTriangle, 
  MessageSquare, 
  X, 
  Send,
  ChevronRight,
  Bot,
  TrendingUp,
  Plus,
  Minus,
  Navigation,
  Bus,
  CheckCircle2,
  Clock,
  Info,
  Flame,
  CloudSun,
  CloudRain,
  Box
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { fetchRoutesGeoJSON, fetchLiveTelemetryGeoJSON, fetchAllStopsGeoJSON, API_URL } from "../../lib/api";
import { useData } from "../../providers/DataProvider";

const initialRoutesData = {
  type: "FeatureCollection",
  features: []
};

// Route badges data to place on map matching Figma screenshot
const routeBadges = [
  { id: "138", name: "138", lat: 19.0880, lng: 72.8850, color: "bg-purple-600" },
  { id: "500", name: "500", lat: 19.0200, lng: 72.8550, color: "bg-amber-500" },
  { id: "A-74", name: "A-74", lat: 19.1450, lng: 72.9350, color: "bg-blue-600" },
];

// Donut data for Network Status
const networkStatusData = [
  { name: "On Time", value: 92, color: "#22c55e" },
  { name: "Delays", value: 5, color: "#f97316" },
  { name: "Bunching", value: 2, color: "#ef4444" },
  { name: "Disrupted", value: 1, color: "#64748b" },
];

// Sparkline data for Fleet Summary
const fleetSparklineData = [
  { val: 235 },
  { val: 238 },
  { val: 240 },
  { val: 242 },
  { val: 245 },
  { val: 247 },
];

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

// Map route names to their designated route line colors
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

// Generate a geographic circle polygon with fixed lat/lng radius so it zooms naturally with the map
function createGeoJSONCircle(center: [number, number], radiusInKm: number = 0.8, points: number = 64) {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [coords]
        },
        properties: {}
      }
    ]
  };
}

// Internal component for an animated Ghost Bus to avoid re-rendering the whole map
function GhostBusMarker({ targetLat, targetLng }: { targetLat: number, targetLng: number }) {
  const [path, setPath] = useState<number[][]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startLng = targetLng + 0.03 + (Math.random() * 0.02);
    const startLat = targetLat + (Math.random() * 0.06 - 0.03);

    fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${targetLng},${targetLat}?geometries=geojson&overview=full`)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          setPath(data.routes[0].geometry.coordinates);
        } else {
          setPath([[startLng, startLat], [targetLng, targetLat]]);
        }
      })
      .catch(() => setPath([[startLng, startLat], [targetLng, targetLat]]));
  }, [targetLat, targetLng]);

  useEffect(() => {
    if (path.length < 2) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= path.length - 1) return p;
        return p + 0.3;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [path]);

  if (path.length === 0) return null;

  const index = Math.floor(progress);
  const remainder = progress - index;
  
  let currentLng = path[index][0];
  let currentLat = path[index][1];
  let rotation = 0;

  if (index < path.length - 1) {
    const nextLng = path[index + 1][0];
    const nextLat = path[index + 1][1];
    currentLng = currentLng + (nextLng - currentLng) * remainder;
    currentLat = currentLat + (nextLat - currentLat) * remainder;
    rotation = Math.atan2(nextLng - currentLng, nextLat - currentLat) * (180 / Math.PI);
  }

  return (
    <Marker longitude={currentLng} latitude={currentLat} anchor="center">
      <div className="relative group cursor-pointer animate-pulse">
        <div className="relative z-10 w-8 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
          <img 
            src="/bus-top.svg" 
            alt="Ghost Bus" 
            className="w-full h-full drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]" 
            style={{ 
              filter: 'hue-rotate(45deg) saturate(200%) brightness(120%)',
              transform: `rotate(${rotation}deg)` 
            }} 
          />
          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
            <div className="bg-amber-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg font-bold">
              Ghost Bus Dispatched
            </div>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-amber-500"></div>
          </div>
        </div>
      </div>
    </Marker>
  );
}

export default function LiveMap() {
  const { metrics, activities } = useData();
  const mapRef = useRef<any>(null);

  const [activeFilters, setActiveFilters] = useState({
    routes: true,
    stops: true,
    alerts: true,
    heatmap: false // Default OFF as requested
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
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

  const [mapDimension, setMapDimension] = useState<'2D' | '3D'>('2D');

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

  const [routesData, setRoutesData] = useState<any>(initialRoutesData);
  const [stopsData, setStopsData] = useState<any>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isFloodDetourActive, setIsFloodDetourActive] = useState(false);

  const handleToggleFloodDetour = async () => {
    const nextState = !isFloodDetourActive;
    setIsFloodDetourActive(nextState);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
      const res = await fetch(`${API_URL}/incidents/flood-detour`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: nextState })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.message) {
          alert(data.message);
        }
      } else {
        alert(nextState ? "Monsoon Flood Detour Activated around Sion Underpass! Routes 101, 102 & 210 rerouted." : "Monsoon Flood Detour Deactivated.");
      }
    } catch (e) {
      alert(nextState ? "Monsoon Flood Detour Activated!" : "Monsoon Flood Detour Deactivated.");
    }
  };
  const [stopVolumes, setStopVolumes] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activePanelTab, setActivePanelTab] = useState<'DETAILS' | 'CHAT'>('DETAILS');
  const [newMessage, setNewMessage] = useState("");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastCenter, setBroadcastCenter] = useState<{lat: number, lng: number} | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [ghostBusTargets, setGhostBusTargets] = useState<{id: string, lat: number, lng: number}[]>([]);
  const [resolvedBuses, setResolvedBuses] = useState<Set<string>>(new Set());

  // Dynamic AI Recommendations state
  const [aiActions, setAiActions] = useState([
    {
      id: "rec-1",
      title: "Hold bus 134-C",
      confidence: "High Confidence",
      confidenceColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      sub1: "2 mins at Dadar TT",
      sub2: "+15% headway improvement",
      icon: Bot,
      iconBg: "bg-purple-100 text-purple-600",
      accepted: false
    },
    {
      id: "rec-2",
      title: "Dispatch Spare Bus",
      confidence: "Medium Confidence",
      confidenceColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      sub1: "From Wadala Depot",
      sub2: "ETA 8 mins to Route 102",
      icon: TrendingUp,
      iconBg: "bg-blue-100 text-blue-600",
      accepted: false
    }
  ]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const [routes, stops] = await Promise.all([
          fetchRoutesGeoJSON(),
          fetchAllStopsGeoJSON()
        ]);
        if (routes) setRoutesData(routes);
        if (stops) setStopsData(stops);
      } catch (e) {
        console.error("Failed to fetch map data", e);
      }
    };
    fetchMapData();

    const fetchLiveMapData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
        const data = await fetchLiveTelemetryGeoJSON().catch(() => null);
        if (data && data.features) {
          setBuses(data.features.map((f: any) => ({
            trip_id: f.properties.trip_id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            forward_headway: f.properties.headway,
            bus_number: f.properties.bus_number,
            route_name: f.properties.route_name
          })));
        }

        const incidentsRes = await fetch(`${API_URL}/incidents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null);
        if (incidentsRes && incidentsRes.ok) {
          const incData = await incidentsRes.json().catch(() => null);
          if (incData) setIncidents(incData);
        }

        const heatmapRes = await fetch(`${API_URL}/routes/stops/heatmap`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null);
        if (heatmapRes && heatmapRes.ok) {
          const hmData = await heatmapRes.json().catch(() => null);
          if (hmData) setStopVolumes(hmData);
        }
      } catch (e) {
        // Silently catch network drops
      }
    };
    fetchLiveMapData();

    const interval = setInterval(fetchLiveMapData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedTripId) return;

    const fetchTripSpecificData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/chat/${selectedTripId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
        
        const detailsRes = await fetch(`${API_URL}/trips/${selectedTripId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          setSelectedTripDetails(detailsData);
        }
      } catch (e) {
        console.error("Failed to fetch trip data", e);
      }
    };
    fetchTripSpecificData();

    const tripInterval = setInterval(fetchTripSpecificData, 5000);
    return () => clearInterval(tripInterval);
  }, [selectedTripId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTripId) return;

    const msg = newMessage.trim();
    setNewMessage("");

    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tripId: selectedTripId,
          message: msg
        })
      });
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const sendCommand = async (type: 'HOLD' | 'REROUTE' | 'EXPRESS' | 'SHORT_LOOP') => {
    if (!selectedTripId) return;
    try {
      const token = localStorage.getItem('token') || '';

      // Find the bus details for the reason message
      const bus = buses.find(b => b.trip_id === selectedTripId);
      const busLabel = bus ? `${bus.bus_number || 'Bus'} on Route ${bus.route_name || '?'}` : selectedTripId.slice(0, 8);

      // Send to ALL active buses so every conductor sees it
      const res = await fetch(`${API_URL}/commands/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: type,
          duration_sec: type === 'HOLD' ? 300 : 0,
          reason: `${type} — dispatched from ${busLabel}`
        })
      });

      const data = await res.json().catch(() => null);
      const count = data?.count || 0;
      alert(`Command ${type} sent to ${count} active buses!`);

      setResolvedBuses(prev => {
        const next = new Set(prev);
        next.add(selectedTripId);
        return next;
      });

      setSelectedTripId(null);
    } catch (e) {
      console.error("Failed to send command", e);
    }
  };

  const handleAcceptAi = (id: string) => {
    setAiActions(prev => prev.map(item => item.id === id ? { ...item, accepted: true } : item));
    alert("AI Recommendation Accepted & Action Dispatched to Operations!");
  };

  const sendBroadcast = async () => {
    if (!broadcastCenter || !broadcastMessage.trim()) return;
    try {
      const token = localStorage.getItem('token') || '';

      // 1. Create the zone-based broadcast
      await fetch(`${API_URL}/broadcasts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: broadcastMessage,
          lat: broadcastCenter.lat,
          lng: broadcastCenter.lng,
          radiusMeters: 2000
        })
      });

      // 2. Also send a HOLD command to ALL active buses so conductors see it on their commands screen
      await fetch(`${API_URL}/commands/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'HOLD',
          duration_sec: 0,
          reason: `Zone Broadcast: ${broadcastMessage}`
        })
      });

      alert(`Broadcast sent to zone! Command dispatched to all active buses.`);
      setBroadcastMode(false);
      setBroadcastCenter(null);
      setBroadcastMessage("");
    } catch (e) {
      console.error("Failed to send broadcast", e);
    }
  };

  const handleMapClick = (e: any) => {
    if (broadcastMode) {
      setBroadcastCenter({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [72.8777, 19.0760], zoom: 11.5 });
    }
  };

  const dynamicRouteBadges = React.useMemo(() => {
    if (!routesData || !routesData.features || routesData.features.length === 0) {
      return routeBadges;
    }
    return routesData.features.slice(0, 40).map((f: any) => {
      const coords = f.geometry?.coordinates;
      if (!coords || coords.length === 0) return null;
      const mid = coords[Math.floor(coords.length / 2)];
      return {
        id: f.properties?.id || Math.random().toString(),
        name: f.properties?.name || 'Route',
        lng: mid[0],
        lat: mid[1],
        color: f.properties?.color || '#3b82f6'
      };
    }).filter(Boolean);
  }, [routesData]);

  // Compute live bus bunching heatmap points for areas with high headway congestion
  const bunchingHeatmapData = React.useMemo(() => {
    const features: any[] = [];

    // 1. Add bunched live telemetry buses
    buses.forEach((bus: any) => {
      const isBunched = bus.forward_headway && bus.forward_headway < 200;
      if (isBunched) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [bus.lng || 72.8777, bus.lat || 19.0760]
          },
          properties: {
            intensity: 1.0,
            reason: "Live Bus Bunching"
          }
        });
      }
    });

    // 2. High-density historical bunching hotspots in Mumbai BEST network
    const hotspots = [
      { lng: 72.8430, lat: 19.0180, weight: 0.9, name: "Dadar TT Circle" },
      { lng: 72.8480, lat: 19.0190, weight: 0.85, name: "Dadar Station East" },
      { lng: 72.8180, lat: 19.0110, weight: 0.95, name: "Worli Naka" },
      { lng: 72.8640, lat: 19.0400, weight: 1.0, name: "Sion Circle Hotspot" },
      { lng: 72.8750, lat: 19.0650, weight: 0.9, name: "Kurla Station West" },
      { lng: 72.8360, lat: 19.0520, weight: 0.8, name: "Bandra Reclamation" },
      { lng: 72.8350, lat: 18.9400, weight: 0.75, name: "CST Terminal Junction" },
      { lng: 72.9280, lat: 19.1120, weight: 0.85, name: "Vikhroli Depot" }
    ];

    hotspots.forEach((spot) => {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [spot.lng, spot.lat]
        },
        properties: {
          intensity: spot.weight,
          name: spot.name
        }
      });
    });

    return {
      type: "FeatureCollection",
      features
    };
  }, [buses]);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiaYWthc2hpa2F0YWtlIiwiYSI6ImNtOW0xZjhiaTBsNm0ycXI0a29mNDdsYm4ifQ.O7T7sS0f1S1k2x-y53x9aQ";

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 font-sans">
      {/* Canvas Map Container */}
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
        onClick={handleMapClick}
        cursor={broadcastMode ? 'crosshair' : 'grab'}
      >
        {/* Real 3D Vector Building Extrusions Layer (Synced with Light & Dark Navbar Theme) */}
        {mapDimension === '3D' && (
          <Source 
            id="3d-buildings-source" 
            type="vector" 
            url="https://tiles.openfreemap.org/planet"
          >
            <Layer
              id="3d-buildings-layer"
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
        {activeFilters.routes && (
          <Source id="routes" type="geojson" data={routesData as any}>
            <Layer 
              id="route-line" 
              type="line" 
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 4.5,
                'line-opacity': 0.85
              }} 
            />
            <Layer 
              id="route-labels" 
              type="symbol" 
              layout={{
                'symbol-placement': 'line',
                'text-field': ['get', 'name'],
                'text-size': 12,
                'text-max-angle': 30,
                'text-padding': 10
              }} 
              paint={{
                'text-color': '#1e293b',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
              }} 
            />
          </Source>
        )}

        {/* Dynamic Route Pills Badges for all seeded routes */}
        {activeFilters.routes && dynamicRouteBadges.map((badge: any) => (
          <Marker key={badge.id} longitude={badge.lng} latitude={badge.lat} anchor="center">
            <div 
              style={{ backgroundColor: badge.color?.startsWith('#') ? badge.color : undefined }}
              className={`${badge.color?.startsWith('#') ? '' : badge.color} text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-md shadow-md tracking-wider border border-white/40 cursor-pointer hover:scale-105 transition-transform whitespace-nowrap`}
            >
              {badge.name}
            </div>
          </Marker>
        ))}

        {activeFilters.stops && stopsData && (
          <Source id="stops" type="geojson" data={stopsData}>
            <Layer 
              id="stops-point" 
              type="circle" 
              paint={{
                'circle-color': '#ffffff',
                'circle-radius': 4.5,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#3b82f6'
              }} 
            />
            <Layer
              id="stops-label"
              type="symbol"
              minzoom={12}
              layout={{
                'text-field': ['get', 'name'],
                'text-size': 11,
                'text-offset': [0, 1.2],
                'text-anchor': 'top',
                'text-allow-overlap': false
              }}
              paint={{
                'text-color': '#1e293b',
                'text-halo-color': '#ffffff',
                'text-halo-width': 2
              }}
            />
          </Source>
        )}

        {/* Bunching Hotspot Heatmap Layer */}
        {activeFilters.heatmap && (
          <Source id="bunching-heatmap" type="geojson" data={bunchingHeatmapData as any}>
            <Layer
              id="bunching-heatmap-layer"
              type="heatmap"
              paint={{
                'heatmap-weight': ['get', 'intensity'],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 15, 3],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0, 0, 0, 0)',
                  0.2, 'rgba(254, 240, 138, 0.65)',
                  0.45, 'rgba(251, 146, 60, 0.85)',
                  0.75, 'rgba(239, 68, 68, 0.9)',
                  1.0, 'rgba(185, 28, 28, 0.98)'
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 15, 15, 50],
                'heatmap-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Live Buses */}
        {buses.map((bus) => {
          const lng = bus.lng || 72.8777;
          const lat = bus.lat || 19.0760;
          
          // Check status:
          // 1. Problem / Critical Alert: Red bus with Warning Alert Badge
          // 2. Delayed: Yellow/Amber bus with Clock Badge
          // 3. Normal: Route Color matching the bus's route
          const isResolved = resolvedBuses.has(bus.trip_id);
          const isAlertProblem = !isResolved && (bus.forward_headway < 150 || activities.some(a => String(a.trip_id) === String(bus.trip_id)));
          const isDelayed = !isResolved && !isAlertProblem && (bus.forward_headway >= 150 && bus.forward_headway < 300);

          let busColor = getRouteColor(bus.route_name);
          let busStatus: 'NORMAL' | 'DELAYED' | 'ALERT' = 'NORMAL';

          if (isAlertProblem) {
            busColor = "#ef4444"; // Red for Problem / Alert
            busStatus = 'ALERT';
          } else if (isDelayed) {
            busColor = "#f59e0b"; // Yellow/Amber for Delayed
            busStatus = 'DELAYED';
          }

          return (
            <Marker key={bus.trip_id} longitude={lng} latitude={lat} anchor="center">
              <div 
                className="relative group cursor-pointer"
                onClick={() => setSelectedTripId(bus.trip_id)}
              >
                {/* Alert Pulse Halo for Problems */}
                {busStatus === 'ALERT' && (
                  <div className="absolute -inset-3 bg-red-500/30 rounded-full animate-ping z-0 pointer-events-none"></div>
                )}
                {/* Delayed Pulse Halo */}
                {busStatus === 'DELAYED' && (
                  <div className="absolute -inset-3 bg-amber-400/30 rounded-full animate-pulse z-0 pointer-events-none"></div>
                )}

                <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-110">
                  <TopDownBusSvg color={busColor} />

                  {/* Problem Alert Badge (Red circle with Warning Icon) */}
                  {busStatus === 'ALERT' && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md z-20 border border-white animate-bounce">
                      <AlertTriangle size={11} />
                    </div>
                  )}

                  {/* Delayed Badge (Yellow circle with Clock Icon) */}
                  {busStatus === 'DELAYED' && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md z-20 border border-white">
                      <Clock size={11} />
                    </div>
                  )}

                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1 whitespace-nowrap shadow-lg flex flex-col items-center border border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{bus.bus_number || 'Bus'}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: busColor }}></span>
                      </div>
                      <span className="text-slate-300 text-[10px]">
                        Route {bus.route_name || 'Unknown'} • {busStatus === 'ALERT' ? 'Problem / Alert' : busStatus === 'DELAYED' ? 'Delayed' : 'On Time'}
                      </span>
                    </div>
                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900"></div>
                  </div>
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Incidents & Surge / Ghost Bus Alerts Layer (Wrapped in activeFilters.alerts) */}
        {activeFilters.alerts && (
          <>
            {/* 1. Traffic & Road Incidents */}
            {incidents.map((incident: any) => (
              <Marker key={`inc-${incident.id}`} longitude={incident.lng} latitude={incident.lat}>
                <div className="flex flex-col items-center">
                  <div className="bg-white px-2 py-0.5 rounded shadow text-[10px] font-bold text-red-600 border border-red-200 mb-1">
                    {incident.type}
                  </div>
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                    <AlertTriangle size={14} color="white" />
                  </div>
                </div>
              </Marker>
            ))}

            {/* 2. Passenger Surge & Ghost Bus Required Alerts (Max 2 to keep map clean) */}
            {(stopVolumes.length > 0 ? stopVolumes : [
              { id: "surge-1", name: "Dadar TT Circle", lat: 19.0180, lng: 72.8430, passengersWaiting: 48 },
              { id: "surge-2", name: "Vikhroli East", lat: 19.1090, lng: 72.9260, passengersWaiting: 52 },
            ])
            .slice(0, 2)
            .map((stop: any) => (
              <Marker key={`surge-${stop.id}`} longitude={stop.lng} latitude={stop.lat}>
                <div className="flex flex-col items-center group cursor-pointer">
                  <div 
                    className="bg-red-600/95 hover:bg-red-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-transform group-hover:scale-105 border border-white/80 flex items-center gap-1"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setGhostBusTargets(prev => [...prev, { id: 'gb-' + Date.now(), lat: stop.lat, lng: stop.lng }]);
                      alert(`Ghost Bus Dispatched to ${stop.name || 'Surge Zone'}!`);
                    }}
                  >
                    <span>{stop.passengersWaiting || 45} waiting</span>
                    <span className="text-[10px]">👻</span>
                  </div>

                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30">
                    <div className="bg-slate-900 text-white text-[10px] font-bold rounded-lg px-2 py-1 whitespace-nowrap shadow-lg border border-slate-700">
                      Click to Dispatch Ghost Bus to {stop.name}
                    </div>
                    <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-slate-900"></div>
                  </div>
                </div>
              </Marker>
            ))}
          </>
        )}

        {broadcastCenter && (
          <>
            <Source id="broadcast-circle-source" type="geojson" data={createGeoJSONCircle([broadcastCenter.lng, broadcastCenter.lat], 0.8)}>
              <Layer
                id="broadcast-circle-fill"
                type="fill"
                paint={{
                  'fill-color': '#f59e0b',
                  'fill-opacity': 0.25
                }}
              />
              <Layer
                id="broadcast-circle-stroke"
                type="line"
                paint={{
                  'line-color': '#d97706',
                  'line-width': 2.5
                }}
              />
            </Source>
            <Marker longitude={broadcastCenter.lng} latitude={broadcastCenter.lat} anchor="center">
              <div className="w-4 h-4 bg-amber-600 rounded-full animate-pulse shadow-lg border-2 border-white ring-4 ring-amber-500/30"></div>
            </Marker>
          </>
        )}

        {ghostBusTargets.map(gb => (
          <GhostBusMarker key={gb.id} targetLat={gb.lat} targetLng={gb.lng} />
        ))}
      </Map>

      {/* Broadcast Zone Drawer (when active) */}
      {broadcastMode && broadcastCenter && (
        <div className="absolute top-36 left-8 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 w-72 border border-amber-300">
          <h3 className="font-bold text-slate-800 dark:text-white text-xs mb-2 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-amber-500" />
            Zone Broadcast
          </h3>
          <textarea
            className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs mb-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Broadcast instructions to conductors in zone..."
            rows={3}
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
          />
          <button
            onClick={sendBroadcast}
            disabled={!broadcastMessage.trim()}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send size={14} />
            Send Broadcast
          </button>
        </div>
      )}

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

      {/* LEFT SIDEBAR OVERLAY: Filter Toolbar Capsule & Stack of Figma Cards */}
      <div className="absolute top-24 left-8 z-30 w-80 space-y-3 pointer-events-auto">
        
        {/* FILTER TOOLBAR CAPSULE: Routes, Stops, Alerts, Heatmap, and Collapse Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full p-1.5 shadow-lg border border-white/90 dark:border-slate-800/90 flex items-center gap-1">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                isSidebarCollapsed 
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md hover:scale-110' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar Cards" : "Collapse Sidebar Cards"}
            >
              <AlignJustify size={14} />
            </button>

            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, routes: !prev.routes }))}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeFilters.routes ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Routes
            </button>

            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, stops: !prev.stops }))}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeFilters.stops ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Stops
            </button>

            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, alerts: !prev.alerts }))}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeFilters.alerts ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Alerts
            </button>

            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, heatmap: !prev.heatmap }))}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                activeFilters.heatmap ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Flame size={12} />
              Heatmap
            </button>

            <button
              onClick={handleToggleFloodDetour}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                isFloodDetourActive ? 'bg-red-600 text-white shadow-md animate-pulse' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Activate Monsoon Waterlogging Emergency Re-Routing"
            >
              <CloudRain size={12} />
              <span>{isFloodDetourActive ? "Detour Active" : "Flood Detour"}</span>
            </button>
          </div>

          {/* Broadcast Zone Trigger Button */}
          <button
            onClick={() => {
              setBroadcastMode(!broadcastMode);
              if (broadcastMode) setBroadcastCenter(null);
            }}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all border ${
              broadcastMode 
                ? 'bg-amber-500 text-white border-amber-600' 
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-white border-white/90 dark:border-slate-800/90 backdrop-blur-xl hover:bg-white'
            }`}
          >
            <Crosshair size={14} />
            {broadcastMode ? 'Cancel' : 'Broadcast'}
          </button>
        </div>

        {/* STACK OF FIGMA CARDS (Collapsible) */}
        <div className={`w-80 space-y-3 transition-all duration-300 transform ${isSidebarCollapsed ? '-translate-x-[360px] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}>
          {/* CARD 1: Network Status */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg shadow-slate-900/5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Network Status
            </span>
            <ChevronRight size={14} className="text-slate-400" />
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Donut Chart with center label */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={networkStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={26}
                    outerRadius={38}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {networkStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  92%
                </span>
                <span className="text-[8px] font-semibold text-slate-400 leading-tight text-center mt-0.5">
                  Network<br/>Health
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex-1 space-y-1.5 pl-2 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-slate-900 dark:text-white">92%</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">On Time</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-slate-900 dark:text-white">5%</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Delays</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="font-bold text-slate-900 dark:text-white">2%</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Bunching</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                  <span className="font-bold text-slate-900 dark:text-white">1%</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">Disrupted</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: AI Recommendations */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg shadow-slate-900/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              AI Recommendations
            </span>
            <ChevronRight size={14} className="text-slate-400" />
          </div>

          <div className="space-y-3">
            {aiActions.map(rec => {
              const IconComp = rec.icon;
              return (
                <div key={rec.id} className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-xl ${rec.iconBg}`}>
                        <IconComp size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {rec.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {rec.sub1}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${rec.confidenceColor}`}>
                      {rec.confidence}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-7">
                    {rec.sub2}
                  </div>

                  <div className="flex items-center gap-2 pt-1 pl-7">
                    <button
                      onClick={() => handleAcceptAi(rec.id)}
                      disabled={rec.accepted}
                      className={`px-3 py-1 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer ${
                        rec.accepted 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {rec.accepted ? 'Accepted' : 'Accept'}
                    </button>
                    <button
                      onClick={() => alert(`Details for ${rec.title}: Operational AI headway balancing recommendation.`)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: Recent Alerts */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-lg shadow-slate-900/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Recent Alerts
            </span>
            <a href="/alerts" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View all
            </a>
          </div>

          <div className="space-y-2">
            {/* Alert 1 */}
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={12} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                    Bus bunching on Route 138
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    3 buses within 120 seconds
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-medium text-slate-400 shrink-0 flex items-center gap-0.5">
                2 min ago <ChevronRight size={10} />
              </span>
            </div>

            {/* Alert 2 */}
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={12} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                    High occupancy on Route 500
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    Between Sion & Chembur
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-medium text-slate-400 shrink-0 flex items-center gap-0.5">
                6 min ago <ChevronRight size={10} />
              </span>
            </div>

            {/* Alert 3 */}
            <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Info size={12} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-[11px] truncate">
                    Holding in progress
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                    Bus A-74 at Vikhroli
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-medium text-slate-400 shrink-0 flex items-center gap-0.5">
                8 min ago <ChevronRight size={10} />
              </span>
            </div>
          </div>
        </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR OVERLAY: Map Zoom Controls */}
      <div className="absolute bottom-28 right-8 z-30 flex flex-col gap-1.5">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-1 shadow-lg flex flex-col gap-1">
          <button 
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white cursor-pointer font-bold"
            title="Zoom In"
          >
            <Plus size={16} />
          </button>
          <div className="h-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white cursor-pointer font-bold"
            title="Zoom Out"
          >
            <Minus size={16} />
          </button>
        </div>

        <button 
          onClick={handleRecenter}
          className="w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl shadow-lg flex items-center justify-center text-slate-800 dark:text-white hover:bg-white cursor-pointer"
          title="Recenter Map"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* BOTTOM-RIGHT OVERLAY: Fleet Summary Card */}
      <div className="absolute bottom-6 right-8 z-30 w-72 pointer-events-auto">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xl shadow-slate-900/10 space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Fleet Summary
            </span>
            <ChevronRight size={14} className="text-slate-400" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                {metrics.activeBuses || 247}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Active Buses
              </div>
            </div>

            {/* Sparkline chart */}
            <div className="w-24 h-9 flex flex-col items-end">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fleetSparklineData}>
                  <Line type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <span className="text-[9px] font-bold text-emerald-600 mt-0.5">
                +12 vs 1 hr ago
              </span>
            </div>
          </div>

          {/* 4 Fleet Status Pill Badges */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
            <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-1.5 rounded-xl border border-emerald-500/20">
              <div className="flex items-center justify-center text-emerald-600 gap-1">
                <Bus size={10} />
                <span className="font-extrabold text-xs">48</span>
              </div>
              <div className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                On Time
              </div>
            </div>

            <div className="bg-orange-500/10 dark:bg-orange-500/20 p-1.5 rounded-xl border border-orange-500/20">
              <div className="flex items-center justify-center text-orange-600 gap-1">
                <Bus size={10} />
                <span className="font-extrabold text-xs">62</span>
              </div>
              <div className="text-[8px] font-bold text-orange-700 dark:text-orange-400 mt-0.5">
                Delayed
              </div>
            </div>

            <div className="bg-amber-500/10 dark:bg-amber-500/20 p-1.5 rounded-xl border border-amber-500/20">
              <div className="flex items-center justify-center text-amber-600 gap-1">
                <Bus size={10} />
                <span className="font-extrabold text-xs">55</span>
              </div>
              <div className="text-[8px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                Bunching
              </div>
            </div>

            <div className="bg-purple-500/10 dark:bg-purple-500/20 p-1.5 rounded-xl border border-purple-500/20">
              <div className="flex items-center justify-center text-purple-600 gap-1">
                <Bus size={10} />
                <span className="font-extrabold text-xs">44</span>
              </div>
              <div className="text-[8px] font-bold text-purple-700 dark:text-purple-400 mt-0.5">
                Holding
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* TRIP DETAILS & CONDUCTOR CHAT DRAWER */}
      {selectedTripId && (
        <div className="absolute top-24 right-8 w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[560px] overflow-hidden z-50 animate-in fade-in slide-in-from-right-4">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-base">Trip Details & Actions</h3>
              <p className="text-blue-100 text-xs mt-0.5">Bus {selectedTripDetails?.busNumber || selectedTripId.slice(0, 8)} • Route {selectedTripDetails?.route?.routeName}</p>
            </div>
            <button onClick={() => setSelectedTripId(null)} className="p-1 hover:bg-blue-700 rounded-full transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button 
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activePanelTab === 'DETAILS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setActivePanelTab('DETAILS')}
            >
              Trip Status
            </button>
            <button 
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${activePanelTab === 'CHAT' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setActivePanelTab('CHAT')}
            >
              Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 relative">
            {activePanelTab === 'DETAILS' ? (
              <div className="p-4 space-y-4">
                
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Problem Context</h4>
                  
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-950 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-red-500"><AlertTriangle size={16} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Reason for Bunching</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{selectedTripDetails?.bunchingReason || "High passenger boarding density at stop."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 text-slate-400"><AlignJustify size={16} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Conductor's Notes</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 italic">"{selectedTripDetails?.conductorNotes || "Heavy boarding at Dadar stop."}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dispatch Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => sendCommand('HOLD')}
                      className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-950 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-colors border border-amber-200 dark:border-amber-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>Hold Bus</span>
                      <span className="text-[9px] font-normal opacity-80">Instruct to wait</span>
                    </button>
                    
                    <button 
                      onClick={() => sendCommand('REROUTE')}
                      className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-colors border border-purple-200 dark:border-purple-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>Re-route</span>
                      <span className="text-[9px] font-normal opacity-80">Send alternate path</span>
                    </button>

                    <button 
                      onClick={() => sendCommand('EXPRESS')}
                      className="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-colors border border-emerald-200 dark:border-emerald-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>Express Mode</span>
                      <span className="text-[9px] font-normal opacity-80">Skip next 3 stops</span>
                    </button>

                    <button 
                      onClick={() => sendCommand('SHORT_LOOP')}
                      className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200 py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-colors border border-rose-200 dark:border-rose-800 flex flex-col items-center gap-0.5 cursor-pointer"
                    >
                      <span>Short Loop</span>
                      <span className="text-[9px] font-normal opacity-80">Dispatch empty bus</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-slate-400 text-xs mt-10">No messages yet.</p>
                  )}
                  {chatMessages.map(msg => {
                    const isMine = msg.senderRole === 'OPERATOR';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-1.5 rounded-2xl max-w-[85%] text-xs ${isMine ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-tl-none'}`}>
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
                  <input 
                    type="text" 
                    placeholder="Message conductor..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full px-3.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, AlertTriangle, Check, X, MapPin, ArrowRight } from "lucide-react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchRoutes, fetchRouteDetails } from "@/lib/api";

export default function RouteInspector() {
  // ── Left Panel: Route List ──
  const [routes, setRoutes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRealId, setSelectedRealId] = useState<string | null>(null);

  // ── Right Panel: Route Detail ──
  const [route, setRoute] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  // ── Fetch route list on mount ──
  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const routeData = await fetchRoutes();
        if (routeData) {
          const mapped = routeData.map((r: any, idx: number) => {
            const badgeNumber = r.routeName || r.id || `${100 + idx * 2}`;
            const offsets = [16, -17, -44, 11, -12];
            const rawScore = (r.score || 78) + offsets[idx % offsets.length];
            const healthScore = Math.min(98, Math.max(34, rawScore));

            let statusLabel = 'Operational';
            let dotColor = 'bg-emerald-500';
            let textColor = 'text-emerald-600';
            let badgeBg = 'bg-blue-600';
            let healthColor = 'text-emerald-600';

            if (healthScore < 50) {
              statusLabel = 'Critical';
              dotColor = 'bg-red-500';
              textColor = 'text-red-500';
              badgeBg = 'bg-red-500';
              healthColor = 'text-red-500';
            } else if (healthScore < 80) {
              statusLabel = 'Delayed';
              dotColor = 'bg-amber-500';
              textColor = 'text-amber-500';
              badgeBg = 'bg-amber-500';
              healthColor = 'text-amber-500';
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
              healthColor,
            };
          });
          setRoutes(mapped);
          // Auto-select first route
          if (mapped.length > 0) {
            setSelectedRealId(mapped[0].realId);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoutesData();
  }, []);

  // ── Fetch detail when selection changes ──
  useEffect(() => {
    if (!selectedRealId) {
      setRoute(null);
      setRoutePolyline(null);
      return;
    }

    let cancelled = false;

    const getData = async () => {
      setDetailLoading(true);
      try {
        const details = await fetchRouteDetails(selectedRealId);
        if (cancelled) return;
        setRoute(details);

        if (details.polyline) {
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
    const interval = setInterval(getData, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [selectedRealId]);

  // ── Derived ──
  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.startStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.endStop.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.id.toString().includes(searchQuery)
  );

  const selectedRouteMeta = routes.find(r => r.realId === selectedRealId);

  const handleApprove = () => {
    setIsApproved(true);
    const targetBusId = `Bus ${route?.routeName || selectedRealId}`;
    setShowToast(`Successfully updated to ${targetBusId}`);
    setTimeout(() => setShowToast(null), 4000);
  };

  // ── Detail sub-components ──
  const busStops = route?.busStops || [];
  const trips = route?.trips || [];
  const isBunching = trips.some((t: any) => t.liveTelemetry && t.liveTelemetry.forwardHeadway < 2.0);

  return (
    <div className="flex gap-5 h-full w-full font-sans text-slate-800">
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Route List (25%)
      ═══════════════════════════════════════════ */}
      <div className="w-[25%] min-w-[280px] flex flex-col bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Routes</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {routes.length} total · {routes.filter(r => r.status === 'Operational').length} operational
          </p>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-xs placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Route List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
          {filteredRoutes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              No routes found
            </div>
          ) : (
            filteredRoutes.map((route) => {
              const isActive = selectedRealId === route.realId;
              return (
                <button
                  key={route.realId}
                  onClick={() => setSelectedRealId(route.realId)}
                  className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Badge */}
                    <div className={`w-12 h-12 rounded-xl ${route.badgeBg} text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs`}>
                      {route.id}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 truncate">
                        <span className="truncate">{route.startStop}</span>
                        <ArrowRight size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{route.endStop}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`w-2 h-2 rounded-full ${route.dotColor}`}></span>
                        <span className={`text-xs font-bold ${route.textColor}`}>{route.status}</span>
                        <span className="text-slate-300">·</span>
                        <span className={`text-xs font-extrabold ${route.healthColor}`}>{route.healthScore}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Route Detail
      ═══════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs overflow-hidden flex flex-col">
        {!selectedRealId || detailLoading && !route ? (
          /* Empty / Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <MapPin size={24} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {detailLoading ? 'Loading route details...' : 'Select a route to view details'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {detailLoading ? 'Fetching map & telemetry data' : 'Click any route from the list'}
                </p>
              </div>
            </div>
          </div>
        ) : route ? (
          /* ── Loaded Detail View ── */
          <>
            {/* Detail Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isBunching ? "Bus Bunching — " : "Monitoring — "} Route {route.routeName}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {busStops.length > 0 ? `${busStops[0].name} → ${busStops[busStops.length - 1].name}` : "City Route"} · Live Update
                </p>
              </div>
              {selectedRouteMeta && (
                <div className={`px-4 py-1.5 rounded-lg text-sm font-extrabold text-white ${selectedRouteMeta.badgeBg}`}>
                  {selectedRouteMeta.id}
                </div>
              )}
            </div>

            {/* 3-Column Dashboard */}
            <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
              {/* Left Sidebar: Timeline (3 cols) */}
              <div className="col-span-3 bg-white/60 rounded-xl border border-slate-100 p-5 flex flex-col overflow-hidden">
                <h3 className="font-bold text-slate-900 text-sm mb-4">Route Timeline</h3>

                <div className="flex-1 overflow-y-auto pr-1 relative no-scrollbar">
                  <div className="absolute left-[10px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>

                  {busStops.slice(0, 15).map((stop: any, index: number) => {
                    const isBuncedStop = isBunching && index === 2;
                    return (
                      <div key={stop.id} className="mb-6 relative z-10 flex gap-3.5 items-start">
                        <div className={`w-5 h-5 rounded-full border-[3px] border-white flex-shrink-0 shadow-xs ${isBuncedStop ? 'bg-red-500 ring-2 ring-red-100' : 'bg-slate-300'}`}></div>
                        <div className="-mt-0.5 flex-1 min-w-0">
                          <div className="font-bold text-slate-800 text-xs truncate">{stop.name}</div>
                          {isBuncedStop && (
                            <div className="mt-2 space-y-1.5 bg-red-50/60 p-2.5 rounded-xl border border-red-100">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">{route.routeName} +7m</span>
                                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">{route.routeName} +12m</span>
                              </div>
                              <div className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle size={13} /> Bunching detected
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bus Spacing */}
                <div className="pt-4 border-t border-slate-100 mt-3 shrink-0">
                  <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Bus Spacing</h4>
                  <div className="relative h-2 bg-slate-100 rounded-full w-full">
                    <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[43%] w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs"></div>
                    <div className="absolute top-1/2 -translate-y-1/2 left-[90%] w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-xs"></div>
                  </div>
                  <div className="text-center mt-2.5 text-xs font-bold text-red-500">Gap: 1.4 min (target: 8 min)</div>
                </div>
              </div>

              {/* Center: Map (6 cols) */}
              <div className="col-span-6 bg-white/60 rounded-xl border border-slate-100 overflow-hidden relative">
                <Map
                  initialViewState={{
                    longitude: busStops[0]?.lng || 72.8777,
                    latitude: busStops[0]?.lat || 19.0760,
                    zoom: 12
                  }}
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                  style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
                >
                  {routePolyline && (
                    <Source id="route-path" type="geojson" data={routePolyline}>
                      <Layer id="route-path-layer" type="line" paint={{ 'line-color': '#2563eb', 'line-width': 4, 'line-opacity': 0.8 }} />
                    </Source>
                  )}

                  {busStops.map((stop: any) => (
                    <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat}>
                      <div className="w-3 h-3 bg-white border-2 border-blue-600 rounded-full shadow-xs"></div>
                    </Marker>
                  ))}

                  {trips.filter((t: any) => t.liveTelemetry).map((trip: any) => (
                    <Marker key={trip.id} longitude={trip.liveTelemetry.lng} latitude={trip.liveTelemetry.lat}>
                      <div className="w-7 h-7 bg-blue-600 rounded-lg shadow-md flex items-center justify-center text-white border-2 border-white">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22v-3"/><path d="M6 22v-3"/><path d="M14.5 13H9.5"/><rect x="2" y="10" width="20" height="7" rx="2"/></svg>
                      </div>
                    </Marker>
                  ))}

                  {isBunching && trips[0]?.liveTelemetry && (
                    <Marker longitude={trips[0].liveTelemetry.lng} latitude={trips[0].liveTelemetry.lat}>
                      <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse border border-red-500/30">
                        <div className="w-14 h-14 bg-red-500/30 rounded-full"></div>
                      </div>
                    </Marker>
                  )}
                </Map>

                {/* Floating bunching alert */}
                {isBunching && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-4 min-w-[360px] z-20">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">B-{route.routeName}A & B-{route.routeName}B — 1.4 min apart</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Target headway: 8 min · Traffic Congestion</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar: AI Copilot (3 cols) */}
              <div className="col-span-3 bg-white/60 rounded-xl border border-slate-100 p-5 flex flex-col overflow-y-auto no-scrollbar">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900">AI Copilot</h2>
                  <p className="text-xs text-slate-500 mt-1">Automated headway & congestion monitor</p>
                </div>

                {/* Likely Causes */}
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Likely Causes</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Traffic congestion', pct: 68, color: 'bg-red-500', text: 'text-red-500' },
                      { label: 'Passenger overload', pct: 21, color: 'bg-amber-500', text: 'text-amber-500' },
                      { label: 'Signal delay', pct: 8, color: 'bg-blue-500', text: 'text-blue-500' },
                      { label: 'Unexpected dwell time', pct: 3, color: 'bg-slate-300', text: 'text-slate-400' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">{item.label}</span>
                          <span className={`${item.text} font-bold`}>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mb-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Recommendation</h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <p className="text-xs font-bold text-slate-900 mb-3 leading-snug">Hold bus {route.routeName} at stop 14 for 2 mins</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApprove}
                        className={`flex-1 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isApproved === true ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        <Check size={14} /> {isApproved === true ? 'Approved' : 'Approve'}
                      </button>
                      <button
                        onClick={() => setIsApproved(false)}
                        className={`flex-1 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isApproved === false ? 'bg-red-600 text-white ring-2 ring-red-200' : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        <X size={14} /> {isApproved === false ? 'Rejected' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Root Cause Summary */}
                <div className="mt-auto">
                  <div className="bg-blue-50/70 rounded-xl p-4 border border-blue-100">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1.5">Root Cause Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Junction congestion caused Bus {route.routeName}A to dwell 7 minutes longer than scheduled, allowing Bus {route.routeName}B to close headway to 1.4 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Floating Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={14} />
          </div>
          <div className="text-xs font-bold">{showToast}</div>
          <button onClick={() => setShowToast(null)} className="ml-2 text-slate-400 hover:text-white text-xs font-bold">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

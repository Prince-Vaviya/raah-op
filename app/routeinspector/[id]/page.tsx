"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle, Check, X } from "lucide-react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchRouteDetails } from "../../../lib/api";

export default function RouteDetail() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;

  const [route, setRoute] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const handleApprove = () => {
    setIsApproved(true);
    const targetBusId = `Bus ${route?.routeName || routeId}`;
    setShowToast(`Successfully updated to ${targetBusId}`);
    setTimeout(() => {
      setShowToast(null);
    }, 4000);
  };

  const handleReject = () => {
    setIsApproved(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const details = await fetchRouteDetails(routeId);
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
      } catch (e) {
        console.error(e);
      }
    };
    getData();
    
    const interval = setInterval(getData, 5000);
    return () => clearInterval(interval);
  }, [routeId]);

  if (!route) {
    return <div className="min-h-[70vh] flex items-center justify-center text-slate-500 font-medium">Loading route details...</div>;
  }

  const busStops = route.busStops || [];
  const trips = route.trips || [];
  const isBunching = trips.some((t: any) => t.liveTelemetry && t.liveTelemetry.forwardHeadway < 2.0);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-8 font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isBunching ? "Bus Bunching — " : "Monitoring — "} Route {route.routeName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {busStops.length > 0 ? `${busStops[0].name} → ${busStops[busStops.length - 1].name}` : "City Route"} · Live Update
          </p>
        </div>
      </div>

      {/* 3-Column Full Width Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-170px)] min-h-[650px]">
        
        {/* Left Sidebar: Timeline (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Route Timeline</h3>
          
          <div className="flex-1 overflow-y-auto pr-1 relative no-scrollbar">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-200 -z-10"></div>
            
            {busStops.slice(0, 15).map((stop: any, index: number) => {
              const isBuncedStop = isBunching && index === 2;
              
              return (
                <div key={stop.id} className="mb-6 relative z-10 flex gap-3.5 items-start">
                  <div className={`w-6 h-6 rounded-full border-4 border-white flex-shrink-0 shadow-xs ${isBuncedStop ? 'bg-red-500 ring-2 ring-red-100' : 'bg-slate-300'}`}></div>
                  <div className="-mt-0.5 flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-xs truncate">{stop.name}</div>
                    
                    {isBuncedStop && (
                      <div className="mt-2 space-y-1.5 bg-red-50/60 p-2.5 rounded-xl border border-red-100">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            {route.routeName} +7m
                          </span>
                          <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            {route.routeName} +12m
                          </span>
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

          <div className="pt-4 border-t border-slate-100 mt-2 shrink-0">
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

        {/* Center: Map Canvas (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden relative flex flex-col h-full">
          <div className="flex-1 relative w-full h-full">
            <Map
              initialViewState={{
                longitude: busStops[0]?.lng || 72.8777,
                latitude: busStops[0]?.lat || 19.0760,
                zoom: 12
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            >
              {/* Polyline */}
              {routePolyline && (
                <Source id="route-path" type="geojson" data={routePolyline}>
                  <Layer
                    id="route-path-layer"
                    type="line"
                    paint={{
                      'line-color': '#2563eb',
                      'line-width': 4,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>
              )}

              {/* Stops */}
              {busStops.map((stop: any) => (
                <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat}>
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full shadow-xs"></div>
                  </div>
                </Marker>
              ))}

              {/* Live Buses */}
              {trips.filter((t: any) => t.liveTelemetry).map((trip: any) => (
                <Marker key={trip.id} longitude={trip.liveTelemetry.lng} latitude={trip.liveTelemetry.lat}>
                  <div className="w-7 h-7 bg-blue-600 rounded-lg shadow-md flex items-center justify-center text-white border-2 border-white">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22v-3"/><path d="M6 22v-3"/><path d="M14.5 13H9.5"/><rect x="2" y="10" width="20" height="7" rx="2"/></svg>
                  </div>
                </Marker>
              ))}
              
              {/* Bunching Highlight */}
              {isBunching && trips[0]?.liveTelemetry && (
                <Marker longitude={trips[0].liveTelemetry.lng} latitude={trips[0].liveTelemetry.lat}>
                   <div className="w-28 h-28 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse border border-red-500/30">
                     <div className="w-14 h-14 bg-red-500/30 rounded-full"></div>
                   </div>
                </Marker>
              )}
            </Map>
          </div>
          
          {/* Bottom Floating Alert Pill */}
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

        {/* Right Sidebar: AI Copilot (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">AI Copilot</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated headway & congestion monitor</p>
          </div>

          {/* Likely Causes */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Likely Causes</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Traffic congestion</span>
                  <span className="text-red-500 font-bold">68%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{width: '68%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Passenger overload</span>
                  <span className="text-amber-500 font-bold">21%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{width: '21%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Signal delay</span>
                  <span className="text-blue-500 font-bold">8%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{width: '8%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Unexpected dwell time</span>
                  <span className="text-slate-400 font-bold">3%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300 rounded-full" style={{width: '3%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Box */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Recommendation</h4>
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
                  onClick={handleReject}
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

      {/* Floating Toast Popup Banner */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check size={16} />
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

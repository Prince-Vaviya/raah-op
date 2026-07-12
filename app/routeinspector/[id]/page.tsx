"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle, Check, X } from "lucide-react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchRouteDetails, fetchAllStopsGeoJSON, fetchRoutesGeoJSON } from "../../../lib/api";

export default function RouteDetail() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;

  const [route, setRoute] = useState<any>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);

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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  const busStops = route.busStops || [];
  const trips = route.trips || [];
  
  // Calculate a mock bunching event for demonstration (or use real delay if available)
  const isBunching = trips.some((t: any) => t.liveTelemetry && t.liveTelemetry.forwardHeadway < 2.0);

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2">
          <ChevronLeft size={18} /> Back
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {isBunching ? "Bus Bunching — " : "Monitoring — "} Route {route.routeName}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {busStops.length > 0 ? `${busStops[0].name} → ${busStops[busStops.length - 1].name}` : "City Route"} · Live Update
          </p>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Sidebar: Timeline */}
        <div className="w-80 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6">Route Timeline</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 -z-10"></div>
            
            {busStops.slice(0, 15).map((stop: any, index: number) => {
              // Mock a bunching event on the 3rd stop for visual parity with design
              const isBuncedStop = isBunching && index === 2;
              
              return (
                <div key={stop.id} className="mb-8 relative z-10 flex gap-4 items-start">
                  <div className={`w-6 h-6 rounded-full border-4 border-white flex-shrink-0 ${isBuncedStop ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                  <div className="-mt-1">
                    <div className="font-semibold text-slate-700 text-sm">{stop.name}</div>
                    
                    {isBuncedStop && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{route.routeName} +7m</span>
                          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{route.routeName} +12m</span>
                        </div>
                        <div className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <AlertTriangle size={12} /> Bunching detected
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-100 mt-4">
            <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Bus Spacing</h4>
            <div className="relative h-2 bg-slate-100 rounded-full w-full">
              <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[43%] w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
              <div className="absolute top-1/2 -translate-y-1/2 left-[90%] w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
            </div>
            <div className="text-center mt-3 text-xs font-bold text-red-500">Gap: 1.4 min (target: 8 min)</div>
          </div>
        </div>

        {/* Center: Map */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative flex flex-col">
          <div className="flex-1 bg-slate-100 relative">
            <Map
              initialViewState={{
                longitude: busStops[0]?.lng || 72.8777,
                latitude: busStops[0]?.lat || 19.0760,
                zoom: 12
              }}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
              style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
            >


              {/* Specific Route Polyline */}
              {routePolyline && (
                <Source id="route-path" type="geojson" data={routePolyline}>
                  <Layer
                    id="route-path-layer"
                    type="line"
                    paint={{
                      'line-color': route.color || '#3b82f6',
                      'line-width': 4,
                      'line-opacity': 0.8
                    }}
                  />
                </Source>
              )}

              {/* Specific Route Stops */}
              {busStops.map((stop: any) => (
                <Marker key={stop.id} longitude={stop.lng} latitude={stop.lat}>
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-slate-700 bg-white/80 px-1 rounded shadow-sm whitespace-nowrap mb-1">
                      {stop.name}
                    </div>
                    <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
                  </div>
                </Marker>
              ))}

              {/* Live Buses */}
              {trips.filter((t: any) => t.liveTelemetry).map((trip: any) => (
                <Marker key={trip.id} longitude={trip.liveTelemetry.lng} latitude={trip.liveTelemetry.lat}>
                  <div className="relative group">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white border-2 border-white z-20 relative">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 12 10s-6.7.6-8.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22v-3"/><path d="M6 22v-3"/><path d="M14.5 13H9.5"/><rect x="2" y="10" width="20" height="7" rx="2"/></svg>
                    </div>
                  </div>
                </Marker>
              ))}
              
              {/* Mock Bunching Area Overlay (Red Circle) for effect if bunching is happening */}
              {isBunching && trips[0]?.liveTelemetry && (
                <Marker longitude={trips[0].liveTelemetry.lng} latitude={trips[0].liveTelemetry.lat}>
                   <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse border border-red-500/30">
                     <div className="w-16 h-16 bg-red-500/30 rounded-full"></div>
                   </div>
                </Marker>
              )}
            </Map>
          </div>
          
          {/* Bottom Alert Strip */}
          {isBunching && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-lg flex flex-col items-center min-w-[400px]">
              <div className="absolute -top-3 bg-white w-6 h-6 rounded-full shadow border border-slate-100 flex items-center justify-center">
                <X size={12} className="text-red-500" />
              </div>
              <h4 className="font-bold text-blue-600 w-full text-center">B-{route.routeName}A & B-{route.routeName}B — 1.4 min apart</h4>
              <p className="text-sm text-slate-500 text-center leading-tight mt-1">Target headway: 8 min · Traffic Congestion</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: AI Copilot */}
        <div className="w-80 bg-blue-50/50 rounded-[2rem] border border-blue-100 shadow-sm p-6 flex flex-col relative h-full">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Ai Copilot</h2>
              <p className="text-sm text-slate-500 font-medium">Always watching out for you</p>
            </div>
            <img src="/mascot-bird-route-inspector.png" alt="Mascot" className="w-24 h-auto -mt-4 -mr-2 object-contain" />
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Likely Causes</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Traffic congestion</span>
                  <span className="text-red-500">68%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{width: '68%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Passenger overload</span>
                  <span className="text-amber-500">21%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{width: '21%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Signal delay</span>
                  <span className="text-blue-500">8%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{width: '8%'}}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Unexpected dwell time</span>
                  <span className="text-slate-400">3%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-300" style={{width: '3%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommendation</h4>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-sm font-bold text-slate-800 mb-4">Hold bus {route.routeName} at stop 14 for 2 mins</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors">
                  Approve <Check size={14} />
                </button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors">
                  Reject <X size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Root Cause Summary</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Junction congestion caused Bus {route.routeName}A to dwell 7 minutes longer than scheduled, allowing Bus {route.routeName}B to close the gap from 8 minutes to 1.4 minutes. The bunching is compounding due to shared passenger load.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

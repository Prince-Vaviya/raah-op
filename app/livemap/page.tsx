"use client";
import React, { useState, useEffect } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Filter, Layers, Crosshair, AlignJustify, AlertTriangle, Train, Building2, MessageSquare, X, Send } from "lucide-react";
import { fetchRoutesGeoJSON, fetchLiveTelemetryGeoJSON, fetchAllStopsGeoJSON, API_URL } from "../../lib/api";

const initialRoutesData = {
  type: "FeatureCollection",
  features: []
};

export default function LiveMap() {
  const [activeFilters, setActiveFilters] = useState({
    routes: true,
    stops: true,
    traffic: false,
    weather: false
  });

  const [routesData, setRoutesData] = useState<any>(initialRoutesData);
  const [stopsData, setStopsData] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [stopVolumes, setStopVolumes] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [activePanelTab, setActivePanelTab] = useState<'DETAILS' | 'CHAT'>('DETAILS');
  const [newMessage, setNewMessage] = useState("");
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastCenter, setBroadcastCenter] = useState<{lat: number, lng: number} | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");


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
        const token = localStorage.getItem('token') || '';
        const data = await fetchLiveTelemetryGeoJSON();
        if (data && data.features) {
          setBuses(data.features.map((f: any) => ({
            trip_id: f.properties.trip_id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            forward_headway: f.properties.headway
          })));
        }

        const incidentsRes = await fetch(`${API_URL}/incidents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (incidentsRes.ok) {
          const incData = await incidentsRes.json();
          setIncidents(incData);
        }

        const heatmapRes = await fetch(`${API_URL}/routes/stops/heatmap`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (heatmapRes.ok) {
          const hmData = await heatmapRes.json();
          setStopVolumes(hmData);
        }
      } catch (e) {
        console.error("Failed to fetch buses/incidents/heatmap", e);
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
    return () => {
      clearInterval(tripInterval);
    };
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
      // Will be picked up by the next poll
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const sendCommand = async (type: 'HOLD' | 'REROUTE') => {
    if (!selectedTripId) return;
    try {
      const token = localStorage.getItem('token') || '';
      await fetch(`${API_URL}/commands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trip_id: selectedTripId,
          type: type,
          duration_sec: 300, // default 5 mins
          reason: "Operator initiated from Live Map"
        })
      });
      alert(`Command ${type} sent to conductor!`);
    } catch (e) {
      console.error("Failed to send command", e);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastCenter || !broadcastMessage.trim()) return;
    try {
      const token = localStorage.getItem('token') || '';
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
      alert(`Broadcast sent to zone!`);
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

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-slate-50">
      <Map
        initialViewState={{
          longitude: 72.8777,
          latitude: 19.0760,
          zoom: 11
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        mapLib={maplibregl}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
        cursor={broadcastMode ? 'crosshair' : 'grab'}
      >
        {activeFilters.routes && (
          <Source id="routes" type="geojson" data={routesData as any}>
            <Layer 
              id="route-line" 
              type="line" 
              paint={{
                'line-color': ['get', 'color'],
                'line-width': 4,
                'line-opacity': 0.8
              }} 
            />
          </Source>
        )}

        {activeFilters.stops && stopsData && stopsData.features && stopsData.features.map((feature: any) => (
          <Marker 
            key={`stop-${feature.properties.id}`} 
            longitude={feature.geometry.coordinates[0]} 
            latitude={feature.geometry.coordinates[1]}
          >
            <div className="flex flex-col items-center group">
              <div className="text-[10px] font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap mb-1 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all z-10 relative">
                {feature.properties.name}
              </div>
              <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-sm z-0 relative"></div>
            </div>
          </Marker>
        ))}

        {buses.map((bus) => {
          const lng = bus.lng || 72.8777;
          const lat = bus.lat || 19.0760;
          const isDelayed = bus.forward_headway < 200;

          return (
            <Marker key={bus.trip_id} longitude={lng} latitude={lat} anchor="center">
              <div 
                className="relative group cursor-pointer"
                onClick={() => setSelectedTripId(bus.trip_id)}
              >
                {isDelayed && (
                  <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping z-0 pointer-events-none"></div>
                )}
                <div className={`relative z-10 w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isDelayed ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-blue-500 text-white shadow-blue-500/30'}`}>
                  <Train size={24} />
                  {isDelayed && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 p-1 rounded-full shadow-sm">
                      <AlertTriangle size={12} />
                    </div>
                  )}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Incidents Layer */}
        {incidents.map((incident: any) => (
          <Marker key={incident.id} longitude={incident.lng} latitude={incident.lat}>
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

        {/* Heatmap Layer */}
        {stopVolumes.filter((s: any) => s.passengersWaiting > 15).map((stop: any) => (
          <Marker key={`hm-${stop.id}`} longitude={stop.lng} latitude={stop.lat}>
            <div className="flex flex-col items-center">
              <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg animate-bounce cursor-pointer hover:bg-red-600 transition-colors"
                   onClick={(e) => { e.stopPropagation(); alert(`Ghost Bus Dispatched to ${stop.name}!`); }}>
                {stop.passengersWaiting} waiting! Dispatch Ghost Bus 👻
              </div>
            </div>
          </Marker>
        ))}

        {broadcastCenter && (
          <Marker longitude={broadcastCenter.lng} latitude={broadcastCenter.lat}>
            <div className="w-64 h-64 bg-amber-500/20 rounded-full border-2 border-amber-500/50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-4 h-4 bg-amber-600 rounded-full animate-pulse shadow-lg"></div>
            </div>
          </Marker>
        )}
      </Map>

      <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md rounded-full shadow-lg flex items-center p-2 gap-2 border border-slate-100">
        <div className="px-3 text-slate-500">
          <Filter size={20} />
        </div>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, routes: !prev.routes }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors cursor-pointer ${activeFilters.routes ? 'bg-blue-500 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveFilters(prev => ({ ...prev, stops: !prev.stops }))}
          className={`px-5 py-2 text-sm rounded-full font-medium transition-colors cursor-pointer ${activeFilters.stops ? 'bg-blue-500 text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
        >
          Stops
        </button>
      </div>

      {/* Broadcast Tools */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-2 z-40">
        <button
          onClick={() => {
            setBroadcastMode(!broadcastMode);
            if (broadcastMode) setBroadcastCenter(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg transition-colors border ${broadcastMode ? 'bg-amber-500 text-white border-amber-600' : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'}`}
        >
          <Crosshair size={18} />
          {broadcastMode ? 'Cancel Zone' : 'Draw Broadcast Zone'}
        </button>

        {broadcastMode && broadcastCenter && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 min-w-[300px] border border-amber-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-500" />
              Zone Selected
            </h3>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-2 text-sm mb-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              placeholder="e.g. Sudden VIP movement, expect delays..."
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
            <button
              onClick={sendBroadcast}
              disabled={!broadcastMessage.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={16} />
              Broadcast to Conductors
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 min-w-[240px] border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 tracking-widest mb-5 uppercase">Status</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#10b981] shadow-sm"></span>
            <span className="text-slate-700 font-medium text-sm">On Time</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full bg-[#f59e0b] shadow-sm"></span>
            <span className="text-slate-700 font-medium text-sm">Delayed / Crowded</span>
          </div>
        </div>
      </div>

      {/* Before/After Impact Metrics Widget */}
      <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-emerald-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <Layers size={24} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Impact (Today)</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">14</span>
            <span className="text-sm font-medium text-slate-600">bunching events prevented</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mt-1">
            ↓ 22% avg wait time
          </div>
        </div>
      </div>

      {selectedTripId && (
        <div className="absolute top-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[600px] overflow-hidden z-50">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-lg">Trip Details & Actions</h3>
              <p className="text-blue-100 text-xs mt-1">Bus {selectedTripDetails?.busNumber || selectedTripId.slice(0, 8)} • Route {selectedTripDetails?.route?.routeName}</p>
            </div>
            <button onClick={() => setSelectedTripId(null)} className="p-1 hover:bg-blue-700 rounded-full transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex border-b border-slate-200">
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activePanelTab === 'DETAILS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setActivePanelTab('DETAILS')}
            >
              Trip Status
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${activePanelTab === 'CHAT' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setActivePanelTab('CHAT')}
            >
              Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 relative">
            {activePanelTab === 'DETAILS' ? (
              <div className="p-5 space-y-6">
                
                {/* Problem Context */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Problem Context</h4>
                  
                  <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-red-500"><AlertTriangle size={18} /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Reason for Bunching</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedTripDetails?.bunchingReason || "No specific reason reported by system."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-400"></div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-slate-400"><AlignJustify size={18} /></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Conductor's Notes</p>
                        <p className="text-sm text-slate-600 mt-1 italic">"{selectedTripDetails?.conductorNotes || "No notes provided by conductor."}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch Actions */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Dispatch Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => sendCommand('HOLD')}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-colors border border-amber-200 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <span>Hold Bus</span>
                      <span className="text-[10px] font-normal opacity-80">Instruct to wait</span>
                    </button>
                    
                    <button 
                      onClick={() => sendCommand('REROUTE')}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-colors border border-purple-200 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <span>Re-route</span>
                      <span className="text-[10px] font-normal opacity-80">Send alternate path</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-center text-slate-400 text-sm mt-10">No messages yet.</p>
                  )}
                  {chatMessages.map(msg => {
                    const isMine = msg.senderRole === 'OPERATOR';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMine ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                  <input 
                    type="text" 
                    placeholder="Message conductor..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 bg-slate-100 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                  >
                    <Send size={16} />
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

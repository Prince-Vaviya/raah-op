"use client";
import React, { useState, useEffect } from "react";
import Map, { Source, Layer, Marker } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Filter, Layers, Crosshair, AlignJustify, AlertTriangle, Train, Building2, MessageSquare, X, Send } from "lucide-react";
import { fetchRoutesGeoJSON, fetchLiveTelemetryGeoJSON, API_URL } from "../../lib/api";

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
  const [stations, setStations] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await fetchRoutesGeoJSON();
        if (data) setRoutesData(data);
      } catch (e) {
        console.error("Failed to fetch map data", e);
      }
    };
    fetchMapData();

    const fetchBuses = async () => {
      try {
        const data = await fetchLiveTelemetryGeoJSON();
        if (data && data.features) {
          setBuses(data.features.map((f: any) => ({
            trip_id: f.properties.trip_id,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            forward_headway: f.properties.headway
          })));
        }
      } catch (e) {
        console.error("Failed to fetch buses", e);
      }
    };
    fetchBuses();

    const interval = setInterval(() => {
      fetchBuses();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedTripId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const res = await fetch(`${API_URL}/chat/${selectedTripId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    };
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
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

      {selectedTripId && (
        <div className="absolute top-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[500px] overflow-hidden z-50">
          <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold">Contact Conductor</h3>
              <p className="text-blue-100 text-xs">Trip: {selectedTripId.slice(0, 8)}</p>
            </div>
            <button onClick={() => setSelectedTripId(null)} className="p-1 hover:bg-blue-700 rounded-full transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
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
  );
}

"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Search, ChevronRight, Bus, TrendingUp } from "lucide-react";

export default function RouteInspector() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [routes, setRoutes] = useState<any[]>([]);
  const [routeDetails, setRouteDetails] = useState<any>(null);

  React.useEffect(() => {
    if (!selectedRoute) return;
    const getDetails = async () => {
      try {
        const { fetchRouteDetails } = await import('@/lib/api');
        const data = await fetchRouteDetails(selectedRoute.toString());
        setRouteDetails(data);
      } catch (e) {
        console.error(e);
      }
    };
    getDetails();
    const interval = setInterval(getDetails, 5000);
    return () => clearInterval(interval);
  }, [selectedRoute]);

  React.useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const { fetchRoutes } = await import('@/lib/api');
        const routeData = await fetchRoutes();
        
        if (routeData) {
          const mapped = routeData.map((r: any) => {
            const isHealthy = r.isHealthy;
            return {
              id: r.routeName || r.id,
              realId: r.id,
              title: r.routeName || `Route`,
              path: 'City Route',
              status: isHealthy ? 'Operational' : 'Delayed',
              color: isHealthy ? 'bg-blue-500' : 'bg-amber-500',
              statusColor: isHealthy ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-50',
              statusDot: isHealthy ? 'bg-emerald-500' : 'bg-amber-500',
              buses: r.buses,
              headway: r.headway,
              delay: isHealthy ? `+${r.delay}` : `+${r.delay || 9.4}`,
              crowding: r.crowding || 40,
              score: r.score,
              scoreColor: isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
            };
          });
          setRoutes(mapped);
          if (mapped.length > 0) setSelectedRoute(mapped[0].realId);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoutesData();
  }, []);

  const filteredRoutes = routes.filter(route => 
    route.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
    route.id.toString().includes(searchQuery)
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const paginatedRoutes = filteredRoutes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-blue-100 to-blue-50 rounded-b-[4rem] -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Routes</h1>
          <p className="text-slate-600 mt-1 font-medium">{filteredRoutes.length} routes</p>
          
          <div className="relative w-full max-w-md mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search routes by name, number, or path..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Comparison Dashboard (Expands when route selected) */}
      {selectedRoute && (
        <div className="bg-white rounded-[2rem] shadow-lg p-8 border border-slate-100 mb-12">
          <div className="flex gap-8">
            {(() => {
              const route = routes.find(r => r.realId === selectedRoute) || routes[0];
              if (!route) return null;
              return (
                <>
                  {/* With Raah */}
                  <div className="flex-1 bg-slate-50/50 rounded-3xl p-8 border border-slate-100 relative">
                    <div className="absolute -top-4 left-8 bg-blue-100 text-blue-700 font-bold px-6 py-2 rounded-full shadow-sm">With Raah</div>

                    {/* Timeline */}
                    <div className="mt-8 mb-4 relative px-4">
                      <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                      <div className="flex justify-between relative z-10">
                        {routeDetails ? routeDetails.busStops.slice(0, 6).map((stop: any, i: number) => {
                          // Find buses that are roughly around this stop's progress
                          const busHere = routeDetails.trips && i < routeDetails.trips.length ? routeDetails.trips[i] : null;
                          return (
                            <div key={stop.id} className="flex flex-col items-center gap-3 relative">
                              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                                <Bus size={16} />
                              </div>
                              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={stop.name}>{stop.name.split(' ')[0]}</span>
                            </div>
                          );
                        }) : <div className="text-sm text-slate-400">Loading stops...</div>}
                      </div>
                    </div>

                    <div className="text-center mb-8 text-sm text-slate-500 font-medium italic leading-relaxed py-1">
                      Buses are evenly spaced, eliminating long waits.
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <div className="bg-blue-50 p-3 rounded-2xl flex flex-col h-full">
                        <div className="text-xs text-blue-600/70 font-semibold mb-2">Avg Wait Time</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-blue-700">{route.headway} min</div>
                          <div className="text-xs text-blue-600 mt-1 whitespace-nowrap flex items-center">Stable <TrendingUp size={12} className="ml-1" /></div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-2xl flex flex-col h-full">
                        <div className="text-xs text-blue-600/70 font-semibold mb-2">Reliability</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-blue-700">{route.score}%</div>
                          <div className="text-xs text-blue-600 mt-1 whitespace-nowrap">{route.score >= 80 ? 'Excellent ✓' : 'Good ✓'}</div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-2xl flex flex-col h-full">
                        <div className="text-xs text-blue-600/70 font-semibold mb-2">Bunching Events</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-blue-700">{Math.floor(route.delay / 5)}</div>
                          <div className="text-xs text-blue-600 mt-1 whitespace-nowrap">Controlled ✓</div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-2xl flex flex-col h-full">
                        <div className="text-xs text-blue-600/70 font-semibold mb-2">Passenger Complaints</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-blue-700">Low</div>
                          <div className="text-xs text-blue-600 mt-1 whitespace-nowrap">Minimal ✓</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <span className="font-bold text-slate-600">Passenger Served</span>
                      <span className="text-2xl font-black text-blue-600">{route.buses * 42}</span>
                    </div>
                  </div>

                  {/* Without Raah */}
                  <div className="flex-1 rounded-3xl p-8 border border-slate-100 relative opacity-90">
                    <div className="absolute -top-4 right-8 bg-slate-100 text-slate-600 font-bold px-6 py-2 rounded-full shadow-sm">Without Raah</div>

                    {/* Timeline */}
                    <div className="mt-8 mb-4 relative px-4">
                      <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-200 -translate-y-1/2 rounded-full"></div>
                      <div className="flex justify-between relative z-10">
                        {routeDetails ? routeDetails.busStops.slice(0, 6).map((stop: any, i: number) => (
                          <div key={stop.id} className="flex flex-col items-center gap-3 relative">
                            <div className="w-4 h-4 rounded-full bg-slate-400 shadow-sm mt-2"></div>

                            {/* Simulate Bunching */}
                            {i === 1 && (
                              <div className="absolute -top-8 flex gap-1">
                                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Bus size={14} /></div>
                                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Bus size={14} /></div>
                                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Bus size={14} /></div>
                              </div>
                            )}
                            {i === 3 && (
                              <div className="absolute -top-8 flex gap-1">
                                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Bus size={14} /></div>
                                <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"><Bus size={14} /></div>
                              </div>
                            )}

                            <span className="text-xs font-semibold text-slate-500 mt-3 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={stop.name}>{stop.name.split(' ')[0]}</span>
                          </div>
                        )) : <div className="text-sm text-slate-400">Loading stops...</div>}
                      </div>
                    </div>

                    <div className="text-center mb-8 text-sm text-slate-500 font-medium italic leading-relaxed py-1">
                      Buses bunch together, causing severe delays.
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col h-full">
                        <div className="text-xs text-red-600/70 font-semibold mb-2">Avg Wait Time</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-red-700">{Math.floor(route.headway * 2.5)} min</div>
                          <div className="text-xs text-red-600 mt-1 whitespace-nowrap">↑ Increasing</div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col h-full">
                        <div className="text-xs text-red-600/70 font-semibold mb-2">Reliability</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-red-700">{Math.max(10, route.score - 34)}%</div>
                          <div className="text-xs text-red-600 mt-1 whitespace-nowrap">↓ Declining</div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col h-full">
                        <div className="text-xs text-red-600/70 font-semibold mb-2">Bunching Events</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-red-700">{Math.floor(route.delay / 5) + 12}</div>
                          <div className="text-xs text-red-600 mt-1 whitespace-nowrap">▲ Critical</div>
                        </div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col h-full">
                        <div className="text-xs text-red-600/70 font-semibold mb-2">Passenger Complaints</div>
                        <div className="mt-auto">
                          <div className="text-xl font-black text-red-700">High</div>
                          <div className="text-xs text-red-600 mt-1 whitespace-nowrap">Severe</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-6 py-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                      <span className="font-bold text-red-800/60">Passenger Served</span>
                      <span className="text-2xl font-black text-red-600">{Math.floor(route.buses * 42 * 0.4)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Bottom Global Status Bars */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between gap-12 px-8">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-500">Traffic Congestion</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">30%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-red-400 w-1/3"></div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-500">Passenger Demand</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Medium</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 w-1/2"></div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-500">Time of the day</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">9 AM</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-emerald-400 via-emerald-400 to-red-400 w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Routes List */}
      <div className="space-y-4 mb-12">
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm">
            No routes found matching "{searchQuery}"
          </div>
        ) : (
          paginatedRoutes.map((route) => (
            <div
            key={route.realId}
            onClick={() => setSelectedRoute(route.realId)}
            className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 ${selectedRoute === route.realId ? 'border-blue-400' : 'border-transparent'}`}
          >
            <div className="flex items-center justify-between">
              {/* Left: Icon & Title */}
              <div className="flex items-center gap-6 w-1/3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner ${route.color}`} style={{ borderBottomRightRadius: 4 }}>
                  {route.id}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{route.title}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{route.path}</p>
                </div>
              </div>

              {/* Status */}
              <div className="w-1/6">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${route.statusColor}`}>
                  <span className={`w-2 h-2 rounded-full ${route.statusDot}`}></span>
                  {route.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-8 w-1/3 justify-between">
                <div className="text-center">
                  <div className="font-bold text-slate-900 text-lg">{route.buses}</div>
                  <div className="text-xs text-slate-500">Buses</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-900 text-lg">{route.headway}<span className="text-sm">m</span></div>
                  <div className="text-xs text-slate-500">Headway</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-900 text-lg">{route.delay}<span className="text-sm">m</span></div>
                  <div className="text-xs text-slate-500">Avg Delay</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-slate-900 text-lg">{route.crowding}%</div>
                  <div className="text-xs text-slate-500">Crowding</div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4 w-1/6 justify-end">
                <div className="flex flex-col items-end gap-1 w-full max-w-[120px]">
                  <span className="text-xs text-slate-400 font-medium">Health Score</span>
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${route.scoreColor}`} style={{ width: `${route.score}%` }}></div>
                    </div>
                    <span className={`font-bold ${route.statusColor.split(' ')[0]}`}>{route.score}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 items-center">
                  <ChevronRight className="text-slate-300" />
                  <Link href={`/routeinspector/${route.realId}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors shadow-sm font-bold" onClick={(e) => e.stopPropagation()}>
                    View Map
                  </Link>
                </div>

              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mb-12">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 shadow-sm font-medium text-slate-700 cursor-pointer"
          >
            Previous
          </button>
          <span className="text-slate-600 font-medium">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 shadow-sm font-medium text-slate-700 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

          </div>
  );
}

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

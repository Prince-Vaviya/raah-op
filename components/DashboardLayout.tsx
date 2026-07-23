"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map as MapIcon, Route, Lightbulb, Bell, CloudRain, Clock, Wrench, Users } from "lucide-react";
import { useData } from "@/providers/DataProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { activities } = useData();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [metrics] = useState({
    temperature: 29
  });

  const getNavItemClass = (path: string) => {
    const isActive = pathname === path;
    const baseClass = "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap";
    return isActive
      ? `${baseClass} bg-blue-50 text-blue-600 shadow-sm`
      : `${baseClass} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
  };

  useEffect(() => {
    if (pathname !== '/login') {
      const token = localStorage.getItem('operator_token');
      if (!token) {
        window.location.href = '/login';
      }
    }
  }, [pathname]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f4f7fb] text-slate-800 font-sans overflow-hidden">
      {/* Floating Navbar */}
      <div className="w-full px-6 pt-5 shrink-0 z-30">
        <header className="h-20 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl flex items-center justify-between px-7 shadow-md shadow-slate-200/40">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3.5 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/raah_logo.svg" alt="RAAH Logo" className="w-9 h-9 shrink-0 object-contain" />
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                RAAH
              </span>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="flex items-center gap-2 overflow-x-auto mx-auto px-4 no-scrollbar">
            <Link href="/" className={getNavItemClass("/")}>
              <LayoutDashboard size={19} />
              <span>Mission Control</span>
            </Link>
            <Link href="/livemap" className={getNavItemClass("/livemap")}>
              <MapIcon size={19} />
              <span>Live Map</span>
            </Link>
            <Link href="/routeinspector" className={getNavItemClass("/routeinspector")}>
              <Route size={19} />
              <span>Route Inspector</span>
            </Link>
            <Link href="/insights" className={getNavItemClass("/insights")}>
              <Lightbulb size={19} />
              <span>Insights</span>
            </Link>
            <Link href="/maintenance" className={getNavItemClass("/maintenance")}>
              <Wrench size={19} />
              <span>Depot & Maintenance</span>
            </Link>
            <Link href="/alerts" className={getNavItemClass("/alerts")}>
              <Bell size={19} />
              <span>Alerts</span>
              {(activities?.length || 0) > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {activities.length}
                </span>
              )}
            </Link>
            <Link href="/conductors" className={getNavItemClass("/conductors")}>
              <Users size={19} />
              <span>Conductors</span>
            </Link>
          </nav>

          {/* Right: Operator Profile */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-xs">
                <img src="/avatar_operator.svg" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-xs text-slate-900 leading-tight">Arjun Singh</div>
              <div className="text-[10px] font-medium text-slate-500">Operator</div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className={`flex-1 relative ${pathname === '/livemap' ? 'overflow-hidden p-4' : 'p-6 md:p-8 overflow-y-auto'}`}>
          <div className={pathname === '/livemap' ? 'w-full h-full rounded-2xl overflow-hidden shadow-xs' : 'max-w-7xl mx-auto space-y-6'}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

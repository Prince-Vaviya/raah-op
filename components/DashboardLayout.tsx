"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map as MapIcon, Route, Lightbulb, Bell, Search, CloudRain, Clock, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [metrics] = useState({
    temperature: 29
  });

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const baseClass = `flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg font-medium transition-all group relative`;
    return isActive
      ? `${baseClass} bg-blue-50 text-blue-700`
      : `${baseClass} text-slate-600 hover:bg-slate-50 hover:text-slate-900`;
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7fb] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-all duration-300 overflow-visible z-20`}>
        <div>
          <Link href="/" className="block p-5 group cursor-pointer hover:bg-slate-50 transition-colors">
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
              <img src="/raah_logo.svg" alt="RAAH Logo" className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-24 h-24'} shrink-0 object-contain transition-all duration-300`} />
              {!isSidebarCollapsed && <h1 className="text-3xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">RAAH</h1>}
            </div>
            {!isSidebarCollapsed && <p className="text-xs text-slate-500 mt-2 whitespace-nowrap">Keeping Mumbai Moving</p>}
          </Link>
          <nav className="px-4 space-y-2 mt-2">
            <Link href="/" className={getLinkClass("/")}>
              <LayoutDashboard size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span>Mission Control</span>}
            </Link>
            <Link href="/livemap" className={getLinkClass("/livemap")}>
              <MapIcon size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span>Live Map</span>}
            </Link>
            <Link href="/routeinspector" className={getLinkClass("/routeinspector")}>
              <Route size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span>Route Inspector</span>}
            </Link>
            <Link href="/insights" className={getLinkClass("/insights")}>
              <Lightbulb size={20} className="shrink-0" />
              {!isSidebarCollapsed && <span>Insights</span>}
            </Link>
            <Link href="/alerts" className={getLinkClass("/alerts") + " " + (isSidebarCollapsed ? 'justify-center' : 'justify-between')}>
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <Bell size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span>Alerts</span>}
              </div>
              {!isSidebarCollapsed && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shrink-0">2</span>}
              {isSidebarCollapsed && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>}
            </Link>
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className={`bg-blue-50 rounded-xl ${isSidebarCollapsed ? 'p-2' : 'p-4'} text-center transition-all overflow-hidden`}>
            <div className={`${isSidebarCollapsed ? 'w-10 h-10' : 'w-16 h-16'} mx-auto ${!isSidebarCollapsed ? 'mb-2' : ''} flex items-center justify-center transition-all shrink-0`}>
              <img src="/mascot_bird_megaphone Background Removed.svg" alt="Mascot" className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <p className="text-sm font-semibold text-blue-700">Hello Operator!</p>
                <p className="text-xs text-slate-600 mt-1 text-wrap">Let's make Mumbai move smarter today!</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6 flex-1 mr-8">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 whitespace-nowrap capitalize">
              {pathname === '/' ? 'Mission Control' : pathname.replace('/', '').replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search routes, buses, or alerts..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <CloudRain className="text-slate-400" size={18} />
              <div className="text-sm">
                <span className="font-semibold text-slate-700">{metrics.temperature}°C</span>
                <span className="text-slate-500 ml-1">Partly cloudy</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="text-slate-400" size={18} />
              <div className="text-sm text-right">
                <div className="font-semibold text-slate-700">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}</div>
                <div className="text-xs text-slate-500">{currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <div className="relative">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden">
                  <img src="/avatar_operator.svg" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">Arjun Singh</div>
                <div className="text-xs text-slate-500">Operator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className={`flex-1 overflow-hidden relative ${pathname === '/livemap' ? '' : 'p-8 overflow-auto'}`}>
          <div className={pathname === '/livemap' ? 'w-full h-full' : 'max-w-7xl mx-auto space-y-6'}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

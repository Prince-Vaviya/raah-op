"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map as MapIcon, Route, Bell, Wrench, Users } from "lucide-react";
import { useData } from "@/providers/DataProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { activities } = useData();
  const pathname = usePathname();
  
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard, isExact: true },
    { href: '/livemap', label: 'Live Map', icon: MapIcon },
    { href: '/routeinspector', label: 'Route Inspector', icon: Route },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/alerts', label: 'Alerts', icon: Bell, badge: activities?.length || 0 },
    { href: '/conductors', label: 'Conductors', icon: Users },
  ];

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeIndex = navItems.findIndex(item => 
        item.isExact ? pathname === item.href : pathname.startsWith(item.href)
      );

      if (activeIndex !== -1) {
        const activeLink = navRef.current.children[activeIndex + 1] as HTMLElement; // +1 to skip absolute indicator
        if (activeLink) {
          setIndicatorStyle({
            left: activeLink.offsetLeft,
            width: activeLink.offsetWidth,
            opacity: 1
          });
        }
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [pathname, activities]);

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
    <div className="flex flex-col h-screen w-full bg-linear-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800 font-sans overflow-hidden relative">
      {/* Background Ambient Mesh Light Blur */}
      <div className="absolute bottom-0 right-1/4 w-150 h-150 bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Floating Liquid Glass Overlay Header with Top Blur Mask */}
      <div className="absolute top-0 left-0 right-0 w-full shrink-0 z-40 pointer-events-none">
        {/* Top Gap Blur Shield */}
        <div className="h-6 w-full bg-slate-100/40 backdrop-blur-md"></div>

        <div className="px-6">
          {/* Main Liquid Glass Capsule Bar */}
          <header className="h-21 bg-linear-to-r from-white/60 via-blue-50/40 to-white/60 backdrop-blur-2xl border border-white/90 rounded-4xl flex items-center justify-between px-6 shadow-[0_5px_50px_0_rgba(59,130,246,0.18),inset_0_2px_4px_0_rgba(255,255,255,0.9),inset_0_-2px_4px_0_rgba(255,255,255,0.4)] backdrop-saturate-200 relative overflow-hidden pointer-events-auto transition-all">
            
            {/* Top Light Reflective Specular Rim */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-white to-transparent opacity-95"></div>

            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <Link href="/" className="flex items-center gap-2.5 group">
                <img src="/raah_logo.svg" alt="RAAH Logo" className="w-6 h-6 shrink-0 object-contain drop-shadow-xs" />
                <span className="text-sm font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  RAAH
                </span>
              </Link>
            </div>

            {/* Center: Navigation Bar with Liquid Sliding Pill */}
            <div 
              ref={navRef}
              className="relative z-10 flex items-center gap-1.5 px-2 py-2 mx-auto"
            >
              {/* Dynamic Sliding Vibrant Blue Active Pill */}
              <div
                className="absolute top-1 bottom-1 bg-blue-600 rounded-full transition-all duration-300 ease-out shadow-[0_4px_14px_0_rgba(37,99,235,0.45)] border border-blue-400/30"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity
                }}
              />

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isExact ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'text-white drop-shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
                    }`}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold transition-all ${
                        isActive 
                          ? 'bg-red-500 text-white shadow-xs' 
                          : 'bg-red-500 text-white shadow-xs'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Operator Profile Capsule */}
            <div className="flex items-center gap-2.5 shrink-0 relative z-10 pl-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-white/90 shadow-xs ring-2 ring-blue-500/20">
                  <img src="/avatar_operator.svg" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"></span>
              </div>
              <div className="hidden md:block">
                <div className="font-bold text-xs text-slate-900 leading-tight">Arjun Singh</div>
                <div className="text-[10px] font-semibold text-slate-500">Operator</div>
              </div>
            </div>

          </header>
        </div>
      </div>

      {/* Main Content Scroll Area - Passes under Floating Navbar */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <div className={`flex-1 relative ${pathname === '/livemap' ? 'overflow-hidden p-4 pt-28' : 'px-6 md:px-8 pb-8 pt-28 overflow-y-auto'}`}>
          <div className={pathname === '/livemap' ? 'w-full h-full rounded-2xl overflow-hidden shadow-xs' : 'max-w-7xl mx-auto space-y-6'}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

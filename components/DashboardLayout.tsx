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

          {/* Center: Navigation Links with Dynamic Sliding Indicator */}
          <div 
            ref={navRef}
            className="relative flex items-center gap-1 p-1.5 rounded-xl mx-auto"
          >
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-blue-600 rounded-lg transition-all duration-300 ease-out"
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
                  className={`relative z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`ml-0.5 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

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

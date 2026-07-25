"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sun, 
  Moon, 
  SunMedium,
  ChevronDown,
  UserCheck,
  Building2,
  Wrench,
  Users
} from "lucide-react";
import { useData } from "@/providers/DataProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { activities, metrics } = useData();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isOpsOpen, setIsOpsOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { href: '/livemap', label: 'Overview', isExact: true },
    { href: '/routeinspector', label: 'Routes' },
    { href: '/alerts', label: 'Alerts', badge: activities?.length || 0 },
    { href: '/insights', label: 'Insights' },
    { href: '/reports', label: 'Reports' },
  ];

  const opsItems = [
    { href: '/conductors', label: 'Conductors', icon: UserCheck },
    { href: '/contractors', label: 'Contractors', icon: Users },
    { href: '/depots', label: 'Depots', icon: Building2 },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  ];

  const isOpsActive = opsItems.some(item => pathname.startsWith(item.href));

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpsOpen(false);
  }, [pathname]);

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString('en-US', { month: 'short' });
      
      setCurrentTime(timeStr);
      setCurrentDate(`${dayName}, ${dayNum} ${monthName}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`flex flex-col h-screen w-full font-sans overflow-hidden relative ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-800'}`}>
      
      {/* Floating Glassmorphic Header Capsule */}
      <div className="absolute top-4 left-0 right-0 w-full z-50 pointer-events-none px-6 max-w-7xl mx-auto">
        <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/80 dark:border-slate-800/80 rounded-full flex items-center justify-between px-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] pointer-events-auto transition-all">
          
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/livemap" className="flex items-center gap-2.5 group">
              <img 
                src="/raah_logo.svg" 
                alt="Raah Logo" 
                className="w-7 h-7 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className="flex flex-col justify-center leading-none">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                  Raah
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Mumbai
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Glass Nav Pills */}
          <div 
            ref={navRef}
            className="flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-md p-1.5 rounded-full border border-white/40 dark:border-slate-700/50"
          >
            {navItems.map((item) => {
              const isActive = item.isExact 
                ? (pathname === item.href || pathname === '/') 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.label === 'Alerts' && (item.badge ?? 0) > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </Link>
              );
            })}

            {/* Operations Dropdown Pill */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpsOpen(!isOpsOpen)}
                onMouseEnter={() => setIsOpsOpen(true)}
                className={`relative flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isOpsActive || isOpsOpen
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Operations</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isOpsOpen && (
                <div 
                  onMouseLeave={() => setIsOpsOpen(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/90 dark:border-slate-800/90 rounded-2xl p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2"
                >
                  {opsItems.map((subItem) => {
                    const IconComponent = subItem.icon;
                    const isSubActive = pathname.startsWith(subItem.href);

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSubActive
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <IconComponent size={14} className={isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dark Mode / Theme Circle Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center ml-1 shadow-sm hover:scale-105 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} className="fill-current" />}
            </button>
          </div>

          {/* Right: Weather, Live Time & Profile Avatar */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Weather Pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 px-3 py-1.5 rounded-full border border-white/60 dark:border-slate-700/50 backdrop-blur-sm">
              <SunMedium size={16} className="text-amber-500" />
              <span className="font-bold text-slate-900 dark:text-white">{metrics.temperature || 29}°</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Haze</span>
            </div>

            {/* Time & Date */}
            <div className="hidden md:flex flex-col text-right leading-tight">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                {currentTime || "19:45"}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {currentDate || "Tue, 21 Jul"}
              </span>
            </div>

            {/* Profile Badge (AK) */}
            <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xs font-black tracking-wider shadow-sm ring-2 ring-white dark:ring-slate-800 cursor-pointer">
              AK
            </div>
          </div>

        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <div className={`flex-1 relative ${
          (pathname === '/livemap' || pathname === '/' || pathname.startsWith('/routeinspector')) 
            ? 'overflow-hidden p-0' 
            : 'px-6 md:px-8 pb-8 pt-24 overflow-y-auto'
        }`}>
          {children}
        </div>
      </main>
    </div>
  );
}

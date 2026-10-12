import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Home,
  FilePlus,
  Search,
  BellRing,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Submit Complaint', path: '/submit', icon: FilePlus },
  { label: 'Track Complaint', path: '/track', icon: Search },
  { label: 'Follow-Up Reminders', path: '/follow-up', icon: BellRing },
  { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const sidebar = (
    <aside className="flex flex-col w-64 bg-slate-900 text-white min-h-screen fixed lg:sticky top-0 z-40 transition-transform duration-300 lg:translate-x-0"
      style={{ transform: mobileOpen ? 'translateX(0)' : undefined }}
    >
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">SafeTrack</h1>
          <p className="text-xs text-slate-400">Complaint Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          Ensuring every complaint is tracked and every voice is heard.
        </p>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (off-canvas) */}
      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen shrink-0">
        {sidebar}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">SafeTrack</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

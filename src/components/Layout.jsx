import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Home, QrCode, Sparkles, CalendarDays, Menu, X, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/listings', label: 'Listings', icon: Home },
  { to: '/marketing', label: 'Listing Marketing', icon: Sparkles },
  { to: '/open-houses', label: 'Open Houses', icon: QrCode },
  { to: '/showings', label: 'Showings', icon: CalendarDays },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-neutral-200">
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-[#0E1115] px-5 py-8 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="mb-10 pl-1">
          <div className="text-[11px] tracking-[0.28em] text-amber-500/80 uppercase">Realtor</div>
          <div className="text-xl font-semibold tracking-tight text-white">Command AI</div>
        </div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${active ? 'bg-white/[0.07] text-white' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}`}>
                <Icon className={`w-4 h-4 ${active ? 'text-amber-500' : ''}`} />
                {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => base44.auth.logout()} className="absolute bottom-8 left-5 flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-10 lg:px-10 lg:py-14">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
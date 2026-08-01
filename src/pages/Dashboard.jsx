import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import StatCard from '@/components/dashboard/StatCard';
import CommissionForecast from '@/components/dashboard/CommissionForecast';
import TemperatureBadge from '@/components/leads/TemperatureBadge';
import { leadCommission, money } from '@/lib/commission';
import { Flame, Users, CalendarDays, Home, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [showings, setShowings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [l, s, li] = await Promise.all([
        base44.entities.Lead.list('-created_date', 200),
        base44.entities.Showing.list('date', 50),
        base44.entities.Listing.list('-created_date', 50),
      ]);
      setLeads(l); setShowings(s); setListings(li); setLoading(false);
    })();
  }, []);

  const hot = leads.filter((l) => l.temperature === 'hot');
  const sellers = leads.filter((l) => l.lead_type === 'seller' && l.status !== 'closed' && l.status !== 'lost');
  const buyers = leads.filter((l) => l.lead_type === 'buyer' && ['qualified', 'showing'].includes(l.status));
  const pending = leads.filter((l) => l.status === 'under_contract');
  const upcoming = showings.filter((s) => s.status !== 'cancelled' && s.status !== 'completed').slice(0, 5);

  const sum = (arr) => arr.reduce((t, l) => t + leadCommission(l), 0);
  const rows = [
    { label: 'Hot seller leads', value: sum(sellers.filter((s) => s.temperature === 'hot')) },
    { label: 'Qualified buyers', value: sum(buyers) },
    { label: 'Pending transactions', value: sum(pending) },
  ];
  const total = rows.reduce((t, r) => t + r.value, 0);

  if (loading) return <div className="py-24 text-center text-neutral-500">Loading your command center…</div>;

  return (
    <div>
      <PageHeader eyebrow="Command Center" title="Good to see you." subtitle="Your pipeline, follow-ups and showings at a glance — with the leads worth calling first surfaced on top." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New leads" value={leads.filter((l) => l.status === 'new').length} icon={Users} hint="Awaiting first contact" />
        <StatCard label="Hot leads" value={hot.length} icon={Flame} hint="Call these today" />
        <StatCard label="Upcoming showings" value={upcoming.length} icon={CalendarDays} />
        <StatCard label="Active listings" value={listings.filter((l) => l.status === 'active').length} icon={Home} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Panel className="p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-white tracking-tight">Call these first</h2>
              <Link to="/leads" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">All leads <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="mt-5 divide-y divide-white/[0.05]">
              {hot.length === 0 && <p className="py-6 text-sm text-neutral-500">No hot leads yet. Qualify a lead to see it here.</p>}
              {hot.slice(0, 6).map((l) => (
                <Link key={l.id} to={`/leads/${l.id}`} className="flex items-center justify-between py-3.5 group">
                  <div>
                    <div className="text-sm text-white group-hover:text-amber-400 transition-colors">{l.full_name}</div>
                    <div className="text-xs text-neutral-500 capitalize">{l.lead_type} · {l.area || l.property_address || 'No area yet'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 tabular-nums">{money(leadCommission(l))}</span>
                    <TemperatureBadge value={l.temperature} />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel className="mt-6 p-6">
            <h2 className="text-lg font-semibold text-white tracking-tight">Upcoming showings</h2>
            <div className="mt-5 divide-y divide-white/[0.05]">
              {upcoming.length === 0 && <p className="py-6 text-sm text-neutral-500">Nothing scheduled yet.</p>}
              {upcoming.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm text-white">{s.address}</div>
                    <div className="text-xs text-neutral-500">{s.lead_name}</div>
                  </div>
                  <div className="text-xs text-neutral-400">{format(new Date(s.date + 'T00:00:00'), 'MMM d')} · {s.time}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-2">
          <CommissionForecast rows={rows} total={total} />
        </div>
      </div>
    </div>
  );
}
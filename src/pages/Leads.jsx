import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import TemperatureBadge from '@/components/leads/TemperatureBadge';
import LeadForm from '@/components/leads/LeadForm';
import { Button } from '@/components/ui/button';
import { leadCommission, money } from '@/lib/commission';
import LeadKanban from '@/components/leads/LeadKanban';
import { Plus, ChevronRight, LayoutGrid, List } from 'lucide-react';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'hot', label: 'Hot' },
  { key: 'buyer', label: 'Buyers' },
  { key: 'seller', label: 'Sellers' },
  { key: 'new', label: 'New' },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');

  const moveLead = async (leadId, status) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    await base44.entities.Lead.update(leadId, { status });
  };

  const load = async () => {
    const l = await base44.entities.Lead.list('-created_date', 300);
    setLeads(l); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const shown = leads.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'hot') return l.temperature === 'hot';
    if (filter === 'new') return l.status === 'new';
    return l.lead_type === filter;
  });

  return (
    <div>
      <PageHeader eyebrow="Pipeline" title="Leads" subtitle="Every buyer and seller in one place, scored so you know who to call first."
        action={<Button onClick={() => setOpen(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4 mr-1.5" /> Add lead</Button>} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${filter === f.key ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-white/10 text-neutral-400 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5">
          <button onClick={() => setView('board')} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${view === 'board' ? 'bg-white/[0.07] text-white' : 'text-neutral-500 hover:text-white'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Board
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${view === 'list' ? 'bg-white/[0.07] text-white' : 'text-neutral-500 hover:text-white'}`}>
            <List className="w-3.5 h-3.5" /> List
          </button>
        </div>
      </div>

      {loading && view === 'board' && <p className="text-sm text-neutral-500">Loading leads…</p>}
      {!loading && view === 'board' && <LeadKanban leads={shown} onMove={moveLead} />}

      {view === 'list' && (
      <Panel className="divide-y divide-white/[0.05]">
        {loading && <p className="p-6 text-sm text-neutral-500">Loading leads…</p>}
        {!loading && shown.length === 0 && <p className="p-8 text-sm text-neutral-500">No leads here yet. Add one to get started.</p>}
        {shown.map((l) => (
          <Link key={l.id} to={`/leads/${l.id}`} className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white group-hover:text-amber-400 transition-colors">{l.full_name}</div>
              <div className="truncate text-xs text-neutral-500 capitalize">{l.lead_type} · {l.status?.replace('_', ' ')} · {l.area || l.property_address || 'No details yet'}</div>
            </div>
            <span className="hidden sm:block text-xs text-neutral-400 tabular-nums">{money(leadCommission(l))}</span>
            <TemperatureBadge value={l.temperature} />
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </Link>
        ))}
      </Panel>
      )}

      <LeadForm open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import TemperatureBadge from '@/components/leads/TemperatureBadge';
import { leadCommission, money } from '@/lib/commission';

export default function KanbanCard({ lead, dragging }) {
  return (
    <div className={`rounded-xl border p-3.5 transition-all duration-200 ${dragging ? 'border-amber-500/40 bg-white/[0.07] shadow-xl shadow-black/40' : 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]'}`}>
      <div className="flex items-start justify-between gap-2">
        <Link to={`/leads/${lead.id}`} className="text-sm text-white hover:text-amber-400 transition-colors">{lead.full_name}</Link>
        <TemperatureBadge value={lead.temperature} />
      </div>
      <div className="mt-1.5 truncate text-xs text-neutral-500 capitalize">
        {lead.lead_type} · {lead.area || lead.property_address || 'No details yet'}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
        <span className="tabular-nums">{money(leadCommission(lead))}</span>
        {lead.score != null && <span>Score {lead.score}</span>}
      </div>
    </div>
  );
}
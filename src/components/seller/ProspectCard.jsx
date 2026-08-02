import React from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { money } from '@/lib/commission';

const STAGES = ['identified', 'nurturing', 'appointment_set', 'listing_won', 'not_now'];
const label = (s) => s.replace(/_/g, ' ');

export default function ProspectCard({ prospect: p, onScore, onStage, scoring }) {
  const equity = (p.estimated_value || 0) - (p.estimated_mortgage_balance || 0);
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base text-white">{p.full_name}</div>
          <div className="text-xs text-neutral-400">{p.property_address || 'No address'} · {label(p.signal_type)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-amber-400 tabular-nums">{p.opportunity_score ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">of 100</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div><div className="text-neutral-500">Years owned</div><div className="text-white">{p.years_owned ?? '—'}</div></div>
        <div><div className="text-neutral-500">Est. value</div><div className="text-white">{p.estimated_value ? money(p.estimated_value) : '—'}</div></div>
        <div><div className="text-neutral-500">Est. equity</div><div className="text-white">{equity > 0 ? money(equity) : '—'}</div></div>
      </div>

      {p.score_reasons?.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-xs text-ocean-100/80">
          {p.score_reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-ocean-300">•</span>{r}</li>)}
        </ul>
      )}
      {p.recommended_action && <p className="mt-3 text-xs text-sand-200">Next: {p.recommended_action}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onScore(p)} disabled={scoring} className="bg-amber-500 text-black hover:bg-amber-400">
          <Sparkles className="w-3.5 h-3.5" /> {scoring ? 'Scoring…' : p.opportunity_score ? 'Re-score' : 'Score opportunity'}
        </Button>
        <select value={p.stage} onChange={(e) => onStage(p, e.target.value)} className="rounded-lg border border-ocean-300/15 bg-white/5 px-2 py-1.5 text-xs capitalize text-white">
          {STAGES.map((s) => <option key={s} value={s} className="bg-ocean-900">{label(s)}</option>)}
        </select>
      </div>
    </Panel>
  );
}
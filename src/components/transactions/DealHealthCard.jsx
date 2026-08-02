import React from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Activity, ShieldAlert } from 'lucide-react';
import { money } from '@/lib/commission';

const MILESTONES = [
  ['inspection_complete', 'Inspection'],
  ['appraisal_complete', 'Appraisal'],
  ['financing_cleared', 'Financing'],
  ['title_cleared', 'Title'],
  ['insurance_bound', 'Insurance'],
  ['docs_complete', 'Documents'],
];

const scoreColor = (s) => (s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400');

export default function DealHealthCard({ tx, onAnalyze, onToggle, onStatus, analyzing }) {
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base text-white">{tx.address}</div>
          <div className="text-xs text-neutral-400 capitalize">{tx.client_name || 'Client'} · {tx.side} side · {tx.purchase_price ? money(tx.purchase_price) : 'price TBD'}</div>
          <div className="mt-1 text-xs text-ocean-200">Closing {tx.closing_date || 'TBD'}</div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-semibold tabular-nums ${scoreColor(tx.health_score || 0)}`}>{tx.health_score ?? '—'}</div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">health</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MILESTONES.map(([key, label]) => (
          <button key={key} onClick={() => onToggle(tx, key)}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${tx[key] ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-ocean-300/15 text-neutral-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tx.primary_risk && (
        <p className="mt-4 flex items-start gap-2 text-xs text-amber-300">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />{tx.primary_risk}
        </p>
      )}
      {tx.recommended_actions?.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-xs text-neutral-300">
          {tx.recommended_actions.map((a, i) => <li key={i}>• {a}</li>)}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onAnalyze(tx)} disabled={analyzing} className="bg-amber-500 text-black hover:bg-amber-400">
          <Activity className="w-3.5 h-3.5" /> {analyzing ? 'Analyzing…' : 'Analyze deal health'}
        </Button>
        <select value={tx.status} onChange={(e) => onStatus(tx, e.target.value)} className="rounded-lg border border-ocean-300/15 bg-white/5 px-2 py-1.5 text-xs text-white">
          <option value="under_contract" className="bg-ocean-900">Under contract</option>
          <option value="pending_close" className="bg-ocean-900">Pending close</option>
          <option value="closed" className="bg-ocean-900">Closed</option>
          <option value="fell_through" className="bg-ocean-900">Fell through</option>
        </select>
      </div>
    </Panel>
  );
}
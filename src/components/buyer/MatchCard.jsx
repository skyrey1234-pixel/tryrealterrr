import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';
import { Check, X } from 'lucide-react';

export default function MatchCard({ match, listing, selected, onToggle }) {
  return (
    <Panel className={`p-5 ${selected ? 'ring-1 ring-amber-400/40' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white">{listing?.address || match.address}</div>
          <div className="text-xs text-neutral-400">
            {listing ? `${listing.bedrooms || '—'} bd · ${listing.bathrooms || '—'} ba · ${listing.sqft ? listing.sqft.toLocaleString() + ' sqft' : '—'} · ${money(listing.price)}` : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-amber-400 tabular-nums">{match.match_score}%</div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-500">match</div>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 text-xs">
        {(match.meets || []).map((m, i) => (
          <li key={`m${i}`} className="flex gap-2 text-ocean-100/85"><Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />{m}</li>
        ))}
        {(match.gaps || []).map((m, i) => (
          <li key={`g${i}`} className="flex gap-2 text-neutral-400"><X className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />{m}</li>
        ))}
      </ul>

      {match.monthly_estimate && <p className="mt-3 text-xs text-sand-200">Estimated monthly cost: {match.monthly_estimate}</p>}

      <button onClick={onToggle} className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs transition-colors ${selected ? 'border-amber-400/40 bg-amber-400/10 text-white' : 'border-ocean-300/15 text-neutral-300 hover:text-white'}`}>
        {selected ? 'In comparison' : 'Add to comparison'}
      </button>
    </Panel>
  );
}
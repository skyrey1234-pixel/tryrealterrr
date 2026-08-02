import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';

const tints = ['border-amber-400/25 bg-amber-400/[0.06]', 'border-ocean-300/25 bg-ocean-300/[0.06]', 'border-violet-400/25 bg-violet-400/[0.06]'];

export default function StrategyCards({ strategies = [] }) {
  if (strategies.length === 0) return null;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {strategies.map((s, i) => (
        <Panel key={i} className={`p-5 border ${tints[i % 3]}`}>
          <div className="text-[11px] uppercase tracking-widest text-neutral-400">{s.name}</div>
          <div className="mt-2 text-2xl font-semibold text-white tabular-nums">{s.list_price ? money(s.list_price) : '—'}</div>
          <div className="mt-1 text-xs text-ocean-200">{s.days_on_market_range}</div>
          <p className="mt-3 text-xs leading-relaxed text-neutral-300">{s.positioning}</p>
          <p className="mt-2 text-xs leading-relaxed text-sand-200">Goal: {s.goal}</p>
          {s.tradeoffs && <p className="mt-2 text-xs leading-relaxed text-neutral-400">Tradeoffs: {s.tradeoffs}</p>}
        </Panel>
      ))}
    </div>
  );
}
import React from 'react';
import { Panel } from '@/components/ui/panel';

export default function RenovationOptions({ options = [] }) {
  if (options.length === 0) return null;
  return (
    <Panel className="p-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">Renovation ROI simulator</h2>
      <div className="mt-5 space-y-4">
        {options.map((o, i) => (
          <div key={i} className="rounded-xl border border-ocean-300/12 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-sm text-white">{o.title}</div>
              <div className="text-xs text-amber-400">{o.cost_range}</div>
            </div>
            <p className="mt-2 text-xs text-neutral-300">{o.probable_effect}</p>
            {o.return_range && <p className="mt-1 text-xs text-ocean-200">Estimated return range: {o.return_range}</p>}
            <p className="mt-1 text-xs text-sand-200">{o.recommendation}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
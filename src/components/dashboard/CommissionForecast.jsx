import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';

export default function CommissionForecast({ rows, total }) {
  return (
    <Panel className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-white tracking-tight">Commission Forecast</h2>
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-600">Estimate only</span>
      </div>
      <div className="mt-6 space-y-4">
        {rows.map((r) => {
          const pct = total ? Math.min(100, (r.value / total) * 100) : 0;
          return (
            <div key={r.label}>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">{r.label}</span>
                <span className="text-white tabular-nums">{money(r.value)}</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-7 flex items-end justify-between border-t border-white/[0.06] pt-5">
        <div className="text-sm text-neutral-400">Total pipeline</div>
        <div className="text-3xl font-semibold text-white tabular-nums">{money(total)}</div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-neutral-600">
        Figures are estimates based on active opportunities and are not guaranteed earnings.
      </p>
    </Panel>
  );
}
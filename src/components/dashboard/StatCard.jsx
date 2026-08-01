import React from 'react';
import { Panel } from '@/components/ui/panel';

export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <Panel className="p-5 transition-all duration-300 hover:bg-white/[0.04]">
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        {Icon && <Icon className="w-4 h-4 text-amber-500/70" />}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </Panel>
  );
}
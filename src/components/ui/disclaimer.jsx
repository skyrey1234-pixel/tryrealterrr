import React from 'react';
import { Info } from 'lucide-react';

export default function Disclaimer({ children }) {
  return (
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-sand-300/15 bg-sand-300/[0.06] px-3 py-2 text-[11px] leading-relaxed text-sand-200">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export const inputCls =
  'w-full rounded-lg border border-ocean-300/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-ocean-300/40';
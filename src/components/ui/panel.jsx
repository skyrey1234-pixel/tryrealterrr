import React from 'react';

export function Panel({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.28em] text-amber-500/80 mb-2">{eyebrow}</div>}
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-neutral-400 leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
import React from 'react';

const styles = {
  hot: 'bg-red-500/10 text-red-400 border-red-500/20',
  warm: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  long_term: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  unqualified: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
};
const labels = { hot: 'Hot', warm: 'Warm', long_term: 'Long term', unqualified: 'Not qualified' };

export default function TemperatureBadge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide ${styles[value] || styles.warm}`}>
      {labels[value] || value}
    </span>
  );
}
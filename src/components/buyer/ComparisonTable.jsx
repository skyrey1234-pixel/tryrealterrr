import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';

export default function ComparisonTable({ rows, summary }) {
  if (rows.length < 2) return null;
  const cell = 'px-4 py-3 text-xs text-neutral-300 align-top';
  return (
    <Panel className="p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold tracking-tight text-white">Comparison war room</h2>
      <table className="mt-5 w-full min-w-[560px] border-collapse">
        <thead>
          <tr className="border-b border-ocean-300/12">
            <th className="px-4 py-2 text-left text-[11px] uppercase tracking-widest text-neutral-500">Feature</th>
            {rows.map((r) => <th key={r.match.listing_id} className="px-4 py-2 text-left text-xs text-white">{r.listing?.address || r.match.address}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/[0.04]"><td className={cell}>Asking price</td>{rows.map((r) => <td key={r.match.listing_id} className={cell}>{r.listing?.price ? money(r.listing.price) : '—'}</td>)}</tr>
          <tr className="border-b border-white/[0.04]"><td className={cell}>Match score</td>{rows.map((r) => <td key={r.match.listing_id} className={`${cell} text-amber-400`}>{r.match.match_score}%</td>)}</tr>
          <tr className="border-b border-white/[0.04]"><td className={cell}>Beds / baths</td>{rows.map((r) => <td key={r.match.listing_id} className={cell}>{r.listing?.bedrooms || '—'} / {r.listing?.bathrooms || '—'}</td>)}</tr>
          <tr className="border-b border-white/[0.04]"><td className={cell}>Monthly estimate</td>{rows.map((r) => <td key={r.match.listing_id} className={cell}>{r.match.monthly_estimate || '—'}</td>)}</tr>
          <tr className="border-b border-white/[0.04]"><td className={cell}>Strengths</td>{rows.map((r) => <td key={r.match.listing_id} className={cell}>{(r.match.meets || []).slice(0, 3).join(', ') || '—'}</td>)}</tr>
          <tr><td className={cell}>Buyer concerns</td>{rows.map((r) => <td key={r.match.listing_id} className={cell}>{(r.match.gaps || []).join(', ') || '—'}</td>)}</tr>
        </tbody>
      </table>
      {summary && <p className="mt-5 text-sm leading-relaxed text-sand-200">{summary}</p>}
    </Panel>
  );
}
import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';

export default function CompsTable({ comps }) {
  if (!comps?.length) return null;
  return (
    <Panel className="p-6">
      <h3 className="text-sm uppercase tracking-widest text-ocean-300">Comparable sales <span className="text-neutral-500">· imported</span></h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500">
              <th className="pb-2 pr-4 font-normal">Address</th>
              <th className="pb-2 pr-4 font-normal">Sold</th>
              <th className="pb-2 pr-4 font-normal">Sqft</th>
              <th className="pb-2 pr-4 font-normal">$/sqft</th>
              <th className="pb-2 pr-4 font-normal">DOM</th>
              <th className="pb-2 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody className="text-neutral-300">
            {comps.map((c, i) => (
              <tr key={i} className="border-t border-ocean-300/10">
                <td className="py-2 pr-4 text-white">{c.address || '—'}</td>
                <td className="py-2 pr-4">{c.sold_price ? money(c.sold_price) : '—'}</td>
                <td className="py-2 pr-4">{c.sqft ? c.sqft.toLocaleString() : '—'}</td>
                <td className="py-2 pr-4">{c.sold_price && c.sqft ? money(Math.round(c.sold_price / c.sqft)) : '—'}</td>
                <td className="py-2 pr-4">{c.days_on_market ?? '—'}</td>
                <td className="py-2 text-xs text-neutral-400">{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
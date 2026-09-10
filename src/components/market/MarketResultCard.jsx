import React from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { money } from '@/lib/commission';
import { ExternalLink } from 'lucide-react';

export default function MarketResultCard({ property, onImport, importing }) {
  const p = property;
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{p.address || 'Address unavailable'}</div>
          <div className="text-xs text-neutral-500">
            {[p.city, p.state, p.zip].filter(Boolean).join(', ')}
          </div>
        </div>
        {p.listing_url && (
          <a href={p.listing_url} target="_blank" rel="noreferrer" className="text-ocean-300 hover:text-white">
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-3 text-xl font-semibold text-sand-200">
        {p.price ? money(p.price) : '—'}
      </div>

      <div className="mt-2 text-xs text-neutral-400">
        {[
          p.bedrooms ? `${p.bedrooms} bd` : null,
          p.bathrooms ? `${p.bathrooms} ba` : null,
          p.sqft ? `${p.sqft.toLocaleString()} sqft` : null,
          p.year_built ? `built ${p.year_built}` : null,
        ].filter(Boolean).join(' · ') || 'Details unavailable'}
      </div>

      <div className="mt-1 text-xs text-neutral-500">
        {[p.status, p.days_on_market != null ? `${p.days_on_market} days on market` : null]
          .filter(Boolean).join(' · ')}
      </div>

      <Button
        onClick={() => onImport(p)}
        disabled={importing}
        className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600"
        size="sm"
      >
        {importing ? 'Saving…' : 'Save to Listings'}
      </Button>
    </Panel>
  );
}
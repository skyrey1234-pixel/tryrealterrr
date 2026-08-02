import React from 'react';
import { Panel } from '@/components/ui/panel';
import { Image } from '@/components/ui/image';
import { money } from '@/lib/commission';

export default function PropertyFacts({ listing }) {
  const facts = [
    ['Price', listing.price ? money(listing.price) : '—'],
    ['Bedrooms', listing.bedrooms ?? '—'],
    ['Bathrooms', listing.bathrooms ?? '—'],
    ['Square feet', listing.sqft ? listing.sqft.toLocaleString() : '—'],
    ['Type', (listing.property_type || '').replace(/_/g, ' ') || '—'],
    ['Status', (listing.status || '').replace(/_/g, ' ') || '—'],
  ];

  return (
    <Panel className="overflow-hidden">
      {listing.photo_url && <Image src={listing.photo_url} alt={listing.address} className="h-56 w-full object-cover" />}
      <div className="p-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">{listing.address}</h2>
        <p className="text-sm text-neutral-400">{listing.city}</p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-widest text-neutral-500">{label}</div>
              <div className="mt-1 text-sm capitalize text-white">{value}</div>
            </div>
          ))}
        </div>

        {listing.features?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {listing.features.map((f, i) => <span key={i} className="rounded-full bg-ocean-300/10 px-2.5 py-1 text-xs text-ocean-100">{f}</span>)}
          </div>
        )}

        {listing.description && <p className="mt-5 text-sm leading-relaxed text-neutral-300">{listing.description}</p>}
      </div>
    </Panel>
  );
}
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import ListingForm from '@/components/listings/ListingForm';
import { Image } from '@/components/ui/image';
import { money } from '@/lib/commission';
import { Plus, BedDouble, Bath, Ruler } from 'lucide-react';

const statusStyle = {
  active: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  pending: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
  sold: 'text-neutral-400 border-white/10 bg-white/5',
  coming_soon: 'text-sky-400 border-sky-500/20 bg-sky-500/10',
};

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => { setListings(await base44.entities.Listing.list('-created_date', 100)); setLoading(false); };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader eyebrow="Inventory" title="Listings" subtitle="Your active inventory — the source for marketing content, showings and open houses."
        action={<Button onClick={() => setOpen(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4 mr-1.5" /> Add listing</Button>} />

      {loading && <p className="text-sm text-neutral-500">Loading listings…</p>}
      {!loading && listings.length === 0 && <Panel className="p-8 text-sm text-neutral-500">No listings yet. Add your first property.</Panel>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Panel key={l.id} className="overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
            {l.photo_url
              ? <Image src={l.photo_url} alt={l.address} className="h-44 w-full object-cover" />
              : <div className="h-44 w-full bg-gradient-to-br from-white/[0.06] to-transparent" />}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-white">{l.address}</div>
                  <div className="text-xs text-neutral-500">{l.city}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusStyle[l.status] || statusStyle.active}`}>{l.status?.replace('_', ' ')}</span>
              </div>
              <div className="mt-4 text-2xl font-semibold text-white tabular-nums">{l.price ? money(l.price) : '—'}</div>
              <div className="mt-3 flex gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{l.bedrooms || '—'}</span>
                <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{l.bathrooms || '—'}</span>
                <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{l.sqft ? `${l.sqft.toLocaleString()} sqft` : '—'}</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <ListingForm open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  );
}
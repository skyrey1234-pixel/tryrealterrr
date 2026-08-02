import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader } from '@/components/ui/panel';
import Disclaimer, { inputCls } from '@/components/ui/disclaimer';
import PropertyFacts from '@/components/property/PropertyFacts';
import PropertyChat from '@/components/property/PropertyChat';

export default function TalkingProperty() {
  const [listings, setListings] = useState([]);
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Listing.list('-created_date', 100).then((rows) => {
      setListings(rows);
      if (rows[0]) setId(rows[0].id);
      setLoading(false);
    });
  }, []);

  const listing = listings.find((l) => l.id === id);

  return (
    <div>
      <PageHeader eyebrow="Listing Experience" title="Talking property" subtitle="Every listing answers buyer questions on its own — grounded in your property data, never invented." />

      {loading ? (
        <div className="py-16 text-center text-neutral-500">Loading listings…</div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">Add a listing first to give it a voice.</div>
      ) : (
        <>
          <select className={`${inputCls} max-w-md`} value={id} onChange={(e) => setId(e.target.value)}>
            {listings.map((l) => <option key={l.id} value={l.id} className="bg-ocean-900">{l.address}</option>)}
          </select>

          {listing && (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <PropertyFacts listing={listing} />
              <PropertyChat key={listing.id} listing={listing} />
            </div>
          )}
        </>
      )}

      <Disclaimer>Answers come from the listing data you entered plus general process information — square footage, fees, taxes, permits and condition must be verified with disclosures, public records and inspections.</Disclaimer>
    </div>
  );
}
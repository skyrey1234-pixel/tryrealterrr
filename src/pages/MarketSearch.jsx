import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel, PageHeader } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import Disclaimer, { inputCls } from '@/components/ui/disclaimer';
import { Search } from 'lucide-react';
import MarketResultCard from '@/components/market/MarketResultCard';

export default function MarketSearch() {
  const [location, setLocation] = useState('');
  const [listingType, setListingType] = useState('for_sale');
  const [pastDays, setPastDays] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importingKey, setImportingKey] = useState(null);

  const runSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    const res = await base44.functions.invoke('homeHarvestSearch', {
      location,
      listing_type: listingType,
      past_days: pastDays ? Number(pastDays) : undefined,
    });
    if (res.data?.error) setError(res.data.error);
    else setResults(res.data.properties || []);
    setLoading(false);
  };

  const importListing = async (p) => {
    setImportingKey(p.address);
    await base44.entities.Listing.create({
      address: p.address,
      city: p.city,
      price: p.price || undefined,
      bedrooms: p.bedrooms || undefined,
      bathrooms: p.bathrooms || undefined,
      sqft: p.sqft || undefined,
      status: listingType === 'sold' ? 'sold' : 'active',
      photo_url: p.photo_url || undefined,
    });
    setImportingKey(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Market data"
        title="Market Search"
        subtitle="Pull live property data from your self-hosted HomeHarvest service and save anything useful into your listings."
      />

      <Panel className="p-6">
        <form onSubmit={runSearch} className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-widest text-ocean-300">Location</label>
            <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Zip, city, or address" required />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-ocean-300">Type</label>
            <select className={inputCls} value={listingType} onChange={(e) => setListingType(e.target.value)}>
              <option value="for_sale">For sale</option>
              <option value="sold">Sold</option>
              <option value="for_rent">For rent</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-ocean-300">Past days</label>
            <input className={inputCls} type="number" value={pastDays} onChange={(e) => setPastDays(e.target.value)}
              placeholder="e.g. 90" />
          </div>
          <div className="sm:col-span-4">
            <Button type="submit" disabled={loading} className="bg-amber-500 text-white hover:bg-amber-600">
              <Search className="h-4 w-4" /> {loading ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </form>

        <Disclaimer>
          This page calls the HomeHarvest API you host yourself at the configured URL. Results come from public listing
          portals — verify accuracy and confirm your own compliance before using the data in client materials.
        </Disclaimer>
      </Panel>

      {error && (
        <Panel className="mt-6 border-red-400/20 p-5">
          <p className="text-sm text-red-300">{error}</p>
        </Panel>
      )}

      {results && (
        <div className="mt-8">
          <div className="mb-4 text-sm text-neutral-400">{results.length} properties found</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <MarketResultCard
                key={`${p.address}-${i}`}
                property={p}
                onImport={importListing}
                importing={importingKey === p.address}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import AssetBlock from '@/components/marketing/AssetBlock';
import { Sparkles } from 'lucide-react';

const TONES = ['Luxury', 'Family-friendly', 'Modern', 'Investor-focused', 'First-time-buyer friendly'];

export default function Marketing() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState('');
  const [tone, setTone] = useState('Luxury');
  const [busy, setBusy] = useState(false);
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    (async () => {
      const l = await base44.entities.Listing.list('-created_date', 100);
      setListings(l);
      if (l[0]) setSelected(l[0].id);
    })();
  }, []);

  const generate = async () => {
    const listing = listings.find((l) => l.id === selected);
    if (!listing) return;
    setBusy(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a top real estate marketing copywriter. Write marketing content for this listing in a ${tone} tone. Listing: ${JSON.stringify(listing)}. Keep the MLS description under 1200 characters, captions punchy with relevant hashtags, and the reel script as short shot-by-shot lines.`,
      response_json_schema: {
        type: 'object',
        properties: {
          mls_description: { type: 'string' },
          instagram_caption: { type: 'string' },
          facebook_post: { type: 'string' },
          reel_script: { type: 'string' },
          email_announcement: { type: 'string' },
          sms_campaign: { type: 'string' },
        },
      },
    });
    const saved = await base44.entities.MarketingAsset.create({ ...res, listing_id: listing.id, address: listing.address, tone });
    setAsset(saved);
    setBusy(false);
  };

  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Listing Content Generator" subtitle="Pick a listing and a tone — get an MLS description, social captions, a reel script, an email and a text campaign in seconds." />

      <Panel className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Listing</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white">
              {listings.length === 0 && <option value="">Add a listing first</option>}
              {listings.map((l) => <option key={l.id} value={l.id} className="bg-[#0E1115]">{l.address}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Tone</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${tone === t ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-white/10 text-neutral-400 hover:text-white'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={generate} disabled={busy || !selected} className="mt-6 bg-amber-500 text-black hover:bg-amber-400">
          <Sparkles className="w-4 h-4 mr-1.5" />{busy ? 'Writing your campaign…' : 'Generate content'}
        </Button>
      </Panel>

      {asset && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <AssetBlock title="MLS description" text={asset.mls_description} />
          <AssetBlock title="Instagram caption" text={asset.instagram_caption} />
          <AssetBlock title="Facebook post" text={asset.facebook_post} />
          <AssetBlock title="Reel script" text={asset.reel_script} />
          <AssetBlock title="Email announcement" text={asset.email_announcement} />
          <AssetBlock title="Text campaign" text={asset.sms_campaign} />
        </div>
      )}
    </div>
  );
}
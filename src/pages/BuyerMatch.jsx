import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import Disclaimer, { inputCls } from '@/components/ui/disclaimer';
import MatchCard from '@/components/buyer/MatchCard';
import ComparisonTable from '@/components/buyer/ComparisonTable';
import BuyerMemory from '@/components/buyer/BuyerMemory';
import { Sparkles } from 'lucide-react';

export default function BuyerMatch() {
  const [leads, setLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [leadId, setLeadId] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [l, li, p] = await Promise.all([
      base44.entities.Lead.filter({ lead_type: 'buyer' }, '-created_date', 200),
      base44.entities.Listing.list('-created_date', 100),
      base44.entities.BuyerProfile.list('-created_date', 100),
    ]);
    setLeads(l); setListings(li); setProfiles(p);
  };
  useEffect(() => { load(); }, []);

  const lead = leads.find((l) => l.id === leadId);
  const profile = profiles.find((p) => p.lead_id === leadId);

  const run = async () => {
    if (!lead) return;
    setBusy(true);
    const inventory = listings.map((l) => ({ id: l.id, address: l.address, city: l.city, price: l.price, bedrooms: l.bedrooms, bathrooms: l.bathrooms, sqft: l.sqft, property_type: l.property_type, features: l.features, description: l.description, status: l.status }));
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You translate a buyer's own words into objective property criteria and score listings against them.

Rules: use only objective, documented property attributes. Never use or imply subjective or demographic neighborhood judgments ("good area", "safe area", "family neighborhood") and never reference protected characteristics. Present costs as educational estimates.

Buyer: ${lead.full_name}
Budget: ${lead.budget_min || '?'}–${lead.budget_max || '?'}
Bedrooms wanted: ${lead.bedrooms || 'unspecified'}
Area of interest: ${lead.area || 'unspecified'}
Buyer's description: "${description}"
Previously learned preferences: ${(profile?.learned_preferences || []).join('; ') || 'none'}

Available listings JSON: ${JSON.stringify(inventory)}

Return: criteria (objective, structured), and matches for up to 6 listings — each with listing_id, address, match_score 0-100, meets (specific attributes that satisfy criteria), gaps (specific shortfalls), and monthly_estimate as an estimated range string covering payment, taxes, insurance and HOA assumptions. Also return an overall explanation comparing the top options by tradeoff.`,
      response_json_schema: {
        type: 'object',
        properties: {
          criteria: {
            type: 'object',
            properties: {
              min_bedrooms: { type: 'number' }, min_bathrooms: { type: 'number' }, budget_max: { type: 'number' },
              needs_office: { type: 'boolean' }, needs_yard: { type: 'boolean' }, condition_preference: { type: 'string' },
              must_haves: { type: 'array', items: { type: 'string' } },
              nice_to_haves: { type: 'array', items: { type: 'string' } },
              dealbreakers: { type: 'array', items: { type: 'string' } },
            },
          },
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                listing_id: { type: 'string' }, address: { type: 'string' }, match_score: { type: 'number' },
                meets: { type: 'array', items: { type: 'string' } },
                gaps: { type: 'array', items: { type: 'string' } },
                monthly_estimate: { type: 'string' },
              },
            },
          },
          explanation: { type: 'string' },
        },
      },
    });

    if (profile) {
      await base44.entities.BuyerProfile.update(profile.id, { lifestyle_description: description, criteria: res.criteria });
    } else {
      await base44.entities.BuyerProfile.create({ lead_id: leadId, lead_name: lead.full_name, lifestyle_description: description, criteria: res.criteria });
    }
    setResult(res);
    setSelected([]);
    setBusy(false);
    load();
  };

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const matches = (result?.matches || []).slice().sort((a, b) => b.match_score - a.match_score);
  const comparisonRows = matches.filter((m) => selected.includes(m.listing_id)).map((m) => ({ match: m, listing: listings.find((l) => l.id === m.listing_id) }));

  return (
    <div>
      <PageHeader eyebrow="Buyer Experience" title="Life-match engine" subtitle="Let buyers describe how they want to live — the AI turns it into objective criteria and scores your inventory against it." />

      <Panel className="p-6">
        <div className="grid gap-3">
          <select className={inputCls} value={leadId} onChange={(e) => { setLeadId(e.target.value); setResult(null); setDescription(''); }}>
            <option value="" className="bg-ocean-900">Select a buyer lead…</option>
            {leads.map((l) => <option key={l.id} value={l.id} className="bg-ocean-900">{l.full_name}</option>)}
          </select>
          <textarea className={inputCls} rows={4} placeholder="“I work from home, need a quiet office, want a fenced yard for my dog, and don't want a major renovation.”" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={run} disabled={busy || !leadId || !description.trim()} className="bg-amber-500 text-black hover:bg-amber-400">
            <Sparkles className="w-4 h-4" /> {busy ? 'Matching…' : 'Match to inventory'}
          </Button>
        </div>
      </Panel>

      {result && (
        <div className="mt-6 space-y-6">
          <Panel className="p-6">
            <h3 className="text-sm uppercase tracking-widest text-ocean-300">Objective criteria</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
              <div><div className="text-neutral-500">Must have</div><ul className="mt-1 space-y-1 text-neutral-300">{(result.criteria?.must_haves || []).map((c, i) => <li key={i}>• {c}</li>)}</ul></div>
              <div><div className="text-neutral-500">Nice to have</div><ul className="mt-1 space-y-1 text-neutral-300">{(result.criteria?.nice_to_haves || []).map((c, i) => <li key={i}>• {c}</li>)}</ul></div>
              <div><div className="text-neutral-500">Dealbreakers</div><ul className="mt-1 space-y-1 text-neutral-300">{(result.criteria?.dealbreakers || []).map((c, i) => <li key={i}>• {c}</li>)}</ul></div>
            </div>
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            {matches.map((m) => (
              <MatchCard key={m.listing_id} match={m} listing={listings.find((l) => l.id === m.listing_id)} selected={selected.includes(m.listing_id)} onToggle={() => toggle(m.listing_id)} />
            ))}
          </div>

          <ComparisonTable rows={comparisonRows} summary={result.explanation} />
        </div>
      )}

      {profile && <div className="mt-6"><BuyerMemory profile={profile} onUpdated={load} /></div>}

      <Disclaimer>Match scores and monthly figures are educational estimates from listing data you entered — not a loan approval, lending quote, or appraisal. Verify condition, fees, taxes and features with disclosures and inspections.</Disclaimer>
    </div>
  );
}
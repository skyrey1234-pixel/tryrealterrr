import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import Disclaimer, { inputCls } from '@/components/ui/disclaimer';
import StrategyCards from '@/components/prelisting/StrategyCards';
import RenovationOptions from '@/components/prelisting/RenovationOptions';
import ReportUpload from '@/components/prelisting/ReportUpload';
import CompsTable from '@/components/prelisting/CompsTable';
import { Sparkles } from 'lucide-react';
import { money } from '@/lib/commission';

const empty = { address: '', city: '', bedrooms: '', bathrooms: '', sqft: '', year_built: '', agent_opinion_of_value: '', mortgage_balance: '', condition_notes: '' };

export default function PreListing() {
  const [form, setForm] = useState(empty);
  const [reports, setReports] = useState([]);
  const [active, setActive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [comps, setComps] = useState([]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const applyExtract = (d) => {
    setComps(d.comps || []);
    setForm((f) => ({
      ...f,
      address: d.address || f.address,
      city: d.city || f.city,
      bedrooms: d.bedrooms ?? f.bedrooms,
      bathrooms: d.bathrooms ?? f.bathrooms,
      sqft: d.sqft ?? f.sqft,
      year_built: d.year_built ?? f.year_built,
      agent_opinion_of_value: d.estimated_value ?? f.agent_opinion_of_value,
      condition_notes: [f.condition_notes, d.market_notes].filter(Boolean).join('\n'),
    }));
  };

  const load = async () => {
    const rows = await base44.entities.PreListingReport.list('-created_date', 30);
    setReports(rows);
    if (!active && rows[0]) setActive(rows[0]);
  };
  useEffect(() => { load(); }, []);

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Prepare a pre-listing intelligence report for a real estate agent's seller appointment. Use only the property facts supplied by the agent plus general market knowledge, and clearly frame pricing as AI estimates requiring agent judgment, MLS data and public records to confirm. Never use language that targets or excludes protected classes; describe the property, not people.

Property: ${form.address}, ${form.city}
Beds/baths: ${form.bedrooms}/${form.bathrooms} · ${form.sqft} sqft · built ${form.year_built}
Agent opinion of value: ${form.agent_opinion_of_value || 'not provided'}
Mortgage balance: ${form.mortgage_balance || 'not provided'}
Condition notes: ${form.condition_notes || 'none'}
Comparable sales imported from the agent's RPR/MLS report (treat these as the factual pricing backbone and anchor every list price to them; if empty, say pricing is preliminary until comps are pulled): ${comps.length ? JSON.stringify(comps) : 'none provided'}

Produce: a market_summary paragraph, exactly three pricing strategies (Fast sale / Market value / Aspirational) with list_price, days_on_market_range, positioning, goal and tradeoffs; objective buyer_segments (based on property attributes, not demographics); preparation_steps; launch_strategy; marketing_preview; 3-4 renovation_options with cost_range, probable_effect, return_range and recommendation (ranges only, never guarantees); and seller_proceeds_notes explaining what still must be verified.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          market_summary: { type: 'string' },
          buyer_segments: { type: 'array', items: { type: 'string' } },
          preparation_steps: { type: 'array', items: { type: 'string' } },
          launch_strategy: { type: 'string' },
          marketing_preview: { type: 'string' },
          seller_proceeds_notes: { type: 'string' },
          strategies: {
            type: 'array',
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, positioning: { type: 'string' }, list_price: { type: 'number' }, days_on_market_range: { type: 'string' }, goal: { type: 'string' }, tradeoffs: { type: 'string' } },
            },
          },
          renovation_options: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, cost_range: { type: 'string' }, probable_effect: { type: 'string' }, return_range: { type: 'string' }, recommendation: { type: 'string' } },
            },
          },
        },
      },
    });
    const saved = await base44.entities.PreListingReport.create({
      ...form,
      bedrooms: Number(form.bedrooms) || undefined,
      bathrooms: Number(form.bathrooms) || undefined,
      sqft: Number(form.sqft) || undefined,
      year_built: Number(form.year_built) || undefined,
      agent_opinion_of_value: Number(form.agent_opinion_of_value) || undefined,
      mortgage_balance: Number(form.mortgage_balance) || undefined,
      comps,
      ...res,
    });
    setActive(saved);
    setBusy(false);
    setForm(empty);
    setComps([]);
    load();
  };

  return (
    <div>
      <PageHeader eyebrow="Listing Appointments" title="Pre-listing intelligence" subtitle="Walk into the appointment with pricing scenarios, preparation steps and a marketing preview already built." />

      <Panel className="p-6">
        <ReportUpload onExtract={applyExtract} />
        <form onSubmit={generate} className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls} placeholder="Property address" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
          <div className="grid grid-cols-4 gap-3 sm:col-span-2">
            <input className={inputCls} placeholder="Beds" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
            <input className={inputCls} placeholder="Baths" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
            <input className={inputCls} placeholder="Sqft" value={form.sqft} onChange={(e) => set('sqft', e.target.value)} />
            <input className={inputCls} placeholder="Year built" value={form.year_built} onChange={(e) => set('year_built', e.target.value)} />
          </div>
          <input className={inputCls} placeholder="Your opinion of value" value={form.agent_opinion_of_value} onChange={(e) => set('agent_opinion_of_value', e.target.value)} />
          <input className={inputCls} placeholder="Mortgage balance" value={form.mortgage_balance} onChange={(e) => set('mortgage_balance', e.target.value)} />
          <textarea className={`${inputCls} sm:col-span-2`} rows={3} placeholder="Condition, updates, known issues, seller goals…" value={form.condition_notes} onChange={(e) => set('condition_notes', e.target.value)} />
          <Button type="submit" disabled={busy} className="sm:col-span-2 bg-amber-500 text-black hover:bg-amber-400">
            <Sparkles className="w-4 h-4" /> {busy ? 'Building report…' : 'Build pre-listing report'}
          </Button>
        </form>
      </Panel>

      {reports.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {reports.map((r) => (
            <button key={r.id} onClick={() => setActive(r)} className={`rounded-full border px-3 py-1.5 text-xs ${active?.id === r.id ? 'border-amber-400/40 bg-amber-400/10 text-white' : 'border-ocean-300/15 text-neutral-400 hover:text-white'}`}>{r.address}</button>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-6 space-y-6">
          <Panel className="p-6">
            <h2 className="text-lg font-semibold tracking-tight text-white">{active.address}</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">{active.market_summary}</p>
            {active.agent_opinion_of_value > 0 && (
              <p className="mt-3 text-xs text-neutral-400">Agent opinion of value: <span className="text-white">{money(active.agent_opinion_of_value)}</span> · Mortgage balance: <span className="text-white">{active.mortgage_balance ? money(active.mortgage_balance) : '—'}</span></p>
            )}
          </Panel>

          <CompsTable comps={active.comps} />

          <StrategyCards strategies={active.strategies} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-ocean-300">Likely buyer segments</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {(active.buyer_segments || []).map((b, i) => <li key={i}>• {b}</li>)}
              </ul>
            </Panel>
            <Panel className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-ocean-300">Property preparation</h3>
              <ul className="mt-4 space-y-2 text-sm text-neutral-300">
                {(active.preparation_steps || []).map((b, i) => <li key={i}>• {b}</li>)}
              </ul>
            </Panel>
          </div>

          <RenovationOptions options={active.renovation_options} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-ocean-300">Launch strategy</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{active.launch_strategy}</p>
            </Panel>
            <Panel className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-ocean-300">Marketing preview</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{active.marketing_preview}</p>
            </Panel>
          </div>

          {active.seller_proceeds_notes && (
            <Panel className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-ocean-300">Seller proceeds</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-300">{active.seller_proceeds_notes}</p>
            </Panel>
          )}

          <Disclaimer>Pricing, timelines, renovation costs and proceeds are AI-generated estimates — confirm with MLS data, public records, local contractors and a title or settlement professional before presenting them as fact.</Disclaimer>
        </div>
      )}
    </div>
  );
}
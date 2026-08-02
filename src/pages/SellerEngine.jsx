import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import Disclaimer from '@/components/ui/disclaimer';
import ProspectForm from '@/components/seller/ProspectForm';
import ProspectCard from '@/components/seller/ProspectCard';
import { Plus } from 'lucide-react';

export default function SellerEngine() {
  const [prospects, setProspects] = useState([]);
  const [open, setOpen] = useState(false);
  const [scoringId, setScoringId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const rows = await base44.entities.SellerProspect.list('-created_date', 200);
    setProspects(rows.sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0)));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const score = async (p) => {
    setScoringId(p.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You score seller-listing opportunities for a real estate agent using ONLY the information the agent supplied below. Never invent facts, never assume life events, never reference protected characteristics (race, religion, national origin, sex, familial status, disability). If data is missing, say the data is missing instead of guessing.

Prospect data:
Name: ${p.full_name}
Signal: ${p.signal_type}
Property: ${p.property_address || 'unknown'} (${p.area || 'area unknown'})
Years owned: ${p.years_owned ?? 'unknown'}
Estimated value: ${p.estimated_value ?? 'unknown'}
Estimated mortgage balance: ${p.estimated_mortgage_balance ?? 'unknown'}
Agent notes: ${p.engagement_notes || 'none'}

Return an opportunity score 0-100, 3-6 short explainable reasons that each cite a specific supplied signal, and one concrete recommended next action for the agent.`,
      response_json_schema: {
        type: 'object',
        properties: {
          opportunity_score: { type: 'number' },
          score_reasons: { type: 'array', items: { type: 'string' } },
          recommended_action: { type: 'string' },
        },
      },
    });
    await base44.entities.SellerProspect.update(p.id, res);
    setScoringId(null);
    load();
  };

  const setStage = async (p, stage) => {
    await base44.entities.SellerProspect.update(p.id, { stage });
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow="Seller Acquisition"
        title="Seller opportunity engine"
        subtitle="Rank the homeowners most likely to list, based on signals you entered or legally obtained — with the reasoning shown for every score."
        action={<Button onClick={() => setOpen(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4" /> Add prospect</Button>}
      />
      {loading ? (
        <div className="py-16 text-center text-neutral-500">Loading prospects…</div>
      ) : prospects.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">No prospects yet. Add a homeowner to start scoring opportunities.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {prospects.map((p) => (
            <ProspectCard key={p.id} prospect={p} onScore={score} onStage={setStage} scoring={scoringId === p.id} />
          ))}
        </div>
      )}
      <Disclaimer>Scores are AI estimates based on the data you entered — not verified facts, credit data, or predictions of a person's private circumstances. Only add information you obtained lawfully and with permission to contact.</Disclaimer>
      <ProspectForm open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  );
}
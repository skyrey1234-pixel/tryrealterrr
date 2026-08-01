import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

const BUYER_Q = ['What area are you interested in?', 'What is your budget?', 'Are you pre-approved?', 'When do you want to move?', 'How many bedrooms do you need?', 'Are you working with another agent?'];
const SELLER_Q = ['What is the property address?', 'Why are you considering selling?', 'How soon do you want to sell?', 'Do you currently have a mortgage?', 'Have you spoken with another agent?', 'What price are you expecting?'];

export default function QualifyPanel({ lead, onUpdated }) {
  const questions = lead.lead_type === 'seller' ? SELLER_Q : BUYER_Q;
  const [answers, setAnswers] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a real estate lead qualification assistant. Qualify this ${lead.lead_type} lead.\n\nLead on file: ${JSON.stringify(lead)}\n\nQualification questions: ${questions.join(' ')}\n\nAgent's notes / lead answers:\n${answers || '(no answers captured yet — infer from the data on file)'}\n\nScore 0-100 and classify temperature as hot, warm, long_term, or unqualified. Extract any structured details you can. Write a 2-3 sentence summary telling the agent why this lead matters and what to do next.`,
      response_json_schema: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          temperature: { type: 'string', enum: ['hot', 'warm', 'long_term', 'unqualified'] },
          ai_summary: { type: 'string' },
          area: { type: 'string' },
          timeline: { type: 'string' },
          budget_max: { type: 'number' },
          bedrooms: { type: 'number' },
          pre_approved: { type: 'boolean' },
          expected_price: { type: 'number' },
          reason_for_selling: { type: 'string' },
        },
      },
    });
    const clean = Object.fromEntries(Object.entries(res).filter(([, v]) => v !== null && v !== undefined && v !== ''));
    await base44.entities.Lead.update(lead.id, { ...clean, status: lead.status === 'new' ? 'qualified' : lead.status });
    setBusy(false);
    onUpdated();
  };

  return (
    <Panel className="p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h2 className="text-lg font-semibold text-white tracking-tight">AI Qualification</h2>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-neutral-500">
        {questions.map((q) => <li key={q}>· {q}</li>)}
      </ul>
      <Textarea value={answers} onChange={(e) => setAnswers(e.target.value)} rows={4} placeholder="Paste what the lead told you…"
        className="mt-4 bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600" />
      <Button onClick={run} disabled={busy} className="mt-4 w-full bg-amber-500 text-black hover:bg-amber-400">{busy ? 'Scoring lead…' : 'Score & qualify lead'}</Button>
      {lead.ai_summary && (
        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">AI summary · score {lead.score ?? '—'}</div>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{lead.ai_summary}</p>
        </div>
      )}
    </Panel>
  );
}
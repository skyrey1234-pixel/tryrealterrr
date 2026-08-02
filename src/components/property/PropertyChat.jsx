import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui/disclaimer';
import { Send } from 'lucide-react';

const SUGGESTED = [
  'What are the standout features of this home?',
  'How much space is there, and how is it laid out?',
  'What should I know before making an offer?',
  'What questions should I ask the seller?',
];

export default function PropertyChat({ listing }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const ask = async (question) => {
    if (!question.trim() || busy) return;
    const history = [...messages, { role: 'buyer', text: question }];
    setMessages(history);
    setInput('');
    setBusy(true);
    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a helpful listing assistant answering a prospective buyer's questions about one specific property. Answer only from the property facts below plus general, factual real estate process knowledge.

Rules:
- If a fact isn't in the data, say it needs to be confirmed with the agent — never invent measurements, permits, HOA fees, taxes, or history.
- Never characterize neighborhoods subjectively (quality, safety, who lives there) and never reference protected characteristics — describe the property only.
- No legal, lending, tax, or appraisal advice. Estimates are educational only.
- Warm, concise, 2-4 short paragraphs max.

Property data: ${JSON.stringify({
        address: listing.address, city: listing.city, price: listing.price, bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms, sqft: listing.sqft, property_type: listing.property_type,
        status: listing.status, features: listing.features, description: listing.description,
      })}

Conversation so far: ${history.map((m) => `${m.role}: ${m.text}`).join('\n')}

Answer the buyer's latest question.`,
      response_json_schema: {
        type: 'object',
        properties: {
          answer: { type: 'string' },
          agent_followups: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    setMessages([...history, { role: 'assistant', text: answer.answer, followups: answer.agent_followups }]);
    setBusy(false);
  };

  return (
    <Panel className="p-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">Ask about this home</h2>

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTED.map((q) => (
            <button key={q} onClick={() => ask(q)} className="rounded-full border border-ocean-300/15 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:border-amber-400/40">{q}</button>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'buyer' ? 'text-right' : ''}>
            <div className={`inline-block max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'buyer' ? 'bg-amber-500/15 text-white' : 'bg-white/[0.04] text-neutral-200'}`}>
              {m.text}
            </div>
            {m.followups?.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-ocean-200">
                {m.followups.map((f, j) => <li key={j}>• Ask the agent: {f}</li>)}
              </ul>
            )}
          </div>
        ))}
        {busy && <div className="text-xs text-neutral-500">Thinking…</div>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-5 flex gap-2">
        <input className={inputCls} placeholder="Type a question about this property…" value={input} onChange={(e) => setInput(e.target.value)} />
        <Button type="submit" disabled={busy} className="bg-amber-500 text-black hover:bg-amber-400"><Send className="w-4 h-4" /></Button>
      </form>
    </Panel>
  );
}
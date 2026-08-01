import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Wand2 } from 'lucide-react';
import { format } from 'date-fns';

export default function FollowUpPanel({ lead }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => setMessages(await base44.entities.Message.filter({ lead_id: lead.id }, '-sent_at', 50));
  useEffect(() => { load(); }, [lead.id]);

  const generate = async () => {
    setBusy(true);
    const text = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, friendly follow-up text message (under 320 characters) from a realtor's assistant to this ${lead.lead_type} lead. Reference their specifics naturally and end with one easy question. Lead: ${JSON.stringify(lead)}. Previous messages: ${messages.map((m) => m.body).join(' | ') || 'none'}. Return only the message text.`,
    });
    setDraft(typeof text === 'string' ? text.trim() : '');
    setBusy(false);
  };

  const send = async () => {
    if (!draft.trim()) return;
    await base44.entities.Message.create({ lead_id: lead.id, body: draft.trim(), channel: 'sms', direction: 'outbound', sent_at: new Date().toISOString() });
    await base44.entities.Lead.update(lead.id, { last_contacted: new Date().toISOString(), status: lead.status === 'new' ? 'contacted' : lead.status });
    setDraft('');
    load();
  };

  return (
    <Panel className="p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-amber-500" />
        <h2 className="text-lg font-semibold text-white tracking-tight">Follow-Up</h2>
      </div>
      <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="Write a message, or let the AI draft it…"
        className="mt-4 bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600" />
      <div className="mt-3 flex gap-2">
        <Button onClick={generate} disabled={busy} variant="outline" className="flex-1 border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white">
          <Wand2 className="w-4 h-4 mr-1.5" />{busy ? 'Writing…' : 'AI draft'}
        </Button>
        <Button onClick={send} disabled={!draft.trim()} className="flex-1 bg-amber-500 text-black hover:bg-amber-400">Log & send</Button>
      </div>

      <div className="mt-6 space-y-3">
        {messages.length === 0 && <p className="text-sm text-neutral-500">No messages logged yet.</p>}
        {messages.map((m) => (
          <div key={m.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-600">
              {m.direction} · {m.sent_at ? format(new Date(m.sent_at), 'MMM d, h:mm a') : ''}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{m.body}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
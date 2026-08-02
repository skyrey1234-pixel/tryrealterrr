import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui/disclaimer';
import { Brain } from 'lucide-react';

export default function BuyerMemory({ profile, onUpdated }) {
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!note.trim()) return;
    setBusy(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `A buyer just toured a home and said: "${note}". Their current learned preferences: ${(profile.learned_preferences || []).join('; ') || 'none yet'}.
Extract what they liked, what they disliked or consider dealbreakers, and an updated list of learned preferences (objective property attributes only — never neighborhood quality judgments, safety claims, or demographics).`,
      response_json_schema: {
        type: 'object',
        properties: {
          liked: { type: 'array', items: { type: 'string' } },
          disliked: { type: 'array', items: { type: 'string' } },
          learned_preferences: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    await base44.entities.BuyerProfile.update(profile.id, {
      learned_preferences: res.learned_preferences,
      showing_reactions: [
        ...(profile.showing_reactions || []),
        { address, raw_note: note, liked: res.liked, disliked: res.disliked, created_at: new Date().toISOString() },
      ],
    });
    setNote(''); setAddress(''); setBusy(false);
    onUpdated?.();
  };

  return (
    <Panel className="p-6">
      <h2 className="text-lg font-semibold tracking-tight text-white">Buyer memory</h2>
      <p className="mt-1 text-xs text-neutral-400">Log a reaction after each showing — matches get smarter as preferences build up.</p>
      <div className="mt-4 space-y-3">
        <input className={inputCls} placeholder="Property address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <textarea className={inputCls} rows={3} placeholder="“Loved the backyard, kitchen felt too small, upstairs layout was odd…”" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={save} disabled={busy} className="bg-amber-500 text-black hover:bg-amber-400"><Brain className="w-4 h-4" /> {busy ? 'Learning…' : 'Save reaction'}</Button>
      </div>

      {profile.learned_preferences?.length > 0 && (
        <div className="mt-5">
          <div className="text-[11px] uppercase tracking-widest text-ocean-300">Learned preferences</div>
          <ul className="mt-2 space-y-1.5 text-xs text-neutral-300">
            {profile.learned_preferences.map((p, i) => <li key={i}>• {p}</li>)}
          </ul>
        </div>
      )}

      {profile.showing_reactions?.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="text-[11px] uppercase tracking-widest text-ocean-300">Showing history</div>
          {profile.showing_reactions.slice().reverse().map((r, i) => (
            <div key={i} className="rounded-xl border border-ocean-300/12 bg-white/[0.03] p-3">
              <div className="text-xs text-white">{r.address || 'Property'}</div>
              <p className="mt-1 text-xs text-neutral-400">{r.raw_note}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(r.liked || []).map((t, j) => <span key={`l${j}`} className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-300">+ {t}</span>)}
                {(r.disliked || []).map((t, j) => <span key={`d${j}`} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300">− {t}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const field = 'bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600';
const empty = { full_name: '', phone: '', email: '', timeline: '', budget_max: '', notes: '' };

export default function CheckIn() {
  const { id } = useParams();
  const [oh, setOh] = useState(null);
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { base44.entities.OpenHouse.get(id).then(setOh).catch(() => setOh(false)); }, [id]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Lead.create({
      full_name: form.full_name, phone: form.phone, email: form.email,
      timeline: form.timeline, budget_max: Number(form.budget_max) || undefined,
      notes: form.notes, lead_type: 'buyer', source: 'open_house',
      open_house_id: id, area: oh?.address, status: 'new',
    });
    setSaving(false); setDone(true);
  };

  if (oh === false) return <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-neutral-500">Open house not found.</div>;

  return (
    <div className="min-h-screen bg-[#0B0D10] px-5 py-16 text-neutral-200">
      <div className="mx-auto max-w-md">
        <div className="text-[11px] uppercase tracking-[0.28em] text-amber-500/80">Open House</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{oh?.address || 'Welcome'}</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">Sign in below and we'll send you the details on this home plus similar listings.</p>

        {done ? (
          <Panel className="mt-8 p-8 text-center">
            <Check className="mx-auto h-8 w-8 text-emerald-400" />
            <div className="mt-4 text-lg text-white">Thanks for visiting!</div>
            <p className="mt-2 text-sm text-neutral-400">Your agent will reach out shortly with details on this property and similar homes.</p>
          </Panel>
        ) : (
          <Panel className="mt-8 p-6">
            <form onSubmit={submit} className="space-y-3">
              <Input required placeholder="Full name" value={form.full_name} onChange={set('full_name')} className={field} />
              <Input required placeholder="Phone number" value={form.phone} onChange={set('phone')} className={field} />
              <Input placeholder="Email" value={form.email} onChange={set('email')} className={field} />
              <Input placeholder="Buying timeline (e.g. 3 months)" value={form.timeline} onChange={set('timeline')} className={field} />
              <Input type="number" placeholder="Budget" value={form.budget_max} onChange={set('budget_max')} className={field} />
              <Input placeholder="Current housing situation" value={form.notes} onChange={set('notes')} className={field} />
              <Button type="submit" disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400">{saving ? 'Checking you in…' : 'Check in'}</Button>
            </form>
          </Panel>
        )}
      </div>
    </div>
  );
}
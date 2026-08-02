import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

const field = 'bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600';
const select = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white';
const STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled'];

export default function Showings() {
  const [showings, setShowings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ lead_id: '', listing_id: '', date: '', time: '' });

  const load = async () => {
    const [s, l, li] = await Promise.all([
      base44.entities.Showing.list('date', 100),
      base44.entities.Lead.list('-created_date', 200),
      base44.entities.Listing.list('-created_date', 100),
    ]);
    setShowings(s); setLeads(l); setListings(li);
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const lead = leads.find((l) => l.id === form.lead_id);
    const listing = listings.find((l) => l.id === form.listing_id);
    await base44.entities.Showing.create({
      ...form, lead_name: lead?.full_name, address: listing?.address, status: 'scheduled',
    });
    setForm({ lead_id: '', listing_id: '', date: '', time: '' });
    setCreating(false); load();
  };

  const updateStatus = async (s, status) => { await base44.entities.Showing.update(s.id, { status }); load(); };

  return (
    <div>
      <PageHeader eyebrow="Scheduling" title="Showings" subtitle="Book buyers into properties, confirm times and capture feedback after each tour."
        action={<Button onClick={() => setCreating(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4 mr-1.5" /> Schedule showing</Button>} />

      <Panel className="divide-y divide-white/[0.05]">
        {showings.length === 0 && <p className="p-8 text-sm text-neutral-500">No showings scheduled yet.</p>}
        {showings.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white">{s.address || 'Property TBD'}</div>
              <div className="text-xs text-neutral-500">{s.lead_name} · {s.date ? format(new Date(s.date + 'T00:00:00'), 'EEE, MMM d') : ''} {s.time}</div>
            </div>
            <select value={s.status} onChange={(e) => updateStatus(s, e.target.value)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs capitalize text-neutral-300">
              {STATUSES.map((st) => <option key={st} value={st} className="bg-ocean-900">{st}</option>)}
            </select>
          </div>
        ))}
      </Panel>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="bg-ocean-900 border-white/10 text-neutral-200">
          <DialogHeader><DialogTitle className="text-white">Schedule showing</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <select required value={form.lead_id} onChange={set('lead_id')} className={select}>
              <option value="">Select buyer</option>
              {leads.map((l) => <option key={l.id} value={l.id} className="bg-ocean-900">{l.full_name}</option>)}
            </select>
            <select required value={form.listing_id} onChange={set('listing_id')} className={select}>
              <option value="">Select property</option>
              {listings.map((l) => <option key={l.id} value={l.id} className="bg-ocean-900">{l.address}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <Input required type="date" value={form.date} onChange={set('date')} className={field} />
              <Input required type="time" value={form.time} onChange={set('time')} className={field} />
            </div>
            <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-400">Schedule</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QrPanel from '@/components/openhouse/QrPanel';
import { Plus, QrCode, Users } from 'lucide-react';
import { format } from 'date-fns';

const field = 'bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600';

export default function OpenHouses() {
  const [items, setItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState(null);
  const [form, setForm] = useState({ address: '', date: '', start_time: '', end_time: '' });

  const load = async () => {
    const [oh, leads] = await Promise.all([
      base44.entities.OpenHouse.list('-date', 50),
      base44.entities.Lead.filter({ source: 'open_house' }, '-created_date', 200),
    ]);
    setItems(oh); setVisitors(leads);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await base44.entities.OpenHouse.create(form);
    setForm({ address: '', date: '', start_time: '', end_time: '' });
    setCreating(false); load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <PageHeader eyebrow="Lead Capture" title="Open Houses" subtitle="Every open house gets its own QR code. Visitors check in on their phone and land straight in your pipeline."
        action={<Button onClick={() => setCreating(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4 mr-1.5" /> New open house</Button>} />

      <div className="grid gap-5 sm:grid-cols-2">
        {items.length === 0 && <Panel className="p-8 text-sm text-neutral-500 sm:col-span-2">No open houses scheduled yet.</Panel>}
        {items.map((oh) => {
          const count = visitors.filter((v) => v.open_house_id === oh.id).length;
          return (
            <Panel key={oh.id} className="p-6 transition-all duration-300 hover:bg-white/[0.04]">
              <div className="text-sm text-white">{oh.address}</div>
              <div className="mt-1 text-xs text-neutral-500">
                {oh.date ? format(new Date(oh.date + 'T00:00:00'), 'EEE, MMM d') : ''} {oh.start_time && `· ${oh.start_time}–${oh.end_time}`}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400"><Users className="w-3.5 h-3.5" /> {count} visitor{count === 1 ? '' : 's'}</span>
                <Button onClick={() => setQrFor(oh)} variant="outline" className="border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white">
                  <QrCode className="w-4 h-4 mr-1.5" /> QR code
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="bg-ocean-900 border-white/10 text-neutral-200">
          <DialogHeader><DialogTitle className="text-white">New open house</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <Input required placeholder="Property address" value={form.address} onChange={set('address')} className={field} />
            <Input required type="date" value={form.date} onChange={set('date')} className={field} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="time" value={form.start_time} onChange={set('start_time')} className={field} />
              <Input type="time" value={form.end_time} onChange={set('end_time')} className={field} />
            </div>
            <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-400">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      <QrPanel openHouse={qrFor} open={!!qrFor} onOpenChange={(v) => !v && setQrFor(null)} />
    </div>
  );
}
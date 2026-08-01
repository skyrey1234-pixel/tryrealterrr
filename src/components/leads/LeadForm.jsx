import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const field = 'bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600';

export default function LeadForm({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', lead_type: 'buyer', area: '', budget_max: '', property_address: '', expected_price: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, budget_max: form.budget_max ? Number(form.budget_max) : undefined, expected_price: form.expected_price ? Number(form.expected_price) : undefined, source: 'manual' };
    const lead = await base44.entities.Lead.create(payload);
    setSaving(false);
    setForm({ full_name: '', phone: '', email: '', lead_type: 'buyer', area: '', budget_max: '', property_address: '', expected_price: '' });
    onOpenChange(false);
    onSaved?.(lead);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0E1115] border-white/10 text-neutral-200">
        <DialogHeader><DialogTitle className="text-white">Add lead</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Full name" value={form.full_name} onChange={set('full_name')} className={field} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Phone" value={form.phone} onChange={set('phone')} className={field} />
            <Input placeholder="Email" value={form.email} onChange={set('email')} className={field} />
          </div>
          <div className="flex gap-2">
            {['buyer', 'seller'].map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, lead_type: t })}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm capitalize transition-colors ${form.lead_type === t ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-white/10 text-neutral-400'}`}>{t}</button>
            ))}
          </div>
          {form.lead_type === 'buyer' ? (
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Area of interest" value={form.area} onChange={set('area')} className={field} />
              <Input type="number" placeholder="Max budget" value={form.budget_max} onChange={set('budget_max')} className={field} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Property address" value={form.property_address} onChange={set('property_address')} className={field} />
              <Input type="number" placeholder="Expected price" value={form.expected_price} onChange={set('expected_price')} className={field} />
            </div>
          )}
          <Button type="submit" disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400">{saving ? 'Saving…' : 'Add lead'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
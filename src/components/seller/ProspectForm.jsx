import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui/disclaimer';

const SIGNALS = [
  ['valuation_request', 'Requested home valuation'],
  ['past_client', 'Past client'],
  ['expired_listing', 'Expired listing'],
  ['withdrawn_listing', 'Withdrawn listing'],
  ['old_buyer_lead', 'Old buyer lead, now owns'],
  ['inherited_property', 'Inherited property inquiry'],
  ['investor_owned', 'Investor owned'],
  ['content_engagement', 'Engaged with seller content'],
  ['direct_mail_qr', 'Scanned direct-mail QR'],
  ['long_tenure', 'Long ownership tenure'],
];

const empty = { full_name: '', email: '', phone: '', property_address: '', area: '', signal_type: 'valuation_request', years_owned: '', estimated_value: '', estimated_mortgage_balance: '', engagement_notes: '' };

export default function ProspectForm({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.SellerProspect.create({
      ...form,
      years_owned: Number(form.years_owned) || undefined,
      estimated_value: Number(form.estimated_value) || undefined,
      estimated_mortgage_balance: Number(form.estimated_mortgage_balance) || undefined,
    });
    setSaving(false);
    setForm(empty);
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ocean-900 border-ocean-300/20 max-w-lg">
        <DialogHeader><DialogTitle className="text-white">Add seller prospect</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <input className={inputCls} placeholder="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            <input className={inputCls} placeholder="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <input className={inputCls} placeholder="Property address" value={form.property_address} onChange={(e) => set('property_address', e.target.value)} />
          <input className={inputCls} placeholder="Area / neighborhood" value={form.area} onChange={(e) => set('area', e.target.value)} />
          <select className={inputCls} value={form.signal_type} onChange={(e) => set('signal_type', e.target.value)}>
            {SIGNALS.map(([v, l]) => <option key={v} value={v} className="bg-ocean-900">{l}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <input className={inputCls} placeholder="Years owned" value={form.years_owned} onChange={(e) => set('years_owned', e.target.value)} />
            <input className={inputCls} placeholder="Est. value" value={form.estimated_value} onChange={(e) => set('estimated_value', e.target.value)} />
            <input className={inputCls} placeholder="Mortgage bal." value={form.estimated_mortgage_balance} onChange={(e) => set('estimated_mortgage_balance', e.target.value)} />
          </div>
          <textarea className={inputCls} rows={3} placeholder="Engagement notes — emails opened, content viewed, conversations, consent to contact…" value={form.engagement_notes} onChange={(e) => set('engagement_notes', e.target.value)} />
          <Button type="submit" disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400">{saving ? 'Saving…' : 'Add prospect'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
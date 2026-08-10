import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui/disclaimer';

const empty = {
  address: '', unit: '', city: '', property_type: 'single_family', bedrooms: '', bathrooms: '',
  monthly_rent: '', status: 'occupied', tenant_name: '', tenant_email: '', tenant_phone: '',
  lease_start: '', lease_end: '', security_deposit: '', owner_name: '', notes: '',
};

const num = (v) => (v === '' ? undefined : Number(v));

export default function RentalForm({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await base44.entities.Rental.create({
      ...form,
      bedrooms: num(form.bedrooms),
      bathrooms: num(form.bathrooms),
      monthly_rent: num(form.monthly_rent),
      security_deposit: num(form.security_deposit),
    });
    setBusy(false);
    setForm(empty);
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-ocean-300/15 bg-[#07222B] text-white sm:max-w-2xl">
        <DialogHeader><DialogTitle>Add rental unit</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <input className={inputCls + ' sm:col-span-2'} placeholder="Property address *" required value={form.address} onChange={(e) => set('address', e.target.value)} />
          <input className={inputCls} placeholder="Unit / apt #" value={form.unit} onChange={(e) => set('unit', e.target.value)} />
          <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
          <select className={inputCls} value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>
            <option value="single_family">Single family</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="duplex">Duplex</option>
            <option value="apartment">Apartment</option>
          </select>
          <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="occupied">Occupied</option>
            <option value="notice_given">Notice given</option>
            <option value="vacant">Vacant</option>
            <option value="turnover">In turnover</option>
          </select>
          <input className={inputCls} type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
          <input className={inputCls} type="number" step="0.5" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
          <input className={inputCls} type="number" placeholder="Monthly rent" value={form.monthly_rent} onChange={(e) => set('monthly_rent', e.target.value)} />
          <input className={inputCls} type="number" placeholder="Security deposit held" value={form.security_deposit} onChange={(e) => set('security_deposit', e.target.value)} />
          <input className={inputCls} placeholder="Tenant name" value={form.tenant_name} onChange={(e) => set('tenant_name', e.target.value)} />
          <input className={inputCls} placeholder="Owner (if managed for a client)" value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} />
          <input className={inputCls} placeholder="Tenant email" value={form.tenant_email} onChange={(e) => set('tenant_email', e.target.value)} />
          <input className={inputCls} placeholder="Tenant phone" value={form.tenant_phone} onChange={(e) => set('tenant_phone', e.target.value)} />
          <label className="text-xs text-neutral-400">Lease start
            <input className={inputCls + ' mt-1'} type="date" value={form.lease_start} onChange={(e) => set('lease_start', e.target.value)} />
          </label>
          <label className="text-xs text-neutral-400">Lease end
            <input className={inputCls + ' mt-1'} type="date" value={form.lease_end} onChange={(e) => set('lease_end', e.target.value)} />
          </label>
          <textarea className={inputCls + ' sm:col-span-2'} rows={2} placeholder="Notes — maintenance, renewal talks, rent history" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={busy} className="bg-amber-500 text-white hover:bg-amber-600">
              {busy ? 'Saving…' : 'Add unit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
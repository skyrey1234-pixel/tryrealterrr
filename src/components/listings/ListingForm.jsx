import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const field = 'bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600';
const empty = { address: '', city: '', price: '', bedrooms: '', bathrooms: '', sqft: '', features: '', photo_url: '' };

export default function ListingForm({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Listing.create({
      address: form.address, city: form.city, photo_url: form.photo_url,
      price: Number(form.price) || undefined, bedrooms: Number(form.bedrooms) || undefined,
      bathrooms: Number(form.bathrooms) || undefined, sqft: Number(form.sqft) || undefined,
      features: form.features ? form.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
    });
    setSaving(false); setForm(empty); onOpenChange(false); onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ocean-900 border-ocean-300/20 text-neutral-200">
        <DialogHeader><DialogTitle className="text-white">Add listing</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input required placeholder="Address" value={form.address} onChange={set('address')} className={field} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="City" value={form.city} onChange={set('city')} className={field} />
            <Input type="number" placeholder="Price" value={form.price} onChange={set('price')} className={field} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" placeholder="Beds" value={form.bedrooms} onChange={set('bedrooms')} className={field} />
            <Input type="number" placeholder="Baths" value={form.bathrooms} onChange={set('bathrooms')} className={field} />
            <Input type="number" placeholder="Sq ft" value={form.sqft} onChange={set('sqft')} className={field} />
          </div>
          <Input placeholder="Photo URL" value={form.photo_url} onChange={set('photo_url')} className={field} />
          <Textarea rows={2} placeholder="Features, comma separated" value={form.features} onChange={set('features')} className={field} />
          <Button type="submit" disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400">{saving ? 'Saving…' : 'Add listing'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
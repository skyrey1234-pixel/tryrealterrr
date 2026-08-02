import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/ui/disclaimer';

const empty = { address: '', client_name: '', side: 'buy', purchase_price: '', contract_date: '', inspection_deadline: '', appraisal_deadline: '', financing_deadline: '', closing_date: '' };

export default function TransactionForm({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Transaction.create({ ...form, purchase_price: Number(form.purchase_price) || undefined });
    setSaving(false);
    setForm(empty);
    onOpenChange(false);
    onSaved?.();
  };

  const dateField = (key, label) => (
    <label className="block text-xs text-neutral-400">
      {label}
      <input type="date" className={`${inputCls} mt-1`} value={form[key]} onChange={(e) => set(key, e.target.value)} />
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ocean-900 border-ocean-300/20 max-w-lg">
        <DialogHeader><DialogTitle className="text-white">Add transaction</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <input className={inputCls} placeholder="Property address" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Client name" value={form.client_name} onChange={(e) => set('client_name', e.target.value)} />
            <select className={inputCls} value={form.side} onChange={(e) => set('side', e.target.value)}>
              <option value="buy" className="bg-ocean-900">Buy side</option>
              <option value="sell" className="bg-ocean-900">Sell side</option>
            </select>
          </div>
          <input className={inputCls} placeholder="Purchase price" value={form.purchase_price} onChange={(e) => set('purchase_price', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            {dateField('contract_date', 'Contract date')}
            {dateField('inspection_deadline', 'Inspection deadline')}
            {dateField('appraisal_deadline', 'Appraisal deadline')}
            {dateField('financing_deadline', 'Financing deadline')}
            {dateField('closing_date', 'Closing date')}
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-amber-500 text-black hover:bg-amber-400">{saving ? 'Saving…' : 'Add transaction'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
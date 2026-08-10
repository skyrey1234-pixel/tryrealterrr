import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Panel, PageHeader } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { money } from '@/lib/commission';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import RentalForm from '@/components/rentals/RentalForm';
import RentalCard from '@/components/rentals/RentalCard';

export default function Rentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const data = await base44.entities.Rental.list('-created_date', 200);
    setRentals(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.Rental.update(id, { status });
    load();
  };

  const occupied = rentals.filter((r) => r.status === 'occupied');
  const rentRoll = occupied.reduce((s, r) => s + (r.monthly_rent || 0), 0);
  const expiring = rentals.filter((r) => {
    if (!r.lease_end) return false;
    const d = differenceInCalendarDays(parseISO(r.lease_end), new Date());
    return d >= 0 && d <= 90;
  });

  const stats = [
    { label: 'Units', value: rentals.length },
    { label: 'Occupied', value: rentals.length ? `${occupied.length} / ${rentals.length}` : '—' },
    { label: 'Monthly rent roll', value: money(rentRoll) },
    { label: 'Leases ending ≤ 90 days', value: expiring.length },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Rentals"
        subtitle="Track the units you own or manage — tenants, rent, and lease dates in one place, alongside your sales pipeline."
        action={
          <Button onClick={() => setShowForm(true)} className="bg-amber-500 text-white hover:bg-amber-600">
            <Plus className="h-4 w-4" /> Add unit
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Panel key={s.label} className="p-5">
            <div className="text-[11px] uppercase tracking-[0.2em] text-ocean-300">{s.label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{s.value}</div>
          </Panel>
        ))}
      </div>

      {expiring.length > 0 && (
        <Panel className="mb-8 p-5">
          <h3 className="text-sm uppercase tracking-widest text-sand-200">Renewals to handle</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-300">
            {expiring.map((r) => (
              <li key={r.id} className="flex justify-between gap-4">
                <span>{r.address}{r.unit ? ` · ${r.unit}` : ''}</span>
                <span className="text-neutral-500">
                  {differenceInCalendarDays(parseISO(r.lease_end), new Date())} days left
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Loading rentals…</p>
      ) : rentals.length === 0 ? (
        <Panel className="p-10 text-center">
          <p className="text-sm text-neutral-400">No rental units yet. Add your first one to start tracking rent and lease dates.</p>
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rentals.map((r) => (
            <RentalCard key={r.id} rental={r} onStatusChange={updateStatus} />
          ))}
        </div>
      )}

      <RentalForm open={showForm} onOpenChange={setShowForm} onSaved={load} />
    </div>
  );
}
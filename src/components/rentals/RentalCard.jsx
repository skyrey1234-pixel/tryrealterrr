import React from 'react';
import { Panel } from '@/components/ui/panel';
import { money } from '@/lib/commission';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { User, CalendarClock } from 'lucide-react';

const statusCls = {
  occupied: 'bg-ocean-400/15 text-ocean-100 ring-ocean-300/25',
  notice_given: 'bg-sand-300/15 text-sand-200 ring-sand-300/25',
  vacant: 'bg-amber-500/15 text-amber-200 ring-amber-400/25',
  turnover: 'bg-white/10 text-neutral-300 ring-white/15',
};
const statusLabel = { occupied: 'Occupied', notice_given: 'Notice given', vacant: 'Vacant', turnover: 'In turnover' };

export default function RentalCard({ rental, onStatusChange }) {
  const days = rental.lease_end ? differenceInCalendarDays(parseISO(rental.lease_end), new Date()) : null;

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-white">
            {rental.address}{rental.unit ? ` · ${rental.unit}` : ''}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-400">
            {[rental.city, rental.bedrooms && `${rental.bedrooms} bd`, rental.bathrooms && `${rental.bathrooms} ba`].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] ring-1 ${statusCls[rental.status] || statusCls.turnover}`}>
          {statusLabel[rental.status] || rental.status}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{rental.monthly_rent ? money(rental.monthly_rent) : '—'}</span>
        <span className="text-xs text-neutral-500">/ month</span>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-neutral-300">
        {rental.tenant_name && (
          <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-ocean-300" />{rental.tenant_name}</div>
        )}
        {rental.lease_end && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-ocean-300" />
            Lease ends {format(parseISO(rental.lease_end), 'MMM d, yyyy')}
            {days !== null && (
              <span className={days < 0 ? 'text-amber-300' : days <= 90 ? 'text-sand-200' : 'text-neutral-500'}>
                ({days < 0 ? 'expired' : `${days} days`})
              </span>
            )}
          </div>
        )}
        {rental.owner_name && <div className="text-neutral-500">Owner: {rental.owner_name}</div>}
      </div>

      {rental.notes && <p className="mt-3 text-xs leading-relaxed text-neutral-400">{rental.notes}</p>}

      <select
        value={rental.status}
        onChange={(e) => onStatusChange(rental.id, e.target.value)}
        className="mt-4 w-full rounded-lg border border-ocean-300/15 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-ocean-300/40"
      >
        <option value="occupied">Occupied</option>
        <option value="notice_given">Notice given</option>
        <option value="vacant">Vacant</option>
        <option value="turnover">In turnover</option>
      </select>
    </Panel>
  );
}
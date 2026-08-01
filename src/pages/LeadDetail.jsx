import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Panel } from '@/components/ui/panel';
import TemperatureBadge from '@/components/leads/TemperatureBadge';
import QualifyPanel from '@/components/leads/QualifyPanel';
import FollowUpPanel from '@/components/leads/FollowUpPanel';
import { leadCommission, money } from '@/lib/commission';
import { ArrowLeft } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'qualified', 'showing', 'under_contract', 'closed', 'lost'];

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [missing, setMissing] = useState(false);

  const load = async () => {
    try { setLead(await base44.entities.Lead.get(id)); } catch { setMissing(true); }
  };
  useEffect(() => { load(); }, [id]);

  const setStatus = async (s) => { await base44.entities.Lead.update(id, { status: s }); load(); };

  if (missing) return <p className="py-24 text-center text-neutral-500">Lead not found.</p>;
  if (!lead) return <p className="py-24 text-center text-neutral-500">Loading lead…</p>;

  const details = lead.lead_type === 'seller'
    ? [['Property', lead.property_address], ['Expected price', lead.expected_price ? money(lead.expected_price) : null], ['Reason for selling', lead.reason_for_selling], ['Timeline', lead.timeline], ['Has mortgage', lead.has_mortgage === undefined ? null : lead.has_mortgage ? 'Yes' : 'No']]
    : [['Area', lead.area], ['Max budget', lead.budget_max ? money(lead.budget_max) : null], ['Bedrooms', lead.bedrooms], ['Timeline', lead.timeline], ['Pre-approved', lead.pre_approved === undefined ? null : lead.pre_approved ? 'Yes' : 'No']];

  return (
    <div>
      <Link to="/leads" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Leads</Link>

      <div className="mt-5 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">{lead.full_name}</h1>
          <div className="mt-2 text-sm text-neutral-400 capitalize">{lead.lead_type} · {lead.source?.replace('_', ' ')} {lead.phone ? `· ${lead.phone}` : ''} {lead.email ? `· ${lead.email}` : ''}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-400 tabular-nums">Est. {money(leadCommission(lead))}</span>
          <TemperatureBadge value={lead.temperature} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs capitalize transition-colors ${lead.status === s ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-white/10 text-neutral-500 hover:text-white'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Panel className="p-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Details</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {details.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-white/[0.05] pb-2">
              <dt className="text-xs uppercase tracking-[0.16em] text-neutral-600">{k}</dt>
              <dd className="text-sm text-neutral-200">{v ?? '—'}</dd>
            </div>
          ))}
        </dl>
        {lead.notes && <p className="mt-4 text-sm leading-relaxed text-neutral-400">{lead.notes}</p>}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <QualifyPanel lead={lead} onUpdated={load} />
        <FollowUpPanel lead={lead} />
      </div>
    </div>
  );
}
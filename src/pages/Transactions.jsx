import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { PageHeader, Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import Disclaimer, { inputCls } from '@/components/ui/disclaimer';
import TransactionForm from '@/components/transactions/TransactionForm';
import DealHealthCard from '@/components/transactions/DealHealthCard';
import { Plus } from 'lucide-react';
import { money } from '@/lib/commission';

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [issueDraft, setIssueDraft] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const rows = await base44.entities.Transaction.list('closing_date', 100);
    setTxs(rows);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const analyze = async (tx) => {
    setBusyId(tx.id);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You monitor a real estate transaction for developing risk. Today is ${new Date().toISOString().slice(0, 10)}. Use only the data below; do not give legal advice or make the negotiation decision — help the agent intervene early.

Address: ${tx.address} (${tx.side} side)
Purchase price: ${tx.purchase_price || 'unknown'}
Contract date: ${tx.contract_date || 'unknown'}
Inspection deadline: ${tx.inspection_deadline || 'unknown'} — complete: ${!!tx.inspection_complete}
Appraisal deadline: ${tx.appraisal_deadline || 'unknown'} — complete: ${!!tx.appraisal_complete}
Financing deadline: ${tx.financing_deadline || 'unknown'} — cleared: ${!!tx.financing_cleared}
Title cleared: ${!!tx.title_cleared} · Insurance bound: ${!!tx.insurance_bound} · Documents complete: ${!!tx.docs_complete}
Closing date: ${tx.closing_date || 'unknown'}
Open issues noted by agent: ${tx.open_issues || 'none'}

Return a transaction health score 0-100, the single most urgent primary_risk in one sentence, and 2-5 concrete recommended_actions the agent can take today (include a wire-fraud verification reminder if funds are moving soon).`,
      response_json_schema: {
        type: 'object',
        properties: {
          health_score: { type: 'number' },
          primary_risk: { type: 'string' },
          recommended_actions: { type: 'array', items: { type: 'string' } },
        },
      },
    });
    await base44.entities.Transaction.update(tx.id, { ...res, last_analyzed: new Date().toISOString() });
    setBusyId(null);
    load();
  };

  const toggle = async (tx, key) => {
    await base44.entities.Transaction.update(tx.id, { [key]: !tx[key] });
    load();
  };
  const setStatus = async (tx, status) => {
    await base44.entities.Transaction.update(tx.id, { status });
    load();
  };
  const saveIssues = async (tx) => {
    await base44.entities.Transaction.update(tx.id, { open_issues: issueDraft[tx.id] });
    load();
  };

  const active = txs.filter((t) => t.status === 'under_contract' || t.status === 'pending_close');
  const pipeline = active.reduce((sum, t) => sum + Math.round((t.purchase_price || 0) * ((t.commission_rate || 3) / 100)), 0);
  const atRisk = active.filter((t) => (t.health_score || 100) < 70);

  return (
    <div>
      <PageHeader
        eyebrow="Transaction Command"
        title="Deal rescue center"
        subtitle="Track every milestone, surface developing risk early, and know exactly what to chase today."
        action={<Button onClick={() => setOpen(true)} className="bg-amber-500 text-black hover:bg-amber-400"><Plus className="w-4 h-4" /> Add transaction</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="p-5"><div className="text-xs text-neutral-500">Active deals</div><div className="mt-1 text-2xl font-semibold text-white">{active.length}</div></Panel>
        <Panel className="p-5"><div className="text-xs text-neutral-500">Commission in pipeline</div><div className="mt-1 text-2xl font-semibold text-white">{money(pipeline)}</div></Panel>
        <Panel className="p-5"><div className="text-xs text-neutral-500">Deals needing attention</div><div className="mt-1 text-2xl font-semibold text-amber-400">{atRisk.length}</div></Panel>
      </div>

      {loading ? (
        <div className="py-16 text-center text-neutral-500">Loading transactions…</div>
      ) : txs.length === 0 ? (
        <div className="py-16 text-center text-neutral-500">No transactions yet. Add one to start tracking deal health.</div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {txs.map((tx) => (
            <div key={tx.id} className="space-y-2">
              <DealHealthCard tx={tx} onAnalyze={analyze} onToggle={toggle} onStatus={setStatus} analyzing={busyId === tx.id} />
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Open issues — delays, missing docs, disagreements…" value={issueDraft[tx.id] ?? tx.open_issues ?? ''} onChange={(e) => setIssueDraft((d) => ({ ...d, [tx.id]: e.target.value }))} />
                <Button size="sm" variant="outline" className="border-ocean-300/20 text-white" onClick={() => saveIssues(tx)}>Save</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Disclaimer>Health scores and recommendations are AI estimates from the milestones you entered — not legal, lending, or title advice. Always verify wire instructions by phone with a known contact.</Disclaimer>
      <TransactionForm open={open} onOpenChange={setOpen} onSaved={load} />
    </div>
  );
}
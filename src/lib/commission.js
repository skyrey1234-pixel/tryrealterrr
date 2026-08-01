export function leadCommission(lead) {
  if (lead.estimated_commission) return lead.estimated_commission;
  const base = lead.lead_type === 'seller' ? lead.expected_price : lead.budget_max;
  if (!base) return 0;
  return Math.round(base * 0.03);
}

export function money(n) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}
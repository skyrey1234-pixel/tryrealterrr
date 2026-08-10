import React, { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload } from 'lucide-react';

export default function ReportUpload({ onExtract }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setNote('');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          address: { type: 'string' },
          city: { type: 'string' },
          bedrooms: { type: 'number' },
          bathrooms: { type: 'number' },
          sqft: { type: 'number' },
          year_built: { type: 'number' },
          estimated_value: { type: 'number' },
          market_notes: { type: 'string' },
          comps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                sold_price: { type: 'number' },
                sqft: { type: 'number' },
                days_on_market: { type: 'number' },
                notes: { type: 'string' },
              },
            },
          },
        },
      },
    });
    setBusy(false);
    if (res.status !== 'success' || !res.output) {
      setNote("Couldn't read that file — try the PDF or CSV export straight from RPR or your MLS.");
      return;
    }
    const data = Array.isArray(res.output) ? res.output[0] : res.output;
    onExtract(data);
    setNote(`Imported ${data.comps?.length || 0} comparable sale(s)${data.address ? ` for ${data.address}` : ''}. Review the fields below before generating.`);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="mb-5 rounded-xl border border-dashed border-ocean-300/25 bg-ocean-300/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">Import an RPR or MLS report</div>
          <p className="mt-1 text-xs text-neutral-400">Upload the PDF or CSV export — property facts and comparable sales fill in automatically.</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-lg border border-ocean-300/25 px-3 py-2 text-xs text-white hover:border-amber-400/40 disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" /> {busy ? 'Reading report…' : 'Choose file'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept=".pdf,.csv,.xlsx,.json,.png,.jpg,.jpeg" className="hidden" onChange={handle} />
      {note && <p className="mt-3 text-xs text-ocean-200">{note}</p>}
    </div>
  );
}
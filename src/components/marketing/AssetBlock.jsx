import React, { useState } from 'react';
import { Panel } from '@/components/ui/panel';
import { Copy, Check } from 'lucide-react';

export default function AssetBlock({ title, text }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Panel className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.2em] text-amber-500/80">{title}</div>
        <button onClick={copy} className="text-neutral-500 hover:text-white transition-colors">
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">{text}</p>
    </Panel>
  );
}
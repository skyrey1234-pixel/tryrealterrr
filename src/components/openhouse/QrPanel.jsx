import React from 'react';
import { Panel } from '@/components/ui/panel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function QrPanel({ openHouse, open, onOpenChange }) {
  if (!openHouse) return null;
  const url = `${window.location.origin}/checkin/${openHouse.id}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(url)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0E1115] border-white/10 text-neutral-200">
        <DialogHeader><DialogTitle className="text-white">Open house check-in</DialogTitle></DialogHeader>
        <Panel className="p-6 text-center">
          <img src={qr} alt="Open house QR code" className="mx-auto rounded-xl bg-white p-3" />
          <div className="mt-4 text-sm text-white">{openHouse.address}</div>
          <a href={url} className="mt-2 block break-all text-xs text-amber-500 hover:text-amber-400">{url}</a>
          <p className="mt-4 text-[11px] leading-relaxed text-neutral-600">Print this code or show it at the door. Every visitor who scans becomes a lead you can follow up with.</p>
        </Panel>
      </DialogContent>
    </Dialog>
  );
}
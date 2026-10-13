'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface Lead {
  id: number; vehicleId: number; customerName: string; customerEmail?: string; customerPhone: string; status: string; createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/leads')
      .then((res) => res.json())
      .then((data) => setLeads(data.leads ?? []))
      .catch(() => {});
  }, []);

  const visible = filter === 'ALL' ? leads : leads.filter((l) => l.status === filter);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setLeads(leads.map((l) => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Lead Management</h1>
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Backend lifecycle is NEW/CONTACTED/QUALIFIED/FOLLOW_UP/TEST_DRIVE/
            NEGOTIATION/WON/LOST. The page previously used CONVERTED and CLOSED,
            which the route rejects and which never matched any row, so those
            filter tabs were permanently empty. */}
        {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${filter === s ? 'bg-[#FFC700] text-[#15130a]' : 'bg-card text-content border border-line'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-content">{lead.customerName} <span className="text-xs text-content-muted">{lead.customerPhone}</span></p>
              <p className="text-xs text-content-muted">Status: {lead.status}</p>
            </div>
            <div className="flex gap-2">
              {lead.status !== 'WON' && lead.status !== 'LOST' && (
                <>
                  <button onClick={() => updateStatus(lead.id, 'CONTACTED')} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold">Contacted</button>
                  <button onClick={() => updateStatus(lead.id, 'QUALIFIED')} className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold">Qualified</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

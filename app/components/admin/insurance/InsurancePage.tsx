'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface Enquiry {
  id: number; customerName: string; phone: string; coverType: string; status: string; createdAt: string;
}

export default function InsurancePage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/insurance')
      .then((res) => res.json())
      .then((data) => setItems(data.enquiries ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Insurance Management</h1>
      <div className="flex flex-wrap gap-2 mb-5">
        {['ALL', 'NEW', 'CONTACTED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${filter === s ? 'bg-[#FFC700] text-[#15130a]' : 'bg-card text-content border border-line'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {(filter === 'ALL' ? items : items.filter((i) => i.status === filter)).map((item) => (
          <div key={item.id} className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-content">{item.customerName}</p>
              <p className="text-xs text-content-muted">{item.coverType} · {item.phone}</p>
            </div>
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

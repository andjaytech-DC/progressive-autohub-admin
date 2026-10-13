'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface Dealer {
  id: number; userId: number; businessName: string; city: string; state: string; status: string; createdAt: string;
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dealers')
      .then((res) => res.json())
      .then((data) => setDealers(data.dealers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/dealers/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setDealers(dealers.map((d) => d.id === id ? { ...d, status } : d));
  };

  if (loading) return <div className="p-6 text-center text-content-muted">Loading dealers...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Dealer Management</h1>
      <div className="space-y-3">
        {dealers.map((dealer) => (
          <div key={dealer.id} className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-content">{dealer.businessName}</p>
              <p className="text-xs text-content-muted">{dealer.city}, {dealer.state}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${dealer.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : dealer.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{dealer.status}</span>
              {dealer.status === 'PENDING' && (
                <>
                  <button onClick={() => updateStatus(dealer.id, 'APPROVED')} className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">Approve</button>
                  <button onClick={() => updateStatus(dealer.id, 'REJECTED')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">Reject</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

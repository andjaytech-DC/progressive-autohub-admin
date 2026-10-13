'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface FinanceApp {
  id: number; userId: number; vehicleId: number; status: string;
  loanAmount: number; interestRate?: number; tenureMonths?: number;
  emi?: number; createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  vehicle?: { title: string; price: number };
}

export default function FinancePage() {
  const [apps, setApps] = useState<FinanceApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/admin/finance')
      .then((res) => res.json())
      .then((data) => setApps(data.finance ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === 'ALL' ? apps : apps.filter((a) => a.status === filter);
  const stats = {
    total: apps.length,
    draft: apps.filter((a) => a.status === 'DRAFT').length,
    submitted: apps.filter((a) => a.status === 'SUBMITTED').length,
    approved: apps.filter((a) => a.status === 'APPROVED').length,
    rejected: apps.filter((a) => a.status === 'REJECTED').length,
    disbursed: apps.filter((a) => a.status === 'DISBURSED').length,
  };

  const statusBadge = (s: string) => {
    const cls = s === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : s === 'REJECTED' ? 'bg-red-500/10 text-red-400' : s === 'DISBURSED' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400';
    return `px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${cls}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Finance Management</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Draft" value={stats.draft} />
        <StatCard label="Submitted" value={stats.submitted} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Rejected" value={stats.rejected} />
        <StatCard label="Disbursed" value={stats.disbursed} />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${filter === s ? 'bg-[#FFC700] text-[#15130a]' : 'bg-card text-content border border-line'}`}>{s}</button>
        ))}
      </div>
      {loading ? <div className="text-center py-12 text-content-muted">Loading...</div> : (
        <div className="space-y-3">
          {visible.map((app) => (
            <div key={app.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-content text-sm">{app.user?.firstName} {app.user?.lastName}</p>
                  <p className="text-xs text-content-muted">{app.vehicle?.title} — ₹{app.loanAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-content-muted">EMI: ₹{app.emi?.toLocaleString('en-IN')} · {app.tenureMonths} months</p>
                </div>
                <span className={statusBadge(app.status)}>{app.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-line bg-card p-4"><p className="text-xl font-extrabold text-content">{value}</p><p className="text-xs text-content-muted">{label}</p></div>;
}

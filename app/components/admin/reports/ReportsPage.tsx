'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-content-muted">Loading reports...</div>;
  if (!stats) return <div className="text-center py-12 text-content-muted">No data available</div>;

  const gridItems = [
    { label: 'Total Vehicles', value: stats.totalVehicles, color: '#FFC700' },
    { label: 'Available', value: stats.availableVehicles, color: '#22c55e' },
    { label: 'Sold', value: stats.soldVehicles, color: '#3b82f6' },
    { label: 'Total Customers', value: stats.totalCustomers, color: '#a855f7' },
    { label: 'Total Dealers', value: stats.totalDealers, color: '#f97316' },
    { label: 'Pending Dealers', value: stats.pendingDealers, color: '#ef4444' },
    { label: 'Total Leads', value: stats.totalLeads, color: '#06b6d4' },
    { label: 'New Leads', value: stats.newLeads, color: '#8b5cf6' },
    { label: 'Total Orders', value: stats.totalOrders, color: '#ec4899' },
    { label: 'Finance Apps', value: stats.totalFinanceApps, color: '#14b8a6' },
    { label: 'Revenue (This Month)', value: `₹${(stats.revenue ?? 0).toLocaleString('en-IN')}`, color: '#22c55e' },
    { label: 'Inspections', value: stats.totalInspections, color: '#f59e0b' },
    { label: 'Service Bookings', value: stats.totalServiceBookings, color: '#6366f1' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Reports & Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {gridItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-card p-6">
            <p className="text-xs text-content-muted uppercase tracking-wider font-bold">{item.label}</p>
            <p className="text-3xl font-extrabold mt-2" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

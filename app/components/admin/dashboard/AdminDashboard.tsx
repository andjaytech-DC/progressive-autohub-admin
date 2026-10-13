'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';
import AdminPanel from '@/app/components/admin/AdminPanel';
import type { AdminVehicle } from '@/app/components/admin/AdminPanel';

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/vehicles')
      .then((res) => res.json())
      .then((data) => {
        setVehicles((data.vehicles ?? []).map((v: any) => ({
          id: v.id, title: v.title, year: v.year, price: v.price,
          mileage: v.mileage, fuel: v.fuel, transmission: v.transmission,
          color: v.color, images: v.images ?? [], status: v.status,
          listingStatus: v.listingStatus, city: v.city, state: v.state,
          brandId: v.brandId, categoryId: v.categoryId, dealerId: v.dealerId,
          description: v.description, createdAt: v.createdAt,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Admin Dashboard</h1>
      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFC700]" /></div>
      ) : (
        <AdminPanel initialVehicles={vehicles} />
      )}
    </div>
  );
}

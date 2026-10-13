'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';
import AdminPanel from '@/app/components/admin/AdminPanel';
import type { AdminVehicle } from '@/app/components/admin/AdminPanel';
import VehicleForm from '@/app/components/admin/VehicleForm';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [view, setView] = useState<'all' | 'add'>('all');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-white">Inventory</h1>
        <button onClick={() => setView('add')} className="px-4 py-2 bg-[#FFC700] text-[#15130a] rounded-xl font-bold text-sm hover:brightness-110">Add New Vehicle</button>
      </div>
      {view === 'add' ? (
        <VehicleForm onCancel={() => setView('all')} onSuccess={() => { setView('all'); router.refresh(); }} />
      ) : (
        <AdminPanel initialVehicles={vehicles} />
      )}
    </div>
  );
}

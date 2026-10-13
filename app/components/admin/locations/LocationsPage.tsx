'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface Location {
  id: number; name: string; city: string; state: string; pincode: string; active: boolean;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/locations')
      .then((res) => res.json())
      .then((data) => setLocations(data.locations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Locations Management</h1>
      {loading ? <div className="text-center py-12 text-content-muted">Loading...</div> : (
        <div className="space-y-3">
          {locations.map((loc) => (
            <div key={loc.id} className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-content">{loc.name}</p>
                <p className="text-xs text-content-muted">{loc.city}, {loc.state} — {loc.pincode}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${loc.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{loc.active ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

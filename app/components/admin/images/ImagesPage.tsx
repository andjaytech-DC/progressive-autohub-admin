'use client';

import { useEffect, useState } from 'react';

export default function ImagesPage() {
  const [images, setImages] = useState<{ id: number; url: string; vehicleId?: number; createdAt: string }[]>([]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Image Management</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <p className="text-content-muted text-sm">No images uploaded yet</p>
          </div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="rounded-2xl border border-line bg-card overflow-hidden">
              <img src={img.url} alt="Vehicle" className="w-full h-48 object-cover" />
              <div className="p-4">
                <p className="text-sm text-content-muted">Vehicle ID: {img.vehicleId ?? '—'}</p>
                <p className="text-xs text-content-muted">{new Date(img.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

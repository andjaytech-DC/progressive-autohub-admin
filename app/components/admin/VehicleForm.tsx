'use client';

import { useRef, useState, useEffect } from 'react';
import { X, Upload, Star, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface VehicleFormProps {
  onSuccess?: (vehicle: Record<string, unknown>) => void;
  onCancel?: () => void;
  initialData?: Record<string, unknown> | null;
}

interface FormData {
  brandId: number; categoryId: number; dealerId: number;
  model: string; variant: string; year: string; price: string;
  mileage: string; fuel: string; transmission: string; bodyType: string; color: string;
  registrationNumber: string; registrationState: string; city: string; state: string; pincode: string;
  description: string; features: string; highlights: string; status: string;
  listingStatus: string;
  isFeatured: boolean; isCertified: boolean; availableForFinance: boolean; images: string[];
}

interface DealerOption {
  id: number;
  businessName: string;
  city: string | null;
  state: string | null;
  status: string;
}

const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC', 'AMT', 'DCT', 'CVT'];
const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Compact SUV', 'Luxury SUV', 'MUV', 'Crossover'];
const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'INACTIVE', label: 'Archived' },
];
const LISTING_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft — hidden from the public site' },
  { value: 'PUBLISHED', label: 'Published — visible on the public site' },
];
const INDIAN_STATES = ['Uttar Pradesh', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Bihar', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Andhra Pradesh', 'Goa'];

const inputCls = 'w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC700]/40 bg-card text-content';
const labelCls = 'block text-sm font-medium text-content mb-1.5';

export default function VehicleForm({ onSuccess, onCancel, initialData }: VehicleFormProps) {
  const editId = initialData && Number(initialData.id) ? Number(initialData.id) : null;
  const [formData, setFormData] = useState<FormData>({
    brandId: Number(initialData?.brandId) || 0, categoryId: Number(initialData?.categoryId) || 0,
    dealerId: Number(initialData?.dealerId) || 0,
    model: (initialData?.model as string) || '', variant: (initialData?.variant as string) || '',
    year: (initialData?.year as string) || new Date().getFullYear().toString(), price: (initialData?.price as string) || '',
    mileage: (initialData?.mileage as string) || '', fuel: (initialData?.fuel as string) || 'PETROL',
    transmission: (initialData?.transmission as string) || 'AUTOMATIC',
    bodyType: (initialData?.bodyType as string) || 'SUV', color: (initialData?.color as string) || '',
    registrationNumber: (initialData?.registrationNumber as string) || '',
    registrationState: (initialData?.registrationState as string) || 'Uttar Pradesh',
    city: (initialData?.city as string) || 'Noida', state: (initialData?.state as string) || 'Uttar Pradesh',
    pincode: (initialData?.pincode as string) || '',
    description: (initialData?.description as string) || '', features: (initialData?.features as string) || '',
    highlights: (initialData?.highlights as string) || '',
    status: (initialData?.status as string) || 'DRAFT', listingStatus: (initialData?.listingStatus as string) || 'DRAFT',
    isFeatured: Boolean(initialData?.isFeatured) ?? false,
    isCertified: Boolean(initialData?.isCertified) ?? false, availableForFinance: Boolean(initialData?.availableForFinance) ?? true,
    images: Array.isArray(initialData?.images) ? (initialData.images as string[]) : [],
  });
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [dealers, setDealers] = useState<DealerOption[]>([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/lookups').then((r) => r.json()).catch(() => ({ brands: [], categories: [], dealers: [] })),
    ]).then(([d]) => {
      setBrands(d.brands || []);
      setCategories(d.categories || []);
      setDealers((d.dealers || []) as DealerOption[]);
    }).catch(() => { setBrands([]); setCategories([]); setDealers([]); });
  }, []);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => { setFormData(pv => ({ ...pv, [k]: v })); setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    const brandName = brands.find((b) => b.id === formData.brandId)?.name || '';
    if (!brandName) return setError('Brand is required');
    if (!formData.model.trim()) return setError('Model is required');
    if (!formData.year.trim()) return setError('Year is required');
    if (!formData.price.trim()) return setError('Price is required');
    if (!formData.city.trim()) return setError('City is required');
    if (formData.images.length === 0) return setError('At least one image is required');
    if (!formData.brandId) return setError('Brand is required');
    if (!formData.categoryId) return setError('Category is required');
    if (!formData.dealerId) return setError('Dealer is required');

    setIsSubmitting(true);
    try {
      const title = formData.variant.trim() ? brandName + ' ' + formData.model + ' ' + formData.variant : brandName + ' ' + formData.model;
      const payload = { title, price: Number(formData.price), year: Number(formData.year), mileage: Number(formData.mileage), fuel: formData.fuel, transmission: formData.transmission, color: formData.color, bodyType: formData.bodyType || undefined, city: formData.city, state: formData.state || undefined, description: formData.description || undefined, images: formData.images, status: formData.status === 'DRAFT' ? 'INACTIVE' : formData.status, listingStatus: formData.listingStatus, brandId: formData.brandId, categoryId: formData.categoryId, dealerId: formData.dealerId };
      const url = editId ? `/api/admin/vehicles/${editId}` : '/api/admin/vehicles';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed');
      setSuccess('Vehicle saved successfully!');
      submittedRef.current = true;
      if (onSuccess) onSuccess(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-card rounded-2xl border border-line p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-content">{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
        {onCancel && <button type="button" onClick={onCancel} className="p-2 hover:bg-surface rounded-lg"><X size={20} className="text-content-muted" /></button>}
      </div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"><AlertCircle size={20} className="text-red-400 flex-shrink-0" /><p className="text-sm text-red-400">{error}</p></div>}
      {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3"><CheckCircle2 size={20} className="text-[#FFC700] flex-shrink-0" /><p className="text-sm text-emerald-400">{success}</p></div>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Basic Information</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><label className={labelCls}>Brand<span className="text-red-500"> *</span></label><select value={formData.brandId} onChange={(e) => set('brandId', Number(e.target.value))} className={inputCls} required><option value={0}>Select Brand</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className={labelCls}>Model<span className="text-red-500"> *</span></label><input value={formData.model} onChange={(e) => set('model', e.target.value)} placeholder="e.g., Creta" className={inputCls} required /></div>
            <div><label className={labelCls}>Variant</label><input value={formData.variant} onChange={(e) => set('variant', e.target.value)} placeholder="e.g., SX (O)" className={inputCls} /></div>
            <div><label className={labelCls}>Category<span className="text-red-500"> *</span></label><select value={formData.categoryId} onChange={(e) => set('categoryId', Number(e.target.value))} className={inputCls} required><option value={0}>Select Category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className={labelCls}>Dealer<span className="text-red-500"> *</span></label><select value={formData.dealerId} onChange={(e) => set('dealerId', Number(e.target.value))} className={inputCls} required><option value={0}>Select Dealer</option>{dealers.map((dl) => <option key={dl.id} value={dl.id} disabled={dl.status !== 'APPROVED'}>{dl.businessName}{dl.city ? ` — ${dl.city}` : ''}{dl.status !== 'APPROVED' ? ` (${dl.status} — approve first)` : ''}</option>)}</select></div>
            <div><label className={labelCls}>Year</label><input type="number" value={formData.year} onChange={(e) => set('year', e.target.value)} className={inputCls} min="1990" /></div>
            <div><label className={labelCls}>Price (Rs)<span className="text-red-500"> *</span></label><input type="number" value={formData.price} onChange={(e) => set('price', e.target.value)} placeholder="1450000" className={inputCls} required /></div>
            <div><label className={labelCls}>Mileage (km)</label><input type="number" value={formData.mileage} onChange={(e) => set('mileage', e.target.value)} placeholder="18500" className={inputCls} /></div>
            <div><label className={labelCls}>Fuel Type</label><select value={formData.fuel} onChange={(e) => set('fuel', e.target.value)} className={inputCls}>{FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}</select></div>
            <div><label className={labelCls}>Transmission</label><select value={formData.transmission} onChange={(e) => set('transmission', e.target.value)} className={inputCls}>{TRANSMISSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className={labelCls}>Body Type</label><select value={formData.bodyType} onChange={(e) => set('bodyType', e.target.value)} className={inputCls}>{BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
            <div><label className={labelCls}>Color</label><input value={formData.color} onChange={(e) => set('color', e.target.value)} className={inputCls} /></div>
          </div>
        </section>
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Registration</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={labelCls}>Registration Number</label><input value={formData.registrationNumber} onChange={(e) => set('registrationNumber', e.target.value.toUpperCase())} placeholder="UP-16-AB-1234" className={inputCls} /></div>
            <div><label className={labelCls}>Registration State</label><select value={formData.registrationState} onChange={(e) => set('registrationState', e.target.value)} className={inputCls}>{INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
        </section>
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Location</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className={labelCls}>State</label><select value={formData.state} onChange={(e) => { const cs = e.target.value === 'Uttar Pradesh' ? ['Noida', 'Lucknow', 'Kanpur'] : ['Mumbai']; set('state', e.target.value); set('city', cs[0]); }} className={inputCls}>{INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={labelCls}>City</label><select value={formData.city} onChange={(e) => set('city', e.target.value)} className={inputCls}><option value="Noida">Noida</option><option value="Lucknow">Lucknow</option><option value="Mumbai">Mumbai</option></select></div>
            <div><label className={labelCls}>Pincode</label><input value={formData.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="201301" className={inputCls} /></div>
          </div>
        </section>
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Description</h3>
          <div><label className={labelCls}>Vehicle Description</label><textarea value={formData.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Detailed description..." className={inputCls + ' resize-none'} /></div>
          <div className="grid gap-4 sm:grid-cols-2 mt-4"><div><label className={labelCls}>Features</label><textarea value={formData.features} onChange={(e) => set('features', e.target.value)} placeholder="Sunroof, Leather seats" className={inputCls + ' resize-none'} /></div><div><label className={labelCls}>Highlights</label><textarea value={formData.highlights} onChange={(e) => set('highlights', e.target.value)} placeholder="Single owner, Service records" className={inputCls + ' resize-none'} /></div></div>
        </section>
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Inventory Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={labelCls}>Status</label><select value={formData.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={labelCls}>Listing Visibility</label><select value={formData.listingStatus} onChange={(e) => set('listingStatus', e.target.value)} className={inputCls}>{LISTING_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <label className="flex items-center gap-3 pt-6 cursor-pointer"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} className="sr-only peer" /><span className="text-sm font-medium text-content">Featured</span></label>
            <label className="flex items-center gap-3 pt-6 cursor-pointer"><input type="checkbox" checked={formData.isCertified} onChange={(e) => set('isCertified', e.target.checked)} className="sr-only peer" /><span className="text-sm font-medium text-content">Certified</span></label>
          </div>
        </section>
        <section><h3 className="text-sm font-bold uppercase tracking-wider text-content-muted mb-4">Vehicle Images</h3>
          <div className="flex gap-3 mb-3">
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (!imageUrl.trim()) return; setFormData(pv => ({ ...pv, images: [...pv.images, imageUrl.trim()] })); setImageUrl(''); } }} placeholder="https://example.com/car-image.jpg" className={inputCls + ' flex-1'} />
            <button type="button" onClick={() => { if (!imageUrl.trim()) return; setFormData(pv => ({ ...pv, images: [...pv.images, imageUrl.trim()] })); setImageUrl(''); }} disabled={!imageUrl.trim()} className="px-4 py-2.5 bg-[#FFC700] text-[#15130a] rounded-lg text-sm font-semibold hover:brightness-110 disabled:opacity-50">Add Image</button>
          </div>
          {formData.images.length > 0 && <div className="grid gap-3 sm:grid-cols-3">{formData.images.map((url, i) => <div key={i} className="relative group"><div className="relative aspect-[4/3] bg-surface rounded-lg overflow-hidden border border-border"><img src={url} alt={'Vehicle ' + (i + 1)} className="w-full h-full object-cover" /></div><button type="button" onClick={() => setFormData(pv => ({ ...pv, images: pv.images.filter((_, x) => x !== i) }))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded shadow text-xs font-bold">×</button></div>)}</div>}
        </section>
        <div className="flex justify-end gap-3">
          {onCancel && <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-border rounded-xl text-sm font-semibold text-content hover:bg-surface">Cancel</button>}
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#FFC700] text-[#15130a] rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50">{editId ? 'Save Changes' : 'Create Vehicle'}</button>
        </div>
      </form>
    </div>
  );
}

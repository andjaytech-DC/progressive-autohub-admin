'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, LayoutDashboard, Car, Package, MessageSquare, ChevronDown } from 'lucide-react';
import VehicleForm from './VehicleForm';
import { ADMIN_DOMAINS, type VehicleBucketKey, bucketCounts, bucketLabel, inVehicleBucket, isPublished } from './admin-nav-types';

export interface AdminVehicle {
  id: number;
  title: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  color: string;
  images: string[];
  status: string;
  listingStatus: string;
  city: string;
  state?: string;
  brandId: number;
  categoryId: number;
  dealerId: number;
  description?: string;
  createdAt?: string;
}

interface AdminPanelProps {
  initialVehicles: AdminVehicle[];
}

type View = 'dashboard' | VehicleBucketKey | 'leads';
type IconComponent = React.ComponentType<{ size?: number | string; className?: string }>;
interface NavLeaf { key: View; label: string; icon?: IconComponent }
interface NavGroup { key: string; label: string; icon: IconComponent; view?: View; children?: NavLeaf[] }

const DOMAIN_ICONS: Record<string, IconComponent> = { dashboard: LayoutDashboard, vehicles: Car, leads: MessageSquare };
const BUCKET_ICONS: Partial<Record<VehicleBucketKey, IconComponent>> = { draft: Package, add: Plus };

const NAV_TREE: NavGroup[] = ADMIN_DOMAINS.filter((d) => d.inPanel).map((d) => {
  const icon = DOMAIN_ICONS[d.key] ?? Car;
  if (d.children?.length) {
    return { key: d.key, label: d.label, icon, view: d.children[0].key, children: d.children.map((c) => ({ key: c.key, label: c.label, icon: BUCKET_ICONS[c.key] })) };
  }
  return { key: d.key, label: d.label, icon, view: d.key as View };
});

function viewFromHash(hash: string): View {
  const key = hash.replace('#', '');
  const group = NAV_TREE.find((g) => g.key === key);
  return group ? (group.view ?? 'dashboard') : 'dashboard';
}

function bucketTitle(view: View): string {
  if (view === 'dashboard') return 'Dashboard';
  if (view === 'leads') return 'Leads';
  return bucketLabel(view as VehicleBucketKey);
}

function VehicleCard({ v }: { v: AdminVehicle }) {
  const img = v.images && v.images.length > 0 ? v.images[0] : null;
  return (
    <Link href={`/admin/vehicles/${v.id}/edit`} className="group block rounded-2xl border border-line bg-card overflow-hidden transition-all hover:border-[#FFC700]/50 hover:shadow-lg">
      <div className="aspect-[4/3] bg-surface">
        {img ? <img src={img} alt={v.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-content-muted"><Car size={32} /></div>}
      </div>
      <div className="p-4">
        <p className="font-bold text-content text-sm truncate">{v.title || 'Untitled'}</p>
        <p className="text-xs text-content-muted mt-1">{v.year} · {v.mileage ? v.mileage + ' km' : '—'}</p>
        <p className="text-sm font-bold text-[#FFC700] mt-2">{v.price != null ? '₹' + Number(v.price).toLocaleString('en-IN') : '—'}</p>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${isPublished(v) ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#161b21] text-slate-400'}`}>
            {v.listingStatus || 'UNKNOWN'}
          </span>
          <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-surface text-content-muted">
            {v.status || 'UNKNOWN'}
          </span>
        </div>
        <div className="mt-3"><span className="inline-block px-4 py-1.5 bg-[#FFC700] text-[#15130a] rounded-lg text-xs font-bold group-hover:brightness-110">Edit</span></div>
      </div>
    </Link>
  );
}

export default function AdminPanel({ initialVehicles }: AdminPanelProps) {
  const router = useRouter();
  const [view, setView] = useState<View>('dashboard');
  const vehicles = initialVehicles;
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['vehicles']));

  useEffect(() => {
    const apply = () => { if (!window.location.hash) return; setView(viewFromHash(window.location.hash)); };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  const counts = useMemo(() => bucketCounts(vehicles), [vehicles]);

  const toggleGroup = (key: string) => {
    setExpanded((prev) => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  };

  const renderContent = () => {
    if (view === 'dashboard') {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Vehicles" value={vehicles.length} onClick={() => setView('all')} />
          <StatCard label="Drafts" value={counts.draft} onClick={() => setView('draft')} />
          <StatCard label="Published" value={counts.published} onClick={() => setView('published')} />
          <StatCard label="Reserved" value={counts.reserved} onClick={() => setView('reserved')} />
          <StatCard label="Sold" value={counts.sold} onClick={() => setView('sold')} />
          <StatCard label="Archived" value={counts.archived} onClick={() => setView('archived')} />
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="button" onClick={() => setView('add')} className="w-full flex items-center justify-center gap-2 py-5 bg-[#FFC700] text-[#15130a] rounded-2xl text-lg font-bold hover:brightness-110"><Plus size={20} /> Add New Car</button>
          </div>
        </div>
      );
    }
    if (view === 'add') return <VehicleForm onCancel={() => setView('all')} onSuccess={() => { setView('all'); router.refresh(); }} />;
    if (view === 'leads') return null;
    const items = vehicles.filter((v) => inVehicleBucket(view as VehicleBucketKey, v));
    return (
      <div>
        <p className="text-sm text-content-muted mb-4">{items.length} vehicle(s) in {bucketTitle(view)}</p>
        {items.length === 0 ? <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl"><Car size={32} className="mx-auto text-content-muted mb-2" /><p className="text-content-muted text-sm">No vehicles here yet</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((v) => <VehicleCard key={v.id} v={v} />)}</div>}
      </div>
    );
  };

  const activeGroup = NAV_TREE.find((g) => g.view === view || (g.children ?? []).some((c) => c.key === view));
  const activeLabel = NAV_TREE.flatMap((g) => [g as NavGroup | NavLeaf, ...(g.children ?? [])]).find((n) => 'key' in n && n.key === view && 'label' in n)?.label ?? activeGroup?.label ?? 'Vehicles';

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible" aria-label="Admin sections">
        {NAV_TREE.map((group) => {
          const isGroupActive = activeGroup?.key === group.key;
          const isOpen = expanded.has(group.key) || isGroupActive;
          return (
            <div key={group.key} className="flex lg:contents flex-col">
              {group.children ? (
                <button type="button" onClick={() => { toggleGroup(group.key); setView('all'); }} aria-expanded={isOpen} className={`flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${isGroupActive ? 'bg-[#FFC700]/15 text-[#FFC700]' : 'bg-card text-content hover:bg-surface'}`}>
                  <span className="flex items-center gap-2.5"><group.icon size={16} /> {group.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button type="button" onClick={() => setView(group.view!)} aria-current={isGroupActive ? 'page' : undefined} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${isGroupActive ? 'bg-[#FFC700] text-[#15130a]' : 'bg-card text-content hover:bg-surface'}`}>
                  <group.icon size={16} /> {group.label}
                </button>
              )}
              {group.children && isOpen && (
                <div className="flex lg:flex-col gap-1 mt-1 ml-2 lg:ml-3 border-l border-line pl-2">
                  {group.children.map((child) => (
                    <button key={child.key} type="button" onClick={() => setView(child.key)} aria-current={view === child.key ? 'page' : undefined} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${view === child.key ? 'bg-[#FFC700]/15 text-[#FFC700]' : 'text-content-muted hover:bg-surface hover:text-content'}`}>
                      <span>{child.label}</span>
                      {child.key !== 'add' && <span className="text-[10px] opacity-70">{counts[child.key as VehicleBucketKey] ?? 0}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-content">{activeLabel}</h2>
          {view !== 'add' && <button type="button" onClick={() => setView('add')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFC700] text-[#15130a] rounded-xl text-sm font-bold hover:brightness-110"><Plus size={16} /> Add New Car</button>}
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

function StatCard({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div';
  return <Comp onClick={onClick} className="rounded-2xl border border-line bg-card p-6 text-left"><p className="text-2xl font-extrabold text-content">{value}</p><p className="text-sm text-content-muted">{label}</p></Comp>;
}

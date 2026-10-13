'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Package, MessageSquare, Users, DollarSign, FileText, Settings, Truck, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/inventory', label: 'Inventory', icon: Car },
  { href: '/admin/dealers', label: 'Dealers', icon: Truck },
  { href: '/admin/leads', label: 'Leads', icon: MessageSquare },
  { href: '/admin/finance', label: 'Finance', icon: DollarSign },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-line p-4 space-y-1">
      <div className="mb-8">
        <h2 className="text-lg font-extrabold text-[#FFC700]">AutoHub Admin</h2>
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#FFC700]/15 text-[#FFC700]' : 'text-content-muted hover:bg-surface hover:text-content'}`}>
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}

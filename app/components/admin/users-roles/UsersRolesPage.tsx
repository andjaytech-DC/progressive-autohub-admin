'use client';

import { useEffect, useState } from 'react';
import { backendFetch } from '@/app/lib/backend';

interface User {
  id: number; firstName: string; lastName: string; email: string; role: string; isActive: boolean; createdAt: string;
}

export default function UsersRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (userId: number, currentRole: string) => {
    const roles = ['CUSTOMER', 'DEALER', 'ADMIN'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    const res = await fetch(`/api/admin/users/${userId}/assign-role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    });
    if (res.ok) {
      setUsers(users.map((u) => u.id === userId ? { ...u, role: nextRole } : u));
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err?.error ?? `Role update failed (${res.status})`);
    }
  };

  const toggleActive = async (userId: number, isActive: boolean) => {
    await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    setUsers(users.map((u) => u.id === userId ? { ...u, isActive: !isActive } : u));
  };

  const roleBadge = (role: string) => {
    const cls = role === 'ADMIN' ? 'bg-[#FFC700]/20 text-[#FFC700]' : role === 'DEALER' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400';
    return `px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${cls}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Users & Roles</h1>
      {loading ? <div className="text-center py-12 text-content-muted">Loading...</div> : (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            <StatCard label="Total Users" value={users.length} />
            <StatCard label="Admins" value={users.filter((u) => u.role === 'ADMIN').length} />
            <StatCard label="Dealers" value={users.filter((u) => u.role === 'DEALER').length} />
            <StatCard label="Customers" value={users.filter((u) => u.role === 'CUSTOMER').length} />
          </div>
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-line bg-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC700]/20 flex items-center justify-center text-[#FFC700] font-bold text-sm">{user.firstName[0]}{user.lastName[0]}</div>
                <div>
                  <p className="font-bold text-content text-sm">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-content-muted">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={roleBadge(user.role)}>{user.role}</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${user.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>
                <button onClick={() => toggleRole(user.id, user.role)} className="px-2 py-1 border border-border rounded-lg text-xs text-content-muted hover:text-white">Switch Role</button>
                <button onClick={() => toggleActive(user.id, user.isActive)} className="px-2 py-1 border border-border rounded-lg text-xs text-content-muted hover:text-white">{user.isActive ? 'Deactivate' : 'Activate'}</button>
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

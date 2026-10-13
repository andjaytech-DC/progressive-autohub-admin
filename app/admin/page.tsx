import AdminDashboard from "@/app/components/admin/dashboard/AdminDashboard";

export default function AdminDashboardPage() {
  // The auth gate and the sidebar are provided by app/admin/layout.tsx.
  // This page previously rendered a SECOND AdminNav and a second
  // flex-min-h-screen wrapper (double sidebar) and always passed a hardcoded
  // empty vehicle list, so the dashboard permanently showed zero vehicles.
  // AdminDashboard fetches real data from /api/admin/vehicles.
  return <AdminDashboard />;
}

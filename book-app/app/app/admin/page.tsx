"use client";
import { C } from "../../components/theme";
import { useApp } from "../../../features/app/AppShell";
import { AdminPage } from "../../../features/admin/AdminPage";

// The page check is only for the UI; every admin API call is checked on the server.
export default function AdminRoute() {
  const { isAdmin, userId, showToast } = useApp();
  if (!isAdmin) return <p className="max-w-xl mx-auto text-sm" style={{ color: C.muted }}>Admins only.</p>;
  return <AdminPage currentUserId={userId} showToast={showToast} />;
}

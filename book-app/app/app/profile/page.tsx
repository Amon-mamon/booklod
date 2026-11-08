"use client";
import { useApp } from "../../../features/app/AppShell";
import { ProfilePage } from "../../../features/profile/pages/ProfilePage";

export default function ProfileRoute() {
  const app = useApp();
  return (
    <ProfilePage
      isAdmin={app.isAdmin}
      supportEmail={app.settings?.support_email || ""}
      profile={app.profile}
      onSignOut={app.signOut}
      onUpdateProfile={app.updateProfile}
      onDeleteAccount={app.deleteAccount}
      showToast={app.showToast}
    />
  );
}

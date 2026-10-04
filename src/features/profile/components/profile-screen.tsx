"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, HelpCircle, Info, LogOut, MessageSquare, Shield } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { colors } from "@/config/brand";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth/context/auth-provider";
import type { NotificationSettings as Notifications, Profile } from "@/features/auth/types";
import { useImageUpload } from "@/lib/images/use-image-upload";
import { useToast } from "@/providers/toast-provider";
import { useDeleteAccount } from "../hooks/use-delete-account";
import { usePlanActions } from "../hooks/use-plan-actions";
import { CancelPlusModal } from "./modals/cancel-plus-modal";
import { DeleteAccountModal } from "./modals/delete-account-modal";
import { FeedbackModal } from "./modals/feedback-modal";
import { HelpModal } from "./modals/help-modal";
import { UpgradePlusModal } from "./modals/upgrade-plus-modal";
import { ViewSharedShelfModal } from "./modals/view-shared-shelf-modal";
import { NavRow } from "./nav-row";
import { NotificationSettings } from "./notification-settings";
import { PlanSection } from "./plan-section";
import { ProfileDetailsCard } from "./profile-details-card";
import { ProfileSummaryCard } from "./profile-summary-card";
import { SectionHeader, SettingsCard } from "./settings-card";

type ModalName = "feedback" | "help" | "delete" | "signOut" | "upgrade" | "cancelPlus" | "viewShared";

export function ProfileScreen() {
  const { profile } = useAuth();
  // <RequireAuth /> guarantees a profile; this narrows the type for the content.
  return profile ? <ProfileContent profile={profile} /> : null;
}

function ProfileContent({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { updateProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const [modal, setModal] = useState<ModalName | null>(null);
  const closeModal = () => setModal(null);

  const photoUpload = useImageUpload((dataUrl) => {
    void updateProfile({ photoUrl: dataUrl });
    showToast("Profile photo updated");
  });
  const plan = usePlanActions(profile);
  const deleteAccount = useDeleteAccount(profile);

  function saveName(name: string) {
    void updateProfile({ name });
    showToast(name ? "Name updated" : "Name cleared");
  }

  async function handleSignOut() {
    await signOut();
    router.replace(ROUTES.home);
  }

  function changeNotifications(notifications: Notifications) {
    void updateProfile({ notifications });
  }

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h2 className="text-xl font-semibold mb-5" style={{ color: colors.navy }}>Profile</h2>

      {/* One hidden input shared by the avatar button and the "Profile Photo" row */}
      <input {...photoUpload.inputProps} />

      <ProfileSummaryCard
        profile={profile}
        uploadingPhoto={photoUpload.uploading}
        photoError={photoUpload.error}
        onPickPhoto={photoUpload.openPicker}
      />

      <PlanSection
        profile={profile}
        onUpgrade={() => setModal("upgrade")}
        onManagePlus={() => setModal("cancelPlus")}
        onViewSharedShelf={() => setModal("viewShared")}
      />

      <div className="mt-3">
        <SectionHeader>Profile</SectionHeader>
        <ProfileDetailsCard profile={profile} onSaveName={saveName} onPickPhoto={photoUpload.openPicker} />

        <SectionHeader>Notifications</SectionHeader>
        <NotificationSettings profile={profile} onChange={changeNotifications} />

        <SectionHeader>Feedback &amp; Support</SectionHeader>
        <SettingsCard>
          <NavRow icon={MessageSquare} label="Suggestions & Feedback" onClick={() => setModal("feedback")} />
          <NavRow icon={HelpCircle} label="Help & Support" onClick={() => setModal("help")} last />
        </SettingsCard>

        <SectionHeader>About</SectionHeader>
        <SettingsCard>
          <NavRow icon={Info} label="About Booklod" href={ROUTES.about} />
          <NavRow icon={Shield} label="Privacy Policy" href={ROUTES.privacy} />
          <NavRow icon={FileText} label="Terms of Service" href={ROUTES.terms} last />
        </SettingsCard>

        <SectionHeader>Account</SectionHeader>
        <SettingsCard>
          <NavRow label="Delete Account" onClick={() => setModal("delete")} danger />
          <NavRow icon={LogOut} label="Sign Out" onClick={() => setModal("signOut")} last />
        </SettingsCard>
      </div>

      {modal === "feedback" && <FeedbackModal onClose={closeModal} />}
      {modal === "help" && <HelpModal onClose={closeModal} />}
      {modal === "upgrade" && <UpgradePlusModal onClose={closeModal} onConfirm={plan.upgrade} />}
      {modal === "cancelPlus" && <CancelPlusModal onClose={closeModal} onConfirm={plan.cancel} />}
      {modal === "viewShared" && <ViewSharedShelfModal onClose={closeModal} />}
      {modal === "delete" && (
        <DeleteAccountModal provider={profile.provider} onClose={closeModal} onConfirm={deleteAccount} />
      )}
      {modal === "signOut" && (
        <ConfirmModal
          title="Sign out of Booklod?"
          body="Your books and settings stay saved — you can sign back in anytime."
          confirmLabel="Sign Out"
          onConfirm={handleSignOut}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

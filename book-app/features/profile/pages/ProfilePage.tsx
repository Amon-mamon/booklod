"use client";
import { useEffect, useState, useRef } from "react";
import { Loader2, Camera, LogOut, Sparkles, ChevronRight, MessageSquare, HelpCircle, Shield, FileText, ShieldCheck } from "lucide-react";
import { C } from "../../../app/components/theme";
import { ConfirmModal } from "../../../app/components/ui/ConfirmModal";
import { Pill } from "../../../app/components/ui/Pill";
import { SectionHeading } from "../../../app/components/ui/SectionHeading";
import { useRouter } from "next/navigation";
import { DEFAULT_NOTIFICATIONS, compressImageFile } from "../../shared/shared";
import { loadPlans, publishMyShelf, unpublishMyShelf, type PublicPlan } from "../data/profile-repository";
import { NavRow, ToggleRow } from "../components/ProfileControls";
import { FeedbackModal, HelpModal } from "../components/SupportModals";
import { DeleteAccountModal } from "../components/AccountModals";
import { UpgradePlusModal, CancelPlusModal } from "../components/SubscriptionModals";
import { ViewSharedShelfModal } from "../components/SharedShelfModal";
import { getErrorMessage, type BooklodProfile } from "../../shared/types";
import type { ToastMessage } from "../../shared/types";

interface ProfilePageProps {
  profile: BooklodProfile | null;
  isAdmin?: boolean;
  supportEmail?: string;
  onSignOut: () => Promise<void>;
  onUpdateProfile: (profile: Partial<BooklodProfile>) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}

export function ProfilePage({
  profile,
  isAdmin = false,
  supportEmail = "",
  onSignOut,
  onUpdateProfile,
  onDeleteAccount,
  showToast,
}: ProfilePageProps) {
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile?.name || "");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancelPlus, setShowCancelPlus] = useState(false);
  const [showViewShared, setShowViewShared] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [plusPlan, setPlusPlan] = useState<PublicPlan | undefined>(undefined);

  // Prices and features come from the plans table so an admin can change them.
  useEffect(() => {
    let active = true;
    loadPlans()
      .then((plans) => {
        const sharePlans = plans.filter((p) => p.kind === "plan" && p.canShare && p.selfService);
        if (active) setPlusPlan(sharePlans.find((p) => p.billingInterval === "month") ?? sharePlans[0]);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!profile) return null;
  const activeProfile: BooklodProfile = profile;
  const notif = activeProfile.notifications || DEFAULT_NOTIFICATIONS;
  const isPlus = activeProfile.canShare ?? activeProfile.plan === "plus";

  async function handlePhotoFile(file: File | null | undefined) {
    if (!file) return;
    setPhotoError("");
    setUploadingPhoto(true);
    try {
      const compressed = await compressImageFile(file);
      await onUpdateProfile({ photoUrl: compressed });
      showToast("Profile photo updated");
    } catch (error: unknown) {
      setPhotoError(
        error instanceof Error && error.message === "unsupported-type"
          ? "That file type isn't supported — try a JPG, PNG, or WEBP image."
          : getErrorMessage(error, "Couldn't process that image — please try another file.")
      );
    }
    setUploadingPhoto(false);
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    try {
      await onUpdateProfile({ name: trimmed });
      setEditingName(false);
      showToast(trimmed ? "Name updated" : "Name cleared");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to update your activeProfile."), "error");
    }
  }

  async function toggleNotif(key: keyof BooklodProfile["notifications"]) {
    try {
      await onUpdateProfile({ notifications: { ...notif, [key]: !notif[key] } });
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to update your notification settings."), "error");
    }
  }

  async function handleUpgradeConfirm() {
    try {
      await onUpdateProfile({ plan: plusPlan?.id ?? "plus" });
      showToast("Welcome to Booklod Plus!");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to update your plan."), "error");
    }
  }

  async function handleCancelPlusConfirm() {
    try {
      // set_my_plan unpublishes the shelf when the new plan can't share.
      await onUpdateProfile({ plan: "starter" });
      showToast("Plus canceled — you're back on Starter");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to update your plan."), "error");
    }
  }

  async function handleToggleShare() {
    setSharing(true);
    try {
      if (!activeProfile.shareEnabled) {
        const code = await publishMyShelf();
        await onUpdateProfile({ shareEnabled: true, shareCode: code });
        showToast("Shelf sharing turned on");
      } else {
        await unpublishMyShelf();
        await onUpdateProfile({ shareEnabled: false });
        showToast("Shelf sharing turned off");
      }
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to update shelf sharing."), "error");
    } finally {
      setSharing(false);
    }
  }

  async function handleRefreshShare() {
    if (!activeProfile.shareCode) return;
    setSharing(true);
    try {
      await publishMyShelf();
      showToast("Shared shelf refreshed");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to refresh your shared shelf."), "error");
    } finally {
      setSharing(false);
    }
  }

  function copyCode() {
    if (!activeProfile.shareCode) return;
    if (navigator.clipboard) navigator.clipboard.writeText(activeProfile.shareCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h2 className="text-xl font-semibold mb-5" style={{ color: C.navy }}>
        Profile
      </h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files && e.target.files[0];
          handlePhotoFile(file);
          e.target.value = "";
        }}
      />

      {/* Summary card */}
      <div className="rounded-2xl bg-white p-5 flex items-center gap-4 mb-2" style={{ border: `1px solid ${C.tan}` }}>
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={uploadingPhoto}
          className="relative flex-shrink-0"
        >
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-semibold text-white"
            style={{ background: C.green }}
          >
            {uploadingPhoto ? (
              <Loader2 size={18} className="animate-spin" />
            ) : activeProfile.photoUrl ? (
              <img src={activeProfile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              activeProfile.avatarInitial
            )}
          </div>
          <span
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: C.navy, border: "2px solid white" }}
          >
            <Camera size={11} color="white" />
          </span>
        </button>
        <div className="min-w-0">
          {activeProfile.name ? (
            <p className="font-semibold truncate" style={{ color: C.navy }}>{activeProfile.name}</p>
          ) : (
            <p className="font-medium truncate italic" style={{ color: C.muted }}>Add your name</p>
          )}
          <Pill color={C.navyT} textColor={C.navy} style={{ marginTop: 6 }}>
            Signed in with {activeProfile.provider}
          </Pill>
        </div>
      </div>
      {photoError && <p className="text-xs mb-3" style={{ color: "#B23A3A" }}>{photoError}</p>}

      <SectionHeading>Plan</SectionHeading>
      {isPlus ? (
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: C.orangeT, borderBottom: `1px solid ${C.tan}` }}>
            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: C.orange }}>
              <Sparkles size={14} /> {activeProfile.planName || "Booklod Plus"}
            </span>
            <button onClick={() => setShowCancelPlus(true)} className="text-xs font-medium" style={{ color: C.muted }}>
              Manage
            </button>
          </div>
          <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.tan}` }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm" style={{ color: C.navy }}>Share Your Shelf</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  Invite-only — only people you give the code to can view it.
                </p>
              </div>
              <button
                onClick={handleToggleShare}
                disabled={sharing}
                aria-pressed={activeProfile.shareEnabled}
                className="relative flex-shrink-0 w-11 h-6 rounded-full transition disabled:opacity-60"
                style={{ background: activeProfile.shareEnabled ? C.green : C.tan }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: activeProfile.shareEnabled ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
            </div>
            {activeProfile.shareEnabled && activeProfile.shareCode && (
              <div className="mt-3 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={{ background: C.cream }}>
                <span className="min-w-0 flex-1 break-all text-sm font-bold tracking-wider" style={{ color: C.navy }}>{activeProfile.shareCode}</span>
                <div className="flex items-center gap-3">
                  <button onClick={handleRefreshShare} disabled={sharing} className="text-xs font-medium" style={{ color: C.green }}>
                    {sharing ? "…" : "Refresh"}
                  </button>
                  <button onClick={copyCode} className="text-xs font-medium" style={{ color: C.green }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowViewShared(true)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm" style={{ color: C.navy }}>View a Shared Shelf</span>
            <ChevronRight size={14} style={{ color: C.muted }} />
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.tan}` }}>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: C.navyT, color: C.navy }}
            >
              {activeProfile.planName || "Starter"} plan
            </span>
            <p className="text-xs mt-2" style={{ color: C.muted }}>
              20 book slots, purchased once. Upgrade to Plus for unlimited slots, cross-device
              cover sync, full digest export, and shelf sharing.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="mt-3 rounded-full px-4 py-2 text-xs font-semibold text-white"
              style={{ background: C.orange }}
            >
              Upgrade to Plus
            </button>
          </div>
          <button
            onClick={() => setShowViewShared(true)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm" style={{ color: C.navy }}>View a Shared Shelf</span>
            <ChevronRight size={14} style={{ color: C.muted }} />
          </button>
        </div>
      )}

      <div className="mt-3">
        <SectionHeading>Profile</SectionHeading>
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          {editingName ? (
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${C.tan}` }}>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Add your name"
                className="flex-1 text-sm outline-none"
                style={{ color: C.navy }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setNameDraft(activeProfile.name || "");
                    setEditingName(false);
                  }
                }}
              />
              <button onClick={saveName} className="text-xs font-semibold flex-shrink-0" style={{ color: C.green }}>
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNameDraft(activeProfile.name || "");
                setEditingName(true);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              style={{ borderBottom: `1px solid ${C.tan}` }}
            >
              <span className="text-sm" style={{ color: C.navy }}>Name</span>
              <span className="text-sm flex items-center gap-1.5" style={{ color: C.muted }}>
                {activeProfile.name || "Add your name"} <ChevronRight size={14} />
              </span>
            </button>
          )}
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm" style={{ color: C.navy }}>Profile Photo</span>
            <span className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-semibold text-white"
                style={{ background: C.green }}
              >
                {activeProfile.photoUrl ? (
                  <img src={activeProfile.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  activeProfile.avatarInitial
                )}
              </div>
              <ChevronRight size={14} style={{ color: C.muted }} />
            </span>
          </button>
        </div>

        <SectionHeading>Notifications</SectionHeading>
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <ToggleRow
            label="Reading Reminders"
            hint="Nudges about books you're currently reading"
            checked={notif.readingReminders}
            onChange={() => toggleNotif("readingReminders")}
          />
          <ToggleRow
            label="Book Updates"
            hint="Important updates about your library"
            checked={notif.bookUpdates}
            onChange={() => toggleNotif("bookUpdates")}
          />
          <ToggleRow
            label="Product Updates"
            hint="New features and announcements"
            checked={notif.productUpdates}
            onChange={() => toggleNotif("productUpdates")}
            last
          />
        </div>

        <SectionHeading>Feedback & Support</SectionHeading>
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <NavRow icon={MessageSquare} label="Suggestions & Feedback" onClick={() => setShowFeedback(true)} />
          <NavRow icon={HelpCircle} label="Help & Support" onClick={() => setShowHelp(true)} last />
        </div>

        <SectionHeading>About</SectionHeading>
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <NavRow icon={Shield} label="Privacy Policy" onClick={() => router.push("/privacy")} />
          <NavRow icon={FileText} label="Terms of Service" onClick={() => router.push("/terms")} last />
        </div>

        {isAdmin && (
          <>
            <SectionHeading>Admin</SectionHeading>
            <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
              <NavRow icon={ShieldCheck} label="Admin: users, plans & settings" onClick={() => router.push("/app/admin")} last />
            </div>
          </>
        )}

        <SectionHeading>Account</SectionHeading>
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${C.tan}` }}>
          <NavRow label="Delete Booklod Data" onClick={() => setShowDelete(true)} danger />
          <NavRow icon={LogOut} label="Sign Out" onClick={() => setShowSignOutConfirm(true)} last />
        </div>
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} supportEmail={supportEmail} />}
      {showUpgrade && <UpgradePlusModal onClose={() => setShowUpgrade(false)} onConfirm={handleUpgradeConfirm} plan={plusPlan} />}
      {showCancelPlus && <CancelPlusModal onClose={() => setShowCancelPlus(false)} onConfirm={handleCancelPlusConfirm} />}
      {showViewShared && <ViewSharedShelfModal onClose={() => setShowViewShared(false)} />}
      {showDelete && (
        <DeleteAccountModal
          onClose={() => setShowDelete(false)}
          onConfirm={onDeleteAccount}
        />
      )}
      {showSignOutConfirm && (
        <ConfirmModal
          title="Sign out of Booklod?"
          body="Your books and settings stay saved — you can sign back in anytime."
          confirmLabel="Sign Out"
          onConfirm={onSignOut}
          onClose={() => setShowSignOutConfirm(false)}
        />
      )}
    </div>
  );
}

"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { colors } from "@/config/brand";
import type { Profile } from "@/features/auth/types";
import { useShelfSharing } from "../hooks/use-shelf-sharing";
import { SectionHeader } from "./settings-card";

interface PlanSectionProps {
  profile: Profile;
  onUpgrade: () => void;
  onManagePlus: () => void;
  onViewSharedShelf: () => void;
}

export function PlanSection({ profile, onUpgrade, onManagePlus, onViewSharedShelf }: PlanSectionProps) {
  const isPlus = profile.plan === "plus";

  const viewSharedRow = (
    <button
      type="button"
      onClick={onViewSharedShelf}
      className="w-full flex items-center justify-between px-4 py-3 text-left"
    >
      <span className="text-sm" style={{ color: colors.navy }}>View a Shared Shelf</span>
      <ChevronRight size={14} style={{ color: colors.muted }} />
    </button>
  );

  return (
    <>
      <SectionHeader>Plan</SectionHeader>
      {isPlus ? (
        <div className="rounded-2xl overflow-hidden mb-5" style={{ border: `1px solid ${colors.tan}` }}>
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ background: colors.orangeT, borderBottom: `1px solid ${colors.tan}` }}
          >
            <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: colors.orange }}>
              <Sparkles size={14} /> Booklod Plus
            </span>
            <button type="button" onClick={onManagePlus} className="text-xs font-medium" style={{ color: colors.muted }}>
              Manage
            </button>
          </div>
          <ShareShelfControls profile={profile} />
          {viewSharedRow}
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden mb-5" style={{ border: `1px solid ${colors.tan}` }}>
          <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${colors.tan}` }}>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: colors.navyT, color: colors.navy }}
            >
              Starter plan
            </span>
            <p className="text-xs mt-2" style={{ color: colors.muted }}>
              20 book slots, purchased once. Upgrade to Plus for unlimited slots, cross-device cover sync, full
              digest export, and shelf sharing.
            </p>
            <button
              type="button"
              onClick={onUpgrade}
              className="mt-3 rounded-full px-4 py-2 text-xs font-semibold text-white"
              style={{ background: colors.orange }}
            >
              Upgrade to Plus
            </button>
          </div>
          {viewSharedRow}
        </div>
      )}
    </>
  );
}

function ShareShelfControls({ profile }: { profile: Profile }) {
  const { sharing, copied, toggleShare, refreshShare, copyCode } = useShelfSharing(profile);

  return (
    <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${colors.tan}` }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: colors.navy }}>Share Your Shelf</p>
          <p className="text-xs mt-0.5" style={{ color: colors.muted }}>
            Invite-only — only people you give the code to can view it.
          </p>
        </div>
        <ToggleSwitch checked={profile.shareEnabled} onChange={toggleShare} disabled={sharing} label="Share your shelf" />
      </div>
      {profile.shareEnabled && profile.shareCode && (
        <div
          className="mt-3 rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{ background: colors.cream }}
        >
          <span className="text-lg font-bold tracking-widest" style={{ color: colors.navy }}>{profile.shareCode}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshShare}
              disabled={sharing}
              className="text-xs font-medium"
              style={{ color: colors.green }}
            >
              {sharing ? "…" : "Refresh"}
            </button>
            <button type="button" onClick={copyCode} className="text-xs font-medium" style={{ color: colors.green }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

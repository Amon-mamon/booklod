"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { colors } from "@/config/brand";
import type { Profile } from "@/features/auth/types";
import { SettingsCard } from "./settings-card";

interface ProfileDetailsCardProps {
  profile: Profile;
  onSaveName: (name: string) => void;
  onPickPhoto: () => void;
}

/** Inline-editable name + profile photo rows. */
export function ProfileDetailsCard({ profile, onSaveName, onPickPhoto }: ProfileDetailsCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile.name || "");

  function save() {
    onSaveName(draft.trim());
    setEditing(false);
  }

  function startEditing() {
    setDraft(profile.name || "");
    setEditing(true);
  }

  return (
    <SettingsCard>
      {editing ? (
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${colors.tan}` }}>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add your name"
            aria-label="Your name"
            className="flex-1 text-sm outline-none"
            style={{ color: colors.navy }}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(profile.name || "");
                setEditing(false);
              }
            }}
          />
          <button type="button" onClick={save} className="text-xs font-semibold flex-shrink-0" style={{ color: colors.green }}>
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          style={{ borderBottom: `1px solid ${colors.tan}` }}
        >
          <span className="text-sm" style={{ color: colors.navy }}>Name</span>
          <span className="text-sm flex items-center gap-1.5" style={{ color: colors.muted }}>
            {profile.name || "Add your name"} <ChevronRight size={14} />
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={onPickPhoto}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm" style={{ color: colors.navy }}>Profile Photo</span>
        <span className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-semibold text-white"
            style={{ background: colors.green }}
          >
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.avatarInitial
            )}
          </div>
          <ChevronRight size={14} style={{ color: colors.muted }} />
        </span>
      </button>
    </SettingsCard>
  );
}

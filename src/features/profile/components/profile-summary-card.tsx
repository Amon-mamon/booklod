"use client";

import { Camera, Loader2 } from "lucide-react";
import { Pill } from "@/components/ui/pill";
import { colors } from "@/config/brand";
import type { Profile } from "@/features/auth/types";

interface ProfileSummaryCardProps {
  profile: Profile;
  uploadingPhoto: boolean;
  photoError: string;
  onPickPhoto: () => void;
}

export function ProfileSummaryCard({ profile, uploadingPhoto, photoError, onPickPhoto }: ProfileSummaryCardProps) {
  return (
    <>
      <div
        className="rounded-2xl bg-white p-5 flex items-center gap-4 mb-2"
        style={{ border: `1px solid ${colors.tan}` }}
      >
        <button
          type="button"
          onClick={onPickPhoto}
          disabled={uploadingPhoto}
          aria-label="Change profile photo"
          className="relative flex-shrink-0"
        >
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-semibold text-white"
            style={{ background: colors.green }}
          >
            {uploadingPhoto ? (
              <Loader2 size={18} className="animate-spin" />
            ) : profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
              <img src={profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.avatarInitial
            )}
          </div>
          <span
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: colors.navy, border: "2px solid white" }}
          >
            <Camera size={11} color="white" />
          </span>
        </button>
        <div className="min-w-0">
          {profile.name ? (
            <p className="font-semibold truncate" style={{ color: colors.navy }}>{profile.name}</p>
          ) : (
            <p className="font-medium truncate italic" style={{ color: colors.muted }}>Add your name</p>
          )}
          <Pill color={colors.navyT} textColor={colors.navy} style={{ marginTop: 6 }}>
            Signed in with {profile.provider}
          </Pill>
        </div>
      </div>
      {photoError && <p className="text-xs mb-3" style={{ color: colors.danger }}>{photoError}</p>}
    </>
  );
}

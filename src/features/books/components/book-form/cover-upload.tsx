"use client";

import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { FieldLabel } from "@/components/ui/form-field";
import { colors } from "@/config/brand";
import type { ImageUpload } from "@/lib/images/use-image-upload";

interface CoverUploadProps {
  coverUrl: string;
  busy: boolean;
  upload: ImageUpload;
  onRemove: () => void;
}

export function CoverUpload({ coverUrl, busy, upload, onRemove }: CoverUploadProps) {
  return (
    <div className="mb-4">
      <FieldLabel optional>Cover Image</FieldLabel>
      <input {...upload.inputProps} />
      <div className="flex items-center gap-3">
        <div
          className="rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: 64, height: 88, background: colors.cream, border: `1px solid ${colors.tan}` }}
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin" style={{ color: colors.green }} />
          ) : coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL / remote cover
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={20} style={{ color: colors.muted }} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={upload.openPicker}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: colors.tan, color: colors.navy }}
          >
            <Camera size={13} />
            {coverUrl ? "Replace photo" : "Upload photo"}
          </button>
          {coverUrl && (
            <button type="button" onClick={onRemove} className="text-xs text-left" style={{ color: colors.muted }}>
              Remove
            </button>
          )}
        </div>
      </div>
      {upload.error && <p className="text-xs mt-1.5 text-red-500">{upload.error}</p>}
      <p className="text-xs mt-1.5" style={{ color: colors.muted }}>
        One photo per book — it&apos;s resized automatically to keep things fast.
      </p>
    </div>
  );
}

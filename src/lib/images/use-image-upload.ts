"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { compressImageFile } from "./compress";
import { describeImageError } from "./image-errors";

/**
 * Hidden-file-input + compression + error state, shared by the book cover
 * uploader and the profile photo uploader.
 */
export function useImageUpload(onUploaded: (dataUrl: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file: File | null | undefined) => {
      if (!file) return;
      setError("");
      setUploading(true);
      try {
        onUploaded(await compressImageFile(file));
      } catch (e) {
        setError(describeImageError(e));
      }
      setUploading(false);
    },
    [onUploaded]
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  /** Spread onto a single `<input />`: `<input {...inputProps} />` */
  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    accept: "image/*",
    className: "hidden",
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      void handleFile(e.target.files?.[0]);
      e.target.value = "";
    },
  };

  return { inputProps, openPicker, uploading, error };
}

export type ImageUpload = ReturnType<typeof useImageUpload>;

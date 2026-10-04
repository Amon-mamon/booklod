"use client";

import { useEffect, type ReactNode } from "react";
import { colors } from "@/config/brand";
import { cn } from "@/lib/cn";

interface ModalProps {
  children: ReactNode;
  /** Omit (or pass undefined) to make the modal non-dismissable, e.g. while saving. */
  onClose?: () => void;
  className?: string;
}

/** Shared backdrop + dialog shell used by every modal in the app. */
export function Modal({ children, onClose, className }: ModalProps) {
  useEffect(() => {
    if (!onClose) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: colors.overlay }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn("w-full max-w-sm rounded-2xl bg-white p-5", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

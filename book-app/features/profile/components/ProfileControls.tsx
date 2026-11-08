"use client";
import { ChevronRight } from "lucide-react";
import { C } from "../../../app/components/theme";
import type { LucideIcon } from "lucide-react";



export interface NavRowProps {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  last?: boolean;
  danger?: boolean;
}


export interface ToggleRowProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  last?: boolean;
}


export function NavRow({ icon: Icon, label, onClick, last = false, danger = false }: NavRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 text-left"
      style={{ borderBottom: last ? "none" : `1px solid ${C.tan}` }}
    >
      <span className="text-sm flex items-center gap-2" style={{ color: danger ? "#B23A3A" : C.navy }}>
        {Icon && <Icon size={15} style={{ color: danger ? "#B23A3A" : C.muted }} />}
        {label}
      </span>
      <ChevronRight size={14} style={{ color: danger ? "#D9A0A0" : C.muted }} />
    </button>
  );
}



export function ToggleRow({ label, hint, checked, onChange, last = false }: ToggleRowProps) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3"
      style={{ borderBottom: last ? "none" : `1px solid ${C.tan}` }}
    >
      <div className="min-w-0">
        <p className="text-sm" style={{ color: C.navy }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: C.muted }}>{hint}</p>}
      </div>
      <button
        onClick={onChange}
        aria-pressed={checked}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition"
        style={{ background: checked ? C.green : C.tan }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

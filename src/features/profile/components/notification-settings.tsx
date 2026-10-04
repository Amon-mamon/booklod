"use client";

import { DEFAULT_NOTIFICATIONS, type NotificationSettings as Notifications, type Profile } from "@/features/auth/types";
import { SettingsCard } from "./settings-card";
import { ToggleRow } from "./toggle-row";

interface NotificationSettingsProps {
  profile: Profile;
  onChange: (next: Notifications) => void;
}

const ROWS: { key: keyof Notifications; label: string; hint: string }[] = [
  { key: "readingReminders", label: "Reading Reminders", hint: "Nudges about books you're currently reading" },
  { key: "bookUpdates", label: "Book Updates", hint: "Important updates about your library" },
  { key: "productUpdates", label: "Product Updates", hint: "New features and announcements" },
];

export function NotificationSettings({ profile, onChange }: NotificationSettingsProps) {
  const notif = profile.notifications || DEFAULT_NOTIFICATIONS;
  return (
    <SettingsCard>
      {ROWS.map((row, i) => (
        <ToggleRow
          key={row.key}
          label={row.label}
          hint={row.hint}
          checked={notif[row.key]}
          onChange={() => onChange({ ...notif, [row.key]: !notif[row.key] })}
          last={i === ROWS.length - 1}
        />
      ))}
    </SettingsCard>
  );
}

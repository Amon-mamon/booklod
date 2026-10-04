export type SignInProvider = "Google" | "Apple";
export type Plan = "starter" | "plus";

export interface NotificationSettings {
  readingReminders: boolean;
  bookUpdates: boolean;
  productUpdates: boolean;
}

/** The signed-in user's session + settings. */
export interface Profile {
  name: string;
  email: string;
  provider: SignInProvider;
  avatarInitial: string;
  photoUrl: string;
  notifications: NotificationSettings;
  plan: Plan;
  shareEnabled: boolean;
  shareCode: string;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  readingReminders: true,
  bookUpdates: true,
  productUpdates: false,
};

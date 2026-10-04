import { STORAGE_KEYS } from "@/lib/storage/keys";
import { readJson, removeKey, writeJson } from "@/lib/storage/json";
import type { Profile } from "../types";

export const profileRepository = {
  load: () => readJson<Profile>(STORAGE_KEYS.profile),
  save: (profile: Profile) => writeJson(STORAGE_KEYS.profile, profile),
  clear: () => removeKey(STORAGE_KEYS.profile),
};

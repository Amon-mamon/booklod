"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { demoSignIn } from "../services/demo-auth";
import { profileRepository } from "../services/profile-repository";
import type { Profile, SignInProvider } from "../types";

type AuthStatus = "loading" | "ready";

interface AuthContextValue {
  profile: Profile | null;
  status: AuthStatus;
  signIn: (provider: SignInProvider) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  /** Drops the in-memory session (storage is cleared by the caller). */
  clearProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  // Mirrors state so updates can be computed synchronously without
  // running side effects inside a setState updater.
  const profileRef = useRef<Profile | null>(null);

  const commit = useCallback((next: Profile | null) => {
    profileRef.current = next;
    setProfile(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    profileRepository.load().then((stored) => {
      if (cancelled) return;
      commit(stored);
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  const signIn = useCallback(
    async (provider: SignInProvider) => {
      const next = await demoSignIn(provider);
      commit(next);
      await profileRepository.save(next);
    },
    [commit]
  );

  const signOut = useCallback(async () => {
    commit(null);
    await profileRepository.clear();
  }, [commit]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      const current = profileRef.current;
      if (!current) return;
      const next = { ...current, ...patch };
      commit(next);
      await profileRepository.save(next);
    },
    [commit]
  );

  const clearProfile = useCallback(() => commit(null), [commit]);

  const value = useMemo(
    () => ({ profile, status, signIn, signOut, updateProfile, clearProfile }),
    [profile, status, signIn, signOut, updateProfile, clearProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

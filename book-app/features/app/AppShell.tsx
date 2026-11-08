"use client";
// Signed-in app: loads the user's data once, guards every /app/* page, and
// renders the shared header, banners and tab bar around the current page.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, BarChart2, Library as LibraryIcon, Loader2, User as UserIcon } from "lucide-react";
import { C } from "../../app/components/theme";
import { ConfirmModal } from "../../app/components/ui/ConfirmModal";
import { LogoMark } from "../../app/components/ui/LogoMark";
import { Toast } from "../../app/components/ui/Toast";
import { DEFAULT_NOTIFICATIONS } from "../shared/shared";
import { createBook, loadBooks, removeBook, updateBook } from "../library/data/library-repository";
import {
  applyPlan,
  checkIsAdmin,
  deleteAccount,
  loadMyPlan,
  loadProfile,
  loadSettings,
  saveProfile,
  setMyPlan,
  type AppSettings,
} from "../profile/data/profile-repository";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage, type BooklodProfile, type BookRecord, type ToastMessage } from "../shared/types";

interface AppData {
  userId: string;
  books: BookRecord[];
  profile: BooklodProfile;
  isAdmin: boolean;
  settings: AppSettings | null;
  showToast: (message: string, type?: ToastMessage["type"]) => void;
  saveBook: (book: BookRecord) => Promise<void>;
  requestDeleteBook: (id: string) => void;
  updateProfile: (patch: Partial<BooklodProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AppContext = createContext<AppData | null>(null);

export function useApp(): AppData {
  const app = useContext(AppContext);
  if (!app) throw new Error("useApp must be used inside the /app layout.");
  return app;
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authReady, authError, setAuthError, signOut } = useAuth();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<BooklodProfile | null>(null);
  // Latest profile for callbacks, so quick successive edits don't build on stale state.
  const profileRef = useRef<BooklodProfile | null>(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  // Set while signing out / deleting, so the guard sends the user home instead of to /signin.
  const leaving = useRef(false);
  const loading = !authReady || Boolean(user && loadedUserId !== user.id);

  const showToast = useCallback((message: string, type: ToastMessage["type"] = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Public settings (announcement banner, support email). Optional.
  useEffect(() => {
    let active = true;
    loadSettings()
      .then((next) => active && setSettings(next))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Signed-out visitors never see the app.
  useEffect(() => {
    if (authReady && !user) router.replace(leaving.current ? "/" : "/signin");
  }, [authReady, user, router]);

  useEffect(() => {
    if (!authReady || !user) return;
    let active = true;

    (async () => {
      const [savedLibrary, savedProfile, plan, admin] = await Promise.all([
        loadBooks(user.id),
        loadProfile(user.id),
        loadMyPlan(),
        checkIsAdmin(),
      ]);
      const metadata = user.user_metadata || {};
      const provider = user.app_metadata?.provider || "email";
      const defaultProfile = {
        name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "Booklod Reader",
        email: user.email || "",
        provider: provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Email",
        avatarInitial: (metadata.full_name || metadata.name || user.email || "B")[0].toUpperCase(),
        photoUrl: metadata.avatar_url || "",
        notifications: DEFAULT_NOTIFICATIONS,
        plan: "starter",
        shareEnabled: false,
        shareCode: "",
      } satisfies BooklodProfile;
      const nextProfile = applyPlan(
        savedProfile ? { ...defaultProfile, ...savedProfile } : defaultProfile,
        plan,
      );

      if (!savedProfile) await saveProfile(user.id, nextProfile);
      if (active) {
        setBooks(savedLibrary.books);
        setProfile(nextProfile);
        setIsAdmin(admin);
        setLoadedUserId(user.id);
        setAuthError("");
      }
    })().catch((error: unknown) => {
      if (active) {
        setAuthError(getErrorMessage(error, "Unable to load your Booklod data."));
        setBooks([]);
        setProfile(null);
        setLoadedUserId(user.id);
      }
    });

    return () => {
      active = false;
    };
  }, [authReady, user, setAuthError]);

  const resetData = useCallback(() => {
    setProfile(null);
    setIsAdmin(false);
    setBooks([]);
    setLoadedUserId(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    leaving.current = true;
    try {
      await signOut();
      resetData();
    } catch (error: unknown) {
      leaving.current = false;
      showToast(getErrorMessage(error, "Unable to sign out."), "error");
    }
  }, [signOut, resetData, showToast]);

  const handleDeleteAccount = useCallback(async () => {
    if (!user) throw new Error("You must be signed in to delete your Booklod data.");
    await deleteAccount();
    leaving.current = true;
    await signOut();
    resetData();
  }, [user, signOut, resetData]);

  const updateProfile = useCallback(
    async (patch: Partial<BooklodProfile>) => {
      const current = profileRef.current;
      if (!user || !current) throw new Error("You must be signed in to update your profile.");
      const { plan: planId, planName: _planName, canShare: _canShare, ...fields } = patch;
      void _planName;
      void _canShare;
      let next: BooklodProfile = { ...current, ...fields };
      // Plan changes go through set_my_plan(); the database decides what's allowed
      // and turns sharing off when the new plan doesn't include it.
      if (planId !== undefined && planId !== current.plan) {
        const plan = await setMyPlan(planId);
        next = applyPlan(next, plan);
        if (!plan.canShare) next.shareEnabled = false;
      }
      const { shareEnabled: _se, shareCode: _sc, ...savable } = fields;
      void _se;
      void _sc;
      if (Object.keys(savable).length > 0) await saveProfile(user.id, next);
      profileRef.current = next;
      setProfile(next);
    },
    [user],
  );

  // The form stays open until the API accepts the book, so a rejected save loses nothing.
  const saveBook = useCallback(
    async (book: BookRecord) => {
      const exists = books.some((b) => b.id === book.id);
      try {
        const saved = exists ? await updateBook(book) : await createBook(book);
        setBooks((current) => (exists ? current.map((b) => (b.id === saved.id ? saved : b)) : [saved, ...current]));
        router.replace(`/app/library/${encodeURIComponent(saved.id)}`);
        showToast(exists ? "Book updated" : "Book added to your library");
      } catch (error: unknown) {
        showToast(getErrorMessage(error, "Unable to save this book."), "error");
      }
    },
    [books, router, showToast],
  );

  async function confirmDeleteBook() {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await removeBook(id);
      setBooks((current) => current.filter((b) => b.id !== id));
      router.replace("/app/library");
      showToast("Book deleted");
    } catch (error: unknown) {
      showToast(getErrorMessage(error, "Unable to delete this book."), "error");
    }
  }

  if (loading || !user) {
    return (
      <div style={{ background: C.cream }} className="w-full min-h-full flex items-center justify-center py-24">
        <Loader2 className="animate-spin" style={{ color: C.green }} size={22} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ background: C.cream, fontFamily: "'Poppins', sans-serif" }} className="w-full min-h-full px-4 py-24">
        <div className="max-w-sm mx-auto text-center">
          <p role="alert" className="text-sm rounded-lg px-3 py-2" style={{ background: "#FDECEC", color: "#B23A3A" }}>
            {authError || "Unable to load your Booklod data."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="rounded-full px-5 py-2 text-sm font-semibold text-white" style={{ background: C.orange }}>
              Try again
            </button>
            <button onClick={handleSignOut} className="rounded-full px-5 py-2 text-sm font-semibold" style={{ color: C.navy }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tab = pathname.startsWith("/app/digest") ? "digest" : pathname.startsWith("/app/profile") ? "profile" : pathname === "/app/library" ? "library" : null;

  return (
    <AppContext.Provider
      value={{
        userId: user.id,
        books,
        profile,
        isAdmin,
        settings,
        showToast,
        saveBook,
        requestDeleteBook: setPendingDeleteId,
        updateProfile,
        signOut: handleSignOut,
        deleteAccount: handleDeleteAccount,
      }}
    >
      <div style={{ background: C.cream, fontFamily: "'Poppins', sans-serif" }} className="w-full min-h-full px-4 pt-5">
        <div className="max-w-xl mx-auto flex items-center justify-between mb-5">
          <button onClick={() => router.push("/app/library")} className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <h1 className="text-lg font-bold leading-none" style={{ color: C.navy }}>
              Book<span style={{ color: C.green }}>l</span>
              <span style={{ color: C.orange }}>od</span>
            </h1>
          </button>
          {(tab === "library" || tab === "digest") && (
            <button
              onClick={() => router.push("/app/library/new")}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ background: C.orange }}
            >
              <Plus size={16} /> Add Book
            </button>
          )}
        </div>

        {settings?.announcement_enabled && settings.announcement_text && (
          <div role="status" className="max-w-xl mx-auto mb-3 text-xs rounded-lg px-3 py-2" style={{ background: C.greenT, color: C.navy }}>
            {settings.announcement_text}
          </div>
        )}
        {authError && (
          <div role="alert" className="max-w-xl mx-auto mb-3 text-xs rounded-lg px-3 py-2" style={{ background: "#FDECEC", color: "#B23A3A" }}>
            {authError}
          </div>
        )}

        {children}

        {/* Tab bar on the top-level pages; book detail and forms have their own back buttons. */}
        {tab && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-center gap-1 py-2" style={{ borderColor: C.tan }}>
            <div className="max-w-xl w-full flex gap-2 px-4">
              <TabButton active={tab === "library"} icon={LibraryIcon} label="Library" onClick={() => router.push("/app/library")} />
              <TabButton active={tab === "digest"} icon={BarChart2} label="Digest" onClick={() => router.push("/app/digest")} />
              <TabButton active={tab === "profile"} icon={UserIcon} label="Profile" onClick={() => router.push("/app/profile")} />
            </div>
          </div>
        )}
        <div className="h-16" />

        {pendingDeleteId && (
          <ConfirmModal
            title="Delete this book?"
            body="Its reading history will be lost. This can't be undone."
            confirmLabel="Delete"
            danger
            onConfirm={confirmDeleteBook}
            onClose={() => setPendingDeleteId(null)}
          />
        )}
        <Toast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </AppContext.Provider>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof LibraryIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition"
      style={{ color: active ? C.orange : "#9A958D" }}
    >
      <Icon size={19} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

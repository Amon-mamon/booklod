"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { C } from "../../app/components/theme";
import { ConfirmModal } from "../../app/components/ui/ConfirmModal";
import { getErrorMessage, type ToastMessage } from "../shared/types";
import { formatPrice, intervalLabel } from "../profile/data/profile-repository";
import {
  adminApi,
  centsToInput,
  inputToCents,
  type AdminPlan,
  type AdminSettings,
  type AdminUserDetail,
  type AdminUserSummary,
} from "./admin-api";

type Toast = (message: string, type?: ToastMessage["type"]) => void;
type Tab = "users" | "plans" | "settings";

const PAGE_SIZE = 25;

// ---------------------------------------------------------------------------
// Small form primitives
// ---------------------------------------------------------------------------
const inputClass = "w-full rounded-lg px-3 py-2 text-sm outline-none bg-white";
const inputStyle = { border: `1px solid ${C.tan}`, color: C.navy };

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium mb-1" style={{ color: C.navy }}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] mt-1" style={{ color: C.muted }}>{hint}</span>}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm mb-2" style={{ color: C.navy }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${C.tan}` }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, busy, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className="rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 inline-flex items-center gap-1.5"
      style={{ background: C.orange }}
    >
      {busy && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  );
}

function GhostButton({ children, danger, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className="rounded-full px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
      style={{ background: danger ? "#FDECEC" : C.navyT, color: danger ? "#B23A3A" : C.navy }}
    >
      {children}
    </button>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="text-xs rounded-lg px-3 py-2 mb-3" style={{ background: "#FDECEC", color: "#B23A3A" }}>
      {message}{" "}
      {onRetry && (
        <button onClick={onRetry} className="underline font-semibold">
          Retry
        </button>
      )}
    </div>
  );
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "—");
/** ISO timestamp -> YYYY-MM-DD in the admin's local time (matches how it's saved). */
const localDay = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export function AdminPage({ currentUserId, showToast }: { currentUserId: string; showToast: Toast }) {
  const [tab, setTab] = useState<Tab>("users");
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [plansError, setPlansError] = useState("");
  const [plansLoading, setPlansLoading] = useState(true);

  const [plansKey, setPlansKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminApi
      .listPlans()
      .then((result) => {
        if (!active) return;
        setPlans(result.plans);
        setPlansError("");
      })
      .catch((error: unknown) => active && setPlansError(getErrorMessage(error, "Unable to load plans.")))
      .finally(() => active && setPlansLoading(false));
    return () => {
      active = false;
    };
  }, [plansKey]);

  const reloadPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansKey((k) => k + 1);
  }, []);

  return (
    <div className="max-w-xl mx-auto pb-10">
      <h2 className="text-xl font-semibold mb-4" style={{ color: C.navy }}>Admin</h2>
      <div role="tablist" className="inline-flex rounded-full p-1 mb-5" style={{ background: C.navyT }}>
        {(["users", "plans", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold capitalize"
            style={{ background: tab === t ? "white" : "transparent", color: C.navy }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab currentUserId={currentUserId} plans={plans} showToast={showToast} />}
      {tab === "plans" && (
        <PlansTab plans={plans} loading={plansLoading} error={plansError} reload={reloadPlans} showToast={showToast} />
      )}
      {tab === "settings" && <SettingsTab showToast={showToast} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
function UsersTab({ currentUserId, plans, showToast }: { currentUserId: string; plans: AdminPlan[]; showToast: Toast }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [usersKey, setUsersKey] = useState(0);

  useEffect(() => {
    let active = true;
    adminApi
      .listUsers(query, PAGE_SIZE, offset)
      .then((result) => {
        if (!active) return;
        setUsers(result.users);
        setTotal(result.total);
        setError("");
      })
      .catch((e: unknown) => active && setError(getErrorMessage(e, "Unable to load users.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query, offset, usersKey]);

  const load = useCallback(() => {
    setLoading(true);
    setUsersKey((k) => k + 1);
  }, []);
  const goTo = (nextOffset: number, nextQuery = query) => {
    if (nextOffset === offset && nextQuery === query) return load();
    setLoading(true);
    setOffset(nextOffset);
    setQuery(nextQuery);
  };

  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;

  if (selectedId) {
    return (
      <UserEditor
        userId={selectedId}
        currentUserId={currentUserId}
        plans={plans}
        showToast={showToast}
        onBack={() => setSelectedId(null)}
        onChanged={load}
      />
    );
  }

  return (
    <div>
      <form
        className="flex gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          goTo(0, search.trim());
        }}
      >
        <div className="flex-1 flex items-center gap-2 rounded-lg px-3 bg-white" style={{ border: `1px solid ${C.tan}` }}>
          <Search size={14} style={{ color: C.muted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name"
            aria-label="Search users"
            className="flex-1 py-2 text-sm outline-none"
            style={{ color: C.navy }}
          />
        </div>
        <GhostButton type="submit">Search</GhostButton>
        <PrimaryButton type="button" onClick={() => setCreating((v) => !v)}>
          <Plus size={13} /> New
        </PrimaryButton>
      </form>

      {creating && (
        <CreateUserForm
          plans={plans}
          showToast={showToast}
          onDone={(id) => {
            setCreating(false);
            void load();
            if (id) setSelectedId(id);
          }}
        />
      )}

      {error && <ErrorBox message={error} onRetry={load} />}

      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${C.tan}` }}>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin" size={18} style={{ color: C.green }} />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: C.muted }}>
            {query ? "No users match that search." : "No users yet."}
          </p>
        ) : (
          users.map((u, i) => (
            <button
              key={u.id}
              onClick={() => setSelectedId(u.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.tan}` : "none" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: C.navy }}>
                  {u.email || "(no email)"} {u.isAdmin && <span className="text-[10px] font-semibold" style={{ color: C.orange }}>ADMIN</span>}
                </p>
                <p className="text-xs truncate" style={{ color: C.muted }}>
                  {u.name || "No name"} · {planName(u.planId)}
                  {u.status !== "active" ? ` (${u.status})` : ""} · {u.bookCount} books
                </p>
              </div>
              <ChevronRight size={14} style={{ color: C.muted, flexShrink: 0 }} />
            </button>
          ))
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-3 text-xs" style={{ color: C.muted }}>
          <GhostButton disabled={offset === 0} onClick={() => goTo(Math.max(0, offset - PAGE_SIZE))}>
            <ChevronLeft size={13} /> Prev
          </GhostButton>
          <span>
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <GhostButton disabled={offset + PAGE_SIZE >= total} onClick={() => goTo(offset + PAGE_SIZE)}>
            Next <ChevronRight size={13} />
          </GhostButton>
        </div>
      )}
    </div>
  );
}

function CreateUserForm({ plans, showToast, onDone }: { plans: AdminPlan[]; showToast: Toast; onDone: (id?: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const { user } = await adminApi.createUser({
        email,
        password: password || undefined,
        name: name || undefined,
        planId: planId || undefined,
      });
      showToast(password ? "User created" : "Invite sent");
      onDone(user.id);
    } catch (e) {
      setError(getErrorMessage(e, "Unable to create that user."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <p className="text-sm font-semibold mb-3" style={{ color: C.navy }}>New user</p>
      {error && <ErrorBox message={error} />}
      <Field label="Email">
        <input className={inputClass} style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" hint="Leave empty to email them an invite link instead.">
        <input className={inputClass} style={inputStyle} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="Name (optional)">
        <input className={inputClass} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Plan">
        <select className={inputClass} style={inputStyle} value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="">Default (Starter)</option>
          {plans.filter((p) => p.kind === "plan").map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <PrimaryButton busy={busy} onClick={submit} disabled={!email}>Create</PrimaryButton>
        <GhostButton onClick={() => onDone()}>Cancel</GhostButton>
      </div>
    </Card>
  );
}

function UserEditor({
  userId,
  currentUserId,
  plans,
  showToast,
  onBack,
  onChanged,
}: {
  userId: string;
  currentUserId: string;
  plans: AdminPlan[];
  showToast: Toast;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("starter");
  const [status, setStatus] = useState("active");
  const [periodEnd, setPeriodEnd] = useState("");
  const [note, setNote] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const hydrate = (u: AdminUserDetail) => {
    setUser(u);
    setName(u.name);
    setPlanId(u.subscription?.planId ?? "starter");
    setStatus(u.subscription?.status ?? "active");
    setPeriodEnd(localDay(u.subscription?.currentPeriodEnd));
    setNote(u.subscription?.note ?? "");
    setIsAdmin(u.isAdmin);
  };

  const [loadKey, setLoadKey] = useState(0);
  const load = () => setLoadKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    adminApi
      .getUser(userId)
      .then((result) => {
        if (!active) return;
        hydrate(result.user);
        setError("");
      })
      .catch((e: unknown) => active && setError(getErrorMessage(e, "Unable to load that user.")));
    return () => {
      active = false;
    };
  }, [userId, loadKey]);

  async function save() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const body: Record<string, unknown> = {};
      const sub = user.subscription;
      const subChanged =
        planId !== (sub?.planId ?? "starter") ||
        status !== (sub?.status ?? "active") ||
        periodEnd !== localDay(sub?.currentPeriodEnd) ||
        note !== (sub?.note ?? "");
      // Only touch the subscription when it was edited, so renaming a user
      // doesn't create a subscription or overwrite a payment-sourced one.
      if (subChanged) {
        body.subscription = {
          planId,
          status,
          currentPeriodEnd: periodEnd ? new Date(`${periodEnd}T23:59:59`).toISOString() : null,
          note,
        };
      }
      if (name !== user.name) body.name = name;
      if (isAdmin !== user.isAdmin) body.isAdmin = isAdmin;
      if (Object.keys(body).length === 0) {
        showToast("Nothing to save.");
        return;
      }
      hydrate((await adminApi.updateUser(user.id, body)).user);
      showToast("User saved");
      onChanged();
    } catch (e) {
      setError(getErrorMessage(e, "Unable to save that user."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!user) return;
    setBusy(true);
    try {
      await adminApi.deleteUser(user.id);
      showToast("User deleted");
      onChanged();
      onBack();
    } catch (e) {
      setError(getErrorMessage(e, "Unable to delete that user."));
      setBusy(false);
    }
  }

  const isSelf = userId === currentUserId;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-xs font-medium mb-3" style={{ color: C.green }}>
        <ChevronLeft size={14} /> All users
      </button>
      {error && <ErrorBox message={error} onRetry={user ? undefined : load} />}
      {!user ? (
        !error && (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin" size={18} style={{ color: C.green }} />
          </div>
        )
      ) : (
        <>
          <Card>
            <p className="text-sm font-semibold break-all" style={{ color: C.navy }}>{user.email}</p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              Signed up {fmtDate(user.createdAt)} · last sign-in {fmtDate(user.lastSignInAt)} · {user.provider}
            </p>
            <p className="text-xs mt-1" style={{ color: C.muted }}>
              {user.bookCount} books · shelf sharing {user.shareEnabled ? "on" : "off"} · effective plan{" "}
              <strong>{user.effectivePlan?.name ?? "—"}</strong>
            </p>
          </Card>

          <Card>
            <Field label="Name">
              <input className={inputClass} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Check
              label={isSelf ? "Admin (you can't remove your own access)" : "Admin"}
              checked={isAdmin}
              onChange={(v) => !isSelf && setIsAdmin(v)}
            />
          </Card>

          <Card>
            <p className="text-sm font-semibold mb-3" style={{ color: C.navy }}>Subscription</p>
            <Field label="Plan">
              <select className={inputClass} style={inputStyle} value={planId} onChange={(e) => setPlanId(e.target.value)}>
                {plans.filter((p) => p.kind === "plan").map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p)} {intervalLabel(p.billingInterval)}{p.isActive ? "" : " (inactive)"}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status" hint="Only an active subscription counts. Otherwise the user falls back to Starter.">
              <select className={inputClass} style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="canceled">Canceled</option>
              </select>
            </Field>
            <Field label="Ends on" hint="Leave empty for no end date. After this date the user falls back to Starter.">
              <input className={inputClass} style={inputStyle} type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </Field>
            <Field label="Internal note">
              <textarea className={inputClass} style={inputStyle} rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            {user.subscription && (
              <p className="text-[11px] mb-3" style={{ color: C.muted }}>
                Last changed {fmtDate(user.subscription.updatedAt)} via {user.subscription.source}
              </p>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            <PrimaryButton busy={busy} onClick={save}>Save changes</PrimaryButton>
            {!isSelf && (
              <GhostButton danger onClick={() => setConfirmDelete(true)} disabled={busy}>
                <Trash2 size={13} /> Delete user
              </GhostButton>
            )}
          </div>

          {confirmDelete && (
            <ConfirmModal
              title={`Delete ${user.email}?`}
              body="This deletes their sign-in, library, shelf and subscription. It can't be undone."
              confirmLabel="Delete user"
              danger
              onConfirm={remove}
              onClose={() => setConfirmDelete(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
function PlansTab({
  plans,
  loading,
  error,
  reload,
  showToast,
}: {
  plans: AdminPlan[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  showToast: Toast;
}) {
  const [editing, setEditing] = useState<AdminPlan | "new" | null>(null);

  if (editing) {
    return (
      <PlanEditor
        plan={editing === "new" ? null : editing}
        showToast={showToast}
        onDone={() => {
          setEditing(null);
          void reload();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs" style={{ color: C.muted }}>
          Changes apply right away to the pricing page, the upgrade screen and new subscriptions.
        </p>
        <PrimaryButton onClick={() => setEditing("new")}>
          <Plus size={13} /> New
        </PrimaryButton>
      </div>
      {error && <ErrorBox message={error} onRetry={reload} />}
      <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${C.tan}` }}>
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="animate-spin" size={18} style={{ color: C.green }} />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: C.muted }}>No plans. Run supabase/schema.sql to seed them.</p>
        ) : (
          plans.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              style={{ borderBottom: i < plans.length - 1 ? `1px solid ${C.tan}` : "none", opacity: p.isActive ? 1 : 0.55 }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: C.navy }}>
                  {p.name} <span className="text-[11px]" style={{ color: C.muted }}>({p.id})</span>
                </p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {formatPrice(p)} {intervalLabel(p.billingInterval)} · {p.kind === "addon" ? "add-on" : `${p.subscriberCount} subscribers`}
                  {p.canShare ? " · sharing" : ""}
                  {p.isActive ? "" : " · inactive"}
                </p>
              </div>
              <ChevronRight size={14} style={{ color: C.muted, flexShrink: 0 }} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function PlanEditor({ plan, showToast, onDone }: { plan: AdminPlan | null; showToast: Toast; onDone: () => void }) {
  const isNew = plan === null;
  const [id, setId] = useState(plan?.id ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [price, setPrice] = useState(plan ? centsToInput(plan.priceCents) : "");
  const [currency, setCurrency] = useState(plan?.currency ?? "PHP");
  const [interval, setInterval] = useState<AdminPlan["billingInterval"]>(plan?.billingInterval ?? "month");
  const [bookLimit, setBookLimit] = useState(plan?.bookLimit ? String(plan.bookLimit) : "");
  const [canShare, setCanShare] = useState(plan?.canShare ?? false);
  const [selfService, setSelfService] = useState(plan?.selfService ?? false);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(plan?.sortOrder ?? 0));
  const [kind, setKind] = useState<AdminPlan["kind"]>(plan?.kind ?? "plan");
  const [features, setFeatures] = useState((plan?.features ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    const priceCents = inputToCents(price);
    if (priceCents === null) return setError("Enter a price like 129 or 129.50.");
    const limit = bookLimit.trim() === "" ? null : Number(bookLimit);
    if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 5000)) return setError("Book limit must be 1–5000, or empty for unlimited.");
    const order = Number(sortOrder);
    if (!Number.isInteger(order)) return setError("Sort order must be a whole number.");

    const body: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim(),
      priceCents,
      currency: currency.trim().toUpperCase(),
      billingInterval: interval,
      bookLimit: limit,
      canShare,
      selfService,
      isActive,
      sortOrder: order,
      kind,
      features: features.split("\n").map((f) => f.trim()).filter(Boolean),
    };
    setBusy(true);
    setError("");
    try {
      if (isNew) await adminApi.createPlan({ id: id.trim(), ...body });
      else await adminApi.updatePlan(plan.id, body);
      showToast(isNew ? "Plan created" : "Plan saved");
      onDone();
    } catch (e) {
      setError(getErrorMessage(e, "Unable to save that plan."));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!plan) return;
    setBusy(true);
    try {
      await adminApi.deletePlan(plan.id);
      showToast("Plan deleted");
      onDone();
    } catch (e) {
      setError(getErrorMessage(e, "Unable to delete that plan."));
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={onDone} className="flex items-center gap-1 text-xs font-medium mb-3" style={{ color: C.green }}>
        <ChevronLeft size={14} /> All plans
      </button>
      {error && <ErrorBox message={error} />}
      <Card>
        {isNew ? (
          <Field label="Plan id" hint="Lowercase letters, digits, - or _. Can't be changed later.">
            <input className={inputClass} style={inputStyle} value={id} onChange={(e) => setId(e.target.value)} />
          </Field>
        ) : (
          <p className="text-xs mb-3" style={{ color: C.muted }}>
            Plan id <strong>{plan.id}</strong> · {plan.subscriberCount} subscribers
          </p>
        )}
        <Field label="Name">
          <input className={inputClass} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </Field>
        <Field label="Description">
          <textarea className={inputClass} style={inputStyle} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price" hint="e.g. 129 or 129.50">
            <input className={inputClass} style={inputStyle} inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
          <Field label="Currency">
            <input className={inputClass} style={inputStyle} value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Billing">
            <select className={inputClass} style={inputStyle} value={interval} onChange={(e) => setInterval(e.target.value as AdminPlan["billingInterval"])}>
              <option value="one_time">One-time</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </Field>
          <Field label="Book limit" hint="Empty = unlimited">
            <input className={inputClass} style={inputStyle} inputMode="numeric" value={bookLimit} onChange={(e) => setBookLimit(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select className={inputClass} style={inputStyle} value={kind} onChange={(e) => setKind(e.target.value as AdminPlan["kind"])}>
              <option value="plan">Plan</option>
              <option value="addon">Add-on (listed only)</option>
            </select>
          </Field>
          <Field label="Sort order">
            <input className={inputClass} style={inputStyle} inputMode="numeric" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </Field>
        </div>
        <Field label="Features" hint="One per line. Shown on the pricing page and upgrade screen.">
          <textarea className={inputClass} style={inputStyle} rows={5} value={features} onChange={(e) => setFeatures(e.target.value)} />
        </Field>
        <Check label="Includes Share Your Shelf" checked={canShare} onChange={setCanShare} />
        <Check label="Users can pick it themselves in the app (demo checkout)" checked={selfService} onChange={setSelfService} />
        <Check label="Active (shown to users)" checked={isActive} onChange={setIsActive} />
        {!isNew && plan.subscriberCount > 0 && price !== centsToInput(plan.priceCents) && (
          <p className="text-[11px] mt-2" style={{ color: C.orange }}>
            The new price shows everywhere immediately. Existing subscribers stay on this plan; no one is charged automatically
            (there is no payment provider yet).
          </p>
        )}
      </Card>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton busy={busy} onClick={save}>{isNew ? "Create plan" : "Save plan"}</PrimaryButton>
        {!isNew && plan.id !== "starter" && (
          <GhostButton danger disabled={busy} onClick={() => setConfirmDelete(true)}>
            <Trash2 size={13} /> Delete
          </GhostButton>
        )}
      </div>
      {confirmDelete && plan && (
        <ConfirmModal
          title={`Delete ${plan.name}?`}
          body="Plans with subscribers can't be deleted. Deactivate them instead."
          confirmLabel="Delete plan"
          danger
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function SettingsTab({ showToast }: { showToast: Toast }) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [loadKey, setLoadKey] = useState(0);
  const load = () => setLoadKey((k) => k + 1);

  useEffect(() => {
    let active = true;
    adminApi
      .getSettings()
      .then((result) => {
        if (!active) return;
        setSettings(result.settings);
        setError("");
      })
      .catch((e: unknown) => active && setError(getErrorMessage(e, "Unable to load settings.")));
    return () => {
      active = false;
    };
  }, [loadKey]);

  async function save() {
    if (!settings) return;
    setBusy(true);
    setError("");
    try {
      setSettings((await adminApi.updateSettings(settings)).settings);
      showToast("Settings saved");
    } catch (e) {
      setError(getErrorMessage(e, "Unable to save settings."));
    } finally {
      setBusy(false);
    }
  }

  if (!settings) {
    return error ? (
      <ErrorBox message={error} onRetry={load} />
    ) : (
      <div className="py-10 flex justify-center">
        <Loader2 className="animate-spin" size={18} style={{ color: C.green }} />
      </div>
    );
  }

  const set = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => setSettings({ ...settings, [key]: value });

  return (
    <div>
      {error && <ErrorBox message={error} />}
      <Card>
        <p className="text-sm font-semibold mb-3" style={{ color: C.navy }}>Announcement banner</p>
        <Check label="Show banner in the web and mobile apps" checked={settings.announcement_enabled} onChange={(v) => set("announcement_enabled", v)} />
        <Field label="Message" hint="Up to 280 characters.">
          <textarea className={inputClass} style={inputStyle} rows={2} maxLength={280} value={settings.announcement_text} onChange={(e) => set("announcement_text", e.target.value)} />
        </Field>
      </Card>
      <Card>
        <Field label="Support email" hint="Shown in Help & Support. Leave empty to hide.">
          <input className={inputClass} style={inputStyle} type="email" value={settings.support_email} onChange={(e) => set("support_email", e.target.value)} />
        </Field>
        <Field label="Pricing page footnote">
          <textarea className={inputClass} style={inputStyle} rows={3} maxLength={500} value={settings.pricing_footnote} onChange={(e) => set("pricing_footnote", e.target.value)} />
        </Field>
      </Card>
      <PrimaryButton busy={busy} onClick={save}>Save settings</PrimaryButton>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, Plus, Search, Trash2 } from "lucide-react-native";
import { errorMessage } from "@/api/client";
import { adminApi } from "@/api/endpoints";
import { BackHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Banner, Card, Choice, EmptyState, FieldLabel, LoadingView, SectionHeading, Toggle } from "@/components/ui/primitives";
import { ConfirmSheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { formatPrice, intervalLabel } from "@/features/profile/hooks/useProfile";
import { useToast } from "@/providers/ToastProvider";
import { C } from "@/theme";
import type { AdminPlan, AdminUserDetail, AppSettings, BillingInterval } from "@/types/booklod";
import {
  ADMIN_PAGE_SIZE,
  centsToInput,
  inputToCents,
  useAdminMutation,
  useAdminPlans,
  useAdminSettings,
  useAdminUser,
  useAdminUsers,
  useSaveSettings,
} from "../hooks/useAdmin";

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint ? (
        <AppText size={11} color={C.subtle} style={{ marginTop: 4 }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function SwitchRow({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <View style={styles.switchRow}>
      <AppText style={{ flex: 1 }} color={disabled ? C.subtle : C.navy}>
        {label}
      </AppText>
      <Toggle label={label} value={value} onChange={() => !disabled && onChange(!value)} disabled={disabled} />
    </View>
  );
}

function ListRow({ title, subtitle, onPress, last, dim }: { title: string; subtitle: string; onPress: () => void; last?: boolean; dim?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.row, !last && styles.divider, dim && { opacity: 0.55 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText weight="medium" numberOfLines={1}>
          {title}
        </AppText>
        <AppText size={12} color={C.muted} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <ChevronRight size={14} color={C.subtle} />
    </Pressable>
  );
}

const fmtDate = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString() : "—");
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
/** ISO timestamp -> YYYY-MM-DD in local time (matches how it's saved). */
const localDay = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// ---------------------------------------------------------------------------
// Admin home: Users / Plans / Settings
// ---------------------------------------------------------------------------
type Tab = "users" | "plans" | "settings";

export function AdminHomeScreen() {
  const [tab, setTab] = useState<Tab>("users");
  return (
    <Screen>
      <BackHeader title="Admin" />
      <View style={styles.tabs}>
        {(["users", "plans", "settings"] as Tab[]).map((t) => (
          <Choice key={t} label={t[0].toUpperCase() + t.slice(1)} active={tab === t} onPress={() => setTab(t)} rounded="pill" small style={{ flex: 1 }} />
        ))}
      </View>
      {tab === "users" && <UsersTab />}
      {tab === "plans" && <PlansTab />}
      {tab === "settings" && <SettingsTab />}
    </Screen>
  );
}

function UsersTab() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, error, refetch } = useAdminUsers(query, offset);
  const { data: plans } = useAdminPlans();
  const planName = (id: string) => plans?.find((p) => p.id === id)?.name ?? id;
  const total = data?.total ?? 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder="Search email or name"
            returnKeyType="search"
            autoCapitalize="none"
            onSubmitEditing={() => {
              setOffset(0);
              setQuery(search.trim());
            }}
          />
        </View>
        <Button label="" accessibilityLabel="Search" icon={<Search size={16} color="white" />} variant="navy" onPress={() => { setOffset(0); setQuery(search.trim()); }} />
        <Button label="" accessibilityLabel="New user" icon={<Plus size={16} color="white" />} onPress={() => router.push("/admin/users/new")} />
      </View>
      {error ? <Banner message={errorMessage(error, "Unable to load users.")} onRetry={refetch} /> : null}
      {isLoading ? (
        <LoadingView />
      ) : !data || data.users.length === 0 ? (
        <EmptyState icon={Search} title={query ? "No users match that search." : "No users yet."} />
      ) : (
        <Card>
          {data.users.map((u, i) => (
            <ListRow
              key={u.id}
              title={`${u.email || "(no email)"}${u.isAdmin ? "  · ADMIN" : ""}`}
              subtitle={`${u.name || "No name"} · ${planName(u.planId)}${u.status !== "active" ? ` (${u.status})` : ""} · ${u.bookCount} books`}
              onPress={() => router.push({ pathname: "/admin/users/[id]", params: { id: u.id } })}
              last={i === data.users.length - 1}
            />
          ))}
        </Card>
      )}
      {total > ADMIN_PAGE_SIZE ? (
        <View style={styles.pager}>
          <Button label="Prev" variant="outline" small disabled={offset === 0} onPress={() => setOffset(Math.max(0, offset - ADMIN_PAGE_SIZE))} />
          <AppText size={12} color={C.muted}>
            {offset + 1}–{Math.min(offset + ADMIN_PAGE_SIZE, total)} of {total}
          </AppText>
          <Button label="Next" variant="outline" small disabled={offset + ADMIN_PAGE_SIZE >= total} onPress={() => setOffset(offset + ADMIN_PAGE_SIZE)} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function PlansTab() {
  const { data: plans, isLoading, error, refetch } = useAdminPlans();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <AppText size={12} color={C.muted} style={{ flex: 1 }}>
          Changes apply right away to pricing, the upgrade screen and new subscriptions.
        </AppText>
        <Button label="New" small pill icon={<Plus size={14} color="white" />} onPress={() => router.push("/admin/plans/new")} />
      </View>
      {error ? <Banner message={errorMessage(error, "Unable to load plans.")} onRetry={refetch} /> : null}
      {isLoading ? (
        <LoadingView />
      ) : (
        <Card>
          {(plans || []).map((p, i, all) => (
            <ListRow
              key={p.id}
              dim={!p.isActive}
              title={`${p.name} (${p.id})`}
              subtitle={`${formatPrice(p)}${intervalLabel(p.billingInterval)} · ${p.kind === "addon" ? "add-on" : `${p.subscriberCount} subscribers`}${p.canShare ? " · sharing" : ""}${p.isActive ? "" : " · inactive"}`}
              onPress={() => router.push({ pathname: "/admin/plans/[id]", params: { id: p.id } })}
              last={i === all.length - 1}
            />
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function SettingsTab() {
  const { data, isLoading, error, refetch } = useAdminSettings();
  if (isLoading) return <LoadingView />;
  if (!data) return <Banner message={errorMessage(error, "Unable to load settings.")} onRetry={refetch} />;
  return <SettingsForm initial={data} />;
}

function SettingsForm({ initial }: { initial: AppSettings }) {
  const toast = useToast();
  const save = useSaveSettings();
  const [settings, setSettings] = useState(initial);
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  async function submit() {
    try {
      await save.mutateAsync(settings);
      toast("Settings saved");
    } catch (e) {
      toast(errorMessage(e, "Unable to save settings."), "error");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <SectionHeading>Announcement banner</SectionHeading>
      <Card style={styles.form}>
        <SwitchRow label="Show banner in the web and mobile apps" value={settings.announcement_enabled} onChange={(v) => set("announcement_enabled", v)} />
        <Field label="Message" hint="Up to 280 characters.">
          <TextField multiline maxLength={280} value={settings.announcement_text} onChangeText={(v) => set("announcement_text", v)} />
        </Field>
      </Card>
      <SectionHeading>Support & pricing</SectionHeading>
      <Card style={styles.form}>
        <Field label="Support email" hint="Shown in Help & Support. Leave empty to hide.">
          <TextField keyboardType="email-address" autoCapitalize="none" value={settings.support_email} onChangeText={(v) => set("support_email", v)} />
        </Field>
        <Field label="Pricing page footnote">
          <TextField multiline maxLength={500} value={settings.pricing_footnote} onChangeText={(v) => set("pricing_footnote", v)} />
        </Field>
      </Card>
      <Button label="Save settings" onPress={submit} loading={save.isPending} />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// User: create (id = "new") or edit
// ---------------------------------------------------------------------------
export function AdminUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: plans } = useAdminPlans();
  const userPlans = (plans || []).filter((p) => p.kind === "plan");
  const { data: user, isLoading, error, refetch } = useAdminUser(id);

  return (
    <Screen>
      <BackHeader title={id === "new" ? "New user" : "User"} />
      {id === "new" ? (
        <CreateUserForm plans={userPlans} />
      ) : isLoading ? (
        <LoadingView />
      ) : !user ? (
        <Banner message={errorMessage(error, "Unable to load that user.")} onRetry={refetch} />
      ) : (
        <EditUserForm key={user.id} user={user} plans={userPlans} />
      )}
    </Screen>
  );
}

function PlanChoices({ plans, value, onChange, allowDefault }: { plans: AdminPlan[]; value: string; onChange: (id: string) => void; allowDefault?: boolean }) {
  return (
    <View style={styles.wrap}>
      {allowDefault ? <Choice label="Default" active={value === ""} onPress={() => onChange("")} small rounded="pill" /> : null}
      {plans.map((p) => (
        <Choice key={p.id} label={`${p.name} · ${formatPrice(p)}`} active={value === p.id} onPress={() => onChange(p.id)} small rounded="pill" />
      ))}
    </View>
  );
}

function CreateUserForm({ plans }: { plans: AdminPlan[] }) {
  const toast = useToast();
  const create = useAdminMutation(adminApi.createUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("");

  async function submit() {
    try {
      const { user } = await create.mutateAsync({ email, password: password || undefined, name: name || undefined, planId: planId || undefined });
      toast(password ? "User created" : "Invite sent");
      router.replace({ pathname: "/admin/users/[id]", params: { id: user.id } });
    } catch (e) {
      toast(errorMessage(e, "Unable to create that user."), "error");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Card style={styles.form}>
        <Field label="Email">
          <TextField value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="off" />
        </Field>
        <Field label="Password" hint="Leave empty to email them an invite link instead.">
          <TextField value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
        </Field>
        <Field label="Name (optional)">
          <TextField value={name} onChangeText={setName} maxLength={100} />
        </Field>
        <Field label="Plan">
          <PlanChoices plans={plans} value={planId} onChange={setPlanId} allowDefault />
        </Field>
      </Card>
      <Button label="Create user" onPress={submit} loading={create.isPending} disabled={!email} />
    </ScrollView>
  );
}

function EditUserForm({ user, plans }: { user: AdminUserDetail; plans: AdminPlan[] }) {
  const toast = useToast();
  const update = useAdminMutation((body: Record<string, unknown>) => adminApi.updateUser(user.id, body));
  const remove = useAdminMutation(() => adminApi.deleteUser(user.id));
  const [name, setName] = useState(user.name);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [planId, setPlanId] = useState(user.subscription?.planId ?? "starter");
  const [status, setStatus] = useState(user.subscription?.status ?? "active");
  const [periodEnd, setPeriodEnd] = useState(localDay(user.subscription?.currentPeriodEnd));
  const [note, setNote] = useState(user.subscription?.note ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    if (periodEnd && !ISO_DAY.test(periodEnd)) return toast("Use YYYY-MM-DD for the end date.", "error");
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
    if (Object.keys(body).length === 0) return toast("Nothing to save.");
    try {
      await update.mutateAsync(body);
      toast("User saved");
    } catch (e) {
      toast(errorMessage(e, "Unable to save that user."), "error");
    }
  }

  async function confirmRemove() {
    try {
      await remove.mutateAsync(undefined);
      setConfirmDelete(false);
      toast("User deleted");
      router.back();
    } catch (e) {
      setConfirmDelete(false);
      toast(errorMessage(e, "Unable to delete that user."), "error");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Card style={styles.form}>
        <AppText weight="semibold" selectable>
          {user.email}
        </AppText>
        <AppText size={12} color={C.muted} style={{ marginTop: 4 }}>
          Signed up {fmtDate(user.createdAt)} · last sign-in {fmtDate(user.lastSignInAt)} · {user.provider}
        </AppText>
        <AppText size={12} color={C.muted} style={{ marginTop: 2 }}>
          {user.bookCount} books · sharing {user.shareEnabled ? "on" : "off"} · effective plan {user.effectivePlan?.name ?? "—"}
        </AppText>
      </Card>

      <Card style={styles.form}>
        <Field label="Name">
          <TextField value={name} onChangeText={setName} maxLength={100} />
        </Field>
        <SwitchRow label="Admin" value={isAdmin} onChange={setIsAdmin} />
      </Card>

      <SectionHeading>Subscription</SectionHeading>
      <Card style={styles.form}>
        <Field label="Plan">
          <PlanChoices plans={plans} value={planId} onChange={setPlanId} />
        </Field>
        <Field label="Status" hint="Only an active subscription counts. Otherwise the user falls back to Starter.">
          <View style={styles.wrap}>
            {(["active", "past_due", "canceled"] as const).map((s) => (
              <Choice key={s} label={s.replace("_", " ")} active={status === s} onPress={() => setStatus(s)} small rounded="pill" />
            ))}
          </View>
        </Field>
        <Field label="Ends on (YYYY-MM-DD)" hint="Empty = no end date. After it the user falls back to Starter.">
          <TextField value={periodEnd} onChangeText={setPeriodEnd} placeholder="2027-11-07" autoCapitalize="none" maxLength={10} />
        </Field>
        <Field label="Internal note">
          <TextField multiline maxLength={1000} value={note} onChangeText={setNote} />
        </Field>
        {user.subscription ? (
          <AppText size={11} color={C.subtle}>
            Last changed {fmtDate(user.subscription.updatedAt)} via {user.subscription.source}
          </AppText>
        ) : null}
      </Card>

      <Button label="Save changes" onPress={save} loading={update.isPending} />
      <Button
        label="Delete user"
        variant="ghost"
        icon={<Trash2 size={14} color={C.muted} />}
        onPress={() => setConfirmDelete(true)}
        style={{ marginTop: 8 }}
      />
      <ConfirmSheet
        visible={confirmDelete}
        title={`Delete ${user.email}?`}
        body="This deletes their sign-in, library, shelf and subscription. It can't be undone. (You can't delete yourself.)"
        confirmLabel="Delete user"
        danger
        loading={remove.isPending}
        onConfirm={confirmRemove}
        onClose={() => setConfirmDelete(false)}
      />
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Plan: create (id = "new") or edit
// ---------------------------------------------------------------------------
export function AdminPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: plans, isLoading, error, refetch } = useAdminPlans();
  const plan = plans?.find((p) => p.id === id) ?? null;

  return (
    <Screen>
      <BackHeader title={id === "new" ? "New plan" : "Plan"} />
      {id === "new" ? (
        <PlanForm plan={null} />
      ) : isLoading ? (
        <LoadingView />
      ) : !plan ? (
        <Banner message={errorMessage(error, "Plan not found.")} onRetry={refetch} />
      ) : (
        <PlanForm key={plan.id} plan={plan} />
      )}
    </Screen>
  );
}

function PlanForm({ plan }: { plan: AdminPlan | null }) {
  const toast = useToast();
  const isNew = plan === null;
  const save = useAdminMutation((body: Record<string, unknown>) => (isNew ? adminApi.createPlan(body) : adminApi.updatePlan(plan.id, body)));
  const remove = useAdminMutation(() => adminApi.deletePlan(plan!.id));
  const [id, setId] = useState(plan?.id ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [price, setPrice] = useState(plan ? centsToInput(plan.priceCents) : "");
  const [currency, setCurrency] = useState(plan?.currency ?? "PHP");
  const [interval, setInterval] = useState<BillingInterval>(plan?.billingInterval ?? "month");
  const [bookLimit, setBookLimit] = useState(plan?.bookLimit ? String(plan.bookLimit) : "");
  const [canShare, setCanShare] = useState(plan?.canShare ?? false);
  const [selfService, setSelfService] = useState(plan?.selfService ?? false);
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(plan?.sortOrder ?? 0));
  const [kind, setKind] = useState<AdminPlan["kind"]>(plan?.kind ?? "plan");
  const [features, setFeatures] = useState((plan?.features ?? []).join("\n"));
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function submit() {
    const priceCents = inputToCents(price);
    if (priceCents === null) return toast("Enter a price like 129 or 129.50.", "error");
    const limit = bookLimit.trim() === "" ? null : Number(bookLimit);
    if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > 5000)) return toast("Book limit must be 1–5000, or empty.", "error");
    const order = Number(sortOrder);
    if (!Number.isInteger(order)) return toast("Sort order must be a whole number.", "error");
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
    if (isNew) body.id = id.trim();
    try {
      await save.mutateAsync(body);
      toast(isNew ? "Plan created" : "Plan saved");
      router.back();
    } catch (e) {
      toast(errorMessage(e, "Unable to save that plan."), "error");
    }
  }

  async function confirmRemove() {
    try {
      await remove.mutateAsync(undefined);
      setConfirmDelete(false);
      toast("Plan deleted");
      router.back();
    } catch (e) {
      setConfirmDelete(false);
      toast(errorMessage(e, "Unable to delete that plan."), "error");
    }
  }

  const priceChanged = !isNew && plan.subscriberCount > 0 && price !== centsToInput(plan.priceCents);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Card style={styles.form}>
        {isNew ? (
          <Field label="Plan id" hint="Lowercase letters, digits, - or _. Can't be changed later.">
            <TextField value={id} onChangeText={setId} autoCapitalize="none" maxLength={40} />
          </Field>
        ) : (
          <AppText size={12} color={C.muted} style={{ marginBottom: 12 }}>
            Plan id {plan.id} · {plan.subscriberCount} subscribers
          </AppText>
        )}
        <Field label="Name">
          <TextField value={name} onChangeText={setName} maxLength={80} />
        </Field>
        <Field label="Description">
          <TextField multiline value={description} onChangeText={setDescription} maxLength={1000} />
        </Field>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 2 }}>
            <Field label="Price" hint="e.g. 129 or 129.50">
              <TextField value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Currency">
              <TextField value={currency} onChangeText={setCurrency} autoCapitalize="characters" maxLength={3} />
            </Field>
          </View>
        </View>
        <Field label="Billing">
          <View style={styles.wrap}>
            {(["one_time", "month", "year"] as const).map((v) => (
              <Choice key={v} label={v === "one_time" ? "One-time" : v === "month" ? "Monthly" : "Yearly"} active={interval === v} onPress={() => setInterval(v)} small rounded="pill" />
            ))}
          </View>
        </Field>
        <Field label="Type">
          <View style={styles.wrap}>
            <Choice label="Plan" active={kind === "plan"} onPress={() => setKind("plan")} small rounded="pill" />
            <Choice label="Add-on (listed only)" active={kind === "addon"} onPress={() => setKind("addon")} small rounded="pill" />
          </View>
        </Field>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Book limit" hint="Empty = unlimited">
              <TextField value={bookLimit} onChangeText={setBookLimit} keyboardType="number-pad" />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Sort order">
              <TextField value={sortOrder} onChangeText={setSortOrder} keyboardType="numbers-and-punctuation" />
            </Field>
          </View>
        </View>
        <Field label="Features" hint="One per line. Shown on pricing and the upgrade screen.">
          <TextField multiline value={features} onChangeText={setFeatures} style={{ minHeight: 110 }} />
        </Field>
        <SwitchRow label="Includes Share Your Shelf" value={canShare} onChange={setCanShare} />
        <SwitchRow label="Users can pick it in the app (demo checkout)" value={selfService} onChange={setSelfService} />
        <SwitchRow label="Active (shown to users)" value={isActive} onChange={setIsActive} />
        {priceChanged ? (
          <AppText size={11} color={C.orange} style={{ marginTop: 8 }}>
            The new price shows everywhere immediately. Existing subscribers stay on this plan; no one is charged automatically.
          </AppText>
        ) : null}
      </Card>
      <Button label={isNew ? "Create plan" : "Save plan"} onPress={submit} loading={save.isPending} />
      {!isNew && plan.id !== "starter" ? (
        <Button label="Delete plan" variant="ghost" icon={<Trash2 size={14} color={C.muted} />} onPress={() => setConfirmDelete(true)} style={{ marginTop: 8 }} />
      ) : null}
      <ConfirmSheet
        visible={confirmDelete}
        title={`Delete ${plan?.name ?? "plan"}?`}
        body="Plans with subscribers can't be deleted. Deactivate them instead."
        confirmLabel="Delete plan"
        danger
        loading={remove.isPending}
        onConfirm={confirmRemove}
        onClose={() => setConfirmDelete(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 8, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  divider: { borderBottomWidth: 1, borderBottomColor: C.tan },
  form: { padding: 16, marginBottom: 16 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pager: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
});

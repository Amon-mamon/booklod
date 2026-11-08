import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { Camera, FileText, HelpCircle, Info, LogOut, MessageSquare, Shield, ShieldCheck, Sparkles } from "lucide-react-native";
import { errorMessage } from "@/api/client";
import { env } from "@/config/env";
import { AppHeader, Screen } from "@/components/layout/Screen";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Banner, Card, LoadingView, Pill, SectionHeading, Toggle } from "@/components/ui/primitives";
import { ConfirmSheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { pickCompressedImage } from "@/lib/images";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { C, radius } from "@/theme";
import type { BooklodProfile } from "@/types/booklod";
import { NavRow, ToggleRow } from "../components/Rows";
import { CancelPlusSheet, DeleteDataSheet, FeedbackSheet, HelpSheet, UpgradePlusSheet } from "../components/ProfileSheets";
import { useAppSettings, useDeleteAccountData, useIsAdmin, usePlans, useProfile, useShareShelf, useUpdateProfile } from "../hooks/useProfile";

type SheetName = "upgrade" | "cancel" | "delete" | "feedback" | "help" | "signout" | null;

export function ProfileScreen() {
  const { data: profile, isLoading, error, refetch } = useProfile();
  return (
    <Screen>
      <AppHeader />
      {isLoading ? (
        <LoadingView />
      ) : !profile ? (
        <Banner message={errorMessage(error, "Unable to load your profile.")} onRetry={refetch} />
      ) : (
        <ProfileContent profile={profile} />
      )}
    </Screen>
  );
}

function ProfileContent({ profile }: { profile: BooklodProfile }) {
  const toast = useToast();
  const { signOut } = useAuth();
  const updateProfile = useUpdateProfile();
  const share = useShareShelf();
  const deleteData = useDeleteAccountData();

  const [sheet, setSheet] = useState<SheetName>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const isPlus = profile.canShare ?? profile.plan === "plus";
  const isAdmin = useIsAdmin();
  const { data: plans } = usePlans();
  const { data: settings } = useAppSettings();
  // Prices/features are edited by admins; pick the monthly self-service sharing plan.
  const sharePlans = (plans || []).filter((p) => p.kind === "plan" && p.canShare && p.selfService);
  const plusPlan = sharePlans.find((p) => p.billingInterval === "month") ?? sharePlans[0];

  async function update(patch: Parameters<typeof updateProfile.mutateAsync>[0], success?: string) {
    try {
      await updateProfile.mutateAsync(patch);
      if (success) toast(success);
    } catch (e) {
      toast(errorMessage(e, "Unable to update your profile."), "error");
      throw e;
    }
  }

  async function changePhoto() {
    setUploading(true);
    try {
      const dataUrl = await pickCompressedImage();
      if (dataUrl) await update({ photoUrl: dataUrl }, "Profile photo updated");
    } catch (e) {
      if (!(e instanceof Error && e.name === "ApiRequestError")) toast(errorMessage(e, "Couldn't process that image."), "error");
    } finally {
      setUploading(false);
    }
  }

  async function saveName() {
    const trimmed = nameDraft.trim();
    await update({ name: trimmed }, trimmed ? "Name updated" : "Name cleared").catch(() => {});
    setEditingName(false);
  }

  async function runShare(action: "publish" | "stop", success: string) {
    try {
      await share.mutateAsync(action);
      toast(success);
    } catch (e) {
      toast(errorMessage(e, "Unable to update shelf sharing."), "error");
    }
  }

  async function copyCode() {
    await Clipboard.setStringAsync(profile.shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(); // AuthProvider clears the cache when the session ends
    } catch (e) {
      toast(errorMessage(e, "Unable to sign out."), "error");
      setSigningOut(false);
    }
  }

  async function handleDelete() {
    await deleteData.mutateAsync();
    setSheet(null);
    await signOut().catch(() => {});
  }

  const openWeb = (path: string) => WebBrowser.openBrowserAsync(`${env.webUrl}${path}`);
  const notif = profile.notifications;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <AppText weight="semibold" size={20} style={{ marginBottom: 20 }}>
        Profile
      </AppText>

      {/* Summary */}
      <Card style={styles.summary}>
        <Pressable onPress={changePhoto} disabled={uploading} accessibilityRole="button" accessibilityLabel="Change profile photo">
          <Avatar profile={profile} size={64} loading={uploading} />
          <View style={styles.cameraBadge}>
            <Camera size={11} color="white" />
          </View>
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText weight={profile.name ? "semibold" : "medium"} color={profile.name ? C.navy : C.muted} numberOfLines={1}>
            {profile.name || "Add your name"}
          </AppText>
          <Pill color={C.navyT} textColor={C.navy} style={{ marginTop: 6 }}>
            Signed in with {profile.provider}
          </Pill>
        </View>
      </Card>

      {/* Plan */}
      <SectionHeading>Plan</SectionHeading>
      {isPlus ? (
        <Card style={[styles.group, { backgroundColor: C.white }]}>
          <View style={[styles.plusHeader, styles.divider]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color={C.orange} />
              <AppText weight="semibold" color={C.orange}>
                {profile.planName || "Booklod Plus"}
              </AppText>
            </View>
            <Pressable onPress={() => setSheet("cancel")} hitSlop={8}>
              <AppText weight="medium" size={12} color={C.muted}>
                Manage
              </AppText>
            </Pressable>
          </View>
          <View style={[{ padding: 16 }, styles.divider]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <AppText>Share Your Shelf</AppText>
                <AppText size={12} color={C.muted} style={{ marginTop: 2 }}>
                  Invite-only — only people you give the code to can view it.
                </AppText>
              </View>
              <Toggle
                label="Share Your Shelf"
                value={profile.shareEnabled}
                disabled={share.isPending}
                onChange={() => runShare(profile.shareEnabled ? "stop" : "publish", profile.shareEnabled ? "Shelf sharing turned off" : "Shelf sharing turned on")}
              />
            </View>
            {profile.shareEnabled && profile.shareCode ? (
              <View style={styles.codeBox}>
                <AppText weight="bold" selectable style={{ flex: 1, letterSpacing: 1 }}>
                  {profile.shareCode}
                </AppText>
                <View style={{ flexDirection: "row", gap: 14 }}>
                  <Pressable onPress={() => runShare("publish", "Shared shelf refreshed")} disabled={share.isPending} hitSlop={8}>
                    <AppText weight="medium" size={12} color={C.green}>
                      {share.isPending ? "…" : "Refresh"}
                    </AppText>
                  </Pressable>
                  <Pressable onPress={copyCode} hitSlop={8}>
                    <AppText weight="medium" size={12} color={C.green}>
                      {copied ? "Copied!" : "Copy"}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
          <NavRow label="View a Shared Shelf" onPress={() => router.push("/shared-shelf")} last />
        </Card>
      ) : (
        <Card style={styles.group}>
          <View style={[{ padding: 16 }, styles.divider]}>
            <Pill color={C.navyT} textColor={C.navy}>
              {`${profile.planName || "Starter"} plan`}
            </Pill>
            <AppText size={12} color={C.muted} style={{ marginTop: 8 }}>
              20 book slots, purchased once. Upgrade to Plus for unlimited slots, cross-device cover sync, full digest export, and shelf sharing.
            </AppText>
            <Button label="Upgrade to Plus" pill small onPress={() => setSheet("upgrade")} style={{ alignSelf: "flex-start", marginTop: 12 }} />
          </View>
          <NavRow label="View a Shared Shelf" onPress={() => router.push("/shared-shelf")} last />
        </Card>
      )}

      {/* Profile */}
      <SectionHeading>Profile</SectionHeading>
      <Card style={styles.group}>
        {editingName ? (
          <View style={[styles.nameEdit, styles.divider]}>
            <TextField
              autoFocus
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Add your name"
              onSubmitEditing={saveName}
              returnKeyType="done"
              maxLength={100}
              style={{ flex: 1, borderWidth: 0, paddingHorizontal: 0 }}
            />
            {updateProfile.isPending ? (
              <ActivityIndicator size="small" color={C.green} />
            ) : (
              <Pressable onPress={saveName} hitSlop={8}>
                <AppText weight="semibold" size={12} color={C.green}>
                  Save
                </AppText>
              </Pressable>
            )}
          </View>
        ) : (
          <NavRow
            label="Name"
            value={profile.name || "Add your name"}
            onPress={() => {
              setNameDraft(profile.name);
              setEditingName(true);
            }}
          />
        )}
        <NavRow label="Profile Photo" value={<Avatar profile={profile} size={28} />} onPress={changePhoto} last />
      </Card>

      {/* Notifications */}
      <SectionHeading>Notifications</SectionHeading>
      <Card style={styles.group}>
        <ToggleRow label="Reading Reminders" hint="Nudges about books you're currently reading" value={notif.readingReminders} onChange={() => update({ notifications: { readingReminders: !notif.readingReminders } }).catch(() => {})} />
        <ToggleRow label="Book Updates" hint="Important updates about your library" value={notif.bookUpdates} onChange={() => update({ notifications: { bookUpdates: !notif.bookUpdates } }).catch(() => {})} />
        <ToggleRow label="Product Updates" hint="New features and announcements" value={notif.productUpdates} onChange={() => update({ notifications: { productUpdates: !notif.productUpdates } }).catch(() => {})} last />
      </Card>

      <SectionHeading>Feedback & Support</SectionHeading>
      <Card style={styles.group}>
        <NavRow icon={MessageSquare} label="Suggestions & Feedback" onPress={() => setSheet("feedback")} />
        <NavRow icon={HelpCircle} label="Help & Support" onPress={() => setSheet("help")} last />
      </Card>

      <SectionHeading>About</SectionHeading>
      <Card style={styles.group}>
        <NavRow icon={Info} label="About Booklod" onPress={() => openWeb("/about")} />
        <NavRow icon={Shield} label="Privacy Policy" onPress={() => openWeb("/privacy")} />
        <NavRow icon={FileText} label="Terms of Service" onPress={() => openWeb("/terms")} last />
      </Card>

      {isAdmin ? (
        <>
          <SectionHeading>Admin</SectionHeading>
          <Card style={styles.group}>
            <NavRow icon={ShieldCheck} label="Users, plans & settings" onPress={() => router.push("/admin")} last />
          </Card>
        </>
      ) : null}

      <SectionHeading>Account</SectionHeading>
      <Card style={styles.group}>
        <NavRow label="Delete Booklod Data" onPress={() => setSheet("delete")} danger />
        <NavRow icon={LogOut} label="Sign Out" onPress={() => setSheet("signout")} last />
      </Card>

      <UpgradePlusSheet visible={sheet === "upgrade"} onClose={() => setSheet(null)} plan={plusPlan} onConfirm={() => update({ plan: plusPlan?.id ?? "plus" }, `Welcome to ${plusPlan?.name ?? "Booklod Plus"}!`)} />
      <CancelPlusSheet visible={sheet === "cancel"} onClose={() => setSheet(null)} onConfirm={() => update({ plan: "starter" }, "Plus canceled — you're back on Starter")} />
      <DeleteDataSheet visible={sheet === "delete"} onClose={() => setSheet(null)} onConfirm={handleDelete} />
      <FeedbackSheet visible={sheet === "feedback"} onClose={() => setSheet(null)} />
      <HelpSheet visible={sheet === "help"} onClose={() => setSheet(null)} supportEmail={settings?.support_email} />
      <ConfirmSheet
        visible={sheet === "signout"}
        title="Sign out of Booklod?"
        body="Your books and settings stay saved — you can sign back in anytime."
        confirmLabel="Sign Out"
        loading={signingOut}
        onConfirm={handleSignOut}
        onClose={() => setSheet(null)}
      />
    </ScrollView>
  );
}

function Avatar({ profile, size, loading }: { profile: BooklodProfile; size: number; loading?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.green, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : profile.photoUrl ? (
        <Image source={{ uri: profile.photoUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      ) : (
        <AppText weight="semibold" size={size * 0.32} color="white">
          {profile.avatarInitial}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", alignItems: "center", gap: 16, padding: 20, marginBottom: 20 },
  cameraBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.navy,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  group: { overflow: "hidden", marginBottom: 20 },
  divider: { borderBottomWidth: 1, borderBottomColor: C.tan },
  plusHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.orangeT },
  codeBox: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, backgroundColor: C.cream, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10 },
  nameEdit: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
});

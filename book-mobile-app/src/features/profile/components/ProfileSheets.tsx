import { useState } from "react";
import { Linking, View } from "react-native";
import { Check } from "lucide-react-native";
import { errorMessage } from "@/api/client";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/LogoMark";
import { Sheet } from "@/components/ui/Sheet";
import { TextField } from "@/components/ui/TextField";
import { C } from "@/theme";
import type { Plan } from "@/types/booklod";
import { formatPrice, intervalLabel } from "../hooks/useProfile";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
}

const PLUS_FEATURES = [
  "Unlimited book slots",
  "Cover photos synced across devices",
  "Full digest history & export",
  "Share Your Shelf — invite-only, no public feed",
];

export function UpgradePlusSheet({ visible, onClose, onConfirm, plan }: SheetProps & { onConfirm: () => Promise<void>; plan?: Plan }) {
  const priceLine = plan ? `${formatPrice(plan)}${intervalLabel(plan.billingInterval)}` : "₱99/month · billed monthly";
  const features = plan?.features.length ? plan.features : PLUS_FEATURES;
  const [busy, setBusy] = useState(false);
  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }
  return (
    <Sheet visible={visible} onClose={onClose} dismissable={!busy}>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <LogoMark size={36} />
        <AppText weight="bold" size={18} style={{ marginTop: 8 }}>
          {plan?.name || "Booklod Plus"}
        </AppText>
        <AppText size={12} color={C.muted}>
          {priceLine}
        </AppText>
      </View>
      <View style={{ gap: 8, marginBottom: 20 }}>
        {features.map((f) => (
          <View key={f} style={{ flexDirection: "row", gap: 8 }}>
            <Check size={15} color={C.green} style={{ marginTop: 2 }} />
            <AppText style={{ flex: 1 }}>{f}</AppText>
          </View>
        ))}
      </View>
      <Button label="Simulate Subscribe" onPress={confirm} loading={busy} />
      <Button label="Not now" variant="ghost" onPress={onClose} disabled={busy} />
      <AppText size={11} color={C.faint} style={{ textAlign: "center", marginTop: 4 }}>
        Demo only — this preview doesn&apos;t process real payments. Subscribing here just simulates the Plus plan.
      </AppText>
    </Sheet>
  );
}

export function CancelPlusSheet({ visible, onClose, onConfirm }: SheetProps & { onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet visible={visible} onClose={onClose} dismissable={!busy}>
      <AppText weight="semibold" size={16} style={{ marginBottom: 8 }}>
        Cancel Booklod Plus?
      </AppText>
      <AppText color={C.muted} style={{ lineHeight: 21 }}>
        Your books, covers, and notes stay exactly as they are — nothing is deleted. You&apos;ll drop back to your Starter plan (20 slots) and lose cross-device cover syncing and shelf sharing going forward.
      </AppText>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
        <Button label="Keep Plus" variant="outline" onPress={onClose} disabled={busy} style={{ flex: 1 }} />
        <Button
          label="Cancel Plan"
          variant="danger"
          loading={busy}
          style={{ flex: 1 }}
          onPress={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
        />
      </View>
    </Sheet>
  );
}

export function DeleteDataSheet({ visible, onClose, onConfirm }: SheetProps & { onConfirm: () => Promise<void> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canDelete = text.trim().toUpperCase() === "DELETE";

  function close() {
    setText("");
    setError("");
    onClose();
  }

  return (
    <Sheet visible={visible} onClose={close} dismissable={!busy}>
      <AppText weight="semibold" size={16} style={{ marginBottom: 8 }}>
        Delete your Booklod data?
      </AppText>
      <AppText color={C.muted} style={{ lineHeight: 21, marginBottom: 12 }}>
        This permanently removes your library, reading history, and profile. Your Google/Apple account is not affected. Type DELETE below to confirm.
      </AppText>
      <TextField value={text} onChangeText={setText} placeholder="DELETE" autoCapitalize="characters" accessibilityLabel="Type DELETE to confirm" />
      {error ? (
        <AppText size={12} color={C.danger} style={{ marginTop: 8 }}>
          {error}
        </AppText>
      ) : null}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
        <Button label="Cancel" variant="outline" onPress={close} disabled={busy} style={{ flex: 1 }} />
        <Button
          label="Delete"
          variant="danger"
          disabled={!canDelete}
          loading={busy}
          style={{ flex: 1 }}
          onPress={async () => {
            setBusy(true);
            setError("");
            try {
              await onConfirm();
            } catch (e) {
              setError(errorMessage(e, "Unable to delete your Booklod data."));
              setBusy(false);
            }
          }}
        />
      </View>
    </Sheet>
  );
}

export function FeedbackSheet({ visible, onClose }: SheetProps) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  function close() {
    setText("");
    setSent(false);
    onClose();
  }
  return (
    <Sheet visible={visible} onClose={close}>
      {sent ? (
        <View style={{ alignItems: "center", paddingVertical: 16 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.greenT, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Check size={18} color={C.green} />
          </View>
          <AppText weight="medium">Thanks for the feedback!</AppText>
          <Button label="Close" variant="ghost" onPress={close} />
        </View>
      ) : (
        <>
          <AppText weight="semibold" size={16}>
            Suggestions & Feedback
          </AppText>
          <AppText size={12} color={C.muted} style={{ marginBottom: 12 }}>
            Tell us what&apos;s working, what&apos;s not, or what you&apos;d like to see.
          </AppText>
          <TextField value={text} onChangeText={setText} multiline maxLength={2000} placeholder="Type your feedback..." autoFocus />
          <AppText size={11} color={C.faint} style={{ marginTop: 6 }}>
            This preview doesn&apos;t send feedback anywhere yet — this is a placeholder for where it would go.
          </AppText>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <Button label="Cancel" variant="outline" onPress={close} style={{ flex: 1 }} />
            <Button label="Submit" onPress={() => text.trim() && setSent(true)} disabled={!text.trim()} style={{ flex: 1 }} />
          </View>
        </>
      )}
    </Sheet>
  );
}

const HELP_ITEMS = [
  { title: "Adding a book", body: "Tap Add Book, search by title, and select a match — or enter details manually." },
  { title: "Tracking what you own", body: "Set a book's ownership to Have It, Lent Out, Given Away, or No Longer Have It from its detail page." },
  { title: "Your reading digest", body: "The Digest tab shows what you've finished, what's in progress, and a month-by-month view." },
];

export function HelpSheet({ visible, onClose, supportEmail }: SheetProps & { supportEmail?: string }) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <AppText weight="semibold" size={16} style={{ marginBottom: 12 }}>
        Help & Support
      </AppText>
      <View style={{ gap: 12 }}>
        {HELP_ITEMS.map((it) => (
          <View key={it.title}>
            <AppText weight="medium">{it.title}</AppText>
            <AppText size={12} color={C.muted} style={{ marginTop: 2 }}>
              {it.body}
            </AppText>
          </View>
        ))}
        {supportEmail ? (
          <View>
            <AppText weight="medium">Still stuck?</AppText>
            <AppText size={12} color={C.green} style={{ marginTop: 2 }} onPress={() => Linking.openURL(`mailto:${supportEmail}`)}>
              Email {supportEmail}
            </AppText>
          </View>
        ) : null}
      </View>
      <Button label="Close" variant="navy" onPress={onClose} style={{ marginTop: 20 }} />
    </Sheet>
  );
}

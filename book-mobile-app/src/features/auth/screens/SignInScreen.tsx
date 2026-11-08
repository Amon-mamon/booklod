import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { errorMessage } from "@/api/client";
import { configurationError } from "@/config/env";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/LogoMark";
import { Banner } from "@/components/ui/primitives";
import { TextField } from "@/components/ui/TextField";
import { useAuth, type OAuthProvider } from "@/providers/AuthProvider";
import { C } from "@/theme";

type Busy = OAuthProvider | "email" | null;

export function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const disabled = Boolean(busy || configurationError);

  async function run(kind: Exclude<Busy, null>, action: () => Promise<void>) {
    setBusy(kind);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e, "Unable to sign in."));
    } finally {
      setBusy(null);
    }
  }

  function submitEmail() {
    if (!email.trim() || password.length < 6) {
      setError("Enter your email and a password of at least 6 characters.");
      return;
    }
    run("email", async () => {
      if (isSignUp) {
        const { needsConfirmation } = await signUpWithEmail(email, password);
        if (needsConfirmation) setMessage("Check your email to confirm your account, then sign in.");
      } else {
        await signInWithEmail(email, password);
      }
    });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.cream }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          <LogoMark size={44} />
          <AppText weight="bold" size={20} style={{ marginTop: 12 }}>
            Welcome to Booklod
          </AppText>
          <AppText color={C.muted} style={{ marginTop: 6 }}>
            Your books. Your reading. Your archive.
          </AppText>
        </View>

        <View style={{ gap: 12, marginTop: 32 }}>
          <Button
            label="Continue with Google"
            variant="outline"
            icon={<GoogleG />}
            loading={busy === "google"}
            disabled={disabled}
            onPress={() => run("google", () => signInWithOAuth("google"))}
          />
          <Button
            label="Continue with Apple"
            variant="navy"
            icon={<AppleLogo />}
            loading={busy === "apple"}
            disabled={disabled}
            onPress={() => run("apple", () => signInWithOAuth("apple"))}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <AppText size={12} color={C.muted}>
            or continue with email
          </AppText>
          <View style={styles.line} />
        </View>

        <View style={{ gap: 12 }}>
          <View>
            <AppText weight="medium" size={12} style={{ marginBottom: 4 }}>
              Email
            </AppText>
            <TextField
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!disabled}
              accessibilityLabel="Email"
            />
          </View>
          <View>
            <AppText weight="medium" size={12} style={{ marginBottom: 4 }}>
              Password
            </AppText>
            <TextField
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isSignUp ? "new-password" : "current-password"}
              textContentType={isSignUp ? "newPassword" : "password"}
              editable={!disabled}
              onSubmitEditing={submitEmail}
              returnKeyType="go"
              accessibilityLabel="Password"
            />
          </View>
          <Button label={isSignUp ? "Create account" : "Sign in"} variant="green" loading={busy === "email"} disabled={disabled} onPress={submitEmail} />
        </View>

        <Pressable onPress={() => setIsSignUp((v) => !v)} style={{ marginTop: 12, alignSelf: "center" }} hitSlop={8}>
          <AppText weight="medium" size={12} color={C.green}>
            {isSignUp ? "Already have an account? Sign in" : "New to Booklod? Create an account"}
          </AppText>
        </Pressable>

        <View style={{ marginTop: 16 }}>
          {configurationError ? <Banner tone="info" message={configurationError} /> : null}
          {error ? <Banner tone="info" message={error} /> : null}
          {message ? <Banner tone="success" message={message} /> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GoogleG() {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 009 18z" />
      <Path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <Path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </Svg>
  );
}

function AppleLogo() {
  return (
    <Svg width={15} height={15} viewBox="0 0 384 512">
      <Path
        fill="#fff"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, maxWidth: 420, width: "100%", alignSelf: "center" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: C.tan },
});

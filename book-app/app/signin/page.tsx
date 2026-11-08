"use client";
import { AuthPage } from "../../features/auth/AuthFeature";
import { SignedOutOnly } from "../../features/app/SignedOutOnly";
import { useAuth } from "../../features/auth/useAuth";

export default function SignInPage() {
  const auth = useAuth();
  return (
    <SignedOutOnly>
      <div style={{ fontFamily: "'Poppins', sans-serif" }} className="w-full min-h-full">
        <AuthPage
          onSignIn={auth.signInWithProvider}
          onEmailAuth={auth.authenticateWithEmail}
          signingIn={auth.signingIn}
          authError={auth.authError}
          authMessage={auth.authMessage}
          configurationError={auth.configurationError}
        />
      </div>
    </SignedOutOnly>
  );
}

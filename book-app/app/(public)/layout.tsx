import { PublicLayout } from "../../features/marketing/components/PublicLayout";
import { SignedOutOnly } from "../../features/app/SignedOutOnly";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SignedOutOnly>
      <PublicLayout>{children}</PublicLayout>
    </SignedOutOnly>
  );
}

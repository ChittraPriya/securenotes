import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { clerkAppearance } from "@/components/auth/clerk-appearance";

export default async function LoginPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor");
  }

  return (
    <AuthPageShell
      title="Welcome Back"
      subtitle="Access your secure notes and continue sharing with confidence."
    >
      <div className="space-y-6">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-primary">
          Sign in
        </div>
        <SignIn
          appearance={clerkAppearance}
          path="/login"
          forceRedirectUrl="/editor"
          fallbackRedirectUrl="/editor"
          oauthFlow="redirect"
        />
      </div>
    </AuthPageShell>
  );
}

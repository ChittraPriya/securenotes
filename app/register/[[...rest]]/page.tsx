import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerk-appearance";
import Image from "next/image";
import { ShieldCheck, Link2, Eye } from "lucide-react";

export default async function RegisterPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-bg-base">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-center px-16 bg-bg-surface-raised">
        <Image
          src="/Register.png"
          alt="Register Illustration"
          width={420}
          height={420}
          className="mx-auto object-contain"
          priority
        />

        <h1 className="mt-8 text-5xl font-bold text-text-primary">
          Create Your Account
        </h1>

        <p className="mt-3 text-3xl font-semibold text-accent-primary leading-tight">
          Start sharing your notes
          <br />
          the smart way
        </p>

        <div className="mt-10 space-y-5">
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6 text-accent-primary" />}
            title="Secure & Private"
            description="Your notes are encrypted and protected from unauthorized access."
          />

          <FeatureCard
            icon={<Link2 className="h-6 w-6 text-accent-primary" />}
            title="Share Securely"
            description="Create password-protected and expiring links for safe sharing."
          />

          <FeatureCard
            icon={<Eye className="h-6 w-6 text-accent-primary" />}
            title="Track Activity"
            description="Monitor note views and control access whenever you need."
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-8">
        <SignUp
          path="/register"
          appearance={clerkAppearance}
          forceRedirectUrl="/editor"
          fallbackRedirectUrl="/editor"
          oauthFlow="redirect"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border-default bg-bg-surface p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-base">
        {icon}
      </div>

      <div>
        <h3 className="font-semibold text-text-primary">
          {title}
        </h3>

        <p className="mt-1 text-sm text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { ShieldCheck, Link2, Eye } from "lucide-react";

import { clerkAppearance } from "@/components/auth/clerk-appearance";

export default async function LoginPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/editor");
  }

  return (
    <div className="flex min-h-screen bg-white">

      {/* LEFT SIDE - LOGIN */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6">

          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-600">
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
      </div>

      {/* RIGHT SIDE - ILLUSTRATION */}
      <div className="hidden md:flex w-1/2 bg-purple-50 flex-col justify-center items-center px-16">

        <Image
          src="/login.png"
          width={350}
          height={350}
          alt="Login Illustration"
          className="object-contain"
        />

        <h1 className="text-4xl font-bold text-gray-900 mt-8">
          Welcome Back
        </h1>

        <h2 className="text-2xl font-bold text-purple-600 mt-2 text-center">
          Sign in and continue
          <br />
          managing your notes
        </h2>

        <div className="mt-8 space-y-5">

          {/* Secure Login */}
          <div className="flex items-center gap-4 rounded-2xl bg-purple-100 p-4 shadow-sm">
            <div className="rounded-full bg-white p-2 shadow">
              <ShieldCheck size={22} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Login</h3>
              <p className="text-sm text-gray-600">
                Protected authentication with encrypted access.
              </p>
            </div>
          </div>

          {/* Shared Notes */}
          <div className="flex items-center gap-4 rounded-2xl bg-purple-100 p-4 shadow-sm">
            <div className="rounded-full bg-white p-2 shadow">
              <Link2 size={22} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Access Shared Notes</h3>
              <p className="text-sm text-gray-600">
                Open and manage notes shared with you anytime.
              </p>
            </div>
          </div>

          {/* Resume */}
          <div className="flex items-center gap-4 rounded-2xl bg-purple-100 p-4 shadow-sm">
            <div className="rounded-full bg-white p-2 shadow">
              <Eye size={22} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Continue Where You Left Off
              </h3>
              <p className="text-sm text-gray-600">
                Pick up right where you left off in your previous session.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
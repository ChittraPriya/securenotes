"use client"

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function LandingAuthNav() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {isSignedIn ? (
        <UserButton />
      ) : (
        <>
          <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:text-text-primary">
            Log in
          </Link>
          <Link href="/register">
            <Button type="button" variant="default" size="sm">
              Register
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

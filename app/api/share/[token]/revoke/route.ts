import { NextResponse } from "next/server";
import { revokeShareLink } from "@/lib/share-link";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params; // ✅ IMPORTANT FIX

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const result = await revokeShareLink(token);

    if (result.kind === "not_found") {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    if (result.kind === "already_revoked") {
      return NextResponse.json(
        { error: "Already revoked" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REVOKE ERROR:", error);

    return NextResponse.json(
      { error: "Unable to revoke share link" },
      { status: 500 }
    );
  }
}
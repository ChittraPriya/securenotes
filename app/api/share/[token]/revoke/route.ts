import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 

import { revokeShareLink } from "@/lib/share-link";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await revokeShareLink(token, userId);

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
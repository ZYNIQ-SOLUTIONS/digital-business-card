import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const adminAuthClient = createAdminClient();
    
    // Determine redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
    const redirectTo = `${baseUrl}/auth/callback`;

    const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (error) {
      console.error("Invite error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Server error during invite:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

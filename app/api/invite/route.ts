import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Require authenticated session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, orgId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // If orgId provided, verify caller is admin of that org
    if (orgId) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!membership) {
        return NextResponse.json(
          { error: "Forbidden: Enterprise Admin role required" },
          { status: 403 }
        );
      }
    }

    const adminAuthClient = createAdminClient();
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

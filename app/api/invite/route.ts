import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // Require authenticated session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { email, orgId, role, cardId } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify caller is an enterprise admin
    let membershipQuery = supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (orgId) {
      membershipQuery = membershipQuery.eq("org_id", orgId);
    }

    const { data: membership } = await membershipQuery.limit(1).maybeSingle();

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: Enterprise Admin role required" },
        { status: 403 }
      );
    }

    const targetOrgId = orgId || membership.org_id;

    const adminAuthClient = createAdminClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
    const redirectTo = `${baseUrl}/auth/callback`;

    const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error("Invite error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Record pending invitation in org_invitations
    try {
      await adminAuthClient.from("org_invitations").insert({
        org_id: targetOrgId,
        email: normalizedEmail,
        role: role || "member",
        invited_by: user.id,
        card_id: cardId || null,
        status: "pending",
      });
    } catch (invErr) {
      console.warn("Could not insert org_invitations record:", invErr);
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Server error during invite:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

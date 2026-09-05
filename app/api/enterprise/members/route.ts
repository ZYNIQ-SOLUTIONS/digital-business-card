import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface MemberCardRow {
  id: string;
  full_name?: string;
  email_work?: string;
  email_personal?: string;
  title?: string;
  company?: string;
  department?: string;
  phone_primary?: string;
  is_published?: boolean;
  slug?: string;
  is_verified?: boolean;
  theme?: string;
  bio?: string;
  views_count?: number;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve caller's organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    // If caller has no organization, return empty list (never return other orgs or fallback to personal cards)
    if (!membership?.org_id) {
      return NextResponse.json({ success: true, members: [] });
    }

    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("org_id", membership.org_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      members: ((cards || []) as MemberCardRow[]).map((c) => ({
        id: c.id,
        fullName: c.full_name,
        email: c.email_work || c.email_personal || "",
        title: c.title,
        company: c.company,
        department: c.department || "Executive",
        phone: c.phone_primary || "",
        role: "Member",
        status: c.is_published ? "Active" : "Draft",
        slug: c.slug,
        isVerified: c.is_verified || false,
        theme: c.theme || "apple-light",
        bio: c.bio || "",
        viewsCount: c.views_count || 0,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch organization members";
    console.error("Enterprise members fetch error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require caller has admin role in organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership?.org_id || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Enterprise Admin role required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      email,
      title,
      department = "General",
      phone = "",
      company = "ZYNIQ Enterprise",
      role = "Member",
      sendInvite = true,
    } = body;

    if (!fullName || !email || !title) {
      return NextResponse.json(
        { error: "Name, email, and job title are required." },
        { status: 400 }
      );
    }

    const names = fullName.trim().split(" ");
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

    const slug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;

    const newCard = {
      user_id: user.id,
      org_id: membership.org_id,
      slug,
      is_published: true,
      full_name: fullName,
      avatar_initials: initials,
      title,
      company,
      department,
      phone_primary: phone,
      email_work: email,
      theme: "apple-light",
      skills: ["Enterprise", department],
    };

    const { data: createdCard, error: cardError } = await supabase
      .from("cards")
      .insert(newCard)
      .select()
      .single();

    if (cardError) throw cardError;

    // Send invitation email if requested
    let inviteSuccess = false;
    if (sendInvite) {
      try {
        const adminClient = createAdminClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
        const redirectTo = `${baseUrl}/auth/callback`;

        const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo,
        });
        if (!inviteErr) {
          inviteSuccess = true;
        } else {
          console.warn("Invite email warning:", inviteErr.message);
        }

        // Insert invitation into org_invitations table
        await adminClient.from("org_invitations").insert({
          org_id: membership.org_id,
          card_id: createdCard.id,
          email: email.toLowerCase().trim(),
          role: role || "member",
          invited_by: user.id,
          status: "pending",
        });
      } catch (invErr) {
        console.warn("Could not dispatch invite via admin API or record invitation:", invErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: createdCard,
      inviteSent: inviteSuccess,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create organization member";
    console.error("Enterprise create member error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, fullName, email, title, department, phone, bio, isPublished, theme } = body;

    if (!id) {
      return NextResponse.json({ error: "Member card ID is required." }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (fullName) {
      updatePayload.full_name = fullName;
      const names = fullName.trim().split(" ");
      updatePayload.avatar_initials = names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");
    }
    if (email) updatePayload.email_work = email;
    if (title) updatePayload.title = title;
    if (department) updatePayload.department = department;
    if (phone !== undefined) updatePayload.phone_primary = phone;
    if (bio !== undefined) updatePayload.bio = bio;
    if (isPublished !== undefined) updatePayload.is_published = isPublished;
    if (theme) updatePayload.theme = theme;

    const { data: updatedCard, error } = await supabase
      .from("cards")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      member: updatedCard,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update member profile";
    console.error("Enterprise update member error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter required." }, { status: 400 });
    }

    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete member";
    console.error("Enterprise delete member error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

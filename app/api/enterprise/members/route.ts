/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
      .single();

    // If no org membership, return only user's own cards
    const query = supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: cards, error } = membership?.org_id
      ? await query.eq("org_id", membership.org_id)
      : await query.eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      members: (cards || []).map((c: any) => ({
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
  } catch (error: any) {
    console.error("Enterprise members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization members", details: error.message },
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
      } catch (invErr) {
        console.warn("Could not dispatch invite via admin API:", invErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: createdCard,
      inviteSent: inviteSuccess,
    });
  } catch (error: any) {
    console.error("Enterprise create member error:", error);
    return NextResponse.json(
      { error: "Failed to create organization member", details: error.message },
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

    const updatePayload: any = {
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
  } catch (error: any) {
    console.error("Enterprise update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member profile", details: error.message },
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
  } catch (error: any) {
    console.error("Enterprise delete member error:", error);
    return NextResponse.json(
      { error: "Failed to delete member", details: error.message },
      { status: 500 }
    );
  }
}

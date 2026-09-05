import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function sanitizeRedirect(target: string | null): string {
  if (!target) return "/dashboard";
  try {
    const decoded = decodeURIComponent(target).trim();
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.startsWith("/\\") ||
      decoded.includes("\\") ||
      decoded.includes("\0") ||
      decoded.includes("\r") ||
      decoded.includes("\n")
    ) {
      return "/dashboard";
    }
    // Disallow external protocol schemes (e.g. /https: or /javascript:)
    if (/^\/[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) {
      return "/dashboard";
    }
    const url = new URL(decoded, "http://localhost");
    if (url.origin !== "http://localhost") {
      return "/dashboard";
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return "/dashboard";
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const inviteCode = searchParams.get("invite");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // If an invite code was used, attribute it
        if (inviteCode) {
          try {
            const adminClient = createAdminClient();
            // Look up the invite link using admin client (since a brand new user might not have RLS permission if we didn't open it up, but admin bypasses RLS)
            const { data: inviteLink } = await adminClient
              .from("invite_links")
              .select("user_id")
              .eq("code", inviteCode)
              .single();

            if (inviteLink) {
              await adminClient
                .from("profiles")
                .update({ 
                  invited_by: inviteLink.user_id,
                  invite_code_used: inviteCode
                })
                .eq("id", user.id);
            }
          } catch (err) {
            console.error("Failed to process invite code in callback:", err);
          }
        }

        // P1-1: Employee onboarding loop
        // Check public.org_invitations using createAdminClient() for email = user.email and status = 'pending'
        if (user.email) {
          try {
            const adminClient = createAdminClient();
            const normalizedEmail = user.email.toLowerCase().trim();

            const { data: invitation } = await adminClient
              .from("org_invitations")
              .select("*")
              .ilike("email", normalizedEmail)
              .eq("status", "pending")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (invitation) {
              // Ensure user profile exists before foreign key relations
              await adminClient.from("profiles").upsert(
                {
                  id: user.id,
                  email: normalizedEmail,
                  full_name: user.user_metadata?.full_name || "",
                  avatar_url: user.user_metadata?.avatar_url || "",
                },
                { onConflict: "id" }
              );

              // Update the provisioned card setting user_id: user.id
              if (invitation.card_id) {
                await adminClient
                  .from("cards")
                  .update({ user_id: user.id })
                  .eq("id", invitation.card_id);
              }

              // Insert into public.organization_members with { org_id: invitation.org_id, user_id: user.id, role: invitation.role }
              await adminClient
                .from("organization_members")
                .upsert(
                  {
                    org_id: invitation.org_id,
                    user_id: user.id,
                    role: invitation.role || "member",
                  },
                  { onConflict: "org_id, user_id" }
                );

              // Update public.org_invitations setting status: 'accepted', accepted_at: new Date().toISOString()
              await adminClient
                .from("org_invitations")
                .update({
                  status: "accepted",
                  accepted_at: new Date().toISOString(),
                })
                .eq("id", invitation.id);

              // Redirect to /dashboard
              return NextResponse.redirect(`${origin}/dashboard`);
            }
          } catch (err) {
            console.error("Failed to process enterprise invitation in callback:", err);
          }
        }

        // If no invitation: count existing cards for user.id.
        // If count > 0 redirect to next (or /dashboard); if 0 cards, redirect to /dashboard/onboarding.
        const { count, error: cardError } = await supabase
          .from("cards")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!cardError && count === 0) {
          // Forward first-time user to the onboarding wizard
          return NextResponse.redirect(`${origin}/dashboard/onboarding`);
        }
      }

      // Sanitize redirect to prevent open redirect attacks
      const safeNext = sanitizeRedirect(next);
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return the user to an error page or auth page with instructions
  return NextResponse.redirect(`${origin}/auth?error=Could%20not%20authenticate%20user`);
}

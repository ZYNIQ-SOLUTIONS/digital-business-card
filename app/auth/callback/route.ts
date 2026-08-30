import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const inviteCode = searchParams.get("invite");
  const next = searchParams.get("next") ?? "/dashboard";
  // Note: next is sanitized before use below

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has any existing cards
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
      let safeNext = "/dashboard";
      if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
        safeNext = next;
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Return the user to an error page or auth page with instructions
  return NextResponse.redirect(`${origin}/auth?error=Could%20not%20authenticate%20user`);
}

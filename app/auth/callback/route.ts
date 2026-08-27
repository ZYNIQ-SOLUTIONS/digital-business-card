import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
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

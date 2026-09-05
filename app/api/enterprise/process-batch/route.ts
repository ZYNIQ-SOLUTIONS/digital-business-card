import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // Allow 5 minutes on Vercel Pro/Enterprise

export async function POST(request: Request) {
  try {
    // QStash payload validation would go here
    // Verify signature: https://upstash.com/docs/qstash/features/security

    const body = await request.json();
    const { cards, orgId, userId } = body;

    if (!cards || !Array.isArray(cards)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Initialize Supabase admin client (service role needed for background tasks)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const chunkSize = 50;
    
    // Process in chunks to prevent DB locks
    for (let i = 0; i < cards.length; i += chunkSize) {
      const chunk = cards.slice(i, i + chunkSize);
      
      const { error: insertError } = await supabase.from("cards").insert(chunk);
      if (insertError) {
        console.error("Batch insert error:", insertError);
        throw insertError;
      }
      
      // Example of where you would trigger auth invites:
      /*
      for (const card of chunk) {
        if (card.email_work) {
          await supabase.auth.admin.inviteUserByEmail(card.email_work, {
            data: { org_id: orgId }
          });
        }
      }
      */
    }

    // You could also trigger a notification email to the admin here

    return NextResponse.json({ success: true, processed: cards.length });
  } catch (error: any) {
    console.error("Error processing batch:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process batch" },
      { status: 500 }
    );
  }
}

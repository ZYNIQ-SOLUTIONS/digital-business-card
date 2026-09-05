import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_EVENT_TYPES = new Set(["vcard_download", "wallet_download"]);

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { cardId, eventType } = body || {};

    if (!cardId || typeof cardId !== "string" || !UUID_REGEX.test(cardId)) {
      return NextResponse.json(
        { error: "Invalid or missing card ID (must be a valid UUID)" },
        { status: 400 }
      );
    }

    if (!eventType || typeof eventType !== "string" || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { error: "Invalid or missing event type (must be 'vcard_download' or 'wallet_download')" },
        { status: 400 }
      );
    }

    let adminClient;
    try {
      adminClient = createAdminClient();
    } catch (e: any) {
      console.error("Failed to initialize Supabase admin client:", e?.message);
      return NextResponse.json(
        { error: "Database configuration unavailable" },
        { status: 500 }
      );
    }

    // 1. Fetch current counter to atomically increment
    const { data: card, error: fetchError } = await adminClient
      .from("cards")
      .select("id, vcard_downloads_count, wallet_downloads_count")
      .eq("id", cardId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking card:", fetchError);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // 2. Increment corresponding counter
    const updates: Record<string, number> = {};
    if (eventType === "vcard_download") {
      updates.vcard_downloads_count = (card.vcard_downloads_count || 0) + 1;
    } else if (eventType === "wallet_download") {
      updates.wallet_downloads_count = (card.wallet_downloads_count || 0) + 1;
    }

    const { error: updateError } = await adminClient
      .from("cards")
      .update(updates)
      .eq("id", cardId);

    if (updateError) {
      console.error("Error updating download counter:", updateError);
      return NextResponse.json(
        { error: "Failed to increment download counter" },
        { status: 500 }
      );
    }

    // 3. Log event into card_events table
    const userAgent = request.headers.get("user-agent") || undefined;
    const referer = request.headers.get("referer") || undefined;

    const { error: eventError } = await adminClient
      .from("card_events")
      .insert({
        card_id: cardId,
        event_type: eventType,
        user_agent: userAgent,
        referer: referer,
      });

    if (eventError) {
      console.warn("Failed to log card_events record:", eventError);
      // Still return 200 since the counter was incremented successfully
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Telemetry event processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

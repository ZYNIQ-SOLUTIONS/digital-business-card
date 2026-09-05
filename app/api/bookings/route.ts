import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      cardId,
      visitorName,
      name = visitorName,
      visitorEmail,
      email = visitorEmail,
      visitorPhone = "",
      phone = visitorPhone,
      company = null,
      title = null,
      meetingDate,
      meetingTime,
      meetingNotes = "",
      notes = meetingNotes,
    } = body;

    if (!cardId || !name || !email || !meetingDate || !meetingTime) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify card exists and is published
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, user_id, full_name, email_work, is_published")
      .eq("id", cardId)
      .single();

    if (cardError || !card || !card.is_published) {
      return NextResponse.json(
        { error: "Card not found or is not published." },
        { status: 404 }
      );
    }

    // Create a connection lead entry for the card owner via SECURITY DEFINER RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", {
      p_card_id: card.id,
      p_name: name,
      p_email: email,
      p_phone: phone || null,
      p_company: company,
      p_job_title: null,
      p_notes: notes || null,
      p_lead_type: "meeting",
      p_location: "Digital Calendar Booking",
      p_title: title,
      p_meeting_date: meetingDate,
      p_meeting_time: meetingTime,
    });

    if (rpcError) {
      console.error("Booking RPC error:", rpcError);
      return NextResponse.json(
        { error: rpcError.message || "Failed to record booking lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: (rpcResult as { connection_id?: string } | null)?.connection_id || `bk_${Date.now()}`,
        visitorName: name,
        visitorEmail: email,
        meetingDate,
        meetingTime,
        cardHost: card.full_name || "Card Host",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record booking";
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

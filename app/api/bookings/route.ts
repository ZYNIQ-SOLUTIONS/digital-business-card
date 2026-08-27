/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cardId,
      visitorName,
      visitorEmail,
      visitorPhone = "",
      meetingDate,
      meetingTime,
      meetingNotes = "",
    } = body;

    if (!cardId || !visitorName || !visitorEmail || !meetingDate || !meetingTime) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the card owner to connect
    const { data: card } = await supabase
      .from("cards")
      .select("id, user_id, full_name, email_work")
      .eq("id", cardId)
      .single();

    // Create a connection lead entry for the card owner
    if (card?.user_id) {
      try {
        const { error: rpcError } = await supabase.rpc("submit_public_lead", {
          p_card_id: card.id,
          p_name: visitorName,
          p_email: visitorEmail,
          p_phone: visitorPhone || null,
          p_meeting_date: meetingDate,
          p_meeting_time: meetingTime,
          p_notes: meetingNotes || null,
        });
        if (rpcError) {
          console.warn("Booking RPC warning:", rpcError.message);
        }
      } catch (connErr) {
        console.warn("Could not record booking lead:", connErr);
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: `bk_${Date.now()}`,
        visitorName,
        visitorEmail,
        meetingDate,
        meetingTime,
        cardHost: card?.full_name || "Card Host",
      },
    });
  } catch (error: any) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Failed to record booking", details: error.message },
      { status: 500 }
    );
  }
}

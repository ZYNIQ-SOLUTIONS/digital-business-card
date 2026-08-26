import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, company, title, cardId } = data;

    if (!cardId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Get the owner of the card
    const { data: cardData, error: cardError } = await supabase
      .from("cards")
      .select("user_id, full_name, company")
      .eq("id", cardId)
      .single();

    if (cardError || !cardData) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const ownerId = cardData.user_id;
    const locationStr = "in person"; // Placeholder for geofencing context

    // 2. Draft follow-up message using Gemini
    let draftedMessage = "";
    try {
      const prompt = `You are an AI networking assistant for ${cardData.full_name} who works at ${cardData.company}. 
They just met ${name} (Title: ${title}, Company: ${company}).
Write a short, professional, and friendly follow-up email (2-3 sentences) from ${cardData.full_name} to ${name}. 
Do not include subject line, just the body.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.7 },
      });
      draftedMessage = response.text || "";
    } catch (e) {
      console.error("AI drafting failed:", e);
    }

    // 3. Save to database
    const { data: insertData, error: insertError } = await supabase
      .from("connections")
      .insert({
        user_id: ownerId,
        card_id: cardId,
        contact_name: name,
        contact_email: email,
        contact_phone: phone,
        contact_company: company,
        contact_title: title,
        met_at_location: locationStr,
        ai_drafted_message: draftedMessage,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, connection: insertData });
  } catch (error: any) {
    console.error("Error saving connection:", error);
    return NextResponse.json(
      { error: "Failed to save connection", details: error.message },
      { status: 500 }
    );
  }
}

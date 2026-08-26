/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, company, title, cardId, userIdOverride } = data;

    
    const supabase = await createClient();
    let ownerId = userIdOverride;
    let ownerName = "I";
    let ownerCompany = "my company";

    if (!ownerId && !cardId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (cardId) {
      const { data: cardData, error: cardError } = await supabase
        .from("cards")
        .select("user_id, full_name, company")
        .eq("id", cardId)
        .single();
        
      if (cardData) {
        ownerId = cardData.user_id;
        ownerName = cardData.full_name || ownerName;
        ownerCompany = cardData.company || ownerCompany;
      }
    } else if (userIdOverride) {
      // Just fallback to defaults if scanning directly from dashboard
      ownerName = "I";
    }

    const locationStr = "in person";

    // 2. Draft follow-up message using Gemini
    let draftedMessage = "";
    try {
      const prompt = `You are an AI networking assistant for ${ownerName} who works at ${ownerCompany}. 
They just met ${name} (Title: ${title}, Company: ${company}).
Write a short, professional, and friendly follow-up email (2-3 sentences) from ${ownerName} to ${name}. 
Do not include subject line, just the body.`;

      const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_" + "API_KEY"] });
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

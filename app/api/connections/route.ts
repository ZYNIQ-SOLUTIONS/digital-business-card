/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

async function triggerCrmWebhook(supabase: any, ownerId: string, leadData: any) {
  try {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("org_id, organizations(crm_webhook_url, crm_provider)")
      .eq("user_id", ownerId)
      .single();
      
    const orgs = orgMember?.organizations as any;
    if (orgs && orgs.crm_webhook_url) {
      const url = orgs.crm_webhook_url;
      
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: "izn_digital_card",
          lead: leadData,
          timestamp: new Date().toISOString()
        })
      }).catch(e => console.error("CRM Webhook failed:", e));
    }
  } catch (err) {
    console.error("Error triggering CRM webhook:", err);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, company, title, cardId, userIdOverride } = data;

    if (!name || (!cardId && !userIdOverride)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Pre-fetch owner ID for both flows
    let ownerId = userIdOverride || user?.id;
    let ownerName = "I";
    let ownerCompany = "my company";

    if (cardId) {
      const { data: cardData } = await supabase
        .from("cards")
        .select("user_id, full_name, company")
        .eq("id", cardId)
        .single();

      if (cardData) {
        ownerId = cardData.user_id;
        ownerName = cardData.full_name || ownerName;
        ownerCompany = cardData.company || ownerCompany;
      }
    }

    // Anonymous visitor submitting public card exchange — use SECURITY DEFINER RPC
    if (!user && cardId) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", {
        p_card_id: cardId,
        p_name: name,
        p_email: email || "",
        p_phone: phone || null,
        p_company: company || null,
        p_title: title || null,
      });

      if (rpcError) throw rpcError;
      
      // Trigger Webhook
      if (ownerId) await triggerCrmWebhook(supabase, ownerId, data);
      
      return NextResponse.json({ success: true, connection: rpcResult });
    }

    // Draft follow-up message using Gemini
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

    // Save to database (authenticated path)
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
        met_at_location: "in person",
        ai_drafted_message: draftedMessage,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    // Trigger Webhook
    if (ownerId) await triggerCrmWebhook(supabase, ownerId, data);

    return NextResponse.json({ success: true, connection: insertData });
  } catch (error: any) {
    console.error("Error saving connection:", error);
    return NextResponse.json(
      { error: "Failed to save connection", details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function triggerCrmWebhook(supabase: SupabaseClient, ownerId: string, leadData: Record<string, unknown>) {
  try {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("org_id, organizations(crm_webhook_url, crm_provider)")
      .eq("user_id", ownerId)
      .single();
      
    const orgs = orgMember?.organizations as { crm_webhook_url?: string; crm_provider?: string } | null;
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

async function verifyTurnstileToken(token?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return; // Skip validation if no key is configured
  
  if (!token) {
    throw new Error("Missing CAPTCHA token");
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`
  });
  
  const data = await res.json();
  if (!data.success) {
    throw new Error("CAPTCHA verification failed");
  }
}

export async function POST(request: Request) {
  // 1. Edge Rate Limiting (Bot Protection)
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      const url = `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify([
          ["INCR", `ratelimit:lead:${ip}`],
          ["EXPIRE", `ratelimit:lead:${ip}`, 60]
        ])
      });
      
      const data = await res.json();
      if (data && data[0] && data[0].result > 10) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    } catch (e) {
      console.error("Rate limiting error:", e);
    }
  }

  // 2. Cloudflare Turnstile Validation
  try {
    const bodyData = await request.clone().json().catch(()=>({}));
    await verifyTurnstileToken(bodyData.cfToken);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    const data = await request.json();
    const {
      name,
      email,
      phone,
      company,
      title,
      jobTitle,
      notes,
      leadType,
      location,
      cardId,
      userIdOverride,
    } = data;

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

    // Public lead: When cardId is provided for any visitor other than the card owner
    if (cardId && (!user || user.id !== ownerId)) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", {
        p_card_id: cardId,
        p_name: name,
        p_email: email || "",
        p_phone: phone || null,
        p_company: company || null,
        p_job_title: jobTitle || title || null,
        p_notes: notes || null,
        p_lead_type: leadType || "contact_exchange",
        p_location: location || null,
      });

      if (rpcError) {
        console.error("Public lead RPC error:", rpcError);
        return NextResponse.json(
          { error: rpcError.message || "Failed to submit contact information" },
          { status: 500 }
        );
      }

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save connection";
    console.error("Error saving connection:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

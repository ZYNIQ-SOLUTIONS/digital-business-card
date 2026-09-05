import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const WALLET_API_URL = process.env.WALLETWALLET_API_URL || "https://api.walletwallet.io/v1/passes";
const WALLET_API_KEY = process.env.WALLETWALLET_API_KEY || "";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    // 1. Fetch card details and verify ownership
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found or access denied" }, { status: 404 });
    }

    // 2. Format the payload for the external Wallet API
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
    const publicUrl = `${siteUrl}/${card.slug}`;
    const qrCodeLink = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

    const walletPayload = {
      fullName: card.full_name,
      jobTitle: card.title || "Professional",
      company: card.company || "Independent",
      avatarUrl: card.avatar_url || `${siteUrl}/default-avatar.png`,
      publicProfileUrl: publicUrl,
      qrCodeUrl: qrCodeLink,
      phone: card.phone_primary,
      email: card.email_work,
    };

    // 3. Call the External Wallet API
    let appleUrl = "";
    let googleUrl = "";

    if (WALLET_API_KEY && !WALLET_API_KEY.includes("placeholder")) {
      const response = await fetch(WALLET_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${WALLET_API_KEY}`,
        },
        body: JSON.stringify(walletPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Wallet API Error:", errText);
        throw new Error("Failed to generate passes with external provider");
      }

      const walletData = await response.json();
      appleUrl = walletData.applePassUrl;
      googleUrl = walletData.googlePassUrl;
    } else {
      // Mock generation for development/testing if API key is missing
      console.warn("Using mock wallet generation (WALLETWALLET_API_KEY missing)");
      appleUrl = `${siteUrl}/api/wallet/apple/${card.slug}`; // Fallback to our existing endpoints
      googleUrl = `${siteUrl}/api/wallet/google/${card.slug}`;
    }

    // 4. Cache the generated URLs in Supabase
    const { error: updateError } = await supabase
      .from("cards")
      .update({
        apple_pass_url: appleUrl,
        google_pass_url: googleUrl,
        wallet_pass_updated_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    if (updateError) {
      console.error("Failed to cache wallet passes:", updateError);
    }

    return NextResponse.json({
      success: true,
      appleUrl,
      googleUrl,
    });
  } catch (error: any) {
    console.error("Pass generation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get("cardId");
    const isPublic = searchParams.get("public") === "true"; // Allow public view fetching

    if (!cardId) {
      return NextResponse.json({ error: "Card ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    
    let query = supabase.from("cards").select("id, apple_pass_url, google_pass_url").eq("id", cardId);
    
    // If not a public request, enforce ownership
    if (!isPublic) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      query = query.eq("user_id", user.id);
    }

    const { data: card, error } = await query.single();

    if (error || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      appleUrl: card.apple_pass_url,
      googleUrl: card.google_pass_url,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch pass URLs" }, { status: 500 });
  }
}

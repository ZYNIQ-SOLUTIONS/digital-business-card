/* eslint-disable */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, cardId, fullName = "User" } = body;

    // Require authenticated session to prevent quota abuse
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!image) {
      return NextResponse.json({ error: "No image provided for verification" }, { status: 400 });
    }

    // Clean base64 data string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeTypeMatch = image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

    const apiKey = process.env.GEMINI_API_KEY || process.env["GEMINI_" + "API_KEY"];

    let verificationResult = {
      verified: false,
      confidence: 0,
      faceDetected: false,
      livenessScore: 0,
      reason: "Verification requires Gemini AI analysis. Please ensure your API key is configured.",
      badge: "",
    };

    if (apiKey && !apiKey.includes("placeholder")) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a biometric identity verification and liveness assessment AI.
Analyze this live selfie photo taken by user "${fullName}" for authenticating their digital business card.

Evaluate:
1. Is there a real, clear human face visible and facing the camera?
2. Is the lighting and resolution sufficient for an authentic executive identification?
3. Does it show live natural posture rather than a photo of a screen, printed paper, or cartoon avatar?

Respond with ONLY valid JSON (no markdown fences, no extra text) conforming to this schema:
{
  "verified": boolean,
  "confidence": number (integer between 0 and 100),
  "faceDetected": boolean,
  "livenessScore": number (float between 0.0 and 1.0),
  "reason": string (a concise 1-2 sentence professional verification verdict)
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            prompt,
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
          ],
        });

        const rawText = response.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          verificationResult = {
            verified: !!parsed.verified,
            confidence: parsed.confidence || (parsed.verified ? 95 : 30),
            faceDetected: parsed.faceDetected ?? true,
            livenessScore: parsed.livenessScore || 0.9,
            reason: parsed.reason || (parsed.verified ? "Profile verified by AI." : "Verification could not be confirmed."),
            badge: "ai_verified_executive",
          };
        }
      } catch (geminiErr: any) {
        console.error("Gemini vision analysis failed:", geminiErr.message);
        // Fail closed — do NOT auto-approve on error
        verificationResult = {
          verified: false,
          confidence: 0,
          faceDetected: false,
          livenessScore: 0,
          reason: "Verification service temporarily unavailable. Please try again.",
          badge: "",
        };
      }
    }

    // If verified and cardId provided, update card in Supabase
    if (verificationResult.verified && cardId) {
      try {
        const supabase = await createClient();
        await supabase
          .from("cards")
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
            verification_badge: verificationResult.badge,
          })
          .eq("id", cardId);
      } catch (dbErr) {
        console.warn("Could not persist verification to database:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      ...verificationResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Identity verification error:", error);
    return NextResponse.json(
      { error: "Failed to process photo verification", details: error.message },
      { status: 500 }
    );
  }
}

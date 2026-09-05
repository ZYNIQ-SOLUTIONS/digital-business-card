import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    
    // Rate Limiting: 50 AI bio requests per 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { count, error: countError } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('endpoint', 'enhance-bio')
      .gte('created_at', yesterday.toISOString());

    if (!countError && count !== null && count >= 50) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. You can use bio generation up to 50 times per 24 hours." },
        { status: 429 }
      );
    }

    // Log the usage
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'enhance-bio',
    });

    const rawBio = typeof body.bio === "string" ? body.bio : "";
    const rawFullName = typeof body.fullName === "string" ? body.fullName : "";
    const rawTitle = typeof body.title === "string" ? body.title : "";
    const rawCompany = typeof body.company === "string" ? body.company : "";
    const rawTagline = typeof body.tagline === "string" ? body.tagline : "";

    const bio = rawBio.trim().slice(0, 500);
    const fullName = rawFullName.trim().slice(0, 100);
    const title = rawTitle.trim().slice(0, 100);
    const company = rawCompany.trim().slice(0, 100);
    const tagline = rawTagline.trim().slice(0, 500);
    const skills = Array.isArray(body.skills)
      ? body.skills.slice(0, 10).map((s: unknown) => String(s || "").trim().slice(0, 50)).filter(Boolean)
      : [];

    const apiKey = process.env.GEMINI_API_KEY || process.env["GEMINI_" + "API_KEY"];

    // If no API key configured, use high-craft structured fallbacks
    if (!apiKey || apiKey.includes("placeholder")) {
      const titleStr = title ? `${title}` : "Professional Leader";
      const compStr = company ? ` at ${company}` : "";
      const skillsStr = Array.isArray(skills) && skills.length > 0 ? skills.slice(0, 3).join(", ") : "strategic growth and innovation";

      return NextResponse.json({
        success: true,
        source: "fallback",
        variations: [
          {
            tone: "Executive & Impactful",
            text: `${titleStr}${compStr} driving high-impact innovation across ${skillsStr}. Committed to building resilient architectures, scaling global teams, and delivering breakthrough solutions.`,
          },
          {
            tone: "Modern & Conversational",
            text: `Passionate ${titleStr.toLowerCase()}${compStr}. I focus on turning complex challenges into seamless experiences with ${skillsStr}. Always open to connecting with fellow builders and visionary leaders.`,
          },
          {
            tone: "Punchy & Minimalist",
            text: `${titleStr}${compStr}. Pioneering the future of ${skillsStr} with relentless craft and strategic clarity.`,
          },
        ],
      });
    }

    const prompt = `You are an elite executive business bio writer for modern digital business cards.
Context of the professional:
- Full Name: "${fullName || 'Not specified'}"
- Current Role/Title: "${title || 'Not specified'}"
- Company: "${company || 'Not specified'}"
- Tagline: "${tagline || 'Not specified'}"
- Key Skills/Focus: "${Array.isArray(skills) ? skills.join(', ') : 'Not specified'}"
- Current Bio Draft / Notes: "${bio || 'None provided'}"

Your task:
Craft 3 distinct, compelling, and modern professional bios tailored for high-impact networking (maximum 2-3 sentences each, between 35 and 65 words).
The 3 variations must be:
1. "Executive & Impactful" (Authoritative, metric/outcome driven, leadership tone)
2. "Modern & Conversational" (Engaging, personable, passionate, relationship builder)
3. "Punchy & Minimalist" (Ultra-concise, elegant, striking)

Return ONLY valid JSON (no markdown formatting, no codeblocks) with this exact schema:
{
  "variations": [
    {
      "tone": "Executive & Impactful",
      "text": "..."
    },
    {
      "tone": "Modern & Conversational",
      "text": "..."
    },
    {
      "tone": "Punchy & Minimalist",
      "text": "..."
    }
  ]
}`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.7,
      },
    });

    const resultText = response.text || "{}";
    let jsonData: { variations?: Array<{ tone: string; text: string }> } = {};

    try {
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini bio JSON response:", resultText);
      return NextResponse.json({
        success: true,
        source: "fallback",
        variations: [
          {
            tone: "Executive & Impactful",
            text: `${title || 'Leader'}${company ? ` at ${company}` : ''}. Delivering high-impact solutions with a focus on strategic growth and innovation.`,
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      source: "gemini",
      variations: jsonData.variations || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to enhance bio";
    console.error("Error generating bio enhancement:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

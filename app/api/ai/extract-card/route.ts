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

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Rate Limiting: 25 card extractions per 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { count, error: countError } = await supabase
      .from('ai_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('endpoint', 'extract-card')
      .gte('created_at', yesterday.toISOString());

    if (!countError && count !== null && count >= 25) {
      return NextResponse.json(
        { error: "AI rate limit exceeded. You can scan up to 25 cards per 24 hours." },
        { status: 429 }
      );
    }

    // Log the usage
    await supabase.from('ai_usage_logs').insert({
      user_id: user.id,
      endpoint: 'extract-card',
    });

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    
    // We send it to Gemini Vision to extract details
    const prompt = `You are a business card data extractor. Extract the following fields from this image.
Return ONLY a raw JSON object (no markdown, no backticks) with these exact keys:
- name (string)
- email (string)
- phone (string)
- company (string)
- title (string)

If a field is missing, set it to an empty string. Do not include any other text.`;

    const ai = new GoogleGenAI({ apiKey: process.env["GEMINI_" + "API_KEY"] });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: imageFile.type || "image/jpeg",
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const resultText = response.text || "{}";
    let jsonData = {};
    
    try {
      // Clean up in case the model returns markdown blocks despite prompt
      const cleaned = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", resultText);
      return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 });
    }

    return NextResponse.json(jsonData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to extract card details";
    console.error("Error extracting card:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/* eslint-disable */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

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
    } catch (e) {
      console.error("Failed to parse Gemini response:", resultText);
      return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 });
    }

    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error("Error extracting card:", error);
    return NextResponse.json(
      { error: "Failed to extract card details", details: error.message },
      { status: 500 }
    );
  }
}

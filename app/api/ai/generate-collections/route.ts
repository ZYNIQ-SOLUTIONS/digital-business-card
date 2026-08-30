/* eslint-disable */
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface GeneratedCollection {
  name: string;
  description: string;
  color: string;
  icon?: string;
  suggestedContactIds?: string[];
}

const PRESET_COLORS = [
  "#0071E3", // Apple Blue
  "#34C759", // Emerald Green
  "#AF52DE", // Purple
  "#FF9500", // Orange
  "#FF2D55", // Rose Pink
  "#5856D6", // Indigo
  "#5AC8FA", // Cyan
  "#64748B", // Slate
  "#E11D48", // Crimson
  "#0284C7", // Sky Blue
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      mode = "connections", // "connections" | "profile"
      connections = [], 
      cards = [], 
      profile = {},
      existingCollections = []
    } = body;

    const existingNames = existingCollections.map((c: any) => (c.name || "").toLowerCase());

    const apiKey = process.env.GEMINI_API_KEY || process.env["GEMINI_" + "API_KEY"];

    // -------------------------------------------------------------
    // 1. If Gemini API Key is present, generate via Gemini 2.5 Flash
    // -------------------------------------------------------------
    if (apiKey && !apiKey.includes("placeholder")) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        let prompt = "";

        if (mode === "connections" && connections.length > 0) {
          // Prepare connection summary for prompt
          const connectionsSummary = connections.map((c: any, i: number) => ({
            id: c.id,
            name: c.contact_name || "Unknown",
            title: c.contact_title || "Professional",
            company: c.contact_company || "Unknown Company",
            location: c.met_at_location || "",
            email: c.contact_email || "",
          }));

          prompt = `You are an elite AI networking strategist for digital business cards and CRM contacts.
The user has the following ${connections.length} saved connections/cards in their networking wallet:
${JSON.stringify(connectionsSummary, null, 2)}

Existing collection names already created: ${JSON.stringify(existingNames)}

Task:
Analyze these contacts and organize them into 3 to 5 smart, high-value collections (e.g. by industry, seniority, company type, event/location, or relationship tier like "Tech Founders & C-Suite", "Investors & VCs", "Event & Summit Leads", "Potential Clients", "Design & Creative Partners").
Do NOT suggest collection names that already exist.
Assign the relevant contact IDs (from the list above) into "suggestedContactIds" for each collection based on their role/company/location.

Return ONLY valid JSON (no markdown formatting, no codeblocks) with this exact schema:
{
  "collections": [
    {
      "name": "Collection Name",
      "description": "Short 1-sentence description of what this group represents",
      "color": "#0071E3",
      "icon": "Briefcase",
      "suggestedContactIds": ["id1", "id2"]
    }
  ]
}`;
        } else {
          // Profile & Cards mode
          const userCards = Array.isArray(cards) && cards.length > 0 ? cards : [];
          const userTitle = userCards[0]?.title || profile?.full_name || "Professional";
          const userCompany = userCards[0]?.company || "";
          const userIndustry = userCards[0]?.industry || "";
          const userSkills = userCards[0]?.skills || [];
          const userBio = userCards[0]?.bio || "";

          prompt = `You are an elite AI networking strategist for digital business cards.
The user's professional profile & business card details:
- Full Name: "${profile?.full_name || userCards[0]?.full_name || 'Professional'}"
- Primary Title/Role: "${userTitle}"
- Company: "${userCompany}"
- Industry: "${userIndustry}"
- Skills: "${Array.isArray(userSkills) ? userSkills.join(', ') : ''}"
- Bio/Persona: "${userBio}"

Existing collection names already created: ${JSON.stringify(existingNames)}

Task:
Generate 4 to 5 tailored, strategic networking collections specifically designed for this professional's business niche, client funnel, and networking goals (e.g. tailored client tiers, vendor partners, prospective investors, referral partners, event leads, C-suite collaborators).
Do NOT suggest collection names that already exist.

Return ONLY valid JSON (no markdown formatting, no codeblocks) with this exact schema:
{
  "collections": [
    {
      "name": "Collection Name",
      "description": "Short 1-sentence description explaining why this collection is strategic for their persona",
      "color": "#0071E3",
      "icon": "Users",
      "suggestedContactIds": []
    }
  ]
}`;
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { temperature: 0.7 },
        });

        const rawText = response.text || "{}";
        const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed.collections) && parsed.collections.length > 0) {
          const validatedCollections: GeneratedCollection[] = parsed.collections.map((col: any, index: number) => ({
            name: col.name || `Smart Collection ${index + 1}`,
            description: col.description || "Organized contacts group",
            color: col.color && col.color.startsWith("#") ? col.color : PRESET_COLORS[index % PRESET_COLORS.length],
            icon: col.icon || "Folder",
            suggestedContactIds: Array.isArray(col.suggestedContactIds) ? col.suggestedContactIds : [],
          }));

          return NextResponse.json({
            success: true,
            source: "gemini",
            mode,
            collections: validatedCollections,
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini generation failed, using intelligent heuristics:", geminiError.message);
      }
    }

    // -------------------------------------------------------------
    // 2. Intelligent Heuristic / Fallback Generator
    // -------------------------------------------------------------
    const fallbackCollections: GeneratedCollection[] = [];

    if (mode === "connections" && Array.isArray(connections) && connections.length > 0) {
      // Analyze connections
      const executives: string[] = [];
      const techOrProduct: string[] = [];
      const salesOrMarketing: string[] = [];
      const eventLeads: string[] = [];
      const highPriority: string[] = [];

      connections.forEach((c: any) => {
        const title = (c.contact_title || "").toLowerCase();
        const location = (c.met_at_location || "").toLowerCase();
        const company = (c.contact_company || "").toLowerCase();

        if (title.includes("ceo") || title.includes("founder") || title.includes("director") || title.includes("vp") || title.includes("head") || title.includes("chief")) {
          executives.push(c.id);
        }
        if (title.includes("engineer") || title.includes("developer") || title.includes("tech") || title.includes("product") || title.includes("design") || title.includes("architect")) {
          techOrProduct.push(c.id);
        }
        if (title.includes("sales") || title.includes("growth") || title.includes("marketing") || title.includes("business") || title.includes("lead")) {
          salesOrMarketing.push(c.id);
        }
        if (location.includes("event") || location.includes("summit") || location.includes("conf") || location.includes("dubai") || location.includes("meet")) {
          eventLeads.push(c.id);
        }
        if (c.status === "pending" || c.ai_drafted_message) {
          highPriority.push(c.id);
        }
      });

      if (executives.length > 0 && !existingNames.includes("founders & executives")) {
        fallbackCollections.push({
          name: "Founders & Executives",
          description: "C-level leaders, company founders, and decision-makers in your network.",
          color: "#0071E3",
          icon: "Award",
          suggestedContactIds: executives,
        });
      }

      if (techOrProduct.length > 0 && !existingNames.includes("product & engineering")) {
        fallbackCollections.push({
          name: "Product & Engineering",
          description: "Technical builders, designers, and engineering leaders.",
          color: "#AF52DE",
          icon: "Sparkles",
          suggestedContactIds: techOrProduct,
        });
      }

      if (salesOrMarketing.length > 0 && !existingNames.includes("growth & business partners")) {
        fallbackCollections.push({
          name: "Growth & Business Partners",
          description: "Business development, sales specialists, and marketing collaborators.",
          color: "#FF9500",
          icon: "TrendingUp",
          suggestedContactIds: salesOrMarketing,
        });
      }

      if (eventLeads.length > 0 && !existingNames.includes("Event & Conference Leads")) {
        fallbackCollections.push({
          name: "Event & Conference Leads",
          description: "Contacts met at recent conferences, networking events, and summits.",
          color: "#34C759",
          icon: "Building",
          suggestedContactIds: eventLeads,
        });
      }

      if (!existingNames.includes("high-priority follow-ups")) {
        fallbackCollections.push({
          name: "High-Priority Follow-ups",
          description: "Contacts needing prompt follow-ups and warm introduction outreach.",
          color: "#FF2D55",
          icon: "Users",
          suggestedContactIds: highPriority.slice(0, 5),
        });
      }
    }

    // Default Profile-based collections fallback
    if (fallbackCollections.length === 0) {
      const primaryCard = Array.isArray(cards) && cards.length > 0 ? cards[0] : null;
      const industry = (primaryCard?.industry || primaryCard?.title || "").toLowerCase();

      if (industry.includes("real estate") || industry.includes("property")) {
        fallbackCollections.push(
          { name: "VIP Buyers & Investors", description: "High-net-worth real estate clients and private property investors.", color: "#0071E3", icon: "Award", suggestedContactIds: [] },
          { name: "Property Developers", description: "Master developers and project managers for luxury listings.", color: "#34C759", icon: "Building", suggestedContactIds: [] },
          { name: "Mortgage & Legal Partners", description: "Financial advisors, escrow agents, and conveyancing lawyers.", color: "#FF9500", icon: "Briefcase", suggestedContactIds: [] },
          { name: "Warm Leads & Inquiries", description: "Prospective buyers and tenants actively touring properties.", color: "#AF52DE", icon: "Users", suggestedContactIds: [] }
        );
      } else if (industry.includes("tech") || industry.includes("software") || industry.includes("developer") || industry.includes("ai")) {
        fallbackCollections.push(
          { name: "Enterprise Clients", description: "Corporate accounts and high-value software enterprise contracts.", color: "#0071E3", icon: "Building", suggestedContactIds: [] },
          { name: "Startup Founders & CEOs", description: "Early-stage and growth founders looking for technology solutions.", color: "#AF52DE", icon: "Award", suggestedContactIds: [] },
          { name: "Design & Dev Contractors", description: "Freelance designers, specialized engineers, and vendor partners.", color: "#34C759", icon: "Sparkles", suggestedContactIds: [] },
          { name: "VCs & Angel Investors", description: "Venture capitalists, angel syndicates, and ecosystem partners.", color: "#FF9500", icon: "TrendingUp", suggestedContactIds: [] }
        );
      } else {
        fallbackCollections.push(
          { name: "Key Clients & Accounts", description: "Primary clients and active business relationships.", color: "#0071E3", icon: "Award", suggestedContactIds: [] },
          { name: "Strategic Partners", description: "Collaborators, channel partners, and cross-referral contacts.", color: "#34C759", icon: "Users", suggestedContactIds: [] },
          { name: "Prospective Leads", description: "New networking contacts with high conversion potential.", color: "#FF9500", icon: "TrendingUp", suggestedContactIds: [] },
          { name: "Industry Peers & Mentors", description: "Fellow executives, advisors, and professional mentors.", color: "#AF52DE", icon: "Briefcase", suggestedContactIds: [] }
        );
      }
    }

    return NextResponse.json({
      success: true,
      source: "heuristic",
      mode,
      collections: fallbackCollections,
    });
  } catch (error: any) {
    console.error("Error generating collections:", error);
    return NextResponse.json(
      { error: "Failed to generate collections", details: error.message },
      { status: 500 }
    );
  }
}

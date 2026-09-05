import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Robust RFC 4180 compliant CSV parser.
 * Handles quoted fields, escaped quotes (""), embedded commas, and CRLF / LF.
 */
function parseRFC4180CSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote: "" -> "
          currentField += '"';
          i += 2;
        } else {
          // End of quoted field
          inQuotes = false;
          i++;
        }
      } else {
        currentField += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = "";
        i++;
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        i++;
      } else {
        currentField += char;
        i++;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  // Filter out completely empty rows
  return rows.filter((r) => r.some((field) => field.length > 0));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("csv") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No CSV provided" }, { status: 400 });
    }

    // Enforce 5MB file upload limit (P3-2)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamically look up organization from public.organizations (P2-7)
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    let orgName = "Enterprise";
    let orgId: string | null = null;

    if (membership?.org_id) {
      orgId = membership.org_id;
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", membership.org_id)
        .maybeSingle();

      if (org?.name) {
        orgName = org.name;
      }
    } else {
      // Fallback: check caller's existing card company
      const { data: callerCard } = await supabase
        .from("cards")
        .select("company, org_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (callerCard?.company) {
        orgName = callerCard.company;
      }
      if (callerCard?.org_id) {
        orgId = callerCard.org_id;
      }
    }

    const text = await file.text();
    const parsedRows = parseRFC4180CSV(text);

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    // Determine column indices from header
    const headerRow = parsedRows[0].map((h) => h.toLowerCase().trim());
    let nameIdx = headerRow.findIndex((h) => h.includes("name"));
    let titleIdx = headerRow.findIndex(
      (h) => h.includes("title") || h.includes("role") || h.includes("position")
    );
    let emailIdx = headerRow.findIndex((h) => h.includes("email") || h.includes("mail"));
    let phoneIdx = headerRow.findIndex((h) => h.includes("phone") || h.includes("mobile") || h.includes("tel"));

    if (nameIdx === -1) nameIdx = 0;
    if (titleIdx === -1) titleIdx = 1;
    if (emailIdx === -1) emailIdx = 2;
    if (phoneIdx === -1) phoneIdx = 3;

    const cardsToInsert = [];

    for (let i = 1; i < parsedRows.length; i++) {
      const cols = parsedRows[i];
      const fullName = (cols[nameIdx] || "").trim();
      if (!fullName) continue;

      const title = (cols[titleIdx] || "").trim();
      const emailWork = (cols[emailIdx] || "").trim();
      const phonePrimary = (cols[phoneIdx] || "").trim();

      const baseSlug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const uniqueSlug = `${baseSlug || "member"}-${randomSuffix}-${Date.now().toString(36)}`;

      cardsToInsert.push({
        user_id: user.id,
        org_id: orgId,
        full_name: fullName,
        title: title || "Team Member",
        company: orgName,
        email_work: emailWork,
        phone_primary: phonePrimary,
        slug: uniqueSlug,
        is_published: true,
      });
    }

    if (cardsToInsert.length === 0) {
      return NextResponse.json(
        { error: "No valid member records found in CSV" },
        { status: 400 }
      );
    }

    // Offload to background queue via QStash
    const QSTASH_URL = process.env.QSTASH_URL;
    const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";

    if (QSTASH_URL && QSTASH_TOKEN) {
      const response = await fetch(`${QSTASH_URL}/v2/publish/${SITE_URL}/api/enterprise/process-batch`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${QSTASH_TOKEN}`,
          "Content-Type": "application/json",
          "Upstash-Delay": "5s",
        },
        body: JSON.stringify({
          cards: cardsToInsert,
          orgId,
          userId: user.id
        }),
      });

      if (!response.ok) {
        console.error("Failed to publish to QStash", await response.text());
        throw new Error("Failed to enqueue bulk processing job");
      }

      return NextResponse.json({ 
        success: true, 
        count: cardsToInsert.length,
        message: "Upload queued for background processing. You will be notified when complete."
      });
    } else {
      // Fallback: Synchronous chunked insert if QStash is not configured
      const chunkSize = 100;
      for (let i = 0; i < cardsToInsert.length; i += chunkSize) {
        const chunk = cardsToInsert.slice(i, i + chunkSize);
        const { error: insertError } = await supabase.from("cards").insert(chunk);
        if (insertError) throw insertError;
      }
      return NextResponse.json({ success: true, count: cardsToInsert.length, message: "Upload processed synchronously (Queue not configured)." });
    }
  } catch (error: any) {
    console.error("Error uploading CSV:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload" },
      { status: 500 }
    );
  }
}

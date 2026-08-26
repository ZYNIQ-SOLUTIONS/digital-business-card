/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("csv") as File;

    if (!file) {
      return NextResponse.json({ error: "No CSV provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = text.split("\n").filter(r => r.trim().length > 0);
    
    // Assume header is row 0: name, title, email, phone
    // Extremely basic parsing for MVP
    const cardsToInsert = [];
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(",").map(c => c.trim());
      if (cols.length >= 4) {
        cardsToInsert.push({
          user_id: user.id, // Assigned to the admin for now
          full_name: cols[0],
          title: cols[1],
          email_work: cols[2],
          phone_primary: cols[3],
          company: "Acme Corp", // Hardcoded for MVP
          slug: cols[0].toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random()*1000)
        });
      }
    }

    if (cardsToInsert.length > 0) {
      const { error } = await supabase.from("cards").insert(cardsToInsert);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: cardsToInsert.length });
  } catch (error: any) {
    console.error("Error uploading CSV:", error);
    return NextResponse.json({ error: "Failed to upload", details: error.message }, { status: 500 });
  }
}

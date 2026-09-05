import { NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import { createClient } from "@/lib/supabase/server";
import path from "path";
import fs from "fs";

interface WalletCardData {
  id?: string;
  full_name: string;
  company: string;
  title: string;
  phone_primary: string;
  email_work: string;
  website_primary: string;
  geofence_locations?: Array<{ latitude: number; longitude: number; relevantText?: string }>;
  tagline?: string;
  bio?: string;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCardId = searchParams.get("cardId");
    const rawSlug = searchParams.get("slug");

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const SLUG_REGEX = /^[a-z0-9-_]{1,100}$/i;

    if (rawCardId !== null) {
      if (!UUID_REGEX.test(rawCardId) && !SLUG_REGEX.test(rawCardId)) {
        return NextResponse.json({ error: "Invalid cardId or slug parameter" }, { status: 400 });
      }
    }

    if (rawSlug !== null) {
      if (!UUID_REGEX.test(rawSlug) && !SLUG_REGEX.test(rawSlug)) {
        return NextResponse.json({ error: "Invalid cardId or slug parameter" }, { status: 400 });
      }
    }

    const cardIdOrSlug = rawCardId || rawSlug;

    let cardData: WalletCardData = {
      full_name: "Ibrahim El Khalil",
      company: "ZYNIQ",
      title: "Founder & AI Architect",
      phone_primary: "+1 (555) 019-2834",
      email_work: "ibrahim@zyniq.solutions",
      website_primary: "https://zyniq.solutions",
    };

    if (cardIdOrSlug) {
      try {
        const supabase = await createClient();
        let query = supabase.from("cards").select("*");
        if (rawCardId) {
          if (UUID_REGEX.test(rawCardId)) {
            query = query.eq("id", rawCardId);
          } else {
            query = query.eq("slug", rawCardId);
          }
        } else if (rawSlug) {
          if (UUID_REGEX.test(rawSlug)) {
            query = query.eq("id", rawSlug);
          } else {
            query = query.eq("slug", rawSlug);
          }
        }
        const { data: fetchedCard } = await query.single();

        if (fetchedCard) {
          cardData = fetchedCard;
        }
      } catch {
        // Fallback to default card if DB lookup isn't active
      }
    }

    const vCardString = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.full_name}
ORG:${cardData.company}
TITLE:${cardData.title}
TEL;TYPE=CELL,VOICE:${cardData.phone_primary}
EMAIL;TYPE=INTERNET,WORK:${cardData.email_work}
URL:${cardData.website_primary}
END:VCARD`;

    const certsDir = path.join(process.cwd(), "certificates");
    const wwdrPath = path.join(certsDir, "wwdr.pem");
    const signerCertPath = path.join(certsDir, "signerCert.pem");
    const signerKeyPath = path.join(certsDir, "signerKey.pem");

    const passTypeIdentifier = process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.solutions.zyniq.card";
    const teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER || "YOUR_TEAM_ID";
    const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE || "";

    const hasCertificates =
      fs.existsSync(wwdrPath) &&
      fs.existsSync(signerCertPath) &&
      fs.existsSync(signerKeyPath);

    if (!hasCertificates) {
      return NextResponse.json(
        {
          error: "Apple Wallet Certificates Missing: place wwdr.pem, signerCert.pem, and signerKey.pem in ./certificates",
        },
        { status: 501 }
      );
    }

    const wwdr = fs.readFileSync(wwdrPath);
    const signerCert = fs.readFileSync(signerCertPath);
    const signerKey = fs.readFileSync(signerKeyPath);

    const pass = new PKPass(
      {},
      {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase: signerKeyPassphrase || undefined,
      },
      {
        passTypeIdentifier,
        teamIdentifier,
        organizationName: cardData.company || "Digital Card",
        description: `${cardData.full_name} - Digital Business Card`,
        serialNumber: `CARD-${cardData.id || Date.now()}`,
        backgroundColor: "rgb(255, 255, 255)",
        foregroundColor: "rgb(29, 29, 31)",
        labelColor: "rgb(0, 113, 227)",
      }
    );

    (pass as unknown as { locations?: unknown }).locations =
      Array.isArray(cardData.geofence_locations) && cardData.geofence_locations.length > 0
        ? cardData.geofence_locations.map((loc) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
            relevantText: loc.relevantText || "Your digital card is ready to share.",
          }))
        : undefined;

    pass.type = "generic";

    pass.primaryFields.push({
      key: "name",
      label: (cardData.title || "TITLE").toUpperCase(),
      value: cardData.full_name,
    });

    pass.secondaryFields.push(
      {
        key: "company",
        label: "ORGANIZATION",
        value: cardData.company,
      },
      {
        key: "website",
        label: "WEBSITE",
        value: (cardData.website_primary || "").replace(/^https?:\/\//, ""),
      }
    );

    pass.auxiliaryFields.push({
      key: "status",
      label: "MEMBERSHIP",
      value: "VERIFIED CONTACT",
    });

    pass.backFields.push(
      {
        key: "about",
        label: `About ${cardData.company}`,
        value: cardData.tagline || cardData.bio || "Smart Digital Business Card",
      },
      {
        key: "url",
        label: "Official Website",
        value: cardData.website_primary || "https://zyniq.solutions",
      }
    );

    pass.setBarcodes({
      format: "PKBarcodeFormatQR",
      message: vCardString,
      messageEncoding: "iso-8859-1",
      altText: "Scan to save contact",
    });

    const passBuffer = pass.getAsBuffer();

    return new NextResponse(passBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${(cardData.full_name || "Card").replace(/\s+/g, "")}.pkpass"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message || "Failed to generate Apple Wallet pass" },
      { status: 500 }
    );
  }
}

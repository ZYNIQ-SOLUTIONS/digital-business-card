import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { themes } from "@/lib/theme";
import { after } from "next/server";
import PublicCardClient from "./public-card-client";
import { Metadata } from "next";

interface PublicCardPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicCardPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: card } = await supabase
    .from("cards")
    .select("full_name, title, company, tagline, bio, avatar_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!card) {
    return {
      title: "Digital Business Card",
      description: "Smart Digital Business Card",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
  const cardUrl = `${baseUrl}/${slug}`;

  const ogImageUrl = card.avatar_url
    ? card.avatar_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(card.full_name || 'Card')}&background=0071E3&color=fff&size=800&bold=true&format=png`;

  return {
    title: `${card.full_name} — ${card.title} at ${card.company}`,
    description: card.tagline || card.bio || `Connect with ${card.full_name}, ${card.title} at ${card.company}.`,
    alternates: {
      canonical: cardUrl,
    },
    openGraph: {
      type: "profile",
      url: cardUrl,
      title: `${card.full_name} — ${card.title}`,
      description: card.tagline || card.bio || `${card.title} at ${card.company}`,
      siteName: "ZYNIQ Digital Business Cards",
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 800,
          alt: `${card.full_name} profile photograph`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${card.full_name} — ${card.title} at ${card.company}`,
      description: card.tagline || card.bio || `${card.title} at ${card.company}`,
      images: [ogImageUrl],
    },
  };
}

// Explicit public column whitelist for RSC payload sanitization (P2-1)
// Never select sensitive columns: user_id, email_personal, phone_secondary, org_id, geofence_locations
const PUBLIC_CARD_COLUMNS = [
  "id",
  "slug",
  "full_name",
  "title",
  "company",
  "bio",
  "avatar_url",
  "theme",
  "active_mode",
  "custom_colors",
  "is_published",
  "views_count",
  "vcard_downloads_count",
  "wallet_downloads_count",
  "is_verified",
  "verification_badge",
  "verified_at",
  "email_work",
  "phone_work",
  "address",
  "website",
  "socials",
  "portfolio_url",
  "office_address",
  "skills",
  "work_location",
  "exchange_form_fields",
  "direct_link_platform",
  "lead_capture_mode",
  "template_layout",
  "avatar_initials",
  "tagline",
  "prefix",
  "preferred_name",
  "department",
  "industry",
  "years_experience",
  "phone_primary",
  "website_primary",
  "booking_url",
  "booking_enabled",
  "booking_title",
  "booking_days",
  "booking_start_time",
  "booking_end_time",
  "booking_slot_duration",
  "custom_primary_color",
  "custom_secondary_color",
  "custom_accent_color",
  "custom_background_image",
  "show_network_score",
  "custom_fields",
  "video_url",
  "bio_ar",
  "title_ar",
  "white_label",
  "custom_domain",
  "is_private",
  "pin_code",
  "modes",
  "temporary_layers",
  "crypto_identity",
  "icebreakers",
];

// Verified PostgreSQL table public columns as safe fallback
const VERIFIED_BASE_COLUMNS = [
  "id",
  "slug",
  "is_published",
  "theme",
  "template_layout",
  "full_name",
  "prefix",
  "preferred_name",
  "avatar_url",
  "avatar_initials",
  "tagline",
  "bio",
  "title",
  "company",
  "department",
  "industry",
  "work_location",
  "skills",
  "years_experience",
  "phone_primary",
  "email_work",
  "website_primary",
  "portfolio_url",
  "booking_url",
  "booking_enabled",
  "booking_title",
  "booking_days",
  "booking_start_time",
  "booking_end_time",
  "booking_slot_duration",
  "office_address",
  "socials",
  "views_count",
  "vcard_downloads_count",
  "wallet_downloads_count",
  "active_mode",
  "is_verified",
  "verified_at",
  "verification_badge",
  "custom_primary_color",
  "custom_secondary_color",
  "custom_accent_color",
  "custom_background_image",
  "show_network_score",
  "custom_fields",
  "video_url",
  "bio_ar",
  "title_ar",
  "white_label",
  "custom_domain",
  "is_private",
  "pin_code",
  "modes",
  "temporary_layers",
  "crypto_identity",
  "icebreakers",
];

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch sanitized public card using explicit public column whitelist (P2-1)
  const initialResult = await supabase
    .from("cards")
    .select(PUBLIC_CARD_COLUMNS.join(", "))
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  let card: any = initialResult.data;
  let error: any = initialResult.error;

  // If extended optional columns don't exist in PostgreSQL schema, fallback to verified base columns
  if (error && error.code === "42703") {
    const retryResult = await supabase
      .from("cards")
      .select(VERIFIED_BASE_COLUMNS.join(", "))
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    card = retryResult.data;
    error = retryResult.error;
  }

  if (error || !card) {
    // If running in development without Supabase connected or card not found
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return <PublicCardClient initialCard={null} slug={slug} fallbackMode={true} />;
    }
    notFound();
  }

  // Defense-in-depth sanitization: ensure sensitive fields are strictly stripped
  if (card) {
    delete card.user_id;
    delete card.email_personal;
    delete card.phone_secondary;
    delete card.org_id;
    delete card.geofence_locations;
  }

  // Fetch network connection score

  // Fetch custom theme if applicable
  let customThemeData = null;
  if (card && card.theme && !themes[card.theme]) {
    try {
      const { data: themeData } = await supabase
        .from("custom_themes")
        .select("*")
        .eq("id", card.theme)
        .single();
      
      if (themeData) {
        customThemeData = {
          ...themeData.tokens,
          customCss: themeData.custom_css,
          layoutConfig: themeData.layout_config,
        };
      }
    } catch (err) {
      console.warn("Failed to load custom theme", err);
    }
  }

  let connectionsCount = 0;
  if (card) {
    const { count } = await supabase
      .from("card_connections")
      .select("*", { count: "exact", head: true })
      .eq("connected_card_id", card.id);
    connectionsCount = count || 0;
  }

  // 2. Non-blocking view counter via RPC using Next.js 16 after() (P2-2 & P1-2)
  if (card) {
    after(async () => {
      try {
        const client = await createClient();
        await client.rpc("increment_card_views", { p_slug: slug });
      } catch (err) {
        console.error("Non-blocking increment_card_views RPC error:", err);
      }
    });
  }

  // 3. Construct Schema.org Person JSON-LD structured data (P1-3)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
  const cardUrl = `${baseUrl}/${slug}`;

  const sameAsLinks = Array.isArray(card.socials)
    ? (card.socials as Array<{ url?: string; active?: boolean }>)
        .filter((s) => s && s.url && s.active !== false)
        .map((s) => s.url as string)
    : [];

  const addressObj = typeof card.office_address === "object" && card.office_address !== null
    ? (card.office_address as Record<string, any>)
    : undefined;

  const schemaPerson: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: card.full_name,
    jobTitle: card.title || undefined,
    worksFor: card.company
      ? {
          "@type": "Organization",
          name: card.company,
        }
      : undefined,
    description: card.bio || card.tagline || undefined,
    image: card.avatar_url || undefined,
    url: cardUrl,
    telephone: card.phone_primary || card.phone_work || undefined,
    email: card.email_work || undefined,
    sameAs: sameAsLinks.length > 0 ? sameAsLinks : undefined,
  };

  if (addressObj && (addressObj.street || addressObj.city || addressObj.country)) {
    schemaPerson.address = {
      "@type": "PostalAddress",
      streetAddress: addressObj.street || undefined,
      addressLocality: addressObj.city || undefined,
      addressRegion: addressObj.region || undefined,
      postalCode: addressObj.postalCode || undefined,
      addressCountry: addressObj.country || undefined,
    };
  }

  // Clean undefined properties
  Object.keys(schemaPerson).forEach((key) => {
    if (schemaPerson[key] === undefined) {
      delete schemaPerson[key];
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }}
      />
      <PublicCardClient
        initialCard={card}
        slug={slug}
        fallbackMode={false}
        connectionsCount={connectionsCount}
        customThemeData={customThemeData}
      />
    </>
  );
}

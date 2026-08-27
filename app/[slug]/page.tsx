import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const ogImageUrl = card.avatar_url
    ? card.avatar_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(card.full_name || 'Card')}&background=0071E3&color=fff&size=400&bold=true&format=svg`;

  const cardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://d-b-c.netlify.app'}/${slug}`;

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
      images: [{
        url: ogImageUrl,
        width: 400,
        height: 400,
        alt: `${card.full_name} profile photo`,
      }],
      siteName: "ZYNIQ Digital Business Cards",
    },
    twitter: {
      card: "summary",
      title: `${card.full_name} — ${card.title}`,
      description: card.tagline || card.bio || `${card.title} at ${card.company}`,
      images: [ogImageUrl],
    },
  };
}

export default async function PublicCardPage({ params }: PublicCardPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !card) {
    // If running in development without Supabase connected or card not found
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")) {
      return <PublicCardClient initialCard={null} slug={slug} fallbackMode={true} />;
    }
    notFound();
  }

  // Increment view counter asynchronously
  try {
    await supabase.from("card_events").insert({
      card_id: card.id,
      event_type: "view",
    });
    await supabase
      .from("cards")
      .update({ views_count: (card.views_count || 0) + 1 })
      .eq("id", card.id);
  } catch {
    // Silently continue
  }

  return <PublicCardClient initialCard={card} slug={slug} fallbackMode={false} />;
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CreditCard, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  QrCode, 
  Copy, 
  Check, 
  Eye, 
  Download, 
  Loader2,
  Smartphone,
  Share2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AddToHomescreenModal } from "@/components/add-to-homescreen-modal";

interface CardItem {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  company: string;
  is_published: boolean;
  theme?: string;
  active_mode?: string;
  views_count: number;
  vcard_downloads_count: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrModalCard, setQrModalCard] = useState<CardItem | null>(null);
  const [homescreenTarget, setHomescreenTarget] = useState<{
    type: "dashboard" | "card";
    title: string;
    slug?: string;
    url?: string;
  } | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCards(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchCards();
  }, []);

  
  const handleCopyLink = async (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const cardUrl = `${origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  
  
  const handleChangeMode = async (id: string, newMode: string) => {
    const { error } = await supabase.from('cards').update({ active_mode: newMode }).eq('id', id);
    if (!error) {
      setCards(cards.map(c => c.id === id ? { ...c, active_mode: newMode } : c));
    }
  };

  const handleChangeTheme = async (id: string, newTheme: string) => {
    const { error } = await supabase.from('cards').update({ theme: newTheme }).eq('id', id);
    if (!error) {
      setCards(cards.map(c => c.id === id ? { ...c, theme: newTheme } : c));
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business card?")) return;

    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (!error) {
      setCards(cards.filter((c) => c.id !== id));
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("cards")
      .update({ is_published: !currentStatus })
      .eq("id", id);

    if (!error) {
      setCards(
        cards.map((c) =>
          c.id === id ? { ...c, is_published: !currentStatus } : c
        )
      );
    }
  };

  // Metrics summary
  const totalViews = cards.reduce((acc, c) => acc + (c.views_count || 0), 0);
  const totalDownloads = cards.reduce((acc, c) => acc + (c.vcard_downloads_count || 0), 0);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        <p className="text-sm text-gray-400">Loading your digital cards...</p>
      </div>
    );
  }

  if (!loading && cards.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
          <CreditCard className="w-8 h-8 text-gray-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-neutral-900 tracking-tight">No digital cards yet</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">Create your first digital business card to start networking smarter and sharing your professional identity.</p>
        </div>
        <Link
          href="/dashboard/cards/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-neutral-900/20 focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Card</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner & Metrics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            My Business Cards
          </h1>
          <p className="text-sm text-gray-400 pt-1">
            Manage, share, and track your active digital smart cards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() =>
              setHomescreenTarget({
                type: "dashboard",
                title: "IZN Dashboard",
                url: "/dashboard",
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-neutral-900/20 focus:outline-none"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Add to Home Screen</span>
          </button>

          <Link
            href="/dashboard/cards/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium border border-neutral-200 shadow-xs transition-all focus:ring-2 focus:ring-neutral-900/20 focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Card</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-gray-500" />
            Active Cards
          </span>
          <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{cards.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gray-500" />
            Total Views
          </span>
          <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{totalViews}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Download className="w-4 h-4 text-gray-500" />
            vCard Saves
          </span>
          <p className="text-3xl font-semibold text-neutral-900 tracking-tight">{totalDownloads}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6"
          >
            {/* Card Top Details */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
                    {card.full_name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      card.is_published
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-neutral-100 text-gray-400 border border-neutral-200"
                    }`}
                  >
                    {card.is_published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900">{card.title}</p>
                <p className="text-sm text-gray-400">{card.company}</p>
              </div>

              {/* QR Preview Trigger */}
              <button
                onClick={() => setQrModalCard(card)}
                className="p-2.5 rounded-xl bg-neutral-100 hover:bg-gray-800 text-neutral-600 transition-colors focus:outline-none"
                title="View QR Code (Direct Card Link)"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            {/* Public URL Box & Shortcut Trigger */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-sm">
              <span className="font-mono text-neutral-600 truncate pr-2">
                /{card.slug}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    setHomescreenTarget({
                      type: "card",
                      title: card.full_name,
                      slug: card.slug,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs focus:outline-none"
                  title="Add Card Shortcut to Home Screen"
                >
                  <Smartphone className="w-3.5 h-3.5 text-violet-600" />
                  <span className="hidden sm:inline">Shortcut</span>
                </button>

                <button
                  onClick={() => handleCopyLink(card.slug, card.id)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs focus:outline-none"
                >
                  {copiedId === card.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/${card.slug}`}
                  target="_blank"
                  className="p-1.5 rounded-lg bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 shadow-xs transition-colors"
                  title="Open live card"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/cards/${card.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-gray-800 text-xs font-medium text-neutral-900 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Card</span>
                </Link>

                <select
                  value={card.active_mode || "all"}
                  onChange={(e) => handleChangeMode(card.id, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 border border-transparent text-neutral-900 hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
                  title="Contextual Mode"
                >
                  <option value="all">All Mode</option>
                  <option value="work">Work Mode</option>
                  <option value="social">Social Mode</option>
                </select>

                <select
                  value={card.theme || "apple-light"}
                  onChange={(e) => handleChangeTheme(card.id, e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 border border-transparent text-neutral-900 hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer hidden sm:block"
                  title="Card Theme"
                >
                  <option value="apple-light">🍏 Apple Light</option>
                  <option value="apple-dark">🌑 Apple Dark</option>
                  <option value="obsidian-gold">✨ Obsidian Gold</option>
                  <option value="emerald-forest">🌲 Emerald Forest</option>
                  <option value="cosmic-nebula">🌌 Cosmic Nebula</option>
                  <option value="titanium-slate">🌪️ Titanium Slate</option>
                  <option value="terracotta-warmth">🏺 Terracotta Warmth</option>
                  <option value="nordic-polar">❄️ Nordic Polar</option>
                </select>

                <button
                  onClick={() => togglePublish(card.id, card.is_published)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors hidden sm:block"
                >
                  {card.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>

              <button
                onClick={() => handleDeleteCard(card.id)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Quick Modal */}
      {qrModalCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl border border-black/[0.08] text-center space-y-4">
            <h3 className="text-sm font-semibold text-[#1D1D1F]">
              {qrModalCard.full_name} QR Code
            </h3>
            
            <div className="p-3 bg-[#F5F5F7] rounded-2xl flex justify-center">
              <QRCodeSVG
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/${qrModalCard.slug}`}
                size={180}
                level="Q"
                className="w-44 h-44"
              />
            </div>

            <p className="text-[11px] text-[#86868B]">
              Scanning this code opens /{qrModalCard.slug} (direct live digital business card).
            </p>

            <button
              onClick={() => setQrModalCard(null)}
              className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add To Homescreen / Shortcut Modal */}
      <AddToHomescreenModal
        isOpen={Boolean(homescreenTarget)}
        onClose={() => setHomescreenTarget(null)}
        target={homescreenTarget || undefined}
      />
    </div>
  );
}

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
  Share2, 
  Sparkles,
  TrendingUp,
  Globe,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface CardItem {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  company: string;
  is_published: boolean;
  theme?: string;
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

  useEffect(() => {
    fetchCards();
  }, []);

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
      if (data.length === 0) {
        router.push("/dashboard/onboarding");
        return;
      }
      setCards(data);
    }
    setLoading(false);
  };

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
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
        <p className="text-xs text-[#86868B]">Loading your digital cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner & Metrics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
            My Business Cards
          </h1>
          <p className="text-xs text-[#86868B] pt-0.5">
            Manage, share, and track your active digital smart cards.
          </p>
        </div>

        <Link
          href="/dashboard/cards/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white text-xs font-semibold shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Card</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-[#0071E3]" />
            Active Cards
          </span>
          <p className="text-2xl font-bold text-[#1D1D1F]">{cards.length}</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-[#34C759]" />
            Total Card Views
          </span>
          <p className="text-2xl font-bold text-[#1D1D1F]">{totalViews}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-3xl bg-white border border-black/[0.06] shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-[#5856D6]" />
            vCard Saves
          </span>
          <p className="text-2xl font-bold text-[#1D1D1F]">{totalDownloads}</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-[28px] p-6 border border-black/[0.06] shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between space-y-5"
          >
            {/* Card Top Details */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#1D1D1F]">
                    {card.full_name}
                  </h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      card.is_published
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}
                  >
                    {card.is_published ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#0071E3]">{card.title}</p>
                <p className="text-xs text-[#86868B]">{card.company}</p>
              </div>

              {/* QR Preview Trigger */}
              <button
                onClick={() => setQrModalCard(card)}
                className="p-2.5 rounded-2xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] transition active:scale-95"
                title="View QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            {/* Public URL Box */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-xs">
              <span className="font-mono text-[#1D1D1F] truncate pr-2">
                /{card.slug}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyLink(card.slug, card.id)}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-neutral-50 text-[#1D1D1F] border border-black/[0.06] text-[11px] font-medium transition flex items-center gap-1"
                >
                  {copiedId === card.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#34C759]" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/${card.slug}`}
                  target="_blank"
                  className="p-1 rounded-xl bg-white hover:bg-neutral-50 border border-black/[0.06] text-[#1D1D1F]"
                  title="Open live card"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 border-t border-black/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/cards/${card.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-semibold text-[#1D1D1F] transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>Edit Card</span>
                </Link>

                
                <select
                  value={card.theme || "apple-light"}
                  onChange={(e) => handleChangeTheme(card.id, e.target.value)}
                  className="px-2 py-1.5 rounded-xl text-xs font-medium bg-[#F5F5F7] border border-black/[0.04] text-[#1D1D1F] hover:bg-[#E8E8ED] transition focus:outline-none"
                >
                  <option value="apple-light">Apple Light</option>
                  <option value="apple-dark">Apple Dark</option>
                  <option value="midnight-glass">Midnight Glass</option>
                </select>

                <button
                  onClick={() => togglePublish(card.id, card.is_published)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.03] transition"
                >
                  {card.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>

              <button
                onClick={() => handleDeleteCard(card.id)}
                className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
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
              Scanning this code opens /{qrModalCard.slug} with live Apple Wallet &amp; vCard downloads.
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
    </div>
  );
}

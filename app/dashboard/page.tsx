"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  Share2,
  RotateCcw,
  AlertTriangle,
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
  template_layout?: string;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-28 flex flex-col items-center justify-center space-y-4"><Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const tabParam = searchParams.get("tab");
  const [view, setView] = useState<"active" | "trash">(tabParam === "trash" ? "trash" : "active");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [trashedCards, setTrashedCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [qrModalCard, setQrModalCard] = useState<CardItem | null>(null);
  const [homescreenTarget, setHomescreenTarget] = useState<{
    type: "dashboard" | "card";
    title: string;
    slug?: string;
    url?: string;
  } | null>(null);

  // Synchronize view state with URL ?tab= query parameter
  useEffect(() => {
    if (tabParam === "trash") {
      setView("trash");
    } else if (tabParam === "active" || tabParam === null) {
      if (tabParam === "active") setView("active");
    }
  }, [tabParam]);

  const fetchCards = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // In demo mode or when Supabase credentials are not configured, provide demo cards
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
        (typeof window !== "undefined" &&
          (document.cookie.includes("demo_session=true") ||
            localStorage.getItem("izn_demo_mode") === "true"))
      ) {
        const demoCards: CardItem[] = [
          {
            id: "demo-card-1",
            slug: "ibrahim-el-khalil",
            full_name: "Ibrahim El Khalil",
            title: "Managing Director & AI Architect",
            company: "Zyniq Solutions",
            is_published: true,
            theme: "apple-light",
            active_mode: "all",
            views_count: 1420,
            vcard_downloads_count: 384,
            created_at: new Date().toISOString(),
            template_layout: "classic-segmented",
          },
        ];
        setCards(demoCards);
        setLoading(false);
        return;
      }

      router.push("/auth");
      return;
    }

    // Active cards — fallback if is_deleted column doesn't exist yet
    let { data: active, error: activeErr } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .neq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (activeErr) {
      const retry = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      active = retry.data;
      if (retry.error) console.error("fetchCards error:", retry.error.message);
    }

    // Trashed cards
    const { data: trashed } = await supabase
      .from("cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (active) setCards(active);
    if (trashed) setTrashedCards(trashed);
    setLoading(false);
  };

  const handleDuplicateCard = async (card: CardItem) => {
    setDuplicatingId(card.id);
    const suffix = Math.random().toString(36).slice(2, 6);
    const newSlug = `${card.slug}-copy-${suffix}`;
    const {
      id: _originalId,
      created_at: _c,
      updated_at: _u,
      views_count: _v,
      vcard_downloads_count: _vd,
      ...cardData
    } = card as any;

    const duplicatePayload = {
      ...cardData,
      slug: newSlug,
      full_name: `${card.full_name} (Copy)`,
      is_published: false,
    };

    try {
      const { data: newCard, error } = await supabase
        .from("cards")
        .insert(duplicatePayload)
        .select()
        .single();

      if (!error && newCard) {
        setCards((prev) => [newCard, ...prev]);
      } else {
        const localDuplicate: CardItem = {
          ...(card as any),
          ...duplicatePayload,
          id: `card-copy-${suffix}-${Date.now()}`,
          created_at: new Date().toISOString(),
          views_count: 0,
          vcard_downloads_count: 0,
        };
        setCards((prev) => [localDuplicate, ...prev]);
      }
    } catch (e) {
      console.warn("Card duplicate fallback to local state:", e);
      const localDuplicate: CardItem = {
        ...(card as any),
        ...duplicatePayload,
        id: `card-copy-${suffix}-${Date.now()}`,
        created_at: new Date().toISOString(),
        views_count: 0,
        vcard_downloads_count: 0,
      };
      setCards((prev) => [localDuplicate, ...prev]);
    } finally {
      setDuplicatingId(null);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCopyLink = async (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.clipboard.writeText(`${origin}/${slug}`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {}
  };

  const handleChangeMode = async (id: string, newMode: string) => {
    const { error } = await supabase.from("cards").update({ active_mode: newMode }).eq("id", id);
    if (!error) setCards(cards.map((c) => (c.id === id ? { ...c, active_mode: newMode } : c)));
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Move this card to Trash?")) return;
    const { error } = await supabase.from("cards").update({ is_deleted: true }).eq("id", id);
    if (!error) {
      const card = cards.find((c) => c.id === id);
      setCards(cards.filter((c) => c.id !== id));
      if (card) setTrashedCards((prev) => [card, ...prev]);
    } else {
      const { error: hardError } = await supabase.from("cards").delete().eq("id", id);
      if (!hardError) setCards(cards.filter((c) => c.id !== id));
    }
  };

  const handleRestoreCard = async (id: string) => {
    const { error } = await supabase.from("cards").update({ is_deleted: false }).eq("id", id);
    if (!error) {
      const card = trashedCards.find((c) => c.id === id);
      setTrashedCards(trashedCards.filter((c) => c.id !== id));
      if (card) setCards((prev) => [{ ...card, is_deleted: false } as CardItem, ...prev]);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (!error) setTrashedCards(trashedCards.filter((c) => c.id !== id));
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("cards").update({ is_published: !currentStatus }).eq("id", id);
    if (!error) setCards(cards.map((c) => (c.id === id ? { ...c, is_published: !currentStatus } : c)));
  };

  const totalViews = cards.reduce((acc, c) => acc + (c.views_count || 0), 0);
  const totalDownloads = cards.reduce((acc, c) => acc + (c.vcard_downloads_count || 0), 0);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#0071E3] animate-spin" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Loading your digital passes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">My Business Cards</h1>
          <p className="text-xs sm:text-sm text-gray-500">Manage, customize, and track your active digital smart passes.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setHomescreenTarget({ type: "dashboard", title: "IZN Dashboard", url: "/dashboard" })}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-black text-xs font-bold border border-black/[0.08] shadow-2xs transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-[#34C759]" />
            <span className="truncate">Add to Home Screen</span>
          </button>

          <Link
            href="/dashboard/cards/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="truncate">Create Card</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row — only on active view */}
      {view === "active" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-[28px] bg-white border border-black/[0.06] shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#0071E3]" />
              <span>Active Cards</span>
            </span>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{cards.length}</p>
          </div>
          <div className="p-6 rounded-[28px] bg-white border border-black/[0.06] shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#34C759]" />
              <span>Total Views</span>
            </span>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{totalViews}</p>
          </div>
          <div className="p-6 rounded-[28px] bg-white border border-black/[0.06] shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#8b5cf6]" />
              <span>vCard Contacts Saved</span>
            </span>
            <p className="text-3xl font-bold text-[#1D1D1F] tracking-tight">{totalDownloads}</p>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] rounded-2xl w-fit border border-black/[0.04]">
        <button
          onClick={() => {
            setView("active");
            router.replace("/dashboard");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            view === "active"
              ? "bg-white text-[#1D1D1F] shadow-sm border border-black/[0.06]"
              : "text-gray-500 hover:text-[#1D1D1F]"
          }`}
        >
          My Cards
          {cards.length > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${view === "active" ? "bg-[#0071E3] text-white" : "bg-gray-300 text-gray-600"}`}>
              {cards.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setView("trash");
            router.replace("/dashboard?tab=trash");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            view === "trash"
              ? "bg-white text-[#1D1D1F] shadow-sm border border-black/[0.06]"
              : "text-gray-500 hover:text-[#1D1D1F]"
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Trash
          {trashedCards.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${view === "trash" ? "bg-red-500 text-white" : "bg-red-100 text-red-600"}`}>
              {trashedCards.length}
            </span>
          )}
        </button>
      </div>

      {/* ── ACTIVE CARDS VIEW ── */}
      {view === "active" && (
        <>
          {cards.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl border border-black/[0.06] shadow-sm flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-[#0071E3]" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h2 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">No digital cards yet</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create your first smart digital business card to begin contactless sharing on Apple & Android devices.
                </p>
              </div>
              <Link
                href="/dashboard/cards/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Card</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[32px] p-6 border border-black/[0.06] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-[#1D1D1F] tracking-tight truncate max-w-full">
                          {card.full_name || "Untitled Card"}
                        </h2>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          card.is_published
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {card.is_published ? "Live" : "Draft"}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-gray-500 border border-black/[0.06] uppercase tracking-wider">
                          {card.template_layout?.replace(/-/g, " ") || "Classic"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-700 truncate">{card.title || "No Title"}</p>
                      <p className="text-xs text-gray-400 truncate">{card.company || "Independent"}</p>
                    </div>

                    <button
                      onClick={() => setQrModalCard(card)}
                      className="p-3 rounded-2xl bg-[#F5F5F7] hover:bg-neutral-200 text-black transition-colors shrink-0 active:scale-95 shadow-2xs"
                      title="View QR Code"
                    >
                      <QrCode className="w-5 h-5 text-[#1D1D1F]" />
                    </button>
                  </div>

                  {/* Public Link */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] gap-2.5">
                    <span className="font-mono text-xs text-gray-600 truncate flex-1 pl-1">/{card.slug}</span>
                    <div className="flex items-center gap-1.5 shrink-0 justify-end">
                      <button
                        onClick={() => setHomescreenTarget({ type: "card", title: card.full_name, slug: card.slug })}
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-black border border-black/[0.06] text-[11px] font-bold transition shadow-2xs flex items-center gap-1"
                        title="Add to Home Screen"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span className="hidden sm:inline">Pass Shortcut</span>
                      </button>
                      <button
                        onClick={() => handleCopyLink(card.slug, card.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-black border border-black/[0.06] text-[11px] font-bold transition shadow-2xs flex items-center gap-1"
                      >
                        {copiedId === card.id ? (
                          <><Check className="w-3.5 h-3.5 text-green-600" /><span>Copied</span></>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
                        )}
                      </button>
                      <Link
                        href={`/${card.slug}`}
                        target="_blank"
                        className="p-2 rounded-xl bg-white hover:bg-neutral-100 border border-black/[0.06] text-black shadow-2xs transition"
                        title="Preview live card"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <Link
                        href={`/dashboard/cards/${card.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDuplicateCard(card)}
                        disabled={duplicatingId === card.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-neutral-200 text-black border border-black/[0.06] text-xs font-bold transition shadow-2xs disabled:opacity-50"
                        title="Duplicate Card"
                      >
                        {duplicatingId === card.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Duplicate</span>
                      </button>
                      <Link
                        href={`/dashboard/cards/${card.id}/signature`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-neutral-200 text-black border border-black/[0.06] text-xs font-bold transition shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Signature</span>
                      </Link>
                      <select
                        value={card.active_mode || "all"}
                        onChange={(e) => handleChangeMode(card.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F5F7] border border-black/[0.06] text-black hover:bg-neutral-200 transition focus:outline-none cursor-pointer"
                        title="Card Mode"
                      >
                        <option value="all">All Mode</option>
                        <option value="work">Work Mode</option>
                        <option value="social">Social Mode</option>
                      </select>
                      <button
                        onClick={() => togglePublish(card.id, card.is_published)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-black hover:bg-[#F5F5F7] transition"
                      >
                        {card.is_published ? "Unpublish" : "Publish"}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TRASH VIEW ── */}
      {view === "trash" && (
        <div className="space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold mb-0.5">Deleted Cards</p>
              <p className="text-red-600">Cards here can be restored. Permanently deleted cards cannot be recovered.</p>
            </div>
          </div>

          {trashedCards.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#F5F5F7] rounded-3xl flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Trash is empty</p>
              <button
                onClick={() => {
                  setView("active");
                  router.replace("/dashboard");
                }}
                className="text-xs font-bold text-[#0071E3] hover:underline"
              >
                Back to My Cards
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trashedCards.map((card) => (
                <div
                  key={card.id}
                  className="p-5 rounded-[24px] bg-white border border-black/[0.08] shadow-xs flex flex-col justify-between opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-[#1D1D1F] truncate mb-0.5">
                      {card.full_name || "Untitled Card"}
                    </h2>
                    <p className="text-xs font-semibold text-gray-600 truncate">{card.title || "No Title"}</p>
                    <p className="text-xs text-gray-400 truncate mb-4">{card.company || "Independent"}</p>
                  </div>
                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleRestoreCard(card.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(card.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalCard && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setQrModalCard(null)}
        >
          <div
            className="bg-white rounded-[36px] p-8 max-w-sm w-full shadow-2xl border border-black/[0.06] text-center space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-black tracking-tight">{qrModalCard.full_name}</h3>
              <p className="text-xs text-gray-400">Scan to open digital pass immediately</p>
            </div>
            <div className="p-6 bg-[#F5F5F7] rounded-3xl flex items-center justify-center border border-black/[0.04]">
              <QRCodeSVG
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/${qrModalCard.slug}`}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleCopyLink(qrModalCard.slug, qrModalCard.id)}
                className="w-full py-3.5 rounded-2xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition active:scale-95"
              >
                {copiedId === qrModalCard.id ? "Link Copied!" : "Copy Public Link"}
              </button>
              <button
                onClick={() => setQrModalCard(null)}
                className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-black transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add To Homescreen Modal */}
      {homescreenTarget && (
        <AddToHomescreenModal
          isOpen={!!homescreenTarget}
          onClose={() => setHomescreenTarget(null)}
          target={homescreenTarget}
        />
      )}
    </div>
  );
}

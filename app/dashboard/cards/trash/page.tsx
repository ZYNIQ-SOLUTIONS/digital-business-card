"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrashPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const fetchDeletedCards = async () => {
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
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCards(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedCards();
  }, []);

  const handleRestoreCard = async (id: string) => {
    const { error } = await supabase.from("cards").update({ is_deleted: false }).eq("id", id);
    if (!error) {
      setCards(cards.filter((c) => c.id !== id));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this card? This action cannot be undone.")) return;
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (!error) {
      setCards(cards.filter((c) => c.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-black/20 border-t-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Trash</h1>
      </div>

      <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start gap-3 border border-red-100">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold">Deleted Cards</p>
          <p className="mt-1">Cards in the trash can be restored. If you permanently delete them, they will be gone forever.</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-3xl flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F] mb-2">Trash is Empty</h2>
          <p className="text-sm text-gray-500 mb-6">You have no deleted cards.</p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold shadow-xs hover:bg-neutral-800 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="p-5 rounded-[24px] bg-white border border-black/[0.08] shadow-xs flex flex-col justify-between opacity-75">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#1D1D1F] truncate mb-1">
                  {card.full_name || "Untitled Card"}
                </h2>
                <p className="text-xs font-semibold text-gray-700 truncate">{card.title || "No Title Specified"}</p>
                <p className="text-xs text-gray-400 truncate mb-4">{card.company || "Independent"}</p>
              </div>

              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleRestoreCard(card.id)}
                  className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
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
  );
}

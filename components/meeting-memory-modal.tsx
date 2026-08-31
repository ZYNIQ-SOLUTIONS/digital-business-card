import React, { useState } from "react";
import { X, Save, MapPin, AlignLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MeetingMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  cardName: string;
}

export function MeetingMemoryModal({ isOpen, onClose, cardId, cardName }: MeetingMemoryModalProps) {
  const [note, setNote] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("card_connections").upsert({
        user_id: user.id,
        connected_card_id: cardId,
        meeting_note: note,
        meeting_location: location,
        last_interacted_at: new Date().toISOString()
      }, { onConflict: "user_id, connected_card_id" });
    }

    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-black/[0.04]">
          <h3 className="font-semibold text-[#1D1D1F] text-sm">Save Connection Details</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#86868B] transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-[#1D1D1F]">Memory Saved!</p>
              <p className="text-xs text-[#86868B] text-center">Context added for {cardName}. We'll remind you to reconnect.</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <p className="text-xs text-[#86868B] mb-2">
                Don't forget why you connected. Add a quick note or context about where you met.
              </p>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#86868B] uppercase mb-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Where did you meet?
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Summit Lisbon, Coffee Shop..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F5F5F7] border border-black/[0.05] rounded-xl text-xs focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[#86868B] uppercase mb-1.5">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Quick Note
                </label>
                <textarea
                  placeholder="e.g. Discussed AI agents for CRM..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F5F5F7] border border-black/[0.05] rounded-xl text-xs focus:outline-none focus:bg-white min-h-[80px]"
                />
              </div>

              <button
                type="submit"
                disabled={saving || (!note && !location)}
                className="w-full mt-2 py-3 bg-[#0071E3] hover:bg-[#0077ED] active:scale-95 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs shadow-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save to Memory"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

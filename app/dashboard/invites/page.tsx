"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Copy, Plus, Users, Link2, Check, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";

export default function InvitesPage() {
  const [inviteLinks, setInviteLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Get all invite links for this user
      const { data: links, error } = await supabase
        .from("invite_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (links) {
        // Now fetch usage counts (number of profiles with this invite code)
        // We have to loop or join. Let's do a grouped query or individual counts.
        const linksWithCounts = await Promise.all(
          links.map(async (link) => {
            const { count } = await supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("invite_code_used", link.code);
            return { ...link, usage_count: count || 0 };
          })
        );
        setInviteLinks(linksWithCounts);
      }
    }
    setLoading(false);
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const code = `ref_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from("invite_links")
        .insert({
          user_id: user.id,
          code,
          label: newLabel.trim() || "Default Invite",
        })
        .select()
        .single();
        
      if (data) {
        setInviteLinks([{ ...data, usage_count: 0 }, ...inviteLinks]);
        setNewLabel("");
      }
    }
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invite link? Users won't be able to register with it anymore.")) return;
    await supabase.from("invite_links").delete().eq("id", id);
    setInviteLinks(inviteLinks.filter((l) => l.id !== id));
  };

  const copyToClipboard = (code: string) => {
    const url = `${window.location.origin}/auth?invite=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F]">Invite Links</h1>
        <p className="text-[#86868B] text-sm mt-1">
          Generate links to invite others to the platform and track your referrals.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Create New Link</h2>
        <form onSubmit={handleGenerateLink} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#86868B] mb-1.5">Link Label (Optional)</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Twitter Campaign, Event QR Code"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] text-sm focus:outline-none focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3]"
            />
          </div>
          <button
            type="submit"
            disabled={generating}
            className="h-[42px] px-5 rounded-xl bg-[#0071E3] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#0077ED] transition disabled:opacity-50"
          >
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate Link
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/[0.08]">
          <h2 className="text-lg font-semibold text-[#1D1D1F]">Your Links</h2>
        </div>
        
        {loading ? (
          <div className="p-10 flex justify-center">
            <RefreshCw className="w-6 h-6 text-[#86868B] animate-spin" />
          </div>
        ) : inviteLinks.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Link2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No invite links yet</p>
            <p className="text-sm text-gray-400 mt-1">Generate your first link above to start inviting.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.08] bg-gray-50/50">
                  <th className="px-6 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Label</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider">Registrations</th>
                  <th className="px-6 py-3 text-xs font-semibold text-[#86868B] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.08]">
                {inviteLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#1D1D1F]">{link.label}</div>
                      <div className="text-xs text-[#86868B]">{new Date(link.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#0071E3] font-mono">.../auth?invite={link.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-[#1D1D1F]">
                        <Users className="w-4 h-4 text-[#86868B]" />
                        {link.usage_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(link.code)}
                          className="p-2 text-gray-500 hover:text-[#0071E3] hover:bg-blue-50 rounded-lg transition"
                          title="Copy Link"
                        >
                          {copiedCode === link.code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

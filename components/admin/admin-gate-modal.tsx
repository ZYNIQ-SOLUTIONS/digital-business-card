"use client";

import React, { useState } from "react";
import { Shield, KeyRound, ArrowRight, ChevronLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { claimAdminRole } from "@/app/admin/admin-auth-action";

export function AdminGateModal({ userEmail }: { userEmail: string }) {
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await claimAdminRole(passcode);
      if (res.error) {
        setError(res.error);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#0d0d16] border border-white/[0.08] rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#6366f1]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Super Admin Verification</h1>
            <p className="text-[11px] text-gray-500 font-mono">Restricted Access Control</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-xs">
          <p className="text-gray-400">Signed in as:</p>
          <p className="text-white font-mono font-semibold truncate">{userEmail || "Authenticated User"}</p>
          <div className="pt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-amber-400 font-medium">Role: Standard Member (Admin role required)</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-400 block">
              Enter Admin Key or Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin security key..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#6366f1] text-xs text-white placeholder-gray-600 focus:outline-none transition font-mono pr-10"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:brightness-110 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying Privileges...</span>
            ) : (
              <>
                <span>Unlock Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-center">
          <Link
            href="/dashboard"
            className="text-xs text-gray-500 hover:text-white transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Return to User Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminGateModal;

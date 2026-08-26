"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CreditCard, 
  Sparkles, 
  Plus, 
  LogOut, 
  Settings, 
  ExternalLink,
  ChevronRight,
  User,
  LayoutDashboard
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans selection:bg-[#0071E3] selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0071E3] to-[#5856D6] p-0.5 shadow-xs flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0071E3]" />
                </div>
              </div>
              <span className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
                Digital Card Studio
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                pathname === "/dashboard"
                  ? "bg-black text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
              }`}
            >
              My Cards
            </Link>

            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

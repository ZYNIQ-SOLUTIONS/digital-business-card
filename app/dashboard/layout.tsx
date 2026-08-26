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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 group min-h-[44px]">
              <div className="logo-sync-container relative">
                <svg width="28" height="28" viewBox="0 0 200 200" className="logo-sync">
                  <path className="half half-top" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeLinecap="round"/>
                  <path className="half half-bot" d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#ec4899" strokeWidth="12" strokeLinecap="round"/>
                  <circle className="core-node" cx="100" cy="100" r="15" fill="#1D1D1F"/>
                </svg>
              </div>
              <span className="font-display text-[17px] font-semibold tracking-tight text-[#1D1D1F] hidden sm:block">
                IZN
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`px-4 py-2 min-h-[44px] flex items-center rounded-full text-[15px] font-medium transition ${
                pathname === "/dashboard"
                  ? "bg-black text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
              }`}
            >
              My Cards
            </Link>

            <Link
              href="/dashboard/connections"
              className={`px-4 py-2 min-h-[44px] flex items-center rounded-full text-[15px] font-medium transition hidden md:flex ${
                pathname === "/dashboard/connections"
                  ? "bg-black text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
              }`}
            >
              Connections
            </Link>

            <Link
              href="/dashboard/enterprise"
              className={`px-4 py-2 min-h-[44px] flex items-center rounded-full text-[15px] font-medium transition hidden md:flex ${
                pathname === "/dashboard/enterprise"
                  ? "bg-black text-white"
                  : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04]"
              }`}
            >
              Enterprise
            </Link>

            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[15px] font-medium shadow-sm active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Card</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#86868B] hover:text-red-600 hover:bg-red-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
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

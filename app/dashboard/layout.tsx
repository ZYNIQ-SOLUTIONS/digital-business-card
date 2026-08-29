"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  LogOut, 
  
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
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 flex flex-col font-sans selection:bg-white selection:text-gray-900">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 group min-h-[40px]">
              <svg id="logo-light" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
                <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <circle cx="100" cy="100" r="12" fill="#0f172a" />
              </svg>
              <span className="font-display text-[15px] font-semibold tracking-tight text-neutral-900 hidden sm:block">
                IZN
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 min-h-[36px] flex items-center rounded-md text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-gray-400 hover:text-neutral-900 hover:bg-neutral-100/50"
              }`}
            >
              My Cards
            </Link>

            <Link
              href="/dashboard/connections"
              className={`px-3 py-1.5 min-h-[36px] flex items-center rounded-md text-sm font-medium transition-colors hidden md:flex ${
                pathname === "/dashboard/connections"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-gray-400 hover:text-neutral-900 hover:bg-neutral-100/50"
              }`}
            >
              Connections
            </Link>

            <Link
              href="/dashboard/enterprise"
              className={`px-3 py-1.5 min-h-[36px] flex items-center rounded-md text-sm font-medium transition-colors hidden md:flex ${
                pathname === "/dashboard/enterprise"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-gray-400 hover:text-neutral-900 hover:bg-neutral-100/50"
              }`}
            >
              Enterprise
            </Link>

            <Link
              href="/store"
              className={`px-3 py-1.5 min-h-[36px] flex items-center rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/store")
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "text-gray-500 hover:text-neutral-900 hover:bg-neutral-100/50"
              }`}
            >
              Store
            </Link>

            <div className="w-[1px] h-4 bg-neutral-200 mx-1 hidden sm:block" />

            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-neutral-900/20 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>New Card</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
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

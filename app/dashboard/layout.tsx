"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  LogOut, 
  Menu,
  X,
  CreditCard,
  Users,
  Building2,
  ShoppingBag,
  ExternalLink
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/dashboard", label: "My Cards", icon: CreditCard, active: pathname === "/dashboard" },
    { href: "/dashboard/connections", label: "Connections", icon: Users, active: pathname === "/dashboard/connections" },
    { href: "/dashboard/enterprise", label: "Enterprise", icon: Building2, active: pathname === "/dashboard/enterprise" },
    { href: "/store", label: "Store", icon: ShoppingBag, active: pathname.startsWith("/store") },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col font-sans selection:bg-[#0071E3]/20 selection:text-black antialiased">
      
      {/* Apple Cupertino Frosted Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-black/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group min-h-[44px]">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#0071E3" strokeWidth="14" strokeLinecap="round" />
                <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#34C759" strokeWidth="14" strokeLinecap="round" />
                <circle cx="100" cy="100" r="14" fill="#1D1D1F" />
              </svg>
              <span className="font-bold text-base tracking-tight text-[#1D1D1F]">
                IZN
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F7] p-1 rounded-2xl border border-black/[0.04]">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  item.active
                    ? "bg-white text-black shadow-xs"
                    : "text-gray-500 hover:text-black hover:bg-white/50"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Action Bar (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/dashboard/cards/new"
              className="inline-flex items-center justify-center p-2 min-h-[40px] min-w-[40px] rounded-xl bg-black text-white text-xs font-bold shadow-xs active:scale-95"
              aria-label="Create New Card"
            >
              <Plus className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-[#F5F5F7] text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-black/30 backdrop-blur-xs md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="bg-white border-b border-black/[0.06] shadow-2xl p-4 flex flex-col gap-2 rounded-b-[28px] max-h-[calc(100vh-64px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-2xl flex items-center gap-3 text-sm font-semibold transition-colors ${
                    item.active
                      ? "bg-[#F5F5F7] text-black"
                      : "text-gray-600 hover:text-black hover:bg-[#F5F5F7]/50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active ? 'bg-white shadow-2xs text-[#0071E3]' : 'bg-[#F5F5F7] text-gray-500'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="h-[1px] bg-black/[0.06] my-2" />

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                disabled={isSigningOut}
                className="w-full p-3 flex items-center gap-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Surface */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

    </div>
  );
}

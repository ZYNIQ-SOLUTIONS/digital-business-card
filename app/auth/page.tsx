"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignInWithMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please verify your Supabase configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col items-center justify-center p-4 relative selection:bg-[#0071E3] selection:text-white font-sans">
      {/* Apple Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none blur-3xl" />

      {/* Back to Home Link */}
      <div className="w-full max-w-sm mb-4 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Apple Auth Card */}
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-black/[0.08] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] z-10 space-y-6">
        
        {/* App Emblem / Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#0071E3] to-[#5856D6] p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#0071E3]" />
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">
            {isSuccess ? "Check Your Inbox" : "Sign In to Your Card"}
          </h1>
          <p className="text-xs text-[#86868B] leading-relaxed">
            {isSuccess
              ? `We sent a magic sign-in link to ${email}`
              : "Passwordless, instant access. Enter your email to receive a secure sign-in link."}
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-50 border border-green-200/80 flex items-center justify-center text-[#34C759]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <p className="text-xs text-[#1D1D1F] bg-neutral-50 p-3.5 rounded-2xl border border-black/[0.04]">
              Click the link in your email to instantly enter your dashboard. First time users will be guided through creating their first digital business card.
            </p>

            <button
              onClick={() => setIsSuccess(false)}
              className="text-xs text-[#0071E3] font-medium hover:underline pt-2"
            >
              Use a different email address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignInWithMagicLink} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5 pl-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ibrahim El Khalil"
                className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5 pl-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-3 pl-10 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white transition"
                />
                <Mail className="w-4 h-4 text-[#86868B] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs leading-tight">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Magic Link...</span>
                </>
              ) : (
                <>
                  <span>Continue with Email</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#86868B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Zero passwords • End-to-end encrypted link</span>
        </div>
      </div>
    </main>
  );
}

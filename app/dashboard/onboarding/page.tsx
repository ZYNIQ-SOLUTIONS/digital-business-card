"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  User, 
  Briefcase, 
  Globe, 
  Phone, 
  Mail, 
  Share2, 
  Loader2 
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    company: "",
    slug: "",
    phonePrimary: "",
    emailWork: "",
    websitePrimary: "https://",
    tagline: "",
    bio: "",
    whatsapp: "",
    linkedin: "",
  });

  const handleNameChange = (name: string) => {
    // Automatically propose a clean URL slug based on the name
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      fullName: name,
      slug: prev.slug === "" || prev.slug.startsWith(generatedSlug.slice(0, 3)) ? generatedSlug : prev.slug,
    }));
  };

  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create your business card.");
      }

      // Compute avatar initials
      const names = formData.fullName.trim().split(" ");
      const avatarInitials = names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase() 
        : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

      // Construct socials JSON
      const socialsList = [
        {
          id: "linkedin",
          name: "LinkedIn",
          category: "Professional",
          url: formData.linkedin ? (formData.linkedin.startsWith("http") ? formData.linkedin : `https://linkedin.com/in/${formData.linkedin}`) : "https://linkedin.com/in/",
          username: formData.linkedin || "",
          active: true,
        },
        {
          id: "whatsapp",
          name: "WhatsApp",
          category: "Direct Chat",
          url: formData.whatsapp ? `https://wa.me/${formData.whatsapp.replace(/[^0-9]/g, "")}` : "",
          username: formData.whatsapp || "",
          active: !!formData.whatsapp,
        },
      ];

      const newCard = {
        user_id: user.id,
        slug: formData.slug || `card-${Date.now().toString(36)}`,
        is_published: true,
        theme: "apple-light",
        full_name: formData.fullName || "My Digital Card",
        avatar_initials: avatarInitials,
        title: formData.title || "Founder / Executive",
        company: formData.company || "Company",
        tagline: formData.tagline || "Connecting & building innovative solutions.",
        bio: formData.bio || "",
        phone_primary: formData.phonePrimary || "",
        email_work: formData.emailWork || user.email || "",
        website_primary: formData.websitePrimary || "https://",
        socials: socialsList,
        skills: ["Strategy", "Leadership", "Technology"],
      };

      const { data, error } = await supabase
        .from("cards")
        .insert(newCard)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("This custom URL slug is already taken. Please choose another username/slug.");
        }
        throw new Error(error.message);
      }

      // Route directly to the new card public page or dashboard
      router.push(`/dashboard?created=true`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create business card.";
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10">
      {/* Progress Steps Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0071E3] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>First-Time Setup Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
          Create Your Digital Smart Card
        </h1>
        <p className="text-xs text-[#86868B]">
          Step {step} of 3 • Takes less than 60 seconds
        </p>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-[#0071E3]"
                  : s < step
                  ? "w-4 bg-[#34C759]"
                  : "w-4 bg-neutral-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-6">
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: IDENTITY & ROLE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Ibrahim El Khalil"
                className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Founder & AI Architect"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  Company / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. ZYNIQ"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                Your Public Card URL Slug *
              </label>
              <div className="flex items-center rounded-2xl bg-[#F5F5F7] border border-black/[0.05] px-3.5 py-1 focus-within:ring-2 focus-within:ring-[#0071E3]/20 focus-within:bg-white">
                <span className="text-xs text-[#86868B] font-mono select-none">
                  card.app/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                  placeholder="ibrahim"
                  className="w-full py-2 bg-transparent text-xs text-[#1D1D1F] font-mono focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-[#86868B] pl-1 pt-1 block">
                This will be your shareable URL: domain.com/{formData.slug || "your-name"}
              </span>
            </div>

            <button
              type="button"
              disabled={!formData.fullName || !formData.title || !formData.company}
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
            >
              <span>Next: Contact Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: CONTACT DETAILS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phonePrimary}
                  onChange={(e) => setFormData({ ...formData, phonePrimary: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={formData.emailWork}
                  onChange={(e) => setFormData({ ...formData, emailWork: e.target.value })}
                  placeholder="ibrahim@company.com"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                Website
              </label>
              <input
                type="text"
                value={formData.websitePrimary}
                onChange={(e) => setFormData({ ...formData, websitePrimary: e.target.value })}
                placeholder="https://zyniq.solutions"
                className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="e.g. +15550192834"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                  LinkedIn Username / URL
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="e.g. ibrahim-el-khalil"
                  className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1D1D1F]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-3 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Next: Bio &amp; Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BIO & INSTANT PUBLISH */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                Short Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Architecting enterprise AI and cloud systems."
                className="w-full px-3.5 py-3 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 pl-1">
                Executive Bio (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share a brief overview of your background, achievements, or mission..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F5F5F7] border border-black/[0.05] text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:bg-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-green-50 border border-green-200/80 flex items-start gap-2.5 text-xs text-green-900">
              <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">All Set for Launch!</span>
                <span>Your card will be generated with a live vCard QR Code, Apple Wallet pass, and PWA capabilities.</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#1D1D1F]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleFinishOnboarding}
                className="w-2/3 py-3.5 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Smart Card...</span>
                  </>
                ) : (
                  <>
                    <span>Publish &amp; View Card</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

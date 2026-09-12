"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus } from "lucide-react";
import { LeaveFeedbackModal } from "./leave-feedback-modal";

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  avatar: string;
  fallbackName: string;
  href?: string;
  is_approved?: boolean;
}

export const CURATED_ROW_1: TestimonialItem[] = [
  {
    id: "faisal",
    quote: "Tapped my IZN metal card at the Dubai AI Summit. 40+ verified connections synced straight into my contacts before I even left the venue. Pure magic.",
    author: "@faisal_alnuaimi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Faisal Al Nuaimi",
    href: "https://x.com",
  },
  {
    id: "sarah",
    quote: "Having my card live in Apple Wallet changed everything. Never caught empty-handed, and when my title changed last week, all my distributed passes updated in real time.",
    author: "@sarah_chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Sarah Chen",
    href: "https://x.com",
  },
  {
    id: "marcus",
    quote: "Replaced 5,000 paper cards across our 120-person enterprise sales team. Fleet setup took 15 minutes, and our post-meeting lead capture jumped 320%.",
    author: "@marcus_vance",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Marcus Vance",
    href: "https://x.com",
  },
  {
    id: "tariq",
    quote: "The reaction when you tap matte black aerospace aluminum to someone's phone is unforgettable. The hardware craftsmanship matches the digital elegance.",
    author: "@tariq_design",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Tariq Hashemi",
    href: "https://x.com",
  },
  {
    id: "elena",
    quote: "The embedded calendar booking right on my public card has converted more investor intros into actual meetings than my assistant could manage in a week.",
    author: "@elena_rostova",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Elena Rostova",
    href: "https://x.com",
  },
  {
    id: "khalid",
    quote: "The AI business card scanner is ridiculous. Snapped photos of 80 paper cards at GITEX, extracted every field perfectly, and drafted follow-ups in seconds.",
    author: "@khalid_tech",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Khalid Mansoor",
    href: "https://x.com",
  },
  {
    id: "lisa",
    quote: "No app required for the recipient is the killer feature. Just a tap, Safari opens, and one click adds me to their native address book. Zero friction.",
    author: "@lisa_nordic",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Lisa Lindqvist",
    href: "https://x.com",
  },
  {
    id: "alex",
    quote: "We plugged the CRM webhook directly into our HubSpot instance. Every handshake at conferences is automatically logged as an executive lead.",
    author: "@alex_reid",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Alex Reid",
    href: "https://x.com",
  },
];

export const CURATED_ROW_2: TestimonialItem[] = [
  {
    id: "zayd",
    quote: "Ordered the 24K mirror gold edition. Delivered to my DIFC office in under 24 hours. The weight, laser precision, and instant NFC response are world-class.",
    author: "@zayd_mansoor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Zayd Al-Mansoor",
    href: "https://x.com",
  },
  {
    id: "maya",
    quote: "The day/night contextual modes are brilliant. At business lunches it shows my corporate bio and booking calendar; at evening galas it switches to my social profile.",
    author: "@maya_patel",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Maya Patel",
    href: "https://x.com",
  },
  {
    id: "omar",
    quote: "I haven't carried paper cards in 8 months. People literally ask me where I got this within 30 seconds of meeting. It's the ultimate executive icebreaker.",
    author: "@omar_haddad",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Omar Haddad",
    href: "https://x.com",
  },
  {
    id: "jessica",
    quote: "Enterprise onboarding with CSV upload took under two minutes for our entire team. Revoking access when contractors rotate off is just one click.",
    author: "@jessica_m",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Jessica Miller",
    href: "https://x.com",
  },
  {
    id: "rashid",
    quote: "The biometric AI verification badge gives instant credibility when meeting cross-border partners. You know immediately that you're connecting with the real principal.",
    author: "@rashid_dxb",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Rashid Falasi",
    href: "https://x.com",
  },
  {
    id: "nour",
    quote: "The custom themes allowed us to preserve our exact corporate hex palette, typography, and logo styling across every executive pass. Impeccable attention to detail.",
    author: "@nour_elias",
    avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Nour Elias",
    href: "https://x.com",
  },
  {
    id: "david",
    quote: "Over 1,200 taps tracked on my dashboard this quarter with rich analytics on which links get clicked most. You can't get that data with paper cards.",
    author: "@david_k",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&auto=format&fit=crop&q=80",
    fallbackName: "David Kim",
    href: "https://x.com",
  },
  {
    id: "samir",
    quote: "Every founder pitching me should have this. It signals you understand modern efficiency, sustainability, and design before you even open your deck.",
    author: "@samir_capital",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&auto=format&fit=crop&q=80",
    fallbackName: "Samir Kassam",
    href: "https://x.com",
  },
];

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="testimonial-card group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.avatar}
        alt={item.author}
        className="testimonial-avatar"
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            item.fallbackName || item.author.replace(/^@/, "")
          )}&background=10b981&color=fff&size=88`;
        }}
      />
      <div className="testimonial-content">
        <p className="testimonial-quote">
          &ldquo;{item.quote}&rdquo;
        </p>
        <span className="testimonial-author">{item.author}</span>
      </div>
    </div>
  );
}

export function TestimonialsMarquee() {
  const [row1, setRow1] = useState<TestimonialItem[]>(CURATED_ROW_1);
  const [row2, setRow2] = useState<TestimonialItem[]>(CURATED_ROW_2);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch newly approved testimonials from Supabase via API
  useEffect(() => {
    async function loadApproved() {
      try {
        const res = await fetch("/api/testimonials");
        if (!res.ok) return;
        const data = await res.json();
        const approved: any[] = data.testimonials || [];

        if (approved.length > 0) {
          const approvedItems: TestimonialItem[] = approved.map((t) => ({
            id: t.id,
            quote: t.quote,
            author: t.author,
            avatar: t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=10b981&color=fff&size=88`,
            fallbackName: t.name,
            href: "https://x.com",
            is_approved: true,
          }));

          // Split approved into row1 and row2
          const half = Math.ceil(approvedItems.length / 2);
          const newRow1 = [...approvedItems.slice(0, half), ...CURATED_ROW_1];
          const newRow2 = [...approvedItems.slice(half), ...CURATED_ROW_2];
          setRow1(newRow1);
          setRow2(newRow2);
        }
      } catch {
        // Keeps curated fallbacks intact
      }
    }
    loadApproved();
  }, []);

  // Duplicated arrays guarantee seamless continuous loop with translateX(-50%)
  const row1Items = [...row1, ...row1];
  const row2Items = [...row2, ...row2];

  return (
    <>
      <section className="w-full py-8 md:py-12 overflow-hidden border-y border-white/[0.06] bg-[#050507]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          {/* Section Header matching OpenClaw style */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <h2 className="font-mono text-[12px] md:text-[13px] uppercase tracking-[0.14em] font-semibold text-[#10b981]">
                What People Say
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="font-mono text-[11px] font-semibold text-gray-300 hover:text-white px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] transition inline-flex items-center gap-1.5 active:scale-95"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#10b981]" />
                <span>Share Feedback</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dual Row Marquee Track */}
        <div className="testimonials-track w-full">
          {/* Row 1 - scrolling left */}
          <div
            className="testimonials-row row-1"
            style={{ "--duration": "72s" } as React.CSSProperties}
          >
            {row1Items.map((item, idx) => (
              <TestimonialCard key={`row1-${item.id}-${idx}`} item={item} />
            ))}
          </div>

          {/* Row 2 - scrolling right */}
          <div
            className="testimonials-row row-2"
            style={{ "--duration": "80s" } as React.CSSProperties}
          >
            {row2Items.map((item, idx) => (
              <TestimonialCard key={`row2-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Leave Feedback Modal */}
      <LeaveFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default TestimonialsMarquee;

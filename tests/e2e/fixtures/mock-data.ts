export interface MockCard {
  id: string;
  slug: string;
  full_name: string;
  avatar_initials?: string;
  title: string;
  company: string;
  tagline?: string;
  bio: string;
  avatar_url?: string;
  theme: string;
  active_mode: string;
  is_published: boolean;
  is_verified?: boolean;
  verification_badge?: string;
  views_count: number;
  vcard_downloads_count: number;
  wallet_downloads_count: number;
  email_work?: string;
  phone_primary?: string;
  phone_work?: string;
  website_primary?: string;
  portfolio_url?: string;
  template_layout: string;
  office_address?: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  skills?: string[];
  booking_enabled?: boolean;
  booking_title?: string;
  booking_days?: string[];
  booking_start_time?: string;
  booking_end_time?: string;
  booking_slot_duration?: number;
  socials: Array<{
    id: string;
    name: string;
    url: string;
    active: boolean;
    category?: string;
  }>;
  modes?: Array<{
    id: string;
    name: string;
    active: boolean;
    profileOverrides?: Record<string, any>;
  }>;
  is_private?: boolean;
  pin_code?: string;
  is_deleted?: boolean;
  created_at?: string;
  user_id?: string;
}

export const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";

export const MOCK_PUBLIC_CARD: MockCard = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "alex-morgan",
  full_name: "Alex Morgan",
  avatar_initials: "AM",
  title: "Chief Technology Officer",
  company: "Nexus Innovations",
  tagline: "Architecting decentralized intelligence and cloud-scale systems.",
  bio: "Veteran technologist with over 15 years experience architecting cloud infrastructure and high-throughput systems.",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  theme: "apple-light",
  active_mode: "all",
  is_published: true,
  is_verified: true,
  views_count: 42,
  vcard_downloads_count: 10,
  wallet_downloads_count: 5,
  email_work: "alex.morgan@nexus.io",
  phone_primary: "+1 (555) 234-5678",
  phone_work: "+1 (555) 234-5678",
  website_primary: "https://nexus.io",
  portfolio_url: "https://nexus.io/projects",
  template_layout: "classic-segmented",
  office_address: {
    street: "100 Pine Street, Suite 2400",
    city: "San Francisco",
    region: "CA",
    postalCode: "94111",
    country: "United States",
  },
  skills: ["Distributed Systems", "TypeScript", "Cloud Architecture", "Next.js"],
  booking_enabled: true,
  booking_title: "30-Min Strategy Call with Alex Morgan",
  booking_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  booking_start_time: "09:00",
  booking_end_time: "17:00",
  booking_slot_duration: 30,
  socials: [
    { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/in/alexmorgan", active: true },
    { id: "github", name: "GitHub", url: "https://github.com/alexmorgan", active: true },
    { id: "x", name: "X", url: "https://x.com/alexmorgan", active: true },
    { id: "instagram", name: "Instagram", url: "https://instagram.com/alexmorgan", active: true },
    { id: "whatsapp", name: "WhatsApp", url: "https://wa.me/15552345678", active: true },
    { id: "tiktok", name: "TikTok", url: "https://tiktok.com/@alexmorgan", active: true },
  ],
  modes: [
    {
      id: "work",
      name: "Work",
      active: true,
      profileOverrides: {
        active_mode: "work",
      },
    },
    {
      id: "social",
      name: "Social",
      active: true,
      profileOverrides: {
        active_mode: "social",
      },
    },
  ],
  user_id: TEST_USER_ID,
  created_at: "2026-01-01T00:00:00Z",
};

export const MOCK_PRIVATE_CARD: MockCard = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "private-card",
  full_name: "Elena Rostova",
  avatar_initials: "ER",
  title: "Principal Cryptographer",
  company: "CyberLock Labs",
  bio: "Specializing in zero-knowledge proofs and secure identity verification protocols.",
  theme: "apple-light",
  active_mode: "all",
  is_published: true,
  is_private: true,
  pin_code: "1234",
  views_count: 7,
  vcard_downloads_count: 2,
  wallet_downloads_count: 0,
  template_layout: "classic-segmented",
  socials: [
    { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/in/elenarostova", active: true },
    { id: "github", name: "GitHub", url: "https://github.com/elenarostova", active: true },
  ],
  user_id: TEST_USER_ID,
  created_at: "2026-01-02T00:00:00Z",
};

export const MOCK_TRASHED_CARD: MockCard = {
  id: "33333333-3333-4333-8333-333333333333",
  slug: "archived-identity",
  full_name: "Archived Identity",
  avatar_initials: "AI",
  title: "Former VP Engineering",
  company: "Legacy Systems Inc",
  bio: "Archived historical profile card.",
  theme: "apple-light",
  active_mode: "all",
  is_published: false,
  is_deleted: true,
  views_count: 120,
  vcard_downloads_count: 14,
  wallet_downloads_count: 3,
  template_layout: "classic-segmented",
  socials: [
    { id: "linkedin", name: "LinkedIn", url: "https://linkedin.com/in/legacy", active: true },
  ],
  user_id: TEST_USER_ID,
  created_at: "2025-10-01T00:00:00Z",
};

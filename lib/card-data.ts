export interface SocialLink {
  id: string;
  name: string;
  category: "Professional" | "Direct Chat" | "Social" | "Code & Dev" | "Media & Content" | "Booking";
  url: string;
  username: string;
  active: boolean;
}


export interface CardMode {
  id: string;
  name: string;
  active: boolean;
  profileOverrides: Partial<BusinessCardProfile>;
}

export interface TemporaryLayer {
  id: string;
  type: 'phone' | 'offer' | 'address' | 'link';
  label: string;
  value: string;
  expiresAt: string;
}

export interface CryptoIdentity {
  walletAddress: string;
  signature: string;
  message: string;
  verifiedAt: string;
}

export interface BusinessCardProfile {
  avatar_id?: string;
  customFields?: { label: string; value: string }[];
  videoUrl?: string;
  whiteLabel?: boolean;
  isPrivate?: boolean;
  pinCode?: string;
  personal: {
    fullName: string;
    preferredName?: string;
    prefix?: string;
    pronouns?: string;
    avatarInitials: string;
    avatarImageUrl?: string;
    tagline: string;
    bio: string;
    bioAr?: string;
    icebreakers?: string[];
  };
  professional: {
    title: string;
    titleAr?: string;
    company: string;
    department?: string;
    industry: string;
    workLocation: string; // e.g., "Dubai & San Francisco (Global Remote)"
    skills: string[];
    yearsOfExperience?: string;
  };
  contact: {
    phonePrimary: string;
    phoneSecondary?: string;
    emailWork: string;
    emailPersonal?: string;
    websitePrimary: string;
    portfolioUrl?: string;
    officeAddress?: {
      street: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    };
  };
  actions: {
    enableAppleWallet: boolean;
    enableGoogleWallet?: boolean;
    enableDirectVCard: boolean;
    enableShareModal: boolean;
    enableNfcInstruction: boolean;
    bookingUrl?: string;
  };
  socials: SocialLink[];
  contextModes?: CardMode[];
  temporaryLayers?: TemporaryLayer[];
  cryptoIdentity?: CryptoIdentity;
}

export const defaultProfile: BusinessCardProfile = {
  personal: {
    fullName: "Ibrahim El Khalil",
    preferredName: "Ibrahim",
    prefix: "Eng.",
    pronouns: "he/him",
    avatarInitials: "IK",
    tagline: "Architecting autonomous intelligence & high-throughput neural systems.",
    bio: "AI Architect and Entrepreneur specialized in building enterprise generative models, agentic workflows, and distributed cloud computing systems. Passionate about solving complex scaling problems and pioneering AI architectures.",
  },
  professional: {
    title: "Founder & Chief AI Architect",
    company: "ZYNIQ",
    department: "Executive & AI Research",
    industry: "Artificial Intelligence & Software Systems",
    workLocation: "San Francisco, CA & Remote Global",
    skills: [
      "Enterprise AI Architecture",
      "Agentic Systems",
      "Distributed Cloud",
      "LLM Infrastructure",
      "Full-Stack Engineering",
    ],
    yearsOfExperience: "10+ Years",
  },
  contact: {
    phonePrimary: "+1 (555) 019-2834",
    emailWork: "ibrahim@zyniq.solutions",
    emailPersonal: "contact@zyniq.solutions",
    websitePrimary: "https://zyniq.solutions",
    portfolioUrl: "https://zyniq.solutions/research",
    officeAddress: {
      street: "500 Howard Street, Suite 400",
      city: "San Francisco",
      region: "CA",
      postalCode: "94105",
      country: "United States",
    },
  },
  actions: {
    enableAppleWallet: true,
    enableGoogleWallet: true,
    enableDirectVCard: true,
    enableShareModal: true,
    enableNfcInstruction: true,
    bookingUrl: "https://calendly.com/",
  },
  socials: [
    {
      id: "linkedin",
      name: "LinkedIn",
      category: "Professional",
      url: "https://linkedin.com/in/",
      username: "ibrahim-el-khalil",
      active: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      category: "Direct Chat",
      url: "https://wa.me/15550192834",
      username: "+1 (555) 019-2834",
      active: true,
    },
    {
      id: "telegram",
      name: "Telegram",
      category: "Direct Chat",
      url: "https://t.me/",
      username: "@ibrahim_zyniq",
      active: true,
    },
    {
      id: "x",
      name: "X (Twitter)",
      category: "Professional",
      url: "https://x.com/",
      username: "@ibrahim_ai",
      active: true,
    },
    {
      id: "github",
      name: "GitHub",
      category: "Code & Dev",
      url: "https://github.com/",
      username: "ibrahim-zyniq",
      active: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      category: "Social",
      url: "https://instagram.com/",
      username: "@ibrahim.khalil",
      active: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      category: "Media & Content",
      url: "https://youtube.com/@",
      username: "ZYNIQ AI Talks",
      active: true,
    },
    {
      id: "discord",
      name: "Discord",
      category: "Direct Chat",
      url: "https://discord.gg/",
      username: "ibrahim#0001",
      active: true,
    },
    {
      id: "calendly",
      name: "Book Call",
      category: "Booking",
      url: "https://calendly.com/",
      username: "30-min Strategy",
      active: true,
    },
    {
      id: "medium",
      name: "Medium",
      category: "Media & Content",
      url: "https://medium.com/@",
      username: "@ibrahim_ai",
      active: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      category: "Media & Content",
      url: "https://tiktok.com/@",
      username: "@ibrahim.tech",
      active: true,
    },
    {
      id: "threads",
      name: "Threads",
      category: "Social",
      url: "https://threads.net/@",
      username: "@ibrahim.khalil",
      active: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      category: "Social",
      url: "https://facebook.com/",
      username: "ibrahim.khalil",
      active: false,
    },
    {
      id: "spotify",
      name: "Spotify",
      category: "Media & Content",
      url: "https://open.spotify.com/user/",
      username: "Ibrahim Playlist",
      active: false,
    },
    {
      id: "behance",
      name: "Behance",
      category: "Code & Dev",
      url: "https://behance.net/",
      username: "ibrahim_designs",
      active: false,
    },
    {
      id: "dribbble",
      name: "Dribbble",
      category: "Code & Dev",
      url: "https://dribbble.com/",
      username: "ibrahim_ui",
      active: false,
    },
    {
      id: "substack",
      name: "Substack",
      category: "Media & Content",
      url: "https://substack.com/@",
      username: "AI Weekly Insights",
      active: false,
    },
    {
      id: "signal",
      name: "Signal",
      category: "Direct Chat",
      url: "https://signal.me/#p/",
      username: "+1 (555) 019-2834",
      active: false,
    },
  ],
};

/**
 * Generate standard RFC vCard 3.0 string dynamically from profile
 */
export function generateVCardString(profile: BusinessCardProfile): string {
  const { personal, professional, contact, socials } = profile;
  
  const socialLines = socials
    .filter((s) => s.active && s.url)
    .map((s) => `X-SOCIALPROFILE;type=${s.id}:${s.url}`)
    .join("\n");

  const addressLine = contact.officeAddress
    ? `ADR;TYPE=WORK:;;${contact.officeAddress.street};${contact.officeAddress.city};${contact.officeAddress.region};${contact.officeAddress.postalCode};${contact.officeAddress.country}`
    : "";

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${personal.fullName}`,
    `N:${personal.fullName.split(" ").slice(1).join(" ")};${personal.fullName.split(" ")[0]};;;`,
    `ORG:${professional.company};${professional.department || ""}`,
    `TITLE:${professional.title}`,
    `TEL;TYPE=CELL,VOICE,PREF:${contact.phonePrimary}`,
    contact.phoneSecondary ? `TEL;TYPE=WORK,VOICE:${contact.phoneSecondary}` : "",
    `EMAIL;TYPE=INTERNET,WORK,PREF:${contact.emailWork}`,
    contact.emailPersonal ? `EMAIL;TYPE=INTERNET,HOME:${contact.emailPersonal}` : "",
    `URL;TYPE=WORK:${contact.websitePrimary}`,
    contact.portfolioUrl ? `URL;TYPE=PORTFOLIO:${contact.portfolioUrl}` : "",
    addressLine,
    `NOTE:${personal.tagline} | Skills: ${professional.skills.join(", ")}`,
    socialLines,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

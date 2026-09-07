const http = require("http");
const { URL } = require("url");

const PORT = 54321;
const TEST_USER_ID = "00000000-0000-4000-8000-000000000001";

const MOCK_PUBLIC_CARD = {
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
      profileOverrides: { active_mode: "work" },
    },
    {
      id: "social",
      name: "Social",
      active: true,
      profileOverrides: { active_mode: "social" },
    },
  ],
  user_id: TEST_USER_ID,
  created_at: "2026-01-01T00:00:00Z",
};

const MOCK_PRIVATE_CARD = {
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

const MOCK_TRASHED_CARD = {
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

let cards = [
  JSON.parse(JSON.stringify(MOCK_PUBLIC_CARD)),
  JSON.parse(JSON.stringify(MOCK_PRIVATE_CARD)),
  JSON.parse(JSON.stringify(MOCK_TRASHED_CARD)),
];

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Range, Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  if (pathname === "/__health") {
    res.statusCode = 200;
    res.end("OK");
    return;
  }

  if (pathname === "/__shutdown") {
    res.statusCode = 200;
    res.end("SHUTTING_DOWN");
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 100);
    return;
  }

  if (pathname === "/__reset") {
    cards = [
      JSON.parse(JSON.stringify(MOCK_PUBLIC_CARD)),
      JSON.parse(JSON.stringify(MOCK_PRIVATE_CARD)),
      JSON.parse(JSON.stringify(MOCK_TRASHED_CARD)),
    ];
    res.statusCode = 200;
    res.end("RESET");
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      // 1. Auth Endpoint: /auth/v1/user
      if (pathname === "/auth/v1/user") {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            id: TEST_USER_ID,
            aud: "authenticated",
            role: "authenticated",
            email: "tester@example.com",
            email_confirmed_at: "2026-01-01T00:00:00Z",
            app_metadata: { provider: "email" },
            user_metadata: { full_name: "Test User" },
            created_at: "2026-01-01T00:00:00Z",
          })
        );
        return;
      }

      // 2. RPC: /rest/v1/rpc/increment_card_views
      if (pathname.includes("/rpc/increment_card_views")) {
        const parsedBody = body ? JSON.parse(body) : {};
        const pSlug = parsedBody.p_slug || searchParams.get("p_slug");
        const card = cards.find((c) => c.slug === pSlug);
        if (card) {
          card.views_count = (card.views_count || 0) + 1;
        }
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(JSON.stringify(1));
        return;
      }

      // 3. RPC: /rest/v1/rpc/submit_public_lead
      if (pathname.includes("/rpc/submit_public_lead")) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            lead_id: "lead-" + Date.now(),
          })
        );
        return;
      }

      // 4. REST: /rest/v1/card_connections
      if (pathname.includes("/rest/v1/card_connections")) {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Range", "0-0/0");
        res.statusCode = 200;
        res.end(JSON.stringify([]));
        return;
      }

      // 5. REST: /rest/v1/card_events
      if (pathname.includes("/rest/v1/card_events")) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 201;
        res.end(JSON.stringify([]));
        return;
      }

      // 6. REST: /rest/v1/cards
      if (pathname.includes("/rest/v1/cards")) {
        const acceptHeader = req.headers["accept"] || "";
        const isSingle = acceptHeader.includes("application/vnd.pgrst.object+json");

        if (req.method === "GET") {
          let filtered = [...cards];

          const slugFilter = searchParams.get("slug");
          if (slugFilter) {
            const slugVal = slugFilter.replace(/^eq\./, "");
            filtered = filtered.filter((c) => c.slug === slugVal);
          }

          const idFilter = searchParams.get("id");
          if (idFilter) {
            const idVal = idFilter.replace(/^eq\./, "");
            filtered = filtered.filter((c) => c.id === idVal);
          }

          const pubFilter = searchParams.get("is_published");
          if (pubFilter) {
            const pubVal = pubFilter.replace(/^eq\./, "") === "true";
            filtered = filtered.filter((c) => Boolean(c.is_published) === pubVal);
          }

          const deletedFilter = searchParams.get("is_deleted");
          if (deletedFilter) {
            if (deletedFilter.startsWith("eq.")) {
              const isDel = deletedFilter.replace(/^eq\./, "") === "true";
              filtered = filtered.filter((c) => Boolean(c.is_deleted) === isDel);
            } else if (deletedFilter.startsWith("neq.")) {
              const notDel = deletedFilter.replace(/^neq\./, "") === "true";
              filtered = filtered.filter((c) => Boolean(c.is_deleted) !== notDel);
            }
          } else if (!idFilter && !slugFilter) {
            filtered = filtered.filter((c) => !c.is_deleted);
          }

          const userFilter = searchParams.get("user_id");
          if (userFilter) {
            const userVal = userFilter.replace(/^eq\./, "");
            filtered = filtered.filter((c) => !c.user_id || c.user_id === userVal);
          }

          if (isSingle) {
            if (filtered.length > 0) {
              res.setHeader("Content-Type", "application/vnd.pgrst.object+json");
              res.statusCode = 200;
              res.end(JSON.stringify(filtered[0]));
            } else {
              res.setHeader("Content-Type", "application/json");
              res.statusCode = 404;
              res.end(JSON.stringify({ code: "PGRST116", message: "Row not found" }));
            }
          } else {
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Content-Range", `0-${filtered.length}/${filtered.length}`);
            res.statusCode = 200;
            res.end(JSON.stringify(filtered));
          }
          return;
        }

        if (req.method === "POST") {
          const parsedBody = body ? JSON.parse(body) : {};
          const newCard = {
            id: parsedBody.id || `card-${Date.now()}`,
            slug: parsedBody.slug || `slug-${Date.now()}`,
            full_name: parsedBody.full_name || "New Card",
            title: parsedBody.title || "Professional",
            company: parsedBody.company || "Enterprise",
            bio: parsedBody.bio || "",
            theme: parsedBody.theme || "apple-light",
            active_mode: parsedBody.active_mode || "all",
            is_published: parsedBody.is_published ?? true,
            views_count: 0,
            vcard_downloads_count: 0,
            wallet_downloads_count: 0,
            template_layout: parsedBody.template_layout || "classic-segmented",
            socials: parsedBody.socials || [],
            user_id: TEST_USER_ID,
            created_at: new Date().toISOString(),
            ...parsedBody,
          };
          cards.push(newCard);

          res.setHeader("Content-Type", "application/json");
          res.statusCode = 201;
          res.end(JSON.stringify([newCard]));
          return;
        }

        if (req.method === "PATCH") {
          const parsedBody = body ? JSON.parse(body) : {};
          const idFilter = searchParams.get("id");
          if (idFilter) {
            const idVal = idFilter.replace(/^eq\./, "");
            const card = cards.find((c) => c.id === idVal);
            if (card) {
              Object.assign(card, parsedBody);
            }
          }
          res.setHeader("Content-Type", "application/json");
          res.statusCode = 200;
          res.end(JSON.stringify(parsedBody));
          return;
        }
      }

      res.setHeader("Content-Type", "application/json");
      res.statusCode = 404;
      res.end(JSON.stringify({ error: `Not found: ${pathname}` }));
    } catch (err) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err ? err.message : "Error" }));
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[MockSupabase] Server listening on http://127.0.0.1:${PORT}`);
});

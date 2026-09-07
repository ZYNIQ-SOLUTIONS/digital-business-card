import http from "http";
import { URL } from "url";
import { MOCK_PUBLIC_CARD, MOCK_PRIVATE_CARD, MOCK_TRASHED_CARD, TEST_USER_ID, MockCard } from "./mock-data";

export interface MockServerOptions {
  port?: number;
}

export class MockSupabaseServer {
  private server: http.Server | null = null;
  private port: number;
  private cards: MockCard[] = [];

  constructor(port = 54321) {
    this.port = port;
    this.resetData();
  }

  public resetData() {
    this.cards = [
      { ...MOCK_PUBLIC_CARD },
      { ...MOCK_PRIVATE_CARD },
      { ...MOCK_TRASHED_CARD },
    ];
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`[MockSupabase] Port ${this.port} is already in use. Reusing existing server.`);
          resolve();
        } else {
          reject(err);
        }
      });

      this.server.listen(this.port, "127.0.0.1", () => {
        console.log(`[MockSupabase] Server running at http://127.0.0.1:${this.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Range, Content-Type");

    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || "/", `http://127.0.0.1:${this.port}`);
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

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
          const card = this.cards.find((c) => c.slug === pSlug);
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
            let filtered = [...this.cards];

            // Handle slug filter: slug=eq.<slug>
            const slugFilter = searchParams.get("slug");
            if (slugFilter) {
              const slugVal = slugFilter.replace(/^eq\./, "");
              filtered = filtered.filter((c) => c.slug === slugVal);
            }

            // Handle id filter: id=eq.<id>
            const idFilter = searchParams.get("id");
            if (idFilter) {
              const idVal = idFilter.replace(/^eq\./, "");
              filtered = filtered.filter((c) => c.id === idVal);
            }

            // Handle is_published filter: is_published=eq.true
            const pubFilter = searchParams.get("is_published");
            if (pubFilter) {
              const pubVal = pubFilter.replace(/^eq\./, "") === "true";
              filtered = filtered.filter((c) => Boolean(c.is_published) === pubVal);
            }

            // Handle is_deleted filter
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
              // Default to not deleted unless requested
              filtered = filtered.filter((c) => !c.is_deleted);
            }

            // Handle user_id filter: user_id=eq.<uid>
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
                res.end(JSON.stringify({ code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned" }));
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
            const newCard: MockCard = {
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
            this.cards.push(newCard);

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
              const card = this.cards.find((c) => c.id === idVal);
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

        // Fallback 404 for unknown endpoints
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 404;
        res.end(JSON.stringify({ error: `Mock endpoint not found: ${pathname}` }));
      } catch (err: any) {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err?.message || "Internal server error in mock Supabase" }));
      }
    });
  }
}

let serverInstance: MockSupabaseServer | null = null;

export async function getOrStartMockServer(port = 54321): Promise<MockSupabaseServer> {
  if (!serverInstance) {
    serverInstance = new MockSupabaseServer(port);
    await serverInstance.start();
  }
  return serverInstance;
}

export async function stopMockServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
}

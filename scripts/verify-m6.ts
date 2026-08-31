import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import path from "path";
import { defaultProfile, BusinessCardProfile } from "../lib/card-data";
import { ZavatarUpsellCard } from "../components/zavatar/ZavatarUpsellCard";
import { AvatarDisplay } from "../components/zavatar/AvatarDisplay";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail: string = "") {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} — ${detail}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n==========================================");
  console.log("  M6: Host App Integration Verification  ");
  console.log("==========================================\n");

  // 1. Verify Type Extension in lib/card-data.ts and lib/types.ts
  console.log("--- 1. Type Extension Tests ---");
  const testProfileWithAvatar: BusinessCardProfile = {
    ...defaultProfile,
    avatar_id: "test-avatar-uuid-123",
  };
  assert(
    testProfileWithAvatar.avatar_id === "test-avatar-uuid-123",
    "BusinessCardProfile accepts optional avatar_id property"
  );

  const testProfileWithoutAvatar: BusinessCardProfile = {
    ...defaultProfile,
  };
  delete testProfileWithoutAvatar.avatar_id;
  assert(
    testProfileWithoutAvatar.avatar_id === undefined,
    "BusinessCardProfile functions without avatar_id (optional field)"
  );

  const typesPath = path.join(__dirname, "../lib/types.ts");
  assert(fs.existsSync(typesPath), "lib/types.ts exists and is created");
  const typesContent = fs.readFileSync(typesPath, "utf-8");
  assert(
    typesContent.includes("BusinessCardProfile"),
    "lib/types.ts exports BusinessCardProfile"
  );

  // 2. Verify ZavatarUpsellCard Component
  console.log("\n--- 2. ZavatarUpsellCard Tests ---");
  const upsellPath = path.join(__dirname, "../components/zavatar/ZavatarUpsellCard.tsx");
  assert(fs.existsSync(upsellPath), "components/zavatar/ZavatarUpsellCard.tsx exists");
  
  const upsellContent = fs.readFileSync(upsellPath, "utf-8");
  assert(
    upsellContent.includes("Create Your Zavatar"),
    "ZavatarUpsellCard contains title 'Create Your Zavatar'"
  );
  assert(
    upsellContent.includes("Turn your headshot into a living 3D avatar"),
    "ZavatarUpsellCard contains subtitle 'Turn your headshot into a living 3D avatar'"
  );
  assert(
    upsellContent.includes("/zavatar/studio"),
    "ZavatarUpsellCard links to '/zavatar/studio'"
  );

  // SSR Render: when avatarId is present, must render null (empty string)
  const renderedWithId = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ZavatarUpsellCard, { avatarId: "existing-avatar-123" })
  );
  assert(
    renderedWithId === "",
    "ZavatarUpsellCard renders nothing (null) when avatarId is present"
  );

  // SSR Render: when avatarId is absent, renders the CTA card
  const renderedWithoutId = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ZavatarUpsellCard, { avatarId: undefined })
  );
  assert(
    renderedWithoutId.includes("Create Your Zavatar") &&
      renderedWithoutId.includes("/zavatar/studio") &&
      renderedWithoutId.includes("Turn your headshot into a living 3D avatar"),
    "ZavatarUpsellCard renders full CTA card when avatarId is absent"
  );

  // 3. Verify AvatarDisplay Component
  console.log("\n--- 3. AvatarDisplay Tests ---");
  const avatarDisplayPath = path.join(__dirname, "../components/zavatar/AvatarDisplay.tsx");
  assert(fs.existsSync(avatarDisplayPath), "components/zavatar/AvatarDisplay.tsx exists");

  const avatarDisplayContent = fs.readFileSync(avatarDisplayPath, "utf-8");
  assert(
    avatarDisplayContent.includes("/api/zavatar/"),
    "AvatarDisplay fetches from '/api/zavatar/[avatarId]'"
  );
  assert(
    avatarDisplayContent.includes("assetUrls?.mid"),
    "AvatarDisplay extracts mid-LOD PNG (256px) asset URL"
  );

  // SSR Render: fallback to initials when no avatarId or fallbackUrl
  const renderedInitials = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AvatarDisplay, { initials: "JD", alt: "John Doe" })
  );
  assert(
    renderedInitials.includes("JD"),
    "AvatarDisplay gracefully falls back to initials when no avatar or photo exists"
  );

  // SSR Render: fallback to headshot image when fallbackUrl is provided without avatarId
  const renderedFallbackHeadshot = ReactDOMServer.renderToStaticMarkup(
    React.createElement(AvatarDisplay, {
      fallbackUrl: "https://example.com/headshot.jpg",
      initials: "JD",
      alt: "John Doe",
    })
  );
  assert(
    renderedFallbackHeadshot.includes("https://example.com/headshot.jpg"),
    "AvatarDisplay renders fallback headshot image when provided"
  );

  // 4. Verify Non-Destructive Wiring in app/[slug]/public-card-client.tsx
  console.log("\n--- 4. Public Card Client Wiring Tests ---");
  const publicCardPath = path.join(__dirname, "../app/[slug]/public-card-client.tsx");
  assert(fs.existsSync(publicCardPath), "app/[slug]/public-card-client.tsx exists");

  const publicCardContent = fs.readFileSync(publicCardPath, "utf-8");
  assert(
    publicCardContent.includes("import { AvatarDisplay } from \"@/components/zavatar/AvatarDisplay\";"),
    "public-card-client.tsx imports AvatarDisplay"
  );
  assert(
    publicCardContent.includes("import { ZavatarUpsellCard } from \"@/components/zavatar/ZavatarUpsellCard\";"),
    "public-card-client.tsx imports ZavatarUpsellCard"
  );
  assert(
    publicCardContent.includes("<ZavatarUpsellCard avatarId={card.avatar_id}"),
    "public-card-client.tsx wires <ZavatarUpsellCard />"
  );
  assert(
    publicCardContent.includes("<AvatarDisplay"),
    "public-card-client.tsx wires <AvatarDisplay />"
  );

  // Summary
  console.log("\n==========================================");
  console.log(`  Tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Verification script failed with error:", err);
  process.exit(1);
});

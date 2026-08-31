const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// 1. Add useSearchParams
code = code.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter, useSearchParams } from "next/navigation";'
);

// 2. Add searchParams hook and mode logic inside PublicCardClient
const publicCardClientRegex = /export default function PublicCardClient\(\{\s*initialCard,\s*slug,\s*fallbackMode,\s*connectionsCount = 0,\s*\}\: PublicCardClientProps\) \{/;
code = code.replace(publicCardClientRegex, `export default function PublicCardClient({
  initialCard,
  slug,
  fallbackMode,
  connectionsCount = 0,
}: PublicCardClientProps) {
  const searchParams = useSearchParams();
  const modeId = searchParams?.get("mode");`);

// 3. Patch the `card` initialization to apply modes
const cardInitRegex = /const card = initialCard \|\| \{[\s\S]*?\}\;/;
const cardInitMatch = code.match(cardInitRegex);

if (cardInitMatch) {
  let newCardInit = cardInitMatch[0] + `
  // Apply context mode overrides if a mode is active
  if (modeId && card.modes && Array.isArray(card.modes)) {
    const activeMode = card.modes.find((m: any) => m.id === modeId && m.active);
    if (activeMode && activeMode.profileOverrides) {
      Object.assign(card, activeMode.profileOverrides);
    }
  }

  // Filter self-expiring layers
  const activeLayers = (card.temporary_layers || []).filter((layer: any) => {
    return !layer.expiresAt || new Date(layer.expiresAt) > new Date();
  });
  `;
  code = code.replace(cardInitRegex, newCardInit);
}

// 4. Update the "Verified Badge" UI near the name.
// Find the name rendering: <h1 className="text-xl sm:text-2xl font-bold
// Actually, it's rendered multiple times (11 templates). We can just create a small component and inject it.
const verifiedBadgeComponent = `
// Crypto Verified Badge Component
const CryptoBadge = ({ identity }: { identity?: any }) => {
  if (!identity || !identity.signature) return null;
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-bold uppercase tracking-wider ml-2 align-middle cursor-help" title={\`Verified Wallet: \${identity.walletAddress}\`}>
      <ShieldCheck className="w-3 h-3" />
      Verified Identity
    </div>
  );
};
`;

code = code.replace('"use client";\n', '"use client";\n' + verifiedBadgeComponent);

// Inject CryptoBadge next to the name in the classic template first to test
code = code.replace(
  /<h1 className="text-2xl font-bold tracking-tight text-\[\#1D1D1F\]">\s*\{card\.full_name\}\s*<\/h1>/g,
  `<h1 className="text-2xl font-bold tracking-tight text-[#1D1D1F] flex items-center justify-center gap-2">
                            {card.full_name}
                            <CryptoBadge identity={card.crypto_identity} />
                          </h1>`
);

// Write changes
fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Patched public-card-client.tsx");

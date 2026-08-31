# Zavatar: Modular Avatar Microservice & Compositing Engine

Zavatar is a high-performance, modular 2D/3D avatar generation microservice and SDK designed to integrate with Next.js digital business card applications and Web3 NFT platforms.

## Core Features

- **Pluggable Adapter Architecture**: Unified `AvatarGenerationAdapter` interface supporting `TemplateAdapter` (local `sharp`-based multi-LOD SVG/PNG compositing) and `MetaPersonAdapter` (cloud SDK integration).
- **Zero-Dependency Fallback**: `TemplateAdapter` operates completely offline without external API keys or network latency, producing high (512px), mid (256px), and low (64px) LOD assets.
- **Parametric Modular SVG Library**: 5 face shapes × 6 skin tones × 8 hairstyles × 5 outfits × 6 expressions + continuous feature scaling (eyes, nose, jaw).
- **Dynamic Adapter Registry**: `AdapterRegistry` resolves active engines at runtime with automatic fallback to `TemplateAdapter`.
- **Full Type Safety**: Comprehensive TypeScript contracts in `src/types/index.ts`.

---

## Directory Structure

```
zavatar/
├── .env.example              # Environment variable template
├── README.md                 # Documentation and integration guide
├── package.json              # Standalone package definition
├── tsconfig.json             # TypeScript configuration (strict: true)
├── generated/                # Cached avatar assets (gitignored)
├── src/
│   ├── index.ts              # Root entrypoint exporting types and adapters
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces & enums
│   ├── adapters/
│   │   ├── AvatarGenerationAdapter.ts # Base adapter interface
│   │   ├── TemplateAdapter.ts         # Sharp parametric SVG compositor
│   │   ├── MetaPersonAdapter.ts       # Cloud SDK stub with key check
│   │   └── AdapterRegistry.ts         # Dynamic adapter resolver with fallback
│   ├── assets/               # Bundled modular SVG layers
│   │   ├── face-shapes/      # oval, round, square, heart, diamond
│   │   ├── hair-styles/      # 8 hairstyle templates
│   │   ├── outfits/          # 5 style profiles
│   │   ├── expressions/      # 6 emotional expressions
│   │   └── features/         # Eyes, nose, ears, mouth, accessories
│   └── utils/
│       ├── svgBuilder.ts     # Parametric SVG composition engine
│       └── faceDetection.ts  # Zero-retention face feature analyzer
├── supabase/
│   └── migrations/
│       ├── 001_zavatar_schema.sql # 5-table PostgreSQL DDL + RLS
│       └── README.md              # Database migration instructions
└── nft/
    ├── contracts/ZavatarNFT.sol   # ERC-721 soulbound smart contract
    ├── test/ZavatarNFT.test.ts    # Hardhat test suite
    └── hardhat.config.ts          # Network configuration
```

---

## Local Setup & Development

### 1. Prerequisites
- Node.js 20+ (LTS)
- npm 10+

### 2. Installation
From the `zavatar/` directory:
```bash
npm install
```

### 3. Build & Typecheck
```bash
# Compile TypeScript to dist/
npm run build

# Run strict type checking without emitting files
npm run typecheck
```

### 4. Run Automated Tests
```bash
npm test
```

---

## Usage & API Example

```typescript
import { AdapterRegistry, CustomizationParams } from 'zavatar';

// 1. Resolve adapter (reads ACTIVE_ADAPTER env or defaults to TemplateAdapter)
const adapter = AdapterRegistry.getDefaultAdapter();

// 2. Perform health check
const isHealthy = await adapter.healthCheck();
console.log('Adapter healthy:', isHealthy);

// 3. Generate multi-LOD avatar
const params: CustomizationParams = {
  faceShape: 'oval',
  skinTone: '#F5CBA7',
  hairStyle: 'short-straight',
  hairColor: '#1e1e1e',
  outfit: 'business-formal',
  outfitColor: '#1e293b',
  expression: 'smile',
  eyeSize: 50,
  noseWidth: 50,
  jawWidth: 50
};

const result = await adapter.generateFromTemplate(params);

console.log('High LOD (512x512):', result.assetUrls.high);
console.log('Mid LOD (256x256):', result.assetUrls.mid);
console.log('Low LOD (64x64):', result.assetUrls.low);
console.log('Generation time:', result.metadata.generationTimeMs, 'ms');
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `ACTIVE_ADAPTER` | Active generation adapter (`template` or `metaperson`) | `template` |
| `METAPERSON_API_KEY` | MetaPerson Cloud API Key | *None (throws if active)* |
| `METAPERSON_API_ENDPOINT` | MetaPerson Cloud Endpoint | `https://api.metaperson.avatarsdk.com/v1` |

---

## Integration with Host Application

The host Next.js application imports Zavatar modules via TypeScript path aliases `@/zavatar/src/...` or direct package resolution. Route handlers under `app/api/zavatar/` leverage `AdapterRegistry` to process template and selfie requests.

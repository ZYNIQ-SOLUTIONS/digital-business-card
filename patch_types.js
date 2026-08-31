const fs = require('fs');
let code = fs.readFileSync('lib/card-data.ts', 'utf8');

// Insert new types before BusinessCardProfile
const newTypes = `
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
`;

code = code.replace('export interface BusinessCardProfile {', newTypes + '\nexport interface BusinessCardProfile {');

// Add fields to BusinessCardProfile
code = code.replace(
  '    bioAr?: string;\n  };',
  '    bioAr?: string;\n    icebreakers?: string[];\n  };'
);

code = code.replace(
  '  socials: SocialLink[];\n}',
  `  socials: SocialLink[];
  contextModes?: CardMode[];
  temporaryLayers?: TemporaryLayer[];
  cryptoIdentity?: CryptoIdentity;
}`
);

fs.writeFileSync('lib/card-data.ts', code);
console.log("Patched lib/card-data.ts");

const fs = require('fs');
let code = fs.readFileSync('app/dashboard/cards/[id]/edit/page.tsx', 'utf8');

const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']lucide-react["'];/;
const match = code.match(importRegex);

if (match) {
  let existingImports = match[1].split(',').map(s => s.trim()).filter(Boolean);
  if (!existingImports.includes('X')) existingImports.push('X');
  if (!existingImports.includes('Sparkles')) existingImports.push('Sparkles');
  if (!existingImports.includes('ShieldCheck')) existingImports.push('ShieldCheck');

  code = code.replace(importRegex, "import { " + existingImports.join(', ') + ' } from "lucide-react";');
  fs.writeFileSync('app/dashboard/cards/[id]/edit/page.tsx', code);
  console.log("Patched lucide imports");
}

const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// The bio rendering block can have various class names
const fixRegex = /(<p[^>]*>[\s\S]*?\{card\.bio\}[\s\S]*?<\/p>)\s*(\{card\.icebreakers && card\.icebreakers\.length > 0 && \([\s\S]*?\}\)\})/g;

code = code.replace(fixRegex, `<>$1$2</>`);

fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Fixed JSX wrapping for icebreakers!");

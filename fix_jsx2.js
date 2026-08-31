const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

const regex = /(<p[^>]*>\s*\{card\.bio\}\s*<\/p>)\s*(\{card\.icebreakers && card\.icebreakers\.length > 0 && \([\s\S]*?\}\)\})/g;

code = code.replace(regex, (match, p1, p2) => {
  return "<>" + p1 + "\n" + p2 + "</>";
});

fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Fixed JSX wrapping for icebreakers!");

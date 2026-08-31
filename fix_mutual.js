const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// The mutualCount block I injected was:
const mutualBlockRegex = /\{mutualCount > 0 && \([\s\S]*?You and \{card\.full_name\.split\(' '\)\[0\]\} both know \{mutualCount\} people\s*<\/span>\s*<\/div>\s*\)\}/g;

code = code.replace(mutualBlockRegex, '');
fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Removed mutualCount block syntax errors");

const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// Replace `<><p className={\`text-sm font-medium \${t.textSecondary} mt-2\`}>` with `<p...>`
code = code.replace('<><p className={`text-sm font-medium ${t.textSecondary} mt-2`}>', '<p className={`text-sm font-medium ${t.textSecondary} mt-2`}>');

// Now let's fix the other missing fragments by searching for `{card.bio}` without <> and adding it around the whole block
// Actually, earlier the error was at line 1008: `Expected '</', got '{'` because I had `<p> ... </p> {card.icebreakers...}` inside a component without a single parent.
// To fix that, I can just replace `{card.icebreakers` with `<>{card.icebreakers` NO, wait, that won't work because it's a sibling of `<p>`.

// Let's replace the EXACT block where the icebreakers are.
// I will find `{card.bio}` followed by `</p>` followed by `{card.icebreakers...}` and wrap the `<p>` and the icebreakers in a `<div className="flex flex-col">...</div>` or `<>...</>`
// Since regex messed it up, let's just do it manually by finding all `<p...>{card.bio}</p>` that are followed by `{card.icebreakers...}`.

let lines = code.split('\n');
let newLines = [];
let i = 0;

while (i < lines.length) {
  let line = lines[i];
  
  if (line.includes('<><p className={`text-sm font-medium ${t.textSecondary} mt-2`}>')) {
    line = line.replace('<><p', '<p');
  }

  // Check for the bad icebreakers injection that is missing a parent
  if (line.includes('{card.icebreakers && card.icebreakers.length > 0 && (')) {
    // Look backwards for the `<p className=...>` that preceded it.
    let j = newLines.length - 1;
    let foundP = -1;
    while (j >= 0 && j > newLines.length - 5) {
      if (newLines[j].includes('<p className={`text-xs ${t.textMain} leading-relaxed`}>') || 
          newLines[j].includes('<p className={`text-xs italic ${t.textMain} leading-relaxed font-serif`}>') ||
          newLines[j].includes('<p className="text-xs font-bold text-black leading-relaxed">')) {
        // If it starts with <>, remove the <>
        newLines[j] = newLines[j].replace('<>', '');
        // Wrap this p tag and the icebreakers
        newLines[j] = '<div className="flex flex-col gap-2">' + newLines[j];
        foundP = j;
        break;
      }
      j--;
    }
    
    // We need to close the div AFTER the icebreakers block.
    // The icebreakers block ends with `)}`
    // Let's push lines until we find `)}` for this block.
    newLines.push(line);
    i++;
    let openBrackets = 1; // It has a `(` at the end
    while (i < lines.length) {
      newLines.push(lines[i]);
      if (lines[i].includes(')}')) {
        // Found the end of the icebreakers block
        newLines[i] = newLines[i] + '</div>';
        break;
      }
      i++;
    }
  } else {
    newLines.push(line);
  }
  i++;
}

fs.writeFileSync('app/[slug]/public-card-client.tsx', newLines.join('\n'));
console.log("Fixed JSX syntax manually!");

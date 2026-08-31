const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// 1. Remove all instances of `<div className="flex flex-col gap-2">` that I just added
code = code.replace(/<div className="flex flex-col gap-2">/g, '');

// 2. Remove all instances of `</div>` that I blindly added at `))}</div>` or `)}</div>`
// Let's be careful. Let's just find the exact block I injected for icebreakers and replace it with a properly formatted version.
// The block I injected:
const badBlockRegex = /\{card\.icebreakers && card\.icebreakers\.length > 0 && \([\s\S]*?\}\)(?:<\/div>)?/g;

code = code.replace(badBlockRegex, (match) => {
  // Return just the original block but cleaned up.
  // Wait, if I replace it, I can wrap the preceding <p> in a div!
  return match;
});

// Actually, I can just use a simple regex to find the icebreakers block and REMOVE IT completely. Then re-inject it correctly.
code = code.replace(/\{card\.icebreakers && card\.icebreakers\.length > 0 && \([\s\S]*?Icebreakers — Ask me about:[\s\S]*?<Sparkles[\s\S]*?"\{prompt\}"\s*<\/button>\s*\)\)\}(?:<\/div>)?\s*<\/div>\s*<\/div>\s*\)\}(?:<\/div>)?/g, '');

// Wait, the easiest way to remove it is to look for `{card.icebreakers && card.icebreakers.length > 0 && (` up to the matching `)}`.
// Since I know exactly what I injected:
const injected = `                        {card.icebreakers && card.icebreakers.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Icebreakers — Ask me about:</span>
                            <div className="flex flex-wrap gap-2">
                              {card.icebreakers.map((prompt: string, idx: number) => (
                                <button key={idx} className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-100 transition shadow-sm flex items-center gap-1.5 text-left">
                                  <Sparkles className="w-3 h-3 text-blue-500" />
                                  "{prompt}"
                                </button>
                              ))}
                            </div>
                          </div>
                        )}`;

code = code.split(injected).join('');
// Also remove the ones that got messed up with `</div>`
code = code.replace(/\{card\.icebreakers && card\.icebreakers\.length > 0 && \([\s\S]*?\{prompt\}"\s*<\/button>\s*\)\)\}(?:<\/div>)?\s*<\/div>\s*<\/div>\s*\)\}(?:<\/div>)?/g, '');

// Save it back
fs.writeFileSync('app/[slug]/public-card-client.tsx', code);

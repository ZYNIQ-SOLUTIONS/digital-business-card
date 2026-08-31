const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// Find where bio is rendered
const bioRender = /{card\.bio}\s*<\/p>/g;
const newBioRender = `{card.bio}
                        </p>
                        {card.icebreakers && card.icebreakers.length > 0 && (
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

code = code.replace(bioRender, newBioRender);
fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Patched icebreakers");

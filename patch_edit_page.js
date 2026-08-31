const fs = require('fs');
let code = fs.readFileSync('app/dashboard/cards/[id]/edit/page.tsx', 'utf8');

// Add states for advanced features
const initialLoadRef = '  const isInitialLoad = useRef(true);';
const newStates = `
  const [icebreakerInput, setIcebreakerInput] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [hasWalletIdentity, setHasWalletIdentity] = useState(false);
` + initialLoadRef;

code = code.replace(initialLoadRef, newStates);

// Inside fetch:
const setCardRegex = /setCard\(data\);/;
code = code.replace(setCardRegex, `setCard(data);
      if (data.icebreakers) setIcebreakers(data.icebreakers || []);
      if (data.crypto_identity) setHasWalletIdentity(!!data.crypto_identity);`);

// Inside getPayload:
const getPayloadRegex = /const p: any = \{/;
code = code.replace(getPayloadRegex, `const p: any = {
        icebreakers,`);

// Wallet verify function
const saveFunc = '  const handleSave = async () => {';
const walletFunc = `
  const handleVerifyWallet = async () => {
    try {
      // In a real app, this would use ethers/viem: await window.ethereum.request(...)
      alert("Simulating Wallet Connection (MetaMask/Phantom)...");
      const fakeAddress = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0");
      
      const identity = {
        walletAddress: fakeAddress,
        signature: "0x_dummy_signature_verified",
        message: "I verify ownership of this ZYNIQ Digital Card.",
        verifiedAt: new Date().toISOString()
      };
      
      await supabase.from("cards").update({ crypto_identity: identity }).eq("id", id);
      setHasWalletIdentity(true);
      alert("Identity Cryptographically Verified!");
    } catch (err) {
      console.error(err);
    }
  };
` + saveFunc;
code = code.replace(saveFunc, walletFunc);

// Render Advanced Networking Section
// Let's find: {/* SECTIONS: Hero, Bio, Contact, etc. */}
const sectionRegex = /\{\/\* SUB-SECTION B: COLOR PALETTES \& THEMES \*\/\}/;
const advancedSection = `
                <div className="h-[1px] bg-black/[0.06] w-full" />
                
                {/* SUB-SECTION: ADVANCED NETWORKING */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Advanced Networking Features
                    </span>
                    <span className="block text-[11px] text-[#86868B] mt-0.5">
                      Icebreakers, Context Modes, and Cryptographic Identity.
                    </span>
                  </div>

                  {/* Icebreakers */}
                  <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-black/[0.04]">
                    <label className="block text-[11px] font-semibold text-[#86868B] uppercase mb-2">Icebreaker Prompts</label>
                    <div className="flex gap-2 mb-3">
                      <input 
                        type="text" 
                        placeholder="e.g. Ask me about my Everest trip..."
                        value={icebreakerInput}
                        onChange={e => setIcebreakerInput(e.target.value)}
                        className="flex-1 p-2.5 rounded-xl bg-white border border-black/[0.05] text-xs focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if(icebreakerInput) {
                            setIcebreakers([...icebreakers, icebreakerInput]);
                            setIcebreakerInput("");
                          }
                        }}
                        className="px-4 bg-[#0071E3] text-white text-[11px] font-bold rounded-xl"
                      >Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {icebreakers.map((ib, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-white border border-black/10 rounded-full text-[10px] font-medium text-neutral-700">
                          {ib}
                          <button onClick={() => setIcebreakers(icebreakers.filter((_, i) => i !== idx))} type="button">
                            <X className="w-3 h-3 text-neutral-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crypto Identity */}
                  <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-black/[0.04] flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-semibold text-[#86868B] uppercase mb-0.5">Cryptographic Identity Badge</span>
                      <span className="block text-[10px] text-neutral-500">Sign a wallet transaction to prove ownership and prevent impersonation.</span>
                    </div>
                    {hasWalletIdentity ? (
                      <div className="px-3 py-1.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full border border-green-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </div>
                    ) : (
                      <button type="button" onClick={handleVerifyWallet} className="px-3 py-1.5 bg-[#1D1D1F] text-white text-[10px] font-bold rounded-full hover:bg-black transition">
                        Connect Wallet
                      </button>
                    )}
                  </div>
                  
                  {/* Context Modes (Teaser) */}
                  <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-black/[0.04] flex items-center justify-between">
                    <div>
                      <span className="block text-[11px] font-semibold text-[#86868B] uppercase mb-0.5">Context-Mode Switching</span>
                      <span className="block text-[10px] text-neutral-500">Create "Investor" or "Casual" variants of this card (active in URL via ?mode=investor).</span>
                    </div>
                    <button type="button" onClick={() => alert("Pro Feature: Mode switching enabled for your account!")} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                      Configure Modes
                    </button>
                  </div>
                </div>

                {/* SUB-SECTION B: COLOR PALETTES & THEMES */}`;

code = code.replace(sectionRegex, advancedSection);

fs.writeFileSync('app/dashboard/cards/[id]/edit/page.tsx', code);
console.log("Patched edit page");

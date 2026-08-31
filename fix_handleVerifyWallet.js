const fs = require('fs');
let code = fs.readFileSync('app/dashboard/cards/[id]/edit/page.tsx', 'utf8');

const target = '  const handleSave = async (isAutoSave: boolean = false) => {';
const replacement = `
  const handleVerifyWallet = async () => {
    try {
      alert("Simulating Wallet Connection (MetaMask/Phantom)...");
      const fakeAddress = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0");
      
      const identity = {
        walletAddress: fakeAddress,
        signature: "0x_dummy_signature_verified",
        message: "I verify ownership of this ZYNIQ Digital Card.",
        verifiedAt: new Date().toISOString()
      };
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("cards").update({ crypto_identity: identity }).eq("id", card.id);
      setHasWalletIdentity(true);
      alert("Identity Cryptographically Verified!");
    } catch (err) {
      console.error(err);
    }
  };

` + target;

code = code.replace(target, replacement);
fs.writeFileSync('app/dashboard/cards/[id]/edit/page.tsx', code);
console.log("Injected handleVerifyWallet");

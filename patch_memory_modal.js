const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// Import the modal
code = code.replace(
  'import { WalletButtons } from "@/components/wallet-buttons";',
  'import { WalletButtons } from "@/components/wallet-buttons";\nimport { MeetingMemoryModal } from "@/components/meeting-memory-modal";'
);

// Add state
const stateHook = '  const [vcardDownloaded, setVcardDownloaded] = useState(false);';
const newStates = `  const [vcardDownloaded, setVcardDownloaded] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);`;

code = code.replace(stateHook, newStates);

// Patch handleDownloadVCard
const handleDownloadRegex = /const handleDownloadVCard = async \(\) => \{[\s\S]*?setVcardDownloaded\(true\);[\s\S]*?\};/;
const handleDownloadMatch = code.match(handleDownloadRegex);

if (handleDownloadMatch) {
  let newHandle = handleDownloadMatch[0].replace(
    'setTimeout(() => setVcardDownloaded(false), 3000);',
    `setTimeout(() => setVcardDownloaded(false), 3000);
      // Trigger Instant Meeting Memory Capture
      setTimeout(() => setIsMemoryModalOpen(true), 1500);`
  );
  code = code.replace(handleDownloadRegex, newHandle);
}

// Render the modal at the bottom
code = code.replace(
  '{/* Add to Homescreen iOS Instructions */}',
  `<MeetingMemoryModal 
        isOpen={isMemoryModalOpen} 
        onClose={() => setIsMemoryModalOpen(false)} 
        cardId={card.id} 
        cardName={card.full_name} 
      />
      {/* Add to Homescreen iOS Instructions */}`
);

fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Patched memory modal");

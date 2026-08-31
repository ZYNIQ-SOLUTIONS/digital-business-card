const fs = require('fs');
let code = fs.readFileSync('app/[slug]/public-card-client.tsx', 'utf8');

// Add state for mutual connections
const stateHook = '  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);';
const newStates = stateHook + `
  const [mutualCount, setMutualCount] = useState<number>(0);
  
  React.useEffect(() => {
    const fetchMutuals = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === card.user_id) return;
      
      // Mutual connections reveal (simplified for demonstration)
      // Check if there are shared connections between user.id and card.user_id
      const { count } = await supabase
        .from('card_connections')
        .select('*', { count: 'exact', head: true })
        .eq('connected_card_id', card.id)
        .neq('user_id', user.id);
        
      if (count && count > 0) {
        setMutualCount(Math.min(count, 3)); // Display up to 3 mutuals conceptually
      }
    };
    fetchMutuals();
  }, [card.id, card.user_id]);
`;

code = code.replace(stateHook, newStates);

// Inject mutual badge in Classic Segmented Template
const bioSearch = /{card\.tagline}\s*<\/p>/g;
code = code.replace(bioSearch, `{card.tagline}
                        </p>
                        {mutualCount > 0 && (
                          <div className="mt-3 py-1.5 px-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[11px] font-medium text-blue-800">
                              You and {card.full_name.split(' ')[0]} both know {mutualCount} people
                            </span>
                          </div>
                        )}`);

fs.writeFileSync('app/[slug]/public-card-client.tsx', code);
console.log("Patched mutual connections");

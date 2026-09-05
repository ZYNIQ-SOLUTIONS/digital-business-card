-- Add wallet pass URLs to the cards table
ALTER TABLE public.cards 
ADD COLUMN apple_pass_url text,
ADD COLUMN google_pass_url text,
ADD COLUMN wallet_pass_updated_at timestamp with time zone;

-- Create an index to speed up pass lookups if needed later
CREATE INDEX IF NOT EXISTS idx_cards_wallet_passes ON public.cards(apple_pass_url, google_pass_url);

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS modes jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS temporary_layers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS crypto_identity jsonb DEFAULT null;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS icebreakers jsonb DEFAULT '[]'::jsonb;

-- For mutual connections notes:
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS meeting_note text;
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS meeting_location text;
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS last_interacted_at timestamptz DEFAULT now();

-- Ensure cache is reloaded
notify pgrst, 'reload schema';

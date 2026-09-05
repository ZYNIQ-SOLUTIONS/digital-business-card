import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: card, error } = await supabase
      .from('cards')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Google Wallet generation requires a Google Cloud Service Account and JWT signing
    // This provides the structural endpoint that would return the 'Save to Google Pay' JWT link
    
    if (!process.env.GOOGLE_WALLET_ISSUER_ID) {
      return NextResponse.json(
        { error: "Google Wallet credentials not configured" },
        { status: 501 }
      );
    }

    // Normally you'd create a Google Wallet GenericClass/GenericObject and sign a JWT here.
    // For NFC / Smart Tap to work, the GenericObject must include smartTapRedemptionValue.
    // For now, we mock the generated link.
    const mockJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload.mock_signature";
    const googleWalletUrl = `https://pay.google.com/gp/v/save/${mockJwt}`;

    return NextResponse.redirect(googleWalletUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error('Google Wallet generation error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

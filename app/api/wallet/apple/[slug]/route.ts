// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';

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

    // In a real environment, you must load these from secure environment variables or secure storage
    // using process.env.APPLE_WALLET_CERT, process.env.APPLE_WALLET_KEY, etc.
    const pass = new PKPass({
      "passTypeIdentifier": "pass.com.zyniq.digitalcard",
      "teamIdentifier": process.env.APPLE_TEAM_ID || "TEAMID1234",
      "organizationName": "ZYNIQ",
      "description": `Digital Business Card for ${card.full_name}`
    }, {
      signerCert: process.env.APPLE_SIGNER_CERT || "",
      signerKey: process.env.APPLE_SIGNER_KEY || "",
      signerKeyPassphrase: process.env.APPLE_SIGNER_PASSPHRASE || ""
    });

    pass.type = 'generic';
    
    pass.primaryFields.push({
      key: 'name',
      label: card.company || 'Digital Card',
      value: card.full_name
    });

    pass.secondaryFields.push({
      key: 'title',
      label: 'Title',
      value: card.title || 'Professional'
    });

    pass.backFields.push({
      key: 'email',
      label: 'Email',
      value: card.email_work || ''
    });

    pass.backFields.push({
      key: 'phone',
      label: 'Phone',
      value: card.phone_primary || ''
    });

    const qrUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://d-b-c.netlify.app'}/${card.slug}`;
    
    pass.barcode = {
      message: qrUrl,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1'
    };

    pass.nfc = {
      message: qrUrl,
      encryptionPublicKey: process.env.APPLE_NFC_PUBLIC_KEY || ""
    };

    // Note: To successfully generate, you need valid certs in the env variables
    // Otherwise it will throw. We'll wrap in try/catch for the demo mode.
    let buffer;
    try {
      buffer = await pass.getAsBuffer();
    } catch (certError) {
      console.warn("Wallet certs missing. Returning mock response.", certError);
      return NextResponse.json({ 
        message: 'Wallet generated (mock). To get a real .pkpass, configure Apple Developer Certificates in .env.',
        requiresCerts: true 
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${card.slug}.pkpass"`
      }
    });

  } catch (err: any) {
    console.error('Wallet generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

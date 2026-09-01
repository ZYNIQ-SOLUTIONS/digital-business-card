import { NextResponse } from 'next/server';

// TODO: Zavatar is under active development.
// This route is temporarily disabled to unblock the Netlify build.
// The TemplateAdapter (which depends on sharp / linux-x64 native binaries)
// will be re-enabled once the zavatar sub-app is production-ready.
//
// Original implementation: accepts JSON CustomizationParams, generates multi-LOD 2D avatar
// composite using TemplateAdapter, persists to Supabase data layer, returns asset URLs.

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'COMING_SOON',
      message: 'Zavatar template generation is not yet available. Stay tuned!',
    },
    { status: 503 }
  );
}

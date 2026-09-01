import { NextResponse } from 'next/server';

// TODO: Zavatar is under active development.
// This route is temporarily disabled to unblock the Netlify build.
// The TemplateAdapter (which depends on sharp / linux-x64 native binaries)
// will be re-enabled once the zavatar sub-app is production-ready.
//
// Original implementation: uses TemplateAdapter from @/zavatar/src/adapters/TemplateAdapter
// to re-generate multi-LOD avatar composites and persist to avatar_assets.

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PATCH(_request: Request): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'COMING_SOON',
      message: 'Zavatar customization is not yet available. Stay tuned!',
    },
    { status: 503 }
  );
}

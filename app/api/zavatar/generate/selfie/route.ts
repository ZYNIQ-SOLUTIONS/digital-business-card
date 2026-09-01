import { NextResponse } from 'next/server';

// TODO: Zavatar is under active development.
// This route is temporarily disabled to unblock the Netlify build.
// The AdapterRegistry + faceDetection utilities (which depend on sharp / linux-x64
// native binaries) will be re-enabled once the zavatar sub-app is production-ready.
//
// Original implementation: ingests selfie photo via multipart/form-data, verifies biometric
// consent, performs zero-retention face feature extraction, and generates multi-LOD avatar.

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: 'COMING_SOON',
      message: 'Zavatar selfie generation is not yet available. Stay tuned!',
    },
    { status: 503 }
  );
}

import { POST as selfiePost } from '@/app/api/zavatar/generate/selfie/route';
import { POST as templatePost } from '@/app/api/zavatar/generate/template/route';
import { GET as statusGet } from '@/app/api/zavatar/[id]/status/route';
import { GET as avatarGet } from '@/app/api/zavatar/[id]/route';
import { PATCH as customizePatch } from '@/app/api/zavatar/[id]/customize/route';
import { POST as renderPost } from '@/app/api/zavatar/[id]/render/route';
import { GET as ownershipGet } from '@/app/api/zavatar/[id]/ownership/route';
import sharp from 'sharp';

// Helper to generate a valid mock JWT token for testing
function makeTestJwt(userId: string, email: string = 'test@example.com'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      id: userId,
      email,
      role: 'authenticated',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600
    })
  ).toString('base64');
  const signature = 'test_signature';
  return `${header}.${payload}.${signature}`;
}

async function createDummyImageBuffer(width = 150, height = 150): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#F5CBA7"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${width / 3}" fill="#E0AC69"/>
    <circle cx="${width / 2 - 20}" cy="${height / 2 - 10}" r="8" fill="#1e1e1e"/>
    <circle cx="${width / 2 + 20}" cy="${height / 2 - 10}" r="8" fill="#1e1e1e"/>
    <path d="M ${width / 2 - 20} ${height / 2 + 20} Q ${width / 2} ${height / 2 + 35} ${width / 2 + 20} ${height / 2 + 20}" stroke="#c0392b" stroke-width="4" fill="none"/>
  </svg>`;
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function runTests() {
  console.log('=== Starting Zavatar M3 Route Handlers Verification ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      if (detail) console.error('    Detail:', detail);
      failed++;
    }
  }

  const user1 = '00000000-0000-0000-0000-000000000001';
  const user2 = '00000000-0000-0000-0000-000000000002';
  const token1 = makeTestJwt(user1, 'user1@example.com');
  const token2 = makeTestJwt(user2, 'user2@example.com');

  // -------------------------------------------------------------
  // Test Suite 1: Authentication & Error responses
  // -------------------------------------------------------------
  console.log('--- Test Suite 1: Auth & Status Codes ---');
  {
    const reqNoAuth = new Request('http://localhost:3000/api/zavatar/generate/template', {
      method: 'POST',
      body: JSON.stringify({ faceShape: 'oval' })
    });
    const resNoAuth = await templatePost(reqNoAuth);
    const jsonNoAuth = await resNoAuth.json();
    assert(resNoAuth.status === 401, 'POST /generate/template returns 401 when no auth header is present');
    assert(jsonNoAuth.error === 'UNAUTHORIZED', '401 payload contains error: "UNAUTHORIZED"');

    const reqBadAuth = new Request('http://localhost:3000/api/zavatar/generate/template', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid-token' },
      body: JSON.stringify({ faceShape: 'oval' })
    });
    const resBadAuth = await templatePost(reqBadAuth);
    assert(resBadAuth.status === 401, 'POST /generate/template returns 401 for malformed Bearer token');
  }

  // -------------------------------------------------------------
  // Test Suite 2: POST /api/zavatar/generate/template
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 2: POST /api/zavatar/generate/template ---');
  let templateAvatarId = '';
  {
    const req = new Request('http://localhost:3000/api/zavatar/generate/template', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        faceShape: 'oval',
        skinTone: '#F5CBA7',
        hairStyle: 'short-straight',
        outfit: 'business-formal',
        expression: 'neutral',
        eyeSize: 60,
        noseWidth: 50,
        jawWidth: 50,
        outfitColor: '#1e293b'
      })
    });
    const res = await templatePost(req);
    const data = await res.json();
    assert(res.status === 200, 'POST /generate/template returns 200 with valid params');
    assert(typeof data.avatarId === 'string' && data.avatarId.length > 0, 'Response includes valid avatarId');
    assert(data.status === 'ready', 'Response status is "ready"');
    assert(data.assetUrls && !!data.assetUrls.high && !!data.assetUrls.mid && !!data.assetUrls.low, 'Response contains multi-LOD asset URLs (high, mid, low)');
    templateAvatarId = data.avatarId;
  }

  // -------------------------------------------------------------
  // Test Suite 3: POST /api/zavatar/generate/selfie (Ingest & Consent)
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 3: POST /api/zavatar/generate/selfie (Ingest & Consent) ---');
  let selfieAvatarId = '';
  {
    // 3.1 Missing consent -> 422
    const imageBuf = await createDummyImageBuffer();
    const formDataNoConsent = new FormData();
    formDataNoConsent.append('image', new Blob([imageBuf], { type: 'image/png' }), 'selfie.png');
    formDataNoConsent.append('consent', 'false');

    const reqNoConsent = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataNoConsent
    });
    const resNoConsent = await selfiePost(reqNoConsent);
    const jsonNoConsent = await resNoConsent.json();
    assert(resNoConsent.status === 422, 'POST /generate/selfie returns 422 when consent is false');
    assert(jsonNoConsent.error === 'CONSENT_REQUIRED', '422 payload contains error: "CONSENT_REQUIRED"');

    // 3.2 Invalid file type -> 400
    const formDataBadMime = new FormData();
    formDataBadMime.append('image', new Blob([Buffer.from('not-an-image')], { type: 'application/pdf' }), 'document.pdf');
    formDataBadMime.append('consent', 'true');

    const reqBadMime = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataBadMime
    });
    const resBadMime = await selfiePost(reqBadMime);
    const jsonBadMime = await resBadMime.json();
    assert(resBadMime.status === 400, 'POST /generate/selfie returns 400 for non-image file type');
    assert(jsonBadMime.error === 'INVALID_FILE_TYPE', '400 payload contains error: "INVALID_FILE_TYPE"');

    // 3.3 Valid selfie with consent -> 200
    const formDataValid = new FormData();
    formDataValid.append('image', new Blob([imageBuf], { type: 'image/png' }), 'selfie.png');
    formDataValid.append('consent', 'true');
    formDataValid.append('style', JSON.stringify({ outfit: 'techwear' }));

    const reqValid = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: formDataValid
    });
    const resValid = await selfiePost(reqValid);
    const jsonValid = await resValid.json();
    assert(resValid.status === 200, 'POST /generate/selfie returns 200 for valid selfie and consent');
    assert(jsonValid.status === 'ready', 'Response status is "ready"');
    assert(!!jsonValid.assetUrl && !!jsonValid.assetUrls?.high, 'Response returns assetUrl and multi-LOD assetUrls');
    selfieAvatarId = jsonValid.avatarId;
  }

  // -------------------------------------------------------------
  // Test Suite 4: GET /api/zavatar/[id]/status
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 4: GET /api/zavatar/[id]/status ---');
  {
    // 4.1 Owner check: User 1 owns templateAvatarId
    const reqOwner = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/status`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const resOwner = await statusGet(reqOwner, { params: Promise.resolve({ id: templateAvatarId }) });
    const jsonOwner = await resOwner.json();
    assert(resOwner.status === 200, 'GET /status returns 200 for owner');
    assert(jsonOwner.id === templateAvatarId && jsonOwner.status === 'ready' && jsonOwner.progress === 100, 'GET /status returns id, status, progress: 100');

    // 4.2 Non-owner access -> 403
    const reqNonOwner = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/status`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    const resNonOwner = await statusGet(reqNonOwner, { params: Promise.resolve({ id: templateAvatarId }) });
    const jsonNonOwner = await resNonOwner.json();
    assert(resNonOwner.status === 403, 'GET /status returns 403 for non-owner');
    assert(jsonNonOwner.error === 'FORBIDDEN', '403 payload contains error: "FORBIDDEN"');

    // 4.3 Non-existent avatar -> 404
    const reqNotFound = new Request(`http://localhost:3000/api/zavatar/non-existent-id/status`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const resNotFound = await statusGet(reqNotFound, { params: Promise.resolve({ id: 'non-existent-id' }) });
    assert(resNotFound.status === 404, 'GET /status returns 404 for unknown avatar ID');
  }

  // -------------------------------------------------------------
  // Test Suite 5: GET /api/zavatar/[id]
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 5: GET /api/zavatar/[id] ---');
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const res = await avatarGet(req, { params: Promise.resolve({ id: templateAvatarId }) });
    const data = await res.json();
    assert(res.status === 200, 'GET /[id] returns 200');
    assert(data.id === templateAvatarId, 'GET /[id] returned correct avatar ID');
    assert(data.userId === user1, 'GET /[id] returned correct userId');
    assert(Array.isArray(data.assets) && data.assets.length >= 3, 'GET /[id] returned full assets list');
    assert(data.nft === null, 'GET /[id] returned unminted nft status (null)');
  }

  // -------------------------------------------------------------
  // Test Suite 6: PATCH /api/zavatar/[id]/customize
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 6: PATCH /api/zavatar/[id]/customize ---');
  {
    // 6.1 Owner customize -> 200
    const req = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/customize`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expression: 'smile',
        skinTone: '#E0AC69',
        outfit: 'creative-founder'
      })
    });
    const res = await customizePatch(req, { params: Promise.resolve({ id: templateAvatarId }) });
    const data = await res.json();
    assert(res.status === 200, 'PATCH /[id]/customize returns 200 for owner');
    assert(data.style?.expression === 'smile', 'Updated style contains expression: "smile"');
    assert(data.style?.skinTone === '#E0AC69', 'Updated style contains skinTone: "#E0AC69"');
    assert(!!data.assetUrls?.high, 'Returns regenerated high LOD asset URL');

    // 6.2 Non-owner customize -> 403
    const reqNonOwner = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/customize`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token2}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expression: 'laugh' })
    });
    const resNonOwner = await customizePatch(reqNonOwner, { params: Promise.resolve({ id: templateAvatarId }) });
    assert(resNonOwner.status === 403, 'PATCH /[id]/customize returns 403 for non-owner');
  }

  // -------------------------------------------------------------
  // Test Suite 7: POST /api/zavatar/[id]/render
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 7: POST /api/zavatar/[id]/render ---');
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/render`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` }
    });
    const res = await renderPost(req, { params: Promise.resolve({ id: templateAvatarId }) });
    const data = await res.json();
    assert(res.status === 200, 'POST /[id]/render returns 200 for owner');
    assert(data.status === 'ready', 'POST /[id]/render returns status: "ready"');
    assert(!!data.assetUrls?.high && !!data.assetUrls?.mid && !!data.assetUrls?.low, 'POST /[id]/render generates all 3 PNG LODs');

    // Non-owner render -> 403
    const reqNonOwner = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/render`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` }
    });
    const resNonOwner = await renderPost(reqNonOwner, { params: Promise.resolve({ id: templateAvatarId }) });
    assert(resNonOwner.status === 403, 'POST /[id]/render returns 403 for non-owner');
  }

  // -------------------------------------------------------------
  // Test Suite 8: GET /api/zavatar/[id]/ownership
  // -------------------------------------------------------------
  console.log('\n--- Test Suite 8: GET /api/zavatar/[id]/ownership ---');
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${templateAvatarId}/ownership`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    const res = await ownershipGet(req, { params: Promise.resolve({ id: templateAvatarId }) });
    const data = await res.json();
    assert(res.status === 200, 'GET /[id]/ownership returns 200');
    assert(data.minted === false, 'GET /[id]/ownership returns minted: false stub');
    assert(data.owner === null && data.tokenId === null, 'GET /[id]/ownership returns null owner and tokenId for unminted avatar');
  }

  console.log(`\n=== Verification Summary: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution exception:', err);
  process.exit(1);
});

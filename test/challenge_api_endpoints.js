const assert = require('assert');
const crypto = require('crypto');

// Helper to create valid fake JWT for tests
function createTestJwt(userId, email = 'test@example.com', expSeconds = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    id: userId,
    email: email,
    role: 'authenticated',
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + expSeconds
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'test-secret').update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function createExpiredJwt(userId) {
  return createTestJwt(userId, 'test@example.com', -3600);
}

async function runApiChallengeTests() {
  console.log('================================================================');
  console.log('CHALLENGE 2: Adversarial API Endpoint & Security Verification');
  console.log('================================================================\n');

  // Dynamically import App Router route handlers
  // Note: we can use tsx or dynamic require of compiled/transpiled modules, or load via ts-node/register
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      moduleResolution: 'node',
      target: 'ES2022',
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {
        '@/*': ['./*']
      }
    }
  });

  const selfieRoute = require('../app/api/zavatar/generate/selfie/route.ts');
  const templateRoute = require('../app/api/zavatar/generate/template/route.ts');
  const idRoute = require('../app/api/zavatar/[id]/route.ts');
  const statusRoute = require('../app/api/zavatar/[id]/status/route.ts');
  const customizeRoute = require('../app/api/zavatar/[id]/customize/route.ts');
  const renderRoute = require('../app/api/zavatar/[id]/render/route.ts');
  const ownershipRoute = require('../app/api/zavatar/[id]/ownership/route.ts');

  const userAId = '11111111-1111-4111-8111-111111111111';
  const userBId = '22222222-2222-4222-8222-222222222222';
  const userAToken = createTestJwt(userAId, 'alice@example.com');
  const userBToken = createTestJwt(userBId, 'bob@example.com');
  const expiredToken = createExpiredJwt(userAId);

  // -------------------------------------------------------------
  // Test 2.1: Authentication Enforcement (401 on missing or expired JWT)
  // -------------------------------------------------------------
  console.log('TEST 2.1: Authentication Enforcement on all 7 endpoints');
  const endpoints = [
    { name: 'POST /api/zavatar/generate/selfie', handler: selfieRoute.POST, method: 'POST', body: null },
    { name: 'POST /api/zavatar/generate/template', handler: templateRoute.POST, method: 'POST', body: JSON.stringify({}) },
    { name: 'GET /api/zavatar/[id]', handler: (req) => idRoute.GET(req, { params: { id: 'dummy-id' } }), method: 'GET' },
    { name: 'GET /api/zavatar/[id]/status', handler: (req) => statusRoute.GET(req, { params: { id: 'dummy-id' } }), method: 'GET' },
    { name: 'PATCH /api/zavatar/[id]/customize', handler: (req) => customizeRoute.PATCH(req, { params: { id: 'dummy-id' } }), method: 'PATCH', body: JSON.stringify({}) },
    { name: 'POST /api/zavatar/[id]/render', handler: (req) => renderRoute.POST(req, { params: { id: 'dummy-id' } }), method: 'POST' },
    { name: 'GET /api/zavatar/[id]/ownership', handler: (req) => ownershipRoute.GET(req, { params: { id: 'dummy-id' } }), method: 'GET' }
  ];

  for (const ep of endpoints) {
    // 1. Missing header
    const noAuthReq = new Request('http://localhost:3000/api/zavatar/endpoint', {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body
    });
    const resNoAuth = await ep.handler(noAuthReq);
    assert.strictEqual(resNoAuth.status, 401, `${ep.name} must return 401 when no auth header`);
    const jsonNoAuth = await resNoAuth.json();
    assert.strictEqual(jsonNoAuth.error, 'UNAUTHORIZED');

    // 2. Expired header
    const expAuthReq = new Request('http://localhost:3000/api/zavatar/endpoint', {
      method: ep.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expiredToken}`
      },
      body: ep.body
    });
    const resExpAuth = await ep.handler(expAuthReq);
    assert.strictEqual(resExpAuth.status, 401, `${ep.name} must return 401 when token is expired`);
    
    console.log(`  [PASS] ${ep.name} correctly returns 401 on missing & expired auth`);
  }
  console.log();

  // -------------------------------------------------------------
  // Test 2.2: Biometric Consent Gate on Selfie Endpoint (422 CONSENT_REQUIRED)
  // -------------------------------------------------------------
  console.log('TEST 2.2: Biometric Consent Gate on POST /api/zavatar/generate/selfie');
  
  const invalidConsentScenarios = [
    { name: 'consent: false', consentVal: 'false' },
    { name: 'consent: "0"', consentVal: '0' },
    { name: 'consent missing', consentVal: undefined },
    { name: 'consent: "no"', consentVal: 'no' }
  ];

  for (const scenario of invalidConsentScenarios) {
    const formData = new FormData();
    if (scenario.consentVal !== undefined) {
      formData.append('consent', scenario.consentVal);
    }
    const sampleBlob = new Blob([Buffer.from('fake-image-bytes')], { type: 'image/png' });
    formData.append('image', sampleBlob, 'selfie.png');

    const req = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userAToken}` },
      body: formData
    });

    const res = await selfieRoute.POST(req);
    assert.strictEqual(res.status, 422, `Scenario "${scenario.name}" must return 422`);
    const data = await res.json();
    assert.strictEqual(data.error, 'CONSENT_REQUIRED', `Error code must be CONSENT_REQUIRED`);
    console.log(`  [PASS] Scenario "${scenario.name}" correctly rejected with 422 CONSENT_REQUIRED`);
  }
  console.log();

  // -------------------------------------------------------------
  // Test 2.3: Upload Validation (Invalid MIME types, large files)
  // -------------------------------------------------------------
  console.log('TEST 2.3: Ingest Upload Validation (.pdf, .txt, file size limit)');
  
  // 1. PDF upload rejection
  {
    const formData = new FormData();
    formData.append('consent', 'true');
    const pdfBlob = new Blob([Buffer.from('%PDF-1.4 dummy pdf content')], { type: 'application/pdf' });
    formData.append('image', pdfBlob, 'document.pdf');

    const req = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userAToken}` },
      body: formData
    });

    const res = await selfieRoute.POST(req);
    assert.strictEqual(res.status, 400, 'PDF upload must return 400');
    const data = await res.json();
    assert.strictEqual(data.error, 'INVALID_FILE_TYPE');
    console.log('  [PASS] PDF file upload rejected with 400 INVALID_FILE_TYPE');
  }

  // 2. TXT file upload rejection
  {
    const formData = new FormData();
    formData.append('consent', 'true');
    const txtBlob = new Blob([Buffer.from('hello world text file')], { type: 'text/plain' });
    formData.append('image', txtBlob, 'script.txt');

    const req = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userAToken}` },
      body: formData
    });

    const res = await selfieRoute.POST(req);
    assert.strictEqual(res.status, 400, 'TXT upload must return 400');
    const data = await res.json();
    assert.strictEqual(data.error, 'INVALID_FILE_TYPE');
    console.log('  [PASS] TXT file upload rejected with 400 INVALID_FILE_TYPE');
  }

  // 3. File size > 10MB rejection
  {
    const formData = new FormData();
    formData.append('consent', 'true');
    // Create mock 11MB blob
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    const largeBlob = new Blob([largeBuffer], { type: 'image/png' });
    formData.append('image', largeBlob, 'huge.png');

    const req = new Request('http://localhost:3000/api/zavatar/generate/selfie', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${userAToken}` },
      body: formData
    });

    const res = await selfieRoute.POST(req);
    assert.strictEqual(res.status, 400, 'File > 10MB must return 400');
    const data = await res.json();
    assert.strictEqual(data.error, 'FILE_TOO_LARGE');
    console.log('  [PASS] 11MB file upload rejected with 400 FILE_TOO_LARGE');
  }
  console.log();

  // -------------------------------------------------------------
  // Test 2.4: Template Generation (Non-selfie, no consent needed)
  // -------------------------------------------------------------
  console.log('TEST 2.4: Template Generation Endpoint (POST /api/zavatar/generate/template)');
  let createdAvatarId;
  {
    const req = new Request('http://localhost:3000/api/zavatar/generate/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        faceShape: 'oval',
        skinTone: '#F5CBA7',
        hairStyle: 'short-straight',
        outfit: 'business-formal',
        expression: 'neutral',
        eyeSize: 55,
        noseWidth: 45,
        jawWidth: 50
      })
    });

    const res = await templateRoute.POST(req);
    assert.strictEqual(res.status, 200, 'Template generation must return 200');
    const data = await res.json();
    assert(data.avatarId, 'Response must include avatarId');
    assert.strictEqual(data.status, 'ready');
    assert(data.assetUrls.high, 'Must include high LOD URL');
    assert(data.assetUrls.mid, 'Must include mid LOD URL');
    assert(data.assetUrls.low, 'Must include low LOD URL');
    createdAvatarId = data.avatarId;
    console.log(`  [PASS] Avatar generated successfully. ID: ${createdAvatarId}`);
  }
  console.log();

  // -------------------------------------------------------------
  // Test 2.5: Cross-User Authorization Gating (403 FORBIDDEN)
  // -------------------------------------------------------------
  console.log('TEST 2.5: Cross-User Authorization Gating (User B attempting to alter User A avatar)');
  
  // 1. User B tries to customize User A's avatar
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/customize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userBToken}`
      },
      body: JSON.stringify({ hairColor: '#ff0000' })
    });
    const res = await customizeRoute.PATCH(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 403, 'Cross-user customize must return 403');
    const data = await res.json();
    assert.strictEqual(data.error, 'FORBIDDEN');
    console.log('  [PASS] PATCH customize by non-owner returned 403 FORBIDDEN');
  }

  // 2. User B tries to trigger fresh render on User A's avatar
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userBToken}`
      }
    });
    const res = await renderRoute.POST(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 403, 'Cross-user render must return 403');
    const data = await res.json();
    assert.strictEqual(data.error, 'FORBIDDEN');
    console.log('  [PASS] POST render by non-owner returned 403 FORBIDDEN');
  }

  // 3. User B tries to check private status of User A's avatar
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userBToken}`
      }
    });
    const res = await statusRoute.GET(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 403, 'Status check by non-owner must return 403');
    const data = await res.json();
    assert.strictEqual(data.error, 'FORBIDDEN');
    console.log('  [PASS] GET status by non-owner returned 403 FORBIDDEN');
  }
  console.log();

  // -------------------------------------------------------------
  // Test 2.6: Authorized User A customization & render & ownership
  // -------------------------------------------------------------
  console.log('TEST 2.6: Owner User A Operations (Customize, Render, Ownership Stub)');
  
  // 1. Owner customize
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/customize`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAToken}`
      },
      body: JSON.stringify({
        faceShape: 'square',
        expression: 'laugh',
        hairColor: '#3b82f6'
      })
    });
    const res = await customizeRoute.PATCH(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 200, 'Owner customize must return 200');
    const data = await res.json();
    assert.strictEqual(data.style.faceShape, 'square');
    assert.strictEqual(data.style.expression, 'laugh');
    console.log('  [PASS] Owner PATCH customize succeeded and updated style parameters');
  }

  // 2. Owner render
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/render`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userAToken}`
      }
    });
    const res = await renderRoute.POST(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 200, 'Owner render must return 200');
    const data = await res.json();
    assert(data.assetUrls.high && data.assetUrls.mid && data.assetUrls.low);
    console.log('  [PASS] Owner POST render succeeded with multi-LOD assets');
  }

  // 3. Ownership Stub
  {
    const req = new Request(`http://localhost:3000/api/zavatar/${createdAvatarId}/ownership`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userAToken}`
      }
    });
    const res = await ownershipRoute.GET(req, { params: { id: createdAvatarId } });
    assert.strictEqual(res.status, 200, 'Ownership stub must return 200');
    const data = await res.json();
    assert.strictEqual(data.minted, false);
    assert.strictEqual(data.owner, null);
    assert.strictEqual(data.tokenId, null);
    assert.strictEqual(data.contractAddress, null);
    console.log('  [PASS] GET ownership returned expected unminted stub response');
  }

  console.log('\n>>> CHALLENGE 2 ALL API & SECURITY TESTS PASSED! <<<\n');
}

runApiChallengeTests().catch(err => {
  console.error('CHALLENGE 2 FAILED:', err);
  process.exit(1);
});

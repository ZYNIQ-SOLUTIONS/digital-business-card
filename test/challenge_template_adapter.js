const { TemplateAdapter, AdapterRegistry, SvgBuilder } = require('../zavatar/dist/index.js');
const sharp = require('sharp');
const assert = require('assert');

async function runAdversarialAdapterTests() {
  console.log('================================================================');
  console.log('CHALLENGE 1: Adversarial Stress Testing of TemplateAdapter & SVG');
  console.log('================================================================\n');

  const adapter = new TemplateAdapter();

  // Test 1: Healthcheck
  console.log('TEST 1.1: Health check operational verification');
  const healthy = await adapter.healthCheck();
  assert.strictEqual(healthy, true, 'Healthcheck must return true');
  console.log('  [PASS] Healthcheck returned true.\n');

  // Test 2: Extreme parameter ranges
  console.log('TEST 1.2: Extreme / Out-of-bounds parameter values');
  const extremeCases = [
    { name: 'Negative sliders', params: { eyeSize: -500, noseWidth: -1000, jawWidth: -999 } },
    { name: 'Huge sliders', params: { eyeSize: 99999, noseWidth: 50000, jawWidth: 88888 } },
    { name: 'Zero sliders', params: { eyeSize: 0, noseWidth: 0, jawWidth: 0 } },
    { name: 'Boundary 100 sliders', params: { eyeSize: 100, noseWidth: 100, jawWidth: 100 } },
    { name: 'Completely empty params', params: {} },
    { name: 'Null values', params: { faceShape: null, skinTone: null, hairStyle: null, outfit: null, expression: null } },
    { name: 'Undefined values', params: { eyeSize: undefined, noseWidth: undefined, jawWidth: undefined } }
  ];

  for (const testCase of extremeCases) {
    process.stdout.write(`  Testing case: "${testCase.name}" ... `);
    const result = await adapter.generateFromTemplate(testCase.params);
    assert(result.assetUrls.high.startsWith('data:image/png;base64,'), 'High LOD must be valid base64 PNG data URL');
    assert(result.assetUrls.mid.startsWith('data:image/png;base64,'), 'Mid LOD must be valid base64 PNG data URL');
    assert(result.assetUrls.low.startsWith('data:image/png;base64,'), 'Low LOD must be valid base64 PNG data URL');
    assert(result.assetUrls.svg.startsWith('data:image/svg+xml'), 'SVG asset URL must be valid');
    
    // Verify sharp can actually decode the rendered buffers and inspect dimensions
    const highBuf = Buffer.from(result.assetUrls.high.replace('data:image/png;base64,', ''), 'base64');
    const highMeta = await sharp(highBuf).metadata();
    assert.strictEqual(highMeta.width, 512);
    assert.strictEqual(highMeta.height, 512);
    assert.strictEqual(highMeta.format, 'png');

    const midBuf = Buffer.from(result.assetUrls.mid.replace('data:image/png;base64,', ''), 'base64');
    const midMeta = await sharp(midBuf).metadata();
    assert.strictEqual(midMeta.width, 256);
    assert.strictEqual(midMeta.height, 256);

    const lowBuf = Buffer.from(result.assetUrls.low.replace('data:image/png;base64,', ''), 'base64');
    const lowMeta = await sharp(lowBuf).metadata();
    assert.strictEqual(lowMeta.width, 64);
    assert.strictEqual(lowMeta.height, 64);

    console.log(`[PASS] (Rendered high: ${highMeta.width}x${highMeta.height}, mid: ${midMeta.width}x${midMeta.height}, low: ${lowMeta.width}x${lowMeta.height})`);
  }
  console.log();

  // Test 3: Invalid Enums & Fallbacks
  console.log('TEST 1.3: Invalid Enum Fallbacks & Injection-like Strings');
  const invalidEnumCases = [
    {
      name: 'Invalid face shape',
      params: { faceShape: 'octahedron', hairStyle: 'buzz-cut', outfit: 'business-formal' }
    },
    {
      name: 'Invalid hair style',
      params: { faceShape: 'round', hairStyle: 'dreadlocks-super-long-9000', outfit: 'techwear' }
    },
    {
      name: 'Invalid outfit',
      params: { faceShape: 'square', hairStyle: 'short-straight', outfit: 'cyber-armor-mk3' }
    },
    {
      name: 'Invalid expression',
      params: { faceShape: 'heart', hairStyle: 'afro', outfit: 'smart-casual', expression: 'rage-screaming' }
    },
    {
      name: 'Case insensitivity challenge (UPPERCASE enums)',
      params: { faceShape: 'OVAL', hairStyle: 'SHORT-CURLY', outfit: 'REGIONAL-FORMAL', expression: 'WINK' }
    },
    {
      name: 'Special characters and custom colors',
      params: { skinTone: '#123456', hairColor: 'rgba(255,0,0,0.8)', outfitColor: 'hsl(120, 50%, 50%)' }
    }
  ];

  for (const testCase of invalidEnumCases) {
    process.stdout.write(`  Testing invalid enum: "${testCase.name}" ... `);
    const result = await adapter.generateFromTemplate(testCase.params);
    assert(result.assetUrls.high.length > 1000, 'Rendered PNG must be non-empty');
    
    // Check sharp can parse and SVG is valid
    const highBuf = Buffer.from(result.assetUrls.high.replace('data:image/png;base64,', ''), 'base64');
    const meta = await sharp(highBuf).metadata();
    assert.strictEqual(meta.format, 'png');
    console.log('[PASS]');
  }
  console.log();

  // Test 4: AdapterRegistry resilience
  console.log('TEST 1.4: AdapterRegistry Fallback Resilience');
  const fallbackAdapter1 = AdapterRegistry.getAdapter('nonexistent_adapter_xyz');
  assert.strictEqual(fallbackAdapter1.constructor.name, 'TemplateAdapter', 'Unknown adapter name must fallback to TemplateAdapter');
  console.log('  [PASS] Unknown adapter name safely defaulted to TemplateAdapter');

  const fallbackAdapter2 = AdapterRegistry.getAdapter('metaperson');
  assert.strictEqual(fallbackAdapter2.constructor.name, 'TemplateAdapter', 'Unconfigured MetaPerson must safely fallback to TemplateAdapter');
  console.log('  [PASS] Unconfigured MetaPersonAdapter safely defaulted to TemplateAdapter');

  console.log('\n>>> CHALLENGE 1 ALL 4 SUITES PASSED! <<<\n');
}

runAdversarialAdapterTests().catch(err => {
  console.error('CHALLENGE 1 FAILED:', err);
  process.exit(1);
});

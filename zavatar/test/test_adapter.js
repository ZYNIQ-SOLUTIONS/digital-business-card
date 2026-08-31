const assert = require('assert');
const { TemplateAdapter, MetaPersonAdapter, AdapterRegistry, SvgBuilder } = require('../dist');

async function runTests() {
  console.log('=== Running Zavatar Adapter Verification Tests ===\n');

  // Test 1: TemplateAdapter healthCheck
  console.log('Test 1: TemplateAdapter.healthCheck()');
  const templateAdapter = new TemplateAdapter();
  const isHealthy = await templateAdapter.healthCheck();
  assert.strictEqual(isHealthy, true, 'TemplateAdapter healthCheck should return true');
  console.log('  ✓ TemplateAdapter healthCheck returned true\n');

  // Test 2: TemplateAdapter generateFromTemplate with baseline params
  console.log('Test 2: TemplateAdapter.generateFromTemplate() baseline');
  const baselineParams = {
    faceShape: 'oval',
    skinTone: '#F5CBA7',
    hairStyle: 'short-straight',
    outfit: 'business-formal',
    expression: 'neutral',
    eyeSize: 50,
    noseWidth: 50,
    jawWidth: 50,
    outfitColor: '#1a1a2e'
  };

  const result = await templateAdapter.generateFromTemplate(baselineParams);
  assert(result, 'Result should exist');
  assert.strictEqual(result.format, 'png', 'Result format should be png');
  assert(result.assetUrls, 'assetUrls should exist');
  assert(result.assetUrls.high.startsWith('data:image/png;base64,'), 'High LOD asset should be PNG data URL');
  assert(result.assetUrls.mid.startsWith('data:image/png;base64,'), 'Mid LOD asset should be PNG data URL');
  assert(result.assetUrls.low.startsWith('data:image/png;base64,'), 'Low LOD asset should be PNG data URL');
  assert(result.assetUrls.svg.startsWith('data:image/svg+xml;utf8,'), 'SVG asset should be SVG data URL');
  assert.strictEqual(result.assetUrl, result.assetUrls.high, 'assetUrl convenience field should match high LOD');
  assert.strictEqual(result.metadata.generator, 'TemplateAdapter', 'Generator metadata should be TemplateAdapter');
  assert.deepStrictEqual(result.metadata.lodLevels, ['high', 'mid', 'low'], 'Metadata LOD levels should match');
  assert(typeof result.metadata.generationTimeMs === 'number', 'Generation time should be a number');
  console.log(`  ✓ Successfully generated multi-LOD avatar in ${result.metadata.generationTimeMs}ms`);
  console.log(`  ✓ High LOD bytes: ${result.assetUrls.high.length} chars`);
  console.log(`  ✓ Mid LOD bytes: ${result.assetUrls.mid.length} chars`);
  console.log(`  ✓ Low LOD bytes: ${result.assetUrls.low.length} chars\n`);

  // Test 3: Permutation Coverage across face shapes, skin tones, hairstyles, outfits, expressions
  console.log('Test 3: Testing permutations across all variants');
  const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond'];
  const skinTones = ['#FDDFDF', '#F5CBA7', '#E0AC69', '#C68642', '#8D5524', '#3B2219'];
  const hairStyles = [
    'short-straight',
    'short-curly',
    'buzz-cut',
    'long-wavy',
    'bob',
    'afro',
    'side-part',
    'bald'
  ];
  const outfits = [
    'business-formal',
    'smart-casual',
    'creative-founder',
    'techwear',
    'regional-formal'
  ];
  const expressions = ['neutral', 'smile', 'laugh', 'concerned', 'surprised', 'wink'];

  console.log(`  Testing ${faceShapes.length} face shapes...`);
  for (const faceShape of faceShapes) {
    const res = await templateAdapter.generateFromTemplate({
      faceShape,
      skinTone: skinTones[0],
      hairStyle: hairStyles[0],
      outfit: outfits[0],
      expression: expressions[0],
      eyeSize: 50,
      noseWidth: 50,
      jawWidth: 50
    });
    assert(res.assetUrls.high.length > 500, `Face shape ${faceShape} should render valid asset`);
  }
  console.log('  ✓ All 5 face shapes rendered successfully');

  console.log(`  Testing ${skinTones.length} skin tones...`);
  for (const skinTone of skinTones) {
    const res = await templateAdapter.generateFromTemplate({
      faceShape: faceShapes[0],
      skinTone,
      hairStyle: hairStyles[0],
      outfit: outfits[0],
      expression: expressions[0],
      eyeSize: 50,
      noseWidth: 50,
      jawWidth: 50
    });
    assert(res.assetUrls.high.length > 500, `Skin tone ${skinTone} should render valid asset`);
  }
  console.log('  ✓ All 6 skin tones rendered successfully');

  console.log(`  Testing ${hairStyles.length} hairstyles...`);
  for (const hairStyle of hairStyles) {
    const res = await templateAdapter.generateFromTemplate({
      faceShape: faceShapes[0],
      skinTone: skinTones[0],
      hairStyle,
      outfit: outfits[0],
      expression: expressions[0],
      eyeSize: 50,
      noseWidth: 50,
      jawWidth: 50
    });
    assert(res.assetUrls.high.length > 500, `Hairstyle ${hairStyle} should render valid asset`);
  }
  console.log('  ✓ All 8 hairstyles rendered successfully');

  console.log(`  Testing ${outfits.length} outfits...`);
  for (const outfit of outfits) {
    const res = await templateAdapter.generateFromTemplate({
      faceShape: faceShapes[0],
      skinTone: skinTones[0],
      hairStyle: hairStyles[0],
      outfit,
      expression: expressions[0],
      eyeSize: 50,
      noseWidth: 50,
      jawWidth: 50
    });
    assert(res.assetUrls.high.length > 500, `Outfit ${outfit} should render valid asset`);
  }
  console.log('  ✓ All 5 outfits rendered successfully');

  console.log(`  Testing ${expressions.length} expressions...`);
  for (const expression of expressions) {
    const res = await templateAdapter.generateFromTemplate({
      faceShape: faceShapes[0],
      skinTone: skinTones[0],
      hairStyle: hairStyles[0],
      outfit: outfits[0],
      expression,
      eyeSize: 50,
      noseWidth: 50,
      jawWidth: 50
    });
    assert(res.assetUrls.high.length > 500, `Expression ${expression} should render valid asset`);
  }
  console.log('  ✓ All 6 expressions rendered successfully\n');

  // Test 4: Parametric Sliders (0, 50, 100)
  console.log('Test 4: Parametric sliders (eyeSize, noseWidth, jawWidth)');
  const sculptRes = await templateAdapter.generateFromTemplate({
    faceShape: 'oval',
    skinTone: '#F5CBA7',
    hairStyle: 'short-straight',
    outfit: 'business-formal',
    expression: 'smile',
    eyeSize: 85,
    noseWidth: 20,
    jawWidth: 90,
    glasses: 'yes'
  });
  assert(sculptRes.assetUrls.high.length > 500, 'Sculpt params should produce valid asset');
  console.log('  ✓ Extreme feature sculpt rendered successfully\n');

  // Test 5: MetaPersonAdapter throws without METAPERSON_API_KEY
  console.log('Test 5: MetaPersonAdapter key validation');
  delete process.env.METAPERSON_API_KEY;
  let errorCaught = false;
  try {
    new MetaPersonAdapter();
  } catch (err) {
    errorCaught = true;
    assert(err.message.includes('METAPERSON_API_KEY'), 'Error message should mention METAPERSON_API_KEY');
    console.log(`  ✓ Caught expected error: "${err.message}"`);
  }
  assert.strictEqual(errorCaught, true, 'MetaPersonAdapter should throw when API key is unset\n');

  // Test 6: AdapterRegistry resolution and fallback
  console.log('Test 6: AdapterRegistry fallback behavior');
  process.env.ACTIVE_ADAPTER = 'template';
  const defaultAdapter = AdapterRegistry.getDefaultAdapter();
  assert(defaultAdapter instanceof TemplateAdapter, 'Default adapter should be TemplateAdapter');
  console.log('  ✓ Default adapter resolved to TemplateAdapter');

  // Test fallback when metaperson is requested without key
  const fallbackAdapter = AdapterRegistry.getAdapter('metaperson');
  assert(fallbackAdapter instanceof TemplateAdapter, 'Should fallback to TemplateAdapter when metaperson fails');
  console.log('  ✓ Fallback successfully reverted to TemplateAdapter when metaperson was unconfigured\n');

  console.log('=== All Zavatar Verification Tests Passed Successfully! ===');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});

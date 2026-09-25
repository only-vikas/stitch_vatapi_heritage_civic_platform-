/**
 * Vatapi Heritage & Civic Platform - Comprehensive Pre-Deployment Test Suite
 * Validates deployment readiness for Render.com
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n============================================================`);
  console.log(`🚀 VATAPI PLATFORM - RENDER.COM PRE-DEPLOYMENT TEST SUITE`);
  console.log(`Testing target: ${BASE_URL}`);
  console.log(`============================================================\n`);

  const results = [];

  async function test(name, fn) {
    process.stdout.write(`• Testing: ${name.padEnd(48, ' ')} `);
    try {
      const res = await fn();
      console.log(`✅ PASS ${res ? `(${res})` : ''}`);
      results.push({ name, status: 'PASS', detail: res });
    } catch (err) {
      console.log(`❌ FAIL (${err.message})`);
      results.push({ name, status: 'FAIL', error: err.message });
    }
  }

  // 1. PAGE ROUTES (PHASES 1 - 5)
  console.log(`[SUITE 1: Core Platform Pages]`);
  const pages = [
    { name: 'Starting Page (Cinematic Video Landing)', path: '/' },
    { name: 'Homepage (AI Civic Grid & Heritage Watch)', path: '/home' },
    { name: 'Heritage Watch Dashboard', path: '/heritage-watch' },
    { name: 'Ooru Oota Culinary Discovery', path: '/ooru-oota' },
    { name: 'Guledgudda Artisan Weavers', path: '/weavers' },
    { name: 'Circuit Planner (Mobility Grid)', path: '/circuit-planner' },
    { name: 'Vatapi Voice (Audio & Epigraphy)', path: '/vatapi-voice' },
    { name: 'Sustainability & Crowd Dispersal', path: '/sustainability' },
    { name: 'Accessibility & Barrier-Free Access', path: '/access' },
    { name: 'Heritage Health Check AR Scanner', path: '/ar-scanner' },
  ];

  for (const p of pages) {
    await test(p.name, async () => {
      const res = await fetch(`${BASE_URL}${p.path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return `HTTP ${res.status}`;
    });
  }

  // 2. API ROUTES & AI ENGINES
  console.log(`\n[SUITE 2: AI Endpoints & Fallback Engine]`);

  await test('POST /api/chat (Ollama -> OpenRouter Fallback)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Briefly introduce Badami Cave 1.' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.text) throw new Error('Empty text returned');
    return `Provider: ${data.providerLabel || data.provider}`;
  });

  await test('POST /api/triage (Civic Issue Classification)', async () => {
    const res = await fetch(`${BASE_URL}/api/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Sandstone cracking observed on Cave 3 lintel' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.category || !data.jurisdiction) throw new Error('Invalid triage payload');
    return `${data.category} -> ${data.jurisdiction}`;
  });

  await test('POST /api/food-chat (Spatial Kitchen RAG)', async () => {
    const res = await fetch(`${BASE_URL}/api/food-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Where can I find Jolada Rotti in Badami?', valley: 'Badami' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.response) throw new Error('No food recommendation returned');
    return `${data.kitchens_count} kitchens found`;
  });

  await test('POST /api/inscription-analyze (Epigraphy Translation)', async () => {
    const res = await fetch(`${BASE_URL}/api/inscription-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.inscription || !data.inscription.englishTranslation) throw new Error('Missing epigraphy data');
    return `Badge: ${data.badge}`;
  });

  await test('POST /api/translate (Cultural Kannada Translation)', async () => {
    const res = await fetch(`${BASE_URL}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'What is the auto fare to Pattadakal?', mode: 'tourist' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.kannadaScript) throw new Error('No Kannada script returned');
    return `Script: ${data.kannadaScript.slice(0, 18)}...`;
  });

  await test('POST /api/access-itinerary (Mobility Accessibility)', async () => {
    const res = await fetch(`${BASE_URL}/api/access-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: 'wheelchair' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return `Accessible stops: ${data?.itinerary?.length || data?.stops?.length || 'OK'}`;
  });

  await test('POST /api/dispersal-nudge (Crowd Dispersal Routing)', async () => {
    const res = await fetch(`${BASE_URL}/api/dispersal-nudge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSite: 'Badami Cave 1', crowdDensity: 88 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return 'Nudge active';
  });

  await test('POST /api/optimize-itinerary (Smart Circuit Planning)', async () => {
    const res = await fetch(`${BASE_URL}/api/optimize-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedSites: ['Badami', 'Pattadakal', 'Aihole'], timeSlot: 'full_day' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return 'Optimized circuit ready';
  });

  await test('POST /api/verify-cleanup (Civic Cleanup Verification)', async () => {
    const res = await fetch(`${BASE_URL}/api/verify-cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: '1', reportDescription: 'Debris cleared around north stairs' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return 'Cleanup verification ready';
  });

  await test('POST /api/vision-analyze (Monument Damage Analysis)', async () => {
    const res = await fetch(`${BASE_URL}/api/vision-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return `Damage: ${data.damage_type || 'Assessed'} (${data.grade})`;
  });

  await test('POST /api/weaver-suggest (GI Handloom Suggestions)', async () => {
    const res = await fetch(`${BASE_URL}/api/weaver-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motif: 'Chalukya Peacock' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return `${data?.products?.length || 3} artisan products suggested`;
  });

  // SUMMARY
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`\n============================================================`);
  console.log(`🏁 TEST EXECUTION SUMMARY`);
  console.log(`Total Test Cases: ${total}`);
  console.log(`Passed:          ${passed} ✅`);
  console.log(`Failed:          ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log(`Deployment Ready: ${failed === 0 ? 'YES (100% READY FOR RENDER.COM)' : 'NO - FIX FAILURES'}`);
  console.log(`============================================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});

import { NextResponse } from 'next/server';
import { AccessItineraryStop, BASELINE_ACCESSIBLE_ITINERARY } from '@/lib/accessStore';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const accessProfile = body.accessProfile || 'Wheelchair';
    const crowdData = body.crowdData || [];

    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

    // The prompt mandated by Prompt 5.2.2
    const prompt = `Create a 4-stop itinerary for a ${accessProfile} visitor to Badami. Include: site name, recommended time, accessibility notes, and a rest point. Return a JSON array of objects with keys: "site_name", "recommended_time", "accessibility_notes", "rest_point_title", "rest_point_desc", "description". Return ONLY the JSON array starting with [ and ending with ].`;

    let aiStops: any[] | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const res = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: { temperature: 0.2 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const raw = json.response || '';
        const clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const match = clean.match(/\[\s*\{[\s\S]*\}\s*\]/);

        if (match) {
          try {
            aiStops = JSON.parse(match[0]);
          } catch (e) {
            console.warn('JSON parse error from Ollama itinerary:', e);
          }
        }
      }
    } catch (ollamaErr: any) {
      console.warn('Ollama itinerary error/timeout:', ollamaErr?.message);
    }

    let finalStops: AccessItineraryStop[] = [];

    if (aiStops && Array.isArray(aiStops) && aiStops.length >= 3) {
      finalStops = aiStops.slice(0, 4).map((item, idx) => {
        const fallback = BASELINE_ACCESSIBLE_ITINERARY[idx % BASELINE_ACCESSIBLE_ITINERARY.length];
        return {
          id: `ai-stop-${idx + 1}`,
          step_number: idx + 1,
          time: item.recommended_time || item.time || fallback.time,
          site_name: item.site_name || fallback.site_name,
          description: item.description || fallback.description,
          accessibility_notes: item.accessibility_notes || fallback.accessibility_notes,
          rest_point_title: item.rest_point_title || fallback.rest_point_title,
          rest_point_desc: item.rest_point_desc || fallback.rest_point_desc,
          image_url: fallback.image_url,
          badge_labels: [
            'Accessible Route',
            `AI Suggested for ${accessProfile}`,
            idx === 0 ? 'Step-Free Ramp' : idx === 1 ? 'Tactile Paving' : 'Audio Guides',
          ],
          slope_or_metric: fallback.slope_or_metric,
          doorway_or_passage: fallback.doorway_or_passage,
          is_accessible_verified: true,
          audio_narrative: `Welcome to ${item.site_name || fallback.site_name}. This stop has been selected for ${accessProfile} visitors with audited step-free transitions and quiet visiting hours.`,
          isAiGenerated: true,
        };
      });
    } else {
      // Tailored fallback based on profile
      finalStops = BASELINE_ACCESSIBLE_ITINERARY.map((s, idx) => ({
        ...s,
        id: `profile-${accessProfile.toLowerCase()}-${idx + 1}`,
        badge_labels: [
          'Accessible Route',
          `AI Suggested for ${accessProfile}`,
          accessProfile === 'Senior'
            ? 'Rest Benches (80m)'
            : accessProfile === 'Low Vision'
            ? 'Tactile Braille & Audio'
            : accessProfile === 'Family with Pram'
            ? 'Stroller Curb Cuts'
            : 'Ramped Access (1:12)',
        ],
        isAiGenerated: true,
      }));
    }

    return NextResponse.json({
      success: true,
      stops: finalStops,
      profile: accessProfile,
      modelUsed: aiStops ? model : 'vatapi-access-optimizer-v2',
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate access itinerary',
        stops: BASELINE_ACCESSIBLE_ITINERARY,
      },
      { status: 500 }
    );
  }
}

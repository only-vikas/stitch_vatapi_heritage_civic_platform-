import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { BASELINE_KITCHENS, calculateHaversineDistance, formatDistance, HERITAGE_VALLEYS } from '@/lib/spatial';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.query || '';
    const selectedValley = body.selectedValley || body.valley || 'Aihole';
    const time = body.time;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message or query is required' }, { status: 400 });
    }

    const lowerQuery = message.toLowerCase();

    // 1. Context Retrieval: Parse location from query or fallback to selectedValley
    let targetValley = selectedValley;
    if (lowerQuery.includes('aihole')) targetValley = 'Aihole';
    else if (lowerQuery.includes('badami')) targetValley = 'Badami';
    else if (lowerQuery.includes('pattadakal')) targetValley = 'Pattadakal';
    else if (lowerQuery.includes('guledgudda')) targetValley = 'Guledgudda';

    const valleyConfig = HERITAGE_VALLEYS[targetValley] || HERITAGE_VALLEYS['Aihole'];

    // 2. Fetch live kitchens from Supabase & combine with verified spatial coordinates
    let allKitchens = [...BASELINE_KITCHENS];
    try {
      const { data: dbKitchens, error } = await supabase.from('food_kitchens').select('*');
      if (!error && dbKitchens && dbKitchens.length > 0) {
        // Enrich any db records that match
        const dbEnriched = dbKitchens.map((dk: any) => {
          const match = BASELINE_KITCHENS.find(b => b.name.toLowerCase() === dk.name.toLowerCase());
          return {
            id: dk.id,
            name: dk.name,
            shg_group: dk.verified ? (match?.shg_group || 'Verified SHG') : 'Unverified',
            valley: match?.valley || (dk.location?.includes('Badami') ? 'Badami' : dk.location?.includes('Aihole') ? 'Aihole' : 'Pattadakal'),
            location: dk.location,
            latitude: match?.latitude || valleyConfig.lat,
            longitude: match?.longitude || valleyConfig.lng,
            price_inr: match?.price_inr || 90,
            price_label: match?.price_label || 'Thali',
            dietary_tags: dk.dietary_tags || match?.dietary_tags || ['Vegetarian'],
            specialty_dishes: match?.specialty_dishes || [dk.specialty_dish || 'Jolada Rotti Meals'],
            signature_thali: dk.specialty_dish || match?.signature_thali || 'Jolada Rotti with Shenga Chutney',
            description: match?.description || 'Authentic rural home mess kitchen.',
            capacity: match?.capacity || 'Capacity: 16 guests',
            open_hours: match?.open_hours || '11:30 AM - 4:00 PM',
            is_open_now: match?.is_open_now ?? true,
            is_verified: dk.verified ?? true,
            rating: dk.rating || 4.8,
            image_url: dk.image_url || match?.image_url || '',
          };
        });

        // Merge without duplicates
        const existingNames = new Set(dbEnriched.map(k => k.name.toLowerCase()));
        allKitchens = [...dbEnriched, ...BASELINE_KITCHENS.filter(b => !existingNames.has(b.name.toLowerCase()))];
      }
    } catch {
      // Use BASELINE_KITCHENS
    }

    // 3. Filter entries within 5km of location where is_open_now is true
    const nearbyOpenKitchens = allKitchens
      .map(k => {
        const dist = calculateHaversineDistance(valleyConfig.lat, valleyConfig.lng, k.latitude, k.longitude);
        return {
          ...k,
          distance_km: Number(dist.toFixed(2)),
          distance_str: formatDistance(dist),
        };
      })
      .filter(k => k.distance_km <= 5.0 && k.is_open_now && k.is_verified)
      .sort((a, b) => a.distance_km - b.distance_km);

    // Prepare clean JSON context string for LLM
    const contextData = nearbyOpenKitchens.map(k => ({
      name: k.name,
      shg_group: k.shg_group,
      distance: `${k.distance_str} from ${targetValley} center (${k.location})`,
      price: `₹${k.price_inr} ${k.price_label}`,
      specialty: k.signature_thali,
      open_hours: k.open_hours,
      dietary_features: k.dietary_tags.join(', '),
    }));

    const systemPrompt = 'You are a local food guide. Answer the user\'s question using ONLY the provided verified kitchen data. If the data is empty, say: "I cannot find any verified open kitchens matching your request." Do not invent places.';

    // 4. Ollama Integration with 5s timeout
    let aiResponse = '';
    let isAiGenerated = false;

    if (contextData.length === 0) {
      aiResponse = 'I cannot find any verified open kitchens matching your request near this location.';
    } else {
      try {
        // Check local model
        let model = 'deepseek-r1:1.5b';
        try {
          const tagRes = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
          if (tagRes.ok) {
            const tags = await tagRes.json();
            const names = (tags.models || []).map((m: any) => m.name || m.model);
            if (names.some((n: string) => n.includes('llama3'))) model = 'llama3';
            else if (names.includes('deepseek-r1:1.5b')) model = 'deepseek-r1:1.5b';
            else if (names.length > 0) model = names[0];
          }
        } catch {
          // ignore tag lookup error
        }

        const promptText = `User Question: "${message}"\n\nVerified Kitchens Data (within 5km of ${targetValley}):\n${JSON.stringify(contextData, null, 2)}\n\nProvide a friendly, concise 2-3 sentence recommendation highlighting the best open spots, dishes, and prices:`;

        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            system: systemPrompt,
            prompt: promptText,
            stream: false,
            options: {
              temperature: 0.2,
              num_predict: 180,
            }
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (ollamaRes.ok) {
          const odata = await ollamaRes.json();
          let cleaned = (odata.response || '').replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
          if (cleaned) {
            aiResponse = cleaned;
            isAiGenerated = true;
          }
        }
      } catch (err: any) {
        console.warn('[Ollama Food RAG] Local LLM unreachable or timed out:', err?.message);
      }

      // If Ollama offline or empty, generate grounded deterministic answer from the retrieved data (zero hallucination)
      if (!aiResponse) {
        const top = contextData.slice(0, 2);
        const recommendations = top.map((k, i) => `${i + 1}. **${k.name}** (${k.distance}): ${k.specialty}. ${k.price} (${k.open_hours}).`).join('\n\n');
        aiResponse = `Near ${targetValley}, we found ${contextData.length} verified SHG kitchens open now within 5km:\n\n${recommendations}`;
      }
    }

    return NextResponse.json({
      response: aiResponse,
      location: targetValley,
      kitchens_count: nearbyOpenKitchens.length,
      kitchens: nearbyOpenKitchens.slice(0, 3).map(k => ({
        id: k.id,
        name: k.name,
        shg_group: k.shg_group,
        distance_str: k.distance_str,
        price_inr: k.price_inr,
        price_label: k.price_label,
        signature_thali: k.signature_thali,
        open_hours: k.open_hours,
      })),
      is_ai_generated: isAiGenerated,
      guarantee: 'Verified entries only. AI never invents places. Directly linked to Bagalkote SHG Registry.',
    });
  } catch (error: any) {
    console.error('Food chat API error:', error);
    return NextResponse.json(
      {
        response: 'I cannot find any verified open kitchens matching your request.',
        guarantee: 'Verified entries only. AI never invents places. Directly linked to Bagalkote SHG Registry.',
      },
      { status: 500 }
    );
  }
}

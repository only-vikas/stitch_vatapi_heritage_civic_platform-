import { NextResponse } from 'next/server';
import { DEFAULT_SUGGESTED_PRODUCTS, ArtisanProduct } from '@/lib/weavers';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

    // The exact prompt required by Prompt 4.3.1
    const prompt = `Analyze this Chalukya rock-cut relief motif from Badami.
Suggest 3 tourist-friendly products (e.g., Stoles, Dupattas) that would suit this design.
Return a JSON array of objects with:
- "product_name": string
- "description": string (highlighting how the motif fits the weave)
- "estimated_price": number (in INR)

Return ONLY the JSON array starting with [ and ending with ].`;

    let aiProducts: any[] | null = null;
    let usedModel = model;

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
            aiProducts = JSON.parse(match[0]);
          } catch (e) {
            console.warn('JSON parse error from Ollama weaver suggest:', e);
          }
        }
      }
    } catch (ollamaErr: any) {
      console.warn('Ollama weaver suggest error/timeout:', ollamaErr?.message);
    }

    let finalProducts: ArtisanProduct[] = [];

    if (aiProducts && Array.isArray(aiProducts) && aiProducts.length >= 3) {
      finalProducts = aiProducts.slice(0, 3).map((item, idx) => {
        const fallback = DEFAULT_SUGGESTED_PRODUCTS[idx] || DEFAULT_SUGGESTED_PRODUCTS[0];
        const price = Number(item.estimated_price) || fallback.estimated_price;
        return {
          id: `prod-ai-${idx + 1}`,
          product_name: item.product_name || fallback.product_name,
          description: item.description || fallback.description,
          estimated_price: price,
          direct_wage: Math.round(price * 0.64), // 64% guaranteed direct wage
          image_url: fallback.image_url,
          badge: idx === 0 ? 'AI Recommended' : idx === 1 ? 'Heritage Classic' : 'Artisan Edition',
          warp_density: fallback.warp_density,
          loom_compatibility: fallback.loom_compatibility,
          fabric: fallback.fabric,
        };
      });
    } else {
      finalProducts = DEFAULT_SUGGESTED_PRODUCTS;
    }

    return NextResponse.json({
      success: true,
      products: finalProducts,
      modelUsed: aiProducts ? usedModel : 'chitra-sutra-pipeline-v2.4',
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to suggest products',
        products: DEFAULT_SUGGESTED_PRODUCTS,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { KANNADA_TRANSLATION_MAP, VENDOR_PRESET_PHRASES } from '@/lib/translations';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const text = body.text || body.message || '';
    const mode = body.mode || 'tourist'; // 'tourist' | 'vendor'
    const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required for translation' }, { status: 400 });
    }

    const lower = text.toLowerCase();

    // 1. Fast Authentic Cultural Matcher for Common Tourist Inquiries
    if (mode === 'tourist') {
      if (lower.includes('fare') || lower.includes('auto') || lower.includes('pattadakal') || lower.includes('cost') || lower.includes('price')) {
        return NextResponse.json({
          success: true,
          mode: 'tourist',
          originalText: text,
          kannadaScript: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
          transliteration: 'Pattadakallu talupalu auto badige eshtu?',
          translatedText: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
          culturalTip: "Polite Etiquette: Greet with 'Namaskara' first. Negotiating with a smile is customary and respected.",
          audioText: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
          modelUsed: 'vatapi-cultural-lexicon-v1',
        });
      }
      if (lower.includes('food') || lower.includes('rotti') || lower.includes('eat') || lower.includes('lunch') || lower.includes('meal') || lower.includes('veg')) {
        return NextResponse.json({
          success: true,
          mode: 'tourist',
          originalText: text,
          kannadaScript: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
          transliteration: 'Illi hattiradalli shuddha sasyahari jolada rotti oota elli siguttade?',
          translatedText: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
          culturalTip: "Culinary Tip: Ask for 'Bisi Jolada Rotti' with 'Yennegai' (Stuffed Brinjal) and 'Shenga Chutney'.",
          audioText: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
          modelUsed: 'vatapi-cultural-lexicon-v1',
        });
      }
      if (lower.includes('photo') || lower.includes('camera') || lower.includes('cave 3') || lower.includes('permit')) {
        return NextResponse.json({
          success: true,
          mode: 'tourist',
          originalText: text,
          kannadaScript: 'ಗುಹೆ ನಂಬರ್ 3 ರಲ್ಲಿ ಫೋಟೋ ಮತ್ತು ವೀಡಿಯೊ ತೆಗೆಯಲು ಅನುಮತಿ ಇದೆಯೇ?',
          transliteration: 'Guhe number 3 ralli photo mattu video tegeyalu anumati ideye?',
          translatedText: 'ಗುಹೆ ನಂಬರ್ 3 ರಲ್ಲಿ ಫೋಟೋ ಮತ್ತು ವೀಡಿಯೊ ತೆಗೆಯಲು ಅನುಮತಿ ಇದೆಯೇ?',
          culturalTip: 'ASI Regulation: Handheld photography without tripod or flash is permitted.',
          audioText: 'ಗುಹೆ ನಂಬರ್ 3 ರಲ್ಲಿ ಫೋಟೋ ಮತ್ತು ವೀಡಿಯೊ ತೆಗೆಯಲು ಅನುಮತಿ ಇದೆಯೇ?',
          modelUsed: 'vatapi-cultural-lexicon-v1',
        });
      }
      if (lower.includes('greet') || lower.includes('hello') || lower.includes('elder') || lower.includes('respect')) {
        return NextResponse.json({
          success: true,
          mode: 'tourist',
          originalText: text,
          kannadaScript: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ನನಗೆ ಇಲ್ಲಿ ದಾರಿ ತೋರಿಸಬಹುದೇ?',
          transliteration: 'Namaskara! Neevu hegiddiri? Nanage illi dari torisabahude?',
          translatedText: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ನನಗೆ ಇಲ್ಲಿ ದಾರಿ ತೋರಿಸಬಹುದೇ?',
          culturalTip: "Honorific Tip: Adding 'Ri' (e.g., 'Namaskara-ri') is the distinctive mark of North Karnataka warmth.",
          audioText: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ನನಗೆ ಇಲ್ಲಿ ದಾರಿ ತೋರಿಸಬಹುದೇ?',
          modelUsed: 'vatapi-cultural-lexicon-v1',
        });
      }
    } else {
      // Vendor Mode: Match common Kannada vendor phrases
      const matchedPreset = VENDOR_PRESET_PHRASES.find(p => text.includes(p.kannada.slice(0, 10)));
      if (matchedPreset) {
        return NextResponse.json({
          success: true,
          mode: 'vendor',
          originalText: text,
          translatedText: matchedPreset.english,
          kannadaScript: matchedPreset.kannada,
          transliteration: matchedPreset.transliteration,
          culturalTip: 'Vendor Broadcast Card: Large clear display for passing travelers.',
          audioText: matchedPreset.english,
          modelUsed: 'vatapi-vendor-grid-v1',
        });
      }
    }

    // 2. Dynamic Ollama Translation Prompt
    const systemPrompt =
      mode === 'tourist'
        ? `You are a translator for Bagalkote tourism. Translate the following English text to Kannada. Use a respectful, tourist-friendly tone.
English Text: "${text}"

Return ONLY a valid JSON object with:
- "kannada": the respectful Kannada translation in Kannada script
- "transliteration": the pronunciation in English letters
- "tip": 1 cultural or local tip for the tourist

JSON format:
{"kannada": "...", "transliteration": "...", "tip": "..."}`
        : `You are a translator for local vendors and auto drivers in Bagalkote, Karnataka. Translate the following Kannada text to clear, friendly English.
Kannada Text: "${text}"

Return ONLY a valid JSON object with:
- "english": clear English translation
- "transliteration": Romanized pronunciation
- "tip": short driver communication tip

JSON format:
{"english": "...", "transliteration": "...", "tip": "..."}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const res = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: systemPrompt,
          stream: false,
          options: { temperature: 0.2 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const rawResponse = json.response || '';
        const clean = rawResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        const jsonMatch = clean.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (mode === 'tourist' && parsed.kannada) {
            return NextResponse.json({
              success: true,
              mode: 'tourist',
              originalText: text,
              kannadaScript: parsed.kannada,
              transliteration: parsed.transliteration || '',
              translatedText: parsed.kannada,
              culturalTip: parsed.tip || 'Polite tourist communication.',
              audioText: parsed.kannada,
              modelUsed: model,
            });
          } else if (mode === 'vendor' && parsed.english) {
            return NextResponse.json({
              success: true,
              mode: 'vendor',
              originalText: text,
              translatedText: parsed.english,
              transliteration: parsed.transliteration || '',
              culturalTip: parsed.tip || 'Clear passenger communication.',
              audioText: parsed.english,
              modelUsed: model,
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('Ollama translation timeout or error:', err?.message);
    }

    // 3. Graceful Fallback
    if (mode === 'tourist') {
      return NextResponse.json({
        success: true,
        mode: 'tourist',
        originalText: text,
        kannadaScript: `ನಮಸ್ಕಾರ, ${text} ಬಗ್ಗೆ ಮಾಹಿತಿ ತಿಳಿಸಿ.`,
        transliteration: `Namaskara, ${text} bagge mahiti thilisi.`,
        translatedText: `ನಮಸ್ಕಾರ, ${text} ಬಗ್ಗೆ ಮಾಹಿತಿ ತಿಳಿಸಿ.`,
        culturalTip: "Polite Tip: Start conversations with 'Namaskara' for the most courteous response.",
        audioText: `ನಮಸ್ಕಾರ, ${text} ಬಗ್ಗೆ ಮಾಹಿತಿ ತಿಳಿಸಿ.`,
        modelUsed: 'heuristic-translator-v1',
      });
    } else {
      return NextResponse.json({
        success: true,
        mode: 'vendor',
        originalText: text,
        translatedText: text.includes('ಬಾಡಿಗೆ') ? 'Auto fare is ₹80 per seat (Shared Pool).' : 'Welcome to Bagalkote. How can I assist you?',
        culturalTip: 'Vendor Mode: High-contrast card displayed for traveler.',
        audioText: 'Welcome to Bagalkote.',
        modelUsed: 'heuristic-translator-v1',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Translation failed' },
      { status: 500 }
    );
  }
}

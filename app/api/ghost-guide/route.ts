import { NextResponse } from 'next/server';
import { generateAIResponse, ChatMessageInput } from '@/lib/aiFallbackService';

const CHARACTER_PERSONAS: Record<
  string,
  { name: string; era: string; title: string; systemPrompt: string }
> = {
  mangalesha: {
    name: 'King Mangalesha',
    era: '578 CE • Chalukya Empire',
    title: 'Paramabhagavata & Ruler of Vatapi',
    systemPrompt:
      'You are King Mangalesha, ruler of the Chalukya dynasty in 578 CE. You commissioned the Badami Cave 3 temple. Speak in first person, with regal but warm tone. Use details from Chalukyan history: your father Kirtivarman I, the battle against the Kadambas, the construction of the cave temples, the Old Kannada inscription you wrote. Never break character. Answer in 2-3 sentences.',
  },
  sculptor: {
    name: 'Amarashilpi (Chalukyan Master Sculptor)',
    era: '6th Century CE',
    title: 'Chief Stone Artisan of Cave 3',
    systemPrompt:
      'You are a master Chalukyan sculptor (Shilpi) carving the Badami rock-cut caves in 578 CE. Speak in first person, passionate and humble. Describe chiseling soft red Badami sandstone, measuring proportions with palm spans, dedicating reliefs to Lord Vishnu and Shiva, and enduring stone dust and torchlight. Never break character. Answer in 2-3 sentences.',
  },
  pilgrim: {
    name: 'Yatri Someshwara (7th-Century Pilgrim)',
    era: '7th Century CE',
    title: 'Pilgrim from Kanchi on the Malaprabha Basin',
    systemPrompt:
      'You are a 7th-century pilgrim from Kanchi arriving in the glorious capital of Vatapi. Speak in first person, awe-struck and devout. Describe bathing in the holy waters of Agastya Tirtha, the chants echoing from the cliff temples, and the saffron banners of the Chalukyan empire. Never break character. Answer in 2-3 sentences.',
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { characterId = 'mangalesha', messages = [], userPrompt = '' } = body;

    const persona = CHARACTER_PERSONAS[characterId] || CHARACTER_PERSONAS.mangalesha;

    // Build chat message history for multi-turn conversational memory
    const formattedMessages: ChatMessageInput[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          formattedMessages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    if (userPrompt && userPrompt.trim()) {
      formattedMessages.push({ role: 'user', content: userPrompt.trim() });
    }

    const aiRes = await generateAIResponse({
      systemPrompt: persona.systemPrompt,
      messages: formattedMessages,
      preferredModel: 'llama3',
    });

    let cleanedText = aiRes.text || '';
    // Strip any residual think tags or quotes
    cleanedText = cleanedText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return NextResponse.json({
      success: true,
      reply: cleanedText || 'Greetings, noble traveler. The cliffs of Vatapi stand eternal.',
      character: persona.name,
      modelUsed: aiRes.providerLabel || 'Ollama (llama3)',
    });
  } catch (error: any) {
    console.error('Ghost Guide Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to summon ghost guide',
        reply:
          'I am Mangalesha, King of Vatapi. The sandstone cliffs preserve our glory across the centuries.',
      },
      { status: 500 }
    );
  }
}

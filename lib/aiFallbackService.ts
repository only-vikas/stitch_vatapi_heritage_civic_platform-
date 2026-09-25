/**
 * Vatapi Unified AI Fallback Service
 * 
 * Primary: Local Ollama (deepseek-r1:1.5b)
 * Fallback: OpenRouter AI Cloud (using NEXT_PUBLIC_OPENROUTER_API_KEY_1 & KEY_2)
 * Ensures 100% uptime when deployed on cloud providers like Render where Ollama is not available.
 */

export interface AIResponse {
  text: string;
  thinking?: string;
  raw?: string;
  provider: 'ollama' | 'openrouter' | 'offline';
  providerLabel: string;
  model: string;
}

export interface ChatMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are Vatapi AI, the intelligent civic and heritage companion for the historic Chalukyan capital of Badami, Pattadakal, and Aihole in Bagalkote district, Karnataka, India.
You assist travelers, pilgrims, and local residents with:
1. Heritage monuments (Badami Rock-cut Caves 1-4, Agastya Lake, Bhutanatha complex, North Fort, Pattadakal UNESCO temples, Aihole temples).
2. Ooru Oota authentic North Karnataka cuisine (Jolada rotti meals, Yennegai, Shenga chutney).
3. GI-tagged Guledgudda Khana and Ilkal handloom weavers.
4. Civic triage for monument preservation (ASI Dharwad Circle) and town sanitation (Badami Town Municipal Council).
Be concise, culturally respectful, and accurate.`;

// Candidate free/cost-effective models on OpenRouter
const OPENROUTER_MODELS = [
  'deepseek/deepseek-r1:free',
  'deepseek/deepseek-chat',
  'nex-agi/nex-n2.5-mini:free',
  'liquid/lfm-2.5-2.6b:free',
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3.8-27b:free',
];

/**
 * Attempt a chat completion using local Ollama (timeout: 2200ms)
 */
async function callOllama(
  messages: ChatMessageInput[],
  model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b'
): Promise<AIResponse | null> {
  const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2200);

  try {
    const res = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const fullContent = data?.message?.content || '';
    if (!fullContent) return null;

    let thinking = '';
    let finalAnswer = fullContent;
    const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      finalAnswer = fullContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
    }

    return {
      text: finalAnswer || fullContent,
      thinking,
      raw: fullContent,
      provider: 'ollama',
      providerLabel: "⚡ Ollama's DeepSeek-R1 (Local)",
      model,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/**
 * Attempt a chat completion via OpenRouter with API key rotation & model failover
 */
async function callOpenRouter(messages: ChatMessageInput[]): Promise<AIResponse | null> {
  const keys = [
    process.env.OPENROUTER_API_KEY_1 || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2 || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY_2,
  ].filter(Boolean) as string[];

  if (keys.length === 0) return null;

  for (const apiKey of keys) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://vatapi-heritage.render.com',
            'X-Title': 'Vatapi Heritage Platform',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 1024,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.status === 429) {
          // Rate limited on this model or key, continue to next
          continue;
        }

        if (res.status === 402) {
          // Payment required for paid model, try next free model
          continue;
        }

        if (!res.ok) continue;

        const data = await res.json();
        const fullContent = data?.choices?.[0]?.message?.content || '';
        if (!fullContent) continue;

        let thinking = '';
        let finalAnswer = fullContent;
        const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
          thinking = thinkMatch[1].trim();
          finalAnswer = fullContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
        }

        return {
          text: finalAnswer || fullContent,
          thinking,
          raw: fullContent,
          provider: 'openrouter',
          providerLabel: `☁️ OpenRouter AI (${model.replace(':free', '')})`,
          model,
        };
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Intelligent Offline Rule-Based Fallback
 */
function getOfflineFallback(prompt: string): AIResponse {
  const p = prompt.toLowerCase();
  let text = 'Namaskara! I am Vatapi AI. How can I assist you with Badami, Pattadakal, and Aihole today?';

  if (p.includes('cave') || p.includes('badami')) {
    text = 'Badami is renowned for its 4 rock-cut cave temples carved out of soft Badami sandstone during 543–757 CE by the Chalukyas. Cave 1 is dedicated to Nataraja Shiva (18 arms with 81 dance poses), Cave 2 and 3 to Vishnu (Trivikrama and Mahavishnu), and Cave 4 to Jain Tirthankaras. For optimal lighting and cooler temperatures, visit Cave 1-4 between 7:30 AM and 10:30 AM.';
  } else if (p.includes('food') || p.includes('rotti') || p.includes('eat') || p.includes('lunch')) {
    text = 'For authentic North Karnataka cuisine, indulge in a traditional Jolada Rotti Oota (sorghum flatbread meal) served on a fresh banana leaf with Yennegai (stuffed baby brinjals), Shenga (peanut) chutney pudi, and fresh curd at Mallikarjuna Jolada Rotti Mane or Basaveshwara Khanavali near Badami Bus Stand.';
  } else if (p.includes('weaver') || p.includes('khana') || p.includes('ilkal') || p.includes('saree')) {
    text = 'Bagalkote is the cradle of GI-certified Guledgudda Khana (choli blouse fabric woven with traditional Chariot and Peacock motifs) and Ilkal sarees featuring the distinctive red "Topi Teni" pallu. You can visit the master weavers directly at Veeresh Handloom Guild in Guledgudda.';
  } else if (p.includes('pattadakal')) {
    text = 'Pattadakal is a UNESCO World Heritage complex on the banks of Malaprabha River. It represents the high zenith of Chalukyan architecture harmonizing Rekha-Nagara (North Indian) and Dravida (South Indian) styles. Key temples: Virupaksha, Mallikarjuna, Sangameshwara, and Papanatha.';
  }

  return {
    text,
    thinking: 'Offline mode: Synthesized from Bagalkote Heritage Knowledge Grid.',
    raw: text,
    provider: 'offline',
    providerLabel: '💾 Vatapi Heritage Knowledge Grid (Offline)',
    model: 'Bagalkote-Knowledge-v1',
  };
}

/**
 * Main AI function: Ollama first, then OpenRouter, then Offline Fallback
 */
export async function generateAIResponse(options: {
  prompt?: string;
  messages?: ChatMessageInput[];
  systemPrompt?: string;
  preferredModel?: string;
}): Promise<AIResponse> {
  const { prompt, messages, systemPrompt = DEFAULT_SYSTEM_PROMPT, preferredModel } = options;

  // Build message list
  const formattedMessages: ChatMessageInput[] = [];
  formattedMessages.push({ role: 'system', content: systemPrompt });

  if (messages && messages.length > 0) {
    for (const m of messages) {
      if (m.role !== 'system') {
        formattedMessages.push({ role: m.role, content: m.content });
      }
    }
  } else if (prompt) {
    formattedMessages.push({ role: 'user', content: prompt });
  } else {
    formattedMessages.push({ role: 'user', content: 'Introduce Badami heritage and the Vatapi platform.' });
  }

  // 1. Try Local Ollama (Timeout: 2200ms)
  try {
    const ollamaResult = await callOllama(formattedMessages, preferredModel);
    if (ollamaResult) {
      return ollamaResult;
    }
  } catch {
    // Continue to fallback
  }

  // 2. Try OpenRouter AI Cloud (Fallback for Render / Cloud deployment)
  try {
    const openRouterResult = await callOpenRouter(formattedMessages);
    if (openRouterResult) {
      return openRouterResult;
    }
  } catch {
    // Continue to offline fallback
  }

  // 3. Graceful offline fallback
  const userText = prompt || messages?.[messages.length - 1]?.content || '';
  return getOfflineFallback(userText);
}

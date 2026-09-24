import { NextResponse } from 'next/server';
import ollama from 'ollama';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const incomingMessages = body.messages;

    const model = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

    // Format chat messages
    const messages = incomingMessages && incomingMessages.length > 0
      ? incomingMessages
      : [{ role: 'user', content: prompt || 'Hello! How can you help me explore Badami and Bagalkote?' }];

    // Call the local Ollama instance running DeepSeek
    const response = await ollama.chat({
      model: model,
      messages: messages,
    });

    const fullContent = response.message.content || '';

    // Parse DeepSeek R1 thinking process if present (<think>...</think>)
    let thinking = '';
    let finalAnswer = fullContent;

    const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/i);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      finalAnswer = fullContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
    }

    return NextResponse.json({
      text: finalAnswer || fullContent,
      thinking: thinking,
      raw: fullContent,
      role: response.message.role,
      model: model,
    });
  } catch (error: any) {
    console.error('Ollama Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to communicate with DeepSeek via Ollama',
        details: error?.message || 'Check if Ollama server is running (ollama run deepseek-r1:1.5b)'
      },
      { status: 500 }
    );
  }
}

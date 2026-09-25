import { NextResponse } from 'next/server';
import { generateAIResponse, ChatMessageInput } from '@/lib/aiFallbackService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const incomingMessages: ChatMessageInput[] = body.messages || [];

    const result = await generateAIResponse({
      prompt,
      messages: incomingMessages,
      preferredModel: process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b',
    });

    return NextResponse.json({
      text: result.text,
      thinking: result.thinking || '',
      raw: result.raw || result.text,
      provider: result.provider,
      providerLabel: result.providerLabel,
      model: result.model,
      role: 'assistant',
    });
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    return NextResponse.json(
      {
        text: 'Namaskara! Vatapi AI is running in offline knowledge mode. How can I assist your visit to Badami, Pattadakal, or Aihole?',
        thinking: 'Service error fallback.',
        provider: 'offline',
        providerLabel: '💾 Vatapi Heritage Knowledge Base (Offline)',
        model: 'offline',
        role: 'assistant',
      },
      { status: 200 }
    );
  }
}

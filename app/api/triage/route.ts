import { NextResponse } from 'next/server';
import { analyzeHeritageIssue, HeritageTriageOutput } from '@/lib/ollama';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let voiceText = '';
    let imageFile: any = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const desc = formData.get('description') as string || '';
      const voice = formData.get('voiceTranscript') as string || formData.get('voiceText') as string || '';
      voiceText = [desc, voice].filter(Boolean).join('. ');
      imageFile = formData.get('image') || formData.get('photo');
    } else {
      const json = await request.json();
      const desc = json.description || '';
      const voice = json.voiceTranscript || json.voiceText || '';
      voiceText = [desc, voice].filter(Boolean).join('. ');
      imageFile = json.imageBase64 || json.image;
    }

    const result: HeritageTriageOutput = await analyzeHeritageIssue(imageFile, voiceText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Triage API Error:', error);
    // Return graceful offline fallback
    return NextResponse.json({
      category: 'Structural Damage',
      severity: 'Medium',
      jurisdiction: 'ASI Dharwad',
      description: 'AI Triage service unreachable. Please select manually.',
      confidence: 0,
      ai_available: false,
    });
  }
}

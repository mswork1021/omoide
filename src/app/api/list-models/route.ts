/**
 * Debug endpoint to list available Imagen models
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const models = await ai.models.list();

    const imagenModels: Array<{ name: string; methods?: string[] }> = [];

    for await (const model of models) {
      if (model.name && model.name.includes('imagen')) {
        imagenModels.push({
          name: model.name,
          methods: model.supportedGenerationMethods,
        });
      }
    }

    return NextResponse.json({
      success: true,
      models: imagenModels,
      count: imagenModels.length
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

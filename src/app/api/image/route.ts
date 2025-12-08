/**
 * Nano Banana Pro Image Generation Endpoint
 * ヴィンテージ新聞画像生成
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateNewspaperImage,
  generateMultipleImages,
  buildArticleImagePrompt,
} from '@/lib/nanoBanana';
import type { ImageGenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 複数画像生成リクエストの場合
    if (body.prompts && Array.isArray(body.prompts)) {
      const results = await generateMultipleImages(
        body.prompts,
        body.style || 'vintage-newspaper'
      );

      const successfulImages = results
        .filter((r) => r.success && r.imageUrl)
        .map((r) => r.imageUrl);

      return NextResponse.json({
        success: true,
        images: successfulImages,
        totalRequested: body.prompts.length,
        totalGenerated: successfulImages.length,
      });
    }

    // 単一画像生成リクエスト
    const imageRequest: ImageGenerationRequest = {
      prompt: body.prompt,
      style: body.style || 'vintage-newspaper',
      width: body.width || 512,
      height: body.height || 384,
      highFidelity: body.highFidelity ?? true,
    };

    // バリデーション
    if (!imageRequest.prompt) {
      return NextResponse.json(
        { success: false, error: 'prompt is required' },
        { status: 400 }
      );
    }

    const result = await generateNewspaperImage(imageRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  } catch (error) {
    console.error('Image Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed',
      },
      { status: 500 }
    );
  }
}

// 記事から画像プロンプトを生成するヘルパーエンドポイント
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { articleContent, era, category } = body;

    if (!articleContent || !era || !category) {
      return NextResponse.json(
        { success: false, error: 'articleContent, era, and category are required' },
        { status: 400 }
      );
    }

    const prompt = buildArticleImagePrompt(articleContent, era, category);

    return NextResponse.json({
      success: true,
      prompt,
    });
  } catch (error) {
    console.error('Prompt Generation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

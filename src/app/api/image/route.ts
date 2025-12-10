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
      // era パラメータを使用（showa/heisei/reiwa）
      const era = body.era || 'showa';
      const results = await generateMultipleImages(
        body.prompts,
        era
      );

      // 順序を保持するため、成功した画像はそのまま、失敗した場合はnullを返す
      const orderedImages = results.map((r) => (r.success && r.imageUrl) ? r.imageUrl : null);

      // 成功した画像の数をカウント
      const successCount = orderedImages.filter((img) => img !== null).length;

      // 画像が1枚も生成できなかった場合はエラーを返す
      if (successCount === 0) {
        const firstError = results.find((r) => r.error)?.error || 'Unknown image generation error';
        return NextResponse.json(
          {
            success: false,
            error: firstError,
            totalRequested: body.prompts.length,
            totalGenerated: 0,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        images: orderedImages,
        totalRequested: body.prompts.length,
        totalGenerated: successCount,
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

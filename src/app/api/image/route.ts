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
      const prompts: string[] = body.prompts;
      const MAX_API_RETRIES = 2; // API側での追加リトライ回数

      // 結果を保持する配列（インデックスを保持）
      const finalImages: (string | null)[] = new Array(prompts.length).fill(null);

      // 最初の試行
      console.log(`[Initial] Generating ${prompts.length} images...`);
      let results = await generateMultipleImages(prompts, era);

      // 結果を反映
      results.forEach((result, index) => {
        if (result.success && result.imageUrl) {
          finalImages[index] = result.imageUrl;
        }
      });

      // 失敗した画像があれば追加リトライ
      for (let retry = 1; retry <= MAX_API_RETRIES; retry++) {
        // 失敗したインデックスを特定
        const failedIndices = finalImages
          .map((img, idx) => img === null ? idx : -1)
          .filter(idx => idx !== -1);

        if (failedIndices.length === 0) {
          console.log(`All ${prompts.length} images generated successfully`);
          break;
        }

        console.log(`[Retry ${retry}/${MAX_API_RETRIES}] Retrying ${failedIndices.length} failed images...`);

        // 失敗した画像だけ再生成
        const failedPrompts = failedIndices.map(idx => prompts[idx]);
        const retryResults = await generateMultipleImages(failedPrompts, era);

        // 結果を元のインデックスに反映
        retryResults.forEach((result, i) => {
          const originalIndex = failedIndices[i];
          if (result.success && result.imageUrl) {
            finalImages[originalIndex] = result.imageUrl;
          }
        });
      }

      // 最終結果を確認
      const successCount = finalImages.filter((img) => img !== null).length;
      const failedCount = finalImages.filter((img) => img === null).length;

      // 1枚でも失敗していたらエラー（お客様はお金を払っている）
      if (failedCount > 0) {
        console.error(`${failedCount} images failed after all retries`);
        return NextResponse.json(
          {
            success: false,
            error: `${failedCount}枚の画像生成に失敗しました。再度お試しください。`,
            totalRequested: prompts.length,
            totalGenerated: successCount,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        images: finalImages,
        totalRequested: prompts.length,
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

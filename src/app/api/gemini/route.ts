/**
 * Gemini 3.0 API Endpoint
 * 新聞コンテンツ生成
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNewspaperContent } from '@/lib/gemini';
import type { GenerationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();

    // バリデーション
    if (!body.targetDate) {
      return NextResponse.json(
        { success: false, error: 'targetDate is required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(body.targetDate);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // 日付の範囲チェック（1900年〜現在）
    const minDate = new Date('1900-01-01');
    const maxDate = new Date();
    if (targetDate < minDate || targetDate > maxDate) {
      return NextResponse.json(
        { success: false, error: 'Date must be between 1900 and today' },
        { status: 400 }
      );
    }

    // 個人メッセージの構築
    const personalMessage = body.recipientName
      ? {
          recipientName: body.recipientName,
          senderName: body.senderName || '匿名',
          message: body.personalMessage || '',
          occasion: body.occasion || '記念日',
        }
      : undefined;

    // Gemini 3.0で新聞コンテンツを生成
    const newspaper = await generateNewspaperContent(
      targetDate,
      body.style || 'showa',
      personalMessage
    );

    return NextResponse.json({
      success: true,
      newspaper,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Generation failed';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

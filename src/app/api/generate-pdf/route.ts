/**
 * PDF Generation API Endpoint
 * 新聞PDF生成（決済完了後）
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateNewspaperPDF } from '@/lib/pdf';
import { verifyPayment } from '@/lib/stripe';
import type { NewspaperData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, newspaperData, images, quality } = body;

    // 支払い検証（本番環境では必須）
    if (paymentIntentId) {
      const paymentResult = await verifyPayment(paymentIntentId);
      if (!paymentResult.success) {
        return NextResponse.json(
          { success: false, error: 'Payment verification failed' },
          { status: 402 }
        );
      }
    }

    // バリデーション
    if (!newspaperData) {
      return NextResponse.json(
        { success: false, error: 'newspaperData is required' },
        { status: 400 }
      );
    }

    // 日付をDateオブジェクトに変換
    const data: NewspaperData = {
      ...newspaperData,
      date: new Date(newspaperData.date),
    };

    // PDF生成
    const pdfBuffer = await generateNewspaperPDF(
      data,
      images || {},
      quality || 'standard'
    );

    // PDFをBase64エンコードして返す
    const base64Pdf = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64Pdf,
      filename: `timetravel-press-${data.date.toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf',
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed',
      },
      { status: 500 }
    );
  }
}

// PDFダウンロード用エンドポイント
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'session parameter is required' },
      { status: 400 }
    );
  }

  // セッションからPDFデータを取得する処理
  // 実際の実装ではRedis等のセッションストアを使用

  return NextResponse.json({
    success: false,
    error: 'Session-based PDF retrieval not implemented yet',
  });
}

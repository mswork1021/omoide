/**
 * Stripe Checkout API Endpoint
 * 新料金体系: テキスト生成（80円）/ 画像追加（500円）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, getCheckoutSession, PRICING, type PricingTier } from '@/lib/stripe';

// Checkout Session作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // purchaseType: 'text_only' | 'add_images'
    const { purchaseType, tier, metadata } = body;

    // 新旧両方のパラメータに対応（後方互換性）
    const pricingKey = purchaseType || tier;

    // バリデーション
    if (!pricingKey || !PRICING[pricingKey as PricingTier]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid purchase type',
          availableTypes: Object.keys(PRICING),
        },
        { status: 400 }
      );
    }

    const pricing = PRICING[pricingKey as PricingTier];

    // リダイレクトURLを動的に取得
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    console.log('[Checkout] baseUrl:', baseUrl);

    // Checkout Session作成
    const { sessionId, url } = await createCheckoutSession(
      pricingKey as PricingTier,
      `${baseUrl}/?session_id={CHECKOUT_SESSION_ID}&tier=${pricingKey}`,
      `${baseUrl}/?canceled=true`,
      metadata
    );

    return NextResponse.json({
      success: true,
      sessionId,
      url,
      amount: pricing.price,
      currency: pricing.currency,
      productName: pricing.name,
      productDescription: pricing.description,
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
      },
      { status: 500 }
    );
  }
}

// 支払い確認（Checkout Session）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const result = await getCheckoutSession(sessionId);

    return NextResponse.json({
      success: result.success,
      verified: result.success,
      metadata: result.metadata,
      tier: result.tier,
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

// 価格情報取得
export async function GET() {
  return NextResponse.json({
    success: true,
    pricing: Object.entries(PRICING).map(([key, value]) => ({
      tier: key,
      ...value,
    })),
  });
}

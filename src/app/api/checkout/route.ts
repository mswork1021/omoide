/**
 * Stripe Checkout API Endpoint
 * 決済処理
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent, verifyPayment, PRICING, type PricingTier } from '@/lib/stripe';

// 支払いインテント作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, metadata } = body;

    // バリデーション
    if (!tier || !PRICING[tier as PricingTier]) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pricing tier',
          availableTiers: Object.keys(PRICING),
        },
        { status: 400 }
      );
    }

    const pricing = PRICING[tier as PricingTier];

    // 支払いインテント作成
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      tier as PricingTier,
      metadata
    );

    return NextResponse.json({
      success: true,
      clientSecret,
      paymentIntentId,
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

// 支払い確認
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    const result = await verifyPayment(paymentIntentId);

    return NextResponse.json({
      success: result.success,
      verified: result.success,
      metadata: result.metadata,
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

/**
 * Stripe Payment Integration
 * TimeTravel Press 決済処理
 */

import Stripe from 'stripe';

// Stripeインスタンス（サーバーサイド用）
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }
  return stripeInstance;
}

// 商品価格設定（新料金体系）
// Step 1: テキスト生成（80円）- 画像なし新聞
// Step 2: 画像追加（500円）- 4枚の画像を追加、PDF出力無料
export const PRICING = {
  text_only: {
    id: 'timetravel_text',
    name: '記事生成',
    description: '記念日新聞のテキスト生成（画像なし）',
    price: 80, // 日本円
    currency: 'jpy',
  },
  add_images: {
    id: 'timetravel_images',
    name: '画像追加',
    description: '記事に画像を追加（4枚）+ PDF出力無料',
    price: 500,
    currency: 'jpy',
  },
} as const;

export type PricingTier = keyof typeof PRICING;

/**
 * 支払いインテントを作成
 */
export async function createPaymentIntent(
  tier: PricingTier,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();
  const pricing = PRICING[tier];

  const paymentIntent = await stripe.paymentIntents.create({
    amount: pricing.price,
    currency: pricing.currency,
    metadata: {
      product_id: pricing.id,
      product_name: pricing.name,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error('Failed to create payment intent');
  }

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * 支払い完了を確認
 */
export async function verifyPayment(
  paymentIntentId: string
): Promise<{ success: boolean; metadata?: Record<string, string> }> {
  const stripe = getStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      return {
        success: true,
        metadata: paymentIntent.metadata as Record<string, string>,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('Payment verification error:', error);
    return { success: false };
  }
}

/**
 * Webhook署名を検証
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * 返金処理
 */
export async function createRefund(
  paymentIntentId: string,
  reason?: string
): Promise<{ success: boolean; refundId?: string }> {
  const stripe = getStripe();

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        custom_reason: reason || 'Customer requested refund',
      },
    });

    return {
      success: true,
      refundId: refund.id,
    };
  } catch (error) {
    console.error('Refund error:', error);
    return { success: false };
  }
}

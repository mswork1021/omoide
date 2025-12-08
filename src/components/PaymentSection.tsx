'use client';

/**
 * PaymentSection Component
 * Stripe決済フロー
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAppStore, useGenerationFlow } from '@/lib/store';
import { CreditCard, Check, Loader2, Download, Shield } from 'lucide-react';

// Stripeの公開鍵
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface PricingOption {
  tier: 'standard' | 'premium' | 'deluxe';
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
}

export function PaymentSection() {
  const {
    newspaperData,
    selectedTier,
    setSelectedTier,
    isPaid,
    setIsPaid,
    setPaymentIntentId,
    pdfUrl,
    generationStep,
    generationProgress,
    isGenerating,
  } = useAppStore();

  const { startProductionGeneration } = useGenerationFlow();

  const [pricing, setPricing] = useState<PricingOption[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 価格情報を取得
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch('/api/checkout');
        const data = await response.json();
        if (data.success) {
          // 機能リストを追加
          const pricingWithFeatures = data.pricing.map((p: PricingOption) => ({
            ...p,
            features: getPlanFeatures(p.tier),
          }));
          setPricing(pricingWithFeatures);
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  const getPlanFeatures = (tier: string): string[] => {
    switch (tier) {
      case 'standard':
        return ['A3サイズPDF', '150dpi画質', '基本レイアウト'];
      case 'premium':
        return ['A3サイズPDF', '300dpi高画質', '追加コラム', 'カスタムメッセージ枠'];
      case 'deluxe':
        return ['A2サイズPDF', '300dpi最高画質', '額装対応サイズ', '全ての機能'];
      default:
        return [];
    }
  };

  const handlePayment = async () => {
    if (!newspaperData) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // 支払いインテント作成
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          metadata: {
            targetDate: newspaperData.date.toString(),
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // デモモード: 実際のStripe決済をスキップ
      // 本番環境では Stripe Elements を使用
      console.log('Payment Intent Created:', data.paymentIntentId);

      // デモ用: 支払い成功として処理
      setPaymentIntentId(data.paymentIntentId);
      setIsPaid(true);

      // Production生成を開始
      await startProductionGeneration();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `timetravel-press-${new Date(newspaperData?.date || Date.now()).toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  if (!newspaperData) {
    return null;
  }

  // 生成中の表示
  if (isGenerating) {
    return (
      <div className="payment-section bg-[#faf8f3] rounded-lg p-6 border-2 border-[#1a1a1a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#1a1a1a]" />
          <h3 className="text-xl font-bold mb-2">
            {generationStep === 'images' && '画像を生成中...'}
            {generationStep === 'pdf' && 'PDFを生成中...'}
            {generationStep === 'content' && 'コンテンツを生成中...'}
          </h3>
          <div className="w-full bg-[#1a1a1a]/10 rounded-full h-2 mb-2">
            <div
              className="bg-[#1a1a1a] h-2 rounded-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-sm text-[#1a1a1a]/60">{generationProgress}% 完了</p>
        </div>
      </div>
    );
  }

  // 決済完了後のダウンロード表示
  if (isPaid && pdfUrl) {
    return (
      <div className="payment-section bg-green-50 rounded-lg p-6 border-2 border-green-600">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">生成完了</h3>
          <p className="text-green-700 mb-6">
            あなただけの記念日新聞が完成しました
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            PDFをダウンロード
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-section space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">高画質PDFを取得</h3>
        <p className="text-[#1a1a1a]/60">
          プラン選択して、印刷可能な高画質PDFをダウンロード
        </p>
      </div>

      {/* 価格プラン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricing.map((plan) => (
          <button
            key={plan.tier}
            onClick={() => setSelectedTier(plan.tier)}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${
                selectedTier === plan.tier
                  ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                  : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40 bg-[#faf8f3]'
              }
            `}
          >
            <div className="text-lg font-bold">{plan.name.split(' ').pop()}</div>
            <div className="text-2xl font-black my-2">
              ¥{plan.price.toLocaleString()}
            </div>
            <ul className="text-sm space-y-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-1">
                  <Check
                    size={14}
                    className={selectedTier === plan.tier ? '' : 'text-green-600'}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* エラー表示 */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {paymentError}
        </div>
      )}

      {/* 決済ボタン */}
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            isProcessing
              ? 'bg-[#1a1a1a]/50 cursor-not-allowed'
              : 'bg-[#1a1a1a] hover:bg-[#1a1a1a]/90'
          }
          text-white
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            処理中...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            {pricing.find((p) => p.tier === selectedTier)?.price.toLocaleString() || '---'}
            円で購入
          </>
        )}
      </button>

      {/* セキュリティバッジ */}
      <div className="flex items-center justify-center gap-2 text-sm text-[#1a1a1a]/60">
        <Shield size={16} />
        Stripeによる安全な決済
      </div>
    </div>
  );
}

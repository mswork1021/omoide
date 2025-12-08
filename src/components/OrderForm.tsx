'use client';

/**
 * OrderForm Component
 * 日付選択 → 決済直行のシンプルなフォーム
 */

import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import { Calendar, Gift, CreditCard, Sparkles, User, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAppStore, useGenerationFlow } from '@/lib/store';

// テストモード（Stripeスキップ）
const TEST_MODE = true;

export function OrderForm() {
  const {
    targetDate,
    setTargetDate,
    style,
    setStyle,
    recipientName,
    setRecipientName,
    senderName,
    setSenderName,
    personalMessage,
    setPersonalMessage,
    occasion,
    setOccasion,
    selectedTier,
    setSelectedTier,
  } = useAppStore();

  const [showPersonalMessage, setShowPersonalMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isGenerating, generationStep, generationProgress, error } = useAppStore();
  const { startPreviewGeneration } = useGenerationFlow();

  const styleOptions = [
    { value: 'showa', label: '昭和風', description: '重厚な活字文化' },
    { value: 'heisei', label: '平成風', description: 'バブル期の華やかさ' },
    { value: 'reiwa', label: '令和風', description: 'レトロモダン' },
  ] as const;

  const occasionPresets = [
    '誕生日', '結婚記念日', '還暦祝い', '入学祝い', '卒業祝い', '退職記念', 'その他',
  ];

  const pricingOptions = [
    { tier: 'standard' as const, label: 'スタンダード', price: 980, features: ['A3サイズPDF', '150dpi'] },
    { tier: 'premium' as const, label: 'プレミアム', price: 1980, features: ['A3 / 300dpi', '追加コラム'] },
    { tier: 'deluxe' as const, label: 'デラックス', price: 3980, features: ['A2 / 300dpi', '額装対応'] },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;

    // テストモード: Stripeスキップして直接生成
    if (TEST_MODE) {
      await startPreviewGeneration();
      return;
    }

    setIsSubmitting(true);

    // 決済処理へ遷移（実際の実装ではStripe Checkoutを使用）
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          metadata: {
            targetDate: targetDate.toISOString(),
            style,
            recipientName,
            senderName,
            personalMessage,
            occasion,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Stripe Checkout にリダイレクト（本番実装時）
        // 今はアラートで代替
        alert(`決済画面へ遷移します\n\n金額: ¥${data.amount}\n商品: ${data.productName}\n\n※ 実際の環境ではStripe決済画面が開きます`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form space-y-6">
      {/* ステップ1: 日付選択 */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} />
            記念日を選択
          </label>
        </div>
        <DatePicker
          value={targetDate}
          onChange={setTargetDate}
          placeholder="例: 1990/04/01"
        />
        <p className="text-xs text-[#1a1a1a]/50 mt-2">
          1900年〜現在までの日付を選択できます
        </p>
      </div>

      {/* ステップ2: スタイル選択 */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Sparkles size={20} />
            新聞スタイル
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStyle(option.value)}
              className={`
                p-3 border-2 rounded-lg text-center transition-all text-sm
                ${
                  style === option.value
                    ? 'border-[#8b4513] bg-[#8b4513] text-white'
                    : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                }
              `}
            >
              <div className="font-bold">{option.label}</div>
              <div className="text-xs mt-0.5 opacity-80">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 個人メッセージ（折りたたみ） */}
      <div className="form-section">
        <button
          type="button"
          onClick={() => setShowPersonalMessage(!showPersonalMessage)}
          className="w-full flex items-center justify-between p-3 border-2 border-dashed border-[#1a1a1a]/20 rounded-lg hover:border-[#8b4513]/40 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <Gift size={18} />
            個人メッセージを追加（任意）
          </span>
          {showPersonalMessage ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showPersonalMessage && (
          <div className="mt-3 p-4 bg-[#faf8f3] rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <User size={12} />
                  宛名
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="例: 山田太郎"
                  className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">送り主</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="例: 家族一同"
                  className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">記念日の種類</label>
              <div className="flex flex-wrap gap-1.5">
                {occasionPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOccasion(preset)}
                    className={`
                      px-2.5 py-1 text-xs rounded-full border transition-colors
                      ${
                        occasion === preset
                          ? 'bg-[#8b4513] text-white border-[#8b4513]'
                          : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                      }
                    `}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">メッセージ</label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="お祝いのメッセージを入力..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ステップ3: プラン選択 */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={20} />
            プランを選択
          </label>
        </div>
        <div className="space-y-2">
          {pricingOptions.map((option) => (
            <button
              key={option.tier}
              type="button"
              onClick={() => setSelectedTier(option.tier)}
              className={`
                w-full p-3 border-2 rounded-lg text-left transition-all flex items-center justify-between
                ${
                  selectedTier === option.tier
                    ? 'border-[#8b4513] bg-[#8b4513]/5'
                    : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                }
              `}
            >
              <div>
                <div className="font-bold">{option.label}</div>
                <div className="text-xs text-[#1a1a1a]/60">
                  {option.features.join(' / ')}
                </div>
              </div>
              <div className="text-xl font-black">
                ¥{option.price.toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!targetDate || isSubmitting || isGenerating}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            !targetDate || isSubmitting || isGenerating
              ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]/40 cursor-not-allowed'
              : 'bg-[#8b4513] text-white hover:bg-[#6b3410] active:scale-[0.99]'
          }
        `}
      >
        {isSubmitting || isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {generationStep === 'content' && '新聞を生成中...'}
            {generationStep === 'images' && '画像を生成中...'}
            {generationStep === 'pdf' && 'PDF作成中...'}
            {generationStep === 'idle' && '処理中...'}
          </>
        ) : TEST_MODE ? (
          <>
            <Sparkles size={20} />
            テスト生成する（無料）
          </>
        ) : (
          <>
            <CreditCard size={20} />
            ¥{pricingOptions.find(p => p.tier === selectedTier)?.price.toLocaleString()} で購入する
          </>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          エラー: {error}
        </div>
      )}

      {/* テストモード表示 */}
      {TEST_MODE ? (
        <p className="text-center text-xs text-orange-600 bg-orange-50 p-2 rounded">
          🧪 テストモード: Stripe決済をスキップしてAI生成をテストできます
        </p>
      ) : (
        <p className="text-center text-xs text-[#1a1a1a]/50">
          決済完了後、AIが新聞を生成しPDFをダウンロードできます
        </p>
      )}
    </form>
  );
}

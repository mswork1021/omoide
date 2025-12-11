'use client';

/**
 * PaymentSection Component
 * 新料金体系: テキスト生成済み → 画像追加（500円）→ PDF出力（無料）
 */

import React, { useState } from 'react';
import { useAppStore, useGenerationFlow } from '@/lib/store';
import {
  ImagePlus,
  Check,
  Loader2,
  Download,
  Shield,
  FileText,
  Sparkles,
  Camera
} from 'lucide-react';

// テストモード（Stripeスキップ）
const TEST_MODE = true;

export function PaymentSection() {
  const {
    newspaperData,
    generatedImages,
    isTextPaid,
    isImagesPaid,
    setIsImagesPaid,
    pdfUrl,
    generationStep,
    generationProgress,
    isGenerating,
    style,
    error: storeError,
  } = useAppStore();

  const { startImageGeneration, generatePdf } = useGenerationFlow();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // エラー表示（ローカルとストア両方）
  const displayError = paymentError || storeError;

  // 新聞データがなければ表示しない
  if (!newspaperData) {
    return null;
  }

  // 画像追加の決済処理
  const handleImagePurchase = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      if (TEST_MODE) {
        // テストモード: 決済スキップして直接生成
        await startImageGeneration();
        return;
      }

      // 本番: Stripe決済（500円）
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'add_images',
          metadata: {
            targetDate: newspaperData.date.toString(),
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '決済に失敗しました');
      }

      // 決済成功後に画像生成
      await startImageGeneration();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : '決済に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // PDF生成処理
  const handlePdfGeneration = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      await generatePdf();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'PDF生成に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // PDFダウンロード
  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    const dateStr = new Date(newspaperData.date).toISOString().split('T')[0];
    link.download = `timetravel-press-${dateStr}.pdf`;
    link.click();
  };

  // 生成中の表示
  if (isGenerating) {
    return (
      <div className="payment-section bg-[#faf8f3] rounded-lg p-6 border-2 border-[#1a1a1a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-[#1a1a1a]" />
          <h3 className="text-xl font-bold mb-2">
            {generationStep === 'images' && '画像を生成中...'}
            {generationStep === 'pdf' && 'PDFを生成中...'}
            {generationStep === 'content' && '記事を生成中...'}
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

  // PDF生成完了 → ダウンロード表示
  if (isImagesPaid && pdfUrl) {
    return (
      <div className="payment-section bg-green-50 rounded-lg p-6 border-2 border-green-600">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">完成しました！</h3>
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

  // 画像購入済み → PDF生成ボタン
  if (isImagesPaid && generatedImages) {
    return (
      <div className="payment-section bg-blue-50 rounded-lg p-6 border-2 border-blue-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">画像が追加されました</h3>
          <p className="text-blue-700 mb-4">
            PDFを生成してダウンロードできます（無料）
          </p>

          {displayError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {displayError}
            </div>
          )}

          <button
            onClick={handlePdfGeneration}
            disabled={isProcessing}
            className={`
              inline-flex items-center gap-2 px-8 py-4 font-bold rounded-lg transition-colors
              ${isProcessing
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                処理中...
              </>
            ) : (
              <>
                <FileText size={20} />
                PDFを生成（無料）
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // テキスト生成済み → 画像追加ボタン
  return (
    <div className="payment-section space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">記事が完成しました！</h3>
        <p className="text-[#1a1a1a]/60">
          画像を追加して、より本格的な新聞に仕上げましょう
        </p>
      </div>

      {/* 画像追加オプション */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <ImagePlus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-purple-800 mb-1">
              画像を追加する
            </h4>
            <p className="text-sm text-purple-700 mb-3">
              AIが記事に合った画像を4枚生成します。
              {style === 'showa' && '昭和風のモノクロ写真'}
              {style === 'heisei' && '平成風のカラフルな写真'}
              {style === 'reiwa' && '令和風の高画質写真'}
              で雰囲気を演出。
            </p>
            <ul className="text-sm text-purple-600 space-y-1 mb-4">
              <li className="flex items-center gap-2">
                <Check size={14} />
                メイン記事の画像1枚
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} />
                サブ記事の画像3枚
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} />
                PDF出力が無料
              </li>
            </ul>
            <div className="text-2xl font-black text-purple-800">
              ¥500
              <span className="text-sm font-normal ml-2">（税込）</span>
            </div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {displayError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {displayError}
        </div>
      )}

      {/* 購入ボタン */}
      <button
        onClick={handleImagePurchase}
        disabled={isProcessing}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            isProcessing
              ? 'bg-purple-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            処理中...
          </>
        ) : TEST_MODE ? (
          <>
            <Sparkles size={20} />
            テスト: 画像を追加（無料）
          </>
        ) : (
          <>
            <ImagePlus size={20} />
            画像を追加（¥500）
          </>
        )}
      </button>

      {/* セキュリティバッジ */}
      {!TEST_MODE && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#1a1a1a]/60">
          <Shield size={16} />
          Stripeによる安全な決済
        </div>
      )}

      {/* テストモード表示 */}
      {TEST_MODE && (
        <p className="text-center text-xs text-orange-600 bg-orange-50 p-2 rounded">
          🧪 テストモード: 決済をスキップして画像生成をテストできます
        </p>
      )}
    </div>
  );
}

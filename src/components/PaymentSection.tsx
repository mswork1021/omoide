'use client';

/**
 * PaymentSection Component
 * 新料金体系: テキスト生成済み → 画像追加（500円）→ PDF出力（自動）
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, useGenerationFlow } from '@/lib/store';
import {
  ImagePlus,
  Check,
  Loader2,
  Download,
  Shield,
  FileText,
  Sparkles,
  Camera,
  Mail,
  AlertCircle,
  Image,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';

// テストモード（環境変数で制御）
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';

// テストモード用パスワード（OrderFormと同じ）
const TEST_PASSWORD = 'omoide2025';

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
    email,
    error: storeError,
  } = useAppStore();

  const { startImageGeneration, generatePdf } = useGenerationFlow();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [testCode, setTestCode] = useState('');
  const pdfGenerationTriggered = useRef(false);

  // テストコードが正しいか
  const isTestCodeValid = testCode === TEST_PASSWORD;

  // エラー表示（ローカルとストア両方）
  const displayError = paymentError || storeError;

  // 画像生成完了後、自動でPDF生成を開始
  useEffect(() => {
    if (
      isImagesPaid &&
      generatedImages &&
      !pdfUrl &&
      !isGenerating &&
      !pdfGenerationTriggered.current
    ) {
      pdfGenerationTriggered.current = true;
      // DOMが画像で更新されるのを待ってからPDF生成
      setTimeout(() => {
        generatePdf();
      }, 500);
    }
  }, [isImagesPaid, generatedImages, pdfUrl, isGenerating, generatePdf]);

  // 新聞データがなければ表示しない
  if (!newspaperData) {
    return null;
  }

  // 画像追加の決済処理
  const handleImagePurchase = async () => {
    // LINEブラウザの場合は警告
    if (isLineBrowser()) {
      alert(
        '⚠️ LINEアプリ内ブラウザではPDFをダウンロードできません！\n\n' +
        '【必ず外部ブラウザで開き直してください】\n\n' +
        '手順：画面右上または右下の「︙」メニュー → 「ブラウザで開く」\n\n' +
        '※このまま購入するとPDFを受け取れません'
      );
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // テストコードが正しい場合は無料で生成
      if (isTestCodeValid) {
        await startImageGeneration();
        return;
      }

      // 新聞データとメールをlocalStorageに保存（決済後に復元するため）
      localStorage.setItem('omoide_newspaper_data', JSON.stringify(newspaperData));
      localStorage.setItem('omoide_email', email);

      // 本番: Stripe Checkoutへリダイレクト
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
      if (data.success && data.url) {
        // Stripe Checkoutページへリダイレクト
        window.location.href = data.url;
      } else {
        throw new Error(data.error || '決済の準備に失敗しました');
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : '決済に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // LINEブラウザ検出
  const isLineBrowser = () => {
    if (typeof window === 'undefined') return false;
    return /Line/i.test(navigator.userAgent);
  };

  // PDFダウンロード
  const handleDownload = () => {
    if (!pdfUrl) return;

    // LINEブラウザの場合は案内を表示
    if (isLineBrowser()) {
      alert('LINEアプリ内ブラウザではPDFをダウンロードできません。\n\n画面右上または右下の「︙」メニューから「ブラウザで開く」を選択してください。');
      return;
    }

    // 通常のブラウザ
    const link = document.createElement('a');
    link.href = pdfUrl;
    const dateStr = new Date(newspaperData.date).toISOString().split('T')[0];
    link.download = `timetravel-press-${dateStr}.pdf`;
    link.click();
  };

  // iOS検出
  const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  // 画像としてダウンロード
  const handleImageDownload = async () => {
    const element = document.getElementById('newspaper-preview-for-pdf');
    if (!element) {
      alert('プレビューが見つかりません');
      return;
    }

    // iOSの場合は先にウィンドウを開く（ポップアップブロック回避）
    let newWindow: Window | null = null;
    if (isIOS()) {
      newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>画像を準備中...</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: #f5f0e6;
                  font-family: sans-serif;
                }
              </style>
            </head>
            <body>
              <p>画像を生成中...</p>
            </body>
          </html>
        `);
      }
    }

    let cloneContainer: HTMLDivElement | null = null;

    try {
      // PDF生成と同じ方式：固定幅でクローンを作成
      const previewWidth = 800;

      cloneContainer = document.createElement('div');
      cloneContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${previewWidth}px;
        background: white;
        z-index: -1;
      `;

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = `${previewWidth}px`;
      clone.style.margin = '0';
      clone.style.boxSizing = 'border-box';
      clone.style.background = '#ffffff';

      // スケーリングをリセット
      const innerPreview = clone.querySelector('#newspaper-preview') as HTMLElement;
      if (innerPreview) {
        innerPreview.style.width = '100%';
        innerPreview.style.boxShadow = 'none';
        innerPreview.style.minHeight = 'auto';

        const parent = innerPreview.parentElement;
        if (parent) {
          parent.style.transform = 'none';
          parent.style.width = `${previewWidth}px`;
          parent.style.minHeight = 'auto';
        }
        const grandParent = parent?.parentElement;
        if (grandParent) {
          grandParent.style.width = `${previewWidth}px`;
          grandParent.style.height = 'auto';
          grandParent.style.minHeight = 'auto';
          grandParent.style.overflow = 'visible';
        }
      }

      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);

      // レンダリングを待つ
      await new Promise(resolve => setTimeout(resolve, 300));

      const naturalHeight = cloneContainer.scrollHeight;

      const canvas = await html2canvas(cloneContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: previewWidth,
        height: naturalHeight,
      });

      // クリーンアップ
      document.body.removeChild(cloneContainer);
      cloneContainer = null;

      // ウォーターマーク（URL）を追加
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const watermarkHeight = 60; // ウォーターマーク領域の高さ
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height + watermarkHeight;

        const newCtx = newCanvas.getContext('2d');
        if (newCtx) {
          // 元の画像を描画
          newCtx.drawImage(canvas, 0, 0);

          // ウォーターマーク背景
          newCtx.fillStyle = '#1a1a1a';
          newCtx.fillRect(0, canvas.height, newCanvas.width, watermarkHeight);

          // URLテキスト
          newCtx.fillStyle = '#ffffff';
          newCtx.font = 'bold 28px sans-serif';
          newCtx.textAlign = 'center';
          newCtx.textBaseline = 'middle';
          newCtx.fillText('🗞️ timetravel-press.com', newCanvas.width / 2, canvas.height + watermarkHeight / 2);

          // 新しいcanvasを使用
          const imageDataUrl = newCanvas.toDataURL('image/png');
          const dateStr = new Date(newspaperData.date).toISOString().split('T')[0];

          // iOSの場合
          if (isIOS() && newWindow) {
            newWindow.document.open();
            newWindow.document.write(`
              <html>
                <head>
                  <title>画像を保存</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body {
                      margin: 0;
                      padding: 20px;
                      background: #f5f0e6;
                      text-align: center;
                      font-family: sans-serif;
                    }
                    .info {
                      background: #fff;
                      padding: 15px;
                      border-radius: 10px;
                      margin-bottom: 20px;
                      font-size: 14px;
                      color: #333;
                    }
                    img {
                      max-width: 100%;
                      height: auto;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    }
                  </style>
                </head>
                <body>
                  <div class="info">
                    📱 画像を長押しして「写真に追加」を選んでください
                  </div>
                  <img src="${imageDataUrl}" alt="記念日新聞" />
                </body>
              </html>
            `);
            newWindow.document.close();
            return;
          }

          // PC/Androidの場合は通常のダウンロード
          const link = document.createElement('a');
          link.href = imageDataUrl;
          link.download = `timetravel-press-${dateStr}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      }

      // フォールバック（ウォーターマーク追加失敗時）
      const imageDataUrl = canvas.toDataURL('image/png');
      const dateStr = new Date(newspaperData.date).toISOString().split('T')[0];

      // iOSの場合
      if (isIOS() && newWindow) {
        newWindow.document.open();
        newWindow.document.write(`
          <html>
            <head>
              <title>画像を保存</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  background: #f5f0e6;
                  text-align: center;
                  font-family: sans-serif;
                }
                .info {
                  background: #fff;
                  padding: 15px;
                  border-radius: 10px;
                  margin-bottom: 20px;
                  font-size: 14px;
                  color: #333;
                }
                img {
                  max-width: 100%;
                  height: auto;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
              </style>
            </head>
            <body>
              <div class="info">
                📱 画像を長押しして「写真に追加」を選んでください
              </div>
              <img src="${imageDataUrl}" alt="記念日新聞" />
            </body>
          </html>
        `);
        newWindow.document.close();
        return;
      }

      // PC/Androidの場合は通常のダウンロード
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `timetravel-press-${dateStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Image download error:', error);
      if (cloneContainer && document.body.contains(cloneContainer)) {
        document.body.removeChild(cloneContainer);
      }
      if (newWindow) newWindow.close();
      alert('画像のダウンロードに失敗しました。もう一度お試しください。');
    }
  };

  // Xでシェア
  const handleShareToX = () => {
    // シェア用のテキスト（URLは画像内にあるので不要）
    const shareText = `記念日新聞を作りました！🗞️✨\n\n#TimeTravelPress #記念日新聞 #AIで作る新聞`;

    // 先にX投稿画面を開く（ポップアップブロック回避）
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');

    // 画像保存の案内
    alert('Xの投稿画面が開きました。\n\n「画像として保存」で保存した画像を添付してください。\n※画像にサイトURLが入っています');
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
          <p className="text-green-700 mb-4">
            あなただけの記念日新聞が完成しました
          </p>

          {/* メール送信済み通知 */}
          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-left">
              <div className="flex items-center gap-2 text-blue-800 font-medium text-sm mb-1">
                <Mail size={16} />
                メール送信済み
              </div>
              <p className="text-xs text-blue-700">
                {email} にPDFを送信しました
              </p>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            PDFをダウンロード
          </button>

          {/* 画像保存・シェアボタン */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleImageDownload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#8b4513] text-white font-medium rounded-lg hover:bg-[#6d3610] transition-colors text-sm"
            >
              <Image size={16} />
              画像として保存
            </button>
            <button
              onClick={handleShareToX}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <Share2 size={16} />
              Xでシェア
            </button>
          </div>

          {/* 注意書き */}
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-orange-700">
                <p className="font-medium mb-1">念のためダウンロードをおすすめします</p>
                <p>
                  メールアドレスの入力ミスがあった場合、メールが届かない可能性があります。
                  上のボタンからPDFをダウンロードして保存しておくことをおすすめします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 画像購入済み、PDF生成待ち（自動生成されるので待機表示）
  if (isImagesPaid && generatedImages && !pdfUrl) {
    return (
      <div className="payment-section bg-blue-50 rounded-lg p-6 border-2 border-blue-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">PDFを準備中...</h3>
          <p className="text-blue-700 mb-4">
            完成したらメールでもお届けします
          </p>
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

      {/* テストコード入力（テストモード時のみ） */}
      {TEST_MODE && (
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <label className="block text-sm font-medium text-orange-800 mb-2">
            🔐 テストコード（無料生成用）
          </label>
          <input
            type="password"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="テストコードを入力"
            className="w-full px-3 py-2 text-sm border border-orange-300 rounded bg-white"
          />
          {testCode && !isTestCodeValid && (
            <p className="text-xs text-red-500 mt-1">コードが正しくありません</p>
          )}
          {isTestCodeValid && (
            <p className="text-xs text-green-600 mt-1">✓ 認証OK - 無料で生成できます</p>
          )}
        </div>
      )}

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
        ) : isTestCodeValid ? (
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
      {!isTestCodeValid && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#1a1a1a]/60">
          <Shield size={16} />
          Stripeによる安全な決済
        </div>
      )}

      {/* 料金説明 */}
      <p className="text-center text-xs text-[#1a1a1a]/60">
        画像を追加するとPDF出力が無料になります
      </p>
    </div>
  );
}

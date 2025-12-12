/**
 * Global State Management (Zustand)
 * TimeTravel Press アプリケーション状態
 */

import { create } from 'zustand';
import type { NewspaperData, GeneratedImages, GenerationRequest } from '@/types';

interface AppState {
  // 入力状態
  targetDate: Date | null;
  style: 'showa' | 'heisei' | 'reiwa';
  recipientName: string;
  senderName: string;
  personalMessage: string;
  occasion: string;

  // 生成状態
  isGenerating: boolean;
  generationStep: 'idle' | 'content' | 'images' | 'pdf' | 'complete';
  generationProgress: number;

  // データ
  newspaperData: NewspaperData | null;
  generatedImages: GeneratedImages | null;
  pdfUrl: string | null;

  // 決済状態（新料金体系）
  // text_only: テキスト生成（80円）
  // add_images: 画像追加（500円）
  purchaseType: 'text_only' | 'add_images' | null;
  paymentIntentId: string | null;
  isTextPaid: boolean;      // テキスト生成の支払い完了
  isImagesPaid: boolean;    // 画像追加の支払い完了

  // エラー
  error: string | null;

  // アクション
  setTargetDate: (date: Date | null) => void;
  setStyle: (style: 'showa' | 'heisei' | 'reiwa') => void;
  setRecipientName: (name: string) => void;
  setSenderName: (name: string) => void;
  setPersonalMessage: (message: string) => void;
  setOccasion: (occasion: string) => void;
  setPurchaseType: (type: 'text_only' | 'add_images' | null) => void;
  setNewspaperData: (data: NewspaperData | null) => void;
  setGeneratedImages: (images: GeneratedImages | null) => void;
  setPdfUrl: (url: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setIsTextPaid: (paid: boolean) => void;
  setIsImagesPaid: (paid: boolean) => void;
  setError: (error: string | null) => void;
  setGenerationStep: (step: AppState['generationStep']) => void;
  setGenerationProgress: (progress: number) => void;
  setIsGenerating: (generating: boolean) => void;
  getGenerationRequest: () => GenerationRequest;
  reset: () => void;
}

const initialState = {
  targetDate: null,
  style: 'showa' as const,
  recipientName: '',
  senderName: '',
  personalMessage: '',
  occasion: '',
  isGenerating: false,
  generationStep: 'idle' as const,
  generationProgress: 0,
  newspaperData: null,
  generatedImages: null,
  pdfUrl: null,
  purchaseType: null as 'text_only' | 'add_images' | null,
  paymentIntentId: null,
  isTextPaid: false,
  isImagesPaid: false,
  error: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  setTargetDate: (date) => set({ targetDate: date }),
  setStyle: (style) => set({ style }),
  setRecipientName: (name) => set({ recipientName: name }),
  setSenderName: (name) => set({ senderName: name }),
  setPersonalMessage: (message) => set({ personalMessage: message }),
  setOccasion: (occasion) => set({ occasion }),
  setPurchaseType: (type) => set({ purchaseType: type }),
  setNewspaperData: (data) => set({ newspaperData: data }),
  setGeneratedImages: (images) => set({ generatedImages: images }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  setPaymentIntentId: (id) => set({ paymentIntentId: id }),
  setIsTextPaid: (paid) => set({ isTextPaid: paid }),
  setIsImagesPaid: (paid) => set({ isImagesPaid: paid }),
  setError: (error) => set({ error }),
  setGenerationStep: (step) => set({ generationStep: step }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  getGenerationRequest: () => {
    const state = get();
    // タイムゾーンの問題を避けるため、ローカル日付を文字列として送信
    let dateStr = '';
    if (state.targetDate) {
      const year = state.targetDate.getFullYear();
      const month = String(state.targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(state.targetDate.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}T12:00:00`;  // 正午に設定してタイムゾーンずれを防ぐ
    }
    return {
      targetDate: dateStr,
      recipientName: state.recipientName || undefined,
      senderName: state.senderName || undefined,
      personalMessage: state.personalMessage || undefined,
      occasion: state.occasion || undefined,
      style: state.style,
    };
  },

  reset: () => set(initialState),
}));

// 生成フロー管理用のヘルパーフック（新料金体系対応）
export const useGenerationFlow = () => {
  const store = useAppStore();

  /**
   * テキスト生成（80円）
   * 画像なしで新聞コンテンツのみを生成
   */
  const startTextGeneration = async () => {
    store.setIsGenerating(true);
    store.setGenerationStep('content');
    store.setError(null);

    try {
      const request = store.getGenerationRequest();

      // コンテンツ生成
      store.setGenerationProgress(30);
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'コンテンツの生成に失敗しました');
      }

      store.setNewspaperData(data.newspaper);
      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
      store.setIsTextPaid(true);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Unknown error');
      store.setGenerationStep('idle');
    } finally {
      store.setIsGenerating(false);
    }
  };

  /**
   * 画像生成（500円）
   * 既存の新聞データに画像を追加
   */
  const startImageGeneration = async () => {
    if (!store.newspaperData) {
      store.setError('新聞データがありません');
      return;
    }

    store.setIsGenerating(true);
    store.setGenerationStep('images');
    store.setError(null);
    store.setGenerationProgress(0);

    try {
      // 画像プロンプトを収集
      const imagePrompts: string[] = [];

      // メイン記事の画像プロンプト
      const mainPrompt = store.newspaperData.mainArticle?.imagePrompt
        || `A photograph for newspaper article about: ${store.newspaperData.mainArticle?.headline || 'news event'}`;
      imagePrompts.push(mainPrompt);

      // サブ記事の画像プロンプト（3枚）
      if (store.newspaperData.subArticles) {
        for (let i = 0; i < 3; i++) {
          const article = store.newspaperData.subArticles[i];
          if (article?.imagePrompt) {
            imagePrompts.push(article.imagePrompt);
          } else if (article) {
            imagePrompts.push(`A photograph for newspaper article about: ${article.headline || 'news'}`);
          } else {
            imagePrompts.push('A vintage Japanese newspaper photograph of daily life');
          }
        }
      }

      store.setGenerationProgress(10);

      // 画像生成（これが時間がかかるメイン処理）
      const imageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: imagePrompts,
          era: store.style,
        }),
      });

      store.setGenerationProgress(90);

      const imageData = await imageResponse.json();

      if (imageData.success && imageData.images?.length > 0) {
        store.setGeneratedImages({
          mainImage: imageData.images[0] ?? undefined,
          subImages: (imageData.images.slice(1) || []).map((img: string | null) => img ?? undefined),
        });
        store.setIsImagesPaid(true);
      } else if (imageData.error) {
        throw new Error(imageData.error);
      }

      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
    } catch (error) {
      store.setError(error instanceof Error ? error.message : '画像生成に失敗しました');
      store.setGenerationStep('idle');
    } finally {
      store.setIsGenerating(false);
    }
  };

  /**
   * PDF生成（固定サイズでキャプチャしてA4出力）
   */
  const generatePdf = async () => {
    if (!store.newspaperData) {
      store.setError('新聞データがありません');
      return;
    }

    if (!store.isImagesPaid) {
      store.setError('PDF出力には画像の購入が必要です');
      return;
    }

    store.setIsGenerating(true);
    store.setGenerationStep('pdf');
    store.setError(null);
    store.setGenerationProgress(0);

    let cloneContainer: HTMLDivElement | null = null;

    try {
      console.log('[PDF] Starting PDF generation...');

      // プレビュー要素を取得
      const element = document.getElementById('newspaper-preview-for-pdf');
      if (!element) {
        throw new Error('プレビュー要素が見つかりません');
      }

      store.setGenerationProgress(10);

      // 動的インポート
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      store.setGenerationProgress(20);

      // オフスクリーンにクローンを作成（固定幅でレンダリング）
      cloneContainer = document.createElement('div');
      cloneContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 800px;
        background: white;
        z-index: -1;
      `;

      // 要素をクローン
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '800px';
      clone.style.maxWidth = '800px';
      clone.style.margin = '0';
      clone.style.padding = '20px';
      clone.style.boxSizing = 'border-box';

      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);

      // レンダリングを待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      store.setGenerationProgress(40);

      // html2canvasでキャプチャ（高画質設定）
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
      });

      store.setGenerationProgress(70);

      // A4サイズ（210mm x 297mm）
      const a4Width = 210;
      const a4Height = 297;

      // キャンバスのアスペクト比を計算
      const canvasRatio = canvas.height / canvas.width;

      // A4に収まるようにサイズ計算
      let pdfWidth = a4Width;
      let pdfHeight = a4Width * canvasRatio;

      // 高さがA4を超える場合は複数ページに分割
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (pdfHeight <= a4Height) {
        // 1ページに収まる場合
        const offsetY = (a4Height - pdfHeight) / 2; // 中央揃え
        pdf.addImage(imgData, 'JPEG', 0, offsetY, pdfWidth, pdfHeight);
      } else {
        // 複数ページに分割
        const pageCount = Math.ceil(pdfHeight / a4Height);
        const scaledCanvas = document.createElement('canvas');
        const ctx = scaledCanvas.getContext('2d');

        // A4幅に合わせたピクセルサイズ（300dpi相当）
        const pixelWidth = Math.round(a4Width * 11.81); // 約2480px
        const pixelHeight = Math.round(pdfHeight * 11.81);
        scaledCanvas.width = pixelWidth;
        scaledCanvas.height = pixelHeight;

        if (ctx) {
          ctx.drawImage(canvas, 0, 0, pixelWidth, pixelHeight);

          const pagePixelHeight = Math.round(a4Height * 11.81);

          for (let page = 0; page < pageCount; page++) {
            if (page > 0) pdf.addPage();

            // ページ用のキャンバスを作成
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = pixelWidth;
            pageCanvas.height = pagePixelHeight;
            const pageCtx = pageCanvas.getContext('2d');

            if (pageCtx) {
              pageCtx.fillStyle = '#ffffff';
              pageCtx.fillRect(0, 0, pixelWidth, pagePixelHeight);

              const sourceY = page * pagePixelHeight;
              const sourceHeight = Math.min(pagePixelHeight, pixelHeight - sourceY);

              pageCtx.drawImage(
                scaledCanvas,
                0, sourceY, pixelWidth, sourceHeight,
                0, 0, pixelWidth, sourceHeight
              );

              const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
              pdf.addImage(pageImgData, 'JPEG', 0, 0, a4Width, a4Height);
            }
          }
        }
      }

      store.setGenerationProgress(90);

      // PDFをBlobとして出力
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      store.setPdfUrl(pdfUrl);

      console.log('[PDF] PDF generated successfully');
      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
    } catch (error) {
      console.error('[PDF] Error:', error);
      store.setError(error instanceof Error ? error.message : 'PDF生成に失敗しました');
      store.setGenerationStep('idle');
    } finally {
      // クリーンアップ
      if (cloneContainer && cloneContainer.parentNode) {
        cloneContainer.parentNode.removeChild(cloneContainer);
      }
      store.setIsGenerating(false);
    }
  };

  // 後方互換性のため古い関数名も維持
  const startPreviewGeneration = startTextGeneration;
  const startProductionGeneration = startImageGeneration;

  return {
    startTextGeneration,
    startImageGeneration,
    generatePdf,
    // 後方互換性
    startPreviewGeneration,
    startProductionGeneration,
  };
};

// ユーティリティ関数
function base64ToBlob(base64: string, mimeType: string): Blob {
  try {
    // base64文字列のクリーンアップ（改行や余分な文字を削除）
    const cleanBase64 = base64.replace(/[\r\n\s]/g, '');
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray.buffer], { type: mimeType });
  } catch (error) {
    console.error('[PDF] base64ToBlob error:', error);
    console.error('[PDF] base64 preview:', base64?.slice(0, 100));
    throw new Error('PDFデータの変換に失敗しました');
  }
}

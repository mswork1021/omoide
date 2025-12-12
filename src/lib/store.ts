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
   * PDF生成（クライアントサイドで実行）
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

    try {
      console.log('[PDF Client] Starting client-side PDF generation...');
      store.setGenerationProgress(20);

      // 動的インポート（クライアントサイドのみ）
      const jsPDF = (await import('jspdf')).default;

      store.setGenerationProgress(40);

      // A3サイズでPDF作成
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a3',
      });

      const pageWidth = 297;
      const pageHeight = 420;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // 日付フォーマット
      const date = new Date(store.newspaperData.date);
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;

      // ヘッダー
      pdf.setFontSize(28);
      pdf.text(store.newspaperData.masthead || 'TimeTravel Press', pageWidth / 2, y + 10, { align: 'center' });

      pdf.setFontSize(10);
      pdf.text(dateStr, margin, y + 20);
      pdf.text(store.newspaperData.edition || '', pageWidth - margin - 30, y + 20);

      // 横線
      pdf.setLineWidth(0.5);
      pdf.line(margin, y + 25, pageWidth - margin, y + 25);
      y += 35;

      store.setGenerationProgress(50);

      // メイン記事
      const mainArticle = store.newspaperData.mainArticle;
      if (mainArticle) {
        pdf.setFontSize(20);
        const headlineLines = pdf.splitTextToSize(mainArticle.headline || '', contentWidth);
        pdf.text(headlineLines, margin, y);
        y += headlineLines.length * 8 + 5;

        if (mainArticle.subheadline) {
          pdf.setFontSize(12);
          pdf.text(mainArticle.subheadline, margin, y);
          y += 8;
        }

        pdf.setFontSize(10);
        const contentLines = pdf.splitTextToSize(mainArticle.content || '', contentWidth);
        for (const line of contentLines.slice(0, 20)) {
          pdf.text(line, margin, y);
          y += 4;
        }
        y += 10;
      }

      store.setGenerationProgress(70);

      // サブ記事
      const subArticles = store.newspaperData.subArticles || [];
      const colWidth = (contentWidth - 10) / 2;
      let leftY = y;
      let rightY = y;

      subArticles.slice(0, 4).forEach((article, i) => {
        const isLeft = i % 2 === 0;
        const colX = isLeft ? margin : margin + colWidth + 10;
        const currentY = isLeft ? leftY : rightY;

        pdf.setFontSize(12);
        const headLines = pdf.splitTextToSize(article.headline || '', colWidth);
        pdf.text(headLines, colX, currentY);

        pdf.setFontSize(9);
        const artContent = pdf.splitTextToSize(article.content || '', colWidth);
        let artY = currentY + headLines.length * 5;
        for (const line of artContent.slice(0, 8)) {
          pdf.text(line, colX, artY);
          artY += 3.5;
        }

        if (isLeft) leftY = artY + 10;
        else rightY = artY + 10;
      });

      store.setGenerationProgress(90);

      // フッター
      pdf.setFontSize(6);
      pdf.setTextColor(128);
      pdf.text('Generated by TimeTravel Press', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // PDFをBlobとして出力
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      store.setPdfUrl(pdfUrl);

      console.log('[PDF Client] PDF generated successfully');
      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
    } catch (error) {
      console.error('[PDF Client] Error:', error);
      store.setError(error instanceof Error ? error.message : 'PDF生成に失敗しました');
      store.setGenerationStep('idle');
    } finally {
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

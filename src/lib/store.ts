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

  // 決済状態
  selectedTier: 'standard' | 'premium' | 'deluxe';
  paymentIntentId: string | null;
  isPaid: boolean;

  // エラー
  error: string | null;

  // アクション
  setTargetDate: (date: Date | null) => void;
  setStyle: (style: 'showa' | 'heisei' | 'reiwa') => void;
  setRecipientName: (name: string) => void;
  setSenderName: (name: string) => void;
  setPersonalMessage: (message: string) => void;
  setOccasion: (occasion: string) => void;
  setSelectedTier: (tier: 'standard' | 'premium' | 'deluxe') => void;
  setNewspaperData: (data: NewspaperData | null) => void;
  setGeneratedImages: (images: GeneratedImages | null) => void;
  setPdfUrl: (url: string | null) => void;
  setPaymentIntentId: (id: string | null) => void;
  setIsPaid: (paid: boolean) => void;
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
  selectedTier: 'standard' as const,
  paymentIntentId: null,
  isPaid: false,
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
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setNewspaperData: (data) => set({ newspaperData: data }),
  setGeneratedImages: (images) => set({ generatedImages: images }),
  setPdfUrl: (url) => set({ pdfUrl: url }),
  setPaymentIntentId: (id) => set({ paymentIntentId: id }),
  setIsPaid: (paid) => set({ isPaid: paid }),
  setError: (error) => set({ error }),
  setGenerationStep: (step) => set({ generationStep: step }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  getGenerationRequest: () => {
    const state = get();
    return {
      targetDate: state.targetDate?.toISOString() || '',
      recipientName: state.recipientName || undefined,
      senderName: state.senderName || undefined,
      personalMessage: state.personalMessage || undefined,
      occasion: state.occasion || undefined,
      style: state.style,
    };
  },

  reset: () => set(initialState),
}));

// 生成フロー管理用のヘルパーフック
export const useGenerationFlow = () => {
  const store = useAppStore();

  const startPreviewGeneration = async () => {
    store.setIsGenerating(true);
    store.setGenerationStep('content');
    store.setError(null);

    try {
      const request = store.getGenerationRequest();

      // コンテンツ生成
      store.setGenerationProgress(20);
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
      store.setGenerationProgress(50);

      // 画像生成
      store.setGenerationStep('images');
      const imagePrompts: string[] = [];
      if (data.newspaper.mainArticle?.imagePrompt) {
        imagePrompts.push(data.newspaper.mainArticle.imagePrompt);
      }

      if (imagePrompts.length > 0) {
        try {
          const imageResponse = await fetch('/api/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompts: imagePrompts,
              style: 'vintage-newspaper',
            }),
          });

          const imageData = await imageResponse.json();
          if (imageData.success && imageData.images?.[0]) {
            store.setGeneratedImages({
              mainImage: imageData.images[0],
              subImages: imageData.images.slice(1) || [],
            });
          }
        } catch (imageError) {
          console.error('Image generation failed:', imageError);
          // 画像生成失敗は致命的ではないので続行
        }
      }

      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Unknown error');
      store.setGenerationStep('idle');
    } finally {
      store.setIsGenerating(false);
    }
  };

  const startProductionGeneration = async () => {
    if (!store.newspaperData) {
      store.setError('No newspaper data available');
      return;
    }

    store.setIsGenerating(true);
    store.setGenerationStep('images');
    store.setError(null);

    try {
      // 画像生成とPDF生成を並列実行
      store.setGenerationProgress(30);

      // 画像プロンプトを収集
      const imagePrompts: string[] = [];
      if (store.newspaperData.mainArticle.imagePrompt) {
        imagePrompts.push(store.newspaperData.mainArticle.imagePrompt);
      }

      // 画像生成
      const imageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: imagePrompts.length > 0 ? imagePrompts : ['vintage newspaper header image'],
          style: 'vintage-newspaper',
        }),
      });

      store.setGenerationProgress(60);

      const imageData = await imageResponse.json();
      if (imageData.success) {
        store.setGeneratedImages({
          mainImage: imageData.images?.[0],
          subImages: imageData.images?.slice(1) || [],
        });
      }

      // PDF生成
      store.setGenerationStep('pdf');
      store.setGenerationProgress(80);

      const pdfResponse = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: store.paymentIntentId,
          newspaperData: store.newspaperData,
          images: store.generatedImages,
          quality: store.selectedTier,
        }),
      });

      const pdfData = await pdfResponse.json();
      if (pdfData.success) {
        // Base64 PDFをBlobに変換してURLを作成
        const pdfBlob = base64ToBlob(pdfData.pdf, 'application/pdf');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        store.setPdfUrl(pdfUrl);
      }

      store.setGenerationProgress(100);
      store.setGenerationStep('complete');
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Production generation failed');
      store.setGenerationStep('idle');
    } finally {
      store.setIsGenerating(false);
    }
  };

  return {
    startPreviewGeneration,
    startProductionGeneration,
  };
};

// ユーティリティ関数
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray.buffer], { type: mimeType });
}

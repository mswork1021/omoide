'use client';

/**
 * Admin Page - 管理者専用テストページ
 * NEXT_PUBLIC_MAINTENANCE_MODE=true の時のみアクセス可能
 */

import { useState, useEffect, useCallback } from 'react';
import { Lock, Loader2, AlertTriangle } from 'lucide-react';
import { SampleCarousel, OrderForm, NewspaperPreview, PaymentSection, GenerationOverlay } from '@/components';
import { useAppStore } from '@/lib/store';

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
const AUTH_TOKEN_KEY = 'admin_auth_token';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { newspaperData } = useAppStore();
  const showModal = !!newspaperData;

  // MAINTENANCE_MODE=false の場合はアクセス不可
  useEffect(() => {
    if (!MAINTENANCE_MODE) {
      setIsLoading(false);
      return;
    }

    // 保存されたトークンを検証
    const verifyToken = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();

        if (data.valid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setIsSubmitting(false);
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <div className="animate-pulse text-[#8b4513]">読み込み中...</div>
      </div>
    );
  }

  // MAINTENANCE_MODE=false の場合
  if (!MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">アクセスできません</h1>
          <p className="text-sm text-[#1a1a1a]/60">
            管理者ページは現在無効になっています。
          </p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="text-blue-600" size={32} />
            </div>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">
              管理者ページ
            </h1>
            <p className="text-sm text-[#1a1a1a]/60">
              テスト生成用の管理者ページです
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-2">
                <Lock size={14} className="inline mr-1" />
                管理者パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="パスワードを入力"
                className="w-full px-4 py-3 border-2 border-[#1a1a1a]/20 rounded-lg focus:border-[#8b4513] focus:outline-none transition-colors"
                autoFocus
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">
                  パスワードが正しくありません
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#8b4513] text-white font-bold rounded-lg hover:bg-[#6d3610] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  確認中...
                </>
              ) : (
                'ログイン'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 認証済み - メインコンテンツ表示
  return (
    <div className="min-h-screen bg-[#f5f0e6]">
      <GenerationOverlay />

      {/* 管理者バナー */}
      <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm">
        🔧 管理者テストモード - 生成は無料です
      </div>

      {/* ヘッダー */}
      <header className="border-b-4 border-double border-[#1a1a1a] bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">TimeTravel Press - Admin</h1>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">完成イメージ</h3>
            <SampleCarousel />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">テスト生成</h3>
            <AdminOrderForm />
          </div>
        </div>
      </main>

      {/* プレビューモーダル */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-[#f5f0e6] rounded-lg shadow-2xl max-w-4xl w-full mx-4 my-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center">プレビュー</h2>
              <NewspaperPreview />
              <div className="mt-6">
                <AdminPaymentSection />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 管理者用OrderForm（テストコード常に有効）
function AdminOrderForm() {
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
    accuracy,
    setAccuracy,
    humorLevel,
    setHumorLevel,
    email,
    setEmail,
    appearInArticle,
    setAppearInArticle,
    appearanceType,
    setAppearanceType,
    appearanceTargets,
    toggleAppearanceTarget,
    newspaperData,
    isGenerating,
    generationStep,
  } = useAppStore();

  const { startTextGeneration } = require('@/lib/store').useGenerationFlow();
  const { DatePicker } = require('@/components/DatePicker');

  const [showPersonalMessage, setShowPersonalMessage] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isGenerated = !!newspaperData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    await startTextGeneration();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {/* 日付選択 */}
      <div>
        <label className="block text-sm font-bold mb-2">記念日</label>
        <DatePicker
          value={targetDate}
          onChange={setTargetDate}
          placeholder="例: 1990/04/01"
        />
      </div>

      {/* スタイル */}
      <div>
        <label className="block text-sm font-bold mb-2">スタイル</label>
        <div className="grid grid-cols-3 gap-2">
          {(['showa', 'heisei', 'reiwa'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`p-2 border-2 rounded text-sm ${
                style === s ? 'border-[#8b4513] bg-[#8b4513] text-white' : 'border-gray-200'
              }`}
            >
              {s === 'showa' ? '昭和' : s === 'heisei' ? '平成' : '令和'}
            </button>
          ))}
        </div>
      </div>

      {/* メールアドレス */}
      <div>
        <label className="block text-sm font-bold mb-2">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="test@example.com"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!targetDate || !isEmailValid || isGenerating || isGenerated}
        className="w-full py-3 bg-[#8b4513] text-white font-bold rounded disabled:opacity-50"
      >
        {isGenerating ? '生成中...' : isGenerated ? '生成済み' : 'テスト生成（無料）'}
      </button>
    </form>
  );
}

// 管理者用PaymentSection（画像追加も無料）
function AdminPaymentSection() {
  const {
    newspaperData,
    generatedImages,
    isImagesPaid,
    pdfUrl,
    isGenerating,
    reset,
  } = useAppStore();

  const { startImageGeneration, generatePdf } = require('@/lib/store').useGenerationFlow();

  const handleImageGenerate = async () => {
    await startImageGeneration();
  };

  if (!newspaperData) return null;

  // 画像未生成
  if (!generatedImages) {
    return (
      <div className="text-center space-y-4">
        <button
          onClick={handleImageGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {isGenerating ? '生成中...' : '画像を追加（無料）'}
        </button>
        <button
          onClick={reset}
          className="block mx-auto text-sm text-gray-500 underline"
        >
          別の日付で作成する
        </button>
      </div>
    );
  }

  // 画像生成済み
  return (
    <div className="text-center space-y-4">
      {pdfUrl && (
        <a
          href={pdfUrl}
          download
          className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg"
        >
          PDFをダウンロード
        </a>
      )}
      <button
        onClick={reset}
        className="block mx-auto text-sm text-gray-500 underline"
      >
        別の日付で作成する
      </button>
    </div>
  );
}

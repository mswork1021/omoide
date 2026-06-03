'use client';

/**
 * Admin Page - 管理者専用テストページ
 * NEXT_PUBLIC_MAINTENANCE_MODE=true の時のみアクセス可能
 *
 * 本番ページとの違い:
 * - 決済不要（無料で生成）
 * - パスワード認証が必要
 */

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Loader2, AlertTriangle, Newspaper, Sparkles, Gift, CheckCircle, X, Lightbulb, Star, Zap, Users, Calendar, User, ChevronDown, ChevronUp, FileText, Target, Smile, Mail, ImagePlus, Check, Download, Image, Copy } from 'lucide-react';
import { SampleCarousel, NewspaperPreview, GenerationOverlay, DatePicker } from '@/components';
import { useAppStore, useGenerationFlow } from '@/lib/store';
import html2canvas from 'html2canvas';

const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
const AUTH_TOKEN_KEY = 'admin_auth_token';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    newspaperData,
    generatedImages,
    isImagesPaid,
    reset,
    style,
  } = useAppStore();

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

  // 認証済み - メインコンテンツ表示（本番とほぼ同じ）
  return (
    <div className="min-h-screen bg-[#f5f0e6]">
      {/* 生成中オーバーレイ（最前面） */}
      <GenerationOverlay />

      {/* 管理者バナー */}
      <div className="bg-blue-600 text-white px-4 py-2 text-center text-sm font-bold">
        管理者テストモード - 生成は無料です
      </div>

      {/* ヘッダー */}
      <header className="border-b-4 border-double border-[#1a1a1a] bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="w-10 h-10" />
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight font-serif">
                  TimeTravel Press
                </h1>
                <p className="text-xs text-[#1a1a1a]/60">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Sparkles size={14} />
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#faf8f3] to-[#f5f0e6]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg md:text-xl text-[#1a1a1a]/60 mb-2">
            誕生日に。記念日に。還暦に。
          </p>
          <h2 className="text-2xl md:text-5xl font-black mb-4 leading-tight font-serif">
            大切な人を、人生の主役に。
            <br />
            <span className="text-[#8b4513]">新聞をプレゼントしよう。</span>
          </h2>
          <p className="text-base md:text-lg text-[#1a1a1a]/70 mb-8 max-w-2xl mx-auto">
            昭和のレトロ、平成の懐かしさ、令和のモダン。
            <br />
            3つの時代から選べます。
          </p>

          {/* 特徴バッジ */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full shadow-sm border border-blue-300">
              <span className="text-blue-600 font-bold">無料</span>
              <span className="text-sm font-medium">テストモード</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Zap size={18} className="text-[#8b4513]" />
              <span className="text-sm font-medium">約1分で完成</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
              <Sparkles size={18} className="text-[#8b4513]" />
              <span className="text-sm font-medium">スマホで簡単</span>
            </div>
          </div>
        </div>
      </section>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左側: サンプルカルーセル */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 font-serif">
              <Newspaper size={24} />
              完成イメージ
            </h3>
            <SampleCarousel />
          </div>

          {/* 右側: 注文フォーム */}
          <div>
            <div className="bg-[#faf8f3] rounded-lg shadow-lg border-2 border-[#1a1a1a] p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 font-serif">
                <Gift size={24} />
                あなたの記念日新聞を作成
              </h3>
              <AdminOrderForm />
            </div>
          </div>
        </div>

        {/* 利用の流れ */}
        <section className="mt-16 py-8">
          <h3 className="text-2xl font-bold text-center mb-8 font-serif">ご利用の流れ</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: '日付を選択', desc: '1900年〜1年後まで対応', price: '' },
              { step: 2, title: '記事を生成', desc: 'AIがその日の出来事を調査', price: '無料' },
              { step: 3, title: '画像を追加', desc: '気に入ったら画像をプラス', price: '無料' },
              { step: 4, title: 'ダウンロード', desc: '高画質PDF・画像で保存', price: '無料' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-[#1a1a1a]/60">{item.desc}</p>
                {item.price && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded">
                    {item.price}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* おすすめの作り方（チュートリアル） */}
        <section className="mt-16 py-10 bg-gradient-to-r from-[#8b4513]/5 to-[#d4a574]/10 rounded-xl border-2 border-[#8b4513]/20">
          <div className="px-6">
            <h3 className="text-2xl font-bold text-center mb-2 font-serif flex items-center justify-center gap-2">
              <Lightbulb className="text-[#8b4513]" size={28} />
              おすすめの作り方
            </h3>
            <p className="text-center text-[#1a1a1a]/60 mb-8">
              設定を組み合わせて、世界に一つだけの面白い新聞を作ろう！
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* レシピ1: フィクション全開 */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-[#1a1a1a]/10 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="text-purple-500" size={20} />
                  <h4 className="font-bold text-sm">フィクション全開</h4>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">正確性:</span>
                    <span className="font-bold text-purple-600">0%</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">ユーモア度:</span>
                    <span className="font-bold text-orange-500">100%</span>
                  </p>
                </div>
                <p className="text-xs text-[#1a1a1a]/60">
                  完全に架空の面白おかしい記事が生成されます。爆笑必至！
                </p>
              </div>

              {/* レシピ2: 矛盾を楽しむ */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-[#1a1a1a]/10 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-yellow-500" size={20} />
                  <h4 className="font-bold text-sm">矛盾を楽しむ</h4>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">正確性:</span>
                    <span className="font-bold text-blue-600">100%</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">ユーモア度:</span>
                    <span className="font-bold text-orange-500">100%</span>
                  </p>
                </div>
                <p className="text-xs text-[#1a1a1a]/60">
                  忠実な記事にユーモアが加わると…あれ、忠実じゃなくなる！？そこが面白い！
                </p>
              </div>

              {/* レシピ3: 主役登場（超おすすめ） */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 shadow-md border-2 border-[#8b4513] hover:shadow-lg transition-shadow relative">
                <div className="absolute -top-2 -right-2 bg-[#8b4513] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} />
                  超おすすめ
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-[#8b4513]" size={20} />
                  <h4 className="font-bold text-sm">主役登場</h4>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">宛名登場:</span>
                    <span className="font-bold text-[#8b4513]">主役として</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">登場記事:</span>
                    <span className="font-bold">メイン記事</span>
                  </p>
                </div>
                <p className="text-xs text-[#1a1a1a]/60">
                  贈る相手が記事の主役に！「○○さんが大活躍！」と見出しに名前が載る！
                </p>
              </div>

              {/* レシピ4: コメンテーター登場 */}
              <div className="bg-white rounded-lg p-4 shadow-md border border-[#1a1a1a]/10 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="text-pink-500" size={20} />
                  <h4 className="font-bold text-sm">関係者登場</h4>
                </div>
                <div className="space-y-1 text-xs mb-3">
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">宛名登場:</span>
                    <span className="font-bold text-pink-600">関係者として</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-[#1a1a1a]/60">正確性:</span>
                    <span className="font-bold">お好みで</span>
                  </p>
                </div>
                <p className="text-xs text-[#1a1a1a]/60">
                  「〜について○○さんは語った」と、さりげなく登場。自然な形で名前入り！
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-[#1a1a1a]/50 mt-6">
              ※ 設定を組み合わせて、あなただけのオリジナル新聞を作ってみてください！
            </p>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="mt-12 py-8 bg-[#faf8f3] rounded-lg border border-[#1a1a1a]/10">
          <h3 className="text-2xl font-bold text-center mb-8 font-serif">TimeTravel Press の特徴</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
            <div className="flex gap-4">
              <CheckCircle className="text-[#8b4513] flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold mb-1">AIが調べて記事を生成</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  Gemini AIがその日の出来事を調査し、時代の雰囲気を感じる記事を生成します。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-[#8b4513] flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold mb-1">ヴィンテージ画像</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  AI画像生成による網点処理やインク滲み効果で、本物の古新聞のような質感を再現。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-[#8b4513] flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold mb-1">高画質で保存</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  PDF・画像で高画質保存。大切な人へのプレゼントにも最適です。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 生成結果モーダル */}
      {showModal && newspaperData && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
              {/* モーダルヘッダー */}
              <div className="bg-[#faf8f3] rounded-t-lg p-4 flex items-center justify-between border-b-2 border-[#1a1a1a]">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="text-[#8b4513]" />
                  {isImagesPaid ? '新聞が完成しました！' : '記事が生成されました！'}
                </h2>
                <button
                  onClick={() => reset()}
                  className="p-2 hover:bg-[#1a1a1a]/10 rounded-full transition-colors"
                  title="閉じる"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 2カラムレイアウト: プレビュー + アクション */}
              <div className="bg-white flex flex-col lg:flex-row">
                {/* 左側: 新聞プレビュー */}
                <div className="flex-1 p-4 md:p-6 border-r border-[#1a1a1a]/10">
                  <div id="newspaper-preview-for-pdf">
                    <NewspaperPreview
                      data={newspaperData}
                      style={style}
                      isPreview={!isImagesPaid}
                      images={generatedImages || undefined}
                    />
                  </div>
                </div>

                {/* 右側: アクションパネル（画像追加 or PDF） */}
                <div className="w-full lg:w-80 p-4 md:p-6 bg-[#faf8f3]">
                  <AdminPaymentSection />
                </div>
              </div>

              {/* モーダルフッター */}
              <div className="bg-[#faf8f3] rounded-b-lg p-4 flex justify-center border-t-2 border-[#1a1a1a]">
                <button
                  onClick={() => reset()}
                  className="px-6 py-2 border-2 border-[#1a1a1a] rounded-lg font-bold hover:bg-[#1a1a1a]/5 transition-colors"
                >
                  別の日付で作成する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 管理者用OrderForm（決済なし、直接生成）
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
    error,
  } = useAppStore();

  const { startTextGeneration } = useGenerationFlow();

  const [showPersonalMessage, setShowPersonalMessage] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isGenerated = !!newspaperData;

  const styleOptions = [
    { value: 'showa', label: '昭和風', description: '重厚な活字文化', recommended: false },
    { value: 'heisei', label: '平成風', description: 'バブル期の華やかさ', recommended: false },
    { value: 'reiwa', label: '令和風', description: 'レトロモダン', recommended: true },
  ] as const;

  const occasionPresets = [
    '誕生日', '結婚記念日', '還暦祝い', '入学祝い', '卒業祝い', '退職記念', 'その他',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    // 管理者モードでは直接生成（決済なし）
    await startTextGeneration();
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
          1900年〜1年後までの日付を選択できます
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
                relative p-3 border-2 rounded-lg text-center transition-all text-sm
                ${
                  style === option.value
                    ? 'border-[#8b4513] bg-[#8b4513] text-white'
                    : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                }
              `}
            >
              {option.recommended && (
                <span className={`
                  absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full
                  ${style === option.value ? 'bg-yellow-400 text-[#8b4513]' : 'bg-[#8b4513] text-white'}
                `}>
                  オススメ
                </span>
              )}
              <div className="font-bold">{option.label}</div>
              <div className="text-xs mt-0.5 opacity-80">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ステップ3: 正確性ゲージ */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Target size={20} />
            史実の正確性
          </label>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#1a1a1a]/60">
            <span>フィクション重視</span>
            <span className="font-bold text-[#8b4513]">{accuracy}%</span>
            <span>史実重視</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={accuracy}
            onChange={(e) => setAccuracy(Number(e.target.value))}
            className="w-full h-2 bg-[#1a1a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#8b4513]"
          />
          <p className="text-xs text-[#1a1a1a]/50 mt-1">
            ※ 100%でも、その日に大きな出来事がない場合は架空の記事になることがあります
          </p>
        </div>
      </div>

      {/* ステップ4: ユーモア度ゲージ */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            4
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Smile size={20} />
            ユーモア度
          </label>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#1a1a1a]/60">
            <span>真面目・フォーマル</span>
            <span className="font-bold text-[#8b4513]">{humorLevel}%</span>
            <span>おもしろ・カジュアル</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={humorLevel}
            onChange={(e) => setHumorLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#1a1a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#8b4513]"
          />
          <p className="text-xs text-[#1a1a1a]/50 mt-1">
            ※ 高いほど、ジョークや面白おかしい表現が増えます
          </p>
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
              <label className="block text-sm font-medium mb-1">
                メッセージ
                <span className="text-xs text-[#1a1a1a]/50 ml-2">({personalMessage.length}/50)</span>
              </label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value.slice(0, 50))}
                placeholder="お祝いのメッセージを入力..."
                rows={2}
                maxLength={50}
                className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white resize-none"
              />
            </div>

            {/* 記事登場設定 */}
            {recipientName && (
              <div className="border-t border-[#1a1a1a]/10 pt-3 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearInArticle}
                    onChange={(e) => setAppearInArticle(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1a1a1a]/20 text-[#8b4513] focus:ring-[#8b4513]"
                  />
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Star size={14} />
                    {recipientName}さんを記事に登場させる
                  </span>
                </label>

                {appearInArticle && (
                  <div className="mt-3 ml-6 space-y-3">
                    {/* 登場方法 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-[#1a1a1a]/60">登場のさせ方</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAppearanceType('protagonist')}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 transition-all ${
                            appearanceType === 'protagonist'
                              ? 'border-[#8b4513] bg-[#8b4513] text-white'
                              : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                          }`}
                        >
                          <div className="font-bold">主役として</div>
                          <div className="opacity-80 mt-0.5">「○○さんが大活躍！」</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppearanceType('commentator')}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 transition-all ${
                            appearanceType === 'commentator'
                              ? 'border-[#8b4513] bg-[#8b4513] text-white'
                              : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                          }`}
                        >
                          <div className="font-bold">関係者として</div>
                          <div className="opacity-80 mt-0.5">「〜について○○さんは…」</div>
                        </button>
                      </div>
                    </div>

                    {/* 登場させる記事 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-[#1a1a1a]/60">登場させる記事（複数選択可）</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: 'main', label: 'メイン記事' },
                          { key: 'sub1', label: 'サブ記事1' },
                          { key: 'sub2', label: 'サブ記事2' },
                          { key: 'sub3', label: 'サブ記事3' },
                        ].map((article) => (
                          <button
                            key={article.key}
                            type="button"
                            onClick={() => toggleAppearanceTarget(article.key)}
                            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                              appearanceTargets.includes(article.key)
                                ? 'bg-[#8b4513] text-white border-[#8b4513]'
                                : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                            }`}
                          >
                            {article.label}
                          </button>
                        ))}
                      </div>
                      {appearanceTargets.length === 0 && (
                        <p className="text-xs text-red-600 mt-1 font-bold">少なくとも1つ選択してください（選択しないと生成できません）</p>
                      )}
                    </div>

                    <div className="text-xs text-[#1a1a1a]/50 space-y-1">
                      <p>※ どのように登場するかはお楽しみ！</p>
                      <p>※ AIが職業や年齢などを創作して記事に書くことがあります。架空の設定もぜひお楽しみください！</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* メールアドレス入力（PDF送信用） */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            5
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Mail size={20} />
            メールアドレス
          </label>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
          required
        />
        <div className="mt-2 space-y-1">
          <p className="text-xs text-[#1a1a1a]/50">
            画像追加後、完成したPDFをメールでお届けします
          </p>
        </div>
      </div>

      {/* 送信ボタン - 管理者モードでは無料で直接生成 */}
      <button
        type="submit"
        disabled={!targetDate || !isEmailValid || isGenerating || isGenerated || (appearInArticle && appearanceTargets.length === 0)}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            !targetDate || !isEmailValid || isGenerating || isGenerated
              ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]/40 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {generationStep === 'content' && '記事を生成中...'}
            {generationStep === 'images' && '画像を生成中...'}
            {generationStep === 'pdf' && 'PDF作成中...'}
            {generationStep === 'idle' && '処理中...'}
          </>
        ) : isGenerated ? (
          <>
            <FileText size={20} />
            生成済み（下のプレビューを確認）
          </>
        ) : (
          <>
            <FileText size={20} />
            記事を生成する（無料）
          </>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          エラー: {error}
        </div>
      )}

      {/* 注意書き・免責事項 */}
      <div className="text-xs text-[#1a1a1a]/50 space-y-2 p-3 bg-[#1a1a1a]/5 rounded-lg">
        <p>
          <span className="font-bold">ご注意:</span> 矛盾する設定の組み合わせ（例：正確性100% × ユーモア度100%、正確性100% × 宛名登場）の場合、条件が混ざり合い予想外の結果になることがあります。そのごちゃ混ぜ感もお楽しみください！
        </p>
        <p>
          <span className="font-bold">免責事項:</span> 本サービスで生成される新聞記事はAIによるフィクションです。内容の正確性・事実性は保証しておりません。生成された記事に関して、当サービスは一切の責任を負いません。
        </p>
      </div>
    </form>
  );
}

// 管理者用PaymentSection（決済なし、直接生成）
function AdminPaymentSection() {
  const {
    newspaperData,
    generatedImages,
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

  const pdfGenerationTriggered = useRef(false);

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
      setTimeout(() => {
        generatePdf();
      }, 500);
    }
  }, [isImagesPaid, generatedImages, pdfUrl, isGenerating, generatePdf]);

  if (!newspaperData) {
    return null;
  }

  // 画像追加（管理者モードでは無料で直接生成）
  const handleImageGenerate = async () => {
    setIsImagesPaid(true);
    await startImageGeneration();
  };

  // iOS検出
  const isIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
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

  // 画像としてダウンロード
  const handleImageDownload = async () => {
    const element = document.getElementById('newspaper-preview-for-pdf');
    if (!element) {
      alert('プレビューが見つかりません');
      return;
    }

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

      document.body.removeChild(cloneContainer);
      cloneContainer = null;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const watermarkHeight = 60;
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height + watermarkHeight;

        const newCtx = newCanvas.getContext('2d');
        if (newCtx) {
          newCtx.drawImage(canvas, 0, 0);
          newCtx.fillStyle = '#1a1a1a';
          newCtx.fillRect(0, canvas.height, newCanvas.width, watermarkHeight);
          newCtx.fillStyle = '#ffffff';
          newCtx.font = 'bold 28px sans-serif';
          newCtx.textAlign = 'center';
          newCtx.textBaseline = 'middle';
          newCtx.fillText('timetravel-press.com', newCanvas.width / 2, canvas.height + watermarkHeight / 2);

          const imageDataUrl = newCanvas.toDataURL('image/png');
          const dateStr = new Date(newspaperData.date).toISOString().split('T')[0];

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
                    画像を長押しして「写真に追加」を選んでください
                  </div>
                  <img src="${imageDataUrl}" alt="記念日新聞" />
                </body>
              </html>
            `);
            newWindow.document.close();
            return;
          }

          const link = document.createElement('a');
          link.href = imageDataUrl;
          link.download = `timetravel-press-${dateStr}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      }
    } catch (error) {
      console.error('Image download error:', error);
      if (cloneContainer && document.body.contains(cloneContainer)) {
        document.body.removeChild(cloneContainer);
      }
      if (newWindow) newWindow.close();
      alert('画像のダウンロードに失敗しました。もう一度お試しください。');
    }
  };

  // 記事テキストをコピー
  const handleCopyText = async () => {
    if (!newspaperData) return;

    const mainArticle = newspaperData.mainArticle;
    const subArticles = newspaperData.subArticles || [];

    let text = `【${newspaperData.masthead}】\n`;
    text += `${newspaperData.date}\n\n`;

    if (mainArticle) {
      text += `■ ${mainArticle.headline}\n`;
      text += `${mainArticle.content}\n\n`;
    }

    subArticles.forEach((article: any) => {
      if (article) {
        text += `■ ${article.headline}\n`;
        text += `${article.content}\n\n`;
      }
    });

    if (newspaperData.editorial) {
      text += `【社説】${newspaperData.editorial.headline}\n`;
      text += `${newspaperData.editorial.content}\n\n`;
    }

    if (newspaperData.columnTitle) {
      text += `【コラム】${newspaperData.columnTitle}\n`;
      text += `${newspaperData.columnContent}\n`;
    }

    try {
      await navigator.clipboard.writeText(text);
      alert('記事テキストをコピーしました！\nメモ帳などに貼り付けて保存できます。');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('記事テキストをコピーしました！\nメモ帳などに貼り付けて保存できます。');
    }
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

          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={handleImageDownload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#8b4513] text-white font-medium rounded-lg hover:bg-[#6d3610] transition-colors text-sm"
            >
              <Image size={16} />
              画像として保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 画像購入済み、PDF生成待ち
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

      {/* テキストコピーボタン */}
      <button
        onClick={handleCopyText}
        className="w-full py-3 border-2 border-[#8b4513] text-[#8b4513] font-bold rounded-lg hover:bg-[#8b4513]/10 transition-colors flex items-center justify-center gap-2"
      >
        <Copy size={18} />
        記事テキストをコピーする
      </button>

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
              <li className="flex items-center gap-2">
                <Check size={14} />
                画像出力が無料
              </li>
            </ul>
            <div className="text-2xl font-black text-blue-600">
              無料
              <span className="text-sm font-normal ml-2">（テストモード）</span>
            </div>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {storeError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {storeError}
        </div>
      )}

      {/* 生成ボタン */}
      <button
        onClick={handleImageGenerate}
        disabled={isGenerating}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            isGenerating
              ? 'bg-purple-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            処理中...
          </>
        ) : (
          <>
            <ImagePlus size={20} />
            画像を追加（無料）
          </>
        )}
      </button>
    </div>
  );
}

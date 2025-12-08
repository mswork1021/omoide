'use client';

/**
 * TimeTravel Press - Home Page
 * 記念日新聞生成サービス メインページ
 */

import React from 'react';
import { GenerationForm, NewspaperPreview, PaymentSection } from '@/components';
import { useAppStore } from '@/lib/store';
import { Newspaper, Clock, Sparkles, Gift, Printer, Shield } from 'lucide-react';

export default function Home() {
  const { newspaperData, generatedImages, isPaid } = useAppStore();

  return (
    <div className="min-h-screen bg-[#f5f0e6]">
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
                  Gemini 3.0 Edition
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
      {!newspaperData && (
        <section className="py-12 md:py-20 bg-gradient-to-b from-[#faf8f3] to-[#f5f0e6]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight font-serif">
              あの日の新聞を、
              <br />
              <span className="text-[#8b4513]">AIで再現</span>
            </h2>
            <p className="text-lg md:text-xl text-[#1a1a1a]/70 mb-8 max-w-2xl mx-auto">
              誕生日、結婚記念日、還暦祝い...
              <br />
              大切な記念日を、昭和・平成のレトロ新聞風にお届けします。
            </p>

            {/* 特徴バッジ */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <Clock size={18} className="text-[#8b4513]" />
                <span className="text-sm font-medium">1900年〜対応</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <Sparkles size={18} className="text-[#8b4513]" />
                <span className="text-sm font-medium">Gemini 3.0搭載</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
                <Gift size={18} className="text-[#8b4513]" />
                <span className="text-sm font-medium">メッセージ追加可</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!newspaperData ? (
          /* 生成フォーム */
          <div className="max-w-xl mx-auto">
            <div className="bg-[#faf8f3] rounded-lg shadow-lg border-2 border-[#1a1a1a] p-6 md:p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 font-serif">
                <Clock size={24} />
                記念日新聞を作成
              </h3>
              <GenerationForm />
            </div>
          </div>
        ) : (
          /* プレビュー + 決済 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 新聞プレビュー */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 border-2 border-[#1a1a1a]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-serif">プレビュー</h3>
                  {!isPaid && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      無料プレビュー
                    </span>
                  )}
                </div>
                <div className="overflow-auto max-h-[80vh]">
                  <NewspaperPreview
                    data={newspaperData}
                    isPreview={!isPaid}
                    images={generatedImages || undefined}
                  />
                </div>
              </div>
            </div>

            {/* サイドバー（決済・ダウンロード） */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4">
                <div className="bg-[#faf8f3] rounded-lg shadow-lg p-6 border-2 border-[#1a1a1a]">
                  <PaymentSection />
                </div>

                {/* もう一度作成ボタン */}
                <button
                  onClick={() => {
                    useAppStore.getState().reset();
                  }}
                  className="w-full py-3 text-sm border-2 border-[#1a1a1a]/20 rounded-lg hover:border-[#1a1a1a]/40 transition-colors"
                >
                  別の日付で作成し直す
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="mt-16 border-t-2 border-[#1a1a1a]/20 bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* サービス説明 */}
            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Newspaper size={18} />
                TimeTravel Press
              </h4>
              <p className="text-sm text-[#1a1a1a]/60">
                最新AI技術（Gemini 3.0 + Nano Banana
                Pro）を活用した、記念日新聞生成サービスです。
              </p>
            </div>

            {/* 機能 */}
            <div>
              <h4 className="font-bold mb-3">特徴</h4>
              <ul className="text-sm text-[#1a1a1a]/60 space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles size={14} />
                  Google Grounding による事実確認
                </li>
                <li className="flex items-center gap-2">
                  <Printer size={14} />
                  印刷対応高画質PDF出力
                </li>
                <li className="flex items-center gap-2">
                  <Gift size={14} />
                  カスタムメッセージ機能
                </li>
              </ul>
            </div>

            {/* 安全性 */}
            <div>
              <h4 className="font-bold mb-3">安全なサービス</h4>
              <ul className="text-sm text-[#1a1a1a]/60 space-y-2">
                <li className="flex items-center gap-2">
                  <Shield size={14} />
                  Stripe による安全な決済
                </li>
                <li>プレビューは完全無料</li>
                <li>データは自動削除</li>
              </ul>
            </div>
          </div>

          <div className="text-center text-xs text-[#1a1a1a]/40 border-t border-[#1a1a1a]/10 pt-4">
            <p>
              &copy; {new Date().getFullYear()} TimeTravel Press. All rights reserved.
            </p>
            <p className="mt-1">
              Powered by Gemini 3.0 & Nano Banana Pro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

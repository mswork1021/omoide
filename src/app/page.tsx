'use client';

/**
 * TimeTravel Press - Home Page
 * 記念日新聞生成サービス メインページ
 *
 * 新フロー: サンプル閲覧 → 日付選択 → テキスト生成(80円) → 画像追加(500円) → PDF(無料)
 */

import React from 'react';
import { SampleCarousel, OrderForm, NewspaperPreview, PaymentSection } from '@/components';
import { Newspaper, Clock, Sparkles, Gift, Printer, Shield, CheckCircle, X, Lightbulb, Star, Zap, Users } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { newspaperData, generatedImages, isImagesPaid, reset, style } = useAppStore();

  // モーダル表示条件: 新聞データが生成されたら表示
  const showModal = !!newspaperData;

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
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#faf8f3] to-[#f5f0e6]">
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
          <div className="flex flex-wrap justify-center gap-4">
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
              <OrderForm />
            </div>
          </div>
        </div>

        {/* 利用の流れ */}
        <section className="mt-16 py-8">
          <h3 className="text-2xl font-bold text-center mb-8 font-serif">ご利用の流れ</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, title: '日付を選択', desc: '1900年〜現在まで対応', price: '' },
              { step: 2, title: '記事を生成', desc: 'AIがその日の出来事を調査', price: '¥80' },
              { step: 3, title: '画像を追加', desc: '気に入ったら画像をプラス', price: '¥500' },
              { step: 4, title: 'PDFダウンロード', desc: '高画質PDFで保存', price: '無料' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold mb-1">{item.title}</h4>
                <p className="text-sm text-[#1a1a1a]/60">{item.desc}</p>
                {item.price && (
                  <span className="inline-block mt-2 px-2 py-1 bg-[#8b4513]/10 text-[#8b4513] text-xs font-bold rounded">
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
                  史実をベースに東スポ風の大げさ表現で！ごちゃ混ぜ感が面白い
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
                <h4 className="font-bold mb-1">事実に基づいた記事</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  Gemini 3.0のGoogle Grounding機能で、実際のその日の出来事を調査して記事を生成します。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-[#8b4513] flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold mb-1">ヴィンテージ画像</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  Nano Banana Proによる網点処理やインク滲み効果で、本物の古新聞のような質感を再現。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="text-[#8b4513] flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold mb-1">印刷対応品質</h4>
                <p className="text-sm text-[#1a1a1a]/60">
                  高解像度PDFで出力。額装してプレゼントにも最適です。
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
                  <PaymentSection />
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

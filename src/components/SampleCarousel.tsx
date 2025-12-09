'use client';

/**
 * SampleCarousel Component
 * サンプル新聞をカルーセル表示
 * 本番と完全に同じレイアウトで表示（スタイル適用）
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { sampleNewspapers, sampleMeta } from '@/lib/sampleData';
import { NewspaperPreview } from './NewspaperPreview';

export function SampleCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? sampleNewspapers.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === sampleNewspapers.length - 1 ? 0 : prev + 1
    );
  };

  const currentSample = sampleNewspapers[currentIndex];
  const currentMeta = sampleMeta[currentIndex];

  // スタイルに応じた色
  const styleColors = {
    reiwa: { bg: 'bg-[#3b82f6]', text: 'text-white' },
    heisei: { bg: 'bg-[#e63946]', text: 'text-white' },
    showa: { bg: 'bg-[#8b4513]', text: 'text-white' },
  };

  const colors = styleColors[currentMeta.style];

  return (
    <div className="sample-carousel">
      {/* サンプル情報ヘッダー */}
      <div className="text-center mb-4">
        <span className={`inline-block ${colors.bg} ${colors.text} text-xs px-3 py-1 rounded-full mb-2`}>
          サンプル {currentIndex + 1} / {sampleNewspapers.length}
        </span>
        <h3 className="text-xl font-bold">{currentMeta.title}</h3>
        <p className="text-sm text-[#1a1a1a]/60">{currentMeta.description}</p>
      </div>

      {/* カルーセル本体 */}
      <div className="relative">
        {/* 左矢印 */}
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
                     w-10 h-10 bg-white rounded-full shadow-lg border border-[#1a1a1a]/10
                     flex items-center justify-center hover:bg-[#f5f0e6] transition-colors"
          aria-label="前のサンプル"
        >
          <ChevronLeft size={24} />
        </button>

        {/* 新聞プレビュー - スタイルを渡す */}
        <div className="overflow-hidden rounded-lg border-2 border-[#1a1a1a] shadow-xl">
          <div className="max-h-[600px] overflow-y-auto">
            <NewspaperPreview
              data={currentSample}
              style={currentMeta.style}
              isPreview={true}
            />
          </div>
        </div>

        {/* 右矢印 */}
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
                     w-10 h-10 bg-white rounded-full shadow-lg border border-[#1a1a1a]/10
                     flex items-center justify-center hover:bg-[#f5f0e6] transition-colors"
          aria-label="次のサンプル"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ドットインジケーター（スタイル別色分け） */}
      <div className="flex justify-center gap-2 mt-4">
        {sampleMeta.map((meta, index) => (
          <button
            key={meta.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex
                ? styleColors[meta.style].bg
                : 'bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40'
            }`}
            aria-label={`${meta.title}を表示`}
          />
        ))}
      </div>

      {/* サンプル説明 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-[#1a1a1a]/60">
          これは{currentMeta.title}のサンプルです。
          <br />
          実際のご注文では、ご指定の日付・スタイルで生成されます。
        </p>
        <p className="text-xs text-[#1a1a1a]/40 mt-2">
          ※ 画像部分は本番では AI が生成します
        </p>
      </div>
    </div>
  );
}

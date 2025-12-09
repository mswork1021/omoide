'use client';

/**
 * NewspaperPreview Component
 * ヴィンテージ新聞レイアウトのプレビュー表示
 */

import React from 'react';
import type { NewspaperData } from '@/types';

interface NewspaperPreviewProps {
  data: NewspaperData;
  isPreview?: boolean;
  images?: {
    mainImage?: string;
    subImages?: string[];
  };
}

export function NewspaperPreview({
  data,
  isPreview = true,
  images,
}: NewspaperPreviewProps) {
  const dateStr = new Date(data.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div
      id="newspaper-preview"
      className="newspaper-container bg-[#f5f0e6] text-[#1a1a1a] font-serif"
    >
      {/* ヘッダー（題字） */}
      <header className="newspaper-header border-b-4 border-double border-[#1a1a1a] pb-3 mb-4">
        <div className="flex justify-between items-end text-xs mb-2">
          <span>{data.edition}</span>
          <span>天気: {data.weather}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-center tracking-widest">
          {data.masthead}
        </h1>
        <div className="text-center text-sm mt-2 tracking-wide">{dateStr}</div>
      </header>

      {/* メインコンテンツ */}
      <div className="newspaper-body grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* メイン記事 */}
        <article className="main-article md:col-span-8 border-r border-[#1a1a1a]/20 pr-4">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-2">
            {data.mainArticle.headline}
          </h2>
          {data.mainArticle.subheadline && (
            <h3 className="text-lg text-[#1a1a1a]/80 mb-3">
              {data.mainArticle.subheadline}
            </h3>
          )}

          <div className="flex gap-4 mb-4">
            {/* 画像プレースホルダー or 実画像 */}
            <div className="w-2/3 aspect-[4/3] bg-[#e5e0d6] flex items-center justify-center relative overflow-hidden">
              {images?.mainImage ? (
                <img
                  src={images.mainImage}
                  alt="記事画像"
                  className="w-full h-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="text-center text-[#1a1a1a]/40 p-4">
                  <div className="text-4xl mb-2">📰</div>
                  <div className="text-xs">
                    {isPreview ? 'プレビュー表示' : '画像なし'}
                  </div>
                </div>
              )}
              {/* 網点オーバーレイ */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                  backgroundSize: '3px 3px',
                }}
              />
            </div>

            {/* 本文（縦書き風） */}
            <div className="w-1/3 text-sm leading-relaxed">
              {data.mainArticle.content.slice(0, 200)}...
            </div>
          </div>

          {/* 本文続き */}
          <p className="text-sm leading-relaxed columns-2 gap-4">
            {data.mainArticle.content}
          </p>
        </article>

        {/* サイドバー（サブ記事） */}
        <aside className="sub-articles md:col-span-4 space-y-4">
          {data.subArticles.slice(0, 3).map((article, index) => (
            <article
              key={index}
              className="border-b border-[#1a1a1a]/20 pb-3"
            >
              <span className="text-xs bg-[#1a1a1a] text-[#f5f0e6] px-2 py-0.5">
                {article.category === 'politics' && '政治'}
                {article.category === 'economy' && '経済'}
                {article.category === 'society' && '社会'}
                {article.category === 'culture' && '文化'}
                {article.category === 'sports' && 'スポーツ'}
              </span>
              <h4 className="text-lg font-bold mt-2 mb-1">{article.headline}</h4>
              <p className="text-xs leading-relaxed line-clamp-4">
                {article.content}
              </p>
            </article>
          ))}
        </aside>
      </div>

      {/* 中段（社説・コラム） */}
      <div className="newspaper-middle grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 pt-4 border-t-2 border-[#1a1a1a]">
        {/* 社説 */}
        <article className="editorial md:col-span-8 border-r border-[#1a1a1a]/20 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold">【社説】</span>
            <h3 className="text-xl font-bold">{data.editorial.headline}</h3>
          </div>
          <p className="text-sm leading-relaxed columns-2 gap-4">
            {data.editorial.content}
          </p>
        </article>

        {/* コラム */}
        <aside className="column md:col-span-4 bg-[#e5e0d6] p-3">
          <h4 className="text-lg font-bold mb-2 border-b border-[#1a1a1a] pb-1">
            {data.columnTitle}
          </h4>
          <p className="text-xs leading-relaxed">{data.columnContent}</p>
        </aside>
      </div>

      {/* 個人メッセージ（存在する場合） */}
      {data.personalMessage && (
        <div className="personal-message mt-6 p-4 border-4 border-double border-[#1a1a1a] bg-[#faf8f3] text-center">
          <div className="text-sm mb-2">{data.personalMessage.occasion} 記念</div>
          <div className="text-2xl font-bold mb-3">
            {data.personalMessage.recipientName} 様へ
          </div>
          <p className="text-sm leading-relaxed max-w-md mx-auto">
            {data.personalMessage.message}
          </p>
          <div className="text-right text-sm mt-3">
            {data.personalMessage.senderName} より
          </div>
        </div>
      )}

      {/* 広告欄 */}
      <div className="advertisements mt-6 pt-4 border-t border-[#1a1a1a] grid grid-cols-3 gap-2">
        {data.advertisements.slice(0, 3).map((ad, index) => (
          <div
            key={index}
            className="ad-box border border-[#1a1a1a]/40 p-2 text-center text-xs"
          >
            <div className="font-bold mb-1">{ad.title}</div>
            <div className="text-[10px] leading-tight">{ad.content}</div>
          </div>
        ))}
      </div>

      {/* フッター */}
      <footer className="newspaper-footer mt-4 pt-2 border-t border-[#1a1a1a]/40 text-center text-[10px] text-[#1a1a1a]/60">
        Generated by TimeTravel Press (Gemini 3.0 Edition)
        {isPreview && (
          <span className="ml-2 text-red-600">※ プレビュー表示</span>
        )}
      </footer>
    </div>
  );
}

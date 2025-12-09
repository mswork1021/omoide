'use client';

/**
 * NewspaperPreview Component
 * 3スタイル対応の新聞プレビュー
 * - 昭和風: セピア調、重厚、縦書き風
 * - 平成風: カラフル、ポップ、活気
 * - 令和風: ミニマル、モダン、洗練
 */

import React from 'react';
import type { NewspaperData } from '@/types';

interface NewspaperPreviewProps {
  data: NewspaperData;
  style?: 'showa' | 'heisei' | 'reiwa';
  isPreview?: boolean;
  images?: {
    mainImage?: string;
    subImages?: string[];
  };
}

// スタイル定義
const styleConfig = {
  showa: {
    name: '昭和',
    bg: 'bg-[#f4e8d3]',
    paper: 'bg-[#faf5eb]',
    text: 'text-[#2c1810]',
    accent: 'bg-[#8b4513]',
    accentText: 'text-[#8b4513]',
    border: 'border-[#2c1810]',
    headerBg: 'bg-[#2c1810]',
    headerText: 'text-[#f4e8d3]',
    fontFamily: 'font-serif',
    filter: 'sepia(20%)',
  },
  heisei: {
    name: '平成',
    bg: 'bg-gradient-to-br from-[#fff5f5] to-[#f0f8ff]',
    paper: 'bg-white',
    text: 'text-[#1a1a2e]',
    accent: 'bg-[#e63946]',
    accentText: 'text-[#e63946]',
    border: 'border-[#1a1a2e]',
    headerBg: 'bg-gradient-to-r from-[#e63946] to-[#f77f00]',
    headerText: 'text-white',
    fontFamily: 'font-sans',
    filter: 'none',
  },
  reiwa: {
    name: '令和',
    bg: 'bg-[#fafafa]',
    paper: 'bg-white',
    text: 'text-[#1a1a1a]',
    accent: 'bg-[#0066cc]',
    accentText: 'text-[#0066cc]',
    border: 'border-[#e0e0e0]',
    headerBg: 'bg-[#1a1a1a]',
    headerText: 'text-white',
    fontFamily: 'font-sans',
    filter: 'none',
  },
};

export function NewspaperPreview({
  data,
  style = 'showa',
  isPreview = true,
  images,
}: NewspaperPreviewProps) {
  const config = styleConfig[style];

  const dateStr = new Date(data.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 画像表示コンポーネント
  const ImageBox = ({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) => (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ filter: config.filter }}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${config.bg}`}>
          <span className="text-4xl opacity-30">📷</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      id="newspaper-preview"
      className={`newspaper-container ${config.paper} ${config.text} ${config.fontFamily} p-6 md:p-8 shadow-2xl`}
      style={{ minHeight: '800px' }}
    >
      {/* ========== ヘッダー（題字） ========== */}
      <header className={`newspaper-header ${config.headerBg} ${config.headerText} -mx-6 -mt-6 md:-mx-8 md:-mt-8 px-6 py-4 md:px-8 md:py-6 mb-6`}>
        <div className="flex justify-between items-center text-xs md:text-sm opacity-80 mb-2">
          <span>{data.edition}</span>
          <span>{dateStr}</span>
          <span>天気: {data.weather}</span>
        </div>
        <h1 className={`text-3xl md:text-5xl font-black text-center tracking-[0.2em] ${style === 'showa' ? 'font-serif' : ''}`}>
          {data.masthead}
        </h1>
        {style === 'heisei' && (
          <div className="text-center text-sm mt-2 opacity-80">〜 あの日の思い出をお届けします 〜</div>
        )}
      </header>

      {/* ========== 個人メッセージ（あれば一番目立つ位置に） ========== */}
      {data.personalMessage && (
        <div className={`personal-message mb-8 p-6 md:p-8 rounded-lg ${
          style === 'showa' ? 'bg-[#fff9f0] border-4 border-double border-[#8b4513]' :
          style === 'heisei' ? 'bg-gradient-to-r from-pink-50 to-orange-50 border-2 border-[#e63946] rounded-2xl' :
          'bg-gradient-to-br from-blue-50 to-indigo-50 border border-[#0066cc]/30 rounded-xl'
        }`}>
          <div className="text-center">
            <div className={`inline-block px-4 py-1 rounded-full text-sm mb-4 ${config.accent} ${config.headerText}`}>
              {data.personalMessage.occasion}
            </div>
            <h2 className={`text-2xl md:text-4xl font-bold mb-4 ${config.accentText}`}>
              {data.personalMessage.recipientName} 様へ
            </h2>
            <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-4">
              {data.personalMessage.message}
            </p>
            <p className="text-right text-sm opacity-70">
              {data.personalMessage.senderName} より
            </p>
          </div>
        </div>
      )}

      {/* ========== メインコンテンツ ========== */}
      <div className="newspaper-body">
        {/* トップ記事 */}
        <article className="main-article mb-8">
          <h2 className={`text-xl md:text-3xl font-black leading-tight mb-2 ${
            style === 'heisei' ? 'text-[#e63946]' : ''
          }`}>
            {data.mainArticle.headline}
          </h2>
          {data.mainArticle.subheadline && (
            <h3 className="text-base md:text-lg opacity-70 mb-4">
              {data.mainArticle.subheadline}
            </h3>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* メイン画像 */}
            <div className="md:col-span-2">
              <ImageBox
                src={images?.mainImage}
                alt="メイン記事画像"
                className={`aspect-[16/9] rounded-lg ${config.border} border`}
              />
            </div>
            {/* 記事本文プレビュー */}
            <div className={`p-4 rounded-lg ${style === 'showa' ? 'bg-[#f9f5ef]' : 'bg-gray-50'}`}>
              <p className="text-sm leading-relaxed line-clamp-[12]">
                {data.mainArticle.content}
              </p>
            </div>
          </div>
        </article>

        {/* サブ記事グリッド */}
        <div className="sub-articles grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {data.subArticles.slice(0, 3).map((article, index) => (
            <article
              key={index}
              className={`rounded-lg overflow-hidden ${config.border} border ${
                style === 'heisei' ? 'hover:shadow-lg transition-shadow' : ''
              }`}
            >
              {/* サブ画像 */}
              <ImageBox
                src={images?.subImages?.[index]}
                alt={`記事${index + 1}画像`}
                className="aspect-[4/3]"
              />
              <div className="p-3">
                <span className={`inline-block text-xs px-2 py-0.5 rounded mb-2 ${config.accent} ${config.headerText}`}>
                  {article.category === 'entertainment' && '芸能'}
                  {article.category === 'celebrity' && '芸能'}
                  {article.category === 'sports' && 'スポーツ'}
                  {article.category === 'culture' && 'エンタメ'}
                  {article.category === 'news' && '話題'}
                  {!['entertainment', 'celebrity', 'sports', 'culture', 'news'].includes(article.category) && '話題'}
                </span>
                <h4 className="font-bold text-sm mb-1 line-clamp-2">{article.headline}</h4>
                <p className="text-xs opacity-70 line-clamp-3">{article.content}</p>
              </div>
            </article>
          ))}
        </div>

        {/* コラム・豆知識セクション */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg ${
          style === 'showa' ? 'bg-[#f9f5ef]' :
          style === 'heisei' ? 'bg-gradient-to-r from-yellow-50 to-orange-50' :
          'bg-gray-50'
        }`}>
          {/* 社説/コラム */}
          <div>
            <h3 className={`font-bold mb-2 pb-1 border-b-2 ${config.border} ${config.accentText}`}>
              {style === 'showa' ? '【社説】' : style === 'heisei' ? '🗞️ コラム' : 'Column'}
              {data.editorial.headline}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-6">{data.editorial.content}</p>
          </div>

          {/* 豆知識 */}
          <div>
            <h3 className={`font-bold mb-2 pb-1 border-b-2 ${config.border} ${config.accentText}`}>
              {style === 'showa' ? '■' : style === 'heisei' ? '💡' : '▸'} {data.columnTitle}
            </h3>
            <p className="text-sm leading-relaxed">{data.columnContent}</p>
          </div>
        </div>

        {/* 広告欄 */}
        <div className={`advertisements grid grid-cols-3 gap-3 pt-4 border-t-2 ${config.border}`}>
          {(data.advertisements.length >= 3 ? data.advertisements.slice(0, 3) : [
            ...data.advertisements,
            ...Array(3 - data.advertisements.length).fill({ title: '広告募集中', content: 'お問い合わせはこちら', style: 'vintage' })
          ]).map((ad, index) => (
            <div
              key={index}
              className={`ad-box p-3 text-center rounded ${
                style === 'showa' ? 'border border-dashed border-[#8b4513]/50 bg-[#fff9f0]' :
                style === 'heisei' ? 'bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg' :
                'border border-gray-200 bg-gray-50 rounded-md'
              }`}
            >
              <div className="font-bold text-sm mb-1">{ad.title}</div>
              <div className="text-xs opacity-70">{ad.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ========== フッター ========== */}
      <footer className={`newspaper-footer mt-6 pt-4 border-t ${config.border} text-center`}>
        <p className="text-xs opacity-50">
          Generated by TimeTravel Press
          {isPreview && <span className="ml-2 text-orange-500">※ プレビュー</span>}
        </p>
      </footer>
    </div>
  );
}

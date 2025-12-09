'use client';

/**
 * NewspaperPreview Component - Premium Edition
 * 本格的な新聞レイアウト（全文表示対応）
 * - 昭和風: 伝統的な新聞、複数段組み、重厚
 * - 平成風: スポーツ新聞風、華やか、ダイナミック
 * - 令和風: モダン新聞、洗練されたミニマルデザイン
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
    bg: '#f4e8d3',
    paper: '#faf5eb',
    text: '#2c1810',
    accent: '#8b4513',
    headerBg: '#2c1810',
    headerText: '#f4e8d3',
    secondaryBg: '#f0e6d6',
    borderColor: '#2c1810',
    filter: 'sepia(15%) contrast(1.05)',
  },
  heisei: {
    name: '平成',
    bg: '#fff5f5',
    paper: '#ffffff',
    text: '#1a1a2e',
    accent: '#e63946',
    headerBg: 'linear-gradient(135deg, #e63946 0%, #f77f00 100%)',
    headerText: '#ffffff',
    secondaryBg: '#fff0f3',
    borderColor: '#e63946',
    filter: 'saturate(1.2)',
  },
  reiwa: {
    name: '令和',
    bg: '#f8fafc',
    paper: '#ffffff',
    text: '#0f172a',
    accent: '#3b82f6',
    headerBg: '#0f172a',
    headerText: '#f8fafc',
    secondaryBg: '#f1f5f9',
    borderColor: '#cbd5e1',
    filter: 'none',
  },
};

// 画像プレースホルダーコンポーネント
function ImagePlaceholder({
  src,
  alt,
  style: imgStyle,
  placeholderText = '画像はここに入ります',
  filter,
}: {
  src?: string;
  alt: string;
  style?: React.CSSProperties;
  placeholderText?: string;
  filter?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={{
          ...imgStyle,
          filter: filter || 'none',
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...imgStyle,
        background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '14px',
        fontWeight: '500',
        border: '2px dashed #9ca3af',
      }}
    >
      📷 {placeholderText}
    </div>
  );
}

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

  // 昭和スタイル（伝統的な新聞レイアウト）
  if (style === 'showa') {
    return (
      <div
        id="newspaper-preview"
        className="font-serif"
        style={{
          background: config.paper,
          color: config.text,
          minHeight: '900px',
          padding: '0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* ヘッダー */}
        <header
          style={{
            background: config.headerBg,
            color: config.headerText,
            padding: '16px 24px',
          }}
        >
          <div className="flex justify-between items-center text-xs opacity-80 mb-2">
            <span>{data.edition}</span>
            <span>{dateStr}</span>
            <span>天気: {data.weather}</span>
          </div>
          <h1
            className="text-center font-black"
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              letterSpacing: '0.3em',
              fontFamily: '"Noto Serif JP", serif',
            }}
          >
            {data.masthead}
          </h1>
        </header>

        {/* 個人メッセージ */}
        {data.personalMessage && (
          <div
            style={{
              margin: '16px',
              padding: '20px',
              background: '#fff9f0',
              border: `4px double ${config.accent}`,
            }}
          >
            <div className="text-center">
              <span
                style={{
                  display: 'inline-block',
                  background: config.accent,
                  color: config.headerText,
                  padding: '4px 16px',
                  fontSize: '12px',
                  marginBottom: '12px',
                }}
              >
                {data.personalMessage.occasion}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(20px, 4vw, 32px)',
                  color: config.accent,
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {data.personalMessage.recipientName} 様へ
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto 12px' }}>
                {data.personalMessage.message}
              </p>
              <p style={{ textAlign: 'right', fontSize: '12px', opacity: 0.7 }}>
                {data.personalMessage.senderName} より
              </p>
            </div>
          </div>
        )}

        {/* メインコンテンツエリア */}
        <div style={{ padding: '0 16px 16px' }}>
          {/* トップ記事 - 大見出し */}
          <div
            style={{
              borderBottom: `3px double ${config.borderColor}`,
              paddingBottom: '8px',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: '900',
                lineHeight: '1.2',
                margin: '0',
              }}
            >
              {data.mainArticle.headline}
            </h2>
            {data.mainArticle.subheadline && (
              <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
                {data.mainArticle.subheadline}
              </p>
            )}
          </div>

          {/* メイン画像（横幅いっぱい） */}
          <div
            style={{
              marginBottom: '16px',
              border: `1px solid ${config.borderColor}`,
              padding: '4px',
            }}
          >
            <ImagePlaceholder
              src={images?.mainImage}
              alt="メイン記事"
              filter={config.filter}
              style={{
                width: '100%',
                aspectRatio: '16/9',
                objectFit: 'cover',
              }}
            />
            <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '4px', opacity: 0.7 }}>
              ▲ {data.mainArticle.headline}
            </p>
          </div>

          {/* メイン記事本文（3段組み） */}
          <div
            style={{
              columnCount: 3,
              columnGap: '16px',
              columnRule: `1px solid ${config.borderColor}`,
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                lineHeight: '2',
                textAlign: 'justify',
                textIndent: '1em',
              }}
            >
              {data.mainArticle.content}
            </p>
          </div>

          {/* サブ記事グリッド（3段） */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              borderTop: `2px solid ${config.borderColor}`,
              paddingTop: '16px',
              marginBottom: '16px',
            }}
          >
            {data.subArticles.slice(0, 3).map((article, index) => (
              <div
                key={index}
                style={{
                  borderLeft: index > 0 ? `1px solid ${config.borderColor}` : 'none',
                  paddingLeft: index > 0 ? '12px' : '0',
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {index === 0 ? '■' : index === 1 ? '◆' : '●'} {article.headline}
                </h3>
                <ImagePlaceholder
                  src={images?.subImages?.[index]}
                  alt={`サブ記事${index + 1}`}
                  filter={config.filter}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    marginBottom: '8px',
                  }}
                />
                <p style={{ fontSize: '11px', lineHeight: '1.9', textAlign: 'justify' }}>
                  {article.content}
                </p>
              </div>
            ))}
          </div>

          {/* 下段 - 社説 + コラム + 広告 */}
          <div
            style={{
              marginTop: '16px',
              borderTop: `2px solid ${config.borderColor}`,
              paddingTop: '12px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '12px',
            }}
          >
            {/* 社説 */}
            <div style={{ background: config.secondaryBg, padding: '12px' }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderBottom: `2px solid ${config.accent}`,
                  paddingBottom: '4px',
                  marginBottom: '8px',
                }}
              >
                【社説】{data.editorial.headline}
              </h3>
              <p style={{ fontSize: '11px', lineHeight: '1.9', textAlign: 'justify' }}>
                {data.editorial.content}
              </p>
            </div>

            {/* コラム */}
            <div style={{ borderLeft: `1px solid ${config.borderColor}`, paddingLeft: '12px' }}>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: config.accent,
                }}
              >
                ■ {data.columnTitle}
              </h3>
              <p style={{ fontSize: '10px', lineHeight: '1.8' }}>
                {data.columnContent}
              </p>
            </div>

            {/* 広告 */}
            <div>
              {data.advertisements.slice(0, 2).map((ad, i) => (
                <div
                  key={i}
                  style={{
                    border: `1px dashed ${config.borderColor}`,
                    padding: '8px',
                    textAlign: 'center',
                    marginBottom: '8px',
                    background: '#fff9f0',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{ad.title}</div>
                  <div style={{ fontSize: '9px', opacity: 0.7 }}>{ad.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer
          style={{
            borderTop: `1px solid ${config.borderColor}`,
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '10px',
            opacity: 0.5,
          }}
        >
          Generated by TimeTravel Press
          {isPreview && <span style={{ color: '#f97316', marginLeft: '8px' }}>※ プレビュー</span>}
        </footer>
      </div>
    );
  }

  // 平成スタイル（スポーツ新聞/タブロイド風）
  if (style === 'heisei') {
    return (
      <div
        id="newspaper-preview"
        className="font-sans"
        style={{
          background: config.paper,
          color: config.text,
          minHeight: '900px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* ヘッダー - グラデーション */}
        <header
          style={{
            background: config.headerBg,
            color: config.headerText,
            padding: '12px 20px',
          }}
        >
          <div className="flex justify-between items-center text-xs opacity-90 mb-1">
            <span className="font-bold">{data.edition}</span>
            <span>{dateStr}</span>
            <span>{data.weather}</span>
          </div>
          <h1
            className="text-center font-black"
            style={{
              fontSize: 'clamp(32px, 6vw, 56px)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '0.1em',
            }}
          >
            {data.masthead}
          </h1>
          <p className="text-center text-sm opacity-80">〜 あの日の思い出をお届け 〜</p>
        </header>

        {/* 個人メッセージ - ポップなスタイル */}
        {data.personalMessage && (
          <div
            style={{
              margin: '16px',
              padding: '20px',
              background: 'linear-gradient(135deg, #fff0f3 0%, #fff5e6 100%)',
              borderRadius: '16px',
              border: `3px solid ${config.accent}`,
            }}
          >
            <div className="text-center">
              <span
                style={{
                  display: 'inline-block',
                  background: config.accent,
                  color: 'white',
                  padding: '6px 20px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                🎉 {data.personalMessage.occasion}
              </span>
              <h2
                style={{
                  fontSize: 'clamp(24px, 5vw, 40px)',
                  color: config.accent,
                  fontWeight: '900',
                  marginBottom: '12px',
                }}
              >
                {data.personalMessage.recipientName} 様へ
              </h2>
              <p style={{ fontSize: '15px', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto 12px' }}>
                {data.personalMessage.message}
              </p>
              <p style={{ fontSize: '13px', color: config.accent, fontWeight: 'bold' }}>
                💝 {data.personalMessage.senderName} より
              </p>
            </div>
          </div>
        )}

        {/* メインコンテンツ */}
        <div style={{ padding: '0 16px 16px' }}>
          {/* トップ記事 - 大きく派手に */}
          <div style={{ marginBottom: '16px' }}>
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 44px)',
                fontWeight: '900',
                color: config.accent,
                lineHeight: '1.15',
                marginBottom: '8px',
                textShadow: '1px 1px 0 #000',
                WebkitTextStroke: '0.5px #000',
              }}
            >
              {data.mainArticle.headline}
            </h2>
            {data.mainArticle.subheadline && (
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: '#ffeb3b',
                  display: 'inline-block',
                  padding: '4px 12px',
                  marginBottom: '12px',
                }}
              >
                {data.mainArticle.subheadline}
              </p>
            )}

            {/* メイン画像 - フル幅 */}
            <div
              style={{
                position: 'relative',
                marginBottom: '12px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <ImagePlaceholder
                src={images?.mainImage}
                alt="メイン記事"
                filter={config.filter}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                }}
              />
              {images?.mainImage && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    color: 'white',
                    padding: '20px 16px 12px',
                    fontSize: '12px',
                  }}
                >
                  📸 {data.mainArticle.headline}
                </div>
              )}
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.9', textIndent: '1em' }}>
              {data.mainArticle.content}
            </p>
          </div>

          {/* サブ記事 - カード形式 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {data.subArticles.slice(0, 3).map((article, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
              >
                <ImagePlaceholder
                  src={images?.subImages?.[index]}
                  alt={`サブ記事${index + 1}`}
                  filter={config.filter}
                  style={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      background: config.accent,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginBottom: '6px',
                    }}
                  >
                    {article.category === 'entertainment' && '🎬 芸能'}
                    {article.category === 'celebrity' && '⭐ 芸能'}
                    {article.category === 'sports' && '⚽ スポーツ'}
                    {article.category === 'culture' && '🎭 エンタメ'}
                    {article.category === 'economy' && '💰 経済'}
                    {article.category === 'society' && '📰 社会'}
                    {article.category === 'news' && '📰 話題'}
                    {!['entertainment', 'celebrity', 'sports', 'culture', 'economy', 'society', 'news'].includes(article.category) && '📰 話題'}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.3' }}>
                    {article.headline}
                  </h4>
                  <p style={{ fontSize: '11px', opacity: 0.7, lineHeight: '1.6' }}>
                    {article.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 下段 - コラム + 広告 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            {/* 社説/コラム */}
            <div
              style={{
                background: 'linear-gradient(135deg, #fff5e6 0%, #fff0f3 100%)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: config.accent,
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🗞️ {data.editorial.headline}
              </h3>
              <p style={{ fontSize: '12px', lineHeight: '1.9' }}>{data.editorial.content}</p>

              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ddd' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                  💡 {data.columnTitle}
                </h4>
                <p style={{ fontSize: '11px', lineHeight: '1.7', opacity: 0.8 }}>
                  {data.columnContent}
                </p>
              </div>
            </div>

            {/* 広告 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.advertisements.slice(0, 3).map((ad, i) => (
                <div
                  key={i}
                  style={{
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>{ad.title}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{ad.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer
          style={{
            background: config.secondaryBg,
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '11px',
            opacity: 0.6,
          }}
        >
          Generated by TimeTravel Press ✨
          {isPreview && <span style={{ color: '#f97316', marginLeft: '8px' }}>※ プレビュー</span>}
        </footer>
      </div>
    );
  }

  // 令和スタイル（モダンミニマル）
  return (
    <div
      id="newspaper-preview"
      className="font-sans"
      style={{
        background: config.paper,
        color: config.text,
        minHeight: '900px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* ヘッダー - ミニマル */}
      <header
        style={{
          background: config.headerBg,
          color: config.headerText,
          padding: '20px 24px',
        }}
      >
        <div className="flex justify-between items-center text-xs opacity-70 mb-3">
          <span>{data.edition}</span>
          <span style={{ fontWeight: '500' }}>{dateStr}</span>
          <span>{data.weather}</span>
        </div>
        <h1
          className="text-center"
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: '200',
            letterSpacing: '0.4em',
          }}
        >
          {data.masthead}
        </h1>
      </header>

      {/* 個人メッセージ - クリーン */}
      {data.personalMessage && (
        <div
          style={{
            margin: '24px',
            padding: '32px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
            borderRadius: '16px',
            borderLeft: `4px solid ${config.accent}`,
          }}
        >
          <div className="text-center">
            <span
              style={{
                display: 'inline-block',
                background: config.accent,
                color: 'white',
                padding: '6px 20px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              {data.personalMessage.occasion}
            </span>
            <h2
              style={{
                fontSize: 'clamp(22px, 4vw, 36px)',
                fontWeight: '300',
                color: config.text,
                marginBottom: '16px',
              }}
            >
              {data.personalMessage.recipientName}
              <span style={{ fontSize: '0.6em', fontWeight: '400', marginLeft: '8px' }}>様へ</span>
            </h2>
            <p
              style={{
                fontSize: '15px',
                lineHeight: '2',
                maxWidth: '500px',
                margin: '0 auto 16px',
                opacity: 0.8,
              }}
            >
              {data.personalMessage.message}
            </p>
            <p style={{ fontSize: '13px', opacity: 0.6 }}>— {data.personalMessage.senderName}</p>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <div style={{ padding: '0 24px 24px' }}>
        {/* トップ記事 */}
        <article style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 4vw, 40px)',
                fontWeight: '700',
                lineHeight: '1.25',
                marginBottom: '8px',
              }}
            >
              {data.mainArticle.headline}
            </h2>
            {data.mainArticle.subheadline && (
              <p style={{ fontSize: '14px', opacity: 0.6, fontWeight: '500' }}>
                {data.mainArticle.subheadline}
              </p>
            )}
          </div>

          {/* メイン画像 */}
          <div style={{ marginBottom: '20px' }}>
            <ImagePlaceholder
              src={images?.mainImage}
              alt="メイン記事"
              style={{
                width: '100%',
                aspectRatio: '21/9',
                objectFit: 'cover',
                borderRadius: '8px',
              }}
            />
          </div>

          {/* 2段組み本文 */}
          <div
            style={{
              columnCount: 2,
              columnGap: '32px',
              columnRule: `1px solid ${config.borderColor}`,
            }}
          >
            <p style={{ fontSize: '14px', lineHeight: '2', opacity: 0.85, textIndent: '1em' }}>
              {data.mainArticle.content}
            </p>
          </div>
        </article>

        {/* サブ記事 - クリーンなカード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {data.subArticles.slice(0, 3).map((article, index) => (
            <article
              key={index}
              style={{
                background: config.secondaryBg,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <ImagePlaceholder
                src={images?.subImages?.[index]}
                alt={`サブ記事${index + 1}`}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    color: config.accent,
                    fontSize: '10px',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                  }}
                >
                  {article.category === 'entertainment' && 'ENTERTAINMENT'}
                  {article.category === 'celebrity' && 'CELEBRITY'}
                  {article.category === 'sports' && 'SPORTS'}
                  {article.category === 'culture' && 'CULTURE'}
                  {article.category === 'economy' && 'ECONOMY'}
                  {article.category === 'society' && 'SOCIETY'}
                  {article.category === 'news' && 'NEWS'}
                  {!['entertainment', 'celebrity', 'sports', 'culture', 'economy', 'society', 'news'].includes(article.category) && 'NEWS'}
                </span>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                  }}
                >
                  {article.headline}
                </h4>
                <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.7' }}>
                  {article.content}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* 下段 - 社説 + コラム */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '3fr 2fr',
            gap: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${config.borderColor}`,
          }}
        >
          {/* 社説 */}
          <div>
            <h3
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: config.accent,
                letterSpacing: '0.1em',
                marginBottom: '12px',
              }}
            >
              EDITORIAL
            </h3>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              {data.editorial.headline}
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '2', opacity: 0.8 }}>
              {data.editorial.content}
            </p>
          </div>

          {/* コラム + 広告 */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: config.accent,
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                COLUMN
              </h3>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                {data.columnTitle}
              </h4>
              <p style={{ fontSize: '12px', lineHeight: '1.8', opacity: 0.7 }}>
                {data.columnContent}
              </p>
            </div>

            {/* 広告 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              {data.advertisements.slice(0, 2).map((ad, i) => (
                <div
                  key={i}
                  style={{
                    background: config.secondaryBg,
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '11px', marginBottom: '2px' }}>{ad.title}</div>
                  <div style={{ fontSize: '9px', opacity: 0.6 }}>{ad.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer
        style={{
          borderTop: `1px solid ${config.borderColor}`,
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '10px',
          opacity: 0.4,
          letterSpacing: '0.1em',
        }}
      >
        GENERATED BY TIMETRAVEL PRESS
        {isPreview && <span style={{ color: '#f97316', marginLeft: '12px' }}>PREVIEW</span>}
      </footer>
    </div>
  );
}

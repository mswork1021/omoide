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
              <h3
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: config.accent,
                  borderBottom: `1px solid ${config.borderColor}`,
                  paddingBottom: '2px',
                }}
              >
                ◆ 当時流行していたもの
              </h3>
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

  // 平成スタイル（90年代スポーツ新聞風）
  if (style === 'heisei') {
    // カテゴリに応じた色を取得
    const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
        sports: '#ff6b00',
        entertainment: '#e91e63',
        celebrity: '#e91e63',
        culture: '#9c27b0',
        economy: '#2196f3',
        society: '#4caf50',
        news: '#ff9800',
      };
      return colors[category] || '#e63946';
    };

    return (
      <div
        id="newspaper-preview"
        className="font-sans"
        style={{
          background: '#fff8dc',  // クリーム色の紙
          color: '#1a1a1a',
          minHeight: '900px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* ヘッダー - スポーツ新聞風 */}
        <header
          style={{
            background: 'linear-gradient(180deg, #ff1744 0%, #d50000 100%)',
            color: 'white',
            padding: '8px 16px',
            borderBottom: '4px solid #ffeb3b',
          }}
        >
          <div className="flex justify-between items-center text-xs mb-1">
            <span style={{ background: '#ffeb3b', color: '#000', padding: '2px 8px', fontWeight: 'bold' }}>
              {data.edition}
            </span>
            <span style={{ fontWeight: 'bold' }}>{dateStr}</span>
            <span>{data.weather}</span>
          </div>
          <h1
            className="text-center font-black"
            style={{
              fontSize: 'clamp(36px, 7vw, 64px)',
              textShadow: '3px 3px 0 #000, -1px -1px 0 #000',
              letterSpacing: '0.05em',
              WebkitTextStroke: '1px #000',
            }}
          >
            {data.masthead}
          </h1>
        </header>

        {/* 個人メッセージ - 派手なバナー */}
        {data.personalMessage && (
          <div
            style={{
              margin: '8px',
              padding: '16px',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #ffa726 100%)',
              border: '4px solid #1a1a1a',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                background: '#ffeb3b',
                color: '#1a1a1a',
                padding: '4px 16px',
                fontWeight: '900',
                fontSize: '14px',
                border: '2px solid #1a1a1a',
              }}
            >
              ★ {data.personalMessage.occasion} ★
            </div>
            <div className="text-center" style={{ color: 'white', paddingTop: '8px' }}>
              <h2
                style={{
                  fontSize: 'clamp(28px, 6vw, 48px)',
                  fontWeight: '900',
                  textShadow: '2px 2px 0 #000',
                  marginBottom: '8px',
                }}
              >
                {data.personalMessage.recipientName} 様
              </h2>
              <p style={{ fontSize: '16px', textShadow: '1px 1px 0 #000' }}>
                {data.personalMessage.message}
              </p>
              <p style={{ fontSize: '14px', marginTop: '8px', fontWeight: 'bold' }}>
                ― {data.personalMessage.senderName} より ―
              </p>
            </div>
          </div>
        )}

        {/* メイン見出し - ドカン！と大きく */}
        <div style={{ padding: '8px 12px 0' }}>
          <div
            style={{
              background: '#ffeb3b',
              border: '4px solid #1a1a1a',
              padding: '8px 16px',
              marginBottom: '8px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(32px, 6vw, 52px)',
                fontWeight: '900',
                lineHeight: '1.1',
                color: '#d50000',
                textShadow: '2px 2px 0 #fff',
              }}
            >
              {data.mainArticle.headline}
            </h2>
            {data.mainArticle.subheadline && (
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginTop: '4px',
                }}
              >
                ▶ {data.mainArticle.subheadline}
              </p>
            )}
          </div>
        </div>

        {/* メインコンテンツ - 2カラム */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '8px',
            padding: '0 12px',
          }}
        >
          {/* 左カラム - メイン画像と本文 */}
          <div>
            <div
              style={{
                border: '3px solid #1a1a1a',
                marginBottom: '8px',
                position: 'relative',
              }}
            >
              <ImagePlaceholder
                src={images?.mainImage}
                alt="メイン記事"
                filter={config.filter}
                style={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.85)',
                  color: '#ffeb3b',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                ▲ {data.mainArticle.headline}
              </div>
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.8',
                textAlign: 'justify',
                background: 'white',
                padding: '12px',
                border: '1px solid #ddd',
              }}
            >
              {data.mainArticle.content}
            </p>
          </div>

          {/* 右カラム - サブ記事縦並び */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.subArticles.slice(0, 3).map((article, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: `3px solid ${getCategoryColor(article.category)}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: getCategoryColor(article.category),
                    color: 'white',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  ★ {article.category.toUpperCase()}
                </div>
                <ImagePlaceholder
                  src={images?.subImages?.[index]}
                  alt={`サブ記事${index + 1}`}
                  filter={config.filter}
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                  }}
                />
                <div style={{ padding: '8px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: '900',
                      lineHeight: '1.2',
                      marginBottom: '4px',
                      color: getCategoryColor(article.category),
                    }}
                  >
                    {article.headline}
                  </h4>
                  <p style={{ fontSize: '10px', lineHeight: '1.5', opacity: 0.8 }}>
                    {article.content.slice(0, 80)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 下段 - コラムと広告 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '8px 12px',
            marginTop: '8px',
          }}
        >
          {/* コラム */}
          <div
            style={{
              background: '#fff8e1',
              border: '2px solid #ff9800',
              padding: '12px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '900',
                color: '#ff6f00',
                marginBottom: '6px',
                borderBottom: '2px solid #ff9800',
                paddingBottom: '4px',
              }}
            >
              📰 {data.editorial.headline}
            </h3>
            <p style={{ fontSize: '11px', lineHeight: '1.7' }}>
              {data.editorial.content.slice(0, 200)}...
            </p>
          </div>

          {/* 豆知識 */}
          <div
            style={{
              background: '#e3f2fd',
              border: '2px solid #2196f3',
              padding: '12px',
            }}
          >
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '900',
                color: '#1565c0',
                marginBottom: '6px',
                borderBottom: '2px solid #2196f3',
                paddingBottom: '4px',
              }}
            >
              💡 {data.columnTitle}
            </h3>
            <p style={{ fontSize: '11px', lineHeight: '1.7' }}>{data.columnContent}</p>
          </div>
        </div>

        {/* 広告欄 */}
        <div
          style={{
            padding: '8px 12px',
            background: '#f5f5f5',
            borderTop: '2px solid #1a1a1a',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              fontWeight: '900',
              marginBottom: '8px',
              color: '#d50000',
              textAlign: 'center',
            }}
          >
            ★ 当時流行していたもの ★
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {data.advertisements.slice(0, 3).map((ad, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: 'white',
                  border: '1px dashed #999',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: '900', fontSize: '12px', color: '#d50000' }}>{ad.title}</div>
                <div style={{ fontSize: '9px', marginTop: '2px' }}>{ad.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* フッター */}
        <footer
          style={{
            background: '#1a1a1a',
            color: '#ffeb3b',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          ★ TimeTravel Press - あの日の思い出をお届け ★
          {isPreview && <span style={{ color: '#ff9800', marginLeft: '8px' }}>※ プレビュー</span>}
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
            <div>
              <h3
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: config.accent,
                  letterSpacing: '0.1em',
                  marginBottom: '8px',
                }}
              >
                TRENDING ITEMS
              </h3>
              <p style={{ fontSize: '9px', opacity: 0.5, marginBottom: '8px' }}>当時流行していたもの</p>
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

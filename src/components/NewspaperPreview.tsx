'use client';

/**
 * NewspaperPreview Component - Premium Edition
 * 本格的な新聞レイアウト（全文表示対応）
 * - 昭和風: 伝統的な新聞、複数段組み、重厚
 * - 平成風: スポーツ新聞風、華やか、ダイナミック
 * - 令和風: モダン新聞、洗練されたミニマルデザイン
 */

import React, { useRef, useState, useEffect } from 'react';
import type { NewspaperData } from '@/types';

interface NewspaperPreviewProps {
  data: NewspaperData;
  style?: 'showa' | 'heisei' | 'reiwa';
  isPreview?: boolean;
  forPDF?: boolean; // PDF生成時はスケーリング無効
  images?: {
    mainImage?: string;
    subImages?: (string | undefined)[];
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
    accent: '#e91e63',
    headerBg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
    headerText: '#ffffff',
    secondaryBg: '#fff0f5',
    borderColor: '#ffb6c1',
    filter: 'saturate(1.2) brightness(1.02)',
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

// 新聞の固定幅（A4横に近い比率）
const NEWSPAPER_WIDTH = 800;

export function NewspaperPreview({
  data,
  style = 'showa',
  isPreview = true,
  forPDF = false,
  images,
}: NewspaperPreviewProps) {
  const config = styleConfig[style];
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>();

  // 画面幅に合わせてスケールを計算（PDF生成時は無効）
  useEffect(() => {
    if (forPDF) {
      setScale(1);
      setScaledHeight(undefined);
      return;
    }

    const calculateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(1, containerWidth / NEWSPAPER_WIDTH);
        setScale(newScale);
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [forPDF]);

  // スケール後の高さを計算
  useEffect(() => {
    if (forPDF) return;
    if (contentRef.current) {
      const originalHeight = contentRef.current.offsetHeight;
      setScaledHeight(originalHeight * scale);
    }
  }, [scale, forPDF]);

  const dateStr = new Date(data.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // スケーリングラッパー（PDF生成時はスケーリング無効）
  const ScalingWrapper = ({ children }: { children: React.ReactNode }) => {
    if (forPDF) {
      // PDF用: スケーリングなし
      return <div style={{ width: `${NEWSPAPER_WIDTH}px` }}>{children}</div>;
    }

    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          overflow: 'hidden',
          height: scaledHeight ? `${scaledHeight}px` : 'auto',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${NEWSPAPER_WIDTH}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  // 昭和スタイル（伝統的な新聞レイアウト）
  if (style === 'showa') {
    return (
      <ScalingWrapper>
        <div
          id="newspaper-preview"
          className="font-serif"
          style={{
            background: config.paper,
            color: config.text,
            minHeight: '900px',
            padding: '0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
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
                objectFit: 'contain',
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
                    objectFit: 'contain',
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
            opacity: 0.6,
          }}
        >
          {data.personalMessage && (
            <>
              <div style={{ marginBottom: '2px', opacity: 0.9 }}>
                📝 本紙は {data.personalMessage.recipientName}様 へ {data.personalMessage.senderName} より贈られました
              </div>
              {data.personalMessage.message && (
                <div style={{ marginBottom: '4px', opacity: 0.85, fontStyle: 'italic' }}>
                  「{data.personalMessage.message.slice(0, 50)}」
                </div>
              )}
            </>
          )}
          <div>Generated by TimeTravel Press</div>
          <div style={{ fontSize: '8px', marginTop: '4px' }}>
            ※本紙はAI生成によるフィクションです。内容の正確性は保証しておりません
          </div>
          {isPreview && <span style={{ color: '#f97316', marginTop: '4px', display: 'block' }}>※ プレビュー</span>}
        </footer>
        </div>
      </ScalingWrapper>
    );
  }

  // 平成スタイル（90年代ポップ・スポーツ新聞風）
  if (style === 'heisei') {
    return (
      <ScalingWrapper>
        <div
          id="newspaper-preview"
        className="font-sans"
        style={{
          background: config.bg,
          color: config.text,
          minHeight: '900px',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
          filter: config.filter,
          position: 'relative',
        }}
      >
        {/* ヘッダー - カラフルグラデーション */}
        <header
          style={{
            background: config.headerBg,
            color: config.headerText,
            padding: '12px 20px 16px',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #ff0080)',
            }}
          />
          <div className="flex justify-between items-center text-xs mb-2" style={{ opacity: 0.9 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '2px' }}>{data.edition}</span>
            <span style={{ fontWeight: '600' }}>{dateStr}</span>
            <span>☀ {data.weather}</span>
          </div>
          <h1
            className="text-center"
            style={{
              fontSize: 'clamp(36px, 7vw, 64px)',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
            }}
          >
            {data.masthead}
          </h1>
        </header>

        {/* メインコンテンツ */}
        <div style={{ padding: '0 16px 16px' }}>
          {/* メイン見出し - スポーツ新聞風 */}
          <div
            style={{
              background: `linear-gradient(135deg, ${config.accent} 0%, #ff6b6b 100%)`,
              color: 'white',
              padding: '12px 16px',
              marginBottom: '12px',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                fontWeight: '900',
                lineHeight: '1.15',
                textShadow: '1px 1px 0 rgba(0,0,0,0.2)',
              }}
            >
              {data.mainArticle.headline}
            </h2>
            {data.mainArticle.subheadline && (
              <p style={{ fontSize: '14px', marginTop: '6px', opacity: 0.9 }}>
                ▶ {data.mainArticle.subheadline}
              </p>
            )}
          </div>

          {/* メイン画像 */}
          <div
            style={{
              marginBottom: '12px',
              border: `3px solid ${config.accent}`,
              padding: '3px',
              background: 'white',
            }}
          >
            <ImagePlaceholder
              src={images?.mainImage}
              alt="メイン記事"
              style={{
                width: '100%',
                aspectRatio: '16/9',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* メイン記事本文 */}
          <div
            style={{
              background: 'white',
              padding: '16px',
              marginBottom: '16px',
              borderLeft: `4px solid ${config.accent}`,
            }}
          >
            <p
              style={{
                fontSize: '14px',
                lineHeight: '2',
                columnCount: 2,
                columnGap: '20px',
              }}
            >
              {data.mainArticle.content}
            </p>
          </div>

          {/* サブ記事グリッド - カラフルカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {data.subArticles.slice(0, 3).map((article, index) => {
              const cardColors = ['#ff6b6b', '#feca57', '#48dbfb'];
              return (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    border: `2px solid ${cardColors[index]}`,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: cardColors[index],
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: '600',
                    }}
                  >
                    {article.category.toUpperCase()}
                  </div>
                  <ImagePlaceholder
                    src={images?.subImages?.[index]}
                    alt={`サブ記事${index + 1}`}
                    style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      objectFit: 'contain',
                    }}
                  />
                  <div style={{ padding: '10px' }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        marginBottom: '6px',
                        lineHeight: '1.3',
                        color: config.text,
                      }}
                    >
                      {article.headline}
                    </h4>
                    <p style={{ fontSize: '11px', opacity: 0.7, lineHeight: '1.6' }}>
                      {article.content.slice(0, 80)}...
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 下段 - 社説とコラム */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {/* 社説 */}
            <div
              style={{
                background: 'white',
                border: `2px solid ${config.borderColor}`,
                padding: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  color: 'white',
                  background: config.accent,
                  padding: '4px 8px',
                  marginBottom: '10px',
                  display: 'inline-block',
                }}
              >
                ★ 社説
              </h3>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                {data.editorial.headline}
              </h4>
              <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
                {data.editorial.content.slice(0, 180)}...
              </p>
            </div>

            {/* コラム */}
            <div
              style={{
                background: 'white',
                border: `2px solid ${config.borderColor}`,
                padding: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  color: 'white',
                  background: '#feca57',
                  padding: '4px 8px',
                  marginBottom: '10px',
                  display: 'inline-block',
                }}
              >
                ♪ コラム
              </h3>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
                {data.columnTitle}
              </h4>
              <p style={{ fontSize: '11px', lineHeight: '1.8' }}>
                {data.columnContent}
              </p>
            </div>
          </div>

          {/* 広告 - レトロ風 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff0f5 0%, #fffaf0 100%)',
              padding: '12px',
              border: `2px dashed ${config.accent}`,
            }}
          >
            <p
              style={{
                fontSize: '11px',
                color: config.accent,
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              ★★★ 当時流行していたもの ★★★
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {data.advertisements.slice(0, 3).map((ad, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    background: 'white',
                    border: `1px solid ${config.borderColor}`,
                    textAlign: 'center',
                    flex: 1,
                    maxWidth: '150px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: config.accent }}>{ad.title}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>{ad.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer
          style={{
            background: config.headerBg,
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '11px',
            color: 'white',
          }}
        >
          {data.personalMessage && (
            <>
              <div style={{ marginBottom: '2px' }}>
                ♪ 本紙は {data.personalMessage.recipientName}様 へ {data.personalMessage.senderName} より贈られました ♪
              </div>
              {data.personalMessage.message && (
                <div style={{ marginBottom: '4px', opacity: 0.9, fontStyle: 'italic' }}>
                  「{data.personalMessage.message.slice(0, 50)}」
                </div>
              )}
            </>
          )}
          <div>★ TimeTravel Press ★</div>
          <div style={{ fontSize: '8px', marginTop: '4px', opacity: 0.7 }}>
            ※本紙はAI生成によるフィクションです。内容の正確性は保証しておりません
          </div>
          {isPreview && <span style={{ marginTop: '4px', opacity: 0.8, display: 'block' }}>[ Preview ]</span>}
        </footer>
        </div>
      </ScalingWrapper>
    );
  }

  // 令和スタイル（モダンミニマル）
  return (
    <ScalingWrapper>
      <div
        id="newspaper-preview"
        className="font-sans"
      style={{
        background: config.paper,
        color: config.text,
        minHeight: '900px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
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
                aspectRatio: '16/9',
                objectFit: 'contain',
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
                  aspectRatio: '4/3',
                  objectFit: 'contain',
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
        {data.personalMessage && (
          <>
            <div style={{ marginBottom: '2px', opacity: 0.7 }}>
              本紙は {data.personalMessage.recipientName}様 へ {data.personalMessage.senderName} より贈られました
            </div>
            {data.personalMessage.message && (
              <div style={{ marginBottom: '4px', opacity: 0.6, fontStyle: 'italic', letterSpacing: '0' }}>
                「{data.personalMessage.message.slice(0, 50)}」
              </div>
            )}
          </>
        )}
        <div>GENERATED BY TIMETRAVEL PRESS</div>
        <div style={{ fontSize: '8px', marginTop: '4px', letterSpacing: '0' }}>
          ※本紙はAI生成によるフィクションです。内容の正確性は保証しておりません
        </div>
        {isPreview && <span style={{ color: '#f97316', marginTop: '4px', display: 'block' }}>PREVIEW</span>}
      </footer>
      </div>
    </ScalingWrapper>
  );
}

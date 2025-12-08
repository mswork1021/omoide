/**
 * PDF Generation Service
 * 新聞レイアウトのPDF出力
 */

import jsPDF from 'jspdf';
import type { NewspaperData } from '@/types';

// PDF設定
const PDF_CONFIG = {
  standard: {
    width: 297, // A3
    height: 420,
    dpi: 150,
    quality: 0.8,
  },
  premium: {
    width: 297,
    height: 420,
    dpi: 300,
    quality: 0.95,
  },
  deluxe: {
    width: 420, // A2
    height: 594,
    dpi: 300,
    quality: 1.0,
  },
} as const;

type PDFQuality = keyof typeof PDF_CONFIG;

/**
 * 新聞データからPDFを生成
 * サーバーサイドでの生成を想定
 */
export async function generateNewspaperPDF(
  newspaperData: NewspaperData,
  images: {
    mainImage?: string;
    subImages?: string[];
  },
  quality: PDFQuality = 'standard'
): Promise<Uint8Array> {
  const config = PDF_CONFIG[quality];

  // jsPDFインスタンス作成（mm単位）
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [config.width, config.height],
  });

  // フォント設定（日本語対応は実際の実装で追加）
  // pdf.addFont(...) でカスタムフォントを追加

  const margin = 15;
  const contentWidth = config.width - margin * 2;
  let currentY = margin;

  // ヘッダー（題字・日付）
  currentY = drawMasthead(pdf, newspaperData, margin, currentY, contentWidth);

  // メイン記事
  currentY = await drawMainArticle(
    pdf,
    newspaperData.mainArticle,
    images.mainImage,
    margin,
    currentY,
    contentWidth
  );

  // サブ記事（2カラムレイアウト）
  currentY = drawSubArticles(
    pdf,
    newspaperData.subArticles,
    margin,
    currentY,
    contentWidth
  );

  // 社説
  currentY = drawEditorial(
    pdf,
    newspaperData.editorial,
    margin,
    currentY,
    contentWidth
  );

  // コラム欄
  currentY = drawColumn(
    pdf,
    newspaperData.columnTitle,
    newspaperData.columnContent,
    margin,
    currentY,
    contentWidth
  );

  // 個人メッセージ（存在する場合）
  if (newspaperData.personalMessage) {
    drawPersonalMessage(
      pdf,
      newspaperData.personalMessage,
      margin,
      currentY,
      contentWidth
    );
  }

  // 広告欄
  drawAdvertisements(
    pdf,
    newspaperData.advertisements,
    margin,
    config.height - 60,
    contentWidth
  );

  // フッター
  drawFooter(pdf, config.width, config.height, margin);

  return pdf.output('arraybuffer') as unknown as Uint8Array;
}

function drawMasthead(
  pdf: jsPDF,
  data: NewspaperData,
  x: number,
  y: number,
  width: number
): number {
  const dateStr = data.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 題字
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.masthead, x + width / 2, y + 10, { align: 'center' });

  // 日付・版数
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(dateStr, x, y + 20);
  pdf.text(data.edition, x + width - 40, y + 20);

  // 天気
  pdf.text(`天気: ${data.weather}`, x + width / 2 - 20, y + 20);

  // 横罫線
  pdf.setLineWidth(0.5);
  pdf.line(x, y + 25, x + width, y + 25);
  pdf.setLineWidth(1);
  pdf.line(x, y + 26, x + width, y + 26);

  return y + 35;
}

async function drawMainArticle(
  pdf: jsPDF,
  article: NewspaperData['mainArticle'],
  imageUrl: string | undefined,
  x: number,
  y: number,
  width: number
): Promise<number> {
  // 見出し
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const headlineLines = pdf.splitTextToSize(article.headline, width);
  pdf.text(headlineLines, x, y + 8);
  y += headlineLines.length * 10 + 5;

  // 副見出し
  if (article.subheadline) {
    pdf.setFontSize(14);
    pdf.text(article.subheadline, x, y + 5);
    y += 10;
  }

  // 画像プレースホルダー（実際の画像埋め込みは別途実装）
  const imageHeight = 60;
  if (imageUrl) {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(x, y, width * 0.6, imageHeight, 'F');
    pdf.setFontSize(8);
    pdf.text('[Image]', x + width * 0.3, y + imageHeight / 2, { align: 'center' });
  }

  // 本文（画像横に配置）
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const textX = imageUrl ? x + width * 0.65 : x;
  const textWidth = imageUrl ? width * 0.35 : width;
  const contentLines = pdf.splitTextToSize(article.content, textWidth);

  let textY = y + 5;
  for (const line of contentLines) {
    if (textY > y + imageHeight && imageUrl) {
      // 画像より下に来たら全幅で
      break;
    }
    pdf.text(line, textX, textY);
    textY += 4;
  }

  // 残りの本文
  const remainingContent = contentLines.slice(
    Math.floor((imageHeight - 5) / 4)
  );
  if (remainingContent.length > 0 && imageUrl) {
    const fullWidthLines = pdf.splitTextToSize(
      remainingContent.join(' '),
      width
    );
    textY = y + imageHeight + 5;
    for (const line of fullWidthLines) {
      pdf.text(line, x, textY);
      textY += 4;
    }
    return textY + 10;
  }

  return Math.max(y + imageHeight + 10, textY + 10);
}

function drawSubArticles(
  pdf: jsPDF,
  articles: NewspaperData['subArticles'],
  x: number,
  y: number,
  width: number
): number {
  if (!articles || articles.length === 0) return y;

  const columnWidth = (width - 10) / 2;
  let leftY = y;
  let rightY = y;

  articles.forEach((article, index) => {
    const isLeft = index % 2 === 0;
    const colX = isLeft ? x : x + columnWidth + 10;
    const currentY = isLeft ? leftY : rightY;

    // カテゴリ
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`【${article.category}】`, colX, currentY);

    // 見出し
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const headlineLines = pdf.splitTextToSize(article.headline, columnWidth);
    pdf.text(headlineLines, colX, currentY + 6);

    // 本文
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const contentLines = pdf.splitTextToSize(article.content, columnWidth);
    let textY = currentY + 6 + headlineLines.length * 5;
    for (const line of contentLines.slice(0, 10)) {
      pdf.text(line, colX, textY);
      textY += 3.5;
    }

    if (isLeft) {
      leftY = textY + 8;
    } else {
      rightY = textY + 8;
    }
  });

  return Math.max(leftY, rightY);
}

function drawEditorial(
  pdf: jsPDF,
  editorial: NewspaperData['editorial'],
  x: number,
  y: number,
  width: number
): number {
  if (!editorial) return y;

  // 罫線
  pdf.setLineWidth(0.3);
  pdf.line(x, y, x + width, y);

  y += 5;

  // 見出し
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`【社説】 ${editorial.headline}`, x, y + 5);
  y += 12;

  // 本文
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const lines = pdf.splitTextToSize(editorial.content, width);
  for (const line of lines) {
    pdf.text(line, x, y);
    y += 3.5;
  }

  return y + 10;
}

function drawColumn(
  pdf: jsPDF,
  title: string,
  content: string,
  x: number,
  y: number,
  width: number
): number {
  const columnWidth = width * 0.4;

  // 枠線
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, columnWidth, 40);

  // タイトル
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, x + 3, y + 6);

  // 本文
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  const lines = pdf.splitTextToSize(content, columnWidth - 6);
  let textY = y + 12;
  for (const line of lines.slice(0, 8)) {
    pdf.text(line, x + 3, textY);
    textY += 3;
  }

  return y + 45;
}

function drawPersonalMessage(
  pdf: jsPDF,
  message: NonNullable<NewspaperData['personalMessage']>,
  x: number,
  y: number,
  width: number
): void {
  const boxWidth = width * 0.5;
  const boxX = x + (width - boxWidth) / 2;

  // 装飾枠
  pdf.setDrawColor(50, 50, 50);
  pdf.setLineWidth(1);
  pdf.rect(boxX, y, boxWidth, 35);
  pdf.rect(boxX + 2, y + 2, boxWidth - 4, 31);

  // タイトル
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${message.occasion} 記念`, boxX + boxWidth / 2, y + 8, {
    align: 'center',
  });

  // 宛名
  pdf.setFontSize(12);
  pdf.text(`${message.recipientName} 様へ`, boxX + boxWidth / 2, y + 16, {
    align: 'center',
  });

  // メッセージ
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const lines = pdf.splitTextToSize(message.message, boxWidth - 10);
  let textY = y + 22;
  for (const line of lines.slice(0, 2)) {
    pdf.text(line, boxX + boxWidth / 2, textY, { align: 'center' });
    textY += 4;
  }

  // 送り主
  pdf.setFontSize(8);
  pdf.text(`${message.senderName} より`, boxX + boxWidth - 5, y + 32, {
    align: 'right',
  });
}

function drawAdvertisements(
  pdf: jsPDF,
  ads: NewspaperData['advertisements'],
  x: number,
  y: number,
  width: number
): void {
  if (!ads || ads.length === 0) return;

  const adWidth = width / Math.min(ads.length, 3);

  ads.slice(0, 3).forEach((ad, index) => {
    const adX = x + index * adWidth;

    // 枠
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.3);
    pdf.rect(adX + 2, y, adWidth - 4, 25);

    // タイトル
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(ad.title, adX + adWidth / 2, y + 6, { align: 'center' });

    // 内容
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(ad.content, adWidth - 8);
    let textY = y + 11;
    for (const line of lines.slice(0, 3)) {
      pdf.text(line, adX + 4, textY);
      textY += 3;
    }
  });
}

function drawFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    'Generated by TimeTravel Press (Gemini 3.0 Edition)',
    pageWidth / 2,
    pageHeight - margin / 2,
    { align: 'center' }
  );
  pdf.setTextColor(0, 0, 0);
}

/**
 * HTML要素からPDFを生成（クライアントサイド用）
 */
export async function generatePDFFromElement(
  elementId: string,
  filename: string = 'newspaper.pdf'
): Promise<void> {
  // html2canvasを動的インポート（クライアントサイドのみ）
  const html2canvas = (await import('html2canvas')).default;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a3',
  });

  const imgWidth = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

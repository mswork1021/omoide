import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TimeTravel Press | 記念日新聞生成サービス',
  description:
    'あの日の新聞をAIで再現。誕生日、結婚記念日、還暦祝いなど、大切な記念日をヴィンテージ新聞風にお届けします。Gemini 3.0 & Nano Banana Pro による最高品質の生成。',
  keywords: [
    '記念日新聞',
    'オリジナル新聞',
    '誕生日プレゼント',
    '還暦祝い',
    '結婚記念日',
    'AI新聞生成',
  ],
  openGraph: {
    title: 'TimeTravel Press | 記念日新聞生成サービス',
    description: 'あの日の新聞をAIで再現。大切な記念日をヴィンテージ新聞風に。',
    type: 'website',
    locale: 'ja_JP',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-[#f5f0e6]">
        {children}
      </body>
    </html>
  );
}

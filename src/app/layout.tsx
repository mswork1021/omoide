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
      <body className="font-sans antialiased bg-[#f5f0e6] min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <footer className="mt-auto py-6 px-4 bg-[#1a1a1a]/5 border-t border-[#1a1a1a]/10">
          <div className="max-w-4xl mx-auto text-center text-xs text-[#1a1a1a]/50 space-y-2">
            <p>
              <span className="font-bold">免責事項:</span> 本サービスで生成される新聞記事はAIによるフィクションであり、内容の正確性・事実性は保証しておりません。
              生成された記事に関して、当サービスは一切の責任を負いません。ご利用は自己責任でお願いいたします。
            </p>
            <p className="text-[#1a1a1a]/30">
              © 2025 TimeTravel Press - Powered by AI
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

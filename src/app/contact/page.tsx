'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, HelpCircle, RefreshCcw } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f5f0e6] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#8b4513] hover:underline mb-6"
        >
          <ArrowLeft size={16} />
          トップに戻る
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-8 pb-4 border-b-2 border-[#8b4513]">
            お問い合わせ
          </h1>

          <div className="space-y-8 text-sm leading-relaxed">
            {/* メールアドレス */}
            <section className="bg-[#faf8f3] rounded-lg p-6 border border-[#8b4513]/20">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-[#8b4513]" size={24} />
                <h2 className="text-lg font-bold">お問い合わせ先</h2>
              </div>
              <a
                href="mailto:timetravelpress.support@gmail.com"
                className="text-[#8b4513] text-lg font-medium hover:underline"
              >
                timetravelpress.support@gmail.com
              </a>
              <p className="mt-2 text-[#1a1a1a]/60">
                通常1〜3営業日以内にご返信いたします。
              </p>
            </section>

            {/* 返金について */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCcw className="text-[#8b4513]" size={20} />
                <h2 className="text-lg font-bold">返金のご依頼</h2>
              </div>
              <p className="mb-4">
                以下の場合は返金対応いたします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mb-4 text-[#1a1a1a]/80">
                <li>決済完了後、コンテンツが生成されなかった場合</li>
                <li>技術的な問題でPDFが正常に作成されなかった場合</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold text-amber-800 mb-2">
                      返金ご依頼時に必要な情報
                    </p>
                    <ul className="space-y-1 text-amber-900">
                      <li>1. ご注文日時（例：2025年5月23日 14:30頃）</li>
                      <li>2. ご登録のメールアドレス</li>
                      <li>3. 購入内容（記事生成 / 画像追加）</li>
                      <li>4. 問題の詳細（エラー画面のスクリーンショットがあれば添付）</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[#1a1a1a]/60 text-xs">
                ※ お客様都合による返金（生成内容が気に入らない等）はお受けできません。<br />
                ※ 返金処理には3〜5営業日かかる場合があります。
              </p>
            </section>

            {/* その他のお問い合わせ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="text-[#8b4513]" size={20} />
                <h2 className="text-lg font-bold">その他のお問い合わせ</h2>
              </div>
              <p className="mb-3">
                以下のようなご質問・ご要望もお気軽にご連絡ください：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-[#1a1a1a]/80">
                <li>サービスの使い方について</li>
                <li>生成された内容に関するご質問</li>
                <li>機能のご要望・改善のご提案</li>
                <li>法人・大量注文のご相談</li>
              </ul>
            </section>

            {/* 注意事項 */}
            <section className="text-xs text-[#1a1a1a]/50 border-t pt-6">
              <p className="mb-2">
                ※ お問い合わせの内容によっては、ご返信にお時間をいただく場合がございます。
              </p>
              <p>
                ※ 営業目的のメールへのご返信は控えさせていただきます。
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          最終更新日: 2025年5月23日
        </p>
      </div>
    </div>
  );
}

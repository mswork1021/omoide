'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3">1. はじめに</h2>
              <p>
                TimeTravel Press（以下「当サービス」）は、お客様の個人情報の保護を重要視しています。
                本プライバシーポリシーでは、当サービスにおける個人情報の取り扱いについて説明します。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">2. 収集する情報</h2>
              <p className="mb-2">当サービスでは、以下の情報を収集します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>メールアドレス（PDF送信のため）</li>
                <li>決済情報（Stripeを通じて処理、当サービスでは保存しません）</li>
                <li>入力された記念日情報、メッセージ等</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">3. 情報の利用目的</h2>
              <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>新聞コンテンツの生成</li>
                <li>PDFのメール送信</li>
                <li>お問い合わせへの対応</li>
                <li>サービスの改善</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">4. 情報の保管</h2>
              <p>
                生成されたコンテンツおよび入力情報は、サービス提供後、サーバー上には保存されません。
                メールアドレスはPDF送信後、システム上から削除されます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">5. 第三者への提供</h2>
              <p className="mb-2">
                お客様の個人情報は、以下の場合を除き、第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>お客様の同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>サービス提供に必要な業務委託先（Stripe、Resend等）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">6. 外部サービス</h2>
              <p className="mb-2">当サービスでは、以下の外部サービスを利用しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Stripe（決済処理）</li>
                <li>Resend（メール送信）</li>
                <li>Google Gemini AI（コンテンツ生成）</li>
                <li>Vercel（ホスティング）</li>
              </ul>
              <p className="mt-2">
                各サービスのプライバシーポリシーについては、各社のウェブサイトをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">7. お問い合わせ</h2>
              <p>
                本ポリシーに関するご質問は、下記までご連絡ください。
              </p>
              <p className="mt-2">
                メールアドレス:{' '}
                <a
                  href="mailto:timetravelpress.support@gmail.com"
                  className="text-[#8b4513] hover:underline"
                >
                  timetravelpress.support@gmail.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">8. 改定</h2>
              <p>
                本ポリシーは、必要に応じて改定することがあります。
                改定した場合は、本ページにて通知します。
              </p>
            </section>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          最終更新日: 2025年5月22日
        </p>
      </div>
    </div>
  );
}

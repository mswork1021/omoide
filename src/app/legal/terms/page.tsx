'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            利用規約
          </h1>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3">第1条（適用）</h2>
              <p>
                本規約は、TimeTravel Press（以下「当サービス」）の利用に関する条件を定めるものです。
                ユーザーは、本規約に同意した上で当サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第2条（サービス内容）</h2>
              <p className="mb-2">当サービスは、以下のサービスを提供します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>指定された日付に基づく新聞風コンテンツの生成</li>
                <li>AI画像の生成</li>
                <li>PDF形式での出力およびメール送信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第3条（AI生成コンテンツについて）</h2>
              <p className="mb-2">
                当サービスで生成されるコンテンツは、AIによって作成されたフィクションです。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>記事内容の事実性・正確性は保証しません</li>
                <li>実在の人物・団体とは関係ありません</li>
                <li>生成されたコンテンツは娯楽目的でご利用ください</li>
                <li>報道資料や証拠としての使用はできません</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第4条（禁止事項）</h2>
              <p className="mb-2">ユーザーは、以下の行為をしてはなりません：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>生成コンテンツを事実であるかのように流布する行為</li>
                <li>他者を誹謗中傷する目的での利用</li>
                <li>違法行為を助長する目的での利用</li>
                <li>サービスの運営を妨害する行為</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第5条（知的財産権）</h2>
              <p>
                生成されたコンテンツの著作権は、法令の範囲内でユーザーに帰属します。
                ただし、当サービスは生成コンテンツをサービス改善の目的で利用する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第6条（免責事項）</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>当サービスは、生成コンテンツの内容について一切の責任を負いません</li>
                <li>サービスの中断・停止による損害について責任を負いません</li>
                <li>ユーザー間またはユーザーと第三者間のトラブルについて責任を負いません</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第7条（サービスの変更・終了）</h2>
              <p>
                当サービスは、事前の通知なくサービス内容の変更または終了を行う場合があります。
                これによりユーザーに生じた損害について、当サービスは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第8条（返金について）</h2>
              <p className="mb-2">
                デジタルコンテンツの性質上、お客様都合による返金はお受けできません。
              </p>
              <p>
                ただし、以下の場合は返金対応いたします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li>サービス側の技術的問題により生成が完了しなかった場合</li>
                <li>決済後にコンテンツが提供されなかった場合</li>
              </ul>
              <p className="mt-2">
                返金のご依頼は、お問い合わせよりご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第9条（準拠法・管轄裁判所）</h2>
              <p>
                本規約の解釈は日本法に準拠し、紛争が生じた場合は東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">第10条（お問い合わせ）</h2>
              <p>
                本規約に関するお問い合わせは、下記までご連絡ください。
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
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          最終更新日: 2025年5月22日
        </p>
      </div>
    </div>
  );
}

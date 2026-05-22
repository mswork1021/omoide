'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TokushohoPage() {
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
            特定商取引法に基づく表記
          </h1>

          <table className="w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 w-1/3 align-top">
                  販売業者
                </th>
                <td className="py-4 text-sm">
                  TimeTravel Press
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  所在地
                </th>
                <td className="py-4 text-sm">
                  請求があった場合は遅滞なく開示いたします
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  電話番号
                </th>
                <td className="py-4 text-sm">
                  請求があった場合は遅滞なく開示いたします
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  メールアドレス
                </th>
                <td className="py-4 text-sm">
                  <a
                    href="mailto:timetravelpress.support@gmail.com"
                    className="text-[#8b4513] hover:underline"
                  >
                    timetravelpress.support@gmail.com
                  </a>
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  販売価格
                </th>
                <td className="py-4 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>記事生成: 80円（税込）</li>
                    <li>画像追加: 500円（税込）</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  支払方法
                </th>
                <td className="py-4 text-sm">
                  クレジットカード決済（Stripe）
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  支払時期
                </th>
                <td className="py-4 text-sm">
                  サービス利用時に即時決済
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  商品の引渡時期
                </th>
                <td className="py-4 text-sm">
                  決済完了後、即時（デジタルコンテンツのため）
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  返品・返金について
                </th>
                <td className="py-4 text-sm">
                  <p className="mb-2">
                    デジタルコンテンツの性質上、お客様都合による返品・返金はお受けできません。
                  </p>
                  <p>
                    ただし、サービス側の技術的な問題により生成が完了しなかった場合は、
                    全額返金いたします。お問い合わせよりご連絡ください。
                  </p>
                </td>
              </tr>
              <tr>
                <th className="py-4 pr-4 text-left text-sm font-medium text-gray-600 align-top">
                  動作環境
                </th>
                <td className="py-4 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Google Chrome、Safari、Firefox、Edge の最新版</li>
                    <li>JavaScript有効</li>
                    <li>PDF閲覧ソフト</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          最終更新日: 2025年5月22日
        </p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '生成された記事の内容は事実ですか？',
    answer:
      'いいえ、AIが生成したフィクションです。実際の歴史的事実を参考にしていますが、記事の内容は創作であり、事実として使用することはできません。娯楽目的でお楽しみください。',
  },
  {
    question: '返金はできますか？',
    answer:
      'デジタルコンテンツの性質上、お客様都合（内容が気に入らない等）による返金はお受けできません。ただし、技術的な問題で生成が完了しなかった場合や、PDFが正常に作成されなかった場合は返金対応いたします。お問い合わせページよりご連絡ください。',
  },
  {
    question: '画像だけを購入できますか？',
    answer:
      'いいえ、画像追加は記事生成（¥80）の後にのみ購入できます。まず記事を生成し、内容を確認してから画像追加（¥500）をご検討ください。',
  },
  {
    question: 'どの年代まで対応していますか？',
    answer:
      '1900年から現在まで対応しています。明治後期〜令和まで、幅広い年代の記念日新聞を作成できます。',
  },
  {
    question: 'メールでPDFが届きません',
    answer:
      '画像追加（¥500）をご購入いただいた場合のみ、メールでPDFをお届けします。記事生成（¥80）のみではメール送信されません。また、迷惑メールフォルダに振り分けられている場合がありますのでご確認ください。PDFは画面からもダウンロードできますので、念のため画面を閉じる前にダウンロードしておくことをおすすめします。',
  },
  {
    question: 'メールアドレスを間違えて入力しました',
    answer:
      '申し訳ありませんが、一度決済が完了した後のメールアドレス変更・再送信はできません。画面に表示されているPDFをダウンロードして保存してください。',
  },
  {
    question: '生成にどのくらい時間がかかりますか？',
    answer:
      '記事生成は約10〜30秒、画像追加は約30〜60秒かかります。生成中は画面を閉じずにお待ちください。',
  },
  {
    question: '印刷しても大丈夫ですか？',
    answer:
      'はい、個人利用であれば印刷可能です。PDFをダウンロードして印刷してください。',
  },
  {
    question: '生成した新聞をSNSに投稿しても良いですか？',
    answer:
      'はい、投稿可能です。ただし、AIが生成したフィクションであることを明記してください。事実であるかのように投稿することはお控えください。',
  },
  {
    question: '宛名の人を記事に登場させると、知らない情報が書かれています',
    answer:
      '仕様です。AIは名前のみをもとに記事を作成するため、職業や年齢などの詳細情報は創作されます。「社長に就任」「世界記録を達成」など、架空の華々しい設定が付くこともあります。これもフィクションの一部としてお楽しみください！',
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#1a1a1a]/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-[#faf8f3] transition-colors px-2 -mx-2 rounded"
      >
        <span className="font-medium pr-4">{item.question}</span>
        <ChevronDown
          size={20}
          className={`text-[#8b4513] flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-[#1a1a1a]/70 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
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
            よくあるご質問
          </h1>

          <div className="space-y-1">
            {faqs.map((faq, index) => (
              <FAQAccordion key={index} item={faq} />
            ))}
          </div>

          {/* お問い合わせへの誘導 */}
          <div className="mt-8 pt-6 border-t border-[#1a1a1a]/10 text-center">
            <p className="text-sm text-[#1a1a1a]/60 mb-3">
              上記で解決しない場合は
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#8b4513] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#6d3610] transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          最終更新日: 2025年5月23日
        </p>
      </div>
    </div>
  );
}

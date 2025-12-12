'use client';

/**
 * OrderForm Component
 * 新料金体系: テキスト生成（80円）→ 画像追加（500円）
 */

import React, { useState } from 'react';
import { DatePicker } from './DatePicker';
import { Calendar, Gift, Sparkles, User, ChevronDown, ChevronUp, Loader2, FileText, Target, Smile, Star } from 'lucide-react';
import { useAppStore, useGenerationFlow } from '@/lib/store';

// テストモード（Stripeスキップ）
const TEST_MODE = true;

// テスト用パスワード（変更してください）
const TEST_PASSWORD = 'omoide2025';

export function OrderForm() {
  const {
    targetDate,
    setTargetDate,
    style,
    setStyle,
    recipientName,
    setRecipientName,
    senderName,
    setSenderName,
    personalMessage,
    setPersonalMessage,
    occasion,
    setOccasion,
    accuracy,
    setAccuracy,
    humorLevel,
    setHumorLevel,
    appearInArticle,
    setAppearInArticle,
    appearanceType,
    setAppearanceType,
    appearanceTargets,
    toggleAppearanceTarget,
    newspaperData,
  } = useAppStore();

  const [showPersonalMessage, setShowPersonalMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCode, setTestCode] = useState('');

  // テストコードが正しいか
  const isTestCodeValid = testCode === TEST_PASSWORD;

  const { isGenerating, generationStep, generationProgress, error } = useAppStore();
  const { startTextGeneration } = useGenerationFlow();

  const styleOptions = [
    { value: 'showa', label: '昭和風', description: '重厚な活字文化' },
    { value: 'heisei', label: '平成風', description: 'バブル期の華やかさ' },
    { value: 'reiwa', label: '令和風', description: 'レトロモダン' },
  ] as const;

  const occasionPresets = [
    '誕生日', '結婚記念日', '還暦祝い', '入学祝い', '卒業祝い', '退職記念', 'その他',
  ];

  // 既に新聞データがある場合は生成済み
  const isGenerated = !!newspaperData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;

    // テストモード: Stripeスキップして直接テキスト生成
    if (TEST_MODE) {
      await startTextGeneration();
      return;
    }

    setIsSubmitting(true);

    // 本番: テキスト生成の決済（80円）
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseType: 'text_only',
          metadata: {
            targetDate: targetDate.toISOString(),
            style,
            recipientName,
            senderName,
            personalMessage,
            occasion,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        // 決済完了後にテキスト生成
        await startTextGeneration();
      } else {
        throw new Error(data.error || '決済に失敗しました');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="order-form space-y-6">
      {/* ステップ1: 日付選択 */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} />
            記念日を選択
          </label>
        </div>
        <DatePicker
          value={targetDate}
          onChange={setTargetDate}
          placeholder="例: 1990/04/01"
        />
        <p className="text-xs text-[#1a1a1a]/50 mt-2">
          1900年〜現在までの日付を選択できます
        </p>
      </div>

      {/* ステップ2: スタイル選択 */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            2
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Sparkles size={20} />
            新聞スタイル
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStyle(option.value)}
              className={`
                p-3 border-2 rounded-lg text-center transition-all text-sm
                ${
                  style === option.value
                    ? 'border-[#8b4513] bg-[#8b4513] text-white'
                    : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                }
              `}
            >
              <div className="font-bold">{option.label}</div>
              <div className="text-xs mt-0.5 opacity-80">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ステップ3: 正確性ゲージ */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            3
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Target size={20} />
            史実の正確性
          </label>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#1a1a1a]/60">
            <span>フィクション重視</span>
            <span className="font-bold text-[#8b4513]">{accuracy}%</span>
            <span>史実重視</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={accuracy}
            onChange={(e) => setAccuracy(Number(e.target.value))}
            className="w-full h-2 bg-[#1a1a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#8b4513]"
          />
          <p className="text-xs text-[#1a1a1a]/50 mt-1">
            ※ 100%でも、その日に大きな出来事がない場合は架空の記事になることがあります
          </p>
        </div>
      </div>

      {/* ステップ4: ユーモア度ゲージ */}
      <div className="form-section">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-sm font-bold">
            4
          </div>
          <label className="text-lg font-bold flex items-center gap-2">
            <Smile size={20} />
            ユーモア度
          </label>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#1a1a1a]/60">
            <span>真面目・フォーマル</span>
            <span className="font-bold text-[#8b4513]">{humorLevel}%</span>
            <span>おもしろ・カジュアル</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={humorLevel}
            onChange={(e) => setHumorLevel(Number(e.target.value))}
            className="w-full h-2 bg-[#1a1a1a]/10 rounded-lg appearance-none cursor-pointer accent-[#8b4513]"
          />
          <p className="text-xs text-[#1a1a1a]/50 mt-1">
            ※ 高いほど、ジョークや面白おかしい表現が増えます
          </p>
        </div>
      </div>

      {/* 個人メッセージ（折りたたみ） */}
      <div className="form-section">
        <button
          type="button"
          onClick={() => setShowPersonalMessage(!showPersonalMessage)}
          className="w-full flex items-center justify-between p-3 border-2 border-dashed border-[#1a1a1a]/20 rounded-lg hover:border-[#8b4513]/40 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <Gift size={18} />
            個人メッセージを追加（任意）
          </span>
          {showPersonalMessage ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showPersonalMessage && (
          <div className="mt-3 p-4 bg-[#faf8f3] rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <User size={12} />
                  宛名
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="例: 山田太郎"
                  className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">送り主</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="例: 家族一同"
                  className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">記念日の種類</label>
              <div className="flex flex-wrap gap-1.5">
                {occasionPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setOccasion(preset)}
                    className={`
                      px-2.5 py-1 text-xs rounded-full border transition-colors
                      ${
                        occasion === preset
                          ? 'bg-[#8b4513] text-white border-[#8b4513]'
                          : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                      }
                    `}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">メッセージ</label>
              <textarea
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                placeholder="お祝いのメッセージを入力..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white resize-none"
              />
            </div>

            {/* 記事登場設定 */}
            {recipientName && (
              <div className="border-t border-[#1a1a1a]/10 pt-3 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appearInArticle}
                    onChange={(e) => setAppearInArticle(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1a1a1a]/20 text-[#8b4513] focus:ring-[#8b4513]"
                  />
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Star size={14} />
                    {recipientName}さんを記事に登場させる
                  </span>
                </label>

                {appearInArticle && (
                  <div className="mt-3 ml-6 space-y-3">
                    {/* 登場方法 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-[#1a1a1a]/60">登場のさせ方</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAppearanceType('protagonist')}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 transition-all ${
                            appearanceType === 'protagonist'
                              ? 'border-[#8b4513] bg-[#8b4513] text-white'
                              : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                          }`}
                        >
                          <div className="font-bold">主役として</div>
                          <div className="opacity-80 mt-0.5">「○○さんが大活躍！」</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAppearanceType('commentator')}
                          className={`flex-1 px-3 py-2 text-xs rounded-lg border-2 transition-all ${
                            appearanceType === 'commentator'
                              ? 'border-[#8b4513] bg-[#8b4513] text-white'
                              : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                          }`}
                        >
                          <div className="font-bold">関係者として</div>
                          <div className="opacity-80 mt-0.5">「〜について○○さんは…」</div>
                        </button>
                      </div>
                    </div>

                    {/* 登場させる記事 */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-[#1a1a1a]/60">登場させる記事（複数選択可）</label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { key: 'main', label: 'メイン記事' },
                          { key: 'sub1', label: 'サブ記事1' },
                          { key: 'sub2', label: 'サブ記事2' },
                          { key: 'sub3', label: 'サブ記事3' },
                        ].map((article) => (
                          <button
                            key={article.key}
                            type="button"
                            onClick={() => toggleAppearanceTarget(article.key)}
                            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                              appearanceTargets.includes(article.key)
                                ? 'bg-[#8b4513] text-white border-[#8b4513]'
                                : 'border-[#1a1a1a]/20 hover:border-[#8b4513]/40'
                            }`}
                          >
                            {article.label}
                          </button>
                        ))}
                      </div>
                      {appearanceTargets.length === 0 && (
                        <p className="text-xs text-orange-600 mt-1">※ 少なくとも1つ選択してください</p>
                      )}
                    </div>

                    <p className="text-xs text-[#1a1a1a]/50">
                      ※ どのように登場するかはお楽しみ！
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* テストコード入力（テストモード時のみ） */}
      {TEST_MODE && (
        <div className="form-section">
          <label className="block text-sm font-medium mb-2">
            🔐 テストコードを入力
          </label>
          <input
            type="password"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="テストコードを入力してください"
            className="w-full px-3 py-2 text-sm border border-[#1a1a1a]/20 rounded bg-white"
          />
          {testCode && !isTestCodeValid && (
            <p className="text-xs text-red-500 mt-1">コードが正しくありません</p>
          )}
          {isTestCodeValid && (
            <p className="text-xs text-green-600 mt-1">✓ 認証OK</p>
          )}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!targetDate || isSubmitting || isGenerating || isGenerated || (TEST_MODE && !isTestCodeValid)}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            !targetDate || isSubmitting || isGenerating || isGenerated || (TEST_MODE && !isTestCodeValid)
              ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]/40 cursor-not-allowed'
              : 'bg-[#8b4513] text-white hover:bg-[#6b3410] active:scale-[0.99]'
          }
        `}
      >
        {isSubmitting || isGenerating ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {generationStep === 'content' && '記事を生成中...'}
            {generationStep === 'images' && '画像を生成中...'}
            {generationStep === 'pdf' && 'PDF作成中...'}
            {generationStep === 'idle' && '処理中...'}
          </>
        ) : isGenerated ? (
          <>
            <FileText size={20} />
            生成済み（下のプレビューを確認）
          </>
        ) : TEST_MODE ? (
          <>
            <Sparkles size={20} />
            テスト生成する（無料）
          </>
        ) : (
          <>
            <FileText size={20} />
            記事を生成する（¥80）
          </>
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          エラー: {error}
        </div>
      )}

      {/* 料金説明 */}
      <div className="text-center text-xs text-[#1a1a1a]/60 space-y-1">
        {TEST_MODE ? (
          <p className="text-orange-600 bg-orange-50 p-2 rounded">
            🧪 テストモード: 決済をスキップしてAI生成をテストできます
          </p>
        ) : (
          <>
            <p>記事生成: ¥80 / 画像追加: ¥500</p>
            <p>画像を追加すると、PDF出力が無料でできます</p>
          </>
        )}
      </div>

      {/* 注意書き・免責事項 */}
      <div className="text-xs text-[#1a1a1a]/50 space-y-2 p-3 bg-[#1a1a1a]/5 rounded-lg">
        <p>
          <span className="font-bold">⚠️ ご注意:</span> 矛盾する設定の組み合わせ（例：正確性100% × ユーモア度100%、正確性100% × 宛名登場）の場合、条件が混ざり合い予想外の結果になることがあります。そのごちゃ混ぜ感もお楽しみください！
        </p>
        <p>
          <span className="font-bold">📜 免責事項:</span> 本サービスで生成される新聞記事はAIによるフィクションです。内容の正確性・事実性は保証しておりません。生成された記事に関して、当サービスは一切の責任を負いません。
        </p>
      </div>
    </form>
  );
}

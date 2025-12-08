'use client';

/**
 * GenerationForm Component
 * 記念日新聞生成のための入力フォーム
 */

import React from 'react';
import { DatePicker } from './DatePicker';
import { useAppStore, useGenerationFlow } from '@/lib/store';
import { Newspaper, Gift, Sparkles, User } from 'lucide-react';

export function GenerationForm() {
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
    isGenerating,
    error,
  } = useAppStore();

  const { startPreviewGeneration } = useGenerationFlow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) return;
    await startPreviewGeneration();
  };

  const styleOptions = [
    { value: 'showa', label: '昭和風', description: '重厚な活字文化の香り' },
    { value: 'heisei', label: '平成風', description: 'バブル期の華やかさ' },
    { value: 'reiwa', label: '令和風', description: 'レトロモダンな融合' },
  ] as const;

  const occasionPresets = [
    '誕生日',
    '結婚記念日',
    '還暦祝い',
    '入学祝い',
    '卒業祝い',
    '退職記念',
    '創業記念',
    'その他',
  ];

  return (
    <form onSubmit={handleSubmit} className="generation-form space-y-6">
      {/* 日付選択 */}
      <div className="form-section">
        <label className="block text-lg font-bold mb-2 flex items-center gap-2">
          <Newspaper size={20} />
          記念日を選択
        </label>
        <p className="text-sm text-[#1a1a1a]/60 mb-3">
          1900年〜現在までの日付を選択できます
        </p>
        <DatePicker
          value={targetDate}
          onChange={setTargetDate}
          placeholder="例: 1990/04/01"
        />
      </div>

      {/* スタイル選択 */}
      <div className="form-section">
        <label className="block text-lg font-bold mb-2 flex items-center gap-2">
          <Sparkles size={20} />
          新聞スタイル
        </label>
        <div className="grid grid-cols-3 gap-3">
          {styleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStyle(option.value)}
              className={`
                p-4 border-2 rounded-lg text-center transition-all
                ${
                  style === option.value
                    ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                    : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
                }
              `}
            >
              <div className="font-bold">{option.label}</div>
              <div className="text-xs mt-1 opacity-80">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 個人メッセージセクション */}
      <div className="form-section border-2 border-dashed border-[#1a1a1a]/20 rounded-lg p-4">
        <label className="block text-lg font-bold mb-2 flex items-center gap-2">
          <Gift size={20} />
          個人メッセージ（任意）
        </label>
        <p className="text-sm text-[#1a1a1a]/60 mb-4">
          プレゼント用にメッセージを追加できます
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-1">
              <User size={14} />
              宛名
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="例: 山田太郎"
              className="w-full px-3 py-2 border border-[#1a1a1a]/20 rounded bg-[#faf8f3]
                         focus:border-[#1a1a1a] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">送り主</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="例: 家族一同"
              className="w-full px-3 py-2 border border-[#1a1a1a]/20 rounded bg-[#faf8f3]
                         focus:border-[#1a1a1a] focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">記念日の種類</label>
          <div className="flex flex-wrap gap-2">
            {occasionPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOccasion(preset)}
                className={`
                  px-3 py-1 text-sm rounded-full border transition-colors
                  ${
                    occasion === preset
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'border-[#1a1a1a]/20 hover:border-[#1a1a1a]/40'
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
            rows={3}
            className="w-full px-3 py-2 border border-[#1a1a1a]/20 rounded bg-[#faf8f3]
                       focus:border-[#1a1a1a] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!targetDate || isGenerating}
        className={`
          w-full py-4 text-lg font-bold rounded-lg transition-all
          flex items-center justify-center gap-2
          ${
            !targetDate || isGenerating
              ? 'bg-[#1a1a1a]/20 text-[#1a1a1a]/40 cursor-not-allowed'
              : 'bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/90 active:scale-[0.99]'
          }
        `}
      >
        {isGenerating ? (
          <>
            <span className="animate-spin">⟳</span>
            生成中...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            無料プレビューを生成
          </>
        )}
      </button>

      <p className="text-center text-sm text-[#1a1a1a]/60">
        ※ プレビューは完全無料です。高画質PDF出力には決済が必要です。
      </p>
    </form>
  );
}

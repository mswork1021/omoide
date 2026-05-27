'use client';

/**
 * GenerationOverlay Component
 * 生成中に表示するフルスクリーンオーバーレイ
 * ユーザーが誤ってページを閉じることを防ぐ
 */

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Loader2, AlertTriangle, Newspaper, ImagePlus, FileText } from 'lucide-react';

export function GenerationOverlay() {
  const {
    isGenerating,
    generationStep,
    generationProgress,
  } = useAppStore();

  // 生成中でなければ表示しない
  if (!isGenerating) {
    return null;
  }

  // ステップごとの表示内容
  const stepConfig = {
    content: {
      icon: Newspaper,
      title: '記事を生成中...',
      description: 'AIがその日の出来事を調査して記事を作成しています',
    },
    images: {
      icon: ImagePlus,
      title: '画像を生成中...',
      description: 'AIが記事に合った画像を生成しています',
    },
    pdf: {
      icon: FileText,
      title: 'PDFを生成中...',
      description: '新聞をPDF形式に変換しています',
    },
    idle: {
      icon: Loader2,
      title: '準備中...',
      description: '処理を開始しています',
    },
    complete: {
      icon: Loader2,
      title: '完了処理中...',
      description: 'まもなく完了します',
    },
  };

  const config = stepConfig[generationStep] || stepConfig.idle;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* アイコン */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8b4513] to-[#d4a574] rounded-full flex items-center justify-center">
            <Icon className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* タイトル */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {config.title}
        </h2>

        {/* 説明 */}
        <p className="text-center text-[#1a1a1a]/60 mb-6">
          {config.description}
        </p>

        {/* プログレスバー */}
        <div className="mb-4">
          <div className="w-full bg-[#1a1a1a]/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#8b4513] to-[#d4a574] h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(generationProgress, 5)}%` }}
            />
          </div>
          <p className="text-center text-sm text-[#1a1a1a]/60 mt-2">
            {generationProgress}% 完了
          </p>
        </div>

        {/* 目安時間 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-center text-sm text-blue-800">
            <span className="font-bold">⏱ 目安時間:</span> 約30〜60秒
          </p>
          <p className="text-center text-xs text-blue-600 mt-1">
            通信環境により前後する場合があります
          </p>
        </div>

        {/* 警告 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-800">
              このページを閉じないでください
            </p>
            <p className="text-xs text-orange-600 mt-1">
              生成が完了するまでお待ちください。
              ページを閉じると生成が中断され、完了しません。
            </p>
          </div>
        </div>

        {/* ローディングアニメーション */}
        <div className="flex justify-center mt-6">
          <Loader2 className="w-6 h-6 animate-spin text-[#8b4513]" />
        </div>
      </div>
    </div>
  );
}

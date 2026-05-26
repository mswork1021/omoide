'use client';

import { useState, useEffect } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';

const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true';
const MAINTENANCE_PASSWORD = 'omoide2025';
const STORAGE_KEY = 'maintenance_authenticated';

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // テストモードでない場合は認証不要
    if (!TEST_MODE) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // ローカルストレージから認証状態を確認
    const authenticated = localStorage.getItem(STORAGE_KEY);
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MAINTENANCE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  // ローディング中は何も表示しない（ちらつき防止）
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <div className="animate-pulse text-[#8b4513]">読み込み中...</div>
      </div>
    );
  }

  // 認証済み or テストモードでない場合は通常表示
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // メンテナンス画面
  return (
    <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* アイコンとタイトル */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <AlertTriangle className="text-amber-600" size={32} />
          </div>
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">
            メンテナンス中
          </h1>
          <p className="text-sm text-[#1a1a1a]/60">
            現在サイトはメンテナンス中のため、
            <br />
            管理者のみアクセス可能です。
          </p>
        </div>

        {/* パスワード入力フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a1a1a]/70 mb-2">
              <Lock size={14} className="inline mr-1" />
              管理者パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="パスワードを入力"
              className="w-full px-4 py-3 border-2 border-[#1a1a1a]/20 rounded-lg focus:border-[#8b4513] focus:outline-none transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">
                パスワードが正しくありません
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#8b4513] text-white font-bold rounded-lg hover:bg-[#6d3610] transition-colors"
          >
            ログイン
          </button>
        </form>

        {/* 注意書き */}
        <p className="text-xs text-center text-[#1a1a1a]/40 mt-6">
          一般公開までしばらくお待ちください
        </p>
      </div>
    </div>
  );
}

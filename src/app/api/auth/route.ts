/**
 * Admin Authentication API
 * サーバー側でパスワードを検証し、トークンを発行
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// サーバー側のみの環境変数（NEXT_PUBLIC_なし）
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'default_password_change_me';

// トークン生成（セッションごとにユニーク）
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 有効なトークンを保存（本番ではRedisなどを使うべき）
const validTokens = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password required' },
        { status: 400 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      const token = generateToken();
      validTokens.add(token);

      // 1時間後に自動削除
      setTimeout(() => {
        validTokens.delete(token);
      }, 60 * 60 * 1000);

      return NextResponse.json({
        success: true,
        token,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// トークン検証用
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, valid: false },
        { status: 400 }
      );
    }

    const isValid = validTokens.has(token);

    return NextResponse.json({
      success: true,
      valid: isValid,
    });
  } catch {
    return NextResponse.json(
      { success: false, valid: false },
      { status: 500 }
    );
  }
}

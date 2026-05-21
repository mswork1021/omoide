/**
 * Email Sending API Endpoint
 * PDF完成後にメールで送信する
 */

import { NextRequest, NextResponse } from 'next/server';

// Resend APIを使用
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@timetravel-press.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, pdfBase64, date } = body;

    // バリデーション
    if (!to || !pdfBase64) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Resend APIキーがない場合はスキップ（開発環境用）
    if (!RESEND_API_KEY) {
      console.log('[Email] Resend API key not configured, skipping email');
      return NextResponse.json({
        success: true,
        message: 'Email skipped (no API key)',
      });
    }

    // 日付フォーマット
    const dateStr = date ? new Date(date).toLocaleDateString('ja-JP') : '記念日';

    // Resend APIでメール送信
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `TimeTravel Press <${FROM_EMAIL}>`,
        to: [to],
        subject: `【TimeTravel Press】${dateStr}の記念日新聞が完成しました`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8b4513; border-bottom: 2px solid #8b4513; padding-bottom: 10px;">
              TimeTravel Press
            </h1>
            <p>記念日新聞が完成しました！</p>
            <p>添付のPDFファイルをダウンロードしてお楽しみください。</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">
              このメールはTimeTravel Pressから自動送信されています。<br />
              ご不明な点がございましたら、お問い合わせください。
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `timetravel-press-${dateStr.replace(/\//g, '-')}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[Email] Resend error:', result);
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('[Email] Sent successfully to:', to);
    return NextResponse.json({
      success: true,
      messageId: result.id,
    });
  } catch (error) {
    console.error('[Email] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

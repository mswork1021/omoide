# TimeTravel Press (Gemini 3.0 Edition)

あの日の新聞をAIで再現する、記念日新聞生成サービス。

## 特徴

- **Gemini 3.0** - Google Grounding機能を活用した事実確認と、昭和/平成の重厚な文体での記事生成
- **Nano Banana Pro** - ヴィンテージ新聞の質感を再現する最高品質の画像生成
- **Next.js 15 + React 19** - Server Components完全準拠の最新フロントエンド
- **Stripe決済** - 安全なオンライン決済

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Core LLM | Gemini 3.0 (Google Grounding) |
| 画像生成 | Nano Banana Pro (J-Retro Style) |
| Frontend | Next.js 15, React 19, Tailwind CSS |
| 状態管理 | Zustand |
| PDF生成 | jsPDF, html2canvas |
| 決済 | Stripe |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して、以下のAPIキーを設定:

- `GOOGLE_AI_API_KEY` - Google AI Studio から取得
- `NANO_BANANA_API_KEY` - Nano Banana Pro から取得
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe Dashboard から取得

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── gemini/        # Gemini 3.0 コンテンツ生成
│   │   ├── image/         # Nano Banana Pro 画像生成
│   │   ├── checkout/      # Stripe 決済
│   │   └── generate-pdf/  # PDF生成
│   ├── page.tsx           # ホームページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # React コンポーネント
│   ├── NewspaperPreview.tsx   # 新聞プレビュー
│   ├── GenerationForm.tsx     # 生成フォーム
│   ├── DatePicker.tsx         # 日付選択
│   └── PaymentSection.tsx     # 決済セクション
├── lib/                   # ユーティリティ
│   ├── gemini.ts          # Gemini API クライアント
│   ├── nanoBanana.ts      # Nano Banana API クライアント
│   ├── stripe.ts          # Stripe 設定
│   ├── pdf.ts             # PDF生成
│   └── store.ts           # Zustand ストア
└── types/                 # TypeScript 型定義
    └── index.ts
```

## UXフロー

1. サンプル新聞を閲覧（静的表示）
2. 日付選択 + スタイル選択
3. Stripe 決済
4. Gemini 3.0 + Nano Banana Pro で生成
5. 高画質PDF ダウンロード

※ API呼び出しは決済完了後のみ発生（コスト最適化）

## サンプル生成

サンプル新聞は本番と同じGemini 3.0 + Nano Banana Proで生成します。

```bash
# 1. APIキーを設定
cp .env.example .env.local
# .env.local を編集してAPIキーを設定

# 2. サンプル生成実行
npm run generate-samples
```

生成されるサンプル:
- 1990/4/1 - 誕生日（平成2年の春）
- 1985/6/15 - 結婚記念日（科学万博つくば）
- 1964/10/10 - 還暦祝い（東京オリンピック開幕）

結果は `src/lib/sampleData.ts` に保存されます。

## API エンドポイント

### POST /api/gemini
新聞コンテンツを生成

```json
{
  "targetDate": "1990-04-01",
  "style": "showa",
  "recipientName": "山田太郎",
  "senderName": "家族一同",
  "personalMessage": "還暦おめでとう",
  "occasion": "還暦祝い"
}
```

### POST /api/image
画像を生成

```json
{
  "prompt": "vintage newspaper photograph...",
  "style": "vintage-newspaper",
  "highFidelity": true
}
```

### POST /api/checkout
支払いインテント作成

```json
{
  "tier": "standard"
}
```

### POST /api/generate-pdf
PDF生成

```json
{
  "paymentIntentId": "pi_xxx",
  "newspaperData": {...},
  "images": {...},
  "quality": "standard"
}
```

## 価格プラン

| プラン | 価格 | 特徴 |
|--------|------|------|
| Standard | ¥980 | A3 / 150dpi |
| Premium | ¥1,980 | A3 / 300dpi / 追加コラム |
| Deluxe | ¥3,980 | A2 / 300dpi / 額装対応 |

## ライセンス

MIT License

---

**TimeTravel Press** - Powered by Gemini 3.0 & Nano Banana Pro

# TimeTravel Press (思い出新聞)

あの日の新聞をAIで再現する、記念日新聞生成サービス。

## 特徴

- **Gemini 2.5 Pro** - Google Grounding機能を活用した事実確認と、昭和/平成/令和の重厚な文体での記事生成
- **Gemini 2.5 Flash Image** - 時代別（昭和=モノクロ、平成=カラー、令和=高解像度）の新聞画像生成
- **Next.js 16 + React 19** - Server Components完全準拠の最新フロントエンド
- **Stripe決済** - 安全なオンライン決済（テキスト80円 + 画像500円）

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Core LLM | Gemini 2.5 Pro (Google Grounding) |
| 画像生成 | Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) |
| Frontend | Next.js 16, React 19, Tailwind CSS |
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

- `GOOGLE_AI_API_KEY` - Google AI Studio から取得（Gemini Pro + Flash Image 両方で使用）
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
│   │   ├── gemini/        # Gemini 2.5 Pro コンテンツ生成
│   │   ├── image/         # Gemini 2.5 Flash Image 画像生成
│   │   ├── checkout/      # Stripe 決済
│   │   └── generate-pdf/  # PDF生成（未使用、クライアント側で生成）
│   ├── page.tsx           # ホームページ
│   └── layout.tsx         # ルートレイアウト
├── components/            # React コンポーネント
│   ├── NewspaperPreview.tsx   # 新聞プレビュー（3スタイル対応）
│   ├── SampleCarousel.tsx     # サンプル新聞カルーセル
│   ├── GenerationForm.tsx     # 生成フォーム
│   ├── DatePicker.tsx         # 日付選択
│   └── PaymentSection.tsx     # 決済セクション
├── lib/                   # ユーティリティ
│   ├── gemini.ts          # Gemini 2.5 Pro クライアント
│   ├── nanoBanana.ts      # Gemini 2.5 Flash Image クライアント
│   ├── stripe.ts          # Stripe 設定
│   ├── sampleData.ts      # サンプル新聞データ
│   └── store.ts           # Zustand ストア + PDF生成
└── types/                 # TypeScript 型定義
    └── index.ts
```

## 主要コンポーネント詳細

### NewspaperPreview.tsx
新聞プレビューの中核コンポーネント。3つの時代スタイルに対応。

**重要な実装詳細:**
- `NEWSPAPER_WIDTH = 800` - プレビュー幅（PDF生成時も同じ幅を使用）
- 画像は `objectFit: 'cover'` で表示（余白なくフィット）
- メイン画像: `aspectRatio: '16/9'`
- サブ画像: `aspectRatio: '4/3'`
- モバイル対応: `transform: scale()` でレスポンシブ縮小
- `forPDF` プロパティでPDF生成時のスケーリング無効化

**フッター構成:**
```
本紙は ○○様 へ □□ より贈られました
[個人メッセージ（最大50文字）]
[日付] TimeTravel Press
```

### nanoBanana.ts
Gemini 2.5 Flash Image を使用した画像生成。

**重要な実装詳細:**
- モデル: `gemini-2.5-flash-image`（旧 `gemini-2.5-flash-image-preview` は非推奨）
- アスペクト比指定: `imageConfig.aspectRatio` で '16:9', '4:3' 等を指定
- `generateMultipleImages()`: メイン画像は16:9、サブ画像は4:3で生成
- リトライ: 最大3回、exponential backoff

```typescript
config: {
  responseModalities: ['image', 'text'],
  imageConfig: {
    aspectRatio: aspectRatio,  // '16:9' | '4:3' | '1:1' | '3:4' | '9:16'
  },
}
```

### store.ts (PDF生成)
`generatePDF()` 関数でクライアント側PDF生成。

**重要な実装詳細:**
- html2canvas + jsPDF でキャプチャ
- プレビュー要素をクローンして `position: fixed; left: -9999px` に配置
- キャプチャ幅: 800px（NewspaperPreview と同じ）
- モバイルスケーリングをリセットしてからキャプチャ
- PDFサイズは自然な高さに合わせて動的計算

## カスタマイズ設定

ユーザーが設定できる項目:

| 設定 | 説明 | 値 |
|------|------|-----|
| targetDate | 新聞の日付 | Date |
| style | 時代スタイル | 'showa' / 'heisei' / 'reiwa' |
| recipientName | 宛名 | string |
| senderName | 贈り主 | string |
| personalMessage | 個人メッセージ | string (最大50文字) |
| occasion | 記念日の種類 | string |
| accuracy | 史実の正確性 | 0-100 |
| humorLevel | ユーモア度 | 0-100 |
| appearInArticle | 宛名の人を記事に登場させるか | boolean |
| appearanceType | 登場方法 | 'protagonist' / 'commentator' |
| appearanceTargets | 登場させる記事 | ['main', 'sub1', 'sub2', 'sub3'] |

## サンプルデータ

`src/lib/sampleData.ts` に3つのサンプル:

1. **令和サンプル** - 架空のユーモラスなニュース（佐藤花子さんが世界一好かれる人に認定）
2. **平成サンプル** - 1998年長野オリンピック開会式
3. **昭和サンプル** - 1970年大阪万博（山本一郎さんがコメンテーターとして登場）

サンプルは設定例を示すために使用:
- 令和: 正確性0%、ユーモア100%
- 平成: 正確性100%、ユーモア0%
- 昭和: 正確性50%、ユーモア50%、記事への登場あり

## API エンドポイント

### POST /api/gemini
新聞コンテンツを生成

```json
{
  "targetDate": "1990-04-01T12:00:00",
  "style": "showa",
  "recipientName": "山田太郎",
  "senderName": "家族一同",
  "personalMessage": "還暦おめでとう",
  "occasion": "還暦祝い",
  "accuracy": 50,
  "humorLevel": 50,
  "appearInArticle": true,
  "appearanceType": "commentator",
  "appearanceTargets": ["main", "sub1"]
}
```

### POST /api/image
画像を生成（複数画像対応）

```json
{
  "prompts": ["main article prompt...", "sub1 prompt...", "sub2 prompt...", "sub3 prompt..."],
  "era": "showa"
}
```

レスポンス:
```json
{
  "success": true,
  "images": ["data:image/png;base64,...", "data:image/png;base64,...", ...],
  "totalRequested": 4,
  "totalGenerated": 4
}
```

### POST /api/checkout
支払いインテント作成

```json
{
  "type": "text_only"
}
```
または
```json
{
  "type": "add_images"
}
```

## 価格

| タイプ | 価格 | 内容 |
|--------|------|------|
| text_only | ¥80 | テキストのみ生成 |
| add_images | ¥500 | 画像追加（4枚） |

## 既知の注意点

1. **画像生成モデル**: `gemini-2.5-flash-image` を使用（preview版は非推奨）
2. **PDF生成**: クライアント側で実行（html2canvas + jsPDF）
3. **アスペクト比**: メイン16:9、サブ4:3で生成・表示
4. **モバイル**: CSS `transform: scale()` でレスポンシブ対応

## 開発時のよくある問題

### 画像が生成されない
- `GOOGLE_AI_API_KEY` が正しく設定されているか確認
- モデル名が `gemini-2.5-flash-image` になっているか確認（preview版は非推奨）

### PDFが小さく表示される / 切れる
- `store.ts` の `generatePDF()` でモバイルスケーリングをリセットしているか確認
- キャプチャ幅が800pxになっているか確認

### 画像に余白ができる
- `objectFit: 'cover'` になっているか確認
- 生成時のアスペクト比と表示コンテナのアスペクト比が一致しているか確認

## ライセンス

MIT License

---

**TimeTravel Press** - Powered by Gemini 2.5 Pro & Gemini 2.5 Flash Image

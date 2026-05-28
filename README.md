# TimeTravel Press (思い出新聞)

「この日の新聞があったの！？」そんな驚きをプレゼントに。

誕生日、記念日、還暦祝いなど、大切な日の新聞をAIで生成するサービス。

## 特徴

- **3つの時代スタイル** - 昭和のレトロ、平成の懐かしさ、令和のモダン
- **Gemini 2.5 Pro** - AIによる時代背景の調査・記事生成
- **Gemini 2.5 Flash Image** - 時代別の新聞画像生成（昭和=モノクロ、平成=カラー、令和=高解像度）
- **PDF・画像出力無料** - 画像追加後はPDFダウンロード・画像保存が無料
- **SNSシェア機能** - X（Twitter）への簡単シェア

## 料金

| タイプ | 価格 | 内容 |
|--------|------|------|
| 記事生成 | ¥80 | テキストのみ生成 |
| 画像追加 | ¥500 | 画像4枚追加 + PDF・画像出力無料 |

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Core LLM | Gemini 2.5 Pro |
| 画像生成 | Gemini 2.5 Flash Image |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| 状態管理 | Zustand |
| PDF生成 | jsPDF, html2canvas |
| 画像出力 | html2canvas |
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

`.env.local` を編集して、以下を設定:

```env
# Google AI
GOOGLE_AI_API_KEY=your_api_key

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional: テストモード（メンテナンス画面表示）
NEXT_PUBLIC_TEST_MODE=false
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能。

## プロジェクト構造

```
src/
├── app/                       # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── gemini/            # 記事生成 API
│   │   ├── image/             # 画像生成 API
│   │   └── checkout/          # Stripe 決済 API
│   ├── legal/                 # 法的ページ
│   │   ├── privacy/           # プライバシーポリシー
│   │   ├── terms/             # 利用規約
│   │   └── commercial/        # 特定商取引法に基づく表記
│   ├── faq/                   # FAQ ページ
│   ├── page.tsx               # ホームページ
│   └── layout.tsx             # ルートレイアウト
├── components/
│   ├── NewspaperPreview.tsx   # 新聞プレビュー（3スタイル対応）
│   ├── SampleCarousel.tsx     # サンプル新聞カルーセル
│   ├── OrderForm.tsx          # 注文フォーム
│   ├── PaymentSection.tsx     # 決済・ダウンロード・シェア
│   ├── GenerationOverlay.tsx  # 生成中オーバーレイ
│   └── MaintenanceGate.tsx    # メンテナンスモード
├── lib/
│   ├── gemini.ts              # Gemini Pro クライアント
│   ├── nanoBanana.ts          # Gemini Flash Image クライアント
│   ├── stripe.ts              # Stripe 設定
│   ├── sampleData.ts          # サンプル新聞データ
│   └── store.ts               # Zustand ストア + PDF生成
└── types/
    └── index.ts               # TypeScript 型定義
```

## 主要機能

### 新聞生成フロー

1. **日付選択** - 1900年〜現在まで対応
2. **記事生成** - AIがその日の出来事を調査して記事作成（¥80）
3. **画像追加** - 気に入ったら画像をプラス（¥500）
4. **ダウンロード** - PDF・画像で保存（無料）

### ダウンロード・シェア機能

- **PDFダウンロード** - 高画質PDFで保存
- **画像ダウンロード** - PNG画像で保存（URL透かし付き）
- **Xでシェア** - ハッシュタグ付きでシェア
- **テキストコピー** - 記事テキストをクリップボードにコピー

### メンテナンスモード

`NEXT_PUBLIC_TEST_MODE=true` 設定時、パスワード認証画面を表示。
テスト中に一般ユーザーのアクセスを制限可能。

## カスタマイズ設定

| 設定 | 説明 | デフォルト |
|------|------|-----|
| style | 時代スタイル | 'reiwa'（オススメ） |
| recipientName | 宛名 | - |
| senderName | 贈り主 | - |
| personalMessage | 個人メッセージ | - (最大50文字) |
| occasion | 記念日の種類 | - |
| accuracy | 史実の正確性 | 50 (0-100) |
| humorLevel | ユーモア度 | 50 (0-100) |
| appearInArticle | 宛名を記事に登場 | false |

## API エンドポイント

### POST /api/gemini
新聞記事を生成

### POST /api/image
画像を生成（メイン1枚 + サブ3枚）

### POST /api/checkout
Stripe決済セッション作成

### PUT /api/checkout
決済確認

## 開発時の注意点

### 画像生成モデル
`gemini-2.5-flash-image` を使用（preview版は非推奨）

### PDF/画像生成
クライアント側で html2canvas + jsPDF を使用。
モバイルでは `transform: scale()` をリセットしてからキャプチャ。

### iOS対応
- 画像保存: 新しいタブで開いて長押し保存を促す
- ポップアップブロッカー: 非同期処理前にウィンドウを開く

## ライセンス

MIT License

---

**TimeTravel Press** - Powered by Gemini AI

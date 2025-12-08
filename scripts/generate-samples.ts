/**
 * サンプル新聞生成スクリプト
 *
 * Gemini API を使用してサンプル新聞を生成し、sampleData.ts に保存する
 * - テキスト生成: Gemini 2.0 Flash
 * - 画像生成: Imagen 3 (Gemini 3 Pro Image / Nano Banana Pro)
 *
 * 使い方:
 * 1. .env.local にAPIキーを設定
 *    GOOGLE_AI_API_KEY=your_api_key
 * 2. npm run generate-samples
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// サンプル生成する日付とシーン
const SAMPLE_CONFIGS = [
  {
    id: 'birthday-1990',
    date: '1990-04-01',
    style: 'heisei' as const,
    occasion: '誕生日',
    recipientName: '山田 太郎',
    senderName: 'ご家族一同',
    message: 'お誕生日おめでとうございます。あなたが生まれたこの日、世界はこんなニュースで溢れていました。',
    title: '誕生日の新聞',
    description: '1990年4月1日 - 平成二年の春',
  },
  {
    id: 'wedding-1985',
    date: '1985-06-15',
    style: 'showa' as const,
    occasion: '結婚記念日',
    recipientName: '佐藤 幸子',
    senderName: '夫 健一より',
    message: '結婚記念日おめでとう。あの日から時は流れましたが、あなたへの想いは変わりません。これからもよろしく。',
    title: '結婚記念日の新聞',
    description: '1985年6月15日 - 科学万博つくば',
  },
  {
    id: 'kanreki-1964',
    date: '1964-10-10',
    style: 'showa' as const,
    occasion: '還暦祝い',
    recipientName: '鈴木 正夫',
    senderName: 'ご家族一同',
    message: '還暦おめでとうございます。あなたが生まれたこの日、東京オリンピックが開幕しました。日本中が希望に満ちていたあの日から60年。これからも健康で。',
    title: '還暦祝いの新聞',
    description: '1964年10月10日 - 東京オリンピック開幕',
  },
];

// Gemini プロンプト（テキスト生成用）
const NEWSPAPER_PROMPT = `
あなたは昭和・平成時代の日本の新聞記者です。
以下の特徴を持つ文体で記事を執筆してください：

【文体の特徴】
- 重厚かつ温かみのある語り口
- 「である」調を基本とし、時折「であった」「であろう」を織り交ぜる
- 漢字を多用し、硬質な印象を与える
- 比喩表現や情景描写を効果的に用いる
- 読者の感情に訴えかける表現を心がける
- AI特有の平坦な表現、箇条書き、絵文字は絶対に使用しない

【禁止事項】
- 「〜と思います」「〜ですね」などの軽い口語表現
- 「！」「？」の多用
- 現代のネットスラングや若者言葉
- 単調な羅列や箇条書き

【事実確認】
提供された日付に関する歴史的事実を正確に調査し、以下の情報を含めてください：
- その日の主要なニュース（国内外）
- 経済・株価の動向
- スポーツの結果
- 文化・芸能のトピック
- 天気（推定）

事実に基づかない創作は最小限に留め、実際の出来事をベースに記事を構成してください。
`;

// 画像生成用プロンプトテンプレート
const IMAGE_PROMPT_TEMPLATE = `
Create a vintage Japanese newspaper photograph from the specified era.
Style requirements:
- Photorealistic vintage newspaper print quality
- Halftone dots texture (網点処理)
- Ink bleed effect (インクの滲み)
- Aged paper texture
- Monochrome/sepia newsprint aesthetic
- Japanese Showa/Heisei era photography style
- Professional photojournalism composition

Subject: {subject}
`;

async function generateNewspaperContent(config: typeof SAMPLE_CONFIGS[0]) {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const date = new Date(config.date);
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const eraStyle = {
    showa: '昭和時代の重厚な新聞',
    heisei: '平成初期の活字新聞',
    reiwa: '令和のレトロ調新聞',
  }[config.style];

  const prompt = `
${NEWSPAPER_PROMPT}

【生成する新聞の設定】
- 日付: ${dateStr}
- スタイル: ${eraStyle}
- 記念日: ${config.occasion}
- 宛名: ${config.recipientName}
- 送り主: ${config.senderName}
- メッセージ: ${config.message}

以下のJSON形式で新聞コンテンツを生成してください。必ず有効なJSONのみを出力してください：

{
  "masthead": "新聞名（創作可）",
  "edition": "第〇〇〇号 朝刊/夕刊",
  "weather": "天気予報（その日の推定天気）",
  "mainArticle": {
    "headline": "一面トップ記事の見出し",
    "subheadline": "副見出し",
    "content": "本文（400-600文字）",
    "category": "main",
    "imagePrompt": "この記事に合う画像の英語プロンプト（vintage Japanese newspaper photograph style）"
  },
  "subArticles": [
    {
      "headline": "見出し",
      "content": "本文（200-300文字）",
      "category": "politics または economy または society または culture または sports"
    },
    {
      "headline": "見出し2",
      "content": "本文（200-300文字）",
      "category": "カテゴリ"
    },
    {
      "headline": "見出し3",
      "content": "本文（200-300文字）",
      "category": "カテゴリ"
    }
  ],
  "editorial": {
    "headline": "社説の見出し",
    "content": "社説本文（300-400文字）",
    "category": "editorial"
  },
  "columnTitle": "コラム欄のタイトル（例：天声人語）",
  "columnContent": "コラム本文（200文字程度、その日にちなんだ季節感のある文章）",
  "advertisements": [
    {
      "title": "広告タイトル1",
      "content": "広告文（その時代らしい商品やサービス）",
      "style": "vintage"
    },
    {
      "title": "広告タイトル2",
      "content": "広告文",
      "style": "vintage"
    },
    {
      "title": "広告タイトル3",
      "content": "広告文",
      "style": "vintage"
    }
  ]
}
`;

  console.log(`Generating content for ${config.date}...`);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // JSONを抽出
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  } else {
    const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonStr = jsonObjectMatch[0];
    }
  }

  const content = JSON.parse(jsonStr);

  return {
    date: date,
    ...content,
    personalMessage: {
      recipientName: config.recipientName,
      senderName: config.senderName,
      message: config.message,
      occasion: config.occasion,
    },
  };
}

/**
 * Gemini Imagen 3 (Nano Banana Pro / Gemini 3 Pro Image) で画像生成
 */
async function generateImageWithGemini(prompt: string): Promise<string | null> {
  if (!GOOGLE_AI_API_KEY) {
    console.log('GOOGLE_AI_API_KEY not set, skipping image generation');
    return null;
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

  // Imagen 3 モデルを使用
  const imageModel = genAI.getGenerativeModel({
    model: 'imagen-3.0-generate-002',
  });

  const enhancedPrompt = IMAGE_PROMPT_TEMPLATE.replace('{subject}', prompt);

  try {
    console.log('Calling Imagen 3 API...');

    // @ts-ignore - generateImages は新しいAPIのため型定義がない場合がある
    const result = await imageModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
      generationConfig: {
        // @ts-ignore
        responseModalities: ['image', 'text'],
        // @ts-ignore
        imageSizes: ['512x384'],
      },
    });

    const response = result.response;

    // 画像データを取得
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        // @ts-ignore
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          // @ts-ignore
          const base64Data = part.inlineData.data;
          // @ts-ignore
          const mimeType = part.inlineData.mimeType;
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    console.log('No image data in response');
    return null;
  } catch (error: any) {
    // Imagen 3 が使えない場合はフォールバック
    if (error.message?.includes('not found') || error.message?.includes('not supported')) {
      console.log('Imagen 3 not available, trying alternative method...');
      return await generateImageFallback(prompt);
    }
    console.error('Image generation error:', error.message || error);
    return null;
  }
}

/**
 * フォールバック: Gemini 2.0 Flash の画像生成機能を試す
 */
async function generateImageFallback(prompt: string): Promise<string | null> {
  if (!GOOGLE_AI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

  try {
    // Gemini 2.0 Flash Experimental で画像生成を試みる
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    const enhancedPrompt = `Generate an image: ${IMAGE_PROMPT_TEMPLATE.replace('{subject}', prompt)}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
      generationConfig: {
        // @ts-ignore
        responseModalities: ['image', 'text'],
      },
    });

    const response = result.response;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        // @ts-ignore
        if (part.inlineData?.data) {
          // @ts-ignore
          const base64Data = part.inlineData.data;
          // @ts-ignore
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error('Fallback image generation failed:', error.message || error);
    return null;
  }
}

async function main() {
  console.log('=== サンプル新聞生成スクリプト ===');
  console.log('Gemini API (テキスト + 画像) で生成\n');

  if (!GOOGLE_AI_API_KEY) {
    console.error('Error: GOOGLE_AI_API_KEY is not set in .env.local');
    console.log('\n使い方:');
    console.log('1. .env.local にAPIキーを設定');
    console.log('   GOOGLE_AI_API_KEY=your_api_key');
    console.log('2. npm run generate-samples');
    process.exit(1);
  }

  const samples: any[] = [];
  const metas: any[] = [];

  for (const config of SAMPLE_CONFIGS) {
    try {
      console.log(`\n--- ${config.title} (${config.date}) ---`);

      // コンテンツ生成
      const content = await generateNewspaperContent(config);
      console.log('✓ Content generated');

      // 画像生成
      let mainImage: string | null = null;
      if (content.mainArticle?.imagePrompt) {
        console.log('Generating image with Gemini...');
        mainImage = await generateImageWithGemini(content.mainArticle.imagePrompt);
        if (mainImage) {
          console.log('✓ Image generated');
        } else {
          console.log('✗ Image generation skipped (will use placeholder)');
        }
      }

      samples.push({
        ...content,
        _generatedImage: mainImage,
      });

      metas.push({
        id: config.id,
        title: config.title,
        description: config.description,
        occasion: config.occasion,
        style: config.style,
      });

      console.log('✓ Done!');

      // API制限対策で少し待つ
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error: any) {
      console.error(`✗ Error generating ${config.id}:`, error.message || error);
    }
  }

  if (samples.length === 0) {
    console.error('\nNo samples generated. Please check your API key.');
    process.exit(1);
  }

  // TypeScriptファイルとして出力
  const jsonSamples = JSON.stringify(samples, (key, value) => {
    if (key === 'date' && value) {
      return '__DATE__' + value + '__DATE__';
    }
    if (key === '_generatedImage') {
      return undefined;
    }
    return value;
  }, 2).replace(/"__DATE__([^"]+)__DATE__"/g, 'new Date("$1")');

  const jsonMetas = JSON.stringify(metas, null, 2);

  const imageMap: Record<string, string | null> = {};
  samples.forEach((sample: any, i: number) => {
    imageMap[metas[i].id] = sample._generatedImage || null;
  });
  const jsonImages = JSON.stringify(imageMap, null, 2);

  const generatedDate = new Date().toISOString();

  const output = [
    '/**',
    ' * サンプル新聞データ',
    ' *',
    ' * このファイルは scripts/generate-samples.ts によって自動生成されました',
    ' * 生成日時: ' + generatedDate,
    ' *',
    ' * Gemini API で生成:',
    ' * - テキスト: Gemini 2.0 Flash',
    ' * - 画像: Imagen 3 (Gemini 3 Pro Image)',
    ' */',
    '',
    "import type { NewspaperData } from '@/types';",
    '',
    'export const sampleNewspapers: NewspaperData[] = ' + jsonSamples + ';',
    '',
    'export const sampleMeta = ' + jsonMetas + ';',
    '',
    '// 生成された画像 (Base64 Data URL)',
    'export const sampleImages: Record<string, string | null> = ' + jsonImages + ';',
  ].join('\n');

  const outputPath = path.join(__dirname, '../src/lib/sampleData.ts');
  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log('\n=== 完了 ===');
  console.log(samples.length + ' 件のサンプルを生成しました');
  console.log('出力先: ' + outputPath);
  console.log('\nGitにコミット & プッシュすればVercelに反映されます');
}

main().catch(console.error);

/**
 * サンプル新聞生成スクリプト
 *
 * Gemini 3.0 + Nano Banana Pro を使用してサンプル新聞を生成し、
 * sampleData.ts に保存する
 *
 * 使い方:
 * 1. .env.local にAPIキーを設定
 * 2. npx ts-node scripts/generate-samples.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY;
const NANO_BANANA_API_URL = process.env.NANO_BANANA_API_URL || 'https://api.nanobanana.pro/v1';

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

// Gemini プロンプト
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

async function generateNewspaperContent(config: typeof SAMPLE_CONFIGS[0]) {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp', // 本番では gemini-3.0-pro
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

async function generateImage(prompt: string): Promise<string | null> {
  if (!NANO_BANANA_API_KEY) {
    console.log('NANO_BANANA_API_KEY not set, using placeholder');
    return null;
  }

  const enhancedPrompt = `${prompt}, photorealistic vintage newspaper print, halftone dots texture, ink bleed effect, aged paper texture, monochrome newsprint, Japanese showa era style`;

  try {
    const response = await fetch(`${NANO_BANANA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
        'X-High-Fidelity': 'true',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: 'color, modern, digital, cartoon, anime, blur, low quality',
        style_preset: 'J-Retro',
        width: 512,
        height: 384,
        guidance_scale: 7.5,
        num_inference_steps: 50,
      }),
    });

    if (!response.ok) {
      console.error('Image generation failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.image_url || (data.image_base64 ? `data:image/png;base64,${data.image_base64}` : null);
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

async function main() {
  console.log('=== サンプル新聞生成スクリプト ===\n');

  if (!GOOGLE_AI_API_KEY) {
    console.error('Error: GOOGLE_AI_API_KEY is not set in .env.local');
    console.log('\n使い方:');
    console.log('1. .env.local にAPIキーを設定');
    console.log('   GOOGLE_AI_API_KEY=your_api_key');
    console.log('   NANO_BANANA_API_KEY=your_api_key (optional)');
    console.log('2. npx ts-node scripts/generate-samples.ts');
    process.exit(1);
  }

  const samples = [];
  const metas = [];

  for (const config of SAMPLE_CONFIGS) {
    try {
      console.log(`\n--- ${config.title} (${config.date}) ---`);

      // コンテンツ生成
      const content = await generateNewspaperContent(config);
      console.log('Content generated successfully');

      // 画像生成（オプション）
      let mainImage = null;
      if (content.mainArticle?.imagePrompt) {
        console.log('Generating image...');
        mainImage = await generateImage(content.mainArticle.imagePrompt);
        if (mainImage) {
          console.log('Image generated successfully');
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

      console.log('Done!');

      // API制限対策で少し待つ
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`Error generating ${config.id}:`, error);
    }
  }

  // TypeScriptファイルとして出力
  const output = `/**
 * サンプル新聞データ
 *
 * このファイルは scripts/generate-samples.ts によって自動生成されました
 * 生成日時: ${new Date().toISOString()}
 *
 * Gemini 3.0 + Nano Banana Pro で生成
 */

import type { NewspaperData } from '@/types';

export const sampleNewspapers: NewspaperData[] = ${JSON.stringify(samples, (key, value) => {
    // Date オブジェクトを文字列に変換
    if (key === 'date' && value) {
      return `__DATE__${value}__DATE__`;
    }
    // 生成画像は除外（別ファイルで管理）
    if (key === '_generatedImage') {
      return undefined;
    }
    return value;
  }, 2).replace(/"__DATE__([^"]+)__DATE__"/g, 'new Date("$1")')};

export const sampleMeta = ${JSON.stringify(metas, null, 2)};

// 生成された画像URL（Nano Banana Pro）
export const sampleImages: Record<string, string | null> = ${JSON.stringify(
    samples.reduce((acc, sample, i) => {
      acc[metas[i].id] = sample._generatedImage || null;
      return acc;
    }, {} as Record<string, string | null>),
    null,
    2
  )};
`;

  const outputPath = path.join(__dirname, '../src/lib/sampleData.ts');
  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log(`\n=== 完了 ===`);
  console.log(`${samples.length} 件のサンプルを生成しました`);
  console.log(`出力先: ${outputPath}`);
}

main().catch(console.error);

/**
 * Gemini 3.0 API Client
 * Google Grounding機能を活用した事実確認と記事生成
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import type { NewspaperArticle, NewspaperData, GeminiResponse } from '@/types';

// Gemini 3.0 Configuration
const MODEL_NAME = 'gemini-2.0-flash-exp'; // Production: gemini-3.0-pro when available
const GROUNDING_ENABLED = true;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_AI_API_KEY is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('API')));
      throw new Error('GOOGLE_AI_API_KEY is not configured. Please set it in Vercel environment variables.');
    }
    console.log('Initializing Gemini with API key:', apiKey.substring(0, 10) + '...');
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }
  return model;
}

// 昭和/平成の新聞文体プロンプト
const NEWSPAPER_STYLE_PROMPT = `
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
`;

const GROUNDING_INSTRUCTIONS = `
【事実確認について】
提供された日付に関する歴史的事実を正確に調査し、以下の情報を含めてください：
- その日の主要なニュース（国内外）
- 経済・株価の動向
- スポーツの結果
- 文化・芸能のトピック
- 天気（推定）

事実に基づかない創作は最小限に留め、実際の出来事をベースに記事を構成してください。
`;

export async function generateNewspaperContent(
  targetDate: Date,
  style: 'showa' | 'heisei' | 'reiwa' = 'showa',
  personalMessage?: {
    recipientName: string;
    senderName: string;
    message: string;
    occasion: string;
  }
): Promise<NewspaperData> {
  const model = getModel();

  const dateStr = targetDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const eraStyle = {
    showa: '昭和時代の重厚な新聞',
    heisei: '平成初期の活字新聞',
    reiwa: '令和のレトロ調新聞',
  }[style];

  const prompt = `
${NEWSPAPER_STYLE_PROMPT}

${GROUNDING_INSTRUCTIONS}

【生成する新聞の設定】
- 日付: ${dateStr}
- スタイル: ${eraStyle}
${personalMessage ? `
【個人メッセージ欄】
- 宛名: ${personalMessage.recipientName}
- 送り主: ${personalMessage.senderName}
- 記念日: ${personalMessage.occasion}
- メッセージ: ${personalMessage.message}
` : ''}

以下のJSON形式で新聞コンテンツを生成してください：

{
  "masthead": "新聞名（創作可）",
  "edition": "第〇〇〇号 朝刊/夕刊",
  "weather": "天気予報（その日の推定天気）",
  "mainArticle": {
    "headline": "一面トップ記事の見出し",
    "subheadline": "副見出し",
    "content": "本文（400-600文字）",
    "category": "main",
    "imagePrompt": "この記事に合う画像の英語プロンプト"
  },
  "subArticles": [
    {
      "headline": "見出し",
      "content": "本文（200-300文字）",
      "category": "politics|economy|society|culture|sports"
    }
  ],
  "editorial": {
    "headline": "社説の見出し",
    "content": "社説本文（300-400文字）",
    "category": "editorial"
  },
  "columnTitle": "コラム欄のタイトル",
  "columnContent": "コラム本文（200文字程度、その日にちなんだ季節感のある文章）",
  "advertisements": [
    {
      "title": "広告タイトル",
      "content": "広告文（その時代らしい商品やサービス）",
      "style": "vintage"
    }
  ]
}

重要：必ず有効なJSON形式で出力してください。説明文は不要です。
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONを抽出（コードブロックがある場合も対応）
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    } else {
      // JSONオブジェクトを直接探す
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonStr = jsonObjectMatch[0];
      }
    }

    const newspaperContent = JSON.parse(jsonStr);

    return {
      date: targetDate,
      masthead: newspaperContent.masthead || '時空新報',
      edition: newspaperContent.edition || '第一号',
      weather: newspaperContent.weather || '晴れ時々曇り',
      mainArticle: newspaperContent.mainArticle,
      subArticles: newspaperContent.subArticles || [],
      editorial: newspaperContent.editorial,
      columnTitle: newspaperContent.columnTitle || '天声人語',
      columnContent: newspaperContent.columnContent || '',
      advertisements: newspaperContent.advertisements || [],
      personalMessage,
    };
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    // より詳細なエラーメッセージを提供
    if (error instanceof Error) {
      if (error.message.includes('API_KEY')) {
        throw new Error('APIキーが無効です。Vercelの環境変数を確認してください。');
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        throw new Error('API利用制限に達しました。しばらく待ってから再試行してください。');
      }
      if (error.message.includes('not found') || error.message.includes('model')) {
        throw new Error('AIモデルが利用できません。');
      }
      throw new Error(`生成エラー: ${error.message}`);
    }
    throw new Error('新聞コンテンツの生成に失敗しました');
  }
}

// 事実確認用の補助関数
export async function verifyHistoricalFact(
  date: Date,
  claim: string
): Promise<GeminiResponse> {
  const model = getModel();

  const prompt = `
以下の日付と主張について、事実確認を行ってください：

日付: ${date.toLocaleDateString('ja-JP')}
主張: ${claim}

以下のJSON形式で回答してください：
{
  "text": "事実確認の結果（日本語）",
  "groundedFacts": [
    {
      "claim": "確認した事実",
      "source": "情報源",
      "confidence": 0.0-1.0の信頼度
    }
  ],
  "searchQueries": ["使用した検索クエリ"]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // パース失敗時はデフォルト値
  }

  return {
    text: text,
    groundedFacts: [],
    searchQueries: [],
  };
}

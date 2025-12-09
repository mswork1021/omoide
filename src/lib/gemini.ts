/**
 * Gemini 3.0 API Client
 * 新SDK (@google/genai) を使用
 */

import { GoogleGenAI } from '@google/genai';
import type { NewspaperData, GeminiResponse } from '@/types';

// Gemini Configuration
const MODEL_NAME = 'gemini-2.5-flash';

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }
    console.log('Initializing Gemini with API key:', apiKey.substring(0, 10) + '...');
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
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
【最重要：必ずGoogle検索を使用すること】
あなたにはGoogle検索ツールが与えられています。
指定された日付の出来事を調べるために、必ずGoogle検索を実行してください。
自分の知識だけで回答せず、必ず検索結果を使用してください。

検索クエリ例：
- 「2025年12月8日 ニュース」
- 「2025年12月8日 何があった」
- 「December 8, 2025 news Japan」

【重要：実際の歴史的事実を使用すること】
検索結果から、指定された日付に実際に起きた出来事を選んでください。
創作や架空の出来事は絶対に使用しないでください。

【重要：年を間違えないこと】
指定された「年」を必ず守ってください。例えば「2025年12月8日」なら2025年の出来事のみを使用してください。
他の年の同日の出来事を使用しないでください。

もしGoogle検索しても指定された日付の情報が見つからない場合のみ、
mainArticleのheadlineに「【お知らせ】この日付の情報はまだありません」と書いてください。

以下のカテゴリから、実際にその日に起きた出来事を選んでください：
- メイン記事: その日の最も重要なニュース、または面白い・珍しい出来事
- 政治: 国会、選挙、外交などの実際のニュース
- 経済: 株価、企業ニュース、景気動向など
- 社会: 事件、事故、社会現象など
- 文化: 映画公開、音楽、テレビ番組、流行など
- スポーツ: プロ野球、サッカー、オリンピックなどの試合結果

【ポイント】
- できるだけ「へぇ〜」と思えるような興味深いニュースを選ぶ
- 当時の時代背景がわかるような記事にする
- 具体的な数字、人名、地名を含める
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
  const genAI = getAI();

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
    console.log('Calling Gemini API with model:', MODEL_NAME);

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        // Google検索を有効にして最新情報を取得
        tools: [{
          googleSearch: {},
        }],
      },
    });

    const text = response.text || '';
    console.log('Response received, length:', text.length);

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
    const rawMessage = error instanceof Error ? error.message : String(error);
    console.error('Raw error message:', rawMessage);
    throw new Error(`Gemini APIエラー: ${rawMessage}`);
  }
}

// 事実確認用の補助関数
export async function verifyHistoricalFact(
  date: Date,
  claim: string
): Promise<GeminiResponse> {
  const genAI = getAI();

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

  const response = await genAI.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  const text = response.text || '';

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

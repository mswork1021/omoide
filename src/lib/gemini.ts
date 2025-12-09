/**
 * Gemini 3.0 API Client
 * 新SDK (@google/genai) を使用
 */

import { GoogleGenAI } from '@google/genai';
import type { NewspaperData, GeminiResponse } from '@/types';

// Gemini Configuration
const MODEL_NAME = 'gemini-2.5-pro';

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

// 記事選択ガイドライン
const ARTICLE_GUIDELINES = `
【記事選択のポイント】
- 「へぇ〜」「面白い！」「すごい！」と思えるニュースだけを選ぶ
- 芸能・エンタメ・珍事件・ユニークな出来事を積極的に採用
- 暗いニュース、事故、事件は避ける
- 具体的な数字、人名を含める
- 政治・経済・社会の堅いニュースは不要
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

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();

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

  // 検索を確実に実行させるためのシステム指示
  const systemInstruction = `あなたはGoogle検索を活用する新聞記者AIです。
ユーザーから日付を指定されたら、必ずGoogle検索を実行してその日の実際のニュースを調べてください。
検索せずに回答することは禁止されています。必ず検索結果に基づいて回答してください。`;

  // 検索を誘発するプロンプト構造
  const prompt = `【検索リクエスト】
${year}年${month}月${day}日（${dateStr}）の日本のニュースをGoogle検索で調べてください。

検索すべき内容：
1. 「${year}年${month}月${day}日 ニュース 話題」で検索
2. 「${year}年${month}月${day}日 芸能」で検索
3. 「${year}年${month}月${day}日 スポーツ」で検索
4. 「${year}年${month}月 エンタメ」で検索

検索結果から面白いニュース（芸能・スポーツ・エンタメ・珍ニュース）を選び、
以下のJSON形式でレトロ新聞記事として出力してください。

${ARTICLE_GUIDELINES}

${NEWSPAPER_STYLE_PROMPT}

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

【出力形式 - 必ずこのJSON形式で出力】
{
  "masthead": "新聞名（創作可）",
  "edition": "第〇〇〇号 朝刊/夕刊",
  "weather": "天気予報（その日の推定天気）",
  "mainArticle": {
    "headline": "検索で見つけた面白いニュースの見出し",
    "subheadline": "副見出し",
    "content": "本文（400-600文字）- 検索結果に基づく事実",
    "category": "main",
    "imagePrompt": "A photograph of [具体的な場面を英語で]"
  },
  "subArticles": [
    {
      "headline": "芸能ニュース見出し（検索結果から）",
      "content": "本文（200-300文字）",
      "category": "celebrity",
      "imagePrompt": "A photograph of [具体的な場面を英語で]"
    },
    {
      "headline": "スポーツニュース見出し（検索結果から）",
      "content": "本文（200-300文字）",
      "category": "sports",
      "imagePrompt": "A photograph of [具体的な場面を英語で]"
    },
    {
      "headline": "エンタメニュース見出し（検索結果から）",
      "content": "本文（200-300文字）",
      "category": "entertainment",
      "imagePrompt": "A photograph of [具体的な場面を英語で]"
    }
  ],
  "editorial": {
    "headline": "その日の面白トピックについてのコラム見出し",
    "content": "コラム本文（300-400文字）",
    "category": "column"
  },
  "columnTitle": "豆知識コーナー",
  "columnContent": "その日に関する面白い豆知識（200文字程度）",
  "advertisements": [
    { "title": "広告1", "content": "その時代らしい広告文", "style": "vintage" },
    { "title": "広告2", "content": "その時代らしい広告文", "style": "vintage" },
    { "title": "広告3", "content": "その時代らしい広告文", "style": "vintage" }
  ]
}

【重要ルール】
- 必ずGoogle検索を実行して実際のニュースを使用すること
- 政治・経済・社会の堅いニュースは不要。面白いニュースのみ
- subArticlesは必ず3つ生成すること
- 各記事には必ずimagePromptを含めること
- 有効なJSON形式のみ出力。説明文は不要
`;

  try {
    console.log('Calling Gemini API with model:', MODEL_NAME);
    console.log('Target date:', dateStr);

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        // システム指示で検索を強制
        systemInstruction: systemInstruction,
        // Google検索ツールを有効化
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

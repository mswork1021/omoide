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

// フォールバック新聞コンテンツを生成（API応答がJSONでない場合）
function generateFallbackContent(year: number, month: number, day: number, dateStr: string, eraStyle: string) {
  return {
    masthead: '時空新報',
    edition: `第${Math.floor(Math.random() * 9000) + 1000}号 朝刊`,
    weather: '晴れ時々曇り',
    mainArticle: {
      headline: `${year}年${month}月${day}日の話題をお届けします`,
      subheadline: `${eraStyle}風にお届け`,
      content: `${year}年${month}月${day}日。この日、日本各地で様々な出来事があった。当時の人々は、日々の暮らしの中で喜びや驚きを見出していたのである。時代の空気を感じながら、当時のニュースを振り返ってみよう。この日の出来事は、後の時代にも語り継がれることとなった。`,
      category: 'main',
      imagePrompt: 'A vintage Japanese newspaper photograph from the past, showing daily life scene'
    },
    subArticles: [
      {
        headline: '芸能界の話題',
        content: '当時の芸能界では、様々なスターたちが活躍していた。テレビや映画、音楽の世界で新しい才能が次々と登場し、人々を楽しませていたのである。',
        category: 'celebrity',
        imagePrompt: 'A photograph of Japanese entertainment scene, vintage style'
      },
      {
        headline: 'スポーツの祭典',
        content: '日本のスポーツ界では、選手たちが日々鍛錬を重ねていた。勝利の喜び、敗北の悔しさ、そして再起への決意。アスリートたちの姿は、多くの人々に感動を与えた。',
        category: 'sports',
        imagePrompt: 'A photograph of Japanese sports event, vintage newspaper style'
      },
      {
        headline: 'エンタメニュース',
        content: '当時の娯楽は、テレビ番組や映画、音楽など多岐にわたっていた。新作映画の公開や、人気歌手の新曲発表など、エンターテインメントの話題が尽きることはなかった。',
        category: 'entertainment',
        imagePrompt: 'A photograph of Japanese entertainment event, vintage style'
      }
    ],
    editorial: {
      headline: '時代を振り返って',
      content: `${year}年という時代は、日本にとって様々な変化の時期であった。社会は大きく動き、人々の暮らしも少しずつ変わっていった。しかし、人々の笑顔や希望は変わることなく、明日への活力となっていたのである。`,
      category: 'column'
    },
    columnTitle: '今日の豆知識',
    columnContent: `${month}月${day}日は、歴史的にも様々な出来事があった日である。過去を振り返りながら、今日という日の意味を考えてみるのも良いであろう。`,
    advertisements: [
      { title: '昔ながらの味', content: '伝統の製法で作る、懐かしい味わい', style: 'vintage' },
      { title: '新発売', content: '時代を彩る新商品、ただいま好評発売中', style: 'vintage' },
      { title: 'お得な情報', content: '皆様のご来店をお待ちしております', style: 'vintage' }
    ]
  };
}

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

【最重要 - 投稿日と発生日の違いを理解すること】
ニュース記事には「投稿日（記事が書かれた日）」と「発生日（出来事が起きた日）」があります。
あなたが使うべきは「発生日が${year}年${month}月${day}日」の出来事です。

例えば${month}月${day}日のニュース記事に「昨日○○が起きた」と書いてあれば、
それは${month}月${day - 1}日の出来事なので使用禁止です。

【使用OK】${year}年${month}月${day}日に発生・開催・発売・公開された出来事
【使用NG】${year}年${month}月${day}日に投稿されたが、前日以前の出来事を報じた記事

【出力形式】
- 出力はJSON形式のみ。説明文は一切禁止
- 最初の文字は必ず { で始めること`;

  // 英語の日付フォーマット
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const englishDate = `${monthNames[month - 1]} ${day}, ${year}`;

  // 検索を誘発するプロンプト構造
  const prompt = `【検索リクエスト - ${year}年${month}月${day}日に起きた出来事を検索】

以下の検索クエリを実行して、${year}年${month}月${day}日に「起きた」出来事を調べてください：

【重要な注意】
ニュース記事の「投稿日」ではなく、出来事が「発生した日」を確認すること。
例：12月2日に投稿された「12月1日の試合結果」は、12月1日の出来事として使用OK
例：12月1日に投稿された「11月30日の事件」は、11月30日の出来事なので使用NG

【日本語検索 - 出来事にフォーカス】
- 「${year}年${month}月${day}日 何があった」
- 「${month}月${day}日 出来事 ${year}年」
- 「${year}年${month}月${day}日 試合結果」
- 「${year}年${month}月${day}日 発売」
- 「${year}年${month}月${day}日 公開」
- 「${year}年${month}月${day}日 イベント」

【英語検索】
- "on ${englishDate}" (その日に起きた)
- "${englishDate} happened"
- "events of ${englishDate}"

【絶対厳守ルール - 出来事の発生日チェック】
★★★ ${year}年${month}月${day}日に「発生した」出来事のみ使用可能 ★★★

OK例:
- ${month}月${day}日に行われた試合 → OK
- ${month}月${day}日に発売された商品 → OK
- ${month}月${day}日に公開された映画 → OK
- ${month}月${day}日に開催されたイベント → OK

NG例:
- ${month}月${day}日に投稿された「前日の出来事」の記事 → NG
- ${month}月${day - 1}日に起きた出来事 → NG
- ${month}月${day + 1}日に起きた出来事 → NG

記事の投稿日ではなく、出来事の発生日を必ず確認すること。
小さなニュースでも構わないので、必ず${month}月${day}日に発生した出来事を使うこと。

検索結果から${year}年${month}月${day}日に発生した出来事を選び、レトロ新聞記事として出力してください。

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
※全ての記事は${year}年${month}月${day}日に起きた出来事のみ

{
  "masthead": "新聞名（創作可）",
  "edition": "第〇〇〇号 朝刊/夕刊",
  "weather": "天気予報（その日の推定天気）",
  "mainArticle": {
    "headline": "${month}月${day}日に起きた出来事の見出し",
    "subheadline": "副見出し",
    "content": "本文（400-600文字）- ${month}月${day}日の検索結果に基づく事実のみ",
    "category": "main",
    "imagePrompt": "A photograph of [具体的な場面を英語で]"
  },
  "subArticles": [
    {
      "headline": "${month}月${day}日の芸能ニュース見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
      "category": "celebrity",
      "imagePrompt": "A photograph of [具体的な場面を英語で]"
    },
    {
      "headline": "${month}月${day}日のスポーツニュース見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
      "category": "sports",
      "imagePrompt": "A photograph of [具体的な場面を英語で]"
    },
    {
      "headline": "${month}月${day}日のエンタメニュース見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
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
        // 注意: responseMimeType と tools は同時に使えない
        tools: [{
          googleSearch: {},
        }],
      },
    });

    const text = response.text || '';
    console.log('Response received, length:', text.length);
    console.log('Response preview:', text.substring(0, 200));

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

    // JSONパースを試みる
    let newspaperContent;
    try {
      newspaperContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse failed, response was:', text.substring(0, 500));
      // JSONではない応答の場合、フォールバック新聞を生成
      console.log('Generating fallback newspaper content...');
      newspaperContent = generateFallbackContent(year, month, day, dateStr, eraStyle);
    }

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

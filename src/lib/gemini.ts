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
  const systemInstruction = `あなたは新聞記者AIです。Google検索で実際の情報を調べて記事を書きます。

【最重要ルール - 絶対厳守】
1. 検索結果に基づく事実のみを書くこと
2. 検索で確認できない情報は絶対に書かないこと
3. 推測・創作・でっち上げは禁止
4. 映画・ゲーム・CDの発売日は検索で確認してから書くこと
5. 「〜かもしれない」「〜と思われる」ではなく、確認できた事実のみ

【日付ルール】
- ${year}年${month}月${day}日に実際に起きた出来事のみを使用
- 日付が1日でもずれている情報は使用禁止

【禁止事項】
- 検索で見つからなかった出来事を創作すること
- 実際の発売日・公開日と異なる日付で報道すること
- 存在しない映画・ゲーム・イベントをでっち上げること

出力はJSON形式のみ。最初の文字は { で始めること。`;

  // 英語の日付フォーマット
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const englishDate = `${monthNames[month - 1]} ${day}, ${year}`;

  // 翌日の日付（翌日の記事にはその日の出来事が載っている）
  const nextDay = new Date(year, month - 1, day + 1);
  const nextYear = nextDay.getFullYear();
  const nextMonth = nextDay.getMonth() + 1;
  const nextDayNum = nextDay.getDate();

  // 検索を誘発するプロンプト構造
  // ※「投稿日」ではなく「出来事の日付」として検索する
  const prompt = `${year}年${month}月${day}日に起きた出来事を検索して新聞を作成してください。

【検索クエリ - 「${month}月${day}日」が出来事の日付として含まれる記事を探す】
- 「${month}月${day}日に発売 ${year}」
- 「${month}月${day}日に公開 ${year}」
- 「${month}月${day}日に開催 ${year}」
- 「${month}月${day}日 試合 ${year}」
- 「${month}月${day}日 ライブ ${year}」
- 「${month}月${day}日 イベント ${year}」
- 「${year}年${month}月${day}日 誕生日 芸能人」
- "${englishDate} release"
- "${englishDate} event"

【重要】
ニュースサイトの「投稿日」ではなく、記事の中に「${month}月${day}日に○○した」と書いてある出来事を探すこと。

例えば「${month}月${day}日に新曲を発売」「${month}月${day}日に試合が行われた」のように、
${month}月${day}日が出来事の発生日として明記されているものを使うこと。

【絶対禁止】
- 「${month}月${day - 1}日に○○した」という出来事 → NG
- 記事の投稿日が${month}月${day}日でも、内容が前日の出来事なら → NG

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
    "headline": "その日一番面白い出来事の見出し",
    "subheadline": "副見出し",
    "content": "本文（400-600文字）- ${month}月${day}日の検索結果に基づく事実のみ",
    "category": "ジャンル名（自由：芸能、音楽、映画、アニメ、ゲーム、スポーツ、グルメ、ファッション、科学、珍事件、話題など何でもOK）",
    "imagePrompt": "A photograph of [具体的な場面を英語で詳しく]"
  },
  "subArticles": [
    {
      "headline": "2番目に面白い出来事の見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
      "category": "ジャンル名（自由）",
      "imagePrompt": "A photograph of [具体的な場面を英語で詳しく]"
    },
    {
      "headline": "3番目に面白い出来事の見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
      "category": "ジャンル名（自由）",
      "imagePrompt": "A photograph of [具体的な場面を英語で詳しく]"
    },
    {
      "headline": "4番目に面白い出来事の見出し",
      "content": "本文（200-300文字）- その日の出来事のみ",
      "category": "ジャンル名（自由）",
      "imagePrompt": "A photograph of [具体的な場面を英語で詳しく]"
    }
  ],
  "editorial": {
    "headline": "社説の見出し（メイン記事とは全く別のトピック）",
    "content": "社説本文（300-400文字）- メイン記事やサブ記事とは異なる話題を選ぶこと。例：その年の社会風潮、世相、若者文化、技術の進歩、生活の変化など、ニュースではなく『時代の空気感』を論じる",
    "category": "column"
  },
  "columnTitle": "豆知識コーナー",
  "columnContent": "その日に関する面白い豆知識（200文字程度）",
  "advertisements": [
    { "title": "商品名（その時代に実際に流行していた商品・サービス名）", "content": "当時の広告コピー風の文章", "style": "時代に合わせたスタイル" },
    { "title": "商品名（その時代に実際に流行していた商品・サービス名）", "content": "当時の広告コピー風の文章", "style": "時代に合わせたスタイル" },
    { "title": "商品名（その時代に実際に流行していた商品・サービス名）", "content": "当時の広告コピー風の文章", "style": "時代に合わせたスタイル" }
  ]
}

【重要ルール - 嘘禁止】
- 必ずGoogle検索を実行して、検索結果に基づく事実のみを使用すること
- 検索で見つからない出来事は書かない（創作禁止）
- 映画・ゲーム・CDなどの発売日は必ず検索で確認すること
- 「○月○日に公開」と書く場合、その日付が正しいか検索で確認すること
- 確認できない情報は書かないこと
- subArticlesは必ず3つ生成すること（検索で3つ見つからない場合は、その年の一般的な話題を使用）
- 各記事には必ずimagePromptを含めること
- 有効なJSON形式のみ出力。説明文は不要

【社説（editorial）について】
- メイン記事・サブ記事とは完全に別のトピックを選ぶこと
- ニュースの報道ではなく、その時代の「空気感」「世相」「文化」について論じる
- 例：「若者の間で○○が流行」「家庭にテレビが普及し」「バブル景気の影響で」など

【広告（advertisements）について】
- その時代に実際に存在した商品・サービス・企業を検索して使用すること
- 例：昭和→「三ツ矢サイダー」「ナショナル」「グリコ」、平成→「たまごっち」「プレイステーション」「ポケベル」
- 架空の商品名は使わず、実在した商品のリアルな広告風にすること
`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{
          googleSearch: {},
        }],
      },
    });

    const text = response.text || '';

    // Google Search が実行されたか確認
    // @ts-ignore - 型定義
    const candidates = response.candidates;
    // @ts-ignore
    const groundingMetadata = candidates?.[0]?.groundingMetadata || response.groundingMetadata;
    const searchExecuted = !!groundingMetadata;
    const sourcesCount = groundingMetadata?.groundingChunks?.length || groundingMetadata?.searchEntryPoint ? 1 : 0;
    console.log(`[GEMINI] ${dateStr} | Search: ${searchExecuted ? 'YES' : 'NO'} | Sources: ${sourcesCount}`);

    // デバッグ: レスポンスのキーを確認
    if (!searchExecuted) {
      // @ts-ignore
      console.log(`[GEMINI] Response keys:`, Object.keys(response || {}));
    }

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

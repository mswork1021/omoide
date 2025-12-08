/**
 * Gemini 2.5 Flash Image (Nano Banana Pro) API Client
 * ヴィンテージ新聞画像生成
 *
 * 新SDK (@google/genai) + gemini-2.5-flash-image を使用
 */

import { GoogleGenAI } from '@google/genai';
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// 画像生成モデル
const IMAGE_MODEL = 'gemini-2.5-flash-image';

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

// スタイルプリセット定義（プロンプト修飾子として使用）
const STYLE_MODIFIERS = {
  'vintage-newspaper': [
    'photorealistic vintage newspaper print',
    'halftone dots texture',
    'ink bleed effect',
    'aged paper texture',
    'monochrome newsprint',
    'Japanese showa era style',
  ],
  'halftone': [
    'classic halftone pattern',
    'newspaper dot matrix',
    'vintage print quality',
    'grayscale tones',
  ],
  'ink-bleed': [
    'ink bleeding on paper',
    'organic ink spread',
    'vintage letterpress effect',
    'paper fiber absorption',
  ],
};

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    if (!GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }
    ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });
  }
  return ai;
}

/**
 * Gemini 2.5 Flash Image を使用して画像を生成
 */
export async function generateNewspaperImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  // APIキーが未設定の場合はプレースホルダーを返す
  if (!GOOGLE_AI_API_KEY) {
    console.warn('GOOGLE_AI_API_KEY not configured. Using placeholder.');
    return {
      success: true,
      imageUrl: generatePlaceholderUrl(request.prompt, request.width || 512, request.height || 384),
    };
  }

  const styleModifiers = STYLE_MODIFIERS[request.style] || STYLE_MODIFIERS['vintage-newspaper'];
  const enhancedPrompt = buildEnhancedPrompt(request.prompt, styleModifiers);
  const fullPrompt = IMAGE_PROMPT_TEMPLATE.replace('{subject}', enhancedPrompt);

  try {
    console.log('Calling Gemini Image API with model:', IMAGE_MODEL);

    const genAI = getAI();
    const response = await genAI.models.generateContent({
      model: IMAGE_MODEL,
      contents: fullPrompt,
    });

    // レスポンスから画像データを抽出
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        for (const part of parts) {
          // @ts-ignore - inlineData の型定義
          if (part.inlineData) {
            // @ts-ignore
            const imageData = part.inlineData.data;
            // @ts-ignore
            const mimeType = part.inlineData.mimeType || 'image/png';
            console.log('Image generated successfully');
            return {
              success: true,
              imageUrl: `data:${mimeType};base64,${imageData}`,
            };
          }
        }
      }
    }

    // テキストのみの応答の場合
    console.log('No image in response, text:', response.text);
    return {
      success: false,
      error: 'No image generated in response',
    };
  } catch (error) {
    console.error('Image generation error:', error);
    const rawMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `画像生成エラー: ${rawMessage}`,
    };
  }
}

/**
 * 複数の画像を並列生成（Production用）
 */
export async function generateMultipleImages(
  prompts: string[],
  style: ImageGenerationRequest['style'] = 'vintage-newspaper'
): Promise<ImageGenerationResponse[]> {
  const requests = prompts.map((prompt) => ({
    prompt,
    style,
    highFidelity: true,
    width: 512,
    height: 384,
  }));

  // 並列実行で高速化
  const results = await Promise.all(
    requests.map((req) => generateNewspaperImage(req))
  );

  return results;
}

/**
 * プロンプトにスタイル修飾子を追加
 */
function buildEnhancedPrompt(basePrompt: string, modifiers: string[]): string {
  const modifierString = modifiers.join(', ');
  return `${basePrompt}, ${modifierString}`;
}

/**
 * プレースホルダー画像URLを生成（Preview用）
 */
function generatePlaceholderUrl(prompt: string, width: number, height: number): string {
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 30));
  return `https://placehold.co/${width}x${height}/1a1a1a/ffffff/png?text=${encodedPrompt}`;
}

/**
 * 新聞記事用の画像プロンプトを構築
 */
export function buildArticleImagePrompt(
  articleContent: string,
  era: 'showa' | 'heisei' | 'reiwa',
  category: string
): string {
  const eraStyles = {
    showa: '1960s-1980s Japanese',
    heisei: '1990s-2010s Japanese',
    reiwa: '2020s Japanese with retro filter',
  };

  const categorySubjects = {
    main: 'important news scene, crowd of people, significant event',
    politics: 'government building, political figure silhouette, official ceremony',
    economy: 'stock market board, business district, factory',
    society: 'daily life scene, community gathering, urban landscape',
    culture: 'traditional arts, performance, cultural event',
    sports: 'athletic competition, sports venue, victory moment',
    editorial: 'thoughtful composition, symbolic imagery, contemplative scene',
  };

  const subject = categorySubjects[category as keyof typeof categorySubjects] || categorySubjects.main;

  return `${eraStyles[era]} era newspaper photo, ${subject}, representing: ${articleContent.slice(0, 100)}`;
}

/**
 * APIの健全性チェック
 */
export async function checkApiHealth(): Promise<boolean> {
  if (!GOOGLE_AI_API_KEY) {
    return false;
  }

  try {
    const genAI = getAI();
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say OK',
    });
    return !!result.text;
  } catch {
    return false;
  }
}

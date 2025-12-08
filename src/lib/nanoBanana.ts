/**
 * Gemini Imagen 3 (Nano Banana Pro) API Client
 * ヴィンテージ新聞画像生成
 *
 * 実装: Gemini Imagen 3 (imagen-3.0-generate-002)
 * フォールバック: Gemini 2.0 Flash (画像生成モード)
 *
 * 特徴:
 * - モノクロ印刷の質感表現
 * - 網点処理（ハーフトーン）
 * - インクの滲み効果
 * - J-Retro スタイルプリセット
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

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

/**
 * Gemini Imagen 3 を使用して画像を生成
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

  try {
    // まず Imagen 3 を試す
    const result = await generateWithImagen3(enhancedPrompt);
    if (result) {
      return { success: true, imageUrl: result };
    }

    // フォールバック: Gemini 2.0 Flash
    const fallbackResult = await generateWithGeminiFlash(enhancedPrompt);
    if (fallbackResult) {
      return { success: true, imageUrl: fallbackResult };
    }

    return {
      success: false,
      error: 'Image generation failed with both Imagen 3 and Gemini Flash',
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}

/**
 * Imagen 3 で画像生成
 */
async function generateWithImagen3(prompt: string): Promise<string | null> {
  if (!GOOGLE_AI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  const imageModel = genAI.getGenerativeModel({
    model: 'imagen-3.0-generate-002',
  });

  const fullPrompt = IMAGE_PROMPT_TEMPLATE.replace('{subject}', prompt);

  try {
    console.log('Calling Imagen 3 API...');

    // @ts-ignore - 新しいAPIのため型定義がない場合がある
    const result = await imageModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
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

    return null;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
      console.log('Imagen 3 not available, will try fallback...');
      return null;
    }
    throw error;
  }
}

/**
 * フォールバック: Gemini 2.0 Flash の画像生成機能
 */
async function generateWithGeminiFlash(prompt: string): Promise<string | null> {
  if (!GOOGLE_AI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  });

  const fullPrompt = `Generate an image: ${IMAGE_PROMPT_TEMPLATE.replace('{subject}', prompt)}`;

  try {
    console.log('Calling Gemini 2.0 Flash for image generation...');

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
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
  } catch (error) {
    console.error('Gemini Flash image generation failed:', error);
    return null;
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
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    // 簡単なテストリクエスト
    const result = await model.generateContent('Say OK');
    return !!result.response.text();
  } catch {
    return false;
  }
}

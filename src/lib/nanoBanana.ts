/**
 * Imagen 4.0 Ultra API Client
 * ヴィンテージ新聞画像生成
 *
 * 新SDK (@google/genai) + imagen-4.0-ultra-generate-001 を使用
 */

import { GoogleGenAI } from '@google/genai';
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// 画像生成モデル（Imagen 4.0 Ultra）
const IMAGE_MODEL = 'imagen-4.0-ultra-generate-001';

// 画像生成APIを使用するか
const USE_IMAGE_API = true;

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
 * Imagen 4.0 Ultra を使用して画像を生成
 */
export async function generateNewspaperImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  // 画像APIを使用しない場合、またはAPIキーが未設定の場合はプレースホルダーを返す
  if (!USE_IMAGE_API || !GOOGLE_AI_API_KEY) {
    console.log('Using placeholder image (image API disabled or no API key)');
    return {
      success: true,
      imageUrl: generateVintagePlaceholder(request.prompt, request.width || 512, request.height || 384),
    };
  }

  const styleModifiers = STYLE_MODIFIERS[request.style] || STYLE_MODIFIERS['vintage-newspaper'];
  const enhancedPrompt = buildEnhancedPrompt(request.prompt, styleModifiers);
  const fullPrompt = IMAGE_PROMPT_TEMPLATE.replace('{subject}', enhancedPrompt);

  try {
    console.log('Calling Imagen API with model:', IMAGE_MODEL);

    const genAI = getAI();

    // Imagen 4.0 は generateImages メソッドを使用
    // @ts-ignore - generateImages の型定義
    const response = await genAI.models.generateImages({
      model: IMAGE_MODEL,
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
      },
    });

    // レスポンスから画像データを抽出
    // @ts-ignore - generatedImages の型定義
    if (response.generatedImages && response.generatedImages.length > 0) {
      // @ts-ignore
      const imageBytes = response.generatedImages[0].image?.imageBytes;
      if (imageBytes) {
        console.log('Image generated successfully with Imagen 4.0 Ultra');
        return {
          success: true,
          imageUrl: `data:image/png;base64,${imageBytes}`,
        };
      }
    }

    console.log('No image in response');
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
 * ヴィンテージ風プレースホルダー画像を生成
 * セピア調の新聞風画像
 */
function generateVintagePlaceholder(prompt: string, width: number, height: number): string {
  // セピア調の色で新聞風のプレースホルダー
  const text = encodeURIComponent('📰 新聞画像');
  return `https://placehold.co/${width}x${height}/d4c4a8/3d3d3d/png?text=${text}&font=serif`;
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
    entertainment: 'celebrity event, red carpet, entertainment scene',
    celebrity: 'famous person, interview setting, glamorous scene',
    culture: 'traditional arts, performance, cultural event',
    sports: 'athletic competition, sports venue, victory moment',
    news: 'newsworthy event, public gathering, significant moment',
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
      model: 'gemini-2.5-pro',
      contents: 'Say OK',
    });
    return !!result.text;
  } catch {
    return false;
  }
}

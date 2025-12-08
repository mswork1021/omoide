/**
 * Nano Banana Pro API Client
 * ヴィンテージ新聞画像生成に特化した最新画像生成API
 *
 * 特徴:
 * - モノクロ印刷の質感表現
 * - 網点処理（ハーフトーン）
 * - インクの滲み効果
 * - J-Retro スタイルプリセット
 */

import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';

// Nano Banana Pro Configuration
const NANO_BANANA_API_URL = process.env.NANO_BANANA_API_URL || 'https://api.nanobanana.pro/v1';
const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY;

// スタイルプリセット定義
const STYLE_PRESETS = {
  'vintage-newspaper': {
    preset: 'J-Retro',
    modifiers: [
      'photorealistic vintage newspaper print',
      'halftone dots texture',
      'ink bleed effect',
      'aged paper texture',
      'monochrome newsprint',
      'Japanese showa era style',
    ],
  },
  'halftone': {
    preset: 'Halftone-Classic',
    modifiers: [
      'classic halftone pattern',
      'newspaper dot matrix',
      'vintage print quality',
      'grayscale tones',
    ],
  },
  'ink-bleed': {
    preset: 'Ink-Spread',
    modifiers: [
      'ink bleeding on paper',
      'organic ink spread',
      'vintage letterpress effect',
      'paper fiber absorption',
    ],
  },
};

// 新聞画像用の基本プロンプトテンプレート
const BASE_NEWSPAPER_PROMPT = `
vintage Japanese newspaper photograph,
high contrast black and white,
grainy film texture,
authentic {era} era aesthetic,
professional photojournalism style,
`;

interface NanoBananaApiResponse {
  status: 'success' | 'error' | 'processing';
  image_url?: string;
  image_base64?: string;
  error_message?: string;
  processing_time_ms?: number;
}

/**
 * Nano Banana Pro APIを使用して画像を生成
 */
export async function generateNewspaperImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  const styleConfig = STYLE_PRESETS[request.style] || STYLE_PRESETS['vintage-newspaper'];

  // プロンプトの構築
  const enhancedPrompt = buildEnhancedPrompt(request.prompt, styleConfig.modifiers);

  // APIが未設定の場合はモックレスポンスを返す
  if (!NANO_BANANA_API_KEY) {
    console.warn('Nano Banana API key not configured. Using placeholder.');
    return {
      success: true,
      imageUrl: generatePlaceholderUrl(request.prompt, request.width || 512, request.height || 384),
    };
  }

  try {
    const response = await fetch(`${NANO_BANANA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
        'X-High-Fidelity': request.highFidelity ? 'true' : 'false',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: 'color, modern, digital, cartoon, anime, blur, low quality',
        style_preset: styleConfig.preset,
        width: request.width || 512,
        height: request.height || 384,
        guidance_scale: 7.5,
        num_inference_steps: request.highFidelity ? 50 : 30,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data: NanoBananaApiResponse = await response.json();

    if (data.status === 'success' && (data.image_url || data.image_base64)) {
      return {
        success: true,
        imageUrl: data.image_url || `data:image/png;base64,${data.image_base64}`,
      };
    }

    return {
      success: false,
      error: data.error_message || 'Unknown error occurred',
    };
  } catch (error) {
    console.error('Nano Banana API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
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
  // シンプルなプレースホルダーSVGをBase64エンコード
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

  return `${BASE_NEWSPAPER_PROMPT.replace('{era}', eraStyles[era])}, ${subject}, representing: ${articleContent.slice(0, 100)}`;
}

/**
 * APIの健全性チェック
 */
export async function checkApiHealth(): Promise<boolean> {
  if (!NANO_BANANA_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(`${NANO_BANANA_API_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

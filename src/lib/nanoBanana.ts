/**
 * Imagen 3.0 API Client
 * 時代別画像生成（昭和=モノクロ、平成=カラー、令和=高解像度カラー）
 *
 * 新SDK (@google/genai) + imagen-3.0-generate-001 を使用
 */

import { GoogleGenAI } from '@google/genai';
import type { ImageGenerationRequest, ImageGenerationResponse } from '@/types';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// 画像生成モデル（Imagen 3.0）
const IMAGE_MODEL = 'imagen-3.0-generate-001';

// 画像生成APIを使用するか
const USE_IMAGE_API = true;

// リトライ設定
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1秒から開始、exponential backoff

/**
 * 指定ミリ秒待機する
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 時代別プロンプトテンプレート
const ERA_TEMPLATES = {
  showa: `Create a vintage Japanese newspaper photograph from the 1960s-1980s Showa era.
Style requirements:
- Black and white or sepia toned photograph
- Halftone dots texture (網点処理)
- Slight ink bleed effect
- Aged paper texture
- Classic photojournalism composition
- Nostalgic, historical atmosphere

Subject: {subject}`,

  heisei: `Create a vibrant Japanese newspaper photograph from the 1990s-2000s Heisei era.
Style requirements:
- Full color photograph
- Vivid, saturated colors
- Glossy magazine quality
- Dynamic composition
- Pop culture aesthetic
- Energetic, optimistic atmosphere

Subject: {subject}`,

  reiwa: `Create a modern high-quality Japanese photograph for the 2020s Reiwa era.
Style requirements:
- Ultra high definition 4K quality
- Crisp, clean colors
- Modern minimalist aesthetic
- Professional photography lighting
- Contemporary Japanese style
- Sleek, sophisticated atmosphere

Subject: {subject}`,
};

// 時代別スタイル修飾子
const ERA_STYLE_MODIFIERS = {
  showa: [
    'black and white photograph',
    'vintage 1970s Japanese',
    'halftone newspaper print',
    'nostalgic atmosphere',
    'classic composition',
  ],
  heisei: [
    'colorful photograph',
    '1990s Japanese pop culture',
    'vibrant saturated colors',
    'glossy magazine quality',
    'dynamic energetic style',
  ],
  reiwa: [
    'ultra HD 4K photograph',
    'modern Japanese aesthetic',
    'crisp clean colors',
    'professional lighting',
    'minimalist sophisticated style',
  ],
};

// 時代別解像度設定
const ERA_RESOLUTIONS = {
  showa: { width: 512, height: 384 },
  heisei: { width: 768, height: 576 },
  reiwa: { width: 1024, height: 768 },  // 4K相当の高解像度
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
 * Imagen 4.0 Ultra を使用して画像を生成（リトライ付き）
 * @param request - 画像生成リクエスト
 * @param era - 時代スタイル（showa/heisei/reiwa）
 */
export async function generateNewspaperImage(
  request: ImageGenerationRequest,
  era: 'showa' | 'heisei' | 'reiwa' = 'showa'
): Promise<ImageGenerationResponse> {
  // APIキーが未設定の場合はエラーを返す
  if (!GOOGLE_AI_API_KEY) {
    console.error('[IMAGE] GOOGLE_AI_API_KEY is not configured');
    return {
      success: false,
      error: 'GOOGLE_AI_API_KEY is not configured',
    };
  }

  // 画像APIを使用しない設定の場合はエラーを返す
  if (!USE_IMAGE_API) {
    return {
      success: false,
      error: 'Image API is disabled',
    };
  }

  // 時代別のスタイル設定を取得
  const styleModifiers = ERA_STYLE_MODIFIERS[era];
  const template = ERA_TEMPLATES[era];
  const resolution = ERA_RESOLUTIONS[era];

  const enhancedPrompt = buildEnhancedPrompt(request.prompt, styleModifiers);
  const fullPrompt = template.replace('{subject}', enhancedPrompt);

  let lastError: string = '';

  // リトライループ
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Attempt ${attempt}/${MAX_RETRIES}] Calling Imagen API with model: ${IMAGE_MODEL}, era: ${era}`);

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

      // レスポンスの内容をログ出力
      console.log(`[Attempt ${attempt}] Response received:`, JSON.stringify(response, null, 2).slice(0, 500));

      // レスポンスから画像データを抽出
      // @ts-ignore - generatedImages の型定義
      if (response.generatedImages && response.generatedImages.length > 0) {
        // @ts-ignore
        const imageBytes = response.generatedImages[0].image?.imageBytes;
        if (imageBytes) {
          console.log(`[Attempt ${attempt}] Image generated successfully with Imagen 3.0 (${era} style)`);
          return {
            success: true,
            imageUrl: `data:image/png;base64,${imageBytes}`,
          };
        } else {
          // @ts-ignore
          console.log(`[Attempt ${attempt}] No imageBytes in response:`, response.generatedImages[0]);
        }
      }

      // 画像が生成されなかった場合
      lastError = 'No image generated in response';
      console.log(`[Attempt ${attempt}] No image in response, will retry. Response keys:`, Object.keys(response || {}));

    } catch (error: unknown) {
      // 詳細なエラー情報を取得
      if (error instanceof Error) {
        lastError = error.message;
        console.error(`[Attempt ${attempt}] Image generation error:`, {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n'),
        });
      } else {
        lastError = String(error);
        console.error(`[Attempt ${attempt}] Image generation error (raw):`, error);
      }

      // APIエラーの場合、詳細を出力
      const apiError = error as { status?: number; statusText?: string; response?: unknown };
      if (apiError.status) {
        console.error(`[Attempt ${attempt}] API Status:`, apiError.status, apiError.statusText);
        lastError = `API Error ${apiError.status}: ${apiError.statusText || lastError}`;
      }
    }

    // 最後の試行でなければ待機してリトライ
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1); // exponential backoff
      console.log(`Waiting ${delay}ms before retry...`);
      await sleep(delay);
    }
  }

  // すべてのリトライが失敗
  console.error(`All ${MAX_RETRIES} attempts failed for image generation`);
  return {
    success: false,
    error: `画像生成に${MAX_RETRIES}回失敗しました: ${lastError}`,
  };
}

/**
 * 複数の画像を並列生成（Production用）
 * @param prompts - 画像プロンプトの配列
 * @param era - 時代スタイル（showa/heisei/reiwa）
 */
export async function generateMultipleImages(
  prompts: string[],
  era: 'showa' | 'heisei' | 'reiwa' = 'showa'
): Promise<ImageGenerationResponse[]> {
  const resolution = ERA_RESOLUTIONS[era];
  const requests = prompts.map((prompt) => ({
    prompt,
    style: 'vintage-newspaper' as const,
    highFidelity: true,
    width: resolution.width,
    height: resolution.height,
  }));

  // 並列実行で高速化
  const results = await Promise.all(
    requests.map((req) => generateNewspaperImage(req, era))
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
 * 時代別のスタイルに対応
 */
function generateVintagePlaceholder(
  prompt: string,
  width: number,
  height: number,
  era: 'showa' | 'heisei' | 'reiwa' = 'showa'
): string {
  // 時代別の色設定
  const eraColors = {
    showa: { bg: 'd4c4a8', text: '3d3d3d', label: '📰 昭和風' },
    heisei: { bg: 'ff6b9d', text: 'ffffff', label: '📰 平成風' },
    reiwa: { bg: '2d3748', text: 'e2e8f0', label: '📰 令和風' },
  };

  const colors = eraColors[era];
  const encodedLabel = encodeURIComponent(colors.label);
  return `https://placehold.co/${width}x${height}/${colors.bg}/${colors.text}/png?text=${encodedLabel}&font=serif`;
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

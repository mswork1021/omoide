/**
 * サンプル画像生成スクリプト
 *
 * ============================================
 * 使い方（初心者向け）
 * ============================================
 *
 * 【ステップ1】プロジェクトのルートに .env.local ファイルを作成
 *
 *   Macの場合:
 *   $ touch .env.local
 *   $ open -e .env.local
 *
 *   Windowsの場合:
 *   $ echo. > .env.local
 *   $ notepad .env.local
 *
 * 【ステップ2】ファイルに以下を書いて保存:
 *
 *   GOOGLE_AI_API_KEY=あなたのAPIキー
 *
 *   ※APIキーは https://aistudio.google.com/apikey で取得できます
 *
 * 【ステップ3】このコマンドを実行:
 *
 *   $ npm run generate-samples
 *
 * 【ステップ4】生成完了後、Gitにコミット:
 *
 *   $ git add public/samples/
 *   $ git commit -m "Add sample images"
 *   $ git push
 *
 * ============================================
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// ============================================
// 設定
// ============================================
const IMAGE_MODEL = 'imagen-4.0-generate-preview-06-06';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'samples');

// ============================================
// APIキー確認
// ============================================
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_AI_API_KEY) {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  エラー: APIキーが設定されていません                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('以下の手順で設定してください:');
  console.log('');
  console.log('  1. プロジェクトのルートに .env.local ファイルを作成');
  console.log('');
  console.log('     Mac:     touch .env.local && open -e .env.local');
  console.log('     Windows: echo. > .env.local && notepad .env.local');
  console.log('');
  console.log('  2. ファイルに以下を書いて保存:');
  console.log('');
  console.log('     GOOGLE_AI_API_KEY=あなたのAPIキー');
  console.log('');
  console.log('  3. APIキーの取得先:');
  console.log('     https://aistudio.google.com/apikey');
  console.log('');
  process.exit(1);
}

// Google AI クライアント
const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY });

// ============================================
// 時代別プロンプト
// ============================================
const ERA_TEMPLATES = {
  showa: `Vintage Japanese newspaper photograph from 1964.
Style: Black and white, halftone dots, aged paper texture, classic photojournalism.
Subject: {subject}`,

  heisei: `Japanese newspaper photograph from 1990.
Style: Full color, vivid saturated colors, glossy magazine quality, 90s pop culture aesthetic.
Subject: {subject}`,

  reiwa: `Modern Japanese photograph from 2020.
Style: Ultra HD quality, crisp clean colors, modern minimalist aesthetic, professional lighting.
Subject: {subject}`,
};

// ============================================
// サンプルデータ
// ============================================
const samples = [
  {
    id: 'reiwa',
    era: 'reiwa' as const,
    label: '令和 (2020年)',
    prompts: {
      main: 'Tokyo 2020 Olympics empty stadium, modern sports facility, Japan, pandemic era, photojournalism style',
      sub1: 'Japanese person working from home, laptop, video conference, modern minimalist room, 2020s lifestyle',
      sub2: 'Japanese anime movie theater, crowds with masks, entertainment news photography',
      sub3: 'Japanese government press conference, official ceremony, news photography',
    },
  },
  {
    id: 'heisei',
    era: 'heisei' as const,
    label: '平成 (1990年)',
    prompts: {
      main: 'Japanese company entrance ceremony 1990, new employees in suits, cherry blossoms, newspaper photo',
      sub1: 'Tokyo stock exchange 1990, traders, electronic board, Japanese newspaper photo',
      sub2: 'Koshien baseball stadium 1990, high school baseball, cheering crowd, sports photography',
      sub3: 'Japanese street fashion 1990, young people, colorful clothes, vintage photography',
    },
  },
  {
    id: 'showa',
    era: 'showa' as const,
    label: '昭和 (1964年)',
    prompts: {
      main: '1964 Tokyo Olympics opening ceremony, National Stadium, athletes marching, vintage black and white photo',
      sub1: '1964 Shinkansen bullet train, Tokyo station, passengers, vintage black and white photo',
      sub2: '1964 Tokyo expressway, highway with cars, vintage monochrome photography',
      sub3: '1964 Tokyo Olympics Japanese athletes, judo, vintage black and white sports photo',
    },
  },
];

// ============================================
// 画像生成関数
// ============================================
async function generateImage(prompt: string, era: 'showa' | 'heisei' | 'reiwa'): Promise<string | null> {
  const fullPrompt = ERA_TEMPLATES[era].replace('{subject}', prompt);

  try {
    // @ts-ignore - generateImages の型定義
    const response = await ai.models.generateImages({
      model: IMAGE_MODEL,
      prompt: fullPrompt,
      config: { numberOfImages: 1 },
    });

    // @ts-ignore
    if (response.generatedImages?.[0]?.image?.imageBytes) {
      // @ts-ignore
      return response.generatedImages[0].image.imageBytes;
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // エラーメッセージを短く表示
    console.log(`    エラー: ${message.slice(0, 80)}...`);
    return null;
  }
}

// ============================================
// ファイル保存関数
// ============================================
function saveImage(base64Data: string, filename: string): void {
  const filePath = path.join(OUTPUT_DIR, filename);
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(filePath, buffer);
}

// ============================================
// 待機関数（API制限対策）
// ============================================
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// メイン処理
// ============================================
async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  サンプル画像生成スクリプト                                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  出力先: ${OUTPUT_DIR}`);
  console.log(`  モデル: ${IMAGE_MODEL}`);
  console.log('');

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('  出力ディレクトリを作成しました');
    console.log('');
  }

  let successCount = 0;
  let failCount = 0;
  const totalImages = samples.length * 4; // 各サンプル4枚

  console.log(`  合計 ${totalImages} 枚の画像を生成します`);
  console.log('  （API制限対策のため、各画像の間に2秒の待機があります）');
  console.log('');

  for (const sample of samples) {
    console.log(`┌─────────────────────────────────────────────`);
    console.log(`│ ${sample.label}`);
    console.log(`└─────────────────────────────────────────────`);

    const imageTypes = [
      { key: 'main', label: 'メイン画像', file: `${sample.id}-main.png` },
      { key: 'sub1', label: 'サブ画像1', file: `${sample.id}-sub-1.png` },
      { key: 'sub2', label: 'サブ画像2', file: `${sample.id}-sub-2.png` },
      { key: 'sub3', label: 'サブ画像3', file: `${sample.id}-sub-3.png` },
    ];

    for (let i = 0; i < imageTypes.length; i++) {
      const imgType = imageTypes[i];
      const prompt = sample.prompts[imgType.key as keyof typeof sample.prompts];

      console.log(`  [${i + 1}/4] ${imgType.label}...`);

      const imageData = await generateImage(prompt, sample.era);

      if (imageData) {
        saveImage(imageData, imgType.file);
        console.log(`    ✓ 保存: ${imgType.file}`);
        successCount++;
      } else {
        console.log(`    ✗ 失敗`);
        failCount++;
      }

      // 最後の画像以外は待機
      if (i < imageTypes.length - 1 || sample !== samples[samples.length - 1]) {
        await sleep(2000);
      }
    }

    console.log('');
  }

  // 結果表示
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  完了！                                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  成功: ${successCount} 枚`);
  console.log(`  失敗: ${failCount} 枚`);
  console.log('');

  if (successCount > 0) {
    console.log('  生成された画像:');
    console.log(`    ${OUTPUT_DIR}`);
    console.log('');
    console.log('┌─────────────────────────────────────────────');
    console.log('│ 次のステップ');
    console.log('└─────────────────────────────────────────────');
    console.log('');
    console.log('  以下のコマンドを順番に実行してください:');
    console.log('');
    console.log('    git add public/samples/');
    console.log('    git commit -m "Add sample images"');
    console.log('    git push');
    console.log('');
  }
}

// 実行
main().catch(error => {
  console.error('');
  console.error('予期しないエラーが発生しました:');
  console.error(error);
  process.exit(1);
});

import * as OpenCC from 'opencc-js';
import CONFIG from '../helper/config.js';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

/**
 * 清理 Whisper 輸出文字（移除時間戳記、統一標點、去除首尾空白）
 * spec: text-processor
 */
export function cleanText(text: string): string {
  let cleaned = text;
  // index 0: 移除 VTT 時間戳記 [HH:MM.SSS --> HH:MM.SSS]
  // index 1: 英文逗號 → 中文逗號
  // index 2: 換行 → 中文逗號（作為斷句分隔）
  // index 3: 多餘空白直接移除
  const replacements = ['', '，', '，', ''];
  CONFIG.text.cleanupPatterns.forEach((pattern, index) => {
    cleaned = cleaned.replace(pattern, replacements[index] ?? '');
  });
  // 移除結尾可能因換行轉換產生的多餘逗號
  return cleaned.trim().replace(/，$/, '');
}

/**
 * 清理文字並轉換為繁體中文
 * spec: text-processor
 */
export async function processText(raw: string): Promise<string> {
  const cleaned = cleanText(raw);

  console.log(
    '📄 初處理內容:',
    cleaned.length > CONFIG.text.maxPreviewLength
      ? cleaned.substring(0, CONFIG.text.maxPreviewLength) + '...'
      : cleaned
  );

  if (!cleaned) {
    throw new Error('清理後內容為空');
  }

  try {
    const traditional = converter(cleaned);
    console.log('🈳 繁體中內容:', traditional);
    return traditional;
  } catch (error) {
    console.warn('⚠️ 本地轉換失敗:', error instanceof Error ? error.message : String(error));
    return cleaned;
  }
}

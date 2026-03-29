import * as OpenCC from 'opencc-js';
import CONFIG from '../helper/config.js';

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

/**
 * 清理 Whisper 輸出文字（移除時間戳記、統一標點、去除首尾空白）
 * spec: text-processor
 */
function cleanText(text: string): string {
  let cleaned = text;
  CONFIG.text.cleanupPatterns.forEach((pattern, index) => {
    if (index === 0) {
      cleaned = cleaned.replace(pattern, '');
    } else if (index === 1) {
      cleaned = cleaned.replace(pattern, '，');
    } else if (index === 2) {
      cleaned = cleaned.replace(pattern, '，');
    } else if (index === 3) {
      cleaned = cleaned.replace(pattern, '，');
    }
  });
  return cleaned.trim().slice(0, -1);
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

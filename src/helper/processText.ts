import * as OpenCC from 'opencc-js';
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

import CONFIG from '../helper/config.js'

// ===== 文字處理功能 =====
/**
 * 清理文字內容
 */
function cleanText(text: string): string {
  let cleanedText = text;
  
  CONFIG.text.cleanupPatterns.forEach((pattern, index) => {
    if (index === 0) {
      cleanedText = cleanedText.replace(pattern, '');
    } else if (index === 1) {
      cleanedText = cleanedText.replace(pattern, '，');
    } else if (index === 2) {
      cleanedText = cleanedText.replace(pattern, '，');
    } else if (index === 3) {
      cleanedText = cleanedText.replace(pattern, '，');
    }
  });
  
  return cleanedText.trim().slice(0, -1);
}


/**
 * 繁簡轉換
 */
async function convertToTraditional(text: string): Promise<string> {
  try {
    return converter(text);
  } catch (error) {
    console.log('⚠️  本地轉換失敗:', error instanceof Error ? error.message : String(error));
    return text;
  }
}

/**
 * 處理文字內容
 */
async function processText(text: string): Promise<string> {
  let processedText = cleanText(text);
  
  console.log('📄 初處理內容:', processedText.length > CONFIG.text.maxPreviewLength ? processedText.substring(0, CONFIG.text.maxPreviewLength) + '...' : processedText);

  if (!processedText) {
    throw new Error('清理後內容為空');
  }

  processedText = await convertToTraditional(processedText);
  console.log('🈳 繁體中內容:', processedText);

  return processedText;
}

export default processText
import { processDirectory } from './modules/processor.js';
import { WhisperModel } from './types/index.js';
import { ensureFolders } from './helper/folders.js';
import CONFIG from './helper/config.js';

/**
 * 從 CLI 參數解析 Whisper model
 * 用法: npm run dev -- tiny
 */
function parseModel(): WhisperModel {
  const args = process.argv.slice(2);

  // 支援位置參數: npm run dev -- tiny
  for (const arg of args) {
    if (Object.values(WhisperModel).includes(arg as WhisperModel)) {
      return arg as WhisperModel;
    }
  }

  console.warn(`⚠️ 未指定模型或不支援，使用預設 ${CONFIG.whisper.defaultModel}。可用: ${Object.values(WhisperModel).join(', ')}`);
  return CONFIG.whisper.defaultModel;
}

/**
 * 主程式入口
 */
async function main(): Promise<void> {
  console.log('🎵 開始處理影片檔案...');

  // 使用當前工作目錄
  const directory = process.cwd();

  // 確保資料夾結構存在
  ensureFolders(directory);
  // 從 CLI 參數選擇模型，預設 base
  const model = parseModel();
  console.log(`🤖 使用模型: ${model}`);
  
  try {
    await processDirectory(directory, model);
    console.log('✅ 處理完成！');
  } catch (error) {
    console.error('❌ 處理失敗:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 執行主程式
main().catch(() => process.exit(1));


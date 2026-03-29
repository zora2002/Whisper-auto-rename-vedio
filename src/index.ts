import { processDirectory } from './modules/processor.js';
import { WhisperModel } from './types/index.js';

/**
 * 從 CLI 參數解析 Whisper model
 * 用法: npm run dev -- --model small
 */
function parseModel(): WhisperModel {
  const args = process.argv.slice(2);
  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    const requested = args[modelIndex + 1];
    if (Object.values(WhisperModel).includes(requested as WhisperModel)) {
      return requested as WhisperModel;
    }
    console.warn(`⚠️ 不支援的模型 "${requested}"，使用預設 base。可用: ${Object.values(WhisperModel).join(', ')}`);
  }
  return WhisperModel.base;
}

/**
 * 主程式入口
 */
async function main(): Promise<void> {
  console.log('🎵 開始處理影片檔案...');

  // 使用當前工作目錄
  const directory = process.cwd();
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


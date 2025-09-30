import { processDirectory } from './modules/processor.js';
import { WhisperModel } from './types/index.js';

/**
 * 主程式入口
 */
async function main(): Promise<void> {
  console.log('🎵 開始處理影片檔案...');
  
  // 使用當前工作目錄
  const directory = process.cwd();
  
  try {
    await processDirectory(directory, WhisperModel.base);
    console.log('✅ 處理完成！');
  } catch (error) {
    console.error('❌ 處理失敗:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 執行主程式
main().catch(() => process.exit(1));


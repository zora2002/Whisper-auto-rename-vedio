import { WhisperModel, ProcessingStats } from '../types/index.js';
import { scanDirectory } from './scanner.js';
import { preprocessFiles } from './preprocessor.js';
import { transcribe } from './transcriber.js';
import { processText } from './textProcessor.js';
import { renameFile } from './renamer.js';

/**
 * 主要處理流程：協調各模組完成掃描 → 預處理 → 語音辨識 → 文字處理 → 重命名
 */
export async function processDirectory(directory: string, model: WhisperModel): Promise<void> {
  const stats: ProcessingStats = {
    successCount: 0,
    skipCount: 0,
    errorCount: 0,
  };

  // step1: 掃描目錄
  const targetFiles = scanDirectory(directory);
  if (targetFiles.length === 0) {
    console.log('\n沒有找到符合模式的檔案！請確認');
    return;
  }

  // step2: 預處理（Screen Recording 格式轉換）
  const processedFiles = preprocessFiles(targetFiles);

  // step3: 逐一處理
  for (const file of processedFiles) {
    console.log('\n🎵 開始處理影片:', file);
    try {
      const rawText = await transcribe(file, model);
      const text = await processText(rawText);
      renameFile(file, text);
      console.log('🎉 處理完成！');
      stats.successCount++;
    } catch (error) {
      console.error(`❌ 處理失敗 [${file}]:`, error instanceof Error ? error.message : String(error));
      stats.errorCount++;
    }
  }

  console.log('\n===== 處理結果 =====');
  console.log(`成功處理: ${stats.successCount} 個檔案`);
  console.log(`跳過處理: ${stats.skipCount} 個檔案`);
  console.log(`處理失敗: ${stats.errorCount} 個檔案`);
}

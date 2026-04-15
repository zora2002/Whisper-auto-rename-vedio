import path from 'path';
import { WhisperModel, ProcessingStats } from '../types/index.js';
import { scanDirectory } from './scanner.js';
import { preprocessFiles } from './preprocessor.js';
import { transcribe } from './transcriber.js';
import { processText } from './textProcessor.js';
import { renameFile } from './renamer.js';
import { moveFile } from './mover.js';
import { NOTYET_DIR, SUCCESS_DIR, FAIL_DIR } from '../helper/folders.js';

/**
 * 主要處理流程：掃描 rename-notyet/ → 預處理 → 語音辨識 → 文字處理 → 重命名 → 移至 rename-result/
 */
export async function processDirectory(baseDir: string, model: WhisperModel): Promise<void> {
  const notyetDir = path.join(baseDir, NOTYET_DIR);
  const successDir = path.join(baseDir, SUCCESS_DIR);
  const failDir = path.join(baseDir, FAIL_DIR);

  const stats: ProcessingStats = {
    successCount: 0,
    skipCount: 0,
    errorCount: 0,
  };

  // step1: 掃描 rename-notyet/
  const targetFiles = scanDirectory(notyetDir);
  if (targetFiles.length === 0) {
    console.log('\nrename-notyet 資料夾中沒有找到待處理的影片');
    return;
  }

  // step2: 預處理（Screen Recording 格式轉換）
  const processedFiles = preprocessFiles(targetFiles, notyetDir);

  // step3: 逐一處理
  for (const file of processedFiles) {
    const fullPath = path.join(notyetDir, file);
    console.log('\n🎵 開始處理影片:', file);
    try {
      const rawText = await transcribe(fullPath, model);
      const text = await processText(rawText);
      const renamedPath = renameFile(fullPath, text);
      moveFile(renamedPath, successDir);
      console.log('🎉 處理完成！');
      stats.successCount++;
    } catch (error) {
      console.error(`❌ 處理失敗 [${file}]:`, error instanceof Error ? error.message : String(error));
      moveFile(fullPath, failDir);
      stats.errorCount++;
    }
  }

  console.log('\n===== 處理結果 =====');
  console.log(`成功處理: ${stats.successCount} 個檔案`);
  console.log(`跳過處理: ${stats.skipCount} 個檔案`);
  console.log(`處理失敗: ${stats.errorCount} 個檔案`);
}

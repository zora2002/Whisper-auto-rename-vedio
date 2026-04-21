import fs from 'fs';
import CONFIG from '../helper/config.js';

/**
 * 掃描目錄中符合命名模式的 MP4 檔案
 * spec: file-scanner
 */
export function scanDirectory(directory: string): string[] {
  try {
    const files = fs.readdirSync(directory);
    console.log(`目錄中共有 ${files.length} 個檔案/資料夾`);

    const targetFiles = files.filter(file =>
      CONFIG.file.supportedExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    console.log(`\n找到 ${targetFiles.length} 個符合模式的檔案`);
    return targetFiles;
  } catch (error) {
    throw new Error(`掃描目錄失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

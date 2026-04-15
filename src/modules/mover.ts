import fs from 'fs';
import path from 'path';

/**
 * 將檔案移至目標目錄，若同名則加數字後綴
 * 跨磁碟時 fallback 為 copy + delete
 */
export function moveFile(src: string, destDir: string): void {
  const ext = path.extname(src);
  const base = path.basename(src, ext);
  let destPath = path.join(destDir, path.basename(src));
  let counter = 1;

  while (fs.existsSync(destPath)) {
    destPath = path.join(destDir, `${base}_${counter}${ext}`);
    counter++;
  }

  try {
    fs.renameSync(src, destPath);
  } catch {
    // 跨磁碟 fallback
    fs.copyFileSync(src, destPath);
    fs.unlinkSync(src);
  }
}

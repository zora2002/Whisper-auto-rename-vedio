import fs from 'fs';
import path from 'path';
import CONFIG from '../helper/config.js';

export function hasDatetimeStamp(baseName: string): boolean {
  return /^\d{6}_\d{8}$/.test(baseName);
}

/**
 * 根據處理後文字產生安全檔名並執行重命名
 * spec: file-renamer
 */
export function renameFile(inputFile: string, processedText: string): string {
  const nameLength = CONFIG.file.maxNameLength;
  const safeName = processedText
    .slice(0, nameLength)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[。！？；：、]/g, '')
    .replace(/[,.!?;:]/g, '')
    .trim();

  if (!safeName) {
    throw new Error('處理後檔名為空');
  }

  const dir = path.dirname(inputFile);
  const ext = path.extname(inputFile);
  const originalBase = path.basename(inputFile, ext);
  const withDatetime = hasDatetimeStamp(originalBase);

  let newPath = withDatetime
    ? path.join(dir, `${safeName}_${originalBase}${ext}`)
    : path.join(dir, `${safeName}${ext}`);
  let counter = 1;

  while (fs.existsSync(newPath)) {
    newPath = withDatetime
      ? path.join(dir, `${safeName}_${originalBase}_${counter}${ext}`)
      : path.join(dir, `${safeName}_${counter}${ext}`);
    counter++;
  }

  console.log(`📝 重新命名: ${inputFile} => ${newPath}`);
  fs.renameSync(inputFile, newPath);
  return newPath;
}

import fs from 'fs';
import path from 'path';
import CONFIG from '../helper/config.js';

/**
 * 根據處理後文字產生安全檔名並執行重命名
 * spec: file-renamer
 */
export function renameFile(inputFile: string, processedText: string): void {
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

  const ext = path.extname(inputFile);
  let newName = `${safeName}_${inputFile}`;
  let counter = 1;

  while (fs.existsSync(newName)) {
    const base = path.basename(inputFile, ext);
    newName = `${safeName}_${counter}_${base}${ext}`;
    counter++;
  }

  console.log(`📝 重新命名: ${inputFile} => ${newName}`);
  fs.renameSync(inputFile, newName);
}

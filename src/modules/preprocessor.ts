import fs from 'fs';
import path from 'path';
import dayjs from '../helper/dayjs.js';
import CONFIG from '../helper/config.js';

/**
 * 將單一檔名中含有的 _YYYYMMDD_HHMMSS 時間戳記標準化為 HHMMSS_YYYYMMDD.mp4
 * spec: file-preprocessor
 */
function preprocessFileName(fileName: string): string {
  const withUnderscoreSeconds = fileName.match(CONFIG.file.embeddedDatetimeWithUnderscoreSecondsPattern);
  if (withUnderscoreSeconds) {
    const [, date, time, secondsStr] = withUnderscoreSeconds;
    const numbers = secondsStr.substring(1).split('_').map(num => parseInt(num, 10));
    const secondsToAdd = numbers.reduce((sum, num) => sum + num, 0);
    const adjusted = dayjs(`${date} ${time}`, 'YYYYMMDD HHmmss').add(secondsToAdd, 'second');
    const newFileName = `${adjusted.format('HHmmss')}_${adjusted.format('YYYYMMDD')}.mp4`;
    console.log(`🔄 預處理檔案 (調整秒數): ${fileName} => ${newFileName} (加 ${secondsToAdd} 秒)`);
    return newFileName;
  }

  const withParenSeconds = fileName.match(CONFIG.file.embeddedDatetimeWithParenSecondsPattern);
  if (withParenSeconds) {
    const [, date, time, secondsStr] = withParenSeconds;
    const secondsToAdd = parseInt(secondsStr, 10);
    const adjusted = dayjs(`${date} ${time}`, 'YYYYMMDD HHmmss').add(secondsToAdd, 'second');
    const newFileName = `${adjusted.format('HHmmss')}_${adjusted.format('YYYYMMDD')}.mp4`;
    console.log(`🔄 預處理檔案 (調整秒數): ${fileName} => ${newFileName} (加 ${secondsToAdd} 秒)`);
    return newFileName;
  }

  const basic = fileName.match(CONFIG.file.embeddedDatetimePattern);
  if (basic) {
    const [, date, time] = basic;
    const newFileName = `${time}_${date}.mp4`;
    console.log(`🔄 預處理檔案: ${fileName} => ${newFileName}`);
    return newFileName;
  }

  return fileName;
}

/**
 * 預處理檔案陣列，將含時間戳記的檔名標準化為 HHMMSS_YYYYMMDD.mp4
 * spec: file-preprocessor
 */
export function preprocessFiles(files: string[], baseDir: string): string[] {
  return files.map(file => {
    const newFileName = preprocessFileName(file);
    if (newFileName !== file) {
      try {
        fs.renameSync(path.join(baseDir, file), path.join(baseDir, newFileName));
      } catch (error) {
        throw new Error(`重命名檔案失敗: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return newFileName;
  });
}

import fs from 'fs';
import path from 'path';
import dayjs from '../helper/dayjs.js';
import CONFIG from '../helper/config.js';

/**
 * 將單一檔名從 Screen Recording 格式轉換為標準格式
 * spec: file-preprocessor
 */
function preprocessFileName(fileName: string): string {
  const withSecondsMatch = fileName.match(CONFIG.file.screenRecordingWithSecondsPattern);
  if (withSecondsMatch) {
    const [, date, time, secondsStr] = withSecondsMatch;
    const numbers = secondsStr.substring(1).split('_').map(num => parseInt(num, 10));
    const secondsToAdd = numbers.reduce((sum, num) => sum + num, 0);

    const adjustedDateTime = dayjs(`${date} ${time}`, 'YYYYMMDD HHmmss').add(secondsToAdd, 'second');
    const newFileName = `${adjustedDateTime.format('HHmmss')}_${adjustedDateTime.format('YYYYMMDD')}.mp4`;

    console.log(`🔄 預處理檔案 (調整秒數): ${fileName} => ${newFileName} (加 ${secondsToAdd} 秒)`);
    return newFileName;
  }

  const screenRecordingMatch = fileName.match(CONFIG.file.screenRecordingPattern);
  if (screenRecordingMatch) {
    const [, date, time] = screenRecordingMatch;
    const newFileName = `${time}_${date}.mp4`;

    console.log(`🔄 預處理檔案: ${fileName} => ${newFileName}`);
    return newFileName;
  }

  return fileName;
}

/**
 * 預處理檔案陣列，將 Screen Recording 格式轉換為標準格式
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

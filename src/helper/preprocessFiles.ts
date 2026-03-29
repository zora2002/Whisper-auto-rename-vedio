import fs from 'fs';

import dayjs from './dayjs.js'
import CONFIG from './config.js'

// ===== 檔案預處理功能 =====

/**
 * 預處理檔案名稱
 */
function preprocessFileName(fileName: string): string {
  const screenRecordingWithSecondsMatch = fileName.match(CONFIG.file.screenRecordingWithSecondsPattern);
  if (screenRecordingWithSecondsMatch) {
    const [, date, time, secondsStr] = screenRecordingWithSecondsMatch;
    // 計算秒數調整
    const numbers = secondsStr.substring(1).split('_').map(num => parseInt(num, 10));
    const secondsToAdd = numbers.reduce((sum, num) => sum + num, 0);
    
    // 調整日期時間
    const adjustedDateTime = dayjs(`${date} ${time}`, 'YYYYMMDD HHmmss').add(secondsToAdd, 'second');
    const adjustedDate = adjustedDateTime.format('YYYYMMDD');
    const adjustedTime = adjustedDateTime.format('HHmmss');
    
    const newFileName = `${adjustedTime}_${adjustedDate}.mp4`;
    
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
 * 重命名檔案（預處理用）
 */
function renameFilePreprocess(oldFileName: string, newFileName: string): void {
  if (oldFileName === newFileName) {
    return;
  }
  
  try {
    fs.renameSync(oldFileName, newFileName);
    console.log(`📝 檔案重命名: ${oldFileName} => ${newFileName}`);
  } catch (error) {
    throw new Error(`重命名檔案失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 預處理目錄中的所有檔案
 */
function preprocessFiles(files: string[]): string[] {
  const processedFiles: string[] = [];
  
  for (const file of files) {
    const newFileName = preprocessFileName(file);
    
    if (newFileName !== file) {
      renameFilePreprocess(file, newFileName);
      processedFiles.push(newFileName);
    } else {
      processedFiles.push(file);
    }
  }
  
  return processedFiles;
}

export default preprocessFiles

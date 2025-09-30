import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import * as OpenCC from 'opencc-js';
import { WhisperModel, ProcessingStats } from '../types/index.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

// ===== 配置 =====
const config = {
  whisper: {
    defaultModel: WhisperModel.base,
    language: 'zh',
    outputFormat: 'txt',
    verbose: false,
    timeout: 5 * 60 * 1000, // 5分鐘
    maxBuffer: 1024 * 1024 * 10 // 10MB
  },
  
  file: {
    maxNameLength: 20,
    supportedExtensions: ['.mp4'],
    filePatterns: [/^\d{6}_\d{8}\.mp4$/],
    screenRecordingPattern: /^Screen_Recording_(\d{8})_(\d{6})\.mp4$/,
    screenRecordingWithSecondsPattern: /^Screen_Recording_(\d{8})_(\d{6})((?:_\d+)+)\.mp4$/
  },
  
  text: {
    maxPreviewLength: 50,
    cleanupPatterns: [
      /\[\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}\]/g,
      /,/g,
      /\r?\n/g,
      /\s+/g
    ]
  },
  
  env: {
    pythonEncoding: 'utf-8',
    pythonUtf8: '1'
  }
};

// ===== Whisper 執行功能 =====
/**
 * 執行 Whisper 轉錄
 */
async function runWhisper(inputFile: string, model: WhisperModel): Promise<void> {
  const verboseFlag = config.whisper.verbose ? '--verbose' : '';
  const command = `whisper "${inputFile}" --model ${model} --language ${config.whisper.language} --output_format ${config.whisper.outputFormat} ${verboseFlag}`.trim();
  
  const execAsync = util.promisify(exec);
  const execOptions = {
    maxBuffer: config.whisper.maxBuffer,
    timeout: config.whisper.timeout,
    env: {
      ...process.env,
      PYTHONIOENCODING: config.env.pythonEncoding,
      PYTHONUTF8: config.env.pythonUtf8
    },
    encoding: 'utf8' as const
  };
  
  try {
    const { stderr } = await execAsync(command, execOptions);

    if (stderr && !stderr.includes('UnicodeEncodeError') && !stderr.includes('UserWarning')) {
      console.warn('⚠️ 錯誤輸出:', stderr);
    }
  } catch (error) {
    throw new Error(`Whisper 執行失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ===== 文字處理功能 =====
/**
 * 清理文字內容
 */
function cleanText(text: string): string {
  let cleanedText = text;
  
  config.text.cleanupPatterns.forEach((pattern, index) => {
    if (index === 0) {
      cleanedText = cleanedText.replace(pattern, '');
    } else if (index === 1) {
      cleanedText = cleanedText.replace(pattern, '，');
    } else if (index === 2) {
      cleanedText = cleanedText.replace(pattern, '，');
    } else if (index === 3) {
      cleanedText = cleanedText.replace(pattern, '，');
    }
  });
  
  return cleanedText.trim().slice(0, -1);
}


/**
 * 繁簡轉換
 */
async function convertToTraditional(text: string): Promise<string> {
  try {
    return converter(text);
  } catch (error) {
    console.log('⚠️  本地轉換失敗:', error instanceof Error ? error.message : String(error));
    return text;
  }
}

/**
 * 處理文字內容
 */
async function processText(text: string): Promise<string> {
  let processedText = cleanText(text);
  
  console.log('📄 初處理內容:', processedText.length > config.text.maxPreviewLength ? processedText.substring(0, config.text.maxPreviewLength) + '...' : processedText);

  if (!processedText) {
    throw new Error('清理後內容為空');
  }

  processedText = await convertToTraditional(processedText);
  console.log('🈳 繁體中內容:', processedText);

  return processedText;
}

// ===== 檔案操作功能 =====
/**
 * 重新命名檔案
 */
function renameFile(inputFile: string, safeName: string): void {
  const ext = path.extname(inputFile);
  let newName = safeName + '_' + inputFile;
  let counter = 1;
  
  while (fs.existsSync(newName)) {
    newName = `${safeName}_${counter}${ext}`;
    counter++;
  }

  console.log(`📝 重新命名: ${inputFile} => ${newName}`);
  fs.renameSync(inputFile, newName);
}

/**
 * 尋找生成的文字檔
 */
function findTextFile(inputFile: string): string | null {
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const possibleNames = [
    `${baseName}.txt`,
    `${inputFile}.txt`,
    inputFile.replace('.mp4', '.txt')
  ];

  for (const txtFile of possibleNames) {
    if (fs.existsSync(txtFile)) {
      return txtFile;
    }
  }
  return null;
}



// ===== 檔案預處理功能 =====

/**
 * 預處理檔案名稱
 */
function preprocessFileName(fileName: string): string {
  const screenRecordingWithSecondsMatch = fileName.match(config.file.screenRecordingWithSecondsPattern);
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
  
  const screenRecordingMatch = fileName.match(config.file.screenRecordingPattern);
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

// ===== Whisper 重命名功能 =====
/**
 * Whisper 重命名主功能
 */
async function whisperRename(inputFile: string, model: WhisperModel, maxNameLength?: number): Promise<void> {
  console.log('\n🎵 開始處理影片:', inputFile);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`找不到影片檔案: ${inputFile}`);
  }

  let foundTxtFile: string | null = null;

  try {
    // 執行 Whisper 轉錄
    await runWhisper(inputFile, model);

    // 尋找生成的文字檔
    foundTxtFile = findTextFile(inputFile);

    if (!foundTxtFile) {
      throw new Error('找不到轉換生成的文字檔');
    }

    // 讀取並處理文字內容
    const rawText = fs.readFileSync(foundTxtFile, 'utf-8');
    const processedText = await processText(rawText);

    // 生成安全的檔名
    const nameLength = maxNameLength ?? config.file.maxNameLength;
    const safeName = processedText
      .slice(0, nameLength)
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/[。！？；：、]/g, '')
      .replace(/[,\.!?;:]/g, '')
      .trim();

    console.log('✂️  處理後檔名:', safeName);

    if (!safeName) {
      throw new Error('處理後檔名為空');
    }

    // 重命名檔案
    renameFile(inputFile, safeName);

    console.log('🎉 處理完成！');

  } catch (error) {
    console.error('❌ 執行失敗:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    // 清理臨時檔案
    if (foundTxtFile) {
      try {
        if (foundTxtFile && fs.existsSync(foundTxtFile)) {
          fs.unlinkSync(foundTxtFile);
        }
      } catch (e) {
        console.warn('⚠️  清理失敗:', e instanceof Error ? e.message : String(e));
      }
    }
  }
}

// ===== 錯誤處理功能 =====

/**
 * 掃描目錄中的檔案
 */
function scanDirectory(directory: string): { totalFiles: number; targetFiles: string[] } {
  try {
    // 同步讀取目錄中的所有檔案
    const files = fs.readdirSync(directory);
    console.log(`目錄中共有 ${files.length} 個檔案/資料夾`);
    
    // 過濾可能符合命名模式的檔案
    const targetFiles = files.filter(file => 
      config.file.filePatterns.some(pattern => file.match(pattern)) ||
      file.match(config.file.screenRecordingPattern) ||
      file.match(config.file.screenRecordingWithSecondsPattern)
    );
    
    console.log(`\n找到 ${targetFiles.length} 個符合模式的檔案`);

    return {
      totalFiles: files.length,
      targetFiles
    };
  } catch (error) {
    throw new Error(`掃描目錄失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 顯示找到的檔案列表
 */
function displayFoundFiles(files: string[]): void {
  if (files.length === 0) {
    console.log('\n沒有找到符合模式的檔案！請確認');
    return;
  }

  console.log('\n找到的檔案如下：');
  files.forEach(file => {
    console.log(`- ${file}`);
  });
}

/**
 * 建立新的統計物件
 */
function createStats(): ProcessingStats {
  return {
    successCount: 0,
    skipCount: 0,
    errorCount: 0,
    beginTime: null,
    endTime: null
  };
}

/**
 * 顯示處理結果
 */
function displayResults(stats: ProcessingStats): void {
  console.log('\n===== 處理結果 =====');
  console.log(`成功處理: ${stats.successCount} 個檔案`);
  console.log(`跳過處理: ${stats.skipCount} 個檔案`);
  console.log(`處理失敗: ${stats.errorCount} 個檔案`);

  if (stats.beginTime !== null && stats.endTime !== null) {
    const executionTime = dayjs.duration(stats.endTime.diff(stats.beginTime));
    const minutes = executionTime.minutes();
    const seconds = executionTime.seconds();

    console.log(`執行時間: ${minutes}分${seconds}秒`);
  }
}

/**
 * 處理檔案列表
 * @param files 要處理的檔案列表
 * @param model Whisper模型
 * @param stats 統計物件
 */
async function processFiles(files: string[], model: WhisperModel, stats: ProcessingStats): Promise<void> {
  console.log('開始處理檔案：');
  
  for (const file of files) {
    try {
      await whisperRename(file, model);
      stats.successCount++;
    } catch (error) {
      console.error(`錯誤: 處理檔案 ${file} 時發生問題: ${error instanceof Error ? error.message : String(error)}`);
      stats.errorCount++;
    }
  }
}

/**
 * 主要處理流程
 * @param directory 工作目錄
 * @param model Whisper模型
 */
export async function processDirectory(directory: string, model: WhisperModel): Promise<void> {
  const stats = createStats();
  
  try {
    // 掃描目錄
    const scanResult = scanDirectory(directory);
    
    // 顯示找到的檔案
    displayFoundFiles(scanResult.targetFiles);
    
    if (scanResult.targetFiles.length === 0) {
      return;
    }
    
    // 預處理檔案（重命名 Screen_Recording 格式）
    console.log('\n🔄 開始預處理檔案...');
    const processedFiles = preprocessFiles(scanResult.targetFiles);
    
    if (processedFiles.length > 0) {
      console.log('✅ 預處理完成');
    }
    
    // 開始處理
    stats.beginTime = dayjs();
    await processFiles(processedFiles, model, stats);
    stats.endTime = dayjs();
    
    // 顯示結果
    displayResults(stats);
    
  } catch (error) {
    console.error(`錯誤: 處理檔案 directory scan 時發生問題: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 
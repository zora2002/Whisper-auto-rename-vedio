import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';


import { WhisperModel, ProcessingStats } from '../types/index.js';
import CONFIG from '../helper/config.js'
import preprocessFiles from '../helper/preprocessFiles.js'
import processText from '../helper/processText.js'


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
      CONFIG.file.filePatterns.some(pattern => file.match(pattern)) ||
      file.match(CONFIG.file.screenRecordingPattern) ||
      file.match(CONFIG.file.screenRecordingWithSecondsPattern)
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


/**
 * 執行 Whisper 轉錄
 */
async function runWhisper(inputFile: string, model: WhisperModel): Promise<void> {
  const verboseFlag = CONFIG.whisper.verbose ? '--verbose' : '';
  const command = `whisper "${inputFile}" --model ${model} --language ${CONFIG.whisper.language} --output_format ${CONFIG.whisper.outputFormat} ${verboseFlag}`.trim();
  
  const execAsync = util.promisify(exec);
  const execOptions = {
    maxBuffer: CONFIG.whisper.maxBuffer,
    timeout: CONFIG.whisper.timeout,
    env: {
      ...process.env,
      PYTHONIOENCODING: CONFIG.env.pythonEncoding,
      PYTHONUTF8: CONFIG.env.pythonUtf8
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
    const nameLength = maxNameLength ?? CONFIG.file.maxNameLength;
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


/**
 * 主要處理流程
 * @param directory 工作目錄
 * @param model Whisper模型
 */
export async function processDirectory(directory: string, model: WhisperModel): Promise<void> {
  // 建立新的統計物件
  const stats:ProcessingStats = {
    successCount: 0,
    skipCount: 0,
    errorCount: 0,
    beginTime: null,
    endTime: null
  };
  
  try {
    // === step1 ===
    //  掃描目錄
    const scanResult = scanDirectory(directory);
    if (scanResult.targetFiles.length === 0) {
      console.log('\n沒有找到符合模式的檔案！請確認');
      return;
    }
    
    // === step2 === 
    // 預處理檔案（重命名 Screen_Recording 格式）
    const processedFiles = preprocessFiles(scanResult.targetFiles);
    
    // === step3 ===
    // 開始處理
    for (const f of processedFiles) {
      try {
        await whisperRename(f, model);
        stats.successCount++;
      } catch (error) {
        console.error(`錯誤: 處理檔案 ${f} 時發生問題: ${error instanceof Error ? error.message : String(error)}`);
        stats.errorCount++;
      }
    }
    
    // 顯示結果
    console.log('\n===== 處理結果 =====');
    console.log(`成功處理: ${stats.successCount} 個檔案`);
    console.log(`跳過處理: ${stats.skipCount} 個檔案`);
    console.log(`處理失敗: ${stats.errorCount} 個檔案`);
    
  } catch (error) {
    console.error(`錯誤: 處理檔案 directory scan 時發生問題: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
} 
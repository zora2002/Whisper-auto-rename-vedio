import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { WhisperModel } from '../types/index.js';
import CONFIG from '../helper/config.js';

const execAsync = util.promisify(exec);

/**
 * 尋找 Whisper 輸出的 .txt 暫存檔
 */
function findTextFile(inputFile: string): string | null {
  const dir = path.dirname(inputFile);
  const baseName = path.basename(inputFile, path.extname(inputFile));
  const candidates = [
    path.join(dir, `${baseName}.txt`),
    `${inputFile}.txt`,
    inputFile.replace('.mp4', '.txt'),
    `${baseName}.txt`,
  ];
  return candidates.find(f => fs.existsSync(f)) ?? null;
}

/**
 * 呼叫本地 Whisper CLI 進行語音辨識，回傳辨識文字
 * spec: transcriber
 */
export async function transcribe(inputFile: string, model: WhisperModel): Promise<string> {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`找不到影片檔案: ${inputFile}`);
  }

  const verboseFlag = CONFIG.whisper.verbose ? '--verbose' : '';
  const outputDir = path.dirname(inputFile);
  const command = `whisper "${inputFile}" --model ${model} --language ${CONFIG.whisper.language} --output_format ${CONFIG.whisper.outputFormat} --output_dir "${outputDir}" --clip_timestamps "0,15" ${verboseFlag}`.trim();

  let txtFile: string | null = null;

  try {
    const { stderr } = await execAsync(command, {
      maxBuffer: CONFIG.whisper.maxBuffer,
      timeout: CONFIG.whisper.timeout,
      env: {
        ...process.env,
        PYTHONIOENCODING: CONFIG.env.pythonEncoding,
        PYTHONUTF8: CONFIG.env.pythonUtf8,
      },
      encoding: 'utf8',
    });

    if (stderr && !stderr.includes('UnicodeEncodeError') && !stderr.includes('UserWarning')) {
      console.warn('⚠️ 錯誤輸出:', stderr);
    }

    txtFile = findTextFile(inputFile);
    if (!txtFile) {
      throw new Error('找不到轉換生成的文字檔');
    }

    return fs.readFileSync(txtFile, 'utf-8');
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('找不到')) {
      throw error;
    }
    throw new Error(`Whisper 執行失敗: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    const toDelete = txtFile ?? findTextFile(inputFile);
    if (toDelete && fs.existsSync(toDelete)) {
      try {
        fs.unlinkSync(toDelete);
      } catch (e) {
        console.warn('⚠️ 清理暫存檔失敗:', e instanceof Error ? e.message : String(e));
      }
    }
  }
}

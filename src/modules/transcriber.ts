import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import util from 'util';
import { WhisperModel } from '../types/index.js';
import CONFIG from '../helper/config.js';

const execAsync = util.promisify(exec);

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
 * 用 ffmpeg 截取影片前 N 秒，回傳暫存檔路徑
 */
async function trimVideo(inputFile: string, seconds: number): Promise<string> {
  const tmpFile = path.join(os.tmpdir(), `whisper_trim_${Date.now()}.mp4`);
  const command = `ffmpeg -y -i "${inputFile}" -t ${seconds} -c copy "${tmpFile}" -loglevel error`;
  await execAsync(command);
  return tmpFile;
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
  let trimmedFile: string | null = null;
  let txtFile: string | null = null;

  try {
    trimmedFile = await trimVideo(inputFile, CONFIG.whisper.clipSeconds);
    const outputDir = os.tmpdir();
    const command = `whisper "${trimmedFile}" --model ${model} --language ${CONFIG.whisper.language} --output_format ${CONFIG.whisper.outputFormat} --output_dir "${outputDir}" ${verboseFlag}`.trim();

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

    txtFile = findTextFile(trimmedFile);
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
    if (trimmedFile && fs.existsSync(trimmedFile)) {
      try { fs.unlinkSync(trimmedFile); } catch { /* ignore */ }
    }
    if (txtFile && fs.existsSync(txtFile)) {
      try { fs.unlinkSync(txtFile); } catch { /* ignore */ }
    }
  }
}

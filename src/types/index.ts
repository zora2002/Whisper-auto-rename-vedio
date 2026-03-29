/**
 * Whisper 模型枚舉
 */
export enum WhisperModel {
  tiny = 'tiny',
  base = 'base',
  small = 'small',
  medium = 'medium',
  large = 'large'
}

/**
 * 處理統計
 */
export interface ProcessingStats {
  successCount: number;
  skipCount: number;
  errorCount: number;
}

/**
 * transcriber 選項
 */
export interface TranscribeOptions {
  model: WhisperModel;
  language: string;
  outputFormat: string;
  verbose: boolean;
  timeout: number;
  maxBuffer: number;
}

/**
 * renamer 結果
 */
export interface RenameResult {
  inputFile: string;
  outputFile: string;
}

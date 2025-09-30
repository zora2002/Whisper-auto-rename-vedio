import { Dayjs } from 'dayjs';

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
 * 檔案掃描結果
 */
export interface FileScanResult {
  totalFiles: number;
  targetFiles: string[];
}

/**
 * 處理統計
 */
export interface ProcessingStats {
  successCount: number;
  skipCount: number;
  errorCount: number;
  beginTime: Dayjs | null;
  endTime: Dayjs | null;
}

/**
 * 處理結果
 */
export interface ProcessingResult {
  success: boolean;
  message: string;
  error?: Error;
}

/**
 * Whisper 處理選項
 */
export interface WhisperOptions {
  model: WhisperModel;
  maxNameLength?: number;
}

/**
 * 檔案處理選項
 */
export interface FileProcessingOptions {
  inputFile: string;
  whisperOptions: WhisperOptions;
}

/**
 * 文字處理結果
 */
export interface TextProcessingResult {
  originalText: string;
  cleanedText: string;
  traditionalText: string;
  safeName: string;
}

/**
 * 錯誤類型
 */
export enum ErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  WHISPER_EXECUTION_FAILED = 'WHISPER_EXECUTION_FAILED',
  TEXT_PROCESSING_FAILED = 'TEXT_PROCESSING_FAILED',
  FILE_OPERATION_FAILED = 'FILE_OPERATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}

/**
 * 自定義錯誤
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// WhisperModel 已在上面定義 
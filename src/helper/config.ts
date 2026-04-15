import { WhisperModel } from '../types/index.js';

// ===== 配置 =====

const CONFIG = {
  whisper: {
    defaultModel: WhisperModel.medium,
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

export default CONFIG
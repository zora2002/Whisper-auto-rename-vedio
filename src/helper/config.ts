import { WhisperModel } from '../types/index.js';

// ===== 配置 =====

const CONFIG = {
  whisper: {
    defaultModel: WhisperModel.medium,
    language: 'zh',
    outputFormat: 'txt',
    verbose: false,
    clipSeconds: 15,
    timeout: 5 * 60 * 1000, // 5分鐘
    maxBuffer: 1024 * 1024 * 10 // 10MB
  },
  
  file: {
    maxNameLength: 20,
    supportedExtensions: ['.mp4'],
    filePatterns: [/^\d{6}_\d{8}\.mp4$/],
    embeddedDatetimeWithUnderscoreSecondsPattern: /_(\d{8})_(\d{6})((?:_\d+)+)\.mp4$/,
    embeddedDatetimeWithParenSecondsPattern: /_(\d{8})_(\d{6})\((\d+)\)\.mp4$/,
    embeddedDatetimePattern: /_(\d{8})_(\d{6})\.mp4$/
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
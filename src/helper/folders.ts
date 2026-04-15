import fs from 'fs';
import path from 'path';

export const NOTYET_DIR = 'rename-notyet';
export const RESULT_DIR = 'rename-result';
export const SUCCESS_DIR = path.join(RESULT_DIR, 'success');
export const FAIL_DIR = path.join(RESULT_DIR, 'fail');

export function ensureFolders(baseDir: string): void {
  for (const dir of [NOTYET_DIR, SUCCESS_DIR, FAIL_DIR]) {
    fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
  }
}

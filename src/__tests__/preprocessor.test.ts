import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';
import { preprocessFiles } from '../modules/preprocessor.js';

const mockRenameSync = vi.mocked(fs.renameSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('preprocessFiles', () => {
  describe('Screen Recording 格式轉換', () => {
    it('將 Screen_Recording_YYYYMMDD_HHMMSS.mp4 轉換為 HHMMSS_YYYYMMDD.mp4', () => {
      const result = preprocessFiles(['Screen_Recording_20250719_070442.mp4'], '/base');

      expect(result).toEqual(['070442_20250719.mp4']);
      expect(mockRenameSync).toHaveBeenCalledWith(
        path.join('/base', 'Screen_Recording_20250719_070442.mp4'),
        path.join('/base', '070442_20250719.mp4')
      );
    });

    it('非 Screen Recording 格式的檔案原封不動回傳', () => {
      const result = preprocessFiles(['070442_20250719.mp4'], '/base');

      expect(result).toEqual(['070442_20250719.mp4']);
      expect(mockRenameSync).not.toHaveBeenCalled();
    });
  });

  describe('Screen Recording with Seconds 格式轉換（秒數加總）', () => {
    it('將秒數加總後加到時間上', () => {
      // 070442 + 10 + 20 = 07:04:42 + 30s = 07:05:12
      const result = preprocessFiles(['Screen_Recording_20250719_070442_10_20.mp4'], '/base');

      expect(result).toEqual(['070512_20250719.mp4']);
    });

    it('秒數加總後跨分鐘進位', () => {
      // 070442 + 60 = 07:05:42
      const result = preprocessFiles(['Screen_Recording_20250719_070442_60.mp4'], '/base');

      expect(result).toEqual(['070542_20250719.mp4']);
    });

    it('秒數加總後跨日期進位', () => {
      // 235950 + 30 = 00:00:20 隔天
      const result = preprocessFiles(['Screen_Recording_20250719_235950_30.mp4'], '/base');

      expect(result).toEqual(['000020_20250720.mp4']);
    });

    it('單一秒數片段', () => {
      // 070442 + 18 = 07:05:00
      const result = preprocessFiles(['Screen_Recording_20250719_070442_18.mp4'], '/base');

      expect(result).toEqual(['070500_20250719.mp4']);
    });
  });

  describe('混合陣列', () => {
    it('混合格式的陣列各自正確轉換', () => {
      const result = preprocessFiles([
        'Screen_Recording_20250719_070442.mp4',
        '080000_20250720.mp4',
        'Screen_Recording_20250719_090000_30.mp4',
      ], '/base');

      expect(result[0]).toBe('070442_20250719.mp4');
      expect(result[1]).toBe('080000_20250720.mp4');
      expect(result[2]).toBe('090030_20250719.mp4');
      expect(mockRenameSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('錯誤處理', () => {
    it('fs.renameSync 失敗時拋出包裝錯誤', () => {
      mockRenameSync.mockImplementation(() => { throw new Error('disk full'); });

      expect(() =>
        preprocessFiles(['Screen_Recording_20250719_070442.mp4'], '/base')
      ).toThrow('重命名檔案失敗: disk full');
    });
  });
});

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
  describe('含時間戳記的一般命名', () => {
    it('將 任意前綴_YYYYMMDD_HHMMSS.mp4 轉換為 HHMMSS_YYYYMMDD.mp4', () => {
      const result = preprocessFiles(['花東旅行_20260417_221133.mp4'], '/base');

      expect(result).toEqual(['221133_20260417.mp4']);
      expect(mockRenameSync).toHaveBeenCalledWith(
        path.join('/base', '花東旅行_20260417_221133.mp4'),
        path.join('/base', '221133_20260417.mp4')
      );
    });

    it('含 _N 秒數後綴時加總秒數', () => {
      const result = preprocessFiles(['花東旅行_20260417_221133_1.mp4'], '/base');

      expect(result).toEqual(['221134_20260417.mp4']);
    });

    it('含 (N) 秒數後綴時加秒數', () => {
      const result = preprocessFiles(['花東旅行_20260417_221133(1).mp4'], '/base');

      expect(result).toEqual(['221134_20260417.mp4']);
    });

    it('含多個 _N 秒數後綴時加總', () => {
      // 07:04:42 + 10 + 20 = 07:05:12
      const result = preprocessFiles(['影片_20250719_070442_10_20.mp4'], '/base');

      expect(result).toEqual(['070512_20250719.mp4']);
    });

    it('秒數加總後跨分鐘進位', () => {
      const result = preprocessFiles(['影片_20250719_070458_5.mp4'], '/base');

      expect(result).toEqual(['070503_20250719.mp4']);
    });

    it('秒數加總後跨日期進位', () => {
      const result = preprocessFiles(['影片_20250719_235950_30.mp4'], '/base');

      expect(result).toEqual(['000020_20250720.mp4']);
    });
  });

  describe('不含時間戳記的一般命名', () => {
    it('一般中文命名不變', () => {
      const result = preprocessFiles(['花東旅行.mp4'], '/base');

      expect(result).toEqual(['花東旅行.mp4']);
      expect(mockRenameSync).not.toHaveBeenCalled();
    });

    it('已是標準格式 HHMMSS_YYYYMMDD.mp4 不變', () => {
      const result = preprocessFiles(['070442_20250719.mp4'], '/base');

      expect(result).toEqual(['070442_20250719.mp4']);
      expect(mockRenameSync).not.toHaveBeenCalled();
    });
  });

  describe('混合陣列', () => {
    it('混合格式的陣列各自正確處理', () => {
      const result = preprocessFiles([
        '貓狗_20260417_221133.mp4',
        '貓狗.mp4',
        '影片_20250719_070442_10_20.mp4',
        '080000_20250720.mp4',
      ], '/base');

      expect(result[0]).toBe('221133_20260417.mp4');
      expect(result[1]).toBe('貓狗.mp4');
      expect(result[2]).toBe('070512_20250719.mp4');
      expect(result[3]).toBe('080000_20250720.mp4');
      expect(mockRenameSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('錯誤處理', () => {
    it('fs.renameSync 失敗時拋出包裝錯誤', () => {
      mockRenameSync.mockImplementation(() => { throw new Error('disk full'); });

      expect(() =>
        preprocessFiles(['貓狗_20260417_221133.mp4'], '/base')
      ).toThrow('重命名檔案失敗: disk full');
    });
  });
});

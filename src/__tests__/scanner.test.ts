import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs');

import fs from 'fs';
import { scanDirectory } from '../modules/scanner.js';

type ReaddirReturn = ReturnType<typeof fs.readdirSync>;

const mockReaddirSync = vi.mocked(fs.readdirSync);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scanDirectory', () => {
  it('回傳所有 .mp4 檔案', () => {
    mockReaddirSync.mockReturnValue(['070442_20250719.mp4', 'notes.txt'] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toEqual(['070442_20250719.mp4']);
  });

  it('回傳 Screen Recording 格式的檔案', () => {
    mockReaddirSync.mockReturnValue(['Screen_Recording_20250719_070442.mp4', 'other.mp4'] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toEqual(['Screen_Recording_20250719_070442.mp4', 'other.mp4']);
  });

  it('回傳一般中文檔名的 .mp4 檔案', () => {
    mockReaddirSync.mockReturnValue(['賓士貓柴犬火車旅行影片.mp4', 'notes.txt'] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toEqual(['賓士貓柴犬火車旅行影片.mp4']);
  });

  it('目錄中沒有 .mp4 時回傳空陣列', () => {
    mockReaddirSync.mockReturnValue(['readme.md', 'notes.txt'] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toEqual([]);
  });

  it('目錄為空時回傳空陣列', () => {
    mockReaddirSync.mockReturnValue([] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toEqual([]);
  });

  it('同時有多種格式時全部回傳', () => {
    mockReaddirSync.mockReturnValue([
      '070442_20250719.mp4',
      'Screen_Recording_20250719_080000.mp4',
      'Screen_Recording_20250719_090000_5_10.mp4',
      '賓士貓柴犬火車旅行影片.mp4',
      'unrelated.txt',
    ] as unknown as ReaddirReturn);

    const result = scanDirectory('/some/dir');

    expect(result).toHaveLength(4);
    expect(result).not.toContain('unrelated.txt');
  });

  it('fs.readdirSync 拋出錯誤時包裝後重新拋出', () => {
    mockReaddirSync.mockImplementation(() => { throw new Error('permission denied'); });

    expect(() => scanDirectory('/no/access')).toThrow('掃描目錄失敗: permission denied');
  });
});

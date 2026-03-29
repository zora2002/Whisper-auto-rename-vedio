import { describe, it, expect, vi, beforeEach } from 'vitest';

// 必須在 import 模組前先宣告 mock
vi.mock('fs');

import fs from 'fs';
import { renameFile } from '../modules/renamer.js';

const mockExistsSync = vi.mocked(fs.existsSync);
const mockRenameSync = vi.mocked(fs.renameSync);

beforeEach(() => {
  vi.clearAllMocks();
  // 預設：目標檔名不存在（無衝突）
  mockExistsSync.mockReturnValue(false);
});

describe('renameFile', () => {
  it('正常重新命名', () => {
    renameFile('070442_20250719.mp4', '今天天氣很好真的很不錯啊');

    expect(mockRenameSync).toHaveBeenCalledOnce();
    const [oldName, newName] = mockRenameSync.mock.calls[0] as [string, string];
    expect(oldName).toBe('070442_20250719.mp4');
    expect(newName).toContain('今天天氣很好真的很不錯啊');
    expect(newName).toContain('070442_20250719.mp4');
  });

  it('文字超過 20 字時截斷', () => {
    const longText = '一二三四五六七八九十一二三四五六七八九十二十一';
    renameFile('070442_20250719.mp4', longText);

    const [, newName] = mockRenameSync.mock.calls[0] as [string, string];
    // 取得 newName 中 safeName 的部分（底線前）
    const safePart = newName.split('_')[0];
    expect([...safePart].length).toBeLessThanOrEqual(20);
  });

  it('移除不合法的檔名字元', () => {
    renameFile('070442_20250719.mp4', '標題/含:非法*字元');

    const [, newName] = mockRenameSync.mock.calls[0] as [string, string];
    expect(newName).not.toMatch(/[\\/:*?"<>|]/);
  });

  it('檔名衝突時加入計數器', () => {
    // 第一次檢查衝突，第二次不衝突
    mockExistsSync.mockReturnValueOnce(true).mockReturnValue(false);

    renameFile('070442_20250719.mp4', '衝突測試');

    const [, newName] = mockRenameSync.mock.calls[0] as [string, string];
    expect(newName).toContain('_1_');
  });

  it('processedText 為空時拋出錯誤', () => {
    // 所有字都是非法字元，safeName 會是空字串
    expect(() => renameFile('test.mp4', '/:*?"<>|')).toThrow('處理後檔名為空');
  });
});

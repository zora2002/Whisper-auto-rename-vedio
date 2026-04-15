import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs');

import fs from 'fs';
import path from 'path';
import { moveFile } from '../modules/mover.js';

const mockExistsSync = vi.mocked(fs.existsSync);
const mockRenameSync = vi.mocked(fs.renameSync);
const mockCopyFileSync = vi.mocked(fs.copyFileSync);
const mockUnlinkSync = vi.mocked(fs.unlinkSync);

beforeEach(() => {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(false);
});

describe('moveFile', () => {
  it('目標不存在時直接 rename', () => {
    moveFile('/src/foo.mp4', '/dest');

    expect(mockRenameSync).toHaveBeenCalledWith('/src/foo.mp4', path.join('/dest', 'foo.mp4'));
    expect(mockCopyFileSync).not.toHaveBeenCalled();
  });

  it('目標已存在時加 _1 後綴再移動', () => {
    mockExistsSync.mockReturnValueOnce(true).mockReturnValue(false);

    moveFile('/src/foo.mp4', '/dest');

    expect(mockRenameSync).toHaveBeenCalledWith('/src/foo.mp4', path.join('/dest', 'foo_1.mp4'));
  });

  it('連續衝突時計數器遞增到可用的後綴', () => {
    // foo.mp4 和 foo_1.mp4 都已存在，foo_2.mp4 才可用
    mockExistsSync
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(false);

    moveFile('/src/foo.mp4', '/dest');

    expect(mockRenameSync).toHaveBeenCalledWith('/src/foo.mp4', path.join('/dest', 'foo_2.mp4'));
  });

  it('跨磁碟時 renameSync 失敗後改用 copy + delete', () => {
    mockRenameSync.mockImplementation(() => { throw new Error('EXDEV: cross-device link not permitted'); });

    moveFile('/src/foo.mp4', '/dest');

    expect(mockCopyFileSync).toHaveBeenCalledWith('/src/foo.mp4', path.join('/dest', 'foo.mp4'));
    expect(mockUnlinkSync).toHaveBeenCalledWith('/src/foo.mp4');
  });

  it('跨磁碟 fallback 時目標路徑與 rename 一致', () => {
    mockRenameSync.mockImplementation(() => { throw new Error('EXDEV'); });

    moveFile('/src/bar.mp4', '/other-drive/dest');

    const expectedDest = path.join('/other-drive/dest', 'bar.mp4');
    expect(mockCopyFileSync).toHaveBeenCalledWith('/src/bar.mp4', expectedDest);
    expect(mockUnlinkSync).toHaveBeenCalledWith('/src/bar.mp4');
  });

  it('跨磁碟且有衝突時 fallback 路徑也帶後綴', () => {
    mockExistsSync.mockReturnValueOnce(true).mockReturnValue(false);
    mockRenameSync.mockImplementation(() => { throw new Error('EXDEV'); });

    moveFile('/src/foo.mp4', '/dest');

    expect(mockCopyFileSync).toHaveBeenCalledWith('/src/foo.mp4', path.join('/dest', 'foo_1.mp4'));
    expect(mockUnlinkSync).toHaveBeenCalledWith('/src/foo.mp4');
  });
});

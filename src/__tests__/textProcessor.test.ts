import { describe, it, expect } from 'vitest';
import { cleanText } from '../modules/textProcessor.js';

describe('cleanText', () => {
  it('移除 VTT 時間戳記', () => {
    const input = '[00:00.000 --> 00:05.000] 今天天氣很好';
    expect(cleanText(input)).toBe('今天天氣很好');
  });

  it('多行文字用中文逗號連接', () => {
    const input = '[00:00.000 --> 00:05.000] 今天天氣\n[00:05.000 --> 00:10.000] 真的很好';
    expect(cleanText(input)).toBe('今天天氣，真的很好');
  });

  it('英文逗號轉換為中文逗號', () => {
    const input = '[00:00.000 --> 00:03.000] 一,二,三';
    expect(cleanText(input)).toBe('一，二，三');
  });

  it('結尾不因換行產生多餘逗號', () => {
    const input = '[00:00.000 --> 00:05.000] 結尾測試\n';
    expect(cleanText(input)).toBe('結尾測試');
  });

  it('不會砍掉正常內容的最後一個字', () => {
    const input = '[00:00.000 --> 00:05.000] 測試文字結束';
    const result = cleanText(input);
    expect(result).toBe('測試文字結束');
    expect(result.endsWith('束')).toBe(true);
  });

  it('空字串輸入回傳空字串', () => {
    expect(cleanText('')).toBe('');
  });

  it('只有時間戳記時回傳空字串', () => {
    const input = '[00:00.000 --> 00:05.000]';
    expect(cleanText(input)).toBe('');
  });
});

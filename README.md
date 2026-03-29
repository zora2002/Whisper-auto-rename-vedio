# Whisper 自動重命名影片工具

## OpenAI Whisper 等級

- `tiny` - 最快，但準確度較低
- `base` - 平衡速度和準確度
- `small` - 較高準確度
- `medium` - 高準確度（預設）
- `large` - 最高準確度，但較慢


## MP4 影片處理規則

- 標準格式 `HHMMSS_YYYYMMDD.mp4`
- Screen Recording 格式 `Screen_Recording_YYYYMMDD_HHMMSS.mp4` 
  - 自動轉換為 `HHMMSS_YYYYMMDD.mp4` 格式後再進行處理
- Screen Recording 帶秒數調整格式 `Screen_Recording_YYYYMMDD_HHMMSS_數字.mp4`
  - 自動轉換為 `HHMMSS_YYYYMMDD.mp4` 格式後再進行處理
  - 支援多個數字，如 `_1_2_3` 會加總秒數 (1+2+3=6秒)

處理範例:
```
Screen_Recording_20250719_070442.mp4     → 070442_20250719.mp4
Screen_Recording_20250719_070442_1.mp4   → 070443_20250719.mp4 (加1秒)
Screen_Recording_20250719_070442_1_2.mp4 → 070445_20250719.mp4 (加3秒)
Screen_Recording_20250719_070442_1_2_3.mp4 → 070448_20250719.mp4 (加6秒)
```

## 啟動

```bash
npm run dev
```


## 工作流程

1. 檔案掃描: 掃描指定目錄中的 MP4 檔案
2. 格式識別: 識別檔案命名模式 (標準格式、Screen Recording 格式)
3. 預處理: 將 Screen Recording 格式轉換為標準格式
4. 語音識別: 使用 Whisper 模型進行語音轉文字
5. 文字處理: 清理文字內容並轉換為繁體中文
6. 檔案重命名: 根據語音內容生成新的檔案名稱
7. 統計報告: 顯示處理結果和執行時間

## Why

目前重新命名後的影片檔名格式固定為「影片內容文字」，無法保留原始錄製時間資訊。當原始檔名包含錄製時間戳記（如 `YYYYMMDD_HHMMSS`）時，應將時間資訊整合至新檔名，方便使用者依時間排序和識別影片。

## What Changes

- `file-scanner` 改為接受所有 `.mp4` 檔案，不再限制特定命名格式，讓一般命名的影片也能進入流程
- `file-preprocessor` 擴充為偵測任意檔名中是否包含 `_YYYYMMDD_HHMMSS` 時間戳記格式：
  - 若包含，提取日期時間並標準化為 `HHMMSS_YYYYMMDD.mp4`
  - 若帶有 `_N` 或 `(N)` 後綴，將數字加總後加到時間上再輸出
  - 若不包含，原封不動保留
- `file-renamer` 依據 preprocessor 輸出的檔名是否符合 `HHMMSS_YYYYMMDD` 格式，決定最終命名：
  - 符合：`影片內容文字_HHMMSS_YYYYMMDD`
  - 不符合：`影片內容文字`

## Capabilities

### New Capabilities

- `filename-datetime-detection`: 解析原始檔名中的 `YYYYMMDD_HHMMSS` 時間戳記格式，並決定最終檔名結構

### Modified Capabilities

- `file-renamer`: 重新命名邏輯需依據是否含時間戳記而輸出不同格式的新檔名
- `file-scanner`: 擴大掃描範圍至所有 `.mp4` 檔案（原本只接受特定命名格式）
- `file-preprocessor`: 支援 Screen Recording 帶有 `(N)` 後綴的變體格式

## Impact

- `file-renamer` 模組（核心重新命名邏輯）
- `file-scanner` 模組（掃描過濾條件）
- `file-preprocessor` 模組（pattern 設定，位於 config）
- 相關單元測試需新增對應測試案例

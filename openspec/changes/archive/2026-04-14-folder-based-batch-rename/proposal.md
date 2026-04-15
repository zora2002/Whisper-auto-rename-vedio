## Why

使用者目前需要手動指定影片路徑，缺乏直覺的批次處理工作流程，且無法清楚區分處理成功與失敗的影片。透過建立標準化的資料夾結構，使用者只需將影片丟入 `rename-notyet/`、執行指令，系統自動完成轉錄重新命名，並依結果分類移至 `rename-result/success/` 或 `rename-result/fail/`。

## What Changes

- 新增 `rename-notyet/` 資料夾作為待處理影片的輸入目錄
- 新增 `rename-result/success/` 資料夾存放處理成功並重新命名的影片
- 新增 `rename-result/fail/` 資料夾存放處理失敗的影片（保留原檔名）
- 執行指令後，自動掃描 `rename-notyet/` 並批次處理
- 初始化時若上述資料夾不存在則自動建立

## Capabilities

### New Capabilities
- `folder-batch-processing`: 掃描 `rename-notyet/` 中的影片，逐一透過 Whisper 轉錄重新命名，成功移至 `rename-result/success/`，失敗移至 `rename-result/fail/`

### Modified Capabilities

## Impact

- `src/modules/processor.ts`：改為以 `rename-notyet/` 為輸入、`rename-result/` 為輸出的處理流程
- `src/index.ts`：調整主流程使用新的資料夾結構
- 現有的目錄掃描邏輯（`scanner.ts`）改為掃描 `rename-notyet/` 子資料夾

## Context

目前 `processDirectory()` 掃描當前工作目錄（`process.cwd()`）中符合命名模式的影片檔，處理完成後直接在原位重新命名，沒有明確的「待處理 / 已完成 / 失敗」分離機制。

現有模組架構：
- `scanner.ts`：掃描目錄、過濾符合模式的檔案
- `processor.ts`：協調整個處理流程（掃描 → 預處理 → 轉錄 → 文字處理 → 重新命名）
- `renamer.ts`：重新命名檔案（目前在原目錄操作）
- `index.ts`：CLI 入口，支援 `--model` 參數

## Goals / Non-Goals

**Goals:**
- 執行指令後自動掃描 `rename-notyet/`，完成後依結果移至 `rename-result/success/` 或 `rename-result/fail/`
- 首次執行時若資料夾不存在則自動建立
- 保留 `--model` 旗標選擇 Whisper 模型

**Non-Goals:**
- 不實作監聽模式（watch mode）
- 不處理 `rename-notyet/` 的子資料夾
- 不修改 Whisper 轉錄或文字處理邏輯

## Decisions

**決策 1：資料夾路徑固定相對於 `process.cwd()`**

`rename-notyet/`、`rename-result/success/`、`rename-result/fail/` 固定建立在執行指令的當前目錄下，與現有行為一致，無需額外設定。

**決策 2：處理成功 → 重新命名後移至 success；失敗 → 原檔名移至 fail**

- 成功：先在 `rename-notyet/` 內重新命名，再 `fs.renameSync` 移至 `rename-result/success/`
- 失敗：直接 `fs.renameSync` 移至 `rename-result/fail/`（保留原檔名，方便排查）

**決策 3：移動前檢查目標路徑衝突，加數字後綴避免覆蓋**

`rename-result/success/` 或 `rename-result/fail/` 若已存在同名檔案，自動加上 `_1`、`_2` 後綴。

## Risks / Trade-offs

- **rename-notyet 為空**：直接印出提示訊息並結束，不視為錯誤。
- **部分失敗**：批次中某檔案失敗時其餘繼續處理（現有行為保留），失敗檔移至 `fail/` 方便重試。
- **跨磁碟移動**：Windows 上 `fs.renameSync` 跨磁碟會失敗 → 緩解：改用 copy + delete 作為 fallback。

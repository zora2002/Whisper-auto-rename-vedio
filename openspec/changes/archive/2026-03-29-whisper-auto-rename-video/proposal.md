## Why

現有程式碼直接以程序式方式撰寫，缺乏明確的規格定義與模組邊界，導致維護與擴充困難。以 SDD（Specification-Driven Development）重新開發，先定義規格再實作，確保每個模組的職責清晰、行為可驗證。

## What Changes

- 重新定義每個核心模組的規格（輸入/輸出/行為）
- 以規格為基礎重新實作 `scanner`、`preprocessor`、`transcriber`、`text-processor`、`renamer` 五個模組
- 主流程 `processor` 改為串接上述模組的協調器
- 移除直接執行本地 `whisper` CLI 的耦合，改為可替換的 transcriber 介面
- 統一錯誤處理與日誌輸出格式

## Capabilities

### New Capabilities

- `file-scanner`: 掃描目錄並過濾符合命名模式的 MP4 檔案
- `file-preprocessor`: 將 Screen Recording 格式轉換為標準 `HHMMSS_YYYYMMDD.mp4` 格式（含秒數加總）
- `transcriber`: 呼叫本地 Whisper CLI 進行語音轉文字，輸出純文字
- `text-processor`: 清理 Whisper 輸出文字、移除時間戳記、轉換繁體中文
- `file-renamer`: 根據處理後文字產生安全檔名並執行重命名

### Modified Capabilities

（無，此為全新 SDD 結構，原始碼不保留現有規格）

## Impact

- `src/modules/processor.ts`：重構為協調器，不再包含業務邏輯
- `src/helper/`：現有 helper 依規格拆分或合併至對應模組
- `src/types/index.ts`：補充各模組的輸入/輸出型別定義
- 依賴不變：`opencc-js`（繁簡轉換）、本地 `whisper` CLI

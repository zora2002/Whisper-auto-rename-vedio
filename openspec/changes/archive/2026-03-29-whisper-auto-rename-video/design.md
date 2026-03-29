## Context

現有程式碼將掃描、預處理、語音辨識、文字處理、重命名全部混在 `processor.ts` 與 `helper/` 中，沒有明確的模組邊界與介面定義。重構目標是以 SDD 方式，先定義每個模組的規格，再依規格實作，讓每個模組可獨立測試與替換。

技術棧：TypeScript + Node.js 22+、tsx（開發執行）、opencc-js（繁簡轉換）、本地 `whisper` CLI。

## Goals / Non-Goals

**Goals:**
- 定義五個核心模組的明確介面（輸入/輸出型別）
- 每個模組職責單一，可獨立呼叫
- `processor.ts` 僅作為流程協調器，不含業務邏輯
- 保留現有所有功能（掃描、預處理、語音辨識、文字處理、重命名）

**Non-Goals:**
- 替換 Whisper 為雲端 API（維持本地 CLI）
- 加入單元測試框架
- 支援 MP4 以外的格式
- GUI 或 Web 介面

## Decisions

### 模組拆分為獨立檔案

各模組放在 `src/modules/` 下，每個檔案只 export 一個主函式：

| 模組 | 檔案 | 主函式 |
|------|------|--------|
| file-scanner | `src/modules/scanner.ts` | `scanDirectory(dir): string[]` |
| file-preprocessor | `src/modules/preprocessor.ts` | `preprocessFiles(files): string[]` |
| transcriber | `src/modules/transcriber.ts` | `transcribe(file, model): string` |
| text-processor | `src/modules/textProcessor.ts` | `processText(raw): Promise<string>` |
| file-renamer | `src/modules/renamer.ts` | `renameFile(file, name): void` |

**理由**：比 `helper/` 散落更易追蹤依賴；函式簽名即是規格。

### 型別集中定義

所有模組共用的型別（`WhisperModel`、`ProcessingStats`、各模組 input/output）統一放在 `src/types/index.ts`。

**理由**：避免循環依賴，讓型別成為規格的機器可讀形式。

### processor.ts 只做協調

```
scanDirectory → preprocessFiles → (for each file) transcribe → processText → renameFile
```

不含任何業務判斷，只負責串接與錯誤彙總。

**理由**：業務邏輯下沉到各模組，processor 改動頻率最低。

### 保留 config.ts 作為全域設定

CONFIG 集中管理 whisper 參數、檔案模式、文字清理規則，各模組 import 使用。

**理由**：避免魔法數字散落各處；未來要改參數只需改一個地方。

## Risks / Trade-offs

- **本地 whisper CLI 依賴** → 使用者需自行安裝 Python + whisper；無法在 CI 環境自動執行。Mitigation：README 補充安裝說明，錯誤訊息明確指出 CLI 未找到。
- **opencc-js 轉換失敗 silent fallback** → 目前轉換失敗只 warn 不 throw，可能產生簡體檔名。Mitigation：spec 中明確定義轉換失敗時行為（回傳原文）。

## Migration Plan

1. 建立 `src/modules/` 目錄結構（新增五個模組檔案）
2. 將 `src/helper/preprocessFiles.ts` 邏輯移至 `preprocessor.ts`
3. 將 `src/helper/processText.ts` 邏輯移至 `textProcessor.ts`
4. 將 `processor.ts` 中的 whisper 邏輯移至 `transcriber.ts`
5. 將 `processor.ts` 中的掃描邏輯移至 `scanner.ts`
6. 將 `processor.ts` 中的重命名邏輯移至 `renamer.ts`
7. 重寫 `processor.ts` 為協調器
8. 移除 `src/helper/` 目錄

## Open Questions

- 是否需要保留 `src/helper/dayjs.ts`？（目前未見被使用）

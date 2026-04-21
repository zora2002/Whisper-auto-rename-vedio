## Context

使用者的影片檔名可能包含 `_YYYYMMDD_HHMMSS` 時間戳記格式（位於檔名任意位置），也可能是純文字命名。Pipeline 需要統一在 preprocessor 階段偵測並標準化，讓 renamer 只需判斷輸出格式。

Pipeline 流程：
1. `file-scanner`：接受所有 `.mp4` 檔案
2. `file-preprocessor`：偵測檔名中是否包含 `_YYYYMMDD_HHMMSS` 格式，若有則標準化為 `HHMMSS_YYYYMMDD.mp4`；`_N` 或 `(N)` 後綴代表需加總的秒數
3. `file-renamer`：接收 preprocessor 輸出，若基名符合 `HHMMSS_YYYYMMDD` 則輸出 `<文字>_HHMMSS_YYYYMMDD.mp4`，否則輸出 `<文字>.mp4`

## Goals / Non-Goals

**Goals:**
- scanner 接受所有 `.mp4` 檔案，讓任意命名的影片都能進入 pipeline
- preprocessor 偵測檔名中任意位置的 `_YYYYMMDD_HHMMSS` 時間戳記，標準化為 `HHMMSS_YYYYMMDD.mp4`
- `_N` 和 `(N)` 後綴皆視為秒數，加總後加到時間上再輸出
- renamer 依 preprocessor 輸出決定是否附加時間戳記後綴

**Non-Goals:**
- 不支援其他時間格式（如 ISO 8601）
- 不對日期時間做合法性驗證（如月份、日期範圍）

## Decisions

### preprocessor 負責所有格式標準化，renamer 只做命名決策

preprocessor 是格式轉換的單一責任方，統一輸出 `HHMMSS_YYYYMMDD.mp4` 或原始檔名。renamer 只需檢查基名是否符合 `^\d{6}_\d{8}$` 即可，不需處理多種輸入格式。

### 偵測 `_YYYYMMDD_HHMMSS` 於任意位置（非全匹配）

使用非錨定 regex `/_(\d{8})_(\d{6})/` 偵測，不要求從檔名開頭或結尾完整匹配，因此 `貓狗_20260417_221133.mp4`、`Screen_Recording_20260417_221133.mp4` 等格式都能被偵測到。

### `_N` 和 `(N)` 統一視為秒數後綴

兩種寫法都代表秒數調整，一致處理可簡化邏輯並讓行為一致。

### scanner 改為副檔名過濾取代 pattern 白名單

原本 scanner 只接受符合特定命名規則的 `.mp4`，導致一般命名的影片被排除在外。改為只檢查副檔名是否為 `.mp4`（`supportedExtensions`），讓 preprocessor 和 renamer 負責各自的格式處理，職責分離更清晰。

## Risks / Trade-offs

- **誤判風險**：若檔名中剛好有八位數字接底線再六位數字的組合（非時間戳記），會被誤認為含時間戳記 → 可接受，機率極低
- **既有行為改變**：scanner 現在會選取目錄中所有 `.mp4`，若目錄存在不想處理的 `.mp4` 需手動移除 → 可接受，符合使用情境

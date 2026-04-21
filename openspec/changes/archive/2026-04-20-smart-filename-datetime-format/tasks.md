## 1. 實作時間戳記偵測函式

- [x] 1.1 在 `src/modules/renamer.ts` 中新增 `hasDatetimeStamp(baseName: string): boolean` 函式，使用 `/^\d{6}_\d{8}$/` regex 偵測格式
- [x] 1.2 匯出 `hasDatetimeStamp` 供測試使用

## 2. 修改重命名邏輯

- [x] 2.1 在 `renameFile` 中呼叫 `hasDatetimeStamp`，依結果決定是否附加原始基名後綴
- [x] 2.2 確認衝突後綴邏輯（`_1`、`_2`…）在兩種格式下皆正確運作

## 3. 重寫 preprocessor 為通用時間戳記偵測

- [x] 3.1 在 `src/helper/config.ts` 移除 Screen Recording 專用 pattern，新增三個通用 embedded datetime pattern（`_N` 秒數、`(N)` 秒數、基本格式）
- [x] 3.2 重寫 `src/modules/preprocessor.ts`，改為偵測檔名任意位置的 `_YYYYMMDD_HHMMSS`，依順序套用三個 pattern
- [x] 3.3 更新 `src/__tests__/preprocessor.test.ts`，以實際情境（含中文前綴、`(N)` 後綴）為主

## 4. 更新 scanner 接受所有 .mp4

- [x] 4.1 修改 `src/modules/scanner.ts`，改用 `supportedExtensions` 副檔名過濾，移除舊的 pattern 白名單邏輯
- [x] 4.2 更新 `src/__tests__/scanner.test.ts`，反映新行為並新增中文檔名測試

## 5. 更新 renamer 測試

- [x] 5.1 在 `src/__tests__/renamer.test.ts` 新增 `hasDatetimeStamp` 的單元測試（符合 / 不符合 / 位數錯誤 / 空字串）
- [x] 5.2 更新既有的 `renameFile` 測試，確認含時間戳記格式行為不變
- [x] 5.3 新增 `renameFile` 測試：不含時間戳記時，輸出僅為 `<safeName><ext>`
- [x] 5.4 新增 `renameFile` 測試：不含時間戳記且目標檔名衝突時，加上 `_1` 後綴

## 6. 驗證

- [x] 6.1 執行 `npm test` 確保所有測試通過
- [x] 6.2 執行 `npx tsc --noEmit` 確保型別檢查通過

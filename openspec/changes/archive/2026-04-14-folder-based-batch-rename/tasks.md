## 1. 資料夾初始化

- [x] 1.1 新增 `ensureFolders(baseDir)` 工具函式，建立 `rename-notyet/`、`rename-result/success/`、`rename-result/fail/`（使用 `fs.mkdirSync` with `recursive: true`）
- [x] 1.2 在 `index.ts` 的 `main()` 開頭呼叫 `ensureFolders(process.cwd())`

## 2. 掃描 rename-notyet

- [x] 2.1 修改 `scanner.ts` 的 `scanDirectory()`，接受目錄參數並掃描指定目錄（已有此能力，確認傳入 `rename-notyet/` 路徑即可）
- [x] 2.2 在 `processor.ts` 將掃描目錄改為 `path.join(baseDir, 'rename-notyet')`
- [x] 2.3 若掃描結果為空，印出提示訊息「rename-notyet 資料夾中沒有找到待處理的影片」並 return

## 3. 處理後移動檔案

- [x] 3.1 新增 `moveFile(src, destDir)` 工具函式：處理同名衝突（加 `_1`、`_2` 後綴），跨磁碟時 fallback 為 copy + delete
- [x] 3.2 修改 `processor.ts` 中成功處理後的邏輯：呼叫 `moveFile(renamedFile, successDir)`
- [x] 3.3 修改 `processor.ts` 中失敗處理後的邏輯：呼叫 `moveFile(originalFile, failDir)`

## 4. 調整 renamer.ts 回傳新路徑

- [x] 4.1 修改 `renameFile()` 回傳重新命名後的完整路徑（`string`），供 `processor.ts` 的移動步驟使用

## 5. 測試與驗證

- [x] 5.1 手動測試：將測試影片放入 `rename-notyet/`，執行 `npm run dev`，確認成功移至 `rename-result/success/`
- [x] 5.2 手動測試：放入無法辨識的檔案，確認失敗移至 `rename-result/fail/`
- [x] 5.3 確認 `rename-notyet/` 為空時有正確提示訊息

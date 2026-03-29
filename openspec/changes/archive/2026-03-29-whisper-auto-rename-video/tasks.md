## 1. 型別定義

- [x] 1.1 在 `src/types/index.ts` 補充各模組的輸入/輸出型別（`ScanResult`、`TranscribeOptions`、`RenameResult` 等）

## 2. file-scanner 模組

- [x] 2.1 建立 `src/modules/scanner.ts`，實作 `scanDirectory(dir: string): string[]`
- [x] 2.2 依 spec 支援三種命名模式過濾，移除原 `processor.ts` 中的掃描邏輯

## 3. file-preprocessor 模組

- [x] 3.1 建立 `src/modules/preprocessor.ts`，實作 `preprocessFiles(files: string[]): string[]`
- [x] 3.2 從 `src/helper/preprocessFiles.ts` 搬移邏輯，支援秒數後綴加總與跨分鐘進位
- [x] 3.3 刪除 `src/helper/preprocessFiles.ts`

## 4. transcriber 模組

- [x] 4.1 建立 `src/modules/transcriber.ts`，實作 `transcribe(inputFile: string, model: WhisperModel): Promise<string>`
- [x] 4.2 從 `processor.ts` 搬移 `runWhisper`、`findTextFile` 邏輯
- [x] 4.3 確保暫存 `.txt` 檔案在成功與失敗時都會被清除

## 5. text-processor 模組

- [x] 5.1 建立 `src/modules/textProcessor.ts`，實作 `processText(raw: string): Promise<string>`
- [x] 5.2 從 `src/helper/processText.ts` 搬移清理與繁簡轉換邏輯
- [x] 5.3 刪除 `src/helper/processText.ts`

## 6. file-renamer 模組

- [x] 6.1 建立 `src/modules/renamer.ts`，實作 `renameFile(inputFile: string, processedText: string): void`
- [x] 6.2 從 `processor.ts` 搬移重命名邏輯，含非法字元清理與衝突後綴處理

## 7. processor 重構為協調器

- [x] 7.1 重寫 `src/modules/processor.ts`，串接 scanner → preprocessor → transcriber → textProcessor → renamer
- [x] 7.2 移除 processor 中所有業務邏輯，只保留流程控制與統計彙總

## 8. 清理

- [x] 8.1 確認 `src/helper/dayjs.ts` 是否被使用，若無則刪除
- [x] 8.2 若 `src/helper/` 目錄已空則刪除
- [x] 8.3 執行 `npm run build` 確認 TypeScript 編譯無錯誤
- [ ] 8.4 執行 `npm run dev` 於含 MP4 的目錄，確認端對端流程正常

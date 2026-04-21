## MODIFIED Requirements

### Requirement: 根據文字內容產生安全檔名並重命名
`renameFile(inputFile: string, processedText: string): string` SHALL：
1. 取 `processedText` 前 `maxNameLength`（預設 20）個字元
2. 移除 Windows/Unix 非法檔名字元（`\ / : * ? " < > |`）
3. 移除中文標點（`。！？；：、`）及英文標點（`, . ! ? ; :`）
4. 判斷 `inputFile` 的基名（不含副檔名）是否符合 `^\d{6}_\d{8}$` 格式（即含時間戳記）：
   - **含時間戳記**：新檔名為 `<safeName>_<基名><副檔名>`（與原行為相同）
   - **不含時間戳記**：新檔名為 `<safeName><副檔名>`（不附加原始檔名）
5. 若目標檔名已存在，加上數字後綴（`_1`、`_2`…）避免衝突
6. 執行 `fs.renameSync` 完成重命名
7. 回傳重命名後的完整路徑（供後續移動至結果資料夾使用）

> **重要**：renamer 收到的 `inputFile` 一定已是標準格式 `HHMMSS_YYYYMMDD.mp4`（由 file-preprocessor 轉換）或為一般命名（不含時間戳記）。

#### Scenario: 含時間戳記格式的正常重命名
- **WHEN** `inputFile = "070442_20250719.mp4"`, `processedText = "今天天氣很好適合出門"`
- **THEN** 檔案重命名為 `今天天氣很好適合出門_070442_20250719.mp4`，回傳該路徑

#### Scenario: 不含時間戳記格式的正常重命名
- **WHEN** `inputFile = "my_recording.mp4"`, `processedText = "今天天氣很好適合出門"`
- **THEN** 檔案重命名為 `今天天氣很好適合出門.mp4`，回傳該路徑

#### Scenario: 文字超過長度限制
- **WHEN** `processedText` 超過 20 個字元
- **THEN** 只取前 20 個字元作為檔名前綴

#### Scenario: 產生的安全檔名為空
- **WHEN** `processedText` 全為非法字元，清理後為空
- **THEN** 拋出包含 `處理後檔名為空` 的 Error

#### Scenario: 目標檔名已存在（含時間戳記）
- **WHEN** `今天天氣很好適合出門_070442_20250719.mp4` 已存在
- **THEN** 重命名為 `今天天氣很好適合出門_070442_20250719_1.mp4`（遞增後綴直到不衝突）

#### Scenario: 目標檔名已存在（不含時間戳記）
- **WHEN** `inputFile = "my_recording.mp4"` 且 `今天天氣很好適合出門.mp4` 已存在
- **THEN** 重命名為 `今天天氣很好適合出門_1.mp4`（遞增後綴直到不衝突）

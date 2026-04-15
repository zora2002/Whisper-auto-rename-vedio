## ADDED Requirements

### Requirement: 根據文字內容產生安全檔名並重命名
`renameFile(inputFile: string, processedText: string): void` SHALL：
1. 取 `processedText` 前 `maxNameLength`（預設 20）個字元
2. 移除 Windows/Unix 非法檔名字元（`\ / : * ? " < > |`）
3. 移除中文標點（`。！？；：、`）及英文標點（`, . ! ? ; :`）
4. 組合新檔名：`<safeName>_<原始檔名>`
5. 若目標檔名已存在，加上數字後綴（`_1`、`_2`…）避免衝突
6. 執行 `fs.renameSync` 完成重命名

#### Scenario: 正常重命名
- **WHEN** `inputFile = "070442_20250719.mp4"`, `processedText = "今天天氣很好適合出門"`
- **THEN** 檔案重命名為 `今天天氣很好適合出門_070442_20250719.mp4`

#### Scenario: 文字超過長度限制
- **WHEN** `processedText` 超過 20 個字元
- **THEN** 只取前 20 個字元作為檔名前綴

#### Scenario: 產生的安全檔名為空
- **WHEN** `processedText` 全為非法字元，清理後為空
- **THEN** 拋出包含 `處理後檔名為空` 的 Error

#### Scenario: 目標檔名已存在
- **WHEN** `今天天氣很好適合出門_070442_20250719.mp4` 已存在
- **THEN** 重命名為 `今天天氣很好適合出門_070442_20250719_1.mp4`（或遞增後綴直到不衝突）

## ADDED Requirements

### Requirement: 清理 Whisper 輸出文字
`processText(raw: string): Promise<string>` SHALL 對原始 Whisper 輸出執行以下清理步驟：
1. 移除時間戳記標記（格式：`[HH:MM.mmm --> HH:MM.mmm]`）
2. 將換行符替換為 `，`
3. 將多餘空白合併
4. 移除頭尾空白及末尾標點

#### Scenario: 含時間戳記的文字
- **WHEN** 輸入 `"[00:00.000 --> 00:02.000]\n你好世界"`
- **THEN** 回傳 `"你好世界"`（移除時間戳記與換行）

#### Scenario: 清理後內容為空
- **WHEN** 清理後文字為空字串
- **THEN** 拋出包含 `清理後內容為空` 的 Error

### Requirement: 轉換為繁體中文
`processText` SHALL 在清理完成後，使用 opencc-js 將文字從簡體轉換為繁體中文。

#### Scenario: 簡體中文輸入
- **WHEN** 輸入包含簡體字如 `"处理文件"`
- **THEN** 回傳繁體字 `"處理文件"`

#### Scenario: 轉換失敗時回傳原文
- **WHEN** opencc-js 轉換過程拋出例外
- **THEN** 回傳清理後的原始文字（不拋出錯誤，僅 console.warn）

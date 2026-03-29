## ADDED Requirements

### Requirement: 將 Screen Recording 格式轉換為標準格式
`preprocessFiles(files: string[]): string[]` SHALL 將輸入檔名陣列中的 Screen Recording 格式檔案重命名為標準 `HHMMSS_YYYYMMDD.mp4` 格式，並回傳處理後的檔名陣列。已是標準格式的檔案 SHALL 原樣保留。

#### Scenario: 標準格式檔案不變
- **WHEN** 輸入 `["070442_20250719.mp4"]`
- **THEN** 回傳 `["070442_20250719.mp4"]`，不執行任何重命名

#### Scenario: Screen Recording 格式轉換
- **WHEN** 輸入 `["Screen_Recording_20250719_070442.mp4"]`
- **THEN** 將檔案重命名為 `070442_20250719.mp4`，回傳 `["070442_20250719.mp4"]`

### Requirement: 支援秒數後綴加總
Screen Recording 帶秒數後綴格式 `Screen_Recording_YYYYMMDD_HHMMSS_N1_N2_N3.mp4` SHALL 將所有後綴數字加總後加到原始時間上，再轉換為標準格式。

#### Scenario: 單個秒數後綴
- **WHEN** 輸入 `["Screen_Recording_20250719_070442_1.mp4"]`
- **THEN** 時間加 1 秒 → `070443_20250719.mp4`

#### Scenario: 多個秒數後綴加總
- **WHEN** 輸入 `["Screen_Recording_20250719_070442_1_2_3.mp4"]`
- **THEN** 時間加 6 秒（1+2+3）→ `070448_20250719.mp4`

#### Scenario: 跨分鐘進位
- **WHEN** 輸入 `["Screen_Recording_20250719_070458_5.mp4"]`
- **THEN** 時間加 5 秒 → `070503_20250719.mp4`（58+5=63秒，進位為1分03秒）

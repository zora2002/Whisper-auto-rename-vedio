## ADDED Requirements

### Requirement: 掃描目錄中所有 MP4 檔案
`scanDirectory(dir: string): string[]` SHALL 讀取指定目錄的所有檔案，並回傳所有副檔名為 `.mp4`（大小寫不敏感）的檔名陣列（不含路徑）。不限制命名格式。

#### Scenario: 目錄含有 .mp4 檔案
- **WHEN** 目錄中有 `070442_20250719.mp4` 和 `note.txt`
- **THEN** 回傳 `["070442_20250719.mp4"]`，不含 `note.txt`

#### Scenario: 一般中文命名的 .mp4 也被回傳
- **WHEN** 目錄中有 `賓士貓柴犬火車旅行影片.mp4`
- **THEN** 回傳 `["賓士貓柴犬火車旅行影片.mp4"]`

#### Scenario: 目錄不含任何 .mp4 時回傳空陣列
- **WHEN** 目錄中沒有 `.mp4` 檔案
- **THEN** 回傳空陣列 `[]`

#### Scenario: 目錄不存在或無法讀取
- **WHEN** 指定目錄不存在
- **THEN** 拋出包含 `掃描目錄失敗` 的 Error

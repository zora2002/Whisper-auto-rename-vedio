## ADDED Requirements

### Requirement: 掃描目錄中的 MP4 檔案
`scanDirectory(dir: string): string[]` SHALL 讀取指定目錄的所有檔案，並回傳符合以下任一命名模式的檔名陣列（不含路徑）：
- 標準格式：`/^\d{6}_\d{8}\.mp4$/`
- Screen Recording 格式：`/^Screen_Recording_\d{8}_\d{6}\.mp4$/`
- Screen Recording 帶秒數格式：`/^Screen_Recording_\d{8}_\d{6}((?:_\d+)+)\.mp4$/`

#### Scenario: 目錄含有符合格式的檔案
- **WHEN** 目錄中有 `070442_20250719.mp4` 和 `note.txt`
- **THEN** 回傳 `["070442_20250719.mp4"]`，不含 `note.txt`

#### Scenario: 目錄不含任何符合格式的檔案
- **WHEN** 目錄中沒有符合任何模式的 MP4 檔案
- **THEN** 回傳空陣列 `[]`

#### Scenario: 目錄不存在或無法讀取
- **WHEN** 指定目錄不存在
- **THEN** 拋出包含 `掃描目錄失敗` 的 Error

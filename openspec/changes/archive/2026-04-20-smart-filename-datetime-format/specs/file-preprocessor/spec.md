## REMOVED Requirements

### Requirement: 將 Screen Recording 格式轉換為標準格式
**Reason**: 改為通用 `_YYYYMMDD_HHMMSS` 偵測，不再限於 Screen Recording 命名格式
**Migration**: 改用新的「偵測並標準化含時間戳記的檔名」requirement

### Requirement: 支援秒數後綴加總
**Reason**: 合併至新的通用 requirement，同時支援 `_N` 與 `(N)` 兩種後綴寫法
**Migration**: 改用新的「偵測並標準化含時間戳記的檔名」requirement

## ADDED Requirements

### Requirement: 偵測並標準化含時間戳記的檔名
`preprocessFiles(files: string[], baseDir: string): string[]` SHALL 對每個檔案依以下順序判斷並處理：

1. 若檔名包含 `_YYYYMMDD_HHMMSS_N1_N2...` 格式（`_N` 秒數後綴），將秒數加總後加到時間，輸出 `HHMMSS_YYYYMMDD.mp4`
2. 若檔名包含 `_YYYYMMDD_HHMMSS(N)` 格式（`(N)` 秒數後綴），將 N 加到時間，輸出 `HHMMSS_YYYYMMDD.mp4`
3. 若檔名包含 `_YYYYMMDD_HHMMSS` 格式（無秒數後綴），直接輸出 `HHMMSS_YYYYMMDD.mp4`
4. 若不符合以上任一格式，原封不動保留

偵測使用非錨定 regex，`_YYYYMMDD_HHMMSS` 可出現於檔名任意位置。

#### Scenario: 含時間戳記的一般命名（無秒數）
- **WHEN** 輸入 `["花東旅行_20260417_221133.mp4"]`
- **THEN** 重命名為 `221133_20260417.mp4`，回傳 `["221133_20260417.mp4"]`

#### Scenario: 含時間戳記加 _N 秒數後綴
- **WHEN** 輸入 `["花東旅行_20260417_221133_1.mp4"]`
- **THEN** 時間加 1 秒 → 重命名為 `221134_20260417.mp4`，回傳 `["221134_20260417.mp4"]`

#### Scenario: 含時間戳記加 (N) 秒數後綴
- **WHEN** 輸入 `["花東旅行_20260417_221133(1).mp4"]`
- **THEN** 時間加 1 秒 → 重命名為 `221134_20260417.mp4`，回傳 `["221134_20260417.mp4"]`

#### Scenario: 不含時間戳記的一般命名不變
- **WHEN** 輸入 `["花東旅行.mp4"]`
- **THEN** 回傳 `["花東旅行.mp4"]`，不執行任何重命名

#### Scenario: 已是標準格式 HHMMSS_YYYYMMDD.mp4 不變
- **WHEN** 輸入 `["070442_20250719.mp4"]`
- **THEN** 回傳 `["070442_20250719.mp4"]`，不執行任何重命名

#### Scenario: 多個 _N 後綴加總
- **WHEN** 輸入 `["影片_20250719_070442_10_20.mp4"]`
- **THEN** 時間加 30 秒（10+20）→ `070512_20250719.mp4`

#### Scenario: 跨分鐘進位
- **WHEN** 輸入 `["影片_20250719_070458_5.mp4"]`
- **THEN** 時間加 5 秒 → `070503_20250719.mp4`

#### Scenario: 跨日期進位
- **WHEN** 輸入 `["影片_20250719_235950_30.mp4"]`
- **THEN** 時間加 30 秒 → `000020_20250720.mp4`

#### Scenario: fs.renameSync 失敗時拋出包裝錯誤
- **WHEN** 執行重命名時磁碟發生錯誤
- **THEN** 拋出包含 `重命名檔案失敗` 的 Error

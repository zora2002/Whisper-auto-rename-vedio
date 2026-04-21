## ADDED Requirements

### Requirement: 偵測檔名中的 HHMMSS_YYYYMMDD 時間戳記格式
`hasDatetimeStamp(baseName: string): boolean` SHALL：
1. 接收不含副檔名的檔案基名（basename without extension）
2. 判斷是否完整符合 `^\d{6}_\d{8}$` 格式（六位時間 + 底線 + 八位日期）
3. 符合時回傳 `true`，否則回傳 `false`

#### Scenario: 符合 HHMMSS_YYYYMMDD 格式
- **WHEN** `baseName = "070442_20250719"`
- **THEN** 回傳 `true`

#### Scenario: 不符合格式（一般檔名）
- **WHEN** `baseName = "my_video"`
- **THEN** 回傳 `false`

#### Scenario: 不符合格式（位數不正確）
- **WHEN** `baseName = "7042_20250719"`
- **THEN** 回傳 `false`

#### Scenario: 空字串
- **WHEN** `baseName = ""`
- **THEN** 回傳 `false`

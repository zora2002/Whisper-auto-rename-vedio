## ADDED Requirements

### Requirement: 自動建立資料夾結構
系統 SHALL 在執行指令時自動建立 `rename-notyet/`、`rename-result/success/`、`rename-result/fail/` 資料夾（若不存在）。

#### Scenario: 首次執行資料夾不存在
- **WHEN** 使用者在尚未建立任何資料夾的目錄執行指令
- **THEN** 系統自動建立 `rename-notyet/`、`rename-result/success/`、`rename-result/fail/` 資料夾

#### Scenario: 資料夾已存在
- **WHEN** 使用者再次執行指令且資料夾已存在
- **THEN** 系統不報錯，直接繼續處理

### Requirement: 掃描 rename-notyet 資料夾
系統 SHALL 掃描 `rename-notyet/` 根層中符合命名模式的影片檔案，不遞迴處理子資料夾。

#### Scenario: 有待處理影片
- **WHEN** `rename-notyet/` 中有符合模式的影片檔
- **THEN** 系統列出所有找到的檔案並開始逐一處理

#### Scenario: 資料夾為空
- **WHEN** `rename-notyet/` 中沒有符合模式的影片
- **THEN** 系統印出提示訊息「rename-notyet 資料夾中沒有找到待處理的影片」並正常結束

### Requirement: 處理成功移至 success 資料夾
系統 SHALL 在影片轉錄重新命名成功後，將重新命名後的檔案移至 `rename-result/success/`。

#### Scenario: 成功處理影片
- **WHEN** 影片轉錄與重新命名皆成功
- **THEN** 重新命名後的檔案出現在 `rename-result/success/`，`rename-notyet/` 中該檔案不再存在

#### Scenario: success 資料夾中已有同名檔案
- **WHEN** `rename-result/success/` 中已存在同名檔案
- **THEN** 系統自動加上數字後綴（如 `_1`、`_2`）避免覆蓋

### Requirement: 處理失敗移至 fail 資料夾
系統 SHALL 在影片處理失敗時，將原始檔案（保留原檔名）移至 `rename-result/fail/`。

#### Scenario: 轉錄或重新命名失敗
- **WHEN** 任一處理步驟拋出錯誤
- **THEN** 原始檔案移至 `rename-result/fail/`，錯誤訊息印至 console，其餘影片繼續處理

#### Scenario: fail 資料夾中已有同名檔案
- **WHEN** `rename-result/fail/` 中已存在同名檔案
- **THEN** 系統自動加上數字後綴避免覆蓋

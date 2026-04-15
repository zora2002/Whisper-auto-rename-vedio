## ADDED Requirements

### Requirement: 呼叫本地 Whisper CLI 進行語音辨識
`transcribe(inputFile: string, model: WhisperModel): Promise<string>` SHALL 執行本地 `whisper` CLI 指令，對指定 MP4 檔案進行語音辨識，並回傳辨識出的純文字內容。

指令格式：`whisper "<inputFile>" --model <model> --language zh --output_format txt --clip_timestamps "0,15"`

執行後 SHALL 找到 Whisper 輸出的 `.txt` 檔案，讀取其內容並回傳，最後刪除該暫存檔。

#### Scenario: 語音辨識成功
- **WHEN** 指定的 MP4 檔案存在且 whisper CLI 可用
- **THEN** 回傳辨識出的文字字串，並刪除暫存 `.txt` 檔案

#### Scenario: 檔案不存在
- **WHEN** 指定的 MP4 檔案不存在
- **THEN** 拋出包含 `找不到影片檔案` 的 Error

#### Scenario: Whisper CLI 執行失敗
- **WHEN** whisper CLI 執行回傳非零 exit code
- **THEN** 拋出包含 `Whisper 執行失敗` 的 Error

#### Scenario: 找不到輸出文字檔
- **WHEN** whisper CLI 執行成功但找不到輸出的 `.txt` 檔案
- **THEN** 拋出包含 `找不到轉換生成的文字檔` 的 Error

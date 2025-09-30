# Whisper 自動重命名影片工具

🎵 一個基於 OpenAI Whisper 的影片自動重命名工具，可以根據影片中的語音內容自動生成檔名。

## ✨ 功能特色

- 🎯 **智能語音識別**: 使用 OpenAI Whisper 模型進行高精度語音轉文字
- 🔄 **自動繁簡轉換**: 自動將簡體中文轉換為繁體中文
- 📝 **智能檔名生成**: 根據語音內容自動生成安全的檔案名稱
- ⚡ **批量處理**: 支援批量處理多個影片檔案
- 🎛️ **靈活配置**: 支援多種 Whisper 模型和自定義配置
- 🖥️ **CLI 介面**: 提供友好的命令列介面
- 🔧 **智能預處理**: 自動處理 Screen Recording 格式檔案，支援秒數調整
- 📊 **詳細統計**: 提供處理進度和結果統計

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 編譯專案

```bash
npm run build
```

### 基本使用

```bash
# 使用預設設定處理當前目錄
node dist/index.js

# 指定目錄
node dist/index.js ./videos

# 指定 Whisper 模型
node dist/index.js -m large ./videos
```

## 📖 使用說明

### 命令列選項

```bash
node dist/index.js [選項] [目錄]
```

**選項:**
- `-h, --help` - 顯示幫助資訊
- `-i, --info` - 顯示應用程式資訊
- `-c, --config` - 顯示配置資訊
- `-d, --directory <dir>` - 指定工作目錄
- `-m, --model <model>` - 指定 Whisper 模型

**支援的模型:**
- `tiny` - 最快，但準確度較低
- `base` - 平衡速度和準確度
- `small` - 較高準確度
- `medium` - 高準確度（預設）
- `large` - 最高準確度，但較慢

### 使用範例

```bash
# 顯示幫助
node dist/index.js --help

# 顯示應用程式資訊
node dist/index.js --info

# 顯示配置資訊
node dist/index.js --config

# 使用大型模型處理指定目錄
node dist/index.js -m large ./my-videos

# 使用預設設定處理當前目錄
node dist/index.js
```

## 📁 支援的檔案格式

- **輸入格式**: MP4 影片檔案
- **支援的檔案命名模式**:

### 1. 標準格式
- `HHMMSS_YYYYMMDD.mp4` (例如: `143022_20231201.mp4`)
  - 直接進行 Whisper 語音識別和重命名

### 2. Screen Recording 格式
- `Screen_Recording_YYYYMMDD_HHMMSS.mp4` (例如: `Screen_Recording_20250725_123343.mp4`)
  - 自動轉換為 `HHMMSS_YYYYMMDD.mp4` 格式後再進行處理

### 3. Screen Recording 帶秒數調整格式
- `Screen_Recording_YYYYMMDD_HHMMSS_數字.mp4` (例如: `Screen_Recording_20250719_070442_1.mp4`)
  - 會根據後面的數字調整秒數，然後轉換為標準格式
  - 支援多個數字，如 `_1_2_3` 會加總秒數 (1+2+3=6秒)
  - 使用 dayjs 進行精確的日期時間計算，支援跨日期的時間調整

**處理範例:**
```
Screen_Recording_20250719_070442.mp4     → 070442_20250719.mp4
Screen_Recording_20250719_070442_1.mp4   → 070443_20250719.mp4 (加1秒)
Screen_Recording_20250719_070442_1_2.mp4 → 070445_20250719.mp4 (加3秒)
Screen_Recording_20250719_070442_1_2_3.mp4 → 070448_20250719.mp4 (加6秒)
```

## ⚙️ 配置說明

應用程式支援以下配置選項：

- **Whisper 模型**: 選擇不同的語音識別模型 (tiny, base, small, medium, large)
- **檔名長度**: 設定生成檔名的最大長度 (預設: 20 字元)
- **超時設定**: 設定處理單個檔案的最大時間 (預設: 300 秒)
- **語言設定**: 支援中文語音識別 (簡體轉繁體)
- **檔案模式**: 支援多種檔案命名模式的識別和處理

## 🏗️ 專案結構

```
src/
├── app/                    # 應用程式主邏輯
│   ├── WhisperApp.ts      # 主應用程式類別
│   └── cli.ts             # CLI 處理模組
├── config/                # 配置管理
│   └── index.ts           # 統一配置
├── modules/               # 功能模組
│   ├── fileScanner.ts     # 檔案掃描
│   ├── filePreprocessor.ts # 檔案預處理 (Screen Recording 格式轉換)
│   ├── processor.ts       # 主要處理邏輯
│   ├── statistics.ts      # 統計和計時
│   ├── errorHandler.ts    # 錯誤處理
│   ├── textProcessor.ts   # 文字處理
│   ├── fileOperations.ts  # 檔案操作
│   └── whisperExecutor.ts # Whisper 執行
├── types/                 # 類型定義
│   └── index.ts           # 統一類型
├── utils/                 # 工具函數
│   └── whisperRename.ts   # Whisper 重命名主邏輯
└── index.ts               # 程式入口
```

## 🔧 開發

### 編譯

```bash
npm run build
```

### 類型檢查

```bash
npm run type-check
```

### 開發模式執行

```bash
npm run dev
```

### 生產模式執行

```bash
npm start
```

## 🚀 工作流程

1. **檔案掃描**: 掃描指定目錄中的 MP4 檔案
2. **格式識別**: 識別檔案命名模式 (標準格式、Screen Recording 格式)
3. **預處理**: 將 Screen Recording 格式轉換為標準格式
4. **語音識別**: 使用 Whisper 模型進行語音轉文字
5. **文字處理**: 清理文字內容並轉換為繁體中文
6. **檔案重命名**: 根據語音內容生成新的檔案名稱
7. **統計報告**: 顯示處理結果和執行時間

## 📝 授權

MIT License
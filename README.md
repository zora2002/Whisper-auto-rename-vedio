# Whisper 自動重命名影片工具

用影片的語音內容自動幫影片改名。例如影片裡說「今天來介紹一下產品功能」，執行後檔名就會變成 `今天來介紹一下產品功能_070442_20250719.mp4`。

---

## 前置需求

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.8+
- [OpenAI Whisper](https://github.com/openai/whisper)（本地安裝）

```bash
pip install openai-whisper
```

---

## 安裝

```bash
npm install
```

---

## 使用方式

### 第一步：把影片放進 `rename-notyet/` 資料夾

第一次執行時，程式會自動建立以下資料夾結構：

```
你的目錄/
├── rename-notyet/        ← 把要處理的影片放這裡
└── rename-result/
    ├── success/          ← 處理成功的影片會移到這裡
    └── fail/             ← 處理失敗的影片會移到這裡
```

影片檔名需符合以下格式之一：

| 格式 | 範例 |
|------|------|
| 標準格式 | `070442_20250719.mp4` |
| Screen Recording | `Screen_Recording_20250719_070442.mp4` |
| Screen Recording（含秒數偏移） | `Screen_Recording_20250719_070442_1.mp4` |

> Screen Recording 格式會自動轉換為標準格式再處理。

### 第二步：執行

```bash
npm run dev
```

### 第三步：查看結果

- 成功 → 重命名後的檔案移至 `rename-result/success/`
- 失敗 → 原始檔案移至 `rename-result/fail/`，並在 console 顯示錯誤原因

---

## 選擇 Whisper 模型

預設使用 `medium` 模型，可透過 `--model` 參數切換：

```bash
npm run dev -- --model small
```

| 模型 | 速度 | 準確度 |
|------|------|--------|
| `tiny` | 最快 | 較低 |
| `base` | 快 | 普通 |
| `small` | 中 | 較高 |
| `medium` | 慢 | 高（預設） |
| `large` | 最慢 | 最高 |

---

## 命名規則

- 取語音辨識結果前 **20 個字元**作為檔名前綴
- 組合格式：`<語音內容>_<原始檔名>.mp4`
- 若目標檔名已存在，自動加數字後綴（`_1`、`_2`…）避免覆蓋

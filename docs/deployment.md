# 企業員工管理系統 - 部署指南

## 部署流程概述

本系統採用 Google Apps Script + Google Sheets 架構，部署相對簡單但需要按照正確步驟執行。

## 第一階段：準備 Google Sheets 數據庫

### 1. 建立 Google Spreadsheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新的試算表
3. 將試算表命名為「企業員工管理系統數據庫」
4. 複製試算表的 ID（從 URL 中取得）

### 2. 建立工作表結構

按照 `database/sheets-schema.md` 的設計，建立以下工作表：

- Employees (員工資料表)
- AttendanceLog (打卡記錄表)
- RevenueLog (營收記錄表)
- OrderLog (叫貨記錄表)
- Schedule_Staff (員工排班表)
- Schedule_Admin (管理員排班表)
- PromotionVotes (升遷投票表)
- VoteRecords (投票記錄表)
- MaintenanceLog (維修記錄表)
- SystemSettings (系統參數表)
- Positions (職位階級設定表)
- ErrorLog (錯誤日誌表)
- NotificationsLog (通知記錄表)

### 3. 設定權限

1. 點擊「共用」按鈕
2. 將 Google Apps Script 專案的服務帳戶設為編輯者
3. 確保試算表可以被腳本存取

## 第二階段：部署 Google Apps Script

### 1. 建立 GAS 專案

1. 前往 [Google Apps Script](https://script.google.com)
2. 建立新專案
3. 將專案命名為「企業員工管理系統API」

### 2. 上傳後端程式碼

將以下檔案的內容複製到對應的 GAS 檔案中：

#### 主檔案 (Code.gs)
```javascript
// 複製 backend/gas-main.js 的內容
```

#### 資料庫工具 (database.gs)
```javascript
// 複製 backend/utils/database.js 的內容
```

#### 驗證工具 (validation.gs)
```javascript
// 複製 backend/utils/validation.js 的內容
```

#### Telegram 工具 (telegram.gs)
```javascript
// 複製 backend/utils/telegram.js 的內容
```

#### 員工模組 (employee.gs)
```javascript
// 複製 backend/modules/employee.js 的內容
```

#### 打卡模組 (attendance.gs)
```javascript
// 複製 backend/modules/attendance.js 的內容
```

#### 營收模組 (revenue.gs)
```javascript
// 複製 backend/modules/revenue.js 的內容
```

### 3. 設定配置參數

在 `gas-main.js` 中更新以下配置：

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_ACTUAL_SPREADSHEET_ID', // 替換為實際的試算表ID
  TELEGRAM_BOT_TOKEN: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
  TELEGRAM_BOSS_GROUP: '-1002658082392',
  TELEGRAM_EMPLOYEE_GROUP: '-1002658082392',
  MAX_EXECUTION_TIME: 270000,
  DEBUG_MODE: false // 生產環境設為 false
};
```

### 4. 設定權限和觸發器

1. 在 GAS 編輯器中，點擊「權限審查」
2. 授權腳本存取 Google Sheets 和外部 URL
3. 設定必要的觸發器（如果需要定時任務）

### 5. 部署為 Web App

1. 點擊「部署」-> 「新增部署」
2. 選擇類型：Web 應用程式
3. 設定：
   - 執行身分：我
   - 存取權：任何人
4. 點擊「部署」
5. 複製 Web App URL

## 第三階段：初始化系統

### 1. 執行系統初始化

在 GAS 編輯器中執行 `initializeSystem()` 函式：

1. 選擇函式：initializeSystem
2. 點擊執行按鈕
3. 確認所有工作表和基本設定都已建立

### 2. 測試系統功能

在 GAS 編輯器中執行 `runSystemTests()` 函式：

1. 選擇函式：runSystemTests
2. 點擊執行按鈕
3. 檢查執行記錄中的測試結果

## 第四階段：部署前端

### 1. 更新前端配置

在前端程式碼中更新 API URL：

```javascript
// 在 frontend/js/utils/api.js 中
class APIClient {
    constructor() {
        this.baseUrl = 'YOUR_GAS_WEB_APP_URL_HERE'; // 替換為實際的 Web App URL
    }
}
```

### 2. 部署前端檔案

有幾種部署選擇：

#### 選項 1：Google Apps Script HTML 服務
1. 在 GAS 專案中建立 HTML 檔案
2. 將 `frontend/index.html` 的內容複製進去
3. 將 CSS 和 JS 檔案內嵌到 HTML 中

#### 選項 2：外部託管
1. 將前端檔案上傳到 GitHub Pages、Vercel 或其他託管服務
2. 確保 CORS 設定正確

#### 選項 3：本地檔案系統
1. 直接使用本地的 HTML 檔案
2. 透過 `file://` 協議開啟

## 第五階段：測試和驗證

### 1. 功能測試

使用 `tests/system-test.js` 執行完整的系統測試：

1. 更新測試腳本中的 API URL
2. 在瀏覽器控制台中執行測試
3. 確認所有核心功能正常運作

### 2. Telegram 通知測試

1. 執行 `testTelegramNotification()` 函式
2. 確認 Telegram 群組收到測試訊息
3. 測試各種類型的通知

### 3. 實際操作測試

1. 註冊測試員工
2. 執行打卡流程
3. 提交營收記錄
4. 確認數據正確儲存和通知發送

## 安全性設定

### 1. API 安全

- 在生產環境中關閉 DEBUG_MODE
- 考慮添加 API 金鑰驗證
- 限制 CORS 來源

### 2. 數據安全

- 定期備份 Google Sheets
- 設定適當的存取權限
- 監控系統存取記錄

### 3. Telegram 安全

- 確保 Bot Token 不會洩露
- 定期檢查群組成員
- 監控異常通知

## 維護和監控

### 1. 定期維護

- 每週檢查錯誤日誌
- 每月執行系統測試
- 定期備份數據

### 2. 效能監控

- 監控 GAS 執行時間
- 檢查 API 回應時間
- 監控數據增長趨勢

### 3. 更新機制

- 建立版本控制流程
- 測試環境驗證後再部署到生產環境
- 保留舊版本以便快速回滾

## 常見問題

### Q: 如何更新系統配置？
A: 修改 `SystemSettings` 工作表或使用 `updateSystemSettings` API

### Q: 如何新增分店？
A: 更新系統設定中的 `stores` 配置

### Q: 如何重設員工密碼？
A: 目前系統使用員工編號和身分證號登入，如需重設請聯繫管理員

### Q: 如何處理系統錯誤？
A: 檢查 `ErrorLog` 工作表，查看詳細錯誤訊息和解決方案

## 支援和聯絡

如遇到部署問題，請參考：
- 錯誤日誌：Google Sheets ErrorLog 工作表
- 系統測試：執行 `runSystemTests()` 函式
- Telegram 群組：-1002658082392

---

最後更新：2025-08-02
版本：1.0
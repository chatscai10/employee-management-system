# 專案結構說明

## 目錄架構
```
employee-management-system/
├── README.md                     # 專案說明文件
├── project-structure.md          # 專案結構說明
├── database/                     # 數據庫相關
│   ├── sheets-schema.md          # Google Sheets架構設計
│   └── sample-data.json          # 範例數據
├── backend/                      # 後端程式碼
│   ├── gas-main.js              # 主要API端點
│   ├── modules/                 # 功能模組
│   │   ├── employee.js          # 員工管理
│   │   ├── attendance.js        # 打卡系統
│   │   ├── revenue.js           # 營收系統
│   │   ├── ordering.js          # 叫貨系統
│   │   ├── schedule.js          # 排班系統
│   │   ├── promotion.js         # 升遷投票
│   │   └── maintenance.js       # 維修系統
│   ├── utils/                   # 工具函式
│   │   ├── database.js          # 數據庫操作
│   │   ├── validation.js        # 數據驗證
│   │   ├── security.js          # 安全功能
│   │   └── telegram.js          # Telegram通知
│   └── config/                  # 配置檔案
│       └── settings.js          # 系統設定
├── frontend/                    # 前端程式碼
│   ├── index.html              # 主頁面
│   ├── css/                    # 樣式檔案
│   │   ├── main.css            # 主要樣式
│   │   └── mobile.css          # 手機版樣式
│   ├── js/                     # JavaScript檔案
│   │   ├── app.js              # 主要應用邏輯
│   │   ├── modules/            # 前端模組
│   │   └── utils/              # 前端工具函式
│   └── assets/                 # 靜態資源
│       ├── images/             # 圖片檔案
│       └── icons/              # 圖標檔案
├── tests/                      # 測試檔案
│   ├── unit/                   # 單元測試
│   ├── integration/            # 整合測試
│   └── e2e/                    # 端到端測試
├── docs/                       # 文檔
│   ├── api-docs.md             # API文檔
│   ├── user-manual.md          # 使用手冊
│   └── deployment.md           # 部署指南
└── scripts/                    # 部署腳本
    ├── deploy.js               # 部署腳本
    └── backup.js               # 備份腳本
```

## 開發規範
1. **命名規範**: 使用 camelCase 命名變數和函式
2. **檔案組織**: 按功能模組分類，避免單一檔案過大
3. **註釋規範**: 關鍵函式需要詳細註釋說明
4. **錯誤處理**: 所有API調用都需要錯誤處理機制
5. **安全規範**: 所有用戶輸入都需要驗證和清理

## Git 工作流程
1. `main` - 生產環境分支
2. `develop` - 開發環境分支  
3. `feature/*` - 功能開發分支
4. `hotfix/*` - 緊急修復分支

## 部署環境
- **開發環境**: 本地開發和測試
- **測試環境**: Google Apps Script 測試版本
- **生產環境**: 正式 Web App 部署
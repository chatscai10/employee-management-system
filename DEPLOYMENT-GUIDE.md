# 🚀 Google Cloud 庫存管理系統部署指南

## 📋 概述

本指南將協助您將企業級庫存管理系統部署到 Google Cloud Platform。整個部署過程已經自動化，只需執行幾個簡單步驟即可完成。

## 🎯 部署目標

將完整的庫存管理系統部署到 Google Cloud，包括：
- 📦 智能庫存管理功能
- ⚙️ 動態配置系統
- 🔗 三端數據聯動
- ☁️ 雲端原生架構
- 🔒 企業級安全保護

## 🛠️ 系統需求

### 必要工具
- **Google Cloud SDK** (gcloud CLI)
- **Docker** (容器化部署)
- **Node.js** (v18 或更高版本)
- **Firebase CLI** (前端部署)

### 安裝工具

#### 1. Google Cloud SDK
```bash
# macOS
brew install google-cloud-sdk

# Windows
# 下載安裝程式: https://cloud.google.com/sdk/docs/install

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### 2. Docker
```bash
# macOS
brew install docker

# Windows
# 下載 Docker Desktop: https://docs.docker.com/desktop/windows/install/

# Ubuntu
sudo apt-get update
sudo apt-get install docker.io
```

#### 3. Node.js
```bash
# 使用 nvm (推薦)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# 或直接下載: https://nodejs.org/
```

#### 4. Firebase CLI
```bash
npm install -g firebase-tools
```

## 🚀 快速部署

### 方法一：一鍵自動部署 (推薦)

```bash
# 1. 給予執行權限
chmod +x deploy-to-gcloud-complete.sh

# 2. 執行一鍵部署
./deploy-to-gcloud-complete.sh
```

### 方法二：分步驟部署

```bash
# 1. Google Cloud 基礎設施設置
./gcloud-deployment-setup.sh

# 2. 資料庫設置
./gcloud-database-setup.sh

# 3. 容器部署
./gcloud-container-deploy.sh

# 4. 前端部署
./gcloud-firebase-deploy.sh
```

## 📊 部署流程詳解

### 階段一：基礎設施設置
- 建立 Google Cloud 專案
- 啟用必要的 API 服務
- 設定 IAM 權限
- 建立服務帳號

### 階段二：資料庫配置
- 建立 Cloud SQL MySQL 實例
- 設定資料庫和用戶
- 配置安全設定
- 執行結構初始化

### 階段三：應用程式部署
- 建置 Docker 映像
- 部署到 Cloud Run
- 配置環境變數
- 設定網路和安全

### 階段四：前端部署
- 準備靜態檔案
- 部署到 Firebase Hosting
- 配置網域和 SSL
- 設定重導向規則

## 🔧 配置說明

### 環境變數 (.env.production)
```bash
# Google Cloud 配置
GOOGLE_CLOUD_PROJECT_ID=inventory-management-sys
CLOUD_SQL_CONNECTION_NAME=inventory-management-sys:asia-east1:inventory-database

# 資料庫配置
CLOUD_SQL_USER=inventory_admin
CLOUD_SQL_PASSWORD=<自動生成>
CLOUD_SQL_DATABASE=employee_management

# Telegram 通知
TELEGRAM_BOT_TOKEN=7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc
TELEGRAM_CHAT_ID=-1002658082392

# 安全配置
JWT_SECRET=<自動生成>
ENCRYPTION_KEY=<自動生成>
```

### Firebase 配置 (firebase.json)
```json
{
  "hosting": {
    "public": "public",
    "rewrites": [
      {
        "source": "/api/**",
        "destination": "https://inventory-api-asia-east1-PROJECT_ID.a.run.app/api/**"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|html)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      }
    ]
  }
}
```

## 🗄️ 資料庫結構

系統包含 9 個核心表格：

1. **product_categories** - 產品分類管理
2. **suppliers** - 供應商資訊
3. **products_enhanced** - 產品主檔
4. **inventory** - 庫存管理
5. **inventory_logs** - 庫存異動記錄
6. **revenue_items_enhanced** - 收入項目配置
7. **expense_items_enhanced** - 支出項目配置
8. **inventory_alert_settings** - 庫存警報設定
9. **configuration_versions** - 配置版本控制

### 資料庫初始化

```bash
# 連接到 Cloud SQL 並執行初始化
mysql -h CLOUD_SQL_IP -u inventory_admin -p employee_management < google-cloud-inventory-database-structure.sql
```

## 🌐 服務 URL

部署完成後，您將獲得以下服務地址：

- **前端首頁**: https://inventory-management-sys.web.app
- **管理後台**: https://inventory-management-sys.web.app/admin-system.html
- **員工系統**: https://inventory-management-sys.web.app/employee-system.html
- **API 服務**: https://inventory-api-asia-east1-inventory-management-sys.a.run.app
- **健康檢查**: https://inventory-api-asia-east1-inventory-management-sys.a.run.app/health

## 🔒 安全配置

### SSL/TLS
- 所有連接強制使用 HTTPS
- 自動配置 SSL 憑證
- Cloud SQL 使用 SSL 連接

### 網路安全
- CORS 跨域保護
- 速率限制 (1000 請求/15分鐘)
- SQL 注入防護
- XSS 防護

### 權限控制
- 最小權限原則
- 服務帳號隔離
- IAM 精確控制

## 📊 監控和日誌

### Cloud Operations 監控
```bash
# 啟用監控
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

### 關鍵指標監控
- API 回應時間
- 資料庫連接狀況
- 錯誤率
- 資源使用量

### 日誌管理
- 結構化日誌輸出
- 錯誤等級分類
- 即時日誌查詢

## 🔧 故障排除

### 常見問題

#### 1. gcloud 認證問題
```bash
# 重新登入
gcloud auth login
gcloud auth application-default login
```

#### 2. Docker 建置失敗
```bash
# 檢查 Docker 運行狀態
docker --version
sudo systemctl start docker  # Linux
```

#### 3. Cloud SQL 連接問題
```bash
# 檢查網路設定
gcloud sql instances describe inventory-database
```

#### 4. Firebase 部署失敗
```bash
# 重新登入 Firebase
firebase logout
firebase login
```

### 除錯步驟

1. **檢查系統日誌**
   ```bash
   gcloud logging read "resource.type=cloud_run_revision" --limit=50
   ```

2. **驗證服務狀態**
   ```bash
   gcloud run services list
   ```

3. **測試資料庫連接**
   ```bash
   node test-db-connection.js
   ```

## 📈 效能優化

### Cloud Run 配置
- **CPU**: 1 vCPU
- **記憶體**: 512Mi
- **最大實例數**: 10
- **併發數**: 80

### 資料庫優化
- **索引建議**: 已建立效能索引
- **連接池**: 20 個連接
- **查詢優化**: 使用視圖和預存程序

### 前端優化
- **CDN**: Firebase Hosting 全球 CDN
- **快取策略**: 靜態資源 24 小時快取
- **壓縮**: Gzip 壓縮啟用

## 🔄 更新和維護

### 版本更新
```bash
# 重新建置和部署
docker build -t gcr.io/PROJECT_ID/inventory-api .
gcloud run deploy inventory-api --image gcr.io/PROJECT_ID/inventory-api
```

### 資料備份
```bash
# 建立資料庫備份
gcloud sql export sql inventory-database gs://BUCKET_NAME/backup-$(date +%Y%m%d).sql \
  --database=employee_management
```

### 監控設定
```bash
# 建立警報規則
gcloud alpha monitoring policies create --policy-from-file=monitoring-policy.yaml
```

## 📞 技術支援

### 文件資源
- [Google Cloud 文件](https://cloud.google.com/docs)
- [Firebase 文件](https://firebase.google.com/docs)
- [Docker 文件](https://docs.docker.com/)

### 系統日誌
- Cloud Run 日誌: Google Cloud Console > Cloud Run > 服務詳情 > 日誌
- Firebase 日誌: Firebase Console > Hosting > 使用情況

### 除錯工具
- `gcloud` CLI 指令
- Google Cloud Console
- Firebase Console
- Docker 除錯指令

## 🎯 後續步驟

1. **設定自訂網域**
   - 在 Firebase Console 新增自訂網域
   - 設定 DNS 記錄

2. **配置監控警報**
   - 設定 CPU 使用率警報
   - 設定錯誤率警報
   - 設定回應時間警報

3. **建立 CI/CD 流水線**
   - 使用 Cloud Build
   - 自動化測試和部署

4. **效能測試**
   - 負載測試
   - 壓力測試
   - 安全性測試

5. **災難復原計劃**
   - 定期備份
   - 復原程序
   - 故障轉移策略

---

## ✅ 檢查清單

部署前檢查：
- [ ] Google Cloud SDK 已安裝並登入
- [ ] Docker 已安裝並運行
- [ ] Node.js 已安裝 (v18+)
- [ ] Firebase CLI 已安裝
- [ ] 所有必要檔案存在

部署後檢查：
- [ ] API 服務健康檢查通過
- [ ] 前端應用可正常存取
- [ ] 資料庫連接正常
- [ ] Telegram 通知正常
- [ ] SSL 憑證有效

---

**🎉 恭喜！您已成功部署 Google Cloud 企業級庫存管理系統！**

系統現已可正式投入使用，享受現代化的雲端原生企業管理體驗。
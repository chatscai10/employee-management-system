# 🚀 快速部署設置指南

## 部署狀態
✅ **所有部署腳本已準備完成**  
⚠️ **需要安裝必要工具後即可執行部署**

## 🛠️ 必要工具安裝

### 1. 安裝 Google Cloud SDK
```bash
# Windows (PowerShell)
iex (New-Object Net.WebClient).DownloadString('https://sdk.cloud.google.com/docs/downloads-windows-install.ps1')

# macOS
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Ubuntu/Debian
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-sdk
```

### 2. 安裝 Docker
```bash
# Windows: 下載 Docker Desktop
# https://docs.docker.com/desktop/windows/install/

# macOS
brew install docker

# Ubuntu
sudo apt-get update
sudo apt-get install docker.io
```

### 3. 安裝 Node.js (v18+)
```bash
# 使用 nvm (推薦)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 4. 安裝 Firebase CLI
```bash
npm install -g firebase-tools
```

## 🔐 Google Cloud 認證設置

### 1. 登入 Google Cloud
```bash
gcloud auth login
gcloud auth application-default login
```

### 2. 設定預設專案
```bash
gcloud config set project YOUR_PROJECT_ID
```

## 🚀 一鍵部署執行

**所有工具安裝完成後，執行以下命令：**

```bash
# 確保在專案目錄中
cd D:\0802

# 執行完整自動化部署
./deploy-to-gcloud-complete.sh
```

## 📋 部署腳本功能

我已經為您準備了完整的自動化部署系統：

### 🎯 主要部署腳本
- **`deploy-to-gcloud-complete.sh`** - 主要編排腳本
- **`gcloud-deployment-setup.sh`** - Google Cloud 基礎設施設置
- **`gcloud-database-setup.sh`** - Cloud SQL 資料庫配置
- **`gcloud-container-deploy.sh`** - Cloud Run API 部署
- **`gcloud-firebase-deploy.sh`** - Firebase Hosting 前端部署

### 🏗️ 系統架構
- **前端**: Firebase Hosting (響應式管理界面)
- **API**: Google Cloud Run (Node.js 容器化服務)
- **資料庫**: Google Cloud SQL (MySQL 8.0)
- **儲存**: Google Cloud Storage
- **監控**: Google Cloud Operations

### 🔒 安全特性
- SSL/TLS 強制加密
- IAM 權限控制
- CORS 跨域保護
- SQL 注入防護
- 速率限制保護

## 📊 預期部署結果

部署完成後，您將獲得：

### 🌐 服務地址
- **前端首頁**: `https://inventory-management-sys.web.app`
- **管理後台**: `https://inventory-management-sys.web.app/admin-system.html`
- **員工系統**: `https://inventory-management-sys.web.app/employee-system.html`
- **API 服務**: `https://inventory-api-asia-east1-inventory-management-sys.a.run.app`

### 🎉 系統功能
- 📦 智能庫存管理
- ⚙️ 動態配置系統
- 🔗 三端數據聯動
- 📱 Telegram 通知整合
- 🛡️ 企業級安全機制

## 🆘 如需協助

如果在安裝或部署過程中遇到問題：

1. **查看詳細指南**: `DEPLOYMENT-GUIDE.md`
2. **檢查故障排除**: 指南中包含常見問題解決方案
3. **驗證工具安裝**: 確保所有必要工具都已正確安裝

---

**🎯 下一步**: 安裝必要工具後執行 `./deploy-to-gcloud-complete.sh`
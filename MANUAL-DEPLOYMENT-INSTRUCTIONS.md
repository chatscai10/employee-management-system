# 🚀 手動部署完整指引

## 📋 當前狀態
✅ **所有工具已安裝完成**
- ✅ Node.js v20.19.2
- ✅ npm v10.8.2  
- ✅ Docker v28.1.1
- ✅ Firebase CLI v14.6.0
- ✅ Google Cloud SDK v532.0.0

⚠️ **需要手動完成 Google Cloud 認證**

## 🔐 步驟 1: Google Cloud 認證

### 1.1 登入 Google Cloud
```bash
source ~/google-cloud-sdk/path.bash.inc
gcloud auth login
```

**認證 URL**: 系統會提供認證連結，在瀏覽器中完成登入

### 1.2 設定應用程式預設憑證
```bash
gcloud auth application-default login
```

### 1.3 建立或選擇專案
```bash
# 建立新專案
gcloud projects create inventory-management-sys --name="庫存管理系統"

# 或選擇現有專案
gcloud config set project YOUR_PROJECT_ID
```

### 1.4 設定計費帳戶 (必要)
```bash
# 查看可用的計費帳戶
gcloud billing accounts list

# 連結計費帳戶到專案
gcloud billing projects link inventory-management-sys --billing-account=YOUR_BILLING_ACCOUNT_ID
```

## 🚀 步驟 2: 執行自動化部署

**認證完成後，執行一鍵部署：**

```bash
# 確保在專案目錄
cd D:\0802

# 設定執行權限
chmod +x deploy-to-gcloud-complete.sh

# 執行完整自動化部署
./deploy-to-gcloud-complete.sh
```

## 📋 步驟 3: 部署流程說明

部署腳本將自動執行以下步驟：

### 3.1 基礎設施設置 (5-10 分鐘)
- ✅ 啟用必要的 Google Cloud API
- ✅ 建立服務帳號和 IAM 權限
- ✅ 設定 Cloud SQL MySQL 實例
- ✅ 配置網路和安全設定

### 3.2 應用程式部署 (10-15 分鐘)
- ✅ 建置 Docker 映像
- ✅ 部署到 Cloud Run
- ✅ 設定環境變數
- ✅ 配置負載平衡器

### 3.3 前端部署 (3-5 分鐘)
- ✅ 部署到 Firebase Hosting
- ✅ 設定自訂網域 (可選)
- ✅ 配置 SSL 憑證

### 3.4 驗證測試 (2-3 分鐘)
- ✅ API 健康檢查
- ✅ 前端連通性測試
- ✅ 資料庫連接驗證

## 🌐 預期部署結果

### 服務地址
完成後您將獲得：
- **前端首頁**: `https://inventory-management-sys.web.app`
- **管理後台**: `https://inventory-management-sys.web.app/admin-system.html`
- **員工系統**: `https://inventory-management-sys.web.app/employee-system.html`
- **API 服務**: `https://inventory-api-asia-east1-inventory-management-sys.a.run.app`

### 系統功能
- 📦 智能庫存管理
- ⚙️ 動態配置系統
- 🔗 三端數據聯動
- 📱 Telegram 通知整合
- 🛡️ 企業級安全機制

## 🔧 故障排除

### 常見問題

#### 1. 認證問題
```bash
# 重新認證
gcloud auth revoke --all
gcloud auth login
gcloud auth application-default login
```

#### 2. 專案權限問題
```bash
# 檢查目前專案
gcloud config get-value project

# 檢查權限
gcloud projects get-iam-policy PROJECT_ID
```

#### 3. API 未啟用
```bash
# 手動啟用必要 API
gcloud services enable cloudsql.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable storage.googleapis.com
```

#### 4. Docker 建置失敗
```bash
# 檢查 Docker 狀態
docker --version
docker ps

# 重新啟動 Docker (如需要)
sudo systemctl restart docker
```

#### 5. Firebase 部署問題
```bash
# 重新登入 Firebase
firebase logout
firebase login
```

## 📞 技術支援

### 檢查工具
```bash
# 檢查所有工具版本
node --version
npm --version
docker --version
firebase --version
gcloud --version
```

### 診斷問題
```bash
# Google Cloud 診斷
gcloud info --run-diagnostics

# Docker 診斷
docker system info

# Firebase 專案狀態
firebase projects:list
```

### 日誌檢查
```bash
# Cloud Run 日誌
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Firebase 日誌
firebase hosting:channel:list
```

## 🎯 成功指標

部署成功的確認方式：

### 1. 命令列確認
```bash
# 檢查 Cloud Run 服務
gcloud run services list

# 檢查 Cloud SQL 實例
gcloud sql instances list

# 檢查 Firebase 專案
firebase projects:list
```

### 2. 瀏覽器測試
- 前端頁面可正常開啟
- 管理後台功能正常
- API 健康檢查回應 200

### 3. 功能測試
- 登入系統功能
- 庫存管理操作
- Telegram 通知測試

---

## 🎉 部署完成後

### 後續設定
1. **自訂網域設定** (可選)
2. **監控和警報配置**
3. **備份策略建立**
4. **效能最佳化**
5. **安全性檢查**

### 維護作業
1. **定期備份驗證**
2. **安全性更新**
3. **效能監控**
4. **成本最佳化**

---

**🎯 下一步**: 完成 Google Cloud 認證後執行 `./deploy-to-gcloud-complete.sh`
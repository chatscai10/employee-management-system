# 🚀 Google Cloud 部署說明

## 立即部署步驟

### 1. 安裝Google Cloud CLI
如果尚未安裝，請執行：
```bash
# Windows
automated-gcloud-install.bat

# 或手動下載
# https://cloud.google.com/sdk/docs/install
```

### 2. 認證和設定
```bash
gcloud auth login
gcloud config set project complete-employee-management-436300
```

### 3. 執行部署
```bash
# Linux/macOS
chmod +x deploy-to-gcloud.sh
./deploy-to-gcloud.sh

# Windows
deploy-to-gcloud.bat
```

### 4. 驗證部署
```bash
deployment-verification.bat
```

## 部署選項

1. **推薦方式**: 使用 Cloud Build 自動部署
2. **手動方式**: 本地Docker構建後推送
3. **測試方式**: 本地容器測試

## 故障排除

如果部署失敗，請檢查：
- Google Cloud CLI 是否已安裝並認證
- Docker 是否正在運行
- 網路連接是否正常
- 專案權限是否充足

## 支援

部署完成後，應用程式將在以下網址可用：
https://employee-management-system-[hash]-europewest1.a.run.app

健康檢查端點：
https://[SERVICE_URL]/health

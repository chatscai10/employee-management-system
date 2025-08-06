# 🚀 立即部署指導

## 當前系統狀態

| 組件 | 狀態 | 說明 |
|------|------|------|
| Docker | ✅ 就緒 | Docker已安裝並運行正常 |
| Google Cloud CLI | ⚠️ 需安裝 | 雲端部署需要安裝 |
| 專案文件 | ✅ 完整 | 所有必要文件存在 |
| 依賴套件 | ✅ 已安裝 | npm套件已安裝 |

## 🎯 建議的部署順序

### 第一步: 本地測試 (強烈建議)
**狀態**: ✅ 可立即執行

```bash
# 快速本地測試
docker build -t employee-management-system:test .
docker run -d --name emp-mgmt-test -p 8080:8080 employee-management-system:test

# 測試應用程式
curl http://localhost:8080
# 或在瀏覽器打開 http://localhost:8080

# 清理測試環境
docker stop emp-mgmt-test
docker rm emp-mgmt-test
```

### 第二步: 雲端部署
**狀態**: ⚠️ 需先安裝Google Cloud CLI

#### 方案A: 自動部署 (推薦)
```bash
# Windows用戶
deploy-to-gcloud.bat

# Linux/macOS用戶  
chmod +x deploy-to-gcloud.sh
./deploy-to-gcloud.sh
```

#### 方案B: 手動逐步部署
```bash
# 1. 認證和設定
gcloud auth login
gcloud config set project complete-employee-management-436300

# 2. 啟用服務
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. 部署應用
gcloud builds submit --config cloudbuild-optimized.yaml

# 4. 驗證部署
gcloud run services list
```

## 📋 詳細部署選項


### 選項1: 本地Docker測試
**描述**: 在本地運行Docker容器進行測試  
**就緒狀態**: ready  
**預估時間**: 5-10分鐘  
**難度**: Easy

**執行步驟**:
1. docker build -t employee-management-system:test .
2. docker run -d --name emp-mgmt-test -p 8080:8080 employee-management-system:test
3. 打開瀏覽器訪問 http://localhost:8080
4. docker stop emp-mgmt-test && docker rm emp-mgmt-test


### 選項2: Google Cloud Run部署
**描述**: 部署到Google Cloud Run生產環境  
**就緒狀態**: needs_gcloud  
**預估時間**: 15-30分鐘  
**難度**: Medium

**執行步驟**:
1. 安裝Google Cloud CLI
2. gcloud auth login
3. gcloud config set project complete-employee-management-436300
4. 執行 deploy-to-gcloud.bat
5. 驗證部署結果


### 選項3: 手動雲端部署
**描述**: 逐步手動執行雲端部署流程  
**就緒狀態**: needs_gcloud  
**預估時間**: 20-40分鐘  
**難度**: Advanced

**執行步驟**:
1. gcloud services enable run.googleapis.com cloudbuild.googleapis.com
2. gcloud builds submit --tag gcr.io/complete-employee-management-436300/employee-management-system
3. gcloud run deploy --image gcr.io/complete-employee-management-436300/employee-management-system --platform managed


## 🔧 Google Cloud CLI 安裝指導

如果尚未安裝Google Cloud CLI，請按照以下步驟：

### Windows
1. 前往: https://cloud.google.com/sdk/docs/install-sdk#windows
2. 下載並執行 GoogleCloudSDKInstaller.exe
3. 跟隨安裝精靈完成安裝
4. 重新啟動命令提示字元

### macOS
```bash
# 使用Homebrew
brew install google-cloud-sdk

# 或下載安裝包
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Linux
```bash
# Ubuntu/Debian
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-sdk
```

## 🚨 故障排除

### 常見問題和解決方案

1. **Docker構建失敗**
   - 確認Docker Desktop正在運行
   - 檢查Dockerfile語法
   - 確保有足夠的磁碟空間

2. **Google Cloud認證問題**
   - 執行 `gcloud auth login`
   - 確認專案ID正確
   - 檢查網路連接

3. **權限問題**
   - 確認Google Cloud專案權限
   - 檢查服務帳戶設定
   - 驗證API服務已啟用

## 📞 獲得幫助

如果遇到問題：
1. 查看詳細錯誤訊息
2. 檢查Google Cloud Console
3. 參考部署日誌
4. 聯繫技術支援團隊

## 🎉 部署成功確認

部署成功後，您將看到：
- Cloud Run服務URL
- 健康檢查端點回應正常
- 應用程式功能可正常使用

**預期的服務URL格式**:
`https://employee-management-system-[隨機字串]-ew.a.run.app`

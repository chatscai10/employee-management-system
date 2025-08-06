# Google Cloud CLI 安裝指南

## 🚀 自動安裝 (推薦)

### Windows 用戶
```cmd
# 方法1: 執行批次檔
download-gcloud.bat

# 方法2: 執行 PowerShell 腳本
powershell -ExecutionPolicy Bypass -File download-gcloud.ps1
```

### Linux/macOS 用戶
```bash
# 執行安裝腳本
chmod +x download-gcloud.sh
./download-gcloud.sh
```

## 📋 手動安裝步驟

### Windows
1. 前往 [Google Cloud SDK 下載頁面](https://cloud.google.com/sdk/docs/install-sdk)
2. 下載 Windows 安裝程式
3. 執行 `GoogleCloudSDKInstaller.exe`
4. 跟隨安裝精靈指示
5. 重新啟動命令提示字元

### macOS
```bash
# 使用 Homebrew (推薦)
brew install google-cloud-sdk

# 或手動安裝
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Linux
```bash
# Ubuntu/Debian
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-sdk

# CentOS/RHEL/Fedora
sudo tee -a /etc/yum.repos.d/google-cloud-sdk.repo << EOM
[google-cloud-sdk]
name=Google Cloud SDK
baseurl=https://packages.cloud.google.com/yum/repos/cloud-sdk-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg
       https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOM
sudo yum install google-cloud-sdk
```

## ✅ 安裝後驗證

```bash
# 檢查版本
gcloud --version

# 初始化配置
gcloud init

# 認證
gcloud auth login
```

## 🔧 設定專案

```bash
# 設定專案 ID
gcloud config set project complete-employee-management-436300

# 設定預設區域
gcloud config set compute/region europe-west1
gcloud config set compute/zone europe-west1-a

# 啟用必要的 API
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## 🚀 部署應用程式

安裝完成後，可以執行：
```bash
# 手動部署
./manual-deploy.bat

# 或使用 Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

## 🔍 故障排除

### 常見問題
1. **PATH 環境變數未設定**
   - Windows: 重新啟動命令提示字元
   - Linux/macOS: 執行 `source ~/.bashrc` 或 `source ~/.zshrc`

2. **權限問題**
   - 確保以管理員身份執行 (Windows)
   - 使用 `sudo` 執行安裝命令 (Linux)

3. **網路連接問題**
   - 檢查防火牆設定
   - 確認代理伺服器配置

### 驗證安裝
```bash
# 執行完整驗證
node intelligent-system-repair-deployment-toolkit.js
```

@echo off
echo 🔧 Google Cloud CLI 環境配置
echo ════════════════════════════════════

echo 📋 設定專案配置...
gcloud config set project complete-employee-management-436300
gcloud config set compute/region europe-west1
gcloud config set compute/zone europe-west1-a

echo 📋 啟用必要的 API 服務...
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com

echo 📋 創建 Artifact Registry 儲存庫...
gcloud artifacts repositories create employee-management --repository-format=docker --location=europe-west1 --description="Employee Management System Repository"

echo 📋 配置 Docker 認證...
gcloud auth configure-docker europe-west1-docker.pkg.dev

echo ✅ 環境配置完成！
echo.
echo 📋 驗證配置:
gcloud config list
echo.
pause
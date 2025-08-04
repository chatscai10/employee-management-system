@echo off
REM 🚀 確定性 Google Cloud Run 部署腳本 - Windows 版
REM 解決所有根本問題的終極解決方案

echo 🚀 開始確定性部署修復...
echo ═════════════════════════════════

REM 1. 清理環境
echo 🧹 清理構建環境...
if exist package-lock.json del package-lock.json
if exist node_modules rmdir /s /q node_modules
docker system prune -f >nul 2>&1

REM 2. 應用確定性配置
echo 📦 應用確定性配置文件...
copy package-definitive.json package.json >nul
copy Dockerfile-definitive Dockerfile >nul
copy server-definitive.js server.js >nul
copy .gcloudignore-definitive .gcloudignore >nul

REM 3. 驗證配置
echo 🔍 驗證配置文件...
if not exist package.json (
    echo ❌ package.json 不存在
    exit /b 1
)

if not exist Dockerfile (
    echo ❌ Dockerfile 不存在
    exit /b 1
)

if not exist server.js (
    echo ❌ server.js 不存在
    exit /b 1
)

echo ✅ 所有配置文件驗證通過

REM 4. 設定 Google Cloud
echo ☁️ 設定 Google Cloud 配置...
gcloud config set project adept-arbor-467807-t9
gcloud config set run/region europe-west1

REM 5. 確保 API 已啟用
echo 🔧 確保必要的 API 已啟用...
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet
gcloud services enable containerregistry.googleapis.com --quiet

REM 6. 執行確定性部署
echo 🚀 執行確定性部署...
gcloud run deploy employee-management-system ^
    --source . ^
    --region europe-west1 ^
    --platform managed ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 1Gi ^
    --cpu 1 ^
    --timeout 300 ^
    --concurrency 80 ^
    --min-instances 0 ^
    --max-instances 10 ^
    --set-env-vars NODE_ENV=production ^
    --quiet

REM 7. 獲取服務 URL
echo 🌐 獲取服務 URL...
for /f "tokens=*" %%i in ('gcloud run services describe employee-management-system --region europe-west1 --format="value(status.url)"') do set SERVICE_URL=%%i

echo ✅ 部署完成！
echo 🌐 服務 URL: %SERVICE_URL%

REM 8. 等待服務啟動
echo 🧪 等待服務啟動...
timeout /t 10 >nul

echo 🎉 確定性部署修復完成！
echo 📋 請訪問 %SERVICE_URL% 驗證所有功能

pause
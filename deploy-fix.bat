@echo off
REM Google Cloud Run 修復部署腳本 (Windows 版本)
REM 用於解決持續性構建失敗問題

setlocal enabledelayedexpansion

REM 配置參數
set PROJECT_ID=adept-arbor-467807-t9
set SERVICE_NAME=employee-management-system
set REGION=europe-west1
set IMAGE_NAME=gcr.io/!PROJECT_ID!/!SERVICE_NAME!:latest

echo 🚀 開始 Google Cloud Run 修復部署...

REM 步驟 1: 驗證當前配置
echo.
echo 📋 步驟 1: 驗證專案配置...
echo 專案ID: !PROJECT_ID!
echo 服務名稱: !SERVICE_NAME!
echo 部署區域: !REGION!
echo 映像名稱: !IMAGE_NAME!

REM 步驟 2: 檢查 gcloud 是否已安裝
echo.
echo 🔧 步驟 2: 檢查 Google Cloud CLI...
gcloud version >nul 2>&1
if errorlevel 1 (
    echo ❌ Google Cloud CLI 未安裝或不在 PATH 中
    echo 請確保已安裝 Google Cloud SDK 並重啟命令提示字元
    pause
    exit /b 1
)

REM 步驟 3: 設定正確的專案
echo.
echo ⚙️ 步驟 3: 設定專案配置...
gcloud config set project !PROJECT_ID!
gcloud config set run/region !REGION!

REM 步驟 4: 啟用必要的 API
echo.
echo 🔧 步驟 4: 啟用必要的 Google Cloud APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM 步驟 5: 清理舊的映像 (可選)
echo.
echo 🧹 步驟 5: 清理舊的容器映像...
gcloud container images delete !IMAGE_NAME! --quiet --force-delete-tags 2>nul || echo 舊映像不存在，跳過清理

REM 步驟 6: 構建新的 Docker 映像
echo.
echo 🐳 步驟 6: 構建 Docker 映像...
docker build --platform linux/amd64 -t !IMAGE_NAME! .
if errorlevel 1 (
    echo ❌ Docker 映像構建失敗
    pause
    exit /b 1
)

REM 步驟 7: 推送映像到 Container Registry
echo.
echo 📤 步驟 7: 推送映像到 Google Container Registry...
docker push !IMAGE_NAME!
if errorlevel 1 (
    echo ❌ 映像推送失敗
    pause
    exit /b 1
)

REM 步驟 8: 部署到 Cloud Run
echo.
echo 🚀 步驟 8: 部署到 Google Cloud Run...
gcloud run deploy !SERVICE_NAME! --image !IMAGE_NAME! --platform managed --region !REGION! --allow-unauthenticated --port 8080 --memory 2Gi --cpu 2 --min-instances 0 --max-instances 10 --concurrency 80 --timeout 300 --set-env-vars NODE_ENV=production,PORT=8080
if errorlevel 1 (
    echo ❌ Cloud Run 部署失敗
    pause
    exit /b 1
)

REM 步驟 9: 獲取服務 URL
echo.
echo 🌐 步驟 9: 獲取服務 URL...
for /f "tokens=*" %%i in ('gcloud run services describe !SERVICE_NAME! --region !REGION! --format="value(status.url)"') do set SERVICE_URL=%%i

REM 步驟 10: 顯示結果
echo.
echo ✅ 部署完成！
echo 🎉 服務 URL: !SERVICE_URL!
echo 🔍 健康檢查: !SERVICE_URL!/api/health

echo.
echo 🎯 修復部署完成！
echo 可用的端點:
echo   - 主頁: !SERVICE_URL!
echo   - 健康檢查: !SERVICE_URL!/api/health
echo   - 產品管理: !SERVICE_URL!/api/products
echo   - 庫存管理: !SERVICE_URL!/api/inventory
echo   - 員工登入: !SERVICE_URL!/api/login

echo.
echo 按任意鍵結束...
pause >nul
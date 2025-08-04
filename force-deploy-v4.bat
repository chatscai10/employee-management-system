@echo off
echo 🚀 強制部署 v4.0.0 企業系統到 Google Cloud Run
echo ═══════════════════════════════════════════════

echo 📦 檢查當前 app.js 版本...
findstr "v4.0.0" app.js >nul
if %errorlevel%==0 (
    echo ✅ app.js 包含 v4.0.0 版本
) else (
    echo ❌ app.js 不包含 v4.0.0 版本
    exit /b 1
)

echo 🔧 建置 Docker 映像...
docker build --platform linux/amd64 -t gcr.io/員工管理系統-d8b3e/employee-management-system:v4 .

echo 📤 推送映像到 Container Registry...
docker push gcr.io/員工管理系統-d8b3e/employee-management-system:v4

echo 🚀 部署到 Cloud Run...
gcloud run deploy employee-management-system ^
  --image gcr.io/員工管理系統-d8b3e/employee-management-system:v4 ^
  --platform managed ^
  --region europe-west1 ^
  --allow-unauthenticated ^
  --port 8080 ^
  --memory 2Gi ^
  --cpu 2 ^
  --set-env-vars NODE_ENV=production,PORT=8080 ^
  --no-traffic-split

echo ✅ 部署完成！正在驗證...
timeout /t 30 /nobreak >nul

echo 🔍 檢查服務狀態...
curl -s https://employee-management-system-213410885168.europe-west1.run.app/health

echo 🎯 強制部署程序完成！
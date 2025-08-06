@echo off
echo 🚀 智能綜合部署系統
echo ════════════════════════════════════════

set "PROJECT_ID=complete-employee-management-436300"
set "REGION=europe-west1"
set "SERVICE_NAME=employee-management-system"

echo 📋 階段1: 預檢查
echo 檢查必要工具...
gcloud --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Google Cloud CLI 未安裝
    echo 請先執行 automated-gcloud-install.bat
    pause
    exit /b 1
)

docker --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未安裝或未啟動
    echo 請啟動 Docker Desktop
    pause
    exit /b 1
)

echo ✅ 工具檢查完成

echo.
echo 📋 階段2: 環境準備
echo 設定專案配置...
gcloud config set project %PROJECT_ID%
gcloud config set run/region %REGION%

echo 啟用API服務...
call enable-apis.bat

echo 創建Artifact Registry儲存庫...
gcloud artifacts repositories create employee-management --repository-format=docker --location=%REGION% --description="Employee Management System" 2>nul

echo 配置Docker認證...
gcloud auth configure-docker europe-west1-docker.pkg.dev

echo.
echo 📋 階段3: 選擇部署方式
echo 1. 使用優化的Cloud Build (推薦)
echo 2. 使用手動Docker部署
echo 3. 使用原始Cloud Build
echo 4. 本地測試模式
echo.
set /p choice="請選擇部署方式 (1-4): "

if "%choice%"=="1" (
    echo 🚀 執行優化Cloud Build部署...
    gcloud builds submit --config cloudbuild-optimized.yaml
) else if "%choice%"=="2" (
    echo 🐳 執行手動Docker部署...
    call :manual_docker_deploy
) else if "%choice%"=="3" (
    echo ☁️ 執行原始Cloud Build...
    gcloud builds submit --config cloudbuild-artifact-registry.yaml
) else if "%choice%"=="4" (
    echo 🧪 執行本地測試...
    call local-test.bat
) else (
    echo ❌ 無效選擇
    pause
    exit /b 1
)

echo.
echo 📋 階段4: 部署驗證
call deployment-verification.bat

echo.
echo 🎉 部署流程完成！
pause
exit /b 0

:manual_docker_deploy
echo 🐳 手動Docker部署流程...
echo 構建映像...
docker build -f Dockerfile.optimized -t %SERVICE_NAME%:latest .

echo 標記映像...
docker tag %SERVICE_NAME%:latest europe-west1-docker.pkg.dev/%PROJECT_ID%/employee-management/%SERVICE_NAME%:latest

echo 推送映像...
docker push europe-west1-docker.pkg.dev/%PROJECT_ID%/employee-management/%SERVICE_NAME%:latest

echo 部署到Cloud Run...
gcloud run deploy %SERVICE_NAME% --image europe-west1-docker.pkg.dev/%PROJECT_ID%/employee-management/%SERVICE_NAME%:latest --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 2Gi --cpu 2 --min-instances 1 --max-instances 10

goto :eof
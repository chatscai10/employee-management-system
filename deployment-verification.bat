@echo off
echo ✅ 部署驗證系統
echo ═══════════════════════════════

set "PROJECT_ID=complete-employee-management-436300"
set "SERVICE_NAME=employee-management-system"
set "REGION=europe-west1"

echo 📋 步驟1: 檢查服務狀態
echo 查詢Cloud Run服務...
gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"
if errorlevel 1 (
    echo ❌ 服務未找到或部署失敗
    goto :troubleshoot
)

for /f %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i

echo ✅ 服務URL: %SERVICE_URL%

echo.
echo 📋 步驟2: 健康檢查
echo 測試服務端點...
curl -f %SERVICE_URL%/health
if errorlevel 1 (
    echo ⚠️ 健康檢查失敗
    goto :troubleshoot
) else (
    echo ✅ 健康檢查通過
)

echo.
echo 📋 步驟3: 功能測試
echo 測試主頁...
curl -s %SERVICE_URL% | findstr "html" > nul
if errorlevel 1 (
    echo ⚠️ 主頁載入異常
) else (
    echo ✅ 主頁正常
)

echo.
echo 📋 步驟4: 服務資訊
echo 服務詳情:
gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="table(metadata.name,status.url,status.conditions[0].status,spec.template.spec.containers[0].image)"

echo.
echo 📋 步驟5: 日誌檢查
echo 最近的日誌:
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=%SERVICE_NAME%" --limit=10 --format="table(timestamp,textPayload)"

echo.
echo 🎉 部署驗證完成！
echo 服務可在以下網址存取: %SERVICE_URL%
pause
exit /b 0

:troubleshoot
echo.
echo 🔧 故障排除
echo ════════════════════════════════════
echo 1. 檢查Build日誌: gcloud builds list --limit=5
echo 2. 檢查服務日誌: gcloud logging read "resource.type=cloud_run_revision"
echo 3. 檢查映像: gcloud container images list --repository=europe-west1-docker.pkg.dev/%PROJECT_ID%/employee-management
echo 4. 重新部署: comprehensive-deployment.bat
echo.
pause
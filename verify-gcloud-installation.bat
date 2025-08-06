@echo off
echo ✅ Google Cloud CLI 安裝驗證
echo ════════════════════════════════════

echo 📋 檢查 Google Cloud CLI...
gcloud --version
if errorlevel 1 (
    echo ❌ Google Cloud CLI 未正確安裝
    goto :end
) else (
    echo ✅ Google Cloud CLI 已安裝
)

echo.
echo 📋 檢查認證狀態...
gcloud auth list --filter=status:ACTIVE --format="value(account)"
if errorlevel 1 (
    echo ⚠️ 尚未認證，請執行: gcloud auth login
) else (
    echo ✅ 已認證
)

echo.
echo 📋 檢查專案設定...
gcloud config get-value project
if errorlevel 1 (
    echo ⚠️ 專案未設定，請執行: gcloud config set project YOUR_PROJECT_ID
) else (
    echo ✅ 專案已設定
)

echo.
echo 📋 檢查必要 API...
gcloud services list --enabled --filter="name:run.googleapis.com OR name:cloudbuild.googleapis.com"

echo.
echo 📋 測試連接...
gcloud projects list --limit=1 > nul
if errorlevel 1 (
    echo ❌ 無法連接到 Google Cloud
    echo 請檢查網路連接和認證狀態
) else (
    echo ✅ 連接正常
)

:end
echo.
echo 🎯 驗證完成！
echo 如果發現問題，請執行對應的修復命令
pause
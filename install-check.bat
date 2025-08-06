@echo off
echo 🔧 智能系統修復與部署工具包 - Windows安裝腳本

echo 📋 檢查系統狀態...
node --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安裝，請先安裝 Node.js
    echo 下載地址: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已安裝

npm --version > nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安裝
    pause
    exit /b 1
)

echo ✅ npm 已安裝

echo 📦 安裝項目依賴...
call npm install

echo 🐳 檢查 Docker...
docker --version > nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker 未安裝，請手動安裝 Docker Desktop
    echo 下載地址: https://www.docker.com/products/docker-desktop
) else (
    echo ✅ Docker 已安裝
)

echo ☁️ 檢查 Google Cloud CLI...
gcloud --version > nul 2>&1
if errorlevel 1 (
    echo ⚠️ Google Cloud CLI 未安裝
    echo 請運行以下命令安裝:
    echo.
    echo PowerShell:
    echo (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
    echo ^& $env:Temp\GoogleCloudSDKInstaller.exe
    echo.
    echo 或手動下載: https://cloud.google.com/sdk/docs/install
) else (
    echo ✅ Google Cloud CLI 已安裝
)

echo.
echo 🎉 安裝檢查完成！
echo 💡 建議執行的下一步:
echo 1. 安裝缺失的工具 (Docker, Google Cloud CLI)
echo 2. 執行 gcloud auth login
echo 3. 運行測試: npm test
echo 4. 啟動應用: npm start

pause
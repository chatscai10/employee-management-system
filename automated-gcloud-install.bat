@echo off
echo 🚀 Google Cloud CLI 自動化安裝腳本
echo ════════════════════════════════════════

echo 📋 步驟1: 檢查系統環境
systeminfo | findstr /B /C:"OS Name" /C:"System Type"

echo.
echo 📋 步驟2: 檢查網路連接
ping -n 1 dl.google.com > nul
if errorlevel 1 (
    echo ❌ 無法連接到 Google 下載伺服器
    echo 請檢查網路連接
    pause
    exit /b 1
) else (
    echo ✅ 網路連接正常
)

echo.
echo 📋 步驟3: 檢查現有安裝
gcloud --version > nul 2>&1
if not errorlevel 1 (
    echo ✅ Google Cloud CLI 已安裝
    gcloud --version
    echo.
    echo 是否要重新安裝? (y/N)
    set /p reinstall=
    if /i not "%reinstall%"=="y" (
        echo 跳過安裝
        goto :configure
    )
)

echo.
echo 📋 步驟4: 下載安裝程式
echo 正在下載 Google Cloud CLI 安裝程式...

set "download_url=https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
set "installer_path=%TEMP%\GoogleCloudSDKInstaller.exe"

powershell -Command "try { (New-Object Net.WebClient).DownloadFile('%download_url%', '%installer_path%'); Write-Host '✅ 下載完成' } catch { Write-Host '❌ 下載失敗:' $_.Exception.Message; exit 1 }"

if not exist "%installer_path%" (
    echo ❌ 下載失敗，請手動下載並安裝
    echo 下載網址: %download_url%
    echo 或前往: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

echo.
echo 📋 步驟5: 執行安裝
echo 正在啟動 Google Cloud CLI 安裝程式...
echo 請跟隨安裝精靈完成安裝
"%installer_path%"

echo.
echo 📋 步驟6: 清理暫存檔案
del "%installer_path%" 2>nul

echo.
echo 📋 步驟7: 驗證安裝
echo 請重新開啟命令提示字元，然後執行以下命令驗證安裝:
echo.
echo   gcloud --version
echo   gcloud init
echo   gcloud auth login
echo.

:configure
echo 📋 步驟8: 配置專案 (可選)
echo 是否要自動配置專案設定? (y/N)
set /p configure=
if /i "%configure%"=="y" (
    echo 配置專案設定...
    gcloud config set project complete-employee-management-436300
    gcloud config set compute/region europe-west1
    gcloud config set compute/zone europe-west1-a
    
    echo 啟用必要的 API...
    gcloud services enable run.googleapis.com
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable containerregistry.googleapis.com
)

echo.
echo 🎉 安裝流程完成！
echo.
echo 📋 下一步:
echo 1. 重新啟動命令提示字元
echo 2. 執行 gcloud init 初始化
echo 3. 執行 gcloud auth login 進行認證
echo 4. 執行 manual-deploy.bat 部署應用
echo.
pause
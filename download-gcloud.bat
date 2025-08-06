@echo off
echo 📥 下載 Google Cloud CLI...
echo.

echo 方法1: 使用 PowerShell 下載
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe', 'C:\Users\Owner\AppData\Local\Temp\GoogleCloudSDKInstaller.exe')"

if exist "C:\Users\Owner\AppData\Local\Temp\GoogleCloudSDKInstaller.exe" (
    echo ✅ 下載完成: C:\Users\Owner\AppData\Local\Temp\GoogleCloudSDKInstaller.exe
    echo.
    echo 🚀 開始安裝...
    "C:\Users\Owner\AppData\Local\Temp\GoogleCloudSDKInstaller.exe"
) else (
    echo ❌ 下載失敗，請手動下載
    echo 下載網址: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
    echo.
    echo 方法2: 手動下載並安裝
    echo 1. 前往 https://cloud.google.com/sdk/docs/install
    echo 2. 下載適合您系統的版本
    echo 3. 執行安裝程式
)

pause
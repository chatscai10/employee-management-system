# 🚀 自動安裝 Google Cloud CLI (Windows)

Write-Host "🔧 開始安裝 Google Cloud CLI..." -ForegroundColor Green

# 檢查是否有管理員權限
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  需要管理員權限來安裝 Google Cloud CLI" -ForegroundColor Yellow
    Write-Host "📋 請以管理員身份運行 PowerShell 並執行此腳本" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 或者手動執行以下步驟：" -ForegroundColor Cyan
    Write-Host "1. 以管理員身份打開 PowerShell"
    Write-Host "2. 執行: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
    Write-Host "3. 執行: iex ((New-Object System.Net.WebClient).DownloadString('https://cloud.google.com/sdk/docs/install'))"
    pause
    exit 1
}

try {
    # 設置執行策略
    Write-Host "📋 設置 PowerShell 執行策略..." -ForegroundColor Blue
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

    # 創建臨時目錄
    $tempDir = "$env:TEMP\gcloud-install"
    if (!(Test-Path $tempDir)) {
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    }

    # 下載 Google Cloud CLI 安裝器
    Write-Host "📥 下載 Google Cloud CLI 安裝器..." -ForegroundColor Blue
    $installerUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
    $installerPath = "$tempDir\GoogleCloudSDKInstaller.exe"
    
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($installerUrl, $installerPath)

    # 執行安裝器
    Write-Host "🚀 啟動 Google Cloud CLI 安裝器..." -ForegroundColor Green
    Write-Host "📋 安裝選項建議：" -ForegroundColor Yellow
    Write-Host "   ✅ Install Google Cloud CLI" -ForegroundColor Green
    Write-Host "   ✅ Install Beta Commands" -ForegroundColor Green  
    Write-Host "   ✅ Install bundled Python" -ForegroundColor Green
    Write-Host "   ✅ Add gcloud to PATH" -ForegroundColor Green
    Write-Host ""
    
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host "✅ Google Cloud CLI 安裝完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 重新打開終端機以使用 gcloud 指令" -ForegroundColor Cyan
    Write-Host "📋 接下來執行: gcloud auth login" -ForegroundColor Cyan

} catch {
    Write-Host "❌ 安裝過程中發生錯誤: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 手動安裝方法：" -ForegroundColor Yellow
    Write-Host "1. 前往: https://cloud.google.com/sdk/docs/install-sdk#windows"
    Write-Host "2. 下載 GoogleCloudSDKInstaller.exe"
    Write-Host "3. 以管理員身份執行安裝器"
    Write-Host "4. 安裝完成後重新打開終端機"
}

pause
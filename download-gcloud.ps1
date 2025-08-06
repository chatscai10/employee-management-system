# PowerShell 自動下載與安裝腳本
Write-Host "📥 下載 Google Cloud CLI..." -ForegroundColor Green

$url = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$output = "C:\Users\Owner\AppData\Local\Temp\GoogleCloudSDKInstaller.exe"

try {
    Write-Host "   下載中..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    
    if (Test-Path $output) {
        Write-Host "✅ 下載完成" -ForegroundColor Green
        Write-Host "🚀 啟動安裝程式..." -ForegroundColor Green
        Start-Process $output -Wait
    } else {
        throw "下載檔案不存在"
    }
} catch {
    Write-Host "❌ 自動下載失敗: $_" -ForegroundColor Red
    Write-Host "請手動下載並安裝:" -ForegroundColor Yellow
    Write-Host "   網址: $url" -ForegroundColor Cyan
    Write-Host "   或前往: https://cloud.google.com/sdk/docs/install" -ForegroundColor Cyan
}

Read-Host "按任意鍵繼續"
# PowerShell 自動安裝腳本
Write-Host "🔧 智能系統修復與部署工具包 - PowerShell版本" -ForegroundColor Green

# 檢查並安裝 Chocolatey
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 安裝 Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 安裝工具
$tools = @('nodejs', 'git', 'docker-desktop')
foreach ($tool in $tools) {
    Write-Host "📦 檢查 $tool..." -ForegroundColor Yellow
    choco install $tool -y
}

Write-Host "✅ 自動安裝完成！" -ForegroundColor Green
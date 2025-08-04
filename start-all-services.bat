@echo off
REM === 企業庫存管理系統 - Windows 啟動腳本 ===

echo 🚀 啟動企業庫存管理系統完整服務
echo =========================================

REM 檢查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 錯誤：未安裝 Node.js
    pause
    exit /b 1
)

REM 檢查 http-server
where http-server >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ 未安裝 http-server，正在安裝...
    npm install -g http-server
)

echo ✅ 系統依賴檢查完成

REM 啟動後端API服務 (3002端口)
echo 🔧 啟動後端API服務 (port 3002)...
start "Backend API" cmd /k "node server.js"

REM 等待後端服務啟動
timeout /t 3 /nobreak >nul

REM 測試後端服務
echo 🧪 測試後端服務...
curl -f http://localhost:3002/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 後端服務啟動失敗
    pause
    exit /b 1
)
echo ✅ 後端服務健康檢查通過

REM 啟動前端服務 (3000端口)
echo 🌐 啟動前端服務 (port 3000)...
start "Frontend Server" cmd /k "cd public && http-server -p 3000"

REM 等待前端服務啟動
timeout /t 2 /nobreak >nul

REM 測試前端服務
echo 🧪 測試前端服務...
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 前端服務啟動失敗
    pause
    exit /b 1
)
echo ✅ 前端服務可訪問

REM 顯示服務狀態
echo.
echo 🎊 系統啟動完成！
echo =========================================
echo 📍 前端服務: http://localhost:3000
echo 📍 後端API: http://localhost:3002
echo 📍 API健康檢查: http://localhost:3002/api/health
echo.
echo 🧪 測試帳號：
echo   - 姓名: 測試員工
echo   - 身分證號: A123456789
echo.
echo 📋 可用API端點：
echo   - GET  /api/health     - 系統健康檢查
echo   - POST /api/login      - 員工登入
echo   - GET  /api/employees  - 獲取員工列表
echo   - GET  /api/products   - 獲取產品列表
echo   - GET  /api/inventory  - 獲取庫存資料
echo.
echo 🌐 正在自動開啟瀏覽器...

REM 自動開啟瀏覽器
start http://localhost:3000

echo.
echo ⚠️ 服務已在背景運行，關閉此視窗前請確保已完成使用
echo ⚠️ 如需停止服務，請關閉對應的命令列視窗
pause
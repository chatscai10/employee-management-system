@echo off
echo 🧪 本地測試系統
echo ═══════════════════════════════

echo 📋 步驟1: 構建本地映像
docker build -f Dockerfile.optimized -t employee-management-local:latest .
if errorlevel 1 (
    echo ❌ Docker構建失敗
    pause
    exit /b 1
)

echo 📋 步驟2: 啟動本地容器
echo 停止現有容器...
docker stop employee-management-local 2>nul
docker rm employee-management-local 2>nul

echo 啟動新容器...
docker run -d --name employee-management-local -p 8080:8080 employee-management-local:latest

echo 等待容器啟動...
timeout /t 10 /nobreak > nul

echo 📋 步驟3: 健康檢查
echo 測試本地端點...
curl -f http://localhost:8080/health
if errorlevel 1 (
    echo ⚠️ 健康檢查失敗，檢查容器日誌
    docker logs employee-management-local
) else (
    echo ✅ 本地測試成功！
    echo 應用程式可在 http://localhost:8080 存取
)

echo.
echo 📋 容器資訊:
docker ps | findstr employee-management-local

echo.
echo 📋 選項:
echo 1. 查看容器日誌
echo 2. 停止容器
echo 3. 繼續運行
echo.
set /p action="請選擇 (1-3): "

if "%action%"=="1" (
    docker logs employee-management-local
) else if "%action%"=="2" (
    docker stop employee-management-local
    docker rm employee-management-local
    echo 容器已停止並移除
)

pause
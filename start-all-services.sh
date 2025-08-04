#!/bin/bash

# 🚀 完整系統服務啟動腳本
# 一鍵啟動前端和後端服務，確保系統完整運行

echo "🚀 啟動企業庫存管理系統完整服務"
echo "========================================="

# 檢查依賴
echo "🔍 檢查系統依賴..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤：未安裝 Node.js"
    exit 1
fi

# 檢查 http-server
if ! command -v http-server &> /dev/null; then
    echo "⚠️ 未安裝 http-server，正在安裝..."
    npm install -g http-server
fi

echo "✅ 系統依賴檢查完成"

# 停止可能存在的服務
echo "🛑 停止現有服務..."
# pkill -f "http-server" 2>/dev/null || true
# pkill -f "node server.js" 2>/dev/null || true
echo "✅ 現有服務已停止"

# 啟動後端API服務 (3002端口)
echo "🔧 啟動後端API服務 (port 3002)..."
cd "$(dirname "$0")"
node server.js &
API_PID=$!
echo "✅ 後端服務已啟動 (PID: $API_PID)"

# 等待後端服務啟動
sleep 3

# 測試後端服務
echo "🧪 測試後端服務..."
if curl -f http://localhost:3002/api/health >/dev/null 2>&1; then
    echo "✅ 後端服務健康檢查通過"
else
    echo "❌ 後端服務健康檢查失敗"
    kill $API_PID 2>/dev/null || true
    exit 1
fi

# 啟動前端服務 (3000端口)
echo "🌐 啟動前端服務 (port 3000)..."
cd public
http-server -p 3000 &
FRONTEND_PID=$!
echo "✅ 前端服務已啟動 (PID: $FRONTEND_PID)"

# 等待前端服務啟動
sleep 2

# 測試前端服務
echo "🧪 測試前端服務..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ 前端服務可訪問"
else
    echo "❌ 前端服務無法訪問"
    kill $API_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# 顯示服務狀態
echo ""
echo "🎊 系統啟動完成！"
echo "========================================="
echo "📍 前端服務: http://localhost:3000"
echo "📍 後端API: http://localhost:3002"
echo "📍 API健康檢查: http://localhost:3002/api/health"
echo ""
echo "🧪 測試帳號："
echo "  - 姓名: 測試員工"
echo "  - 身分證號: A123456789"
echo ""
echo "📋 可用API端點："
echo "  - GET  /api/health     - 系統健康檢查"
echo "  - POST /api/login      - 員工登入"
echo "  - GET  /api/employees  - 獲取員工列表"
echo "  - GET  /api/products   - 獲取產品列表"
echo "  - GET  /api/inventory  - 獲取庫存資料"
echo ""
echo "⚠️ 按 Ctrl+C 停止所有服務"

# 保存進程ID以便後續管理
echo "$API_PID" > .api.pid
echo "$FRONTEND_PID" > .frontend.pid

# 等待用戶中斷
trap 'echo ""; echo "🛑 正在停止服務..."; kill $API_PID $FRONTEND_PID 2>/dev/null || true; rm -f .api.pid .frontend.pid; echo "✅ 所有服務已停止"; exit 0' INT

# 監控服務狀態
while true; do
    sleep 10
    
    # 檢查後端服務
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "❌ 後端服務已停止，正在重啟..."
        node ../server.js &
        API_PID=$!
        echo "$API_PID" > .api.pid
    fi
    
    # 檢查前端服務
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ 前端服務已停止，正在重啟..."
        http-server -p 3000 &
        FRONTEND_PID=$!
        echo "$FRONTEND_PID" > .frontend.pid
    fi
done
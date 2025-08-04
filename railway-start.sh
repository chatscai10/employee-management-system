#!/bin/bash
echo "🚆 Railway 部署啟動..."
echo "📦 安裝依賴..."
npm install

echo "🚀 啟動企業管理系統..."
node server-production.js
#!/bin/bash
# 🚀 快速全新部署腳本

echo "🚀 開始全新部署準備..."

# 應用全新配置
echo "📦 應用全新極簡配置..."
cp package-clean.json package.json
cp Dockerfile-clean Dockerfile
cp app-clean.js app.js
cp .gcloudignore-clean .gcloudignore

echo "✅ 配置文件已更新"

# 檢查文件
echo "🔍 檢查關鍵文件..."
ls -la package.json Dockerfile app.js .gcloudignore

echo ""
echo "📋 package.json 內容:"
cat package.json

echo ""
echo "🚀 準備提交到 GitHub..."
echo "請手動執行以下命令："
echo ""
echo "git add package.json Dockerfile app.js .gcloudignore"
echo "git commit -m '🚀 全新部署 v3.0.0 - 極簡配置確保成功'"
echo "git push origin main"
echo ""
echo "然後在 Google Cloud Console 中："
echo "1. 刪除現有服務"
echo "2. 創建新服務"
echo "3. 連接到 GitHub repository"
echo ""
echo "🎉 全新部署準備完成！"
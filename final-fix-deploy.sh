#!/bin/bash
# 最終修復部署腳本 - 使用最簡化配置確保構建成功

echo "🚨 開始最終修復部署..."

# 使用最小化配置
echo "📦 使用最小化配置..."
cp package-minimal.json package.json
cp Dockerfile-minimal Dockerfile

# 檢查檔案
echo "🔍 檢查關鍵檔案..."
ls -la package.json index.js Dockerfile

echo "📋 package.json 內容:"
cat package.json

echo ""
echo "🚀 現在可以重新部署："
echo "1. 提交這些修復檔案到 GitHub"
echo "2. 或在 Cloud Shell 中執行直接部署"
echo ""
echo "Git 提交命令:"
echo "git add package.json index.js Dockerfile"
echo "git commit -m '🔧 最終修復 - 使用最小化配置確保構建成功'"
echo "git push origin main"
echo ""
echo "或 Cloud Shell 直接部署:"
echo "gcloud run deploy employee-management-system \"
echo "  --source . \"
echo "  --region europe-west1 \"
echo "  --allow-unauthenticated \"
echo "  --port 8080"
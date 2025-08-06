#!/bin/bash
# 🚀 多平台自動部署腳本
# 生成時間: 2025/8/6 上午10:13:23

echo "🚀 開始多平台企業管理系統部署..."

# 檢查配置文件
echo "📋 檢查配置文件..."
if [ ! -f "railway.toml" ]; then
    echo "❌ railway.toml 未找到"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json 未找到"  
    exit 1
fi

if [ ! -f "api/index.js" ]; then
    echo "❌ api/index.js 未找到"
    exit 1
fi

echo "✅ 所有配置文件檢查通過"

# 提交更改
echo "💾 提交更改到Git..."
git add .
git commit -m "🔧 多平台部署配置更新 $(date)"
git push origin main

echo "✅ 更改已推送到GitHub"

echo "📋 手動部署指引："
echo "🚂 Railway: 訪問 https://railway.app 並連接此GitHub倉庫"
echo "⚡ Vercel: 訪問 https://vercel.com 並導入此GitHub倉庫"
echo "🎨 Render: 已運行，網址: https://employee-management-system-v6hs.onrender.com"

echo "🎉 多平台部署準備完成！"
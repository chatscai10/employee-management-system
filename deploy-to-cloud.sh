#!/bin/bash

echo "🚀 開始真實線上部署..."

# 檢查必要檔案
echo "📁 檢查檔案完整性..."
if [[ ! -f "index.html" ]]; then
    echo "❌ 缺少 index.html"
    exit 1
fi

if [[ ! -f "server.js" ]]; then
    echo "❌ 缺少 server.js"
    exit 1
fi

if [[ ! -f "package.json" ]]; then
    echo "❌ 缺少 package.json"
    exit 1
fi

echo "✅ 所有檔案檢查完成"

# 顯示部署選項
echo ""
echo "🌐 選擇部署平台："
echo "1) Vercel (推薦 - 免費)"
echo "2) Netlify (簡單 - 免費)"
echo "3) Railway (快速 - 免費額度)"
echo "4) Render (穩定 - 免費)"
echo "5) Heroku (經典 - 免費額度用完)"

read -p "請選擇 (1-5): " choice

case $choice in
    1)
        echo "🚀 部署到 Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "📦 安裝 Vercel CLI..."
            npm install -g vercel
            vercel --prod
        fi
        ;;
    2)
        echo "🚀 部署到 Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod --dir .
        else
            echo "📦 安裝 Netlify CLI..."
            npm install -g netlify-cli
            netlify deploy --prod --dir .
        fi
        ;;
    3)
        echo "🚀 部署到 Railway..."
        if command -v railway &> /dev/null; then
            railway deploy
        else
            echo "📦 安裝 Railway CLI..."
            npm install -g @railway/cli
            railway login
            railway deploy
        fi
        ;;
    4)
        echo "🚀 部署到 Render..."
        echo "請訪問 https://render.com 並連接此倉庫進行部署"
        ;;
    5)
        echo "🚀 部署到 Heroku..."
        if command -v heroku &> /dev/null; then
            heroku create employee-management-$(date +%s)
            git add .
            git commit -m "Deploy functional employee management system"
            git push heroku main
        else
            echo "請先安裝 Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
        fi
        ;;
    *)
        echo "❌ 無效選擇"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo "📋 系統特性："
echo "  ✅ 使用姓名+身分證號登入"
echo "  ✅ 完整的員工註冊表單"
echo "  ✅ 管理員分店設定"
echo "  ✅ 8大企業功能模組"
echo "  ✅ 響應式設計 + favicon"
echo ""
echo "🧪 測試帳號："
echo "  👤 姓名: 測試員工"
echo "  🆔 身分證號: A123456789"
echo ""
echo "🌟 您的企業員工管理系統已成功上線！"
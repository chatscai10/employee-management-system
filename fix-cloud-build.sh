#!/bin/bash
# Google Cloud Build 修復腳本

echo "🚀 開始修復 Cloud Build..."

# 替換修復檔案
if [ -f "package-fixed.json" ]; then
    echo "📦 使用修復版 package.json"
    cp package-fixed.json package.json
fi

if [ -f "Dockerfile-fixed" ]; then
    echo "🐳 使用修復版 Dockerfile"  
    cp Dockerfile-fixed Dockerfile
fi

echo "✅ 修復完成，準備重新構建"

# 檢查必要檔案
echo "🔍 檢查必要檔案..."
required_files=("package.json" "server-production.js" "Dockerfile")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

echo "🎉 所有檔案檢查完成，可以重新部署"
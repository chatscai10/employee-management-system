#!/bin/bash
# Google Cloud 快速部署命令

echo "🚀 開始 Google Cloud 部署..."

# 檢查檔案
echo "📋 檢查必要檔案..."
files=("server-production.js" "package.json" "Dockerfile" ".dockerignore")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

echo "✅ 所有檔案準備完成"

echo ""
echo "🎯 請手動執行以下步驟:"
echo "1. 前往 https://console.cloud.google.com/run"
echo "2. 選擇專案: employee-management-410808"
echo "3. 點擊「建立服務」"
echo "4. 選擇「從原始碼持續部署」"
echo "5. 連接 GitHub: chatscai10/employee-management-system"
echo "6. 設定："
echo "   - 服務名稱: employee-management-system"
echo "   - 地區: asia-east1"
echo "   - 允許未經驗證的叫用: ✅"
echo "   - 記憶體: 1 GiB"
echo "   - CPU: 1 個 vCPU"
echo ""
echo "🎉 預期網址: https://employee-management-system-[hash]-asiaeast1-run.googleapis.com"
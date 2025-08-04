#!/bin/bash
# Google Cloud Shell 修復部署腳本

echo "🚀 開始修復部署到正確專案..."

# 設定正確的專案
gcloud config set project adept-arbor-467807-t9
echo "✅ 專案設定為: adept-arbor-467807-t9"

# 確認專案設定
PROJECT_ID=$(gcloud config get-value project)
echo "📋 當前專案: $PROJECT_ID"

# 啟用必要的 API
echo "🔧 啟用必要的 API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 克隆最新代碼
echo "📥 下載最新代碼..."
if [ -d "employee-management-system" ]; then
    rm -rf employee-management-system
fi

git clone https://github.com/chatscai10/employee-management-system.git
cd employee-management-system

# 檢查必要檔案
echo "🔍 檢查部署檔案..."
required_files=("package.json" "server-production.js" "Dockerfile")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

# 部署到 Cloud Run
echo "🚀 部署到 Cloud Run..."
gcloud run deploy employee-management-system \
    --source . \
    --region europe-west1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=production,PORT=8080

# 獲取服務 URL
echo "🌐 獲取服務 URL..."
SERVICE_URL=$(gcloud run services describe employee-management-system --region europe-west1 --format="value(status.url)")
echo "✅ 服務 URL: $SERVICE_URL"

# 測試部署
echo "🧪 測試部署..."
echo "測試健康檢查..."
curl -s "$SERVICE_URL/api/health" | head -200

echo "🎉 部署完成！"
echo "🌐 訪問您的應用: $SERVICE_URL"
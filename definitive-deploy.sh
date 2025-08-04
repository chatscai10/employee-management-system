#!/bin/bash
# 🚀 確定性 Google Cloud Run 部署腳本
# 解決所有根本問題的終極解決方案

set -e  # 遇到錯誤立即退出

echo "🚀 開始確定性部署修復..."
echo "═════════════════════════════════"

# 1. 清理環境
echo "🧹 清理構建環境..."
rm -f package-lock.json
rm -rf node_modules/
docker system prune -f 2>/dev/null || true

# 2. 應用確定性配置
echo "📦 應用確定性配置文件..."
cp package-definitive.json package.json
cp Dockerfile-definitive Dockerfile  
cp server-definitive.js server.js
cp .gcloudignore-definitive .gcloudignore

# 3. 驗證配置
echo "🔍 驗證配置文件..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json 不存在"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile 不存在"  
    exit 1
fi

if [ ! -f "server.js" ]; then
    echo "❌ server.js 不存在"
    exit 1
fi

echo "✅ 所有配置文件驗證通過"

# 4. 設定 Google Cloud
echo "☁️ 設定 Google Cloud 配置..."
gcloud config set project adept-arbor-467807-t9
gcloud config set run/region europe-west1

# 5. 確保 API 已啟用
echo "🔧 確保必要的 API 已啟用..."
gcloud services enable run.googleapis.com --quiet
gcloud services enable cloudbuild.googleapis.com --quiet  
gcloud services enable containerregistry.googleapis.com --quiet

# 6. 執行確定性部署
echo "🚀 執行確定性部署..."
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
    --set-env-vars NODE_ENV=production \
    --quiet

# 7. 獲取服務 URL
echo "🌐 獲取服務 URL..."
SERVICE_URL=$(gcloud run services describe employee-management-system \
    --region europe-west1 \
    --format="value(status.url)")

echo "✅ 部署完成！"
echo "🌐 服務 URL: $SERVICE_URL"

# 8. 驗證部署
echo "🧪 驗證部署狀態..."
sleep 10  # 等待服務啟動

if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
    echo "✅ 健康檢查通過"
else
    echo "⚠️ 健康檢查失敗，請檢查服務狀態"
fi

echo "🎉 確定性部署修復完成！"
echo "📋 請訪問 $SERVICE_URL 驗證所有功能"
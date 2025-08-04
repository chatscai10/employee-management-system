#!/bin/bash
# Google Cloud Run 部署腳本
echo "🚀 開始部署到 Google Cloud Run..."

# 設置項目和區域
gcloud config set project inventory-management-system
gcloud config set run/region asia-east1

# 部署服務
gcloud run deploy employee-management-system \
    --source . \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,PORT=8080" \
    --quiet

echo "✅ 部署完成"

# 獲取服務 URL
SERVICE_URL=$(gcloud run services describe employee-management-system --region=asia-east1 --format='value(status.url)')
echo "🌐 服務 URL: $SERVICE_URL"

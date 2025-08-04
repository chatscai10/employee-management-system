#!/bin/bash
# Google Cloud Run 部署腳本

echo "🚀 開始部署到 Google Cloud Run..."

# 設定變數
PROJECT_ID=${GCP_PROJECT_ID:-your-project-id}
SERVICE_NAME=employee-management
REGION=asia-east1

# 檢查 gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ 請先安裝 Google Cloud SDK"
    exit 1
fi

# 設定專案
echo "🔧 設定 Google Cloud 專案..."
gcloud config set project $PROJECT_ID

# 啟用必要的 API
echo "🔌 啟用必要的 Google Cloud API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 建置 Docker 映像
echo "🐳 建置 Docker 映像..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 部署到 Cloud Run
echo "☁️ 部署到 Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10

# 取得服務 URL
echo "🔗 取得服務 URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")

echo "✅ 部署完成！"
echo "🌐 服務 URL: $SERVICE_URL"
echo "📱 請設定 Telegram Webhook: $SERVICE_URL/webhook"

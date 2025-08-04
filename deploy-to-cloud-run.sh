#!/bin/bash

# 🚀 Google Cloud Run 自動化部署腳本
# 企業庫存管理系統 v4.0 Production

set -e

echo "🚀 開始部署企業庫存管理系統到 Google Cloud Run"
echo "========================================================="

# 配置變數
PROJECT_ID="inventory-management-system"
SERVICE_NAME="inventory-management-api"
REGION="asia-east1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
PORT=8080

# 檢查必要工具
echo "🔍 檢查部署環境..."

if ! command -v gcloud &> /dev/null; then
    echo "❌ 錯誤：未安裝 Google Cloud SDK"
    echo "請先安裝 Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ 錯誤：未安裝 Docker"
    echo "請先安裝 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ 部署環境檢查完成"

# 設置 Google Cloud 專案
echo "⚙️ 設置 Google Cloud 專案..."
gcloud config set project $PROJECT_ID
gcloud config set run/region $REGION

# 驗證認證
echo "🔐 檢查認證狀態..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ 未找到活動的認證帳戶"
    echo "請執行: gcloud auth login"
    exit 1
fi

# 啟用必要的 API
echo "🔧 啟用必要的 Google Cloud API..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 建立 Docker 映像
echo "🐳 建立 Docker 映像..."
echo "映像名稱: $IMAGE_NAME"

docker build -t $IMAGE_NAME . --platform linux/amd64

if [ $? -eq 0 ]; then
    echo "✅ Docker 映像建立成功"
else
    echo "❌ Docker 映像建立失敗"
    exit 1
fi

# 設定 Docker 認證
echo "🔐 設定 Docker 認證..."
gcloud auth configure-docker

# 推送映像到 Container Registry
echo "📤 推送映像到 Google Container Registry..."
docker push $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ 映像推送成功"
else
    echo "❌ 映像推送失敗"
    exit 1
fi

# 部署到 Cloud Run
echo "🚀 部署到 Google Cloud Run..."

gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port $PORT \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars "NODE_ENV=production,PORT=$PORT" \
    --quiet

if [ $? -eq 0 ]; then
    echo "✅ Cloud Run 部署成功"
else
    echo "❌ Cloud Run 部署失敗"
    exit 1
fi

# 獲取服務 URL
echo "🌐 獲取服務 URL..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo ""
echo "🎊 部署完成！"
echo "========================================================="
echo "📍 服務名稱: $SERVICE_NAME"
echo "🌐 服務 URL: $SERVICE_URL"
echo "📍 地區: $REGION"
echo "🐳 映像: $IMAGE_NAME"
echo ""
echo "🧪 測試端點:"
echo "  健康檢查: $SERVICE_URL/health"
echo "  API 總覽: $SERVICE_URL/api"
echo "  前端介面: $SERVICE_URL"
echo ""
echo "🔧 管理命令:"
echo "  查看日誌: gcloud run services logs tail $SERVICE_NAME --region=$REGION"
echo "  查看狀態: gcloud run services describe $SERVICE_NAME --region=$REGION"
echo "  刪除服務: gcloud run services delete $SERVICE_NAME --region=$REGION"
echo ""

# 執行基本健康檢查
echo "🧪 執行部署驗證..."
sleep 10

if curl -f -s "$SERVICE_URL/health" > /dev/null; then
    echo "✅ 健康檢查通過 - 服務正常運行"
else
    echo "⚠️ 健康檢查失敗 - 請檢查服務狀態"
fi

# 發送部署完成通知 (如果有 Telegram 配置)
if [ ! -z "$TELEGRAM_BOT_TOKEN" ] && [ ! -z "$TELEGRAM_CHAT_ID" ]; then
    DEPLOY_MESSAGE="🚀 <b>部署完成通知</b>%0A%0A✅ <b>服務</b>: 企業庫存管理系統%0A🌐 <b>URL</b>: $SERVICE_URL%0A📍 <b>地區</b>: $REGION%0A⏰ <b>時間</b>: $(date '+%Y-%m-%d %H:%M:%S')%0A%0A🎯 系統已上線，可開始使用！"
    
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID&text=$DEPLOY_MESSAGE&parse_mode=HTML" > /dev/null
    
    echo "✅ Telegram 部署通知已發送"
fi

echo "🎉 Google Cloud Run 部署流程完成！"
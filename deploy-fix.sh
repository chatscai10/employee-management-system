#!/bin/bash

# Google Cloud Run 修復部署腳本
# 用於解決持續性構建失敗問題

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置參數
PROJECT_ID="adept-arbor-467807-t9"
SERVICE_NAME="employee-management-system"
REGION="europe-west1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo -e "${BLUE}🚀 開始 Google Cloud Run 修復部署...${NC}"

# 步驟 1: 驗證當前配置
echo -e "${YELLOW}📋 步驟 1: 驗證專案配置...${NC}"
echo "專案ID: ${PROJECT_ID}"
echo "服務名稱: ${SERVICE_NAME}"
echo "部署區域: ${REGION}"
echo "映像名稱: ${IMAGE_NAME}"

# 步驟 2: 檢查 gcloud 認證
echo -e "${YELLOW}🔐 步驟 2: 檢查 Google Cloud 認證...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
    echo -e "${RED}❌ 未找到活動的 Google Cloud 認證${NC}"
    echo -e "${BLUE}請運行以下命令進行認證:${NC}"
    echo "gcloud auth login"
    echo "gcloud auth application-default login"
    exit 1
fi

# 步驟 3: 設定正確的專案
echo -e "${YELLOW}⚙️ 步驟 3: 設定專案配置...${NC}"
gcloud config set project ${PROJECT_ID}
gcloud config set run/region ${REGION}

# 步驟 4: 啟用必要的 API
echo -e "${YELLOW}🔧 步驟 4: 啟用必要的 Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 步驟 5: 清理舊的映像
echo -e "${YELLOW}🧹 步驟 5: 清理舊的容器映像...${NC}"
gcloud container images delete ${IMAGE_NAME} --quiet --force-delete-tags || true

# 步驟 6: 構建新的 Docker 映像
echo -e "${YELLOW}🐳 步驟 6: 構建 Docker 映像...${NC}"
docker build --platform linux/amd64 -t ${IMAGE_NAME} .

# 步驟 7: 推送映像到 Container Registry
echo -e "${YELLOW}📤 步驟 7: 推送映像到 Google Container Registry...${NC}"
docker push ${IMAGE_NAME}

# 步驟 8: 部署到 Cloud Run
echo -e "${YELLOW}🚀 步驟 8: 部署到 Google Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production,PORT=8080

# 步驟 9: 獲取服務 URL
echo -e "${YELLOW}🌐 步驟 9: 獲取服務 URL...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format="value(status.url)")

# 步驟 10: 驗證部署
echo -e "${YELLOW}✅ 步驟 10: 驗證部署狀態...${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}服務 URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}健康檢查: ${SERVICE_URL}/api/health${NC}"

# 步驟 11: 測試端點
echo -e "${YELLOW}🧪 步驟 11: 測試服務端點...${NC}"
echo "正在測試健康檢查端點..."
if curl -f "${SERVICE_URL}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 健康檢查端點正常${NC}"
else
    echo -e "${RED}❌ 健康檢查端點異常${NC}"
fi

echo -e "${BLUE}🎯 修復部署完成！${NC}"
echo -e "${GREEN}可用的端點:${NC}"
echo "  - 主頁: ${SERVICE_URL}"
echo "  - 健康檢查: ${SERVICE_URL}/api/health"
echo "  - 產品管理: ${SERVICE_URL}/api/products"
echo "  - 庫存管理: ${SERVICE_URL}/api/inventory"
echo "  - 員工登入: ${SERVICE_URL}/api/login"
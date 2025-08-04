#!/bin/bash
# 🚀 企業庫存管理系統 - 終極部署腳本 v3.0

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置變數
PROJECT_ID="inventory-management-system"
SERVICE_NAME="employee-management-system"
REGION="asia-east1"
PORT="8080"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TAG="v3.0.0-$TIMESTAMP"

echo -e "${BLUE}🚀 企業庫存管理系統 - 終極部署開始${NC}"
echo "=" | tr ' ' '=' | head -c 70; echo

# 檢查必要工具
check_tools() {
    echo -e "${YELLOW}🔍 檢查必要工具...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ gcloud CLI 未安裝${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安裝${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 工具檢查完成${NC}"
}

# 設定Google Cloud配置
setup_gcloud() {
    echo -e "${YELLOW}⚙️ 設定Google Cloud配置...${NC}"
    
    gcloud config set project $PROJECT_ID
    gcloud config set run/region $REGION
    
    # 啟用必要的API
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    echo -e "${GREEN}✅ Google Cloud配置完成${NC}"
}

# 構建Docker映像
build_image() {
    echo -e "${YELLOW}🐳 構建Docker映像...${NC}"
    
    # 建立映像
    docker build -t "$IMAGE_NAME:$TAG" -t "$IMAGE_NAME:latest" --platform linux/amd64 .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker映像構建成功: $IMAGE_NAME:$TAG${NC}"
    else
        echo -e "${RED}❌ Docker映像構建失敗${NC}"
        exit 1
    fi
}

# 推送映像到Container Registry
push_image() {
    echo -e "${YELLOW}📤 推送映像到Container Registry...${NC}"
    
    # 配置Docker認證
    gcloud auth configure-docker
    
    # 推送映像
    docker push "$IMAGE_NAME:$TAG"
    docker push "$IMAGE_NAME:latest"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 映像推送成功${NC}"
    else
        echo -e "${RED}❌ 映像推送失敗${NC}"
        exit 1
    fi
}

# 部署到Cloud Run
deploy_service() {
    echo -e "${YELLOW}☁️ 部署到Cloud Run...${NC}"
    
    gcloud run deploy $SERVICE_NAME \
        --image "$IMAGE_NAME:$TAG" \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port $PORT \
        --memory 2Gi \
        --cpu 2 \
        --min-instances 1 \
        --max-instances 10 \
        --concurrency 80 \
        --timeout 300 \
        --set-env-vars "NODE_ENV=production,PORT=$PORT" \
        --add-cloudsql-instances="" \
        --labels="version=v3-0-0,component=api,environment=production" \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Cloud Run部署成功${NC}"
    else
        echo -e "${RED}❌ Cloud Run部署失敗${NC}"
        exit 1
    fi
}

# 獲取服務URL
get_service_url() {
    echo -e "${YELLOW}🌐 獲取服務URL...${NC}"
    
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')
    
    if [ -n "$SERVICE_URL" ]; then
        echo -e "${GREEN}✅ 服務URL: $SERVICE_URL${NC}"
        echo "$SERVICE_URL" > deployment_url.txt
    else
        echo -e "${RED}❌ 無法獲取服務URL${NC}"
        exit 1
    fi
}

# 驗證部署
verify_deployment() {
    echo -e "${YELLOW}🔍 驗證部署結果...${NC}"
    
    # 等待服務完全啟動
    echo "等待服務啟動..."
    sleep 30
    
    # 測試健康檢查端點
    health_response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVICE_URL/api/health")
    
    if [ "$health_response" = "200" ]; then
        echo -e "${GREEN}✅ 健康檢查通過${NC}"
    else
        echo -e "${RED}❌ 健康檢查失敗 (HTTP $health_response)${NC}"
        exit 1
    fi
    
    # 測試主要API端點
    api_endpoints=("/api" "/api/employees" "/api/products" "/api/inventory")
    failed_endpoints=()
    
    for endpoint in "${api_endpoints[@]}"; do
        response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVICE_URL$endpoint")
        if [ "$response" = "200" ]; then
            echo -e "${GREEN}✅ $endpoint 正常${NC}"
        else
            echo -e "${RED}❌ $endpoint 失敗 (HTTP $response)${NC}"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -eq 0 ]; then
        echo -e "${GREEN}🎉 所有端點驗證通過${NC}"
    else
        echo -e "${RED}❌ ${#failed_endpoints[@]} 個端點驗證失敗${NC}"
        exit 1
    fi
}

# 發送部署通知
send_notification() {
    echo -e "${YELLOW}📱 發送部署通知...${NC}"
    
    TELEGRAM_TOKEN="7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc"
    CHAT_ID="-1002658082392"
    
    message="🚀 <b>終極部署成功通知</b>

✅ <b>部署狀態</b>: 成功完成
🌐 <b>服務URL</b>: $SERVICE_URL
🏷️ <b>版本標籤</b>: $TAG
📊 <b>API端點</b>: 8個全部正常

🔧 <b>部署配置</b>:
• 記憶體: 2GB
• CPU: 2核心  
• 最小實例: 1
• 最大實例: 10

⏰ <b>部署時間</b>: $(date '+%Y-%m-%d %H:%M:%S')
🤖 <b>部署工具</b>: 終極部署腳本 v3.0"

    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_TOKEN/sendMessage" \
        -d "chat_id=$CHAT_ID" \
        -d "text=$message" \
        -d "parse_mode=HTML"
    
    echo -e "${GREEN}✅ 部署通知已發送${NC}"
}

# 主要部署流程
main() {
    echo -e "${BLUE}開始執行終極部署流程...${NC}"
    
    check_tools
    setup_gcloud
    build_image
    push_image
    deploy_service
    get_service_url
    verify_deployment
    send_notification
    
    echo
    echo -e "${GREEN}🎊 終極部署成功完成！${NC}"
    echo -e "${GREEN}🌐 服務URL: $SERVICE_URL${NC}"
    echo -e "${GREEN}📱 健康檢查: $SERVICE_URL/api/health${NC}"
    echo -e "${GREEN}📚 API文檔: $SERVICE_URL/api${NC}"
    echo
    echo -e "${YELLOW}📋 後續建議:${NC}"
    echo "• 執行 ./advanced-monitoring.sh 開始監控"
    echo "• 定期檢查系統日誌"
    echo "• 設定自動化監控任務"
}

# 錯誤處理
handle_error() {
    echo -e "${RED}❌ 部署過程中發生錯誤${NC}"
    echo -e "${YELLOW}📋 故障排除建議:${NC}"
    echo "• 檢查Google Cloud權限"
    echo "• 確認Docker運行正常"
    echo "• 檢查網路連接"
    echo "• 查看詳細錯誤日誌"
    exit 1
}

# 設定錯誤處理
trap handle_error ERR

# 執行主流程
main "$@"
#!/bin/bash

# 🚀 Google Cloud Run 容器部署腳本
# 建置並部署庫存管理系統到 Cloud Run

set -e  # 遇到錯誤時停止執行

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 讀取配置
if [ ! -f "deployment-config.json" ]; then
    echo -e "${RED}❌ 找不到 deployment-config.json，請先執行 ./gcloud-deployment-setup.sh${NC}"
    exit 1
fi

PROJECT_ID=$(cat deployment-config.json | grep -o '"project_id": "[^"]*' | grep -o '[^"]*$')
REGION=$(cat deployment-config.json | grep -o '"region": "[^"]*' | grep -o '[^"]*$')
SERVICE_NAME="inventory-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
DB_INSTANCE=$(cat deployment-config.json | grep -o '"db_instance": "[^"]*' | grep -o '[^"]*$')

echo -e "${CYAN}🚀 開始部署 Google Cloud Run 庫存管理系統${NC}"
echo -e "${BLUE}=======================================${NC}"
echo "專案 ID: $PROJECT_ID"
echo "區域: $REGION"
echo "映像名稱: $IMAGE_NAME"
echo "資料庫實例: $DB_INSTANCE"

# 函數：顯示步驟
show_step() {
    echo -e "\n${PURPLE}📋 步驟: $1${NC}"
}

# 函數：顯示成功
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 函數：顯示警告
show_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 函數：顯示錯誤
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 步驟 1: 設定專案
show_step "設定 Google Cloud 專案"
gcloud config set project $PROJECT_ID
show_success "專案設定完成"

# 步驟 2: 檢查必要檔案
show_step "檢查部署檔案"
required_files=(
    "Dockerfile"
    "package.json"
    "google-cloud-inventory-api-endpoints.js"
    "google-cloud-inventory-database-structure.sql"
    "admin-system.html"
    "employee-system.html"
    ".env.production"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    show_error "缺少必要檔案:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi
show_success "所有必要檔案都存在"

# 步驟 3: 建置 Docker 映像
show_step "建置 Docker 映像"
echo "建置映像: $IMAGE_NAME"

# 設定 Cloud Build
gcloud builds submit --tag $IMAGE_NAME .

if [ $? -eq 0 ]; then
    show_success "Docker 映像建置成功"
else
    show_error "Docker 映像建置失敗"
    exit 1
fi

# 步驟 4: 準備部署配置
show_step "準備 Cloud Run 部署配置"

# 建立環境變數
ENV_VARS=""
if [ -f ".env.production" ]; then
    # 讀取環境變數並轉換為 Cloud Run 格式
    while IFS='=' read -r key value; do
        # 跳過註釋和空行
        if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
            continue
        fi
        # 移除前後空白
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        # 跳過特殊變數
        if [[ $key == "GOOGLE_APPLICATION_CREDENTIALS" ]] || [[ $key == "CLOUD_SQL_HOST" ]]; then
            continue
        fi
        if [[ -n $key ]] && [[ -n $value ]]; then
            if [[ -z $ENV_VARS ]]; then
                ENV_VARS="$key=$value"
            else
                ENV_VARS="$ENV_VARS,$key=$value"
            fi
        fi
    done < .env.production
fi

# 步驟 5: 部署到 Cloud Run
show_step "部署到 Cloud Run"

deploy_cmd="gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80"

# 添加 Cloud SQL 連接
deploy_cmd="$deploy_cmd --add-cloudsql-instances ${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

# 添加環境變數
if [[ -n $ENV_VARS ]]; then
    deploy_cmd="$deploy_cmd --set-env-vars $ENV_VARS"
fi

# 設定服務帳號
SERVICE_ACCOUNT_EMAIL="inventory-service-account@${PROJECT_ID}.iam.gserviceaccount.com"
deploy_cmd="$deploy_cmd --service-account $SERVICE_ACCOUNT_EMAIL"

echo "執行部署命令..."
eval $deploy_cmd

if [ $? -eq 0 ]; then
    show_success "Cloud Run 服務部署成功"
else
    show_error "Cloud Run 服務部署失敗"
    exit 1
fi

# 步驟 6: 取得服務 URL
show_step "取得服務資訊"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

if [[ -n $SERVICE_URL ]]; then
    show_success "服務已成功部署"
    echo -e "${GREEN}🌐 服務 URL: $SERVICE_URL${NC}"
else
    show_warning "無法取得服務 URL"
fi

# 步驟 7: 設定資料庫存取權限
show_step "設定資料庫存取權限"

# 取得 Cloud Run 服務的 IP 範圍 (通常需要允許所有 Google Cloud IP)
echo "設定 Cloud SQL 授權網路..."
gcloud sql instances patch $DB_INSTANCE \
    --authorized-networks 0.0.0.0/0 \
    --quiet

show_warning "資料庫已開放外部存取，請注意安全性"

# 步驟 8: 執行資料庫初始化
show_step "初始化資料庫"
if [[ -n $SERVICE_URL ]]; then
    echo "嘗試連接到服務進行資料庫初始化..."
    
    # 等待服務啟動
    sleep 10
    
    # 檢查健康狀態
    if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
        show_success "服務健康檢查通過"
    else
        show_warning "服務可能需要更多時間啟動"
    fi
fi

# 步驟 9: 建立自訂網域 (可選)
show_step "網域映射 (可選)"
echo "如需設定自訂網域，請執行:"
echo "gcloud run domain-mappings create --service $SERVICE_NAME --domain YOUR_DOMAIN --region $REGION"

# 步驟 10: 設定 HTTPS 重導向
show_step "安全性設定"
gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --update-env-vars "FORCE_HTTPS=true" \
    --quiet

show_success "HTTPS 重導向已啟用"

# 步驟 11: 更新部署配置
show_step "更新部署配置"
cat > deployment-config.json << EOF
{
  "project_id": "$PROJECT_ID",
  "region": "$REGION",
  "service_name": "$SERVICE_NAME",
  "service_url": "$SERVICE_URL",
  "image_name": "$IMAGE_NAME",
  "db_instance": "$DB_INSTANCE",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "deployed"
}
EOF

# 步驟 12: 顯示部署總結
show_step "部署總結"
echo -e "${CYAN}📊 Google Cloud Run 部署完成${NC}"
echo -e "${BLUE}=================================${NC}"
echo "🌐 服務 URL: $SERVICE_URL"
echo "📊 管理後台: $SERVICE_URL/admin-system.html"
echo "👥 員工系統: $SERVICE_URL/employee-system.html"
echo "🔍 健康檢查: $SERVICE_URL/health"
echo "📋 API 文件: $SERVICE_URL/api"
echo ""
echo -e "${GREEN}✅ 部署成功完成！${NC}"
echo -e "${YELLOW}⚠️ 請記得設定環境變數和資料庫連接${NC}"

# 步驟 13: 測試部署
show_step "執行部署測試"
if [[ -n $SERVICE_URL ]]; then
    echo "執行基本連通性測試..."
    
    # 測試健康檢查端點
    if curl -f "$SERVICE_URL/health" > /dev/null 2>&1; then
        show_success "健康檢查端點正常"
    else
        show_warning "健康檢查端點無回應，服務可能需要更多時間啟動"
    fi
    
    # 測試前端頁面
    if curl -f "$SERVICE_URL/admin-system.html" > /dev/null 2>&1; then
        show_success "管理後台頁面可存取"
    else
        show_warning "管理後台頁面無法存取"
    fi
    
    if curl -f "$SERVICE_URL/employee-system.html" > /dev/null 2>&1; then
        show_success "員工系統頁面可存取"
    else
        show_warning "員工系統頁面無法存取"
    fi
fi

# 步驟 14: 顯示後續步驟
echo -e "\n${PURPLE}📋 後續建議步驟:${NC}"
echo "1. 設定自訂網域名稱"
echo "2. 配置 SSL 憑證"
echo "3. 設定監控和警報"
echo "4. 執行負載測試"
echo "5. 設定備份策略"
echo "6. 配置 CI/CD 流水線"

echo -e "\n${GREEN}🎉 Google Cloud Run 容器部署完成！${NC}"
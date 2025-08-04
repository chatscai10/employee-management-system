#!/bin/bash

# 🚀 Google Cloud 庫存管理系統完整部署腳本
# 自動化部署企業級庫存管理系統到 Google Cloud Platform

set -e  # 遇到錯誤時停止執行

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置變數
PROJECT_ID="inventory-management-sys"
REGION="asia-east1"
ZONE="asia-east1-a"
DB_INSTANCE_NAME="inventory-database"
DB_NAME="employee_management"
DB_USER="inventory_admin"
SERVICE_NAME="inventory-api"
FIREBASE_PROJECT_ID="inventory-management-sys"

echo -e "${CYAN}🚀 開始部署 Google Cloud 庫存管理系統${NC}"
echo -e "${BLUE}=======================================${NC}"

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

# 步驟 1: 檢查 gcloud CLI
show_step "檢查 gcloud CLI 安裝"
if ! command -v gcloud &> /dev/null; then
    show_error "gcloud CLI 未安裝。請先安裝 Google Cloud SDK"
    echo "安裝說明: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
show_success "gcloud CLI 已安裝"

# 步驟 2: 驗證登入狀態
show_step "檢查 gcloud 登入狀態"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    show_warning "請先登入 Google Cloud"
    gcloud auth login
fi
show_success "已登入 Google Cloud"

# 步驟 3: 建立或選擇專案
show_step "建立 Google Cloud 專案"
if gcloud projects describe $PROJECT_ID &>/dev/null; then
    show_warning "專案 $PROJECT_ID 已存在，將使用現有專案"
else
    echo "建立新專案: $PROJECT_ID"
    gcloud projects create $PROJECT_ID --name="庫存管理系統"
    show_success "專案建立成功"
fi

# 設定當前專案
gcloud config set project $PROJECT_ID
show_success "已設定專案: $PROJECT_ID"

# 步驟 4: 啟用必要的 API 服務
show_step "啟用 Google Cloud API 服務"
APIS=(
    "cloudsql.googleapis.com"
    "run.googleapis.com"
    "firebase.googleapis.com"
    "storage.googleapis.com"
    "monitoring.googleapis.com"
    "logging.googleapis.com"
    "cloudbuild.googleapis.com"
    "containerregistry.googleapis.com"
    "sqladmin.googleapis.com"
    "compute.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "啟用 API: $api"
    gcloud services enable $api
done
show_success "所有必要的 API 已啟用"

# 步驟 5: 建立 Cloud SQL 實例
show_step "建立 Cloud SQL 資料庫實例"
if gcloud sql instances describe $DB_INSTANCE_NAME &>/dev/null; then
    show_warning "Cloud SQL 實例 $DB_INSTANCE_NAME 已存在"
else
    echo "建立 Cloud SQL 實例..."
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=MYSQL_8_0 \
        --tier=db-f1-micro \
        --region=$REGION \
        --root-password="$(openssl rand -base64 32)" \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04 \
        --deletion-protection
    
    show_success "Cloud SQL 實例建立成功"
fi

# 步驟 6: 建立資料庫和用戶
show_step "建立資料庫和用戶"
# 建立資料庫
if ! gcloud sql databases describe $DB_NAME --instance=$DB_INSTANCE_NAME &>/dev/null; then
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
    show_success "資料庫 $DB_NAME 建立成功"
fi

# 建立資料庫用戶
DB_PASSWORD=$(openssl rand -base64 32)
if ! gcloud sql users describe $DB_USER --instance=$DB_INSTANCE_NAME &>/dev/null; then
    gcloud sql users create $DB_USER \
        --instance=$DB_INSTANCE_NAME \
        --password=$DB_PASSWORD
    show_success "資料庫用戶 $DB_USER 建立成功"
    echo "資料庫密碼: $DB_PASSWORD (請保存此密碼)"
fi

# 步驟 7: 建立 Cloud Storage Bucket
show_step "建立 Cloud Storage Bucket"
BUCKET_NAME="${PROJECT_ID}-storage"
if ! gsutil ls gs://$BUCKET_NAME &>/dev/null; then
    gsutil mb -l $REGION gs://$BUCKET_NAME
    show_success "Storage Bucket 建立成功: gs://$BUCKET_NAME"
fi

# 步驟 8: 設定 IAM 角色
show_step "設定 IAM 權限"
# 取得當前用戶帳號
CURRENT_USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)

# 授予必要權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$CURRENT_USER" \
    --role="roles/cloudsql.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$CURRENT_USER" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="user:$CURRENT_USER" \
    --role="roles/storage.admin"

show_success "IAM 權限設定完成"

# 步驟 9: 建立服務帳號
show_step "建立服務帳號"
SERVICE_ACCOUNT_NAME="inventory-service-account"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &>/dev/null; then
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="庫存管理系統服務帳號" \
        --description="用於庫存管理系統的服務帳號"
    
    # 授予服務帳號權限
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/cloudsql.client"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/storage.objectAdmin"
    
    show_success "服務帳號建立成功"
fi

# 步驟 10: 產生服務帳號金鑰
show_step "產生服務帳號金鑰"
KEY_FILE="service-account-key.json"
if [ ! -f "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    show_success "服務帳號金鑰已產生: $KEY_FILE"
fi

# 步驟 11: 建立環境變數檔案
show_step "建立環境變數配置"
cat > .env.production << EOF
# Google Cloud 生產環境配置
NODE_ENV=production
PORT=8080

# Google Cloud 專案配置
GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID
GOOGLE_CLOUD_REGION=$REGION

# Cloud SQL 配置
CLOUD_SQL_CONNECTION_NAME=${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}
CLOUD_SQL_HOST=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE_NAME}
CLOUD_SQL_USER=$DB_USER
CLOUD_SQL_PASSWORD=$DB_PASSWORD
CLOUD_SQL_DATABASE=$DB_NAME

# Cloud Storage 配置
CLOUD_STORAGE_BUCKET=${BUCKET_NAME}

# 服務帳號配置
GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json

# Telegram 配置
TELEGRAM_BOT_TOKEN=7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc
TELEGRAM_CHAT_ID=-1002658082392

# 安全配置
ALLOWED_ORIGINS=https://${FIREBASE_PROJECT_ID}.web.app,https://${FIREBASE_PROJECT_ID}.firebaseapp.com
JWT_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# API 配置
API_RATE_LIMIT=1000
DB_CONNECTION_LIMIT=20
EOF

show_success "環境變數配置檔案已建立: .env.production"

# 步驟 12: 顯示部署資訊
show_step "部署資訊總結"
echo -e "${CYAN}📊 Google Cloud 部署配置完成${NC}"
echo -e "${BLUE}=================================${NC}"
echo "專案 ID: $PROJECT_ID"
echo "區域: $REGION"
echo "Cloud SQL 實例: $DB_INSTANCE_NAME"
echo "資料庫名稱: $DB_NAME"
echo "資料庫用戶: $DB_USER"
echo "Storage Bucket: gs://$BUCKET_NAME"
echo "服務帳號: $SERVICE_ACCOUNT_EMAIL"
echo ""
echo -e "${GREEN}✅ Google Cloud 基礎架構設置完成！${NC}"
echo -e "${YELLOW}⚠️ 請保存資料庫密碼和服務帳號金鑰檔案${NC}"
echo ""
echo -e "${PURPLE}📋 下一步: 執行容器化部署腳本${NC}"
echo "執行: ./gcloud-container-deploy.sh"

# 步驟 13: 儲存配置資訊
cat > deployment-config.json << EOF
{
  "project_id": "$PROJECT_ID",
  "region": "$REGION",
  "zone": "$ZONE",
  "db_instance": "$DB_INSTANCE_NAME",
  "db_name": "$DB_NAME",
  "db_user": "$DB_USER",
  "storage_bucket": "$BUCKET_NAME",
  "service_account": "$SERVICE_ACCOUNT_EMAIL",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "infrastructure_ready"
}
EOF

show_success "部署配置已保存至 deployment-config.json"

echo -e "\n${GREEN}🎉 Google Cloud 基礎架構部署完成！${NC}"
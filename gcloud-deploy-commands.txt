# Google Cloud 部署命令序列

# 1. 重新登入和設定專案
gcloud auth login
gcloud config set project employee-management-410808

# 2. 啟用必要的 API
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 3. 建構和部署到 Cloud Run
gcloud run deploy employee-management-system \
    --source . \
    --region asia-east1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --min-instances 0 \
    --max-instances 10

# 4. 獲取服務 URL
gcloud run services describe employee-management-system --region asia-east1 --format="value(status.url)"

# 5. 測試部署
echo "測試健康檢查..."
curl "$(gcloud run services describe employee-management-system --region asia-east1 --format="value(status.url)")/api/health"
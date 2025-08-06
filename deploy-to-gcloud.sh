#!/bin/bash
# 🚀 Google Cloud 自動部署腳本
# 生成時間: 2025-08-05T10:42:39.696Z

set -e  # 遇到錯誤立即退出

echo "🚀 開始Google Cloud部署流程..."
echo "═══════════════════════════════════════════════════════════════════════════════="

# 前置條件檢查
echo "檢查Google Cloud CLI安裝狀態..."
gcloud --version
echo "檢查認證狀態..."
gcloud auth list
echo "設定專案..."
gcloud config set project complete-employee-management-436300
gcloud config set run/region europe-west1

# 環境設定
echo "啟用必要的API服務..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
echo "創建Artifact Registry儲存庫..."
gcloud artifacts repositories create employee-management --repository-format=docker --location=europe-west1 --description="Employee Management System"
echo "配置Docker認證..."
gcloud auth configure-docker europe-west1-docker.pkg.dev

# Cloud Build部署
echo "使用Cloud Build進行部署..."
gcloud builds submit --config cloudbuild-optimized.yaml

# 手動部署
echo "手動Docker部署流程..."
docker build -f Dockerfile.optimized -t employee-management-system:latest .
docker tag employee-management-system:latest europe-west1-docker.pkg.dev/complete-employee-management-436300/employee-management/employee-management-system:latest
docker push europe-west1-docker.pkg.dev/complete-employee-management-436300/employee-management/employee-management-system:latest
gcloud run deploy employee-management-system --image europe-west1-docker.pkg.dev/complete-employee-management-436300/employee-management/employee-management-system:latest --platform managed --region europe-west1 --allow-unauthenticated --port 8080 --memory 2Gi --cpu 2 --min-instances 1 --max-instances 10



echo "✅ 部署流程完成！"
echo "📋 驗證部署結果..."
gcloud run services describe employee-management-system --region=europe-west1 --format="value(status.url)"

echo "🎉 部署成功完成！"
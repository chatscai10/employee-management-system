@echo off
echo 🔧 啟用Google Cloud API服務...

echo 📋 啟用Cloud Run API...
gcloud services enable run.googleapis.com

echo 📋 啟用Cloud Build API...
gcloud services enable cloudbuild.googleapis.com

echo 📋 啟用Container Registry API...
gcloud services enable containerregistry.googleapis.com

echo 📋 啟用Artifact Registry API...
gcloud services enable artifactregistry.googleapis.com

echo 📋 啟用Cloud Logging API...
gcloud services enable logging.googleapis.com

echo 📋 啟用Cloud Monitoring API...
gcloud services enable monitoring.googleapis.com

echo ✅ API服務啟用完成！

echo 📋 驗證啟用狀態...
gcloud services list --enabled --filter="name:(run.googleapis.com OR cloudbuild.googleapis.com OR containerregistry.googleapis.com OR artifactregistry.googleapis.com)"

pause
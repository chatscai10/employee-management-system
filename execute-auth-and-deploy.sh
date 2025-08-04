#!/bin/bash

# 🚀 執行認證並立即開始部署
set -e

# 設定 Google Cloud SDK PATH
export PATH=$PATH:$(pwd)/google-cloud-sdk/bin

echo "🔐 開始 Google Cloud 認證和部署流程"
echo "=========================================="

# 新的認證代碼
AUTH_CODE="4/0AVMBsJjWs_IDb1TGVi473CymFMaDAx6Cz1vjI9qUzMkrhtpAoNc_txAQh5ZB65MprtV6PQ"

echo "正在使用新的認證代碼進行認證..."

# 嘗試認證
echo "$AUTH_CODE" | gcloud auth login --no-launch-browser

if [ $? -eq 0 ]; then
    echo "✅ Google Cloud 認證成功！"
    
    # 設定應用程式預設認證
    echo "設定應用程式預設認證..."
    gcloud auth application-default login --no-launch-browser
    
    # 檢查認證狀態
    echo "檢查認證狀態..."
    gcloud auth list
    
    # 建立專案 (如果不存在)
    PROJECT_ID="inventory-management-sys"
    echo "檢查專案 $PROJECT_ID..."
    
    if ! gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
        echo "建立新專案 $PROJECT_ID..."
        gcloud projects create $PROJECT_ID --name="庫存管理系統"
        
        if [ $? -eq 0 ]; then
            echo "✅ 專案建立成功"
        else
            echo "⚠️ 專案建立失敗，但繼續進行"
        fi
    else
        echo "✅ 專案已存在"
    fi
    
    # 設定預設專案
    gcloud config set project $PROJECT_ID
    
    echo ""
    echo "🎉 Google Cloud 認證和設定完成！"
    echo "=========================================="
    echo ""
    echo "🚀 立即開始執行完整部署..."
    echo ""
    
    # 執行完整部署
    chmod +x deploy-to-gcloud-complete.sh
    ./deploy-to-gcloud-complete.sh
    
else
    echo "❌ 認證失敗"
    echo "可能原因："
    echo "1. 認證代碼格式問題"
    echo "2. 網路連接問題"
    echo "3. Google Cloud API 問題"
    
    echo ""
    echo "請檢查認證代碼並重試"
    exit 1
fi
#!/bin/bash

# 🔐 Windows 環境 Google Cloud 認證腳本
set -e

# 設定 PATH
export PATH=$PATH:$(pwd)/google-cloud-sdk/bin

echo "🔐 開始 Google Cloud 認證流程 (Windows)"
echo "==========================================="

# 設定認證代碼
AUTH_CODE="4/0AVMBsJiC2_G661wN7uz7RMHoHXbxwvBCtrJ_2sWDUvJF7acuNWDT96Q1aNUcvLxutEEjGA"

echo "正在使用提供的認證代碼..."

# 使用 printf 避免換行問題
printf "%s" "$AUTH_CODE" | gcloud auth login --no-launch-browser

if [ $? -eq 0 ]; then
    echo "✅ Google Cloud 認證成功"
    
    # 檢查認證狀態
    echo "檢查認證狀態..."
    gcloud auth list
    
    # 列出可用專案
    echo "列出可用專案..."
    gcloud projects list
    
    # 設定預設專案 (如果存在)
    PROJECT_ID="inventory-management-sys"
    if gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
        echo "設定預設專案: $PROJECT_ID"
        gcloud config set project $PROJECT_ID
    else
        echo "⚠️ 專案 $PROJECT_ID 不存在，需要建立"
    fi
    
else
    echo "❌ 認證失敗"
    echo "可能原因："
    echo "1. 認證代碼已過期"
    echo "2. 網路連接問題"
    echo "3. 認證代碼格式錯誤"
    
    echo ""
    echo "請重新取得認證代碼："
    echo "gcloud auth login --no-launch-browser"
    exit 1
fi

echo ""
echo "🎉 Google Cloud 認證完成！"
echo "下一步：執行 ./deploy-to-gcloud-complete.sh"
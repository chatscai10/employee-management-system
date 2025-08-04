#!/bin/bash

# 🔐 完成 Google Cloud 認證
set -e

# 載入 Google Cloud SDK
source ~/google-cloud-sdk/path.bash.inc

echo "🔐 開始 Google Cloud 認證流程"
echo "================================"

# 設定認證代碼
AUTH_CODE="4/0AVMBsJiC2_G661wN7uz7RMHoHXbxwvBCtrJ_2sWDUvJF7acuNWDT96Q1aNUcvLxutEEjGA"

echo "正在使用提供的認證代碼進行認證..."

# 嘗試使用認證代碼
echo "$AUTH_CODE" | gcloud auth login --no-launch-browser

if [ $? -eq 0 ]; then
    echo "✅ Google Cloud 認證成功"
    
    # 設定應用程式預設認證
    echo "設定應用程式預設認證..."
    gcloud auth application-default login --no-launch-browser
    
    # 檢查認證狀態
    echo "檢查認證狀態..."
    gcloud auth list
    
    # 列出可用專案
    echo "列出可用專案..."
    gcloud projects list
    
else
    echo "❌ 認證失敗，請檢查認證代碼"
    exit 1
fi

echo "🎉 Google Cloud 認證完成！"
#!/bin/bash

# 🔐 互動式 Google Cloud 認證助手
set -e

# 設定環境
export PATH=$PATH:$(pwd)/google-cloud-sdk/bin

echo "🔐 Google Cloud 互動式認證助手"
echo "====================================="
echo ""
echo "由於認證代碼有時效性限制，我們將使用互動式方式完成認證"
echo ""

# 檢查 gcloud 是否可用
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud 命令不可用，請確認 Google Cloud SDK 安裝"
    exit 1
fi

echo "✅ Google Cloud SDK 可用"
gcloud --version
echo ""

echo "📋 認證步驟說明："
echo "1. 執行 gcloud auth login --no-launch-browser"
echo "2. 複製提供的 URL 到瀏覽器"
echo "3. 完成 Google 帳戶登入"
echo "4. 複製取得的認證代碼"
echo "5. 貼回終端機完成認證"
echo ""

echo "⚠️ 重要提醒："
echo "- 請確保使用有 Google Cloud 權限的帳戶"
echo "- 建議使用有計費帳戶的 Google 帳戶"
echo "- 認證過程可能需要同意多個權限"
echo ""

read -p "按 Enter 開始認證流程..." -r
echo ""

echo "🚀 開始認證..."
echo "請按照螢幕上的指示完成認證"
echo ""

# 執行認證
gcloud auth login --no-launch-browser

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 基本認證成功！"
    echo ""
    
    echo "設定應用程式預設認證..."
    gcloud auth application-default login --no-launch-browser
    
    if [ $? -eq 0 ]; then
        echo "✅ 應用程式認證成功！"
    else
        echo "⚠️ 應用程式認證失敗，但可以繼續"
    fi
    
    echo ""
    echo "檢查認證狀態..."
    gcloud auth list
    echo ""
    
    echo "檢查可用專案..."
    gcloud projects list
    echo ""
    
    # 設定或建立專案
    PROJECT_ID="inventory-management-sys"
    echo "檢查專案 $PROJECT_ID..."
    
    if gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
        echo "✅ 專案 $PROJECT_ID 已存在"
        gcloud config set project $PROJECT_ID
        echo "✅ 已設定為預設專案"
    else
        echo "⚠️ 專案 $PROJECT_ID 不存在"
        echo ""
        echo "選項："
        echo "1. 建立新專案 $PROJECT_ID"
        echo "2. 使用現有專案"
        echo ""
        read -p "請輸入選項 (1 或 2): " choice
        
        if [ "$choice" = "1" ]; then
            echo "建立新專案..."
            gcloud projects create $PROJECT_ID --name="庫存管理系統"
            
            if [ $? -eq 0 ]; then
                echo "✅ 專案建立成功"
                gcloud config set project $PROJECT_ID
                echo "✅ 已設定為預設專案"
                
                echo ""
                echo "⚠️ 重要：請記得設定計費帳戶"
                echo "前往: https://console.cloud.google.com/billing"
                echo "將計費帳戶連結到專案 $PROJECT_ID"
                echo ""
            else
                echo "❌ 專案建立失敗"
                echo "請手動在 Google Cloud Console 建立專案"
            fi
        else
            echo "請使用現有專案："
            gcloud projects list
            echo ""
            read -p "請輸入現有專案 ID: " existing_project
            gcloud config set project $existing_project
            echo "✅ 已設定專案為 $existing_project"
        fi
    fi
    
    echo ""
    echo "🎉 Google Cloud 認證和設定完成！"
    echo ""
    echo "現在可以執行部署："
    echo "./deploy-to-gcloud-complete.sh"
    echo ""
    
    read -p "是否立即開始部署？(y/n): " deploy_now
    
    if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
        echo ""
        echo "🚀 開始執行完整部署..."
        chmod +x deploy-to-gcloud-complete.sh
        ./deploy-to-gcloud-complete.sh
    else
        echo ""
        echo "📋 部署已準備就緒"
        echo "當您準備好時，請執行："
        echo "./deploy-to-gcloud-complete.sh"
    fi
    
else
    echo ""
    echo "❌ 認證失敗"
    echo ""
    echo "故障排除："
    echo "1. 檢查網路連接"
    echo "2. 確認 Google 帳戶可以訪問 Google Cloud"
    echo "3. 嘗試使用不同的瀏覽器"
    echo "4. 檢查是否有防火牆阻擋"
    echo ""
    echo "請重新執行此腳本進行認證"
    exit 1
fi
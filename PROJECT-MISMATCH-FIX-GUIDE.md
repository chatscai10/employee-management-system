# 🔧 Google Cloud 專案 ID 不匹配修復指南

## 🚨 問題診斷
- **錯誤專案 ID**: employee-management-410808
- **正確專案 ID**: adept-arbor-467807-t9
- **當前狀態**: 構建失敗，顯示佔位頁面
- **服務網址**: https://employee-management-system-213410885168.europe-west1.run.app

## 🎯 立即修復方案

### 方案 1: Cloud Shell 一鍵修復（推薦）

1. **前往 Cloud Shell**: https://shell.cloud.google.com/
2. **選擇正確專案**: adept-arbor-467807-t9
3. **執行修復腳本**:
```bash
# 下載修復腳本
curl -O https://raw.githubusercontent.com/chatscai10/employee-management-system/main/cloud-shell-fix-deploy.sh

# 執行修復
chmod +x cloud-shell-fix-deploy.sh
./cloud-shell-fix-deploy.sh
```

### 方案 2: Web Console 手動修復

1. **前往 Cloud Run**: https://console.cloud.google.com/run
2. **切換到正確專案**: adept-arbor-467807-t9
3. **刪除現有服務** (如果存在問題)
4. **重新創建服務**:
   - 服務名稱: employee-management-system
   - 地區: europe-west1
   - 來源: GitHub repository
   - 儲存庫: chatscai10/employee-management-system
   - 分支: main

### 方案 3: 直接修復現有服務

1. **前往現有服務**: https://console.cloud.google.com/run/detail/europe-west1/employee-management-system
2. **點擊「編輯並部署新修訂版本」**
3. **容器** 標籤頁中:
   - 容器映像 URL: 選擇「從原始碼持續部署」
   - 儲存庫: chatscai10/employee-management-system
   - 分支: main
4. **變數和密鑰** 標籤頁中:
   - NODE_ENV: production
   - PORT: 8080
5. **點擊「部署」**

## 🔍 驗證修復結果

修復完成後，測試以下端點：
- `https://employee-management-system-213410885168.europe-west1.run.app/api/health` - 應該返回健康狀態
- `https://employee-management-system-213410885168.europe-west1.run.app/` - 應該顯示企業管理系統主頁
- `https://employee-management-system-213410885168.europe-west1.run.app/api/login` - 應該顯示登入頁面

## 🎉 預期結果

修復成功後，您將看到：
- ✅ 完整的企業管理系統介面
- ✅ 測試帳號: test/123456, demo/demo, admin/admin123
- ✅ 產品管理和庫存管理功能
- ✅ 所有 API 端點正常運作
- ✅ Google Cloud 企業級穩定性

## 📞 如需協助

如果修復過程中遇到問題：
1. 檢查專案 ID 是否切換正確
2. 確認 GitHub 儲存庫連接正常
3. 查看 Cloud Build 詳細日誌
4. 檢查服務權限設定

**專案 ID 修復是關鍵步驟，完成後系統將立即正常運作！**
# ✅ Google Cloud快速修復檢查清單

## 🎯 立即執行 (5分鐘修復)

### 📋 檢查清單:

- [ ] **1. 開啟Google Cloud Console**
  - 訪問: https://console.cloud.google.com/
  - 登入正確帳戶
  - 選擇項目: 213410885168

- [ ] **2. 導航到Cloud Run**
  - 點擊左側菜單 → Cloud Run
  - 或直接訪問: https://console.cloud.google.com/run?project=213410885168

- [ ] **3. 選擇服務**
  - 找到服務: employee-management-system
  - 點擊服務名稱

- [ ] **4. 設定IAM權限**
  - 點擊 "權限" 標籤
  - 點擊 "+ 新增主體"
  - 輸入: allUsers
  - 選擇角色: Cloud Run Invoker
  - 點擊 "儲存"

- [ ] **5. 啟用未驗證訪問**
  - 點擊 "編輯和部署新修訂版本"
  - 勾選 "允許未經驗證的叫用"
  - 點擊 "部署"

- [ ] **6. 等待並驗證**
  - 等待2-3分鐘
  - 訪問: https://employee-management-system-213410885168.europe-west1.run.app
  - 確認返回200 OK

## 🔍 驗證步驟:

- [ ] **首頁測試**: https://employee-management-system-213410885168.europe-west1.run.app → 應該正常載入
- [ ] **登入測試**: https://employee-management-system-213410885168.europe-west1.run.app/login → 應該顯示登入表單
- [ ] **API測試**: https://employee-management-system-213410885168.europe-west1.run.app/api/system/status → 應該返回JSON
- [ ] **管理員登入**: 使用 admin/admin123 → 應該成功登入

## ⚠️ 如果失敗:

- [ ] **清除瀏覽器緩存**: Ctrl+Shift+Delete
- [ ] **檢查項目權限**: 確保有Owner/Editor權限
- [ ] **重新部署服務**: 觸發新的修訂版本
- [ ] **查看服務日誌**: 檢查詳細錯誤信息

---
**完成時間**: _______________  
**修復狀態**: ⬜ 成功 ⬜ 需要協助  
**最終URL測試**: https://employee-management-system-213410885168.europe-west1.run.app
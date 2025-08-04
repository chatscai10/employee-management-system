# 🚀 Cloud Run 部署立即設定指南

## 📋 **立即執行步驟**

### 🎯 **步驟1: 進入Cloud Run控制台**
1. 開启 [Google Cloud Console](https://console.cloud.google.com/run)
2. 選擇正確的專案: `My First Project`
3. 點擊「建立服務」

### ⚙️ **步驟2: 關鍵設定 (必須正確)**

#### 🔗 **來源設定**
- **來源類型**: ✅ **從存放區持續部署**
- **存放區提供者**: ✅ **GitHub**  
- **存放區**: ✅ `chatscai10/employee-management-system`
- **分支**: ✅ `^main$`
- **建構類型**: ✅ **Dockerfile**

#### 🌏 **服務設定**
- **服務名稱**: ✅ `employee-management-system`
- **地區**: ⚠️ **asia-east1 (台灣)**
- **CPU配置**: ✅ **一律配置CPU**
- **允許未驗證的叫用**: ✅ **勾選**

#### 🔧 **容器設定**
- **容器埠**: ✅ `8080`
- **記憶體**: ✅ `2 GiB`
- **CPU**: ✅ `2`
- **要求逾時**: ✅ `300 秒`
- **並行處理**: ✅ `80`

#### ⚡ **自動調整資源**
- **最小執行個體數**: ✅ `1`
- **最大執行個體數**: ✅ `10`

### 🚨 **關鍵檢查點**

#### ✅ **必須確認的設定**
1. **地區 = asia-east1** (不是 us-central1)
2. **服務名稱 = employee-management-system** (與現有一致)
3. **GitHub 存放區已連接**
4. **Dockerfile 建構類型已選擇**
5. **允許未驗證的叫用已勾選**

### 🎯 **預期結果**

部署完成後將獲得：
- **新的服務URL**: `https://employee-management-system-213410885168.asia-east1.run.app`
- **API端點恢復**: 5/5 全部正常
- **系統評分**: 從 42.9/100 提升到 90+/100

### 📊 **部署後驗證端點**

立即測試這些關鍵端點：
```
✅ https://employee-management-system-213410885168.asia-east1.run.app/api/health
✅ https://employee-management-system-213410885168.asia-east1.run.app/api
✅ https://employee-management-system-213410885168.asia-east1.run.app/api/products
✅ https://employee-management-system-213410885168.asia-east1.run.app/api/inventory
✅ https://employee-management-system-213410885168.asia-east1.run.app/api/login
```

### ⏱️ **預計部署時間**
- **建構時間**: 3-5 分鐘
- **部署時間**: 1-2 分鐘
- **總時間**: 約 5-7 分鐘

---

## 🚀 **現在立即開始部署！**

**下一步**: 點擊「建立」按鈕開始部署過程
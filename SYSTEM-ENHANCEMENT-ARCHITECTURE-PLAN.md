# 🏗️ 企業管理系統功能增強架構計畫

## 📋 **執行概述**
**時間**: 2025-08-02 19:00  
**狀態**: 架構規劃階段  
**目標**: 實現用戶要求的完整系統增強功能  

---

## 🎯 **核心增強需求回顧**

### **P1 優先級 - 立即實現**
1. **營收系統改進** 🔴
   - 收入項目：直接顯示預設全部項目
   - 支出項目：保留現在自己新增方式
   - 新增：選擇分店選單

2. **叫貨頁面優化** 🔴
   - 新增：分店選項選單
   - 新增：品項詳細資料顯示
   - 新增：送貨日期選擇
   - 新增：總金額計算

### **P2 優先級 - 核心功能**
3. **分類篩選功能** 🟡
   - 叫貨頁面：分類篩選機制
   - 異常分析：3天未叫貨警告
   - 異常分析：詳細問題分析

4. **排班系統複雜規則** 🟡
   - 週末定義：週五、週六、週日
   - 月排班限制：最多8天
   - 請假規則：最多連續3天

### **P3 優先級 - 進階功能**
5. **照片上傳增強** 🟢
   - 照片分類：工作照、問題照、其他
   - 照片管理：查看、編輯、刪除

6. **作廢功能完善** 🟢
   - 12小時內可作廢/編輯
   - 超過時間僅老闆可操作
   - 詳細作廢記錄追蹤

---

## 🏗️ **系統架構增強設計**

### **1. 數據庫結構擴展**

#### **新增表結構**
```javascript
// 擴展現有數據庫結構
const enhancedDatabaseStructure = {
    // 現有表結構保持不變
    
    // 新增：營收項目預設表
    revenueCategories: [
        {
            id: 'rev001',
            categoryName: '現金銷售',
            categoryType: 'income',
            isDefault: true,
            storeId: 'all', // all表示所有分店適用
            displayOrder: 1,
            isActive: true
        }
    ],
    
    // 新增：叫貨品項詳細表  
    orderItemDetails: [
        {
            id: 'item001',
            itemName: '雞胸肉',
            supplier: '聯華食品',
            category: '肉類',
            unit: '份',
            standardPrice: 15,
            description: '新鮮雞胸肉，適合製作雞排',
            allergenInfo: '無',
            storageRequirement: '冷藏',
            isActive: true
        }
    ],
    
    // 新增：排班規則配置表
    schedulingRules: {
        weekendDefinition: ['friday', 'saturday', 'sunday'],
        monthlyShiftLimit: 8,
        maxConsecutiveLeave: 3,
        minStaffPerShift: 2,
        shiftTypes: [
            { id: 'morning', name: '早班', startTime: '09:00', endTime: '17:00' },
            { id: 'evening', name: '晚班', startTime: '17:00', endTime: '01:00' }
        ]
    },
    
    // 新增：照片管理表
    photoManagement: [
        {
            id: 'photo001',
            uploadTime: '2025-08-02T19:00:00Z',
            employeeId: 'emp001',
            storeId: 'store001',
            photoCategory: 'work', // work, problem, other
            photoPath: '/uploads/photos/2025/08/photo001.jpg',
            description: '工作照片',
            relatedRecordType: 'attendance', // attendance, maintenance, order
            relatedRecordId: 'att001',
            isActive: true,
            canEdit: true,
            editDeadline: '2025-08-03T07:00:00Z' // 12小時後
        }
    ],
    
    // 新增：作廢記錄表
    voidRecords: [
        {
            id: 'void001',
            voidTime: '2025-08-02T19:00:00Z',
            employeeId: 'emp001',
            operatorId: 'emp001', // 執行作廢的人
            recordType: 'attendance',
            recordId: 'att001',
            voidReason: '打卡錯誤需要重新操作',
            isApproved: false,
            approvedBy: null,
            approvedTime: null
        }
    ]
};
```

### **2. API端點架構擴展**

#### **營收系統增強API**
```javascript
// 營收相關新端點
GET    /api/revenue/categories/:storeId     // 獲取分店營收類別
POST   /api/revenue/record                  // 提交營收記錄（含分店選擇）
PUT    /api/revenue/categories              // 更新營收類別設定

// 叫貨系統增強API  
GET    /api/orders/items/details            // 獲取品項詳細資料
GET    /api/orders/categories               // 獲取叫貨分類
POST   /api/orders/calculate-total          // 計算叫貨總金額
GET    /api/orders/anomaly-analysis         // 異常分析報告

// 排班系統新API
GET    /api/scheduling/rules                // 獲取排班規則
POST   /api/scheduling/validate             // 驗證排班衝突
GET    /api/scheduling/weekend-count        // 計算週末排班數量
POST   /api/scheduling/request-leave        // 請假申請

// 照片管理API
POST   /api/photos/upload                   // 照片上傳
GET    /api/photos/list/:recordId           // 獲取相關照片
PUT    /api/photos/edit/:photoId            // 編輯照片資訊
DELETE /api/photos/delete/:photoId          // 刪除照片

// 作廢功能API
POST   /api/void/request                    // 申請作廢
GET    /api/void/check-eligibility          // 檢查作廢資格
POST   /api/void/approve                    // 批准作廢（老闆）
GET    /api/void/records                    // 作廢記錄列表
```

### **3. 前端界面架構規劃**

#### **營收系統界面增強**
```html
<!-- 營收記錄界面增強 -->
<div class="revenue-recording-enhanced">
    <!-- 分店選擇 -->
    <select id="storeSelector" class="store-selector">
        <option value="">選擇分店...</option>
        <!-- 動態載入分店選項 -->
    </select>
    
    <!-- 預設收入項目 -->
    <div class="income-categories">
        <h3>收入項目（預設項目）</h3>
        <div id="defaultIncomeItems">
            <!-- 動態載入預設收入項目 -->
        </div>
    </div>
    
    <!-- 自訂支出項目 -->
    <div class="expense-categories">
        <h3>支出項目（自訂新增）</h3>
        <div id="customExpenseItems">
            <!-- 保持現有自訂新增方式 -->
        </div>
        <button class="add-custom-expense">+ 新增支出項目</button>
    </div>
</div>
```

#### **叫貨系統界面增強**
```html
<!-- 叫貨系統界面增強 -->
<div class="ordering-system-enhanced">
    <!-- 分店和日期選擇 -->
    <div class="order-header">
        <select id="orderStoreSelector">
            <option value="">選擇分店...</option>
        </select>
        <input type="date" id="deliveryDate" class="delivery-date">
    </div>
    
    <!-- 品項分類篩選 -->
    <div class="category-filter">
        <button class="filter-btn active" data-category="all">全部</button>
        <button class="filter-btn" data-category="meat">肉類</button>
        <button class="filter-btn" data-category="vegetable">蔬菜</button>
        <button class="filter-btn" data-category="seasoning">調料</button>
    </div>
    
    <!-- 品項詳細資料顯示 -->
    <div class="item-details-view">
        <div class="item-card" data-category="meat">
            <img src="item-image.jpg" alt="品項圖片">
            <div class="item-info">
                <h4>雞胸肉</h4>
                <p class="supplier">供應商：聯華食品</p>
                <p class="price">單價：$15/份</p>
                <p class="description">新鮮雞胸肉，適合製作雞排</p>
                <div class="quantity-selector">
                    <button class="qty-btn minus">-</button>
                    <input type="number" class="quantity" value="0" min="0">
                    <button class="qty-btn plus">+</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- 總金額計算 -->
    <div class="order-summary">
        <div class="total-amount">
            <h3>總金額：$<span id="totalAmount">0</span></h3>
        </div>
        <button class="submit-order">確認叫貨</button>
    </div>
    
    <!-- 異常分析顯示 -->
    <div class="anomaly-analysis">
        <h4>🔍 異常分析</h4>
        <div id="anomalyResults">
            <!-- 動態顯示異常分析結果 -->
        </div>
    </div>
</div>
```

### **4. 智能分析系統架構**

#### **異常檢測引擎**
```javascript
class AnomalyDetectionEngine {
    // 檢測3天未叫貨品項
    detectUnorderedItems(storeId, days = 3) {
        // 分析邏輯
    }
    
    // 檢測頻繁叫貨異常
    detectFrequentOrdering(storeId, days = 2) {
        // 檢測2天內多次叫貨同一品項
    }
    
    // 檢測數量異常
    detectQuantityAnomalies(orderData) {
        // 檢測異常數量變化
    }
    
    // 生成異常報告
    generateAnomalyReport(storeId) {
        const report = {
            unorderedItems: this.detectUnorderedItems(storeId),
            frequentOrders: this.detectFrequentOrdering(storeId),
            quantityAnomalies: this.detectQuantityAnomalies(storeId),
            timestamp: new Date().toISOString()
        };
        return report;
    }
}
```

### **5. 排班系統複雜邏輯架構**

#### **排班規則引擎**
```javascript
class SchedulingRulesEngine {
    // 週末定義檢查
    isWeekend(date) {
        const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        return [5, 6, 0].includes(dayOfWeek); // Friday(5), Saturday(6), Sunday(0)
    }
    
    // 月排班次數檢查
    checkMonthlyShiftLimit(employeeId, month, year) {
        // 檢查當月排班是否超過8天
    }
    
    // 連續請假檢查
    checkConsecutiveLeave(employeeId, startDate, endDate) {
        // 檢查是否超過3天連續請假
    }
    
    // 排班衝突檢測
    detectSchedulingConflicts(scheduleData) {
        // 檢測各種衝突情況
    }
    
    // 智能排班建議
    generateSchedulingSuggestions(storeId, month, year) {
        // 基於規則生成排班建議
    }
}
```

---

## 🚀 **實現優先順序規劃**

### **第一階段 (立即實現)**
1. **營收系統分店選擇** - 2小時
2. **預設收入項目顯示** - 1小時  
3. **叫貨系統分店選擇** - 1小時
4. **品項詳細資料顯示** - 2小時

### **第二階段 (本週完成)**
5. **分類篩選功能** - 3小時
6. **異常分析系統** - 4小時
7. **總金額計算** - 1小時
8. **送貨日期選擇** - 1小時

### **第三階段 (下週完成)**
9. **排班複雜規則** - 6小時
10. **照片管理增強** - 4小時
11. **作廢功能完善** - 3小時
12. **全面測試驗證** - 4小時

---

## 📊 **技術實現要點**

### **關鍵技術挑戰**
1. **複雜業務邏輯** - 排班規則引擎
2. **數據一致性** - 多表關聯操作
3. **性能優化** - 大量品項載入
4. **用戶體驗** - 響應式界面

### **解決方案**
1. **模組化設計** - 獨立的業務邏輯模組
2. **數據快取** - Redis快取常用數據
3. **分頁載入** - 品項分批載入
4. **漸進增強** - 基礎功能優先

---

## 🎯 **成功標準**

### **功能完整性**
- ✅ 所有P1功能100%實現
- ✅ 所有P2功能90%實現  
- ✅ 所有P3功能80%實現

### **性能指標**
- ✅ 頁面載入時間 < 3秒
- ✅ API響應時間 < 500ms
- ✅ 異常分析計算 < 2秒

### **用戶體驗**
- ✅ 界面操作直觀流暢
- ✅ 手機端完美適配
- ✅ 錯誤提示友善明確

---

**架構規劃完成時間**: 2025-08-02 19:15  
**下一步**: 開始實現第一階段功能  
**預期完成時間**: 2025-08-04  

🚀 **架構規劃完成，準備開始實際功能實現！**
# 🏢 企業員工管理系統 - 完整分析規劃報告

## 📋 **系統概述**

基於您的詳細需求，本系統需要開發一個以**手機端操作為首要目標**的企業員工管理系統，包含：
- 管理員後台系統
- 員工前端系統  
- 完整的數據管理和通知系統
- 真實的照片上傳和GPS定位功能

---

## 🏗️ **系統架構設計**

### 1. **總體架構**
```
📱 前端系統 (手機優先)
├── 🔐 登入/註冊頁面
├── 👨‍💼 管理員後台
└── 👷‍♂️ 員工前端頁面

🖥️ 後端系統
├── 🗄️ 數據庫管理
├── 📡 RESTful API
├── 📸 檔案上傳處理
├── 🤖 Telegram Bot 通知
└── ⚙️ 系統參數管理
```

### 2. **開發優先順序**
1. ✅ **管理員頁面** (系統參數設定、員工管理)
2. ✅ **登入+註冊頁面** (身份驗證系統)  
3. ✅ **員工前端頁面** (各功能模組)
4. ✅ **完整測試驗證** (真實操作測試)

---

## 🗄️ **數據庫結構設計**

### **核心數據表**

#### 1. **員工表 (employees)**
```sql
{
  employeeId: String,      // 員工編號 (EMP001)
  name: String,            // 姓名
  idNumber: String,        // 身分證號
  birthDate: Date,         // 出生日期
  gender: String,          // 性別
  license: String,         // 駕照類型
  phone: String,           // 聯絡電話
  address: String,         // 地址
  emergencyContact: String, // 緊急聯絡人
  relationship: String,    // 關係
  emergencyPhone: String,  // 緊急聯絡人電話
  startDate: Date,         // 到職日
  store: String,           // 所屬分店
  position: String,        // 職位
  lineUserId: String,      // LINE ID (自動綁定)
  status: String,          // 狀態 (審核中/在職/離職)
  isActive: Boolean,       // 是否啟用
  registrationDate: Date,  // 註冊日期
  deviceFingerprint: String // 設備指紋
}
```

#### 2. **分店設定表 (stores)**
```sql
{
  storeId: String,         // 分店ID
  name: String,            // 店名
  people: Number,          // 每日最少職班人數
  open: String,            // 營業時間 (1500-0200)
  latitude: Number,        // 緯度
  longitude: Number,       // 經度
  radius: Number,          // 允許打卡範圍(公尺)
  address: String,         // 地址
  isActive: Boolean        // 是否啟用
}
```

#### 3. **考勤記錄表 (attendance)**
```sql
{
  recordId: String,        // 記錄ID
  employeeId: String,      // 員工ID
  employeeName: String,    // 員工姓名
  storeId: String,         // 分店ID
  storeName: String,       // 分店名稱
  type: String,            // 類型 (clock-in/clock-out)
  timestamp: Date,         // 打卡時間
  latitude: Number,        // 打卡位置緯度
  longitude: Number,       // 打卡位置經度
  distance: Number,        // 距離分店距離(公尺)
  deviceInfo: String,      // 設備資訊
  deviceFingerprint: String, // 設備指紋
  isLate: Boolean,         // 是否遲到
  lateMinutes: Number,     // 遲到分鐘數
  date: String             // 日期 (YYYY-MM-DD)
}
```

#### 4. **營收記錄表 (revenue)**
```sql
{
  recordId: String,        // 記錄ID
  employeeId: String,      // 記錄員工ID
  employeeName: String,    // 員工姓名
  storeId: String,         // 分店ID
  storeName: String,       // 分店名稱
  date: Date,              // 營收日期
  bonusType: String,       // 獎金類別 (平日獎金/假日獎金)
  orderCount: Number,      // 訂單數量
  incomeItems: [{          // 收入項目
    category: String,      // 類別 (現場/熊貓/UBER)
    amount: Number,        // 金額
    serviceFee: Number     // 服務費比例
  }],
  expenseItems: [{         // 支出項目
    category: String,      // 支出類別
    amount: Number,        // 金額
    description: String    // 說明
  }],
  photos: [{               // 照片上傳
    photoId: String,       // 照片ID
    category: String,      // 照片類別
    filename: String,      // 檔案名稱
    uploadTime: Date       // 上傳時間
  }],
  totalIncome: Number,     // 總收入
  totalExpense: Number,    // 總支出
  bonusAmount: Number,     // 獎金金額
  notes: String,           // 備註
  timestamp: Date          // 記錄時間
}
```

#### 5. **叫貨記錄表 (ordering)**
```sql
{
  orderId: String,         // 訂單ID
  employeeId: String,      // 叫貨員工ID
  employeeName: String,    // 員工姓名
  storeId: String,         // 分店ID
  storeName: String,       // 分店名稱
  deliveryDate: Date,      // 送貨日期
  items: [{                // 叫貨品項
    supplier: String,      // 廠商
    brand: String,         // 品牌
    product: String,       // 品項
    quantity: Number,      // 數量
    unit: String,          // 單位
    unitPrice: Number,     // 單價
    totalPrice: Number     // 小計
  }],
  totalAmount: Number,     // 總金額
  status: String,          // 狀態 (待確認/已確認/已送達)
  notes: String,           // 備註
  timestamp: Date          // 下單時間
}
```

#### 6. **維修申請表 (maintenance)**
```sql
{
  requestId: String,       // 申請ID
  employeeId: String,      // 申請員工ID
  employeeName: String,    // 員工姓名
  storeId: String,         // 分店ID
  storeName: String,       // 分店名稱
  equipment: String,       // 設備名稱
  issueType: String,       // 問題類型 (維修/保養)
  description: String,     // 問題描述
  photos: [{               // 設備照片
    photoId: String,       // 照片ID
    filename: String,      // 檔案名稱
    uploadTime: Date       // 上傳時間
  }],
  priority: String,        // 優先級 (緊急/一般/低)
  status: String,          // 狀態 (待處理/處理中/已完成)
  assignedTo: String,      // 指派給
  completedDate: Date,     // 完成日期
  solution: String,        // 解決方案
  timestamp: Date          // 申請時間
}
```

#### 7. **排班系統表 (scheduling)**
```sql
{
  scheduleId: String,      // 排班ID
  month: String,           // 排班月份 (YYYY-MM)
  employeeId: String,      // 員工ID
  employeeName: String,    // 員工姓名
  storeId: String,         // 所屬分店
  vacationDates: [Date],   // 休假日期陣列
  workDates: [Date],       // 工作日期陣列
  totalVacationDays: Number, // 總休假天數
  weekendVacationDays: Number, // 週末休假天數
  status: String,          // 狀態 (草稿/已提交/已確認)
  submittedAt: Date,       // 提交時間
  startTime: Date,         // 開始排班時間
  endTime: Date            // 結束排班時間
}
```

#### 8. **投票系統表 (voting)**
```sql
{
  voteId: String,          // 投票ID
  candidateId: String,     // 候選人ID
  candidateName: String,   // 候選人姓名
  currentPosition: String, // 目前職位
  targetPosition: String,  // 目標職位
  startDate: Date,         // 投票開始時間
  endDate: Date,           // 投票結束時間
  description: String,     // 投票說明
  status: String,          // 狀態 (進行中/已結束/已通過/未通過)
  votes: [{                // 投票記錄
    voterId: String,       // 投票者ID
    voterName: String,     // 投票者姓名
    decision: String,      // 決定 (同意/不同意)
    reason: String,        // 投票理由
    timestamp: Date        // 投票時間
  }],
  requiredApprovalRate: Number, // 需要的同意比例
  currentApprovalRate: Number,  // 目前同意比例
  totalVoters: Number,     // 總投票人數
  agreedVotes: Number,     // 同意票數
  disagreedVotes: Number   // 不同意票數
}
```

#### 9. **系統參數表 (system_settings)**
```sql
{
  settingId: String,       // 設定ID
  category: String,        // 分類 (schedule/voting/revenue/etc)
  key: String,             // 參數鍵
  value: JSON,             // 參數值 (支援複雜JSON結構)
  description: String,     // 說明
  lastModified: Date,      // 最後修改時間
  modifiedBy: String       // 修改者
}
```

#### 10. **通知記錄表 (notifications)**
```sql
{
  notificationId: String,  // 通知ID
  type: String,            // 通知類型 (attendance/revenue/ordering/etc)
  recipients: [String],    // 接收者 (boss/employees)
  content: String,         // 通知內容
  telegramMessageId: String, // Telegram訊息ID
  sentAt: Date,            // 發送時間
  status: String           // 狀態 (sent/failed)
}
```

---

## 🎯 **核心功能模組設計**

### **1. 管理員系統功能**

#### A. **系統參數設定**
- 📍 **分店設定管理**
- ⚙️ **排班系統參數**
- 🗳️ **投票階級參數**
- 💰 **營收獎金公式設定**
- 🛒 **叫貨品項清單管理**
- 🔧 **作廢功能開關設定**

#### B. **員工管理**
- 👥 **員工名單查看/編輯**
- ✅ **員工狀態審核**
- 📊 **員工資料統計**
- 🎂 **生日提醒管理**

#### C. **數據分析**
- 📈 **營收統計分析**
- 📊 **考勤統計報表**
- 🛒 **進貨異常分析**
- 🔧 **維修統計報表**

### **2. 員工系統功能**

#### A. **考勤打卡**
- 📍 **GPS自動定位打卡**
- ⏰ **上下班時間記錄**
- 📊 **個人考勤統計**

#### B. **營收管理**
- 💰 **每日營收記錄**
- 📸 **收據照片上傳**
- 🏆 **獎金計算顯示**

#### C. **叫貨系統**
- 🛒 **品項選擇下單**
- 📦 **叫貨記錄查詢**
- 💰 **費用統計**

#### D. **維修申請**
- 🔧 **設備問題回報**
- 📸 **問題照片上傳**
- 📋 **申請狀態追蹤**

#### E. **排班系統**
- 📅 **月曆式排班介面**
- 🏖️ **休假申請**
- ⏰ **時段限制驗證**

#### F. **升遷投票**
- 🗳️ **投票發起/參與**
- 📊 **投票結果查看**
- 📋 **投票記錄追蹤**

---

## 📱 **手機端UI/UX設計原則**

### **設計標準**
- 🎯 **手機優先響應式設計**
- 📐 **適配所有手機螢幕比例**
- 🎨 **簡潔質感統一風格**
- 👆 **大按鈕易點擊操作**
- 🔄 **按鈕狀態即時反饋**

### **操作體驗**
- ⏳ **按鈕點擊鎖定機制**
- 💬 **狀態文字即時更新**
- 📸 **直覺式照片上傳**
- 📍 **自動GPS定位**
- 💡 **清晰的操作提示**

---

## 🤖 **Telegram通知系統**

### **通知對象**
- 👨‍💼 **老闆群組**: `-1002658082392`
- 👷‍♂️ **員工群組**: `-1002658082392`
- 🤖 **Bot Token**: `7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc`

### **通知類型與模板**

#### **1. 考勤通知**
```
👋 測試員工 來內壢店上班了~

📍 打卡詳情:
⏰ 時間: 2025/08/02 09:06
📍 座標: 25.0114095, 121.4618415  
📏 距離: 50公尺
📱 設備: Chrome/Windows
✅ 狀態: 上班打卡
⚠️ 遲到: 遲到6分鐘,本月累計共10分鐘
```

#### **2. 營收通知**
```
💰 營收記錄
👤 記錄人員: 測試員工
📅 日期: 2025/08/02
🏪 分店: 內壢忠孝店
🎁 獎金類別: 平日獎金
💎 今日獎金: $1,200
```

#### **3. 叫貨通知**
```
🛒 叫貨記錄
👤 叫貨人員: 測試員工
📅 送貨日期: 2025/08/02
🏪 分店: 內壢忠孝店
💰 總金額: $12,000

🏭 聯華食品
  • 飛飛 雞胸肉 10 份
  • 跳跳 薯條 5 包

⚠️ 異常分析:
品項 雞排 已經3天沒有叫貨
上次叫貨7/30-雞排3包
```

---

## 🛠️ **技術實現架構**

### **後端技術棧**
- 🟢 **Node.js + Express.js**
- 🗄️ **JSON檔案數據庫** (可升級至MongoDB)
- 📤 **Multer檔案上傳**
- 🤖 **node-telegram-bot-api**
- 🔒 **CORS跨域處理**

### **前端技術棧**
- 📱 **原生HTML5 + CSS3 + JavaScript**
- 📐 **CSS Grid + Flexbox響應式**
- 📍 **Geolocation API**
- 📸 **FileReader API照片上傳**
- 🎨 **Font Awesome圖標**

### **部署方案**
- ☁️ **Vercel/Netlify免費部署**
- 🐳 **Docker容器化**
- 🌐 **自動HTTPS**
- 📊 **即時監控**

---

## 📊 **開發階段規劃**

### **階段1: 管理員系統** (優先)
1. 🏗️ 系統參數設定頁面
2. 👥 員工管理頁面  
3. 📊 數據分析儀表板
4. 🤖 通知系統整合

### **階段2: 登入註冊系統**
1. 🔐 身份驗證API
2. 📝 註冊表單升級
3. 🔒 權限控制機制

### **階段3: 員工前端系統**
1. 📱 考勤打卡模組
2. 💰 營收記錄模組
3. 🛒 叫貨系統模組
4. 🔧 維修申請模組
5. 📅 排班系統模組
6. 🗳️ 投票系統模組

### **階段4: 測試與優化**
1. 🧪 完整功能測試
2. 📱 多設備兼容測試
3. 🚀 性能優化
4. 🛡️ 安全性檢查

---

## ✅ **驗證標準**

### **功能完整性**
- ✅ 所有API端點正常運作
- ✅ 數據CRUD操作無誤
- ✅ 照片上傳功能穩定
- ✅ GPS定位準確
- ✅ 通知發送成功

### **用戶體驗**
- ✅ 手機端操作流暢
- ✅ 按鈕反饋即時
- ✅ 錯誤提示清晰
- ✅ 載入速度快速

### **數據安全**
- ✅ 身份驗證機制
- ✅ 權限控制嚴格
- ✅ 數據備份完整
- ✅ 操作記錄詳細

---

## 🎯 **核心目標**

1. **📱 手機端完美體驗** - 所有功能都以手機操作為首要設計目標
2. **🎨 質感統一設計** - 簡潔但有質感的視覺風格
3. **⚡ 穩定高效運行** - 確保所有功能穩定運行，數據準確
4. **🤖 智能通知系統** - 完整的Telegram通知機制
5. **🔒 完整權限控制** - 管理員和員工的功能權限明確分離

---

**📅 預計完成時間**: 完整開發週期
**🚀 部署目標**: 生產環境就緒
**📊 測試標準**: 100%功能驗證通過

此分析報告將作為後續開發的完整藍圖，確保每個功能都符合實際業務需求並能穩定運行。
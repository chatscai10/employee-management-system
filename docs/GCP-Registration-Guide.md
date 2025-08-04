# Google Cloud Platform 註冊與部署完整教學指南

## 📋 目錄
1. [前言](#前言)
2. [GCP 帳號註冊](#gcp-帳號註冊)
3. [專案建立與設定](#專案建立與設定)
4. [服務啟用與設定](#服務啟用與設定)
5. [Telegram Bot 設定](#telegram-bot-設定)
6. [Google Apps Script 設定](#google-apps-script-設定)
7. [Cloud Run 部署](#cloud-run-部署)
8. [域名與憑證設定](#域名與憑證設定)
9. [監控與日誌](#監控與日誌)
10. [費用估算與控制](#費用估算與控制)
11. [常見問題解決](#常見問題解決)

---

## 前言

本指南將詳細說明如何從零開始註冊 Google Cloud Platform (GCP) 帳號，並完整部署企業員工管理系統到 Cloud Run。

### 🎯 部署目標
- **前端**: 靜態網頁託管在 Cloud Run
- **後端**: Google Apps Script 處理業務邏輯
- **數據庫**: Google Sheets 作為數據存儲
- **通知**: Telegram Bot 發送通知
- **監控**: Cloud Monitoring 監控系統狀態

### 💰 費用預估
- **新用戶**: 免費 $300 美元額度
- **月費用**: 預估 $5-20 美元 (取決於使用量)
- **免費額度**: Cloud Run 前 200 萬請求免費

---

## GCP 帳號註冊

### 步驟 1: 訪問 Google Cloud Platform

1. 前往 [Google Cloud Platform](https://cloud.google.com/)
2. 點擊右上角 **"Get started for free"** 或 **"免費開始使用"**

### 步驟 2: Google 帳號登入

1. 使用現有 Google 帳號登入，或創建新帳號
2. **建議**: 使用企業或專用 Google 帳號

### 步驟 3: 帳號驗證與付款設定

```markdown
📝 所需資訊:
- 信用卡或金融卡 (驗證身份用，不會立即扣款)
- 手機號碼 (SMS 驗證)
- 公司或個人地址
- 稅務資訊 (如需要)
```

1. **國家/地區選擇**: 選擇 Taiwan
2. **帳戶類型**: 
   - 個人使用: 選擇 "Individual"
   - 企業使用: 選擇 "Business"
3. **付款方式**: 輸入信用卡資訊 (僅用於身份驗證)
4. **條款接受**: 閱讀並同意服務條款

### 步驟 4: 免費額度確認

✅ **免費獲得**:
- $300 美元免費額度 (90 天內使用)
- 永久免費層級服務
- 無自動扣款 (額度用完會停止服務)

---

## 專案建立與設定

### 步驟 1: 建立新專案

1. 登入 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊頂部項目選擇器
3. 點擊 **"NEW PROJECT"** 或 **"新建專案"**

### 步驟 2: 專案資訊填寫

```markdown
📝 專案設定:
- Project name: employee-management-system
- Project ID: employee-mgmt-[隨機字符] (系統生成，記錄此ID)
- Organization: 選擇合適的組織 (可選)
- Location: 選擇適當的資料夾 (可選)
```

### 步驟 3: 帳單帳戶連結

1. 前往 **"Billing"** (帳單)
2. 連結您的帳單帳戶到新專案
3. 確認免費額度狀態

### 步驟 4: 項目 ID 記錄

⚠️ **重要**: 記錄您的項目 ID，稍後部署時需要使用

```bash
# 您的專案資訊 (請填寫實際值)
PROJECT_ID=your-project-id-here
PROJECT_NAME=employee-management-system
REGION=asia-east1
```

---

## 服務啟用與設定

### 步驟 1: 啟用必要的 API

在 [API Library](https://console.cloud.google.com/apis/library) 中搜尋並啟用以下服務:

```markdown
🔧 必要 API 服務:
✓ Cloud Run API
✓ Cloud Build API  
✓ Container Registry API
✓ Cloud Resource Manager API
✓ Cloud Logging API
✓ Cloud Monitoring API
✓ Apps Script API
```

### 步驟 2: Cloud Shell 啟用

1. 點擊 Console 右上角的 Cloud Shell 圖標 `>_`
2. 等待 Cloud Shell 環境初始化
3. 測試環境:

```bash
# 檢查 gcloud 版本
gcloud version

# 設定預設專案
gcloud config set project YOUR_PROJECT_ID

# 確認當前專案
gcloud config get-value project
```

### 步驟 3: 權限設定

1. 前往 **IAM & Admin** > **IAM**
2. 確認您的帳號具有以下角色:
   - **Project Owner** (項目擁有者)
   - **Cloud Run Admin** (Cloud Run 管理員)
   - **Cloud Build Editor** (Cloud Build 編輯者)

---

## Telegram Bot 設定

### 步驟 1: 創建 Telegram Bot

1. 在 Telegram 中搜尋 `@BotFather`
2. 發送 `/newbot` 命令
3. 按照指示設定 Bot 名稱和用戶名

```markdown
📝 Bot 設定範例:
- Bot Name: 企業員工管理系統
- Username: employee_mgmt_bot
```

### 步驟 2: 獲取 Bot Token

```bash
# BotFather 會提供類似以下的 Token
BOT_TOKEN=1234567890:ABCDefGhIJklmnOPQRSTuvwxyz
```

⚠️ **重要**: 請妥善保管此 Token，不要洩露給他人

### 步驟 3: 創建通知群組

1. **創建老闆群組**:
   - 創建新群組
   - 將 Bot 添加為管理員
   - 發送訊息獲取群組 ID

2. **創建員工群組**:
   - 創建另一個群組
   - 將 Bot 添加為成員
   - 發送訊息獲取群組 ID

### 步驟 4: 獲取群組 ID

```bash
# 方法 1: 通過 Bot API
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"

# 方法 2: 使用專用 Bot (@userinfobot)
# 將此 Bot 加入群組並發送 /start
```

群組 ID 格式通常為: `-1001234567890`

---

## Google Apps Script 設定

### 步驟 1: 創建 Apps Script 項目

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點擊 **"新專案"**
3. 重新命名為 "企業員工管理系統"

### 步驟 2: 上傳後端代碼

1. 將 `backend/gas-main.js` 的內容複製到 Apps Script 編輯器
2. 創建其他必要的 `.gs` 檔案:
   - `modules/employee.gs`
   - `modules/attendance.gs`
   - `modules/revenue.gs`
   - `modules/ordering.gs`
   - `modules/schedule.gs`
   - `modules/promotion.gs`
   - `modules/maintenance.gs`

### 步驟 3: 設定腳本屬性

1. 點擊 **"專案設定"** (齒輪圖標)
2. 在 **"腳本屬性"** 中添加:

```javascript
TELEGRAM_BOT_TOKEN = "你的Bot Token"
TELEGRAM_BOSS_GROUP = "老闆群組ID"
TELEGRAM_EMPLOYEE_GROUP = "員工群組ID"
```

### 步驟 4: 部署為 Web 應用

1. 點擊 **"部署"** > **"新增部署作業"**
2. 選擇類型: **"網頁應用程式"**
3. 設定參數:
   - **執行身分**: 我
   - **存取權限**: 任何人
4. 點擊 **"部署"**
5. **記錄 Web App URL**: 稍後部署時需要

### 步驟 5: 初始化系統

```javascript
// 在 Apps Script 編輯器中執行此函數
function initializeSystem() {
  // 這會創建所有必要的 Google Sheets 數據表
}
```

---

## Cloud Run 部署

### 步驟 1: 準備部署環境

```bash
# 在 Cloud Shell 中執行
cd ~
git clone https://github.com/your-repo/employee-management-system.git
cd employee-management-system
```

### 步驟 2: 設定環境變數

```bash
# 設定專案環境變數
export GOOGLE_CLOUD_PROJECT=your-project-id
export TELEGRAM_BOT_TOKEN=your-bot-token
export TELEGRAM_BOSS_GROUP=your-boss-group-id
export TELEGRAM_EMPLOYEE_GROUP=your-employee-group-id
export GAS_WEB_APP_URL=your-gas-web-app-url
```

### 步驟 3: 使用自動部署腳本

```bash
# 安裝依賴
npm install

# 創建部署檔案
node deployment/cloud-run-deploy.js --setup

# 編輯環境配置
cp .env.template .env
nano .env  # 填入實際的配置值

# 執行部署
node deployment/cloud-run-deploy.js --deploy
```

### 步驟 4: 手動部署 (備選)

```bash
# 構建 Docker 映像
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/employee-management:latest .

# 推送到 Container Registry
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/employee-management:latest

# 部署到 Cloud Run
gcloud run deploy employee-management \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/employee-management:latest \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN,GAS_WEB_APP_URL=$GAS_WEB_APP_URL"
```

### 步驟 5: 驗證部署

```bash
# 檢查服務狀態
gcloud run services list --region asia-east1

# 測試健康檢查
curl https://your-service-url/api/health

# 查看日誌
gcloud run logs read employee-management --region asia-east1
```

---

## 域名與憑證設定

### 步驟 1: 自訂域名映射 (可選)

1. 前往 **Cloud Run** > **管理自訂網域**
2. 點擊 **"新增對應"**
3. 輸入您的域名 (例如: app.yourcompany.com)
4. 驗證域名擁有權

### 步驟 2: SSL 憑證

Google Cloud Run 自動提供 SSL 憑證，無需額外設定。

### 步驟 3: DNS 設定

在您的域名提供商處設定 DNS:

```dns
Type: CNAME
Name: app
Value: ghs.googlehosted.com
```

---

## 監控與日誌

### 步驟 1: 設定 Cloud Monitoring

1. 前往 **Monitoring** (監控)
2. 創建新的監控工作區
3. 設定警告政策:

```yaml
警告條件:
- Cloud Run 服務錯誤率 > 5%
- Cloud Run 服務延遲 > 2 秒
- Cloud Run 記憶體使用率 > 80%
```

### 步驟 2: 日誌查看

```bash
# 即時日誌
gcloud run logs tail employee-management --region asia-east1

# 歷史日誌
gcloud run logs read employee-management --region asia-east1 --limit 100
```

### 步驟 3: 效能監控

在 Cloud Console 中監控:
- **請求數量**
- **回應時間**
- **錯誤率**
- **記憶體使用率**
- **CPU 使用率**

---

## 費用估算與控制

### 💰 費用結構

```markdown
🎯 Cloud Run 計費:
- 請求數: $0.40 / 100 萬請求
- vCPU 時間: $0.00001 / vCPU-秒
- 記憶體: $0.000001 / GB-秒

🎯 免費額度 (每月):
- 200 萬請求
- 36 萬 vCPU-秒
- 76 萬 GB-秒

🎯 其他服務:
- Container Registry: $0.10 / GB / 月
- Cloud Build: 120 分鐘/天免費
- Cloud Monitoring: 免費額度內
```

### 步驟 1: 設定預算警告

1. 前往 **Billing** > **Budgets & alerts**
2. 創建新預算:

```yaml
預算設定:
- 名稱: 企業員工管理系統預算
- 金額: $20 USD / 月
- 警告閾值: 50%, 90%, 100%
- 通知: 發送到您的郵箱
```

### 步驟 2: 費用監控

```bash
# 查看當前費用
gcloud billing accounts list
gcloud billing budgets list

# 查看專案費用
gcloud logging read "protoPayload.serviceName=\"cloudbilling.googleapis.com\""
```

---

## 常見問題解決

### ❓ 問題 1: 部署失敗

**錯誤**: `Permission denied: "Cloud Run Admin" role required`

**解決方案**:
```bash
# 授予必要權限
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="user:your-email@gmail.com" \
  --role="roles/run.admin"
```

### ❓ 問題 2: Container Registry 推送失敗

**錯誤**: `Access denied: Please check your credentials`

**解決方案**:
```bash
# 配置 Docker 認證
gcloud auth configure-docker

# 或使用應用程式預設認證
gcloud auth application-default login
```

### ❓ 問題 3: Telegram Bot 無法發送訊息

**檢查清單**:
- [ ] Bot Token 正確
- [ ] Bot 已加入群組
- [ ] Bot 具有發送訊息權限
- [ ] 群組 ID 格式正確 (負數)

**測試命令**:
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<GROUP_ID>&text=測試訊息"
```

### ❓ 問題 4: Google Apps Script 權限錯誤

**解決步驟**:
1. 確認腳本部署權限設定
2. 重新授權腳本存取 Google Sheets
3. 檢查 API 配額限制

### ❓ 問題 5: 費用超出預期

**解決方案**:
```bash
# 檢查資源使用量
gcloud run services describe employee-management --region asia-east1

# 調整資源配置
gcloud run services update employee-management \
  --region asia-east1 \
  --memory 256Mi \
  --cpu 0.5 \
  --max-instances 5
```

---

## 🔧 維護與更新

### 日常維護

```bash
# 每週檢查
- 檢查系統日誌
- 監控費用使用
- 測試所有功能
- 備份重要數據

# 每月檢查
- 更新安全補丁
- 檢查 API 配額
- 優化資源配置
- 檢查監控警告
```

### 版本更新

```bash
# 無停機更新
gcloud run deploy employee-management \
  --image gcr.io/$PROJECT_ID/employee-management:new-version \
  --region asia-east1 \
  --no-traffic

# 漸進式流量轉移
gcloud run services update-traffic employee-management \
  --region asia-east1 \
  --to-revisions new-version=50,old-version=50

# 完全切換
gcloud run services update-traffic employee-management \
  --region asia-east1 \
  --to-latest
```

---

## 📞 支援與資源

### 官方資源
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Apps Script Guide](https://developers.google.com/apps-script)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### 社群支援
- [Google Cloud Community](https://www.googlecloudcommunity.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-platform)
- [GitHub Issues](https://github.com/your-repo/issues)

### 聯絡支援
- **技術支援**: [Google Cloud Support](https://cloud.google.com/support)
- **帳單支援**: billing-support@google.com
- **緊急支援**: 24/7 電話支援 (付費方案)

---

## 🎉 完成確認清單

```markdown
部署完成確認:
□ GCP 帳號註冊並驗證
□ 專案建立並設定帳單
□ 必要 API 服務已啟用
□ Telegram Bot 創建並測試
□ Google Apps Script 部署並初始化
□ Cloud Run 服務部署成功
□ 自訂域名設定 (可選)
□ 監控和警告設定
□ 預算控制設定
□ 系統功能全面測試
□ 備份和恢復流程測試
□ 文檔和培訓材料準備
```

---

**🎯 恭喜！** 您已成功完成企業員工管理系統的 Google Cloud Platform 部署。

如需進一步協助，請參考上述支援資源或聯絡技術支援團隊。
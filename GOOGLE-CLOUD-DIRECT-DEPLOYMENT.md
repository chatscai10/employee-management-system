# 🚀 Google Cloud 直接部署指南

## 🎯 Web 界面部署（推薦方式）

### 步驟 1: 準備代碼
✅ 所有文件已準備完成：
- `Dockerfile` - Docker 配置
- `server-production.js` - 生產伺服器
- `package.json` - 依賴配置
- `.dockerignore` - 排除文件

### 步驟 2: 打包代碼
1. 將以下檔案壓縮成 ZIP：
   - `server-production.js`
   - `package.json`
   - `Dockerfile`
   - `.dockerignore`
   - `api/` 資料夾（如果需要）

### 步驟 3: Google Cloud Console 部署
1. **前往 Cloud Run**: https://console.cloud.google.com/run
2. **選擇專案**: `employee-management-410808`
3. **點擊「建立服務」**
4. **選擇「從原始碼持續部署」**
5. **連接到 GitHub 儲存庫**: `chatscai10/employee-management-system`

### 步驟 4: 部署設定
```
服務名稱: employee-management-system
地區: asia-east1
CPU 配置: 1 個 vCPU
記憶體: 1 GiB
要求逾時: 300 秒
最大併發要求數: 80
最小執行個體數: 0
最大執行個體數: 10
環境變數:
  - NODE_ENV: production
  - PORT: 8080
```

### 步驟 5: 網路設定
- ✅ **允許未經驗證的叫用**（重要！）
- ✅ **啟用 HTTP/2**
- ✅ **自動分配網址**

## 🎯 預期結果

部署成功後，您將獲得：
- **生產網址**: `https://employee-management-system-[hash]-asiaeast1-run.googleapis.com`
- **完整功能**: 所有 API 端點正常運作
- **測試帳號**: test/123456, demo/demo, admin/admin123
- **企業級穩定性**: Google Cloud 基礎設施

## 🔧 如果部署失敗

### 方案 A: Cloud Shell 部署
1. 前往: https://shell.cloud.google.com/
2. 上傳檔案並執行：
```bash
git clone https://github.com/chatscai10/employee-management-system.git
cd employee-management-system
gcloud run deploy employee-management-system \
  --source . \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 8080
```

### 方案 B: Container Registry
1. 前往: https://console.cloud.google.com/gcr
2. 建立 Docker 映像
3. 推送到 Container Registry
4. 從 Registry 部署到 Cloud Run

## 🎉 驗證部署

部署完成後測試這些端點：
- `GET /` - 主頁
- `GET /api/health` - 健康檢查
- `GET /api/products` - 產品管理
- `GET /api/inventory` - 庫存管理
- `GET /api/login` - 員工登入頁面
- `POST /api/login` - 登入驗證

## 💎 為什麼選擇 Google Cloud？

- **🏆 企業級**: 99.95% 可用性保證
- **🚀 自動擴展**: 根據流量自動調整
- **🔒 安全性**: Google 級別的安全保護
- **🌐 全球覆蓋**: 全球 CDN 和邊緣節點
- **💰 成本效益**: 按使用量付費，免費額度充足
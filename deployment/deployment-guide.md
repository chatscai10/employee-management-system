# 企業員工管理系統 - 完整部署指南

## 📋 部署方案總覽

本系統提供三種部署方案，適合不同規模和需求的企業：

### 🥉 基礎方案：Google Apps Script 直接部署
**適合**：小型企業（10-50人）
**成本**：免費-低成本
**維護難度**：簡單

### 🥈 進階方案：Google Cloud Platform + 容器化
**適合**：中型企業（50-500人）
**成本**：中等
**維護難度**：中等

### 🥇 企業方案：完整微服務架構
**適合**：大型企業（500+人）
**成本**：高
**維護難度**：複雜

---

## 🥉 基礎方案：Google Apps Script 部署

### 📋 前置需求
- Google 帳號（建議企業級 Google Workspace）
- Google Sheets 和 Google Apps Script 權限
- Telegram Bot Token（用於通知）

### 🚀 部署步驟

#### 1. 建立 Google Sheets 資料庫
```bash
# 1. 建立新的 Google Sheets
# 2. 按照 database/sheets-schema.md 建立所有工作表
# 3. 記錄 Spreadsheet ID
```

#### 2. 設定 Google Apps Script
```javascript
// 1. 開啟 script.google.com
// 2. 建立新專案
// 3. 上傳所有後端檔案
// 4. 更新 CONFIG 設定

const CONFIG = {
  SPREADSHEET_ID: 'YOUR_ACTUAL_SPREADSHEET_ID',
  TELEGRAM_BOT_TOKEN: 'YOUR_BOT_TOKEN',
  TELEGRAM_BOSS_GROUP: 'YOUR_GROUP_ID',
  TELEGRAM_EMPLOYEE_GROUP: 'YOUR_GROUP_ID',
  DEBUG_MODE: false // 生產環境設為 false
};
```

#### 3. 部署為 Web App
```bash
# 1. 點擊「部署」→「新增部署作業」
# 2. 類型選擇「網頁應用程式」
# 3. 執行身分選擇「我」
# 4. 存取權限選擇「任何人」
# 5. 部署並記錄 Web App URL
```

#### 4. 設定前端
```html
<!-- 在 frontend/index.html 中加入 meta 標籤 -->
<meta name="api-base-url" content="YOUR_WEB_APP_URL">
```

#### 5. 初始化系統
```javascript
// 在 Apps Script 編輯器中執行
initializeSystem();
```

### ✅ 驗證部署
- 訪問 Web App URL 確認前端載入
- 測試員工註冊功能
- 測試 Telegram 通知
- 檢查 Google Sheets 數據寫入

### 📊 監控和維護
- 定期檢查 Google Apps Script 執行配額
- 監控 Google Sheets 行數限制
- 備份 Spreadsheet 數據

---

## 🥈 進階方案：Google Cloud Platform 部署

### 🏗️ 架構設計
```
前端 (Cloud Storage) ← CDN ← 用戶
    ↓
後端 (Cloud Run) ← Load Balancer
    ↓
資料庫 (Cloud SQL / Firestore)
    ↓
監控 (Cloud Monitoring)
```

### 📋 前置需求
- Google Cloud Platform 帳號
- 啟用計費帳戶
- Docker 基礎知識
- GitHub 帳號（用於 CI/CD）

### 🚀 部署步驟

#### 1. 建立 GCP 專案
```bash
# 安裝 gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 建立專案
gcloud projects create employee-management-system
gcloud config set project employee-management-system

# 啟用必要的 API
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 2. 設定資料庫
```bash
# 建立 Cloud SQL 實例
gcloud sql instances create employee-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=asia-east1

# 建立資料庫
gcloud sql databases create employee_management \
    --instance=employee-db

# 建立用戶
gcloud sql users create app-user \
    --instance=employee-db \
    --password=SECURE_PASSWORD
```

#### 3. 容器化應用
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 複製前端檔案
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# 安裝依賴（如果有 package.json）
# COPY package*.json ./
# RUN npm install

# 暴露端口
EXPOSE 8080

# 啟動命令
CMD ["node", "backend/gas-main.js"]
```

#### 4. 建立 Cloud Build 配置
```yaml
# cloudbuild.yaml
steps:
  # 建置 Docker 映像
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/employee-management:$BUILD_ID', '.']
  
  # 推送到 Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/employee-management:$BUILD_ID']
  
  # 部署到 Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'employee-management'
      - '--image'
      - 'gcr.io/$PROJECT_ID/employee-management:$BUILD_ID'
      - '--region'
      - 'asia-east1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/employee-management:$BUILD_ID'
```

#### 5. 設定環境變數
```bash
# 在 Cloud Run 中設定環境變數
gcloud run services update employee-management \
    --set-env-vars="DATABASE_URL=postgresql://app-user:SECURE_PASSWORD@/employee_management?host=/cloudsql/employee-management-system:asia-east1:employee-db" \
    --set-env-vars="TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN" \
    --region=asia-east1
```

### 📊 監控設定
```yaml
# monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: monitoring-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'employee-management'
        static_configs:
          - targets: ['employee-management:8080']
```

---

## 🥇 企業方案：完整微服務架構

### 🏗️ 架構設計
```
前端 (React/Vue) ← CDN ← 用戶
    ↓
API Gateway ← Load Balancer
    ↓
微服務群 (Kubernetes)
- 員工服務
- 打卡服務  
- 營收服務
- 通知服務
    ↓
資料庫群 (多個專用資料庫)
- 員工資料庫
- 打卡資料庫
- 營收資料庫
    ↓
監控和日誌系統
```

### 📋 技術堆疊
- **前端**: React.js + TypeScript
- **後端**: Node.js + Express.js 微服務
- **資料庫**: PostgreSQL + Redis
- **容器編排**: Kubernetes (GKE)
- **監控**: Prometheus + Grafana
- **日誌**: ELK Stack
- **CI/CD**: GitHub Actions + ArgoCD

### 🚀 部署步驟

#### 1. 建立 Kubernetes 叢集
```bash
# 建立 GKE 叢集
gcloud container clusters create employee-management-cluster \
    --zone=asia-east1-a \
    --num-nodes=3 \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=10 \
    --machine-type=e2-standard-2
```

#### 2. 微服務配置
```yaml
# k8s/employee-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: employee-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: employee-service
  template:
    metadata:
      labels:
        app: employee-service
    spec:
      containers:
      - name: employee-service
        image: gcr.io/PROJECT_ID/employee-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: employee-service
spec:
  selector:
    app: employee-service
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

#### 3. 設定 Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: employee-management-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - employee.company.com
    secretName: employee-tls
  rules:
  - host: employee.company.com
    http:
      paths:
      - path: /api/employee
        pathType: Prefix
        backend:
          service:
            name: employee-service
            port:
              number: 80
      - path: /api/attendance
        pathType: Prefix
        backend:
          service:
            name: attendance-service
            port:
              number: 80
```

---

## 🤖 CI/CD 自動化流程

### GitHub Actions 工作流程

#### 1. 基礎 CI/CD 配置
```yaml
# .github/workflows/deploy.yml
name: Deploy Employee Management System

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  PROJECT_ID: employee-management-system
  GKE_CLUSTER: employee-management-cluster
  GKE_ZONE: asia-east1-a

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ env.PROJECT_ID }}
    
    - name: Configure Docker
      run: gcloud --quiet auth configure-docker
    
    - name: Build Docker image
      run: |
        docker build -t gcr.io/$PROJECT_ID/employee-management:$GITHUB_SHA .
    
    - name: Push Docker image
      run: |
        docker push gcr.io/$PROJECT_ID/employee-management:$GITHUB_SHA
    
    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy employee-management \
          --image gcr.io/$PROJECT_ID/employee-management:$GITHUB_SHA \
          --region asia-east1 \
          --platform managed \
          --allow-unauthenticated
```

#### 2. 多環境部署
```yaml
# .github/workflows/multi-env-deploy.yml
name: Multi-Environment Deploy

on:
  push:
    branches: [ main, develop ]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      # 部署到測試環境
      
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    needs: [test, security-scan]
    steps:
      # 部署到生產環境
```

### 🔒 安全性配置

#### 1. Secrets 管理
```bash
# 在 GitHub Repository 中設定 Secrets
GCP_SA_KEY=<Google Cloud Service Account Key>
DATABASE_PASSWORD=<資料庫密碼>
TELEGRAM_BOT_TOKEN=<Telegram Bot Token>
```

#### 2. 容器安全掃描
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'gcr.io/${{ env.PROJECT_ID }}/employee-management:${{ github.sha }}'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

---

## 📊 監控和維護

### 🔍 系統監控指標

#### 應用層監控
- **回應時間**: API 端點平均回應時間
- **錯誤率**: HTTP 4xx/5xx 錯誤比例
- **吞吐量**: 每秒請求數 (RPS)
- **用戶活躍度**: 日/月活躍用戶數

#### 基礎設施監控
- **CPU 使用率**: 容器/虛擬機 CPU 使用情況
- **記憶體使用率**: 記憶體消耗情況
- **磁碟 I/O**: 資料庫讀寫效能
- **網路流量**: 進出流量監控

### 📈 Grafana 儀表板配置
```json
{
  "dashboard": {
    "title": "Employee Management System",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds_bucket"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

### 🚨 告警配置
```yaml
# alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'telegram-alerts'

receivers:
- name: 'telegram-alerts'
  telegram_configs:
  - bot_token: 'YOUR_BOT_TOKEN'
    chat_id: -1002658082392
    message: '🚨 Alert: {{ .GroupLabels.alertname }}'

rules:
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
```

---

## 🔧 維護和故障排除

### 📋 定期維護檢查清單

#### 每日檢查
- [ ] 監控系統健康狀態
- [ ] 檢查錯誤日誌
- [ ] 驗證 Telegram 通知功能
- [ ] 檢查資料庫備份狀態

#### 每週檢查
- [ ] 檢查系統效能指標
- [ ] 更新安全補丁
- [ ] 檢查磁碟空間使用量
- [ ] 測試災難恢復程序

#### 每月檢查
- [ ] 檢討系統容量規劃
- [ ] 更新文檔
- [ ] 進行安全審查
- [ ] 最佳化資料庫效能

### 🆘 常見問題排除

#### API 回應緩慢
```bash
# 檢查系統資源使用
kubectl top pods
kubectl top nodes

# 檢查應用日誌
kubectl logs -f deployment/employee-service

# 檢查資料庫效能
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

#### 部署失敗
```bash
# 檢查 GitHub Actions 日誌
# 檢查 Cloud Build 狀態
gcloud builds list --limit=10

# 回滾到前一版本
gcloud run services update employee-management \
  --image gcr.io/$PROJECT_ID/employee-management:PREVIOUS_SHA
```

---

## 💰 成本預估

### 🥉 基礎方案成本
- **Google Apps Script**: 免費
- **Google Sheets**: 免費 (Google Workspace: $6/用戶/月)
- **Telegram Bot**: 免費
- **總計**: $0-300/月 (依用戶數而定)

### 🥈 進階方案成本
- **Cloud Run**: $0.000024/vCPU-second + $0.0000025/GiB-second
- **Cloud SQL**: $9.37/月 (db-f1-micro)
- **Cloud Storage**: $0.02/GB/月
- **總計**: $50-500/月

### 🥇 企業方案成本
- **GKE**: $0.10/cluster/hour + node costs
- **Load Balancer**: $18.25/月
- **Cloud SQL HA**: $30+/月
- **Monitoring**: $0.2580/MiB
- **總計**: $500-5000/月

---

## 🎯 建議部署路徑

### 階段1：快速啟動 (1-2週)
選擇**基礎方案**快速上線，驗證業務需求

### 階段2：擴展升級 (1-2個月)
當用戶增長或需要更多功能時，升級到**進階方案**

### 階段3：企業級 (3-6個月)
業務穩定且需要高可用性時，升級到**企業方案**

每個階段都可以保留原有數據，確保平滑升級過程。

---

**版本**: v1.0  
**更新日期**: 2025-08-02  
**狀態**: ✅ 已驗證可用
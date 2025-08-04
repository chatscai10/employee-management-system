/**
 * 部署方案選擇器 - 根據需求和環境選擇最佳部署方案
 */

const fs = require('fs').promises;
const path = require('path');

class DeploymentSelector {
  
  constructor() {
    this.deploymentOptions = {
      basic: {
        name: 'Google Apps Script (基礎方案)',
        description: '適合小型團隊，完全免費，易於維護',
        requirements: ['Google帳號', 'Google Sheets', 'Telegram Bot'],
        capabilities: ['員工管理', '打卡系統', '營收記錄', '基本報表'],
        limitations: ['有執行時間限制', '並發用戶有限', '儲存空間限制'],
        cost: '免費',
        complexity: '低',
        maintenance: '低',
        scalability: '低-中',
        performance: '中',
        reliability: '高'
      },
      
      intermediate: {
        name: 'Google Cloud Run (進階方案)',
        description: '適合中型團隊，serverless架構，按使用量付費',
        requirements: ['GCP帳號', '自定義域名(選用)', 'Telegram Bot'],
        capabilities: ['完整員工管理', '高級報表', '文件上傳', '自動備份', 'API擴展'],
        limitations: ['冷啟動時間', '區域限制'],
        cost: '按使用量付費 (~$10-50/月)',
        complexity: '中',
        maintenance: '低-中',
        scalability: '高',
        performance: '高',
        reliability: '高'
      },
      
      advanced: {
        name: 'Kubernetes + PostgreSQL (企業方案)',
        description: '適合大型組織，完全可客製化，最高性能',
        requirements: ['Kubernetes集群', 'PostgreSQL', '監控系統', 'DevOps團隊'],
        capabilities: ['企業級功能', '高可用性', '多租戶支援', '完整監控', '災難恢復'],
        limitations: ['維護複雜', '成本較高'],
        cost: '固定成本 (~$100-500/月)',
        complexity: '高',
        maintenance: '高',
        scalability: '極高',
        performance: '極高',
        reliability: '極高'
      }
    };
  }
  
  /**
   * 評估並推薦最佳部署方案
   */
  async recommendDeployment(requirements) {
    console.log('🎯 正在分析您的需求...\n');
    
    const scores = {};
    
    // 為每個方案評分
    Object.entries(this.deploymentOptions).forEach(([key, option]) => {
      scores[key] = this.calculateScore(option, requirements);
    });
    
    // 排序並選擇最佳方案
    const sortedOptions = Object.entries(scores)
      .sort(([,a], [,b]) => b.score - a.score)
      .map(([key, score]) => ({
        key,
        option: this.deploymentOptions[key],
        score: score.score,
        reasons: score.reasons
      }));
    
    // 顯示推薦結果
    this.displayRecommendations(sortedOptions, requirements);
    
    return sortedOptions[0];
  }
  
  /**
   * 計算方案評分
   */
  calculateScore(option, requirements) {
    let score = 0;
    const reasons = [];
    
    // 團隊規模評分
    if (requirements.teamSize <= 10) {
      if (option.name.includes('基礎')) {
        score += 30;
        reasons.push('適合小團隊規模');
      }
    } else if (requirements.teamSize <= 50) {
      if (option.name.includes('進階')) {
        score += 30;
        reasons.push('適合中型團隊規模');
      }
    } else {
      if (option.name.includes('企業')) {
        score += 30;
        reasons.push('適合大型團隊規模');
      }
    }
    
    // 預算評分
    const budgetScore = this.evaluateBudget(option, requirements.budget);
    score += budgetScore.score;
    if (budgetScore.reason) reasons.push(budgetScore.reason);
    
    // 技術能力評分
    const techScore = this.evaluateTechnicalCapability(option, requirements.technicalLevel);
    score += techScore.score;
    if (techScore.reason) reasons.push(techScore.reason);
    
    // 擴展性需求評分
    const scalabilityScore = this.evaluateScalability(option, requirements.scalabilityNeeds);
    score += scalabilityScore.score;
    if (scalabilityScore.reason) reasons.push(scalabilityScore.reason);
    
    // 維護偏好評分
    const maintenanceScore = this.evaluateMaintenance(option, requirements.maintenancePreference);
    score += maintenanceScore.score;
    if (maintenanceScore.reason) reasons.push(maintenanceScore.reason);
    
    return { score, reasons };
  }
  
  /**
   * 評估預算適配性
   */
  evaluateBudget(option, budget) {
    if (budget === 'free') {
      return option.cost === '免費' 
        ? { score: 25, reason: '符合免費預算要求' }
        : { score: -10, reason: '超出免費預算' };
    } else if (budget === 'low') {
      return option.cost.includes('免費') || option.cost.includes('10-50')
        ? { score: 20, reason: '符合低預算要求' }
        : { score: 5, reason: '預算略高但可接受' };
    } else if (budget === 'medium') {
      return !option.cost.includes('100-500')
        ? { score: 15, reason: '預算合適' }
        : { score: 10, reason: '預算偏高' };
    } else {
      return { score: 15, reason: '預算充足' };
    }
  }
  
  /**
   * 評估技術能力適配性
   */
  evaluateTechnicalCapability(option, techLevel) {
    const complexity = option.complexity;
    
    if (techLevel === 'beginner') {
      return complexity === '低'
        ? { score: 20, reason: '技術複雜度適合初學者' }
        : { score: -5, reason: '技術複雜度較高' };
    } else if (techLevel === 'intermediate') {
      return complexity === '中' || complexity === '低'
        ? { score: 15, reason: '技術複雜度適合' }
        : { score: 5, reason: '技術複雜度偏高' };
    } else {
      return { score: 15, reason: '技術能力足夠' };
    }
  }
  
  /**
   * 評估擴展性需求
   */
  evaluateScalability(option, scalabilityNeeds) {
    const scalability = option.scalability;
    
    if (scalabilityNeeds === 'low') {
      return { score: 10, reason: '擴展性需求低' };
    } else if (scalabilityNeeds === 'medium') {
      return scalability.includes('高') || scalability.includes('中')
        ? { score: 15, reason: '擴展性符合需求' }
        : { score: 5, reason: '擴展性略低' };
    } else {
      return scalability.includes('高') || scalability.includes('極高')
        ? { score: 20, reason: '擴展性符合高需求' }
        : { score: 0, reason: '擴展性不足' };
    }
  }
  
  /**
   * 評估維護偏好
   */
  evaluateMaintenance(option, maintenancePreference) {
    const maintenance = option.maintenance;
    
    if (maintenancePreference === 'minimal') {
      return maintenance === '低'
        ? { score: 15, reason: '維護工作量最小' }
        : { score: 0, reason: '維護工作量較大' };
    } else if (maintenancePreference === 'moderate') {
      return maintenance.includes('低') || maintenance.includes('中')
        ? { score: 10, reason: '維護工作量適中' }
        : { score: 5, reason: '維護工作量較大' };
    } else {
      return { score: 10, reason: '可接受任何維護工作量' };
    }
  }
  
  /**
   * 顯示推薦結果
   */
  displayRecommendations(sortedOptions, requirements) {
    console.log('📊 ===== 部署方案推薦結果 =====\n');
    
    console.log('📋 您的需求分析:');
    console.log(`• 團隊規模: ${requirements.teamSize} 人`);
    console.log(`• 預算範圍: ${this.getBudgetText(requirements.budget)}`);
    console.log(`• 技術水平: ${this.getTechLevelText(requirements.technicalLevel)}`);
    console.log(`• 擴展性需求: ${this.getScalabilityText(requirements.scalabilityNeeds)}`);
    console.log(`• 維護偏好: ${this.getMaintenanceText(requirements.maintenancePreference)}\n`);
    
    sortedOptions.forEach((item, index) => {
      const rank = index === 0 ? '🥇 最佳推薦' : index === 1 ? '🥈 次要選擇' : '🥉 備選方案';
      const score = Math.round(item.score);
      
      console.log(`${rank}: ${item.option.name}`);
      console.log(`評分: ${score}/100`);
      console.log(`描述: ${item.option.description}`);
      console.log(`成本: ${item.option.cost}`);
      console.log(`推薦理由:`);
      item.reasons.forEach(reason => console.log(`  • ${reason}`));
      console.log('');
    });
    
    console.log('===============================\n');
  }
  
  /**
   * 輔助方法：獲取預算文字描述
   */
  getBudgetText(budget) {
    const map = {
      free: '免費',
      low: '低預算 ($0-50/月)',
      medium: '中等預算 ($50-200/月)',
      high: '高預算 ($200+/月)'
    };
    return map[budget] || budget;
  }
  
  /**
   * 輔助方法：獲取技術水平文字描述
   */
  getTechLevelText(level) {
    const map = {
      beginner: '初學者',
      intermediate: '中級',
      advanced: '高級'
    };
    return map[level] || level;
  }
  
  /**
   * 輔助方法：獲取擴展性需求文字描述
   */
  getScalabilityText(scalability) {
    const map = {
      low: '低 (穩定用戶數)',
      medium: '中等 (適度增長)',
      high: '高 (快速增長)'
    };
    return map[scalability] || scalability;
  }
  
  /**
   * 輔助方法：獲取維護偏好文字描述
   */
  getMaintenanceText(maintenance) {
    const map = {
      minimal: '最小化維護',
      moderate: '適度維護',
      full: '可接受複雜維護'
    };
    return map[maintenance] || maintenance;
  }
  
  /**
   * 生成部署配置檔案
   */
  async generateDeploymentConfig(selectedOption, requirements) {
    console.log('📝 正在生成部署配置檔案...\n');
    
    const configDir = path.join(process.cwd(), 'deployment-configs');
    
    try {
      await fs.mkdir(configDir, { recursive: true });
      
      // 生成環境變數檔案
      await this.generateEnvConfig(configDir, selectedOption, requirements);
      
      // 生成部署腳本
      await this.generateDeploymentScript(configDir, selectedOption);
      
      // 生成說明文檔
      await this.generateDeploymentGuide(configDir, selectedOption, requirements);
      
      console.log('✅ 部署配置檔案生成完成！');
      console.log(`📁 配置檔案位置: ${configDir}`);
      console.log('\n📋 生成的檔案:');
      console.log('• .env.deployment - 環境變數配置');
      console.log('• deploy.sh - 部署執行腳本');
      console.log('• deployment-guide.md - 詳細部署說明');
      
    } catch (error) {
      console.error('❌ 生成配置檔案失敗:', error.message);
    }
  }
  
  /**
   * 生成環境變數配置
   */
  async generateEnvConfig(configDir, selectedOption, requirements) {
    let envContent = '';
    
    if (selectedOption.key === 'basic') {
      envContent = `# Google Apps Script 基礎方案配置
# 請在 Google Apps Script 編輯器中設定這些環境變數

# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOSS_GROUP=your_boss_group_id_here
TELEGRAM_EMPLOYEE_GROUP=your_employee_group_id_here

# Google Sheets 配置  
GOOGLE_SHEET_ID=your_sheet_id_here

# 系統配置
SYSTEM_NAME=企業員工管理系統
COMPANY_NAME=${requirements.companyName || 'Your Company'}
TIMEZONE=Asia/Taipei
`;
    } else if (selectedOption.key === 'intermediate') {
      envContent = `# Google Cloud Run 進階方案配置

# 應用程式配置
NODE_ENV=production
PORT=8080

# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOSS_GROUP=your_boss_group_id_here
TELEGRAM_EMPLOYEE_GROUP=your_employee_group_id_here

# Google Cloud 配置
GCP_PROJECT_ID=your_project_id
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_KEY=./service-account-key.json

# 安全配置
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# 儲存配置
UPLOAD_BUCKET=your_storage_bucket
MAX_FILE_SIZE=5242880

# 監控配置
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here
`;
    } else {
      envContent = `# Kubernetes 企業方案配置

# 應用程式配置
NODE_ENV=production
PORT=3000

# 資料庫配置
DB_HOST=postgres-service
DB_PORT=5432
DB_NAME=employee_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis 配置
REDIS_URL=redis://redis-service:6379
REDIS_PASSWORD=your_redis_password

# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOSS_GROUP=your_boss_group_id_here
TELEGRAM_EMPLOYEE_GROUP=your_employee_group_id_here

# 安全配置
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
BCRYPT_ROUNDS=12

# 檔案儲存
UPLOAD_PATH=/app/uploads
BACKUP_PATH=/app/backups

# 監控配置
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here
`;
    }
    
    await fs.writeFile(path.join(configDir, '.env.deployment'), envContent);
  }
  
  /**
   * 生成部署腳本
   */
  async generateDeploymentScript(configDir, selectedOption) {
    let scriptContent = '';
    
    if (selectedOption.key === 'basic') {
      scriptContent = `#!/bin/bash
# Google Apps Script 部署腳本

echo "🚀 開始部署到 Google Apps Script..."

# 檢查必要工具
if ! command -v clasp &> /dev/null; then
    echo "❌ 未安裝 clasp，正在安裝..."
    npm install -g @google/clasp
fi

# 登入 Google Apps Script
echo "🔐 請完成 Google 帳號認證..."
clasp login

# 創建新專案或連接現有專案
if [ ! -f ".clasp.json" ]; then
    echo "📝 創建新的 Google Apps Script 專案..."
    clasp create --type webapp --title "企業員工管理系統"
else
    echo "🔗 使用現有專案..."
fi

# 推送代碼
echo "📤 上傳代碼到 Google Apps Script..."
clasp push

# 部署 Web App
echo "🌐 部署 Web 應用程式..."
clasp deploy --description "自動部署 - $(date)"

# 開啟 Google Apps Script 編輯器
echo "🔧 請在瀏覽器中配置環境變數..."
clasp open

echo "✅ 部署完成！請在 Google Apps Script 編輯器中："
echo "1. 設定環境變數"
echo "2. 授權必要的權限"
echo "3. 取得 Web App URL"
`;
    } else if (selectedOption.key === 'intermediate') {
      scriptContent = `#!/bin/bash
# Google Cloud Run 部署腳本

echo "🚀 開始部署到 Google Cloud Run..."

# 設定變數
PROJECT_ID=\${GCP_PROJECT_ID:-your-project-id}
SERVICE_NAME=employee-management
REGION=asia-east1

# 檢查 gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo "❌ 請先安裝 Google Cloud SDK"
    exit 1
fi

# 設定專案
echo "🔧 設定 Google Cloud 專案..."
gcloud config set project \$PROJECT_ID

# 啟用必要的 API
echo "🔌 啟用必要的 Google Cloud API..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 建置 Docker 映像
echo "🐳 建置 Docker 映像..."
gcloud builds submit --tag gcr.io/\$PROJECT_ID/\$SERVICE_NAME

# 部署到 Cloud Run
echo "☁️ 部署到 Cloud Run..."
gcloud run deploy \$SERVICE_NAME \\
  --image gcr.io/\$PROJECT_ID/\$SERVICE_NAME \\
  --region \$REGION \\
  --platform managed \\
  --allow-unauthenticated \\
  --memory 512Mi \\
  --cpu 1 \\
  --max-instances 10

# 取得服務 URL
echo "🔗 取得服務 URL..."
SERVICE_URL=\$(gcloud run services describe \$SERVICE_NAME --region \$REGION --format="value(status.url)")

echo "✅ 部署完成！"
echo "🌐 服務 URL: \$SERVICE_URL"
echo "📱 請設定 Telegram Webhook: \$SERVICE_URL/webhook"
`;
    } else {
      scriptContent = `#!/bin/bash
# Kubernetes 企業方案部署腳本

echo "🚀 開始部署到 Kubernetes..."

# 檢查必要工具
for tool in kubectl helm docker; do
    if ! command -v \$tool &> /dev/null; then
        echo "❌ 請先安裝 \$tool"
        exit 1
    fi
done

# 建置 Docker 映像
echo "🐳 建置 Docker 映像..."
docker build -t employee-management:latest .

# 推送到容器註冊表 (根據您的設定調整)
echo "📤 推送映像到註冊表..."
# docker tag employee-management:latest your-registry/employee-management:latest
# docker push your-registry/employee-management:latest

# 創建命名空間
echo "📦 創建 Kubernetes 命名空間..."
kubectl create namespace employee-management --dry-run=client -o yaml | kubectl apply -f -

# 部署 PostgreSQL
echo "🗄️ 部署 PostgreSQL..."
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \\
  --namespace employee-management \\
  --set auth.postgresPassword=\${DB_PASSWORD:-defaultpassword}

# 部署 Redis
echo "📋 部署 Redis..."
helm install redis bitnami/redis \\
  --namespace employee-management \\
  --set auth.password=\${REDIS_PASSWORD:-defaultpassword}

# 部署主應用程式
echo "🚀 部署主應用程式..."
kubectl apply -f kubernetes/ -n employee-management

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl rollout status deployment/employee-management -n employee-management

# 取得服務狀態
echo "📊 部署狀態："
kubectl get pods -n employee-management
kubectl get services -n employee-management

echo "✅ 部署完成！"
echo "🔗 請檢查 LoadBalancer 或 Ingress 取得外部 URL"
`;
    }
    
    await fs.writeFile(path.join(configDir, 'deploy.sh'), scriptContent);
    
    // 讓腳本可執行
    try {
      await fs.chmod(path.join(configDir, 'deploy.sh'), '755');
    } catch (error) {
      // Windows 可能不支援 chmod，忽略錯誤
    }
  }
  
  /**
   * 生成部署說明文檔
   */
  async generateDeploymentGuide(configDir, selectedOption, requirements) {
    const guideContent = `# ${selectedOption.option.name} 部署指南

## 概述

${selectedOption.option.description}

**適用場景：** ${requirements.teamSize} 人團隊，${this.getBudgetText(requirements.budget)}預算

## 前置需求

${selectedOption.option.requirements.map(req => `- ${req}`).join('\n')}

## 部署步驟

### 1. 準備環境

\`\`\`bash
# 複製環境變數配置
cp .env.deployment .env

# 編輯環境變數，填入實際值
nano .env
\`\`\`

### 2. 執行部署

\`\`\`bash
# 給部署腳本執行權限
chmod +x deploy.sh

# 執行部署
./deploy.sh
\`\`\`

### 3. 後續配置

${this.getPostDeploymentSteps(selectedOption.key)}

## 系統功能

${selectedOption.option.capabilities.map(cap => `- ✅ ${cap}`).join('\n')}

## 限制說明

${selectedOption.option.limitations.map(limit => `- ⚠️ ${limit}`).join('\n')}

## 維護建議

${this.getMaintenanceRecommendations(selectedOption.key)}

## 擴展路徑

${this.getScalingPath(selectedOption.key)}

## 故障排除

### 常見問題

1. **部署失敗**
   - 檢查網路連接
   - 驗證帳號權限
   - 查看錯誤日誌

2. **功能異常**
   - 檢查環境變數配置
   - 驗證 API 金鑰
   - 查看系統日誌

### 技術支援

- 📚 查看完整文檔：[deployment/deployment-guide.md](../deployment/deployment-guide.md)
- 🐛 回報問題：創建 GitHub Issue
- 💬 社群支援：加入 Telegram 群組

## 成本預估

**${selectedOption.option.cost}**

${this.getCostBreakdown(selectedOption.key)}

---

*最後更新：${new Date().toISOString().split('T')[0]}*
`;
    
    await fs.writeFile(path.join(configDir, 'deployment-guide.md'), guideContent);
  }
  
  /**
   * 獲取後續配置步驟
   */
  getPostDeploymentSteps(optionKey) {
    const steps = {
      basic: `1. 在 Google Apps Script 編輯器中設定環境變數
2. 授權 Google Sheets 和 Gmail 權限
3. 設定 Telegram Bot Webhook
4. 測試所有功能
5. 分享 Web App URL 給團隊成員`,
      
      intermediate: `1. 配置自定義域名 (選用)
2. 設定 HTTPS 憑證
3. 配置 Cloud SQL 或 Firebase (如需要)
4. 設定監控和警報
5. 配置 CI/CD 流程`,
      
      advanced: `1. 配置 Ingress 和 SSL 憑證
2. 設定 Prometheus 監控
3. 配置 Grafana 儀表板
4. 設定自動備份策略
5. 配置災難恢復計劃
6. 設定多環境部署 (dev/staging/prod)`
    };
    
    return steps[optionKey] || '請參考相關文檔進行配置';
  }
  
  /**
   * 獲取維護建議
   */
  getMaintenanceRecommendations(optionKey) {
    const recommendations = {
      basic: `- 定期備份 Google Sheets 數據
- 監控 Google Apps Script 配額使用
- 定期更新 Telegram Bot Token
- 每月檢查系統日誌`,
      
      intermediate: `- 設定 Cloud Monitoring 警報
- 定期檢查 Cloud Run 用量和成本
- 更新 Docker 映像安全補丁
- 監控應用程式效能指標`,
      
      advanced: `- 建立完整的監控和警報系統
- 實施定期安全掃描
- 建立自動化測試流程
- 定期進行災難恢復演練
- 實施容量規劃和效能調優`
    };
    
    return recommendations[optionKey] || '請制定適合的維護計劃';
  }
  
  /**
   * 獲取擴展路徑
   */
  getScalingPath(optionKey) {
    const paths = {
      basic: `當團隊成長或需要更多功能時，可以考慮升級到：
- Google Cloud Run (中型團隊)
- Kubernetes 方案 (大型組織)`,
      
      intermediate: `擴展選項：
- 增加 Cloud Run 實例和記憶體
- 整合 Cloud SQL 提升數據處理能力
- 使用 Cloud Load Balancing 實現高可用性
- 升級到 Kubernetes 獲得更多控制權`,
      
      advanced: `已達到最高級別，可以考慮：
- 多區域部署提升可用性
- 微服務架構拆分
- 實施服務網格 (Istio)
- 多雲架構 (Multi-cloud)`
    };
    
    return paths[optionKey] || '當前方案已滿足大部分需求';
  }
  
  /**
   * 獲取成本分析
   */
  getCostBreakdown(optionKey) {
    const breakdown = {
      basic: `- Google Apps Script：免費
- Google Sheets：免費 (15GB 限制)
- Telegram Bot：免費
- 總計：$0/月`,
      
      intermediate: `- Cloud Run：$5-30/月 (依使用量)
- Cloud Storage：$1-5/月
- Cloud Build：$0-10/月
- 網路流量：$0-5/月
- 總計：約 $10-50/月`,
      
      advanced: `- GKE 集群：$70-200/月
- PostgreSQL：$20-100/月
- Redis：$10-30/月
- 儲存和網路：$10-50/月
- 監控工具：$0-20/月
- 總計：約 $110-400/月`
    };
    
    return breakdown[optionKey] || '請聯繫技術團隊評估成本';
  }
  
  /**
   * 互動式需求收集
   */
  async collectRequirements() {
    // 這裡簡化為返回預設需求
    // 實際使用時可以整合 inquirer 等套件進行互動式詢問
    return {
      teamSize: 15,
      budget: 'low',
      technicalLevel: 'intermediate',
      scalabilityNeeds: 'medium',
      maintenancePreference: 'moderate',
      companyName: '示範公司'
    };
  }
}

// 主執行函數
async function main() {
  const selector = new DeploymentSelector();
  
  console.log('🏢 企業員工管理系統 - 部署方案選擇器\n');
  
  try {
    // 收集需求
    const requirements = await selector.collectRequirements();
    
    // 推薦方案
    const recommendation = await selector.recommendDeployment(requirements);
    
    // 生成配置檔案
    await selector.generateDeploymentConfig(recommendation, requirements);
    
    console.log('\n🎉 部署方案選擇完成！');
    console.log(`📝 推薦方案：${recommendation.option.name}`);
    console.log('📁 請查看 deployment-configs 目錄中的配置檔案');
    console.log('📖 按照 deployment-guide.md 中的步驟進行部署');
    
  } catch (error) {
    console.error('❌ 部署方案選擇失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = DeploymentSelector;
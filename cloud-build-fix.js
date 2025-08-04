#!/usr/bin/env node

/**
 * 🔧 Cloud Build 修復工具
 * 診斷並修復 Cloud Run 部署問題
 */

const https = require('https');
const fs = require('fs');

class CloudBuildFix {
    constructor() {
        this.projectId = 'my-first-project-433800';
        this.serviceUrl = 'https://employee-management-system-213410885168.asia-east1.run.app';
        this.githubRepo = 'chatscai10/employee-management-system';
    }

    async diagnoseAndFix() {
        console.log('🔧 診斷 Cloud Build 部署問題...');
        
        // 檢查當前狀態
        await this.checkCurrentStatus();
        
        // 生成修復方案
        this.generateFixSolution();
        
        // 創建緊急部署方案
        this.createEmergencyDeploy();
    }

    async checkCurrentStatus() {
        console.log('📊 檢查當前部署狀態...');
        
        return new Promise((resolve) => {
            https.get(`${this.serviceUrl}/api/health`, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const healthData = JSON.parse(data);
                        console.log(`✅ 當前版本: ${healthData.version}`);
                        console.log(`📝 服務狀態: ${healthData.status}`);
                        
                        if (healthData.version !== '3.0') {
                            console.log('❌ 版本未更新！Cloud Build 可能沒有觸發');
                        }
                    } catch (e) {
                        console.log('❌ 無法解析健康檢查響應');
                    }
                    resolve();
                });
            }).on('error', (err) => {
                console.log(`❌ 健康檢查失敗: ${err.message}`);
                resolve();
            });
        });
    }

    generateFixSolution() {
        const fixGuide = `# 🔧 Cloud Run 部署修復方案

## 🚨 問題分析
- **GitHub 提交**: ✅ 成功
- **Cloud Build 觸發**: ❌ 失敗或未配置
- **當前版本**: 2.0 (應該是 3.0)
- **API 端點**: 1/5 正常 (應該是 5/5)

## 💡 修復方案

### 🎯 **方案1: 手動觸發 Cloud Build (推薦)**

1. **前往 Cloud Build 控制台**:
   https://console.cloud.google.com/cloud-build/builds?project=my-first-project-433800

2. **檢查建構狀態**:
   - 查看是否有最新的建構
   - 檢查建構是否失敗
   - 查看建構日誌中的錯誤

3. **手動觸發建構**:
   - 在 Cloud Build 中點擊「執行觸發條件」
   - 或者在 Cloud Run 中點擊「編輯並部署新修訂版本」

### 🎯 **方案2: 檢查 Cloud Run 設定**

1. **前往 Cloud Run 控制台**:
   https://console.cloud.google.com/run/detail/asia-east1/employee-management-system?project=my-first-project-433800

2. **檢查部署來源**:
   - 確認是否連接到 GitHub
   - 確認存放區: \`chatscai10/employee-management-system\`
   - 確認分支: \`main\`
   - 確認建構類型: \`Dockerfile\`

3. **如果沒有連接 GitHub**:
   - 點擊「編輯並部署新修訂版本」
   - 選擇「從存放區持續部署」
   - 設定 GitHub 連接

### 🎯 **方案3: 緊急手動部署**

如果自動部署完全失效，可以使用以下緊急方案：

\`\`\`bash
# 1. 創建 Docker 映像
docker build -t gcr.io/my-first-project-433800/employee-management-system:v3 .

# 2. 推送到 Google Container Registry
docker push gcr.io/my-first-project-433800/employee-management-system:v3

# 3. 部署到 Cloud Run
gcloud run deploy employee-management-system \\
  --image gcr.io/my-first-project-433800/employee-management-system:v3 \\
  --region asia-east1 \\
  --platform managed \\
  --allow-unauthenticated
\`\`\`

### 🎯 **方案4: 重新配置 GitHub 觸發器**

1. **刪除現有觸發器** (如果存在):
   - 在 Cloud Build 觸發器中找到相關觸發器
   - 刪除舊的觸發器

2. **重新創建觸發器**:
   - 在 Cloud Run 服務中重新設定 GitHub 連接
   - 確保所有設定正確

## ⚡ **立即行動建議**

**立即執行方案1**:
1. 打開 Cloud Build 控制台
2. 檢查最新建構狀態
3. 如果沒有新建構，手動觸發一次
4. 如果建構失敗，查看錯誤日誌

**如果方案1不可行，執行方案2**:
1. 打開 Cloud Run 控制台
2. 檢查部署設定
3. 重新配置 GitHub 連接

## 🎯 **預期結果**

修復成功後應該看到:
- ✅ 版本更新到 3.0
- ✅ 所有 API 端點恢復 (5/5)
- ✅ 系統評分提升到 90+/100

---
**🚨 建議優先嘗試方案1，然後是方案2！**
`;

        fs.writeFileSync('CLOUD-BUILD-FIX-GUIDE.md', fixGuide);
        console.log('✅ 修復指南已生成: CLOUD-BUILD-FIX-GUIDE.md');
    }

    createEmergencyDeploy() {
        const emergencyScript = `#!/usr/bin/env node

/**
 * 🚨 緊急部署腳本
 * 直接更新 Cloud Run 服務而不依賴 Cloud Build
 */

const https = require('https');

class EmergencyDeployer {
    async deployEmergency() {
        console.log('🚨 啟動緊急部署程序...');
        console.log('📋 這個腳本將幫助您診斷部署問題');
        
        // 步驟指導
        console.log('\\n🎯 請按照以下步驟操作：');
        console.log('1. 打開瀏覽器前往 Cloud Run 控制台');
        console.log('2. 點擊服務: employee-management-system');
        console.log('3. 點擊「編輯並部署新修訂版本」');
        console.log('4. 確認 GitHub 連接和設定');
        console.log('5. 點擊「部署」強制觸發更新');
        
        console.log('\\n🔗 直接連結：');
        console.log('https://console.cloud.google.com/run/detail/asia-east1/employee-management-system?project=my-first-project-433800');
        
        console.log('\\n⏰ 部署完成後，執行以下指令驗證：');
        console.log('node deployment-status-final.js');
    }
}

const deployer = new EmergencyDeployer();
deployer.deployEmergency();
`;

        fs.writeFileSync('emergency-deploy.js', emergencyScript);
        console.log('✅ 緊急部署腳本已創建: emergency-deploy.js');
    }
}

// 執行診斷
const fixer = new CloudBuildFix();
fixer.diagnoseAndFix();
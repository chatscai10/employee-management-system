/**
 * 🚀 立即部署指導生成器
 * 為用戶提供清晰的部署步驟和選項
 */

const fs = require('fs');

class ImmediateDeploymentGuide {
    constructor() {
        this.deploymentOptions = [];
        this.currentStatus = {};
    }

    async generateImmediateDeploymentGuide() {
        console.log('🚀 生成立即部署指導...');
        console.log('═'.repeat(80));

        // 分析當前狀態
        await this.analyzeCurrentStatus();
        
        // 生成部署選項
        await this.generateDeploymentOptions();
        
        // 創建具體指導
        await this.createStepByStepGuide();
        
        // 顯示部署狀態
        this.displayDeploymentStatus();
        
        return {
            success: true,
            options: this.deploymentOptions.length,
            readyForLocalTest: this.currentStatus.dockerReady,
            readyForCloudDeploy: this.currentStatus.gcloudReady
        };
    }

    async analyzeCurrentStatus() {
        console.log('📊 分析當前部署狀態...');
        
        // 檢查Docker
        try {
            const { execSync } = require('child_process');
            execSync('docker --version', { stdio: 'pipe' });
            this.currentStatus.dockerReady = true;
            console.log('✅ Docker: 已安裝並可用');
        } catch (error) {
            this.currentStatus.dockerReady = false;
            console.log('❌ Docker: 未安裝或不可用');
        }

        // 檢查Google Cloud CLI
        try {
            const { execSync } = require('child_process');
            execSync('gcloud --version', { stdio: 'pipe' });
            this.currentStatus.gcloudReady = true;
            console.log('✅ Google Cloud CLI: 已安裝並可用');
        } catch (error) {
            this.currentStatus.gcloudReady = false;
            console.log('⚠️ Google Cloud CLI: 需要安裝');
        }

        // 檢查關鍵文件
        const keyFiles = ['app.js', 'package.json', 'Dockerfile'];
        this.currentStatus.filesReady = keyFiles.every(file => fs.existsSync(file));
        console.log(`📁 關鍵文件: ${this.currentStatus.filesReady ? '✅ 完整' : '❌ 缺失'}`);

        // 檢查依賴
        this.currentStatus.dependenciesReady = fs.existsSync('node_modules');
        console.log(`📦 依賴: ${this.currentStatus.dependenciesReady ? '✅ 已安裝' : '⚠️ 需要安裝'}`);
    }

    async generateDeploymentOptions() {
        console.log('🎯 生成部署選項...');

        // 選項1: 本地測試 (推薦開始)
        this.deploymentOptions.push({
            id: 1,
            name: '本地Docker測試',
            description: '在本地運行Docker容器進行測試',
            readiness: this.currentStatus.dockerReady ? 'ready' : 'needs_setup',
            steps: [
                'docker build -t employee-management-system:test .',
                'docker run -d --name emp-mgmt-test -p 8080:8080 employee-management-system:test',
                '打開瀏覽器訪問 http://localhost:8080',
                'docker stop emp-mgmt-test && docker rm emp-mgmt-test'
            ],
            estimatedTime: '5-10分鐘',
            difficulty: 'Easy'
        });

        // 選項2: Google Cloud部署 (生產就緒)
        this.deploymentOptions.push({
            id: 2,
            name: 'Google Cloud Run部署',
            description: '部署到Google Cloud Run生產環境',
            readiness: this.currentStatus.gcloudReady ? 'ready' : 'needs_gcloud',
            steps: [
                '安裝Google Cloud CLI',
                'gcloud auth login',
                'gcloud config set project complete-employee-management-436300',
                '執行 deploy-to-gcloud.bat',
                '驗證部署結果'
            ],
            estimatedTime: '15-30分鐘',
            difficulty: 'Medium'
        });

        // 選項3: 手動雲端部署
        this.deploymentOptions.push({
            id: 3,
            name: '手動雲端部署',
            description: '逐步手動執行雲端部署流程',
            readiness: this.currentStatus.gcloudReady ? 'ready' : 'needs_gcloud',
            steps: [
                'gcloud services enable run.googleapis.com cloudbuild.googleapis.com',
                'gcloud builds submit --tag gcr.io/complete-employee-management-436300/employee-management-system',
                'gcloud run deploy --image gcr.io/complete-employee-management-436300/employee-management-system --platform managed'
            ],
            estimatedTime: '20-40分鐘',
            difficulty: 'Advanced'
        });
    }

    async createStepByStepGuide() {
        console.log('📋 創建詳細部署指導...');

        const detailedGuide = `# 🚀 立即部署指導

## 當前系統狀態

| 組件 | 狀態 | 說明 |
|------|------|------|
| Docker | ${this.currentStatus.dockerReady ? '✅ 就緒' : '❌ 需安裝'} | ${this.currentStatus.dockerReady ? 'Docker已安裝並運行正常' : '需要安裝Docker Desktop'} |
| Google Cloud CLI | ${this.currentStatus.gcloudReady ? '✅ 就緒' : '⚠️ 需安裝'} | ${this.currentStatus.gcloudReady ? 'gcloud已安裝和配置' : '雲端部署需要安裝'} |
| 專案文件 | ${this.currentStatus.filesReady ? '✅ 完整' : '❌ 缺失'} | ${this.currentStatus.filesReady ? '所有必要文件存在' : '缺少關鍵檔案'} |
| 依賴套件 | ${this.currentStatus.dependenciesReady ? '✅ 已安裝' : '⚠️ 需安裝'} | ${this.currentStatus.dependenciesReady ? 'npm套件已安裝' : '執行npm install'} |

## 🎯 建議的部署順序

### 第一步: 本地測試 (強烈建議)
${this.currentStatus.dockerReady ? '**狀態**: ✅ 可立即執行' : '**狀態**: ❌ 需先安裝Docker'}

\`\`\`bash
# 快速本地測試
docker build -t employee-management-system:test .
docker run -d --name emp-mgmt-test -p 8080:8080 employee-management-system:test

# 測試應用程式
curl http://localhost:8080
# 或在瀏覽器打開 http://localhost:8080

# 清理測試環境
docker stop emp-mgmt-test
docker rm emp-mgmt-test
\`\`\`

### 第二步: 雲端部署
${this.currentStatus.gcloudReady ? '**狀態**: ✅ 可立即執行' : '**狀態**: ⚠️ 需先安裝Google Cloud CLI'}

#### 方案A: 自動部署 (推薦)
\`\`\`bash
# Windows用戶
deploy-to-gcloud.bat

# Linux/macOS用戶  
chmod +x deploy-to-gcloud.sh
./deploy-to-gcloud.sh
\`\`\`

#### 方案B: 手動逐步部署
\`\`\`bash
# 1. 認證和設定
gcloud auth login
gcloud config set project complete-employee-management-436300

# 2. 啟用服務
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 3. 部署應用
gcloud builds submit --config cloudbuild-optimized.yaml

# 4. 驗證部署
gcloud run services list
\`\`\`

## 📋 詳細部署選項

${this.deploymentOptions.map(option => `
### 選項${option.id}: ${option.name}
**描述**: ${option.description}  
**就緒狀態**: ${option.readiness}  
**預估時間**: ${option.estimatedTime}  
**難度**: ${option.difficulty}

**執行步驟**:
${option.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`).join('\n')}

## 🔧 Google Cloud CLI 安裝指導

如果尚未安裝Google Cloud CLI，請按照以下步驟：

### Windows
1. 前往: https://cloud.google.com/sdk/docs/install-sdk#windows
2. 下載並執行 GoogleCloudSDKInstaller.exe
3. 跟隨安裝精靈完成安裝
4. 重新啟動命令提示字元

### macOS
\`\`\`bash
# 使用Homebrew
brew install google-cloud-sdk

# 或下載安裝包
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
\`\`\`

### Linux
\`\`\`bash
# Ubuntu/Debian
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get update && sudo apt-get install google-cloud-sdk
\`\`\`

## 🚨 故障排除

### 常見問題和解決方案

1. **Docker構建失敗**
   - 確認Docker Desktop正在運行
   - 檢查Dockerfile語法
   - 確保有足夠的磁碟空間

2. **Google Cloud認證問題**
   - 執行 \`gcloud auth login\`
   - 確認專案ID正確
   - 檢查網路連接

3. **權限問題**
   - 確認Google Cloud專案權限
   - 檢查服務帳戶設定
   - 驗證API服務已啟用

## 📞 獲得幫助

如果遇到問題：
1. 查看詳細錯誤訊息
2. 檢查Google Cloud Console
3. 參考部署日誌
4. 聯繫技術支援團隊

## 🎉 部署成功確認

部署成功後，您將看到：
- Cloud Run服務URL
- 健康檢查端點回應正常
- 應用程式功能可正常使用

**預期的服務URL格式**:
\`https://employee-management-system-[隨機字串]-ew.a.run.app\`
`;

        fs.writeFileSync('IMMEDIATE-DEPLOYMENT-GUIDE.md', detailedGuide);
        console.log('✅ 詳細部署指導已創建: IMMEDIATE-DEPLOYMENT-GUIDE.md');
    }

    displayDeploymentStatus() {
        console.log('\n🎯 立即可執行的部署選項:');
        console.log('═'.repeat(60));

        this.deploymentOptions.forEach(option => {
            const status = option.readiness === 'ready' ? '🟢 可立即執行' : 
                          option.readiness === 'needs_setup' ? '🟡 需要設定' : '🔴 需要安裝';
            
            console.log(`${option.id}. ${option.name}`);
            console.log(`   狀態: ${status}`);
            console.log(`   時間: ${option.estimatedTime}`);
            console.log(`   難度: ${option.difficulty}`);
            console.log('');
        });

        // 提供立即建議
        if (this.currentStatus.dockerReady) {
            console.log('🚀 立即建議: 先執行本地Docker測試');
            console.log('   命令: docker build -t employee-management-system:test .');
            console.log('   然後: docker run -d --name emp-mgmt-test -p 8080:8080 employee-management-system:test');
        } else {
            console.log('📋 首要步驟: 安裝Docker Desktop');
            console.log('   下載: https://www.docker.com/products/docker-desktop');
        }

        if (!this.currentStatus.gcloudReady) {
            console.log('☁️ 雲端部署準備: 安裝Google Cloud CLI');
            console.log('   Windows: https://cloud.google.com/sdk/docs/install-sdk#windows');
            console.log('   或執行: simple-gcloud-install.bat');
        }

        console.log('\n📋 完整指導請參考: IMMEDIATE-DEPLOYMENT-GUIDE.md');
    }
}

// 執行立即部署指導
async function main() {
    const deploymentGuide = new ImmediateDeploymentGuide();
    
    try {
        const result = await deploymentGuide.generateImmediateDeploymentGuide();
        console.log('\n🎉 立即部署指導生成完成！');
        
    } catch (error) {
        console.error('❌ 部署指導生成失敗:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = ImmediateDeploymentGuide;
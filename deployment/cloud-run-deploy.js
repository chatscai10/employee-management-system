/**
 * Google Cloud Run 自動部署腳本
 * 企業員工管理系統部署到 Google Cloud Run
 */

const fs = require('fs');
const path = require('path');

class CloudRunDeploymentManager {
    constructor() {
        this.projectId = null;
        this.region = 'asia-east1';
        this.serviceName = 'employee-management-system';
        this.imageTag = 'latest';
        this.requiredFiles = [
            'Dockerfile',
            'package.json',
            'backend/gas-main.js',
            'frontend/index.html'
        ];
        
        this.initializeDeployment();
    }

    /**
     * 初始化部署配置
     */
    initializeDeployment() {
        console.log('🚀 Google Cloud Run 部署管理器初始化...');
        this.checkPrerequisites();
    }

    /**
     * 檢查部署前置條件
     */
    checkPrerequisites() {
        console.log('\n📋 檢查部署前置條件...');
        
        const missingRequirements = [];

        // 檢查必要檔案
        this.requiredFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            if (!fs.existsSync(filePath)) {
                missingRequirements.push(`缺失檔案: ${file}`);
            }
        });

        // 檢查環境變數
        const requiredEnvVars = [
            'GOOGLE_CLOUD_PROJECT',
            'TELEGRAM_BOT_TOKEN',
            'TELEGRAM_BOSS_GROUP',
            'TELEGRAM_EMPLOYEE_GROUP'
        ];

        requiredEnvVars.forEach(envVar => {
            if (!process.env[envVar]) {
                missingRequirements.push(`缺失環境變數: ${envVar}`);
            }
        });

        if (missingRequirements.length > 0) {
            console.log('❌ 部署前置條件檢查失敗:');
            missingRequirements.forEach(req => console.log(`  - ${req}`));
            this.showDeploymentGuide();
        } else {
            console.log('✅ 部署前置條件檢查通過');
            this.projectId = process.env.GOOGLE_CLOUD_PROJECT;
        }
    }

    /**
     * 顯示部署指導
     */
    showDeploymentGuide() {
        console.log('\n📖 Google Cloud Run 部署指導:');
        console.log('='.repeat(50));
        
        console.log('\n1. 安裝 Google Cloud CLI:');
        console.log('   https://cloud.google.com/sdk/docs/install');
        
        console.log('\n2. 安裝 Docker:');
        console.log('   https://docs.docker.com/get-docker/');
        
        console.log('\n3. 設定環境變數:');
        console.log('   export GOOGLE_CLOUD_PROJECT="your-project-id"');
        console.log('   export TELEGRAM_BOT_TOKEN="your-bot-token"');
        console.log('   export TELEGRAM_BOSS_GROUP="your-boss-group-id"');
        console.log('   export TELEGRAM_EMPLOYEE_GROUP="your-employee-group-id"');
        
        console.log('\n4. 創建必要檔案:');
        this.createRequiredFiles();
        
        console.log('\n5. 執行部署:');
        console.log('   node deployment/cloud-run-deploy.js');
    }

    /**
     * 創建必要的部署檔案
     */
    createRequiredFiles() {
        this.createDockerfile();
        this.createPackageJson();
        this.createAppYaml();
        this.createDockerIgnore();
        this.createCloudbuildYaml();
    }

    /**
     * 創建 Dockerfile
     */
    createDockerfile() {
        const dockerfileContent = `# 使用 Node.js 官方運行時作為基礎映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 安裝依賴
COPY package*.json ./
RUN npm ci --only=production

# 複製應用程式碼
COPY . .

# 創建非root用戶
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 設定檔案權限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 8080

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=8080

# 啟動應用
CMD ["node", "server.js"]
`;
        
        fs.writeFileSync('Dockerfile', dockerfileContent);
        console.log('✅ 已創建 Dockerfile');
    }

    /**
     * 創建 package.json (如果不存在)
     */
    createPackageJson() {
        if (fs.existsSync('package.json')) {
            console.log('✅ package.json 已存在');
            return;
        }

        const packageJson = {
            "name": "employee-management-system",
            "version": "1.0.0",
            "description": "企業員工管理系統",
            "main": "server.js",
            "scripts": {
                "start": "node server.js",
                "dev": "nodemon server.js",
                "test": "node tests/system-test.js",
                "deploy": "npm run build && gcloud run deploy",
                "build": "echo 'Building application...'",
                "postinstall": "echo 'Installation complete'"
            },
            "dependencies": {
                "express": "^4.18.2",
                "cors": "^2.8.5",
                "helmet": "^7.0.0",
                "compression": "^1.7.4",
                "morgan": "^1.10.0",
                "dotenv": "^16.3.1"
            },
            "devDependencies": {
                "nodemon": "^3.0.1"
            },
            "engines": {
                "node": ">=18.0.0"
            },
            "keywords": [
                "employee-management",
                "google-apps-script",
                "cloud-run",
                "enterprise"
            ],
            "author": "企業員工管理系統",
            "license": "MIT"
        };

        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ 已創建 package.json');
    }

    /**
     * 創建 server.js
     */
    createServerJs() {
        const serverContent = `/**
 * Google Cloud Run 伺服器
 * 為企業員工管理系統提供靜態檔案服務
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 安全性中間件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://script.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://script.google.com"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// 其他中間件
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    credentials: true
}));

// JSON 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 靜態檔案服務
app.use(express.static(path.join(__dirname, 'frontend')));

// API 路由
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// 系統配置 API
app.get('/api/config', (req, res) => {
    res.json({
        appName: '企業員工管理系統',
        version: process.env.npm_package_version || '1.0.0',
        gasWebAppUrl: process.env.GAS_WEB_APP_URL || '',
        telegramConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOSS_GROUP)
    });
});

// 代理 Google Apps Script 請求
app.post('/api/gas-proxy', async (req, res) => {
    try {
        const gasWebAppUrl = process.env.GAS_WEB_APP_URL;
        if (!gasWebAppUrl) {
            return res.status(500).json({ 
                success: false, 
                error: 'GAS_WEB_APP_URL not configured' 
            });
        }

        const response = await fetch(gasWebAppUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('GAS Proxy Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// SPA 路由處理
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// 錯誤處理中間件
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
    console.log(\`🚀 企業員工管理系統啟動在端口 \${PORT}\`);
    console.log(\`📱 Telegram Bot: \${process.env.TELEGRAM_BOT_TOKEN ? '已配置' : '未配置'}\`);
    console.log(\`🌐 Environment: \${process.env.NODE_ENV || 'development'}\`);
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，正在關閉伺服器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信號，正在關閉伺服器...');
    process.exit(0);
});
`;

        fs.writeFileSync('server.js', serverContent);
        console.log('✅ 已創建 server.js');
    }

    /**
     * 創建 .dockerignore
     */
    createDockerIgnore() {
        const dockerIgnoreContent = `# Node modules
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Git
.git
.gitignore

# Documentation
README.md
docs/

# Tests
tests/
*.test.js

# Development files
.env.local
.env.development
.vscode/
.idea/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

        fs.writeFileSync('.dockerignore', dockerIgnoreContent);
        console.log('✅ 已創建 .dockerignore');
    }

    /**
     * 創建 app.yaml (App Engine 備用)
     */
    createAppYaml() {
        const appYamlContent = `runtime: nodejs18

env_variables:
  NODE_ENV: production
  TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN || 'your-bot-token'}
  TELEGRAM_BOSS_GROUP: ${process.env.TELEGRAM_BOSS_GROUP || 'your-boss-group'}
  TELEGRAM_EMPLOYEE_GROUP: ${process.env.TELEGRAM_EMPLOYEE_GROUP || 'your-employee-group'}
  GAS_WEB_APP_URL: ${process.env.GAS_WEB_APP_URL || 'your-gas-web-app-url'}

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10

handlers:
- url: /.*
  script: auto
  secure: always
  redirect_http_response_code: 301
`;

        fs.writeFileSync('app.yaml', appYamlContent);
        console.log('✅ 已創建 app.yaml');
    }

    /**
     * 創建 Cloud Build 配置
     */
    createCloudbuildYaml() {
        const cloudbuildContent = `steps:
  # 構建 Docker 映像
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/${this.serviceName}:$COMMIT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/${this.serviceName}:latest'
      - '.'

  # 推送映像到 Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'push'
      - 'gcr.io/$PROJECT_ID/${this.serviceName}:$COMMIT_SHA'

  - name: 'gcr.io/cloud-builders/docker'
    args: 
      - 'push'
      - 'gcr.io/$PROJECT_ID/${this.serviceName}:latest'

  # 部署到 Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - '${this.serviceName}'
      - '--image'
      - 'gcr.io/$PROJECT_ID/${this.serviceName}:$COMMIT_SHA'
      - '--region'
      - '${this.region}'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
      - '--set-env-vars'
      - 'NODE_ENV=production,TELEGRAM_BOT_TOKEN=\${_TELEGRAM_BOT_TOKEN},TELEGRAM_BOSS_GROUP=\${_TELEGRAM_BOSS_GROUP},TELEGRAM_EMPLOYEE_GROUP=\${_TELEGRAM_EMPLOYEE_GROUP},GAS_WEB_APP_URL=\${_GAS_WEB_APP_URL}'
      - '--memory'
      - '512Mi'
      - '--cpu'
      - '1'
      - '--max-instances'
      - '10'
      - '--min-instances'
      - '0'
      - '--port'
      - '8080'

# 環境變數配置（需要在 Cloud Build 觸發器中設定）
substitutions:
  _TELEGRAM_BOT_TOKEN: 'your-bot-token'
  _TELEGRAM_BOSS_GROUP: 'your-boss-group'
  _TELEGRAM_EMPLOYEE_GROUP: 'your-employee-group'
  _GAS_WEB_APP_URL: 'your-gas-web-app-url'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_HIGHCPU_8'

timeout: '1200s'
`;

        fs.writeFileSync('cloudbuild.yaml', cloudbuildContent);
        console.log('✅ 已創建 cloudbuild.yaml');
    }

    /**
     * 執行自動部署
     */
    async executeDeployment() {
        if (!this.projectId) {
            console.log('❌ 項目ID未設定，無法執行部署');
            return false;
        }

        console.log('\n🚀 開始執行 Google Cloud Run 部署...');
        
        try {
            // 1. 創建伺服器檔案
            this.createServerJs();
            
            // 2. 構建 Docker 映像
            await this.buildDockerImage();
            
            // 3. 推送到 Container Registry
            await this.pushToRegistry();
            
            // 4. 部署到 Cloud Run
            await this.deployToCloudRun();
            
            console.log('\n✅ 部署完成！');
            this.showDeploymentInfo();
            
            return true;
        } catch (error) {
            console.error('\n❌ 部署失敗:', error.message);
            return false;
        }
    }

    /**
     * 構建 Docker 映像
     */
    async buildDockerImage() {
        console.log('\n📦 構建 Docker 映像...');
        
        const { exec } = require('child_process');
        const imageName = `gcr.io/${this.projectId}/${this.serviceName}:${this.imageTag}`;
        
        return new Promise((resolve, reject) => {
            exec(`docker build -t ${imageName} .`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Docker 構建失敗: ${error.message}`));
                } else {
                    console.log('✅ Docker 映像構建成功');
                    resolve();
                }
            });
        });
    }

    /**
     * 推送到 Container Registry
     */
    async pushToRegistry() {
        console.log('\n📤 推送映像到 Container Registry...');
        
        const { exec } = require('child_process');
        const imageName = `gcr.io/${this.projectId}/${this.serviceName}:${this.imageTag}`;
        
        return new Promise((resolve, reject) => {
            exec(`docker push ${imageName}`, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`映像推送失敗: ${error.message}`));
                } else {
                    console.log('✅ 映像推送成功');
                    resolve();
                }
            });
        });
    }

    /**
     * 部署到 Cloud Run
     */
    async deployToCloudRun() {
        console.log('\n🚀 部署到 Cloud Run...');
        
        const { exec } = require('child_process');
        const imageName = `gcr.io/${this.projectId}/${this.serviceName}:${this.imageTag}`;
        
        const deployCommand = `gcloud run deploy ${this.serviceName} \\
            --image ${imageName} \\
            --region ${this.region} \\
            --platform managed \\
            --allow-unauthenticated \\
            --set-env-vars "NODE_ENV=production,TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN},TELEGRAM_BOSS_GROUP=${process.env.TELEGRAM_BOSS_GROUP},TELEGRAM_EMPLOYEE_GROUP=${process.env.TELEGRAM_EMPLOYEE_GROUP},GAS_WEB_APP_URL=${process.env.GAS_WEB_APP_URL}" \\
            --memory 512Mi \\
            --cpu 1 \\
            --max-instances 10 \\
            --min-instances 0 \\
            --port 8080`;
        
        return new Promise((resolve, reject) => {
            exec(deployCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`Cloud Run 部署失敗: ${error.message}`));
                } else {
                    console.log('✅ Cloud Run 部署成功');
                    resolve(stdout);
                }
            });
        });
    }

    /**
     * 顯示部署資訊
     */
    showDeploymentInfo() {
        const serviceUrl = `https://${this.serviceName}-${this.region.replace('-', '')}-${this.projectId}.a.run.app`;
        
        console.log('\n🎉 部署資訊:');
        console.log('='.repeat(50));
        console.log(`📱 應用程式: 企業員工管理系統`);
        console.log(`🆔 項目ID: ${this.projectId}`);
        console.log(`🌍 區域: ${this.region}`);
        console.log(`🔗 服務URL: ${serviceUrl}`);
        console.log(`📊 健康檢查: ${serviceUrl}/api/health`);
        console.log(`⚙️ 系統配置: ${serviceUrl}/api/config`);
        
        console.log('\n📋 部署後續步驟:');
        console.log('1. 測試應用程式功能');
        console.log('2. 配置自訂網域（可選）');
        console.log('3. 設定 CI/CD 流水線');
        console.log('4. 監控和日誌分析');
        
        console.log('\n🔧 管理指令:');
        console.log(`gcloud run services list --region ${this.region}`);
        console.log(`gcloud run logs read ${this.serviceName} --region ${this.region}`);
        console.log(`gcloud run services update ${this.serviceName} --region ${this.region}`);
        console.log(`gcloud run services delete ${this.serviceName} --region ${this.region}`);
    }

    /**
     * 設定自動部署腳本
     */
    setupAutoDeploy() {
        const deployScript = `#!/bin/bash

# 企業員工管理系統自動部署腳本

set -e

echo "🚀 開始自動部署..."

# 檢查必要工具
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI 未安裝"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安裝"
    exit 1
fi

# 檢查環境變數
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "❌ GOOGLE_CLOUD_PROJECT 環境變數未設定"
    exit 1
fi

# 執行部署
echo "📦 構建應用程式..."
npm run build

echo "🐳 構建 Docker 映像..."
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/${this.serviceName}:latest .

echo "📤 推送映像..."
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/${this.serviceName}:latest

echo "🚀 部署到 Cloud Run..."
gcloud run deploy ${this.serviceName} \\
    --image gcr.io/$GOOGLE_CLOUD_PROJECT/${this.serviceName}:latest \\
    --region ${this.region} \\
    --platform managed \\
    --allow-unauthenticated

echo "✅ 部署完成！"
`;

        fs.writeFileSync('deploy.sh', deployScript);
        console.log('✅ 已創建自動部署腳本 deploy.sh');
        
        // 設定執行權限（Unix 系統）
        try {
            fs.chmodSync('deploy.sh', '755');
        } catch (error) {
            console.log('⚠️ 無法設定執行權限（Windows 系統）');
        }
    }

    /**
     * 創建環境配置範本
     */
    createEnvTemplate() {
        const envTemplate = `# 企業員工管理系統環境配置

# Google Cloud 項目設定
GOOGLE_CLOUD_PROJECT=your-project-id
GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Telegram 機器人設定
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOSS_GROUP=-1001234567890
TELEGRAM_EMPLOYEE_GROUP=-1001234567891

# 應用程式設定
NODE_ENV=production
PORT=8080
ALLOWED_ORIGINS=https://your-domain.com,https://your-app.a.run.app

# 安全性設定
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# 監控設定
GOOGLE_CLOUD_MONITORING=true
LOG_LEVEL=info
`;

        fs.writeFileSync('.env.template', envTemplate);
        console.log('✅ 已創建環境配置範本 .env.template');
    }

    /**
     * 顯示完整部署需求
     */
    showDeploymentRequirements() {
        console.log('\n📋 Google Cloud Run 部署完整需求清單:');
        console.log('='.repeat(60));
        
        console.log('\n🔧 必要工具:');
        console.log('  ✓ Google Cloud CLI (gcloud)');
        console.log('  ✓ Docker Desktop');
        console.log('  ✓ Node.js (v18+)');
        console.log('  ✓ Git');
        
        console.log('\n📁 必要檔案:');
        this.requiredFiles.forEach(file => {
            const exists = fs.existsSync(file);
            console.log(`  ${exists ? '✓' : '✗'} ${file}`);
        });
        
        console.log('\n🔑 必要資訊:');
        console.log('  • Google Cloud 項目 ID');
        console.log('  • Google Apps Script Web App URL');
        console.log('  • Telegram Bot Token');
        console.log('  • Telegram 群組 ID (老闆群組)');
        console.log('  • Telegram 群組 ID (員工群組)');
        
        console.log('\n💰 預估費用:');
        console.log('  • Cloud Run: 免費額度內 (前 200 萬請求/月)');
        console.log('  • Container Registry: ~$0.10/GB/月');
        console.log('  • Cloud Build: 免費額度內 (前 120 分鐘/天)');
        
        console.log('\n📊 性能規格:');
        console.log('  • CPU: 1 vCPU');
        console.log('  • Memory: 512 Mi');
        console.log('  • 最大實例: 10');
        console.log('  • 最小實例: 0 (冷啟動)');
        
        console.log('\n🔒 安全性功能:');
        console.log('  • HTTPS 強制');
        console.log('  • CSP 安全標頭');
        console.log('  • CORS 保護');
        console.log('  • 環境變數加密');
    }
}

// 主要執行函數
async function main() {
    console.log('🚀 企業員工管理系統 - Google Cloud Run 部署器');
    console.log('='.repeat(60));
    
    const deployManager = new CloudRunDeploymentManager();
    
    // 檢查命令行參數
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        deployManager.showDeploymentRequirements();
        return;
    }
    
    if (args.includes('--setup')) {
        console.log('\n📝 創建部署檔案...');
        deployManager.createRequiredFiles();
        deployManager.setupAutoDeploy();
        deployManager.createEnvTemplate();
        console.log('\n✅ 設定完成！請編輯 .env.template 並重新命名為 .env');
        return;
    }
    
    if (args.includes('--requirements')) {
        deployManager.showDeploymentRequirements();
        return;
    }
    
    if (args.includes('--deploy')) {
        const success = await deployManager.executeDeployment();
        process.exit(success ? 0 : 1);
    }
    
    // 預設顯示指導
    deployManager.showDeploymentGuide();
}

// 匯出類別
module.exports = CloudRunDeploymentManager;

// 如果直接執行此腳本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 部署器執行失敗:', error);
        process.exit(1);
    });
}
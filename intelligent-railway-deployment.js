// 🚂 智慧Railway自動部署執行器
// 使用Railway CLI自動化部署企業管理系統

const { execSync, spawn } = require('child_process');
const fs = require('fs');

class IntelligentRailwayDeployment {
    constructor() {
        this.projectId = null;
        this.deploymentUrl = null;
        this.deploymentStatus = 'pending';
        this.logs = [];
    }

    async executeRailwayDeployment() {
        console.log('🚂 開始Railway智慧自動部署');
        console.log('📋 目標: 企業管理系統v4.0.0自動上線');
        
        try {
            // 步驟1: 檢查Railway CLI
            await this.checkRailwayCLI();
            
            // 步驟2: 初始化Railway專案
            await this.initializeRailwayProject();
            
            // 步驟3: 配置部署環境
            await this.configureDeploymentEnvironment();
            
            // 步驟4: 執行部署
            await this.executeDeployment();
            
            // 步驟5: 監控部署狀態
            await this.monitorDeploymentStatus();
            
            // 步驟6: 驗證部署結果
            await this.verifyDeployment();
            
        } catch (error) {
            console.error('❌ Railway部署失敗:', error.message);
            this.handleDeploymentFailure(error);
        }
    }

    async checkRailwayCLI() {
        console.log('\n🔧 檢查Railway CLI狀態...');
        
        try {
            const version = execSync('railway --version', { encoding: 'utf8' });
            console.log(`✅ Railway CLI已安裝: ${version.trim()}`);
            
            // 檢查登入狀態
            try {
                const loginStatus = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
                console.log('✅ Railway已登入');
                this.logs.push({ step: 'cli_check', status: 'success', message: 'CLI ready' });
            } catch (loginError) {
                console.log('🔐 需要登入Railway...');
                await this.loginToRailway();
            }
            
        } catch (cliError) {
            throw new Error(`Railway CLI不可用: ${cliError.message}`);
        }
    }

    async loginToRailway() {
        console.log('🔑 執行Railway登入...');
        
        try {
            // 嘗試自動登入
            console.log('📱 請在瀏覽器中完成Railway登入...');
            execSync('railway login', { stdio: 'inherit' });
            
            console.log('✅ Railway登入成功');
            this.logs.push({ step: 'login', status: 'success', message: 'Login completed' });
            
        } catch (loginError) {
            console.log('⚠️  自動登入失敗，請手動登入:');
            console.log('   1. 執行: railway login');
            console.log('   2. 在瀏覽器中授權');
            console.log('   3. 重新運行此腳本');
            throw new Error('需要手動登入Railway');
        }
    }

    async initializeRailwayProject() {
        console.log('\n🏗️  初始化Railway專案...');
        
        try {
            // 檢查是否已存在Railway專案
            let projectExists = false;
            try {
                const projectInfo = execSync('railway status', { encoding: 'utf8', stdio: 'pipe' });
                if (projectInfo.includes('Project:')) {
                    console.log('✅ 發現現有Railway專案');
                    projectExists = true;
                }
            } catch (statusError) {
                // 專案不存在，需要創建
            }
            
            if (!projectExists) {
                console.log('🆕 創建新的Railway專案...');
                
                // 創建新專案
                const createOutput = execSync('railway init', { 
                    encoding: 'utf8',
                    input: 'employee-management-system\n' // 專案名稱
                });
                
                console.log('✅ Railway專案創建成功');
                this.logs.push({ step: 'project_init', status: 'success', message: 'Project created' });
            }
            
            // 獲取專案資訊
            const projectStatus = execSync('railway status', { encoding: 'utf8' });
            console.log('📊 專案狀態:');
            console.log(projectStatus);
            
        } catch (initError) {
            throw new Error(`Railway專案初始化失敗: ${initError.message}`);
        }
    }

    async configureDeploymentEnvironment() {
        console.log('\n⚙️  配置部署環境...');
        
        try {
            // 設定環境變數
            const envVars = [
                { key: 'NODE_ENV', value: 'production' },
                { key: 'PORT', value: '8080' }
            ];
            
            for (const envVar of envVars) {
                try {
                    execSync(`railway variables set ${envVar.key}=${envVar.value}`, { stdio: 'pipe' });
                    console.log(`✅ 環境變數設定: ${envVar.key}=${envVar.value}`);
                } catch (envError) {
                    console.log(`⚠️  環境變數設定失敗: ${envVar.key}`);
                }
            }
            
            // 確保package.json有正確的scripts
            this.ensurePackageJsonScripts();
            
            console.log('✅ 部署環境配置完成');
            this.logs.push({ step: 'env_config', status: 'success', message: 'Environment configured' });
            
        } catch (configError) {
            throw new Error(`環境配置失敗: ${configError.message}`);
        }
    }

    ensurePackageJsonScripts() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            
            // 確保有start script
            if (!packageJson.scripts) {
                packageJson.scripts = {};
            }
            
            if (!packageJson.scripts.start) {
                packageJson.scripts.start = 'node app.js';
                fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
                console.log('📝 已添加start script到package.json');
            }
            
        } catch (packageError) {
            console.log('⚠️  Package.json檢查失敗:', packageError.message);
        }
    }

    async executeDeployment() {
        console.log('\n🚀 開始執行部署...');
        
        try {
            console.log('📦 上傳代碼並構建...');
            
            // 執行部署
            const deployOutput = execSync('railway up --detach', { 
                encoding: 'utf8',
                timeout: 300000 // 5分鐘超時
            });
            
            console.log('✅ 代碼上傳完成');
            console.log('🏗️  Railway正在構建應用...');
            
            this.logs.push({ step: 'deployment_start', status: 'success', message: 'Code uploaded' });
            
        } catch (deployError) {
            throw new Error(`部署執行失敗: ${deployError.message}`);
        }
    }

    async monitorDeploymentStatus() {
        console.log('\n📊 監控部署狀態...');
        
        const maxWaitTime = 300; // 5分鐘
        const checkInterval = 15; // 15秒
        let waitTime = 0;
        
        while (waitTime < maxWaitTime) {
            try {
                console.log(`⏳ 檢查部署進度... (已等待 ${waitTime}秒)`);
                
                // 檢查服務狀態
                const serviceStatus = execSync('railway status', { encoding: 'utf8' });
                
                // 嘗試獲取部署URL
                try {
                    const urlOutput = execSync('railway domain', { encoding: 'utf8', stdio: 'pipe' });
                    if (urlOutput && urlOutput.includes('https://')) {
                        const urlMatch = urlOutput.match(/https:\/\/[^\s]+/);
                        if (urlMatch) {
                            this.deploymentUrl = urlMatch[0];
                            console.log(`🌍 部署URL: ${this.deploymentUrl}`);
                            break;
                        }
                    }
                } catch (urlError) {
                    // URL還未生成
                }
                
                await new Promise(resolve => setTimeout(resolve, checkInterval * 1000));
                waitTime += checkInterval;
                
            } catch (statusError) {
                console.log('⚠️  狀態檢查失敗:', statusError.message);
            }
        }
        
        if (!this.deploymentUrl) {
            // 嘗試直接生成domain
            try {
                console.log('🔗 生成Railway domain...');
                execSync('railway domain generate', { stdio: 'pipe' });
                
                const urlOutput = execSync('railway domain', { encoding: 'utf8' });
                const urlMatch = urlOutput.match(/https:\/\/[^\s]+/);
                if (urlMatch) {
                    this.deploymentUrl = urlMatch[0];
                    console.log(`🌍 生成的部署URL: ${this.deploymentUrl}`);
                }
            } catch (domainError) {
                console.log('⚠️  Domain生成失敗');
            }
        }
        
        if (this.deploymentUrl) {
            this.deploymentStatus = 'deployed';
            this.logs.push({ 
                step: 'deployment_complete', 
                status: 'success', 
                message: 'Deployment URL obtained',
                url: this.deploymentUrl 
            });
        } else {
            throw new Error('部署完成但無法獲取URL');
        }
    }

    async verifyDeployment() {
        console.log('\n✅ 驗證部署結果...');
        
        if (!this.deploymentUrl) {
            console.log('⚠️  沒有部署URL，跳過驗證');
            return;
        }
        
        // 等待服務完全啟動
        console.log('⏳ 等待服務啟動...');
        await new Promise(resolve => setTimeout(resolve, 30000)); // 等待30秒
        
        const verificationTests = [
            { name: '主頁載入', path: '/', expected: '企業管理系統' },
            { name: '健康檢查', path: '/health', expected: 'healthy' },
            { name: '系統API', path: '/api/system/status', expected: 'success' }
        ];
        
        let passedTests = 0;
        const testResults = [];
        
        for (const test of verificationTests) {
            try {
                console.log(`🧪 測試: ${test.name}...`);
                
                const response = await this.makeHttpRequest(this.deploymentUrl + test.path);
                
                if (response.includes(test.expected)) {
                    console.log(`✅ ${test.name}: 通過`);
                    passedTests++;
                    testResults.push({ ...test, status: 'passed' });
                } else {
                    console.log(`❌ ${test.name}: 失敗`);
                    testResults.push({ ...test, status: 'failed' });
                }
                
            } catch (testError) {
                console.log(`❌ ${test.name}: 錯誤 - ${testError.message}`);
                testResults.push({ ...test, status: 'error', error: testError.message });
            }
            
            // 避免請求過於頻繁
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log(`\n📊 驗證結果: ${passedTests}/${verificationTests.length} 測試通過`);
        
        if (passedTests === verificationTests.length) {
            console.log('🎉 部署驗證完全成功！');
            this.deploymentStatus = 'verified';
        } else if (passedTests > 0) {
            console.log('⚠️  部分功能正常，需要進一步檢查');
            this.deploymentStatus = 'partial';
        } else {
            console.log('❌ 所有驗證測試失敗');
            this.deploymentStatus = 'failed';
        }
        
        this.logs.push({ 
            step: 'verification', 
            status: this.deploymentStatus,
            passedTests: passedTests,
            totalTests: verificationTests.length,
            results: testResults
        });
    }

    makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            const https = require('https');
            const http = require('http');
            
            const protocol = url.startsWith('https') ? https : http;
            
            const request = protocol.get(url, { timeout: 15000 }, (response) => {
                let data = '';
                
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
        });
    }

    handleDeploymentFailure(error) {
        console.log('\n🔧 處理部署失敗...');
        
        // 記錄錯誤
        this.logs.push({
            step: 'deployment_error',
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        // 提供解決方案
        console.log('💡 建議的解決步驟:');
        console.log('1. 檢查Railway帳號狀態和權限');
        console.log('2. 確認代碼沒有語法錯誤');
        console.log('3. 檢查package.json配置');
        console.log('4. 查看Railway控制台的詳細日誌');
        console.log('5. 嘗試手動在Railway網頁控制台部署');
        
        // 保存錯誤日誌
        this.generateErrorReport();
    }

    generateFinalReport() {
        console.log('\n📊 生成Railway部署報告...');
        
        const report = {
            deploymentSummary: {
                platform: 'Railway',
                projectName: 'employee-management-system',
                version: 'v4.0.0',
                deploymentTime: new Date().toISOString(),
                status: this.deploymentStatus,
                url: this.deploymentUrl
            },
            deploymentLogs: this.logs,
            testAccounts: [
                { role: 'admin', username: 'admin', password: 'admin123' },
                { role: 'manager', username: 'manager', password: 'manager123' },
                { role: 'employee', username: 'john.doe', password: 'password123' }
            ],
            nextSteps: this.generateNextSteps()
        };
        
        // 保存報告
        const reportFile = `railway-deployment-report-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        // 顯示摘要
        console.log('\n🎯 Railway部署完成摘要:');
        console.log(`📊 部署狀態: ${this.deploymentStatus.toUpperCase()}`);
        
        if (this.deploymentUrl) {
            console.log(`🌍 實際網址: ${this.deploymentUrl}`);
            console.log('\n🔐 測試帳號:');
            console.log('   👑 管理員: admin / admin123');
            console.log('   👔 經理: manager / manager123');
            console.log('   👤 員工: john.doe / password123');
        }
        
        console.log(`📄 詳細報告: ${reportFile}`);
        
        return report;
    }

    generateNextSteps() {
        const steps = [];
        
        if (this.deploymentStatus === 'verified') {
            steps.push('✅ 部署成功 - 開始使用企業管理系統');
            steps.push('監控系統性能和用戶反饋');
            steps.push('考慮設置自定義域名');
        } else if (this.deploymentStatus === 'partial') {
            steps.push('檢查失敗的功能測試');
            steps.push('查看Railway控制台日誌');
            steps.push('修復問題後重新部署');
        } else {
            steps.push('查看Railway控制台的詳細錯誤日誌');
            steps.push('檢查代碼和配置文件');
            steps.push('嘗試手動部署或聯繫技術支持');
        }
        
        return steps;
    }

    generateErrorReport() {
        const errorReport = {
            error: 'Railway deployment failed',
            timestamp: new Date().toISOString(),
            logs: this.logs,
            suggestions: [
                'Check Railway account status',
                'Verify code syntax and configuration',
                'Review Railway console logs',
                'Try manual deployment via Railway web interface'
            ]
        };
        
        fs.writeFileSync(`railway-error-${Date.now()}.json`, JSON.stringify(errorReport, null, 2));
        console.log('📄 錯誤報告已保存');
    }
}

// 執行Railway部署
async function deployToRailway() {
    const deployer = new IntelligentRailwayDeployment();
    await deployer.executeRailwayDeployment();
    return deployer.generateFinalReport();
}

// 如果直接執行此檔案
if (require.main === module) {
    deployToRailway().catch(console.error);
}

module.exports = { IntelligentRailwayDeployment, deployToRailway };
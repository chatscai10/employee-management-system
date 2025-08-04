// 🔧 智能部署修復程序 - 確保 v4.0.0 系統正確部署
// 分析部署問題並提供解決方案

const https = require('https');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class IntelligentDeploymentFix {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.projectId = '員工管理系統-d8b3e';
        this.serviceName = 'employee-management-system';
        this.region = 'europe-west1';
    }

    async checkCurrentDeployment() {
        console.log('🔍 檢查當前部署狀態...');
        
        try {
            const healthCheck = await this.makeRequest('/health');
            console.log(`📊 服務回應: ${JSON.stringify(healthCheck, null, 2)}`);
            
            if (healthCheck.body) {
                const data = JSON.parse(healthCheck.body);
                console.log(`🎯 當前版本: ${data.version || '未知'}`);
                console.log(`📅 時間戳: ${data.timestamp || '未知'}`);
                
                if (data.version === '4.0.0') {
                    console.log('✅ v4.0.0 系統已正確部署！');
                    return { success: true, version: '4.0.0' };
                } else {
                    console.log(`❌ 錯誤版本 ${data.version}，應該是 v4.0.0`);
                    return { success: false, currentVersion: data.version, expectedVersion: '4.0.0' };
                }
            }
        } catch (error) {
            console.log(`❌ 健康檢查失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async analyzeAppFile() {
        console.log('📄 分析 app.js 檔案內容...');
        
        try {
            const appContent = await fs.readFile('app.js', 'utf8');
            
            // 檢查版本標識
            const hasV4Version = appContent.includes('v4.0.0') || appContent.includes('4.0.0');
            const hasEnterpriseSystem = appContent.includes('完整企業管理系統伺服器');
            const hasAuthLogin = appContent.includes('/api/auth/login');
            const hasEmployeesAPI = appContent.includes('/api/employees');
            
            console.log(`📊 app.js 分析結果:`);
            console.log(`   ✅ v4.0.0 版本標識: ${hasV4Version ? '存在' : '缺失'}`);
            console.log(`   ✅ 企業系統標識: ${hasEnterpriseSystem ? '存在' : '缺失'}`);
            console.log(`   ✅ 身份驗證API: ${hasAuthLogin ? '存在' : '缺失'}`);
            console.log(`   ✅ 員工管理API: ${hasEmployeesAPI ? '存在' : '缺失'}`);
            
            const isV4System = hasV4Version && hasEnterpriseSystem && hasAuthLogin && hasEmployeesAPI;
            
            return {
                isV4System,
                hasV4Version,
                hasEnterpriseSystem,
                hasAuthLogin,
                hasEmployeesAPI,
                fileSize: appContent.length
            };
            
        } catch (error) {
            console.log(`❌ 檔案分析失敗: ${error.message}`);
            return { error: error.message };
        }
    }

    async checkDockerfile() {
        console.log('🐳 檢查 Dockerfile 配置...');
        
        try {
            const dockerContent = await fs.readFile('Dockerfile', 'utf8');
            
            const hasCorrectNode = dockerContent.includes('node:18-alpine');
            const hasHealthCheck = dockerContent.includes('HEALTHCHECK');
            const hasCorrectPort = dockerContent.includes('EXPOSE 8080');
            const hasAppCopy = dockerContent.includes('app.js');
            
            console.log(`🐳 Dockerfile 分析結果:`);
            console.log(`   ✅ Node.js 18: ${hasCorrectNode ? '正確' : '問題'}`);
            console.log(`   ✅ 健康檢查: ${hasHealthCheck ? '存在' : '缺失'}`);
            console.log(`   ✅ 正確端口: ${hasCorrectPort ? '8080' : '問題'}`);
            console.log(`   ✅ app.js 複製: ${hasAppCopy ? '存在' : '缺失'}`);
            
            return {
                isCorrect: hasCorrectNode && hasHealthCheck && hasCorrectPort && hasAppCopy,
                hasCorrectNode,
                hasHealthCheck,
                hasCorrectPort,
                hasAppCopy
            };
            
        } catch (error) {
            console.log(`❌ Dockerfile 檢查失敗: ${error.message}`);
            return { error: error.message };
        }
    }

    async makeRequest(path) {
        return new Promise((resolve) => {
            const url = this.serviceUrl + path;
            
            const req = https.request(url, { method: 'GET', timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            });

            req.on('error', (error) => {
                resolve({ error: error.message });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ error: 'timeout' });
            });

            req.end();
        });
    }

    async generateFixStrategy(deploymentCheck, appAnalysis, dockerAnalysis) {
        console.log('\\n🧠 分析問題並生成修復策略...');
        
        const issues = [];
        const solutions = [];
        
        // 檢查部署問題
        if (!deploymentCheck.success) {
            if (deploymentCheck.currentVersion && deploymentCheck.currentVersion !== '4.0.0') {
                issues.push(`部署版本錯誤: ${deploymentCheck.currentVersion} 而非 v4.0.0`);
                solutions.push('強制重新構建和部署新版本');
            }
            if (deploymentCheck.error) {
                issues.push(`服務連線問題: ${deploymentCheck.error}`);
                solutions.push('檢查 Google Cloud Run 服務狀態');
            }
        }
        
        // 檢查應用程式問題
        if (appAnalysis.error) {
            issues.push(`app.js 檔案問題: ${appAnalysis.error}`);
            solutions.push('修復 app.js 檔案內容');
        } else if (!appAnalysis.isV4System) {
            issues.push('app.js 不是完整的 v4.0.0 企業系統');
            solutions.push('替換為完整的企業管理系統程式碼');
        }
        
        // 檢查 Docker 問題
        if (dockerAnalysis.error) {
            issues.push(`Dockerfile 問題: ${dockerAnalysis.error}`);
            solutions.push('修復 Dockerfile 配置');
        } else if (!dockerAnalysis.isCorrect) {
            issues.push('Dockerfile 配置不完整');
            solutions.push('更新 Dockerfile 指向正確的應用程式檔案');
        }
        
        return {
            issues,
            solutions,
            priority: issues.length > 0 ? 'HIGH' : 'NONE',
            recommendation: this.getRecommendation(issues, solutions)
        };
    }

    getRecommendation(issues, solutions) {
        if (issues.length === 0) {
            return '✅ 系統狀態良好，無需修復';
        }
        
        const recommendations = [
            '🔧 建議的修復步驟:',
            '1. 確認 app.js 包含完整的 v4.0.0 企業系統程式碼',
            '2. 檢查 Dockerfile 正確指向 app.js',
            '3. 強制重新構建 Docker 映像',
            '4. 部署新版本到 Google Cloud Run',
            '5. 驗證部署成功和功能正常',
            '',
            '⚡ 快速修復命令:',
            'git add . && git commit -m "強制更新 v4.0.0" && git push',
            '',
            '🎯 或使用智能修復腳本:',
            'node intelligent-deployment-fix.js --fix'
        ];
        
        return recommendations.join('\\n');
    }

    async executeAutoFix() {
        console.log('🔧 執行自動修復程序...');
        
        try {
            // 檢查 Git 狀態
            console.log('📝 檢查 Git 狀態...');
            const gitStatus = await execPromise('git status --porcelain');
            
            if (gitStatus.stdout.trim()) {
                console.log('📤 提交待處理的變更...');
                await execPromise('git add .');
                await execPromise('git commit -m "🚀 自動修復: 強制部署 v4.0.0 企業系統"');
            }
            
            console.log('🚀 觸發重新部署...');
            await execPromise('git push origin main');
            
            console.log('✅ 自動修復程序完成！');
            console.log('⏰ 請等待 5-10 分鐘讓 Google Cloud Build 完成部署');
            
            return { success: true, message: '自動修復程序完成' };
            
        } catch (error) {
            console.log(`❌ 自動修復失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async generateReport() {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            title: '🔧 智能部署修復分析報告',
            
            deploymentCheck: await this.checkCurrentDeployment(),
            appAnalysis: await this.analyzeAppFile(),
            dockerAnalysis: await this.checkDockerfile()
        };
        
        const fixStrategy = await this.generateFixStrategy(
            report.deploymentCheck,
            report.appAnalysis,
            report.dockerAnalysis
        );
        
        report.fixStrategy = fixStrategy;
        
        // 保存報告
        const filename = `deployment-fix-analysis-${timestamp.replace(/[:.]/g, '-')}.json`;
        await fs.writeFile(filename, JSON.stringify(report, null, 2));
        console.log(`\\n📄 分析報告已保存: ${filename}`);
        
        // 顯示摘要
        console.log('\\n📊 部署修復分析摘要:');
        console.log('═'.repeat(50));
        console.log(`🎯 當前部署狀態: ${report.deploymentCheck.success ? '✅ 成功' : '❌ 問題'}`);
        console.log(`📄 app.js 狀態: ${report.appAnalysis.isV4System ? '✅ v4.0.0' : '❌ 問題'}`);
        console.log(`🐳 Dockerfile 狀態: ${report.dockerAnalysis.isCorrect ? '✅ 正確' : '❌ 問題'}`);
        console.log(`🔧 修復優先級: ${fixStrategy.priority}`);
        console.log(`\\n${fixStrategy.recommendation}`);
        
        return report;
    }

    async run() {
        console.log('🔧 智能部署修復程序 v1.0');
        console.log('═'.repeat(50));
        console.log(`🎯 目標服務: ${this.serviceUrl}`);
        console.log(`📅 執行時間: ${new Date().toLocaleString('zh-TW')}`);
        
        try {
            const report = await this.generateReport();
            
            // 檢查是否需要自動修復
            if (report.fixStrategy.priority === 'HIGH' && process.argv.includes('--fix')) {
                console.log('\\n🚀 啟動自動修復...');
                const fixResult = await this.executeAutoFix();
                report.autoFixResult = fixResult;
            }
            
            return report;
            
        } catch (error) {
            console.error('❌ 智能修復程序執行錯誤:', error);
            return { error: error.message };
        }
    }
}

// 執行智能部署修復
async function main() {
    const fixer = new IntelligentDeploymentFix();
    const result = await fixer.run();
    
    if (result.error) {
        process.exit(1);
    } else if (result.fixStrategy && result.fixStrategy.priority === 'HIGH') {
        console.log('\\n⚠️ 檢測到部署問題，建議執行修復');
        console.log('🔧 執行修復: node intelligent-deployment-fix.js --fix');
        process.exit(2);
    } else {
        console.log('\\n✅ 部署狀態正常！');
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}

module.exports = IntelligentDeploymentFix;
// 🚀 終極部署強制執行器 - 確保 v4.0.0 系統成功部署
// 使用多重策略確保 Google Cloud Run 正確更新

const https = require('https');
const fs = require('fs').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class UltimateDeploymentEnforcer {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.projectId = '員工管理系統-d8b3e';
        this.serviceName = 'employee-management-system';
        this.region = 'europe-west1';
        this.maxRetries = 3;
        this.strategies = [
            'forceGitPush',
            'createUniqueTag',
            'modifyAppForceUpdate',
            'directCloudBuild'
        ];
    }

    async checkDeploymentStatus() {
        console.log('🔍 檢查當前部署狀態...');
        try {
            const response = await this.makeRequest('/health');
            if (response.body) {
                const data = JSON.parse(response.body);
                console.log(`📊 當前版本: ${data.version}`);
                console.log(`📅 時間戳: ${data.timestamp}`);
                return {
                    success: true,
                    version: data.version,
                    timestamp: data.timestamp,
                    isV4: data.version === '4.0.0'
                };
            }
        } catch (error) {
            console.log(`❌ 狀態檢查失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async makeRequest(path) {
        return new Promise((resolve, reject) => {
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

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    async strategy1_forceGitPush() {
        console.log('\\n🚀 策略1: 強制 Git 推送觸發重新部署');
        try {
            // 創建一個微小變更來觸發重新部署
            const timestamp = new Date().toISOString();
            const deployTrigger = `// 🚀 部署觸發器 - ${timestamp}\\n`;
            
            // 在 app.js 開頭添加觸發器註解
            const appContent = await fs.readFile('app.js', 'utf8');
            const updatedContent = deployTrigger + appContent;
            await fs.writeFile('app.js', updatedContent);
            
            console.log('📝 添加部署觸發器到 app.js');
            
            // Git 操作
            await execPromise('git add app.js');
            await execPromise(`git commit -m "🚀 終極部署觸發: v4.0.0 企業系統強制更新 - ${timestamp}"`);
            await execPromise('git push origin main');
            
            console.log('✅ 策略1完成: Git 推送觸發部署');
            return { success: true, strategy: 'forceGitPush' };
            
        } catch (error) {
            console.log(`❌ 策略1失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async strategy2_createUniqueTag() {
        console.log('\\n🏷️ 策略2: 創建唯一標籤觸發部署');
        try {
            const tagName = `v4.0.0-deploy-${Date.now()}`;
            
            await execPromise(`git tag -a ${tagName} -m "🚀 強制部署 v4.0.0 企業系統"`);
            await execPromise(`git push origin ${tagName}`);
            
            console.log(`✅ 策略2完成: 創建標籤 ${tagName}`);
            return { success: true, strategy: 'createUniqueTag', tag: tagName };
            
        } catch (error) {
            console.log(`❌ 策略2失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async strategy3_modifyAppForceUpdate() {
        console.log('\\n🔧 策略3: 修改應用程式強制更新');
        try {
            // 在 health 端點中添加強制更新標識
            let appContent = await fs.readFile('app.js', 'utf8');
            
            // 替換 health endpoint 中的版本
            const forceUpdateTimestamp = Date.now();
            appContent = appContent.replace(
                /"version": "4.0.0"/g,
                `"version": "4.0.0", "forceUpdate": ${forceUpdateTimestamp}`
            );
            
            await fs.writeFile('app.js', appContent);
            
            await execPromise('git add app.js');
            await execPromise(`git commit -m "🔧 強制更新標識: ${forceUpdateTimestamp}"`);
            await execPromise('git push origin main');
            
            console.log(`✅ 策略3完成: 添加強制更新標識 ${forceUpdateTimestamp}`);
            return { success: true, strategy: 'modifyAppForceUpdate', timestamp: forceUpdateTimestamp };
            
        } catch (error) {
            console.log(`❌ 策略3失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async strategy4_directCloudBuild() {
        console.log('\\n🏗️ 策略4: 直接觸發 Cloud Build');
        try {
            // 修改 cloudbuild.yaml 添加強制重建標誌
            let buildConfig = await fs.readFile('cloudbuild.yaml', 'utf8');
            const buildId = Date.now();
            
            // 在構建步驟中添加唯一標識
            buildConfig = buildConfig.replace(
                'timeout: \'1200s\'',
                `timeout: '1200s'\\n# Force rebuild: ${buildId}`
            );
            
            await fs.writeFile('cloudbuild.yaml', buildConfig);
            
            await execPromise('git add cloudbuild.yaml');
            await execPromise(`git commit -m "🏗️ 強制 Cloud Build 重建: ${buildId}"`);
            await execPromise('git push origin main');
            
            console.log(`✅ 策略4完成: 觸發 Cloud Build ${buildId}`);
            return { success: true, strategy: 'directCloudBuild', buildId };
            
        } catch (error) {
            console.log(`❌ 策略4失敗: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async waitAndVerify(waitTime = 300000) { // 5 minutes
        console.log(`\\n⏰ 等待 ${waitTime/1000} 秒讓部署完成...`);
        
        return new Promise(resolve => {
            setTimeout(async () => {
                console.log('🔍 驗證部署結果...');
                const status = await this.checkDeploymentStatus();
                resolve(status);
            }, waitTime);
        });
    }

    async executeUltimateDeployment() {
        console.log('🚀 終極部署強制執行器啟動');
        console.log('═'.repeat(60));
        
        // 初始狀態檢查
        const initialStatus = await this.checkDeploymentStatus();
        console.log(`\\n📊 初始狀態: ${initialStatus.version || '未知'}`);
        
        if (initialStatus.isV4) {
            console.log('✅ 系統已經是 v4.0.0，無需修復');
            return { success: true, message: '系統已是 v4.0.0' };
        }
        
        console.log('🎯 需要強制部署 v4.0.0 系統');
        
        // 執行所有策略
        const results = [];
        
        for (let i = 0; i < this.strategies.length; i++) {
            const strategyName = this.strategies[i];
            console.log(`\\n📍 執行策略 ${i+1}/${this.strategies.length}: ${strategyName}`);
            
            let result;
            switch (strategyName) {
                case 'forceGitPush':
                    result = await this.strategy1_forceGitPush();
                    break;
                case 'createUniqueTag':
                    result = await this.strategy2_createUniqueTag();
                    break;
                case 'modifyAppForceUpdate':
                    result = await this.strategy3_modifyAppForceUpdate();
                    break;
                case 'directCloudBuild':
                    result = await this.strategy4_directCloudBuild();
                    break;
            }
            
            results.push({ strategy: strategyName, result });
            
            if (result.success) {
                console.log(`✅ 策略 ${strategyName} 執行成功`);
            } else {
                console.log(`❌ 策略 ${strategyName} 執行失敗`);
            }
        }
        
        // 等待部署完成
        console.log('\\n⏰ 所有策略執行完畢，等待部署完成...');
        const finalStatus = await this.waitAndVerify();
        
        // 生成最終報告
        const report = {
            timestamp: new Date().toISOString(),
            initialStatus,
            finalStatus,
            strategiesExecuted: results,
            deploymentSuccess: finalStatus.isV4,
            summary: finalStatus.isV4 ? 
                '🎉 終極部署成功！v4.0.0 系統已上線' : 
                '⚠️ 部署仍在進行中，建議繼續等待或檢查 Google Cloud Console'
        };
        
        // 保存報告
        const filename = `ultimate-deployment-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        await fs.writeFile(filename, JSON.stringify(report, null, 2));
        
        console.log('\\n📊 終極部署執行結果:');
        console.log('═'.repeat(60));
        console.log(`🎯 初始版本: ${initialStatus.version || '未知'}`);
        console.log(`🚀 最終版本: ${finalStatus.version || '未知'}`);
        console.log(`📈 部署成功: ${finalStatus.isV4 ? '✅ 是' : '❌ 否'}`);
        console.log(`📄 詳細報告: ${filename}`);
        console.log(`\\n${report.summary}`);
        
        return report;
    }
}

// 執行終極部署
async function main() {
    const enforcer = new UltimateDeploymentEnforcer();
    
    try {
        const result = await enforcer.executeUltimateDeployment();
        
        if (result.deploymentSuccess) {
            console.log('\\n🎊 終極部署任務完成！');
            process.exit(0);
        } else {
            console.log('\\n⚠️ 部署仍在進行中，請繼續監控');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 終極部署執行錯誤:', error);
        process.exit(2);
    }
}

if (require.main === module) {
    main();
}

module.exports = UltimateDeploymentEnforcer;
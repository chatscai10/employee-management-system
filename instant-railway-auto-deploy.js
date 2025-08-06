// 🚀 即時Railway自動部署執行器
// 立即獲取企業管理系統真實網址

const { execSync } = require('child_process');
const fs = require('fs');

class InstantRailwayAutoDeploy {
    constructor() {
        this.deploymentUrl = null;
        this.deploymentId = null;
        this.deploymentStatus = 'starting';
    }

    async executeImmediateDeployment() {
        console.log('🚀 立即執行Railway自動部署');
        console.log('🎯 目標: 60秒內獲取企業管理系統真實網址');
        
        try {
            console.log('\n⚡ 步驟 1: 檢查Railway CLI狀態...');
            
            // 檢查Railway CLI
            try {
                const version = execSync('railway version', { encoding: 'utf8', timeout: 5000 });
                console.log(`✅ Railway CLI: ${version.trim()}`);
            } catch (cliError) {
                console.log('❌ Railway CLI不可用，切換到手動部署模式');
                return this.provideManualDeploymentInstructions();
            }
            
            console.log('\n🔑 步驟 2: 嘗試Railway登入...');
            
            // 檢查登入狀態
            try {
                execSync('railway whoami', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
                console.log('✅ Railway已登入');
            } catch (loginError) {
                console.log('🔐 需要登入Railway，啟動瀏覽器登入...');
                try {
                    // 非阻塞登入嘗試
                    execSync('railway login --browser', { timeout: 10000 });
                    console.log('✅ Railway登入完成');
                } catch (autoLoginError) {
                    console.log('⚠️  自動登入失敗，提供手動方案');
                    return this.provideManualDeploymentInstructions();
                }
            }
            
            console.log('\n🏗️  步驟 3: 創建Railway專案...');
            
            // 初始化專案
            try {
                const initOutput = execSync('railway init --name employee-management-system', { 
                    encoding: 'utf8',
                    timeout: 15000
                });
                console.log('✅ Railway專案創建成功');
            } catch (initError) {
                console.log('⚠️  專案可能已存在，繼續部署...');
            }
            
            console.log('\n🚀 步驟 4: 執行立即部署...');
            
            // 部署應用
            const deployOutput = execSync('railway up --detach', {
                encoding: 'utf8',
                timeout: 30000
            });
            
            console.log('✅ 代碼已上傳，Railway正在構建...');
            
            // 等待並獲取URL
            await this.waitForDeploymentUrl();
            
            if (this.deploymentUrl) {
                console.log(`\n🎉 部署成功！網址: ${this.deploymentUrl}`);
                return this.deploymentUrl;
            } else {
                throw new Error('部署完成但無法獲取URL');
            }
            
        } catch (error) {
            console.error('❌ 自動部署失敗:', error.message);
            return this.provideManualDeploymentInstructions();
        }
    }

    async waitForDeploymentUrl() {
        console.log('\n⏳ 等待部署完成並獲取網址...');
        
        const maxWait = 120; // 2分鐘最大等待
        const interval = 10; // 10秒檢查間隔
        let waitTime = 0;
        
        while (waitTime < maxWait && !this.deploymentUrl) {
            try {
                console.log(`   檢查部署狀態... (已等待 ${waitTime}秒)`);
                
                // 嘗試獲取domain
                const domainOutput = execSync('railway domain', { 
                    encoding: 'utf8', 
                    timeout: 10000,
                    stdio: 'pipe' 
                });
                
                const urlMatch = domainOutput.match(/https:\/\/[^\s\n]+/);
                if (urlMatch) {
                    this.deploymentUrl = urlMatch[0].trim();
                    console.log(`🌍 獲得網址: ${this.deploymentUrl}`);
                    break;
                }
                
            } catch (checkError) {
                // 如果還沒有domain，嘗試生成一個
                if (waitTime > 30) {
                    try {
                        console.log('   正在生成Railway domain...');
                        execSync('railway domain generate', { timeout: 10000, stdio: 'pipe' });
                    } catch (genError) {
                        // 忽略生成錯誤
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
            waitTime += interval;
        }
        
        // 最後一次嘗試
        if (!this.deploymentUrl) {
            try {
                const finalCheck = execSync('railway status', { encoding: 'utf8', timeout: 5000 });
                console.log('最終狀態檢查:', finalCheck.substring(0, 200));
            } catch (finalError) {
                console.log('⚠️  無法獲取最終狀態');
            }
        }
    }

    provideManualDeploymentInstructions() {
        console.log('\n📋 立即手動部署指引 (5分鐘完成):');
        
        const instructions = {
            method1_railway: {
                name: 'Railway (推薦)',
                url: 'https://railway.app',
                steps: [
                    '1. 前往 https://railway.app',
                    '2. 點擊 "Login" 使用GitHub登入',
                    '3. 點擊 "New Project" -> "Deploy from GitHub repo"',
                    '4. 搜尋並選擇您的企業管理系統倉庫',
                    '5. Railway自動檢測Node.js並開始部署',
                    '6. 等待2-3分鐘，獲得 https://xxx.up.railway.app 網址'
                ],
                estimatedTime: '5分鐘'
            },
            method2_vercel: {
                name: 'Vercel (極速)',
                url: 'https://vercel.com',
                steps: [
                    '1. 前往 https://vercel.com',
                    '2. 使用GitHub帳號登入',
                    '3. 點擊 "New Project"',
                    '4. 導入您的GitHub倉庫',
                    '5. Vercel自動部署，獲得 https://xxx.vercel.app 網址'
                ],
                estimatedTime: '3分鐘'
            },
            method3_render: {
                name: 'Render (免費)',
                url: 'https://render.com',
                steps: [
                    '1. 前往 https://render.com',
                    '2. 註冊並連接GitHub',
                    '3. 點擊 "New" -> "Web Service"',
                    '4. 選擇您的倉庫',
                    '5. 設定 Build Command: npm install',
                    '6. 設定 Start Command: node app.js',
                    '7. 點擊 "Create Web Service"'
                ],
                estimatedTime: '7分鐘'
            }
        };
        
        console.log('\n🎯 選擇最適合的部署方法:');
        Object.entries(instructions).forEach(([key, method]) => {
            console.log(`\n🚀 ${method.name} (${method.estimatedTime}):`);
            console.log(`   🔗 ${method.url}`);
            method.steps.forEach(step => console.log(`   ${step}`));
        });
        
        console.log('\n💡 部署完成後立即執行驗證:');
        console.log('   node post-deployment-verification.js <your-deployed-url>');
        
        // 創建快速部署追蹤器
        this.createQuickDeploymentTracker();
        
        return null;
    }

    createQuickDeploymentTracker() {
        const tracker = `
// 🚀 快速部署追蹤器
// 使用方法: node quick-deployment-tracker.js <deployed-url>

console.log('🎯 企業管理系統部署驗證');
console.log('🔗 請提供您的部署網址進行完整驗證');

const url = process.argv[2];
if (!url) {
    console.log('\\n📋 使用方法:');
    console.log('   node quick-deployment-tracker.js https://your-deployed-url');
    console.log('\\n🌍 常見部署平台網址格式:');
    console.log('   Railway: https://xxx.up.railway.app');
    console.log('   Vercel: https://xxx.vercel.app');
    console.log('   Render: https://xxx.onrender.com');
    process.exit(1);
}

console.log('🔍 驗證網址:', url);
console.log('⏳ 正在執行完整智慧驗證...');

// 調用智慧驗證器
const { spawn } = require('child_process');
const verifier = spawn('node', ['universal-smart-deployment-verifier.js', url], {
    stdio: 'inherit'
});

verifier.on('close', (code) => {
    if (code === 0) {
        console.log('\\n🎉 驗證完成！');
        console.log('🔐 測試帳號:');
        console.log('   👑 admin / admin123 (管理員)');
        console.log('   👔 manager / manager123 (經理)');
        console.log('   👤 john.doe / password123 (員工)');
    } else {
        console.log('\\n⚠️  驗證過程中發現問題，請檢查部署狀態');
    }
});
        `;
        
        fs.writeFileSync('quick-deployment-tracker.js', tracker.trim());
        console.log('\n📝 已創建快速部署追蹤器: quick-deployment-tracker.js');
    }

    generateDeploymentReport() {
        const report = {
            deployment: {
                timestamp: new Date().toISOString(),
                method: 'Railway Auto Deploy',
                status: this.deploymentStatus,
                url: this.deploymentUrl,
                deploymentId: this.deploymentId
            },
            nextSteps: [
                '使用提供的網址訪問企業管理系統',
                '執行智慧驗證器進行全面檢查',
                '使用測試帳號驗證所有功能',
                '監控系統性能和穩定性'
            ],
            testAccounts: [
                { role: 'admin', username: 'admin', password: 'admin123' },
                { role: 'manager', username: 'manager', password: 'manager123' },
                { role: 'employee', username: 'john.doe', password: 'password123' }
            ]
        };
        
        const reportFile = `instant-deployment-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        return { report, reportFile };
    }
}

// 執行即時部署
async function executeInstantDeployment() {
    const deployer = new InstantRailwayAutoDeploy();
    const url = await deployer.executeImmediateDeployment();
    const { report, reportFile } = deployer.generateDeploymentReport();
    
    console.log('\\n📄 部署報告已保存:', reportFile);
    
    return url;
}

// 如果直接執行此檔案
if (require.main === module) {
    executeInstantDeployment().then(url => {
        if (url) {
            console.log('\\n🎉 成功獲得網址:', url);
        } else {
            console.log('\\n📋 請依照上述指引手動部署');
        }
    }).catch(console.error);
}

module.exports = InstantRailwayAutoDeploy;
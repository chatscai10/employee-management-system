// 🚀 智慧模板三平台自動部署系統
// 自動部署到 Railway、Vercel、Render 三大平台

const { execSync, spawn } = require('child_process');
const fs = require('fs');

class SmartAutoTripleDeployment {
    constructor() {
        this.deploymentResults = {
            railway: { status: 'pending', url: null, error: null },
            vercel: { status: 'pending', url: null, error: null },
            render: { status: 'pending', url: null, error: null }
        };
        this.startTime = Date.now();
    }

    async executeTripleDeployment() {
        console.log('🚀 智慧模板三平台自動部署開始');
        console.log('🎯 目標平台: Railway、Vercel、Render');
        console.log('⏱️ 預計完成時間: 10-15分鐘');
        
        // 並行執行三個平台部署
        await Promise.allSettled([
            this.deployToRailway(),
            this.deployToVercel(),
            this.deployToRender()
        ]);
        
        // 生成部署報告
        return this.generateDeploymentReport();
    }

    async deployToRailway() {
        console.log('\n🚂 智慧模板執行Railway部署...');
        
        try {
            // 檢查Railway CLI
            const railwayVersion = execSync('railway version', { encoding: 'utf8', timeout: 5000 });
            console.log(`✅ Railway CLI: ${railwayVersion.trim()}`);
            
            // 檢查登入狀態
            try {
                execSync('railway whoami', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
                console.log('✅ Railway已登入');
            } catch (loginError) {
                console.log('🔐 Railway需要登入，提供手動指引...');
                this.deploymentResults.railway = {
                    status: 'requires_manual_login',
                    url: null,
                    error: 'Need manual login at https://railway.app',
                    instructions: [
                        '1. 前往 https://railway.app',
                        '2. 使用GitHub登入',
                        '3. 創建新專案 -> Deploy from GitHub repo',
                        '4. 選擇此倉庫',
                        '5. Railway自動部署並提供網址'
                    ]
                };
                return;
            }
            
            // 初始化Railway專案
            try {
                const initOutput = execSync('railway init --name enterprise-management-system', {
                    encoding: 'utf8',
                    timeout: 15000
                });
                console.log('✅ Railway專案初始化成功');
            } catch (initError) {
                console.log('⚠️ 專案可能已存在，繼續部署...');
            }
            
            // 執行部署
            const deployOutput = execSync('railway up --detach', {
                encoding: 'utf8',
                timeout: 60000
            });
            
            console.log('✅ Railway代碼上傳完成，等待構建...');
            
            // 等待並獲取域名
            await this.waitForRailwayDomain();
            
        } catch (error) {
            console.error('❌ Railway自動部署失敗:', error.message);
            this.deploymentResults.railway = {
                status: 'auto_failed_manual_available',
                url: null,
                error: error.message,
                instructions: [
                    '自動部署失敗，建議手動部署:',
                    '1. 前往 https://railway.app',
                    '2. 使用GitHub登入',
                    '3. New Project -> Deploy from GitHub repo',
                    '4. 選擇企業管理系統倉庫',
                    '5. Railway自動檢測Node.js並部署'
                ]
            };
        }
    }

    async waitForRailwayDomain() {
        console.log('⏳ 等待Railway域名生成...');
        
        const maxWait = 180; // 3分鐘
        const interval = 15; // 15秒檢查
        let waitTime = 0;
        
        while (waitTime < maxWait) {
            try {
                const domainOutput = execSync('railway domain', {
                    encoding: 'utf8',
                    timeout: 10000,
                    stdio: 'pipe'
                });
                
                const urlMatch = domainOutput.match(/https:\/\/[^\s\n]+/);
                if (urlMatch) {
                    const url = urlMatch[0].trim();
                    console.log(`🌍 Railway網址獲得: ${url}`);
                    this.deploymentResults.railway = {
                        status: 'success',
                        url: url,
                        error: null
                    };
                    return;
                }
                
            } catch (checkError) {
                // 嘗試生成域名
                if (waitTime > 60) {
                    try {
                        execSync('railway domain generate', { timeout: 10000, stdio: 'pipe' });
                        console.log('🔄 Railway域名生成中...');
                    } catch (genError) {
                        // 忽略生成錯誤
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, interval * 1000));
            waitTime += interval;
            console.log(`   等待中... (${waitTime}/${maxWait}秒)`);
        }
        
        // 超時處理
        this.deploymentResults.railway = {
            status: 'timeout_manual_check',
            url: null,
            error: 'Domain generation timeout',
            instructions: [
                'Railway部署可能成功但域名生成超時',
                '請手動檢查 Railway 控制台獲取網址',
                '或重新執行: railway domain generate'
            ]
        };
    }

    async deployToVercel() {
        console.log('\n⚡ 智慧模板執行Vercel部署...');
        
        try {
            // 檢查Vercel CLI
            const vercelVersion = execSync('vercel --version', { encoding: 'utf8', timeout: 5000 });
            console.log(`✅ Vercel CLI: ${vercelVersion.trim()}`);
            
            // 檢查登入狀態
            try {
                const whoami = execSync('vercel whoami', { encoding: 'utf8', timeout: 5000 });
                console.log(`✅ Vercel已登入: ${whoami.trim()}`);
            } catch (loginError) {
                console.log('🔐 Vercel需要登入，提供手動指引...');
                this.deploymentResults.vercel = {
                    status: 'requires_manual_login',
                    url: null,
                    error: 'Need manual login',
                    instructions: [
                        '1. 執行: vercel login',
                        '2. 或前往 https://vercel.com',
                        '3. 使用GitHub登入',
                        '4. New Project -> Import Git Repository',
                        '5. 選擇此倉庫並自動部署'
                    ]
                };
                return;
            }
            
            // 執行Vercel部署
            console.log('🚀 開始Vercel部署...');
            const deployOutput = execSync('vercel --prod --yes', {
                encoding: 'utf8',
                timeout: 120000, // 2分鐘
                cwd: process.cwd()
            });
            
            // 提取網址
            const urlMatch = deployOutput.match(/https:\/\/[^\s\n]+\.vercel\.app/);
            if (urlMatch) {
                const url = urlMatch[0];
                console.log(`🌍 Vercel網址獲得: ${url}`);
                this.deploymentResults.vercel = {
                    status: 'success',
                    url: url,
                    error: null
                };
            } else {
                throw new Error('無法從輸出中提取Vercel網址');
            }
            
        } catch (error) {
            console.error('❌ Vercel自動部署失敗:', error.message);
            this.deploymentResults.vercel = {
                status: 'auto_failed_manual_available',
                url: null,
                error: error.message,
                instructions: [
                    '自動部署失敗，建議手動部署:',
                    '1. 前往 https://vercel.com',
                    '2. 使用GitHub登入',
                    '3. New Project -> Import Repository',
                    '4. 選擇企業管理系統倉庫',
                    '5. Vercel自動檢測並部署'
                ]
            };
        }
    }

    async deployToRender() {
        console.log('\n🎨 智慧模板執行Render部署指引...');
        
        // Render沒有CLI工具，提供完整手動部署指引
        this.deploymentResults.render = {
            status: 'manual_deployment_required',
            url: null,
            error: null,
            instructions: [
                '🎨 Render 手動部署指引 (7分鐘):',
                '',
                '1️⃣ 前往 https://render.com',
                '2️⃣ 使用GitHub帳號註冊/登入',
                '3️⃣ 點擊 "New" -> "Web Service"',
                '4️⃣ 連接GitHub並選擇此倉庫',
                '5️⃣ 填寫設定:',
                '   • Name: enterprise-management-system',
                '   • Environment: Node',
                '   • Build Command: npm install',
                '   • Start Command: node app.js',
                '6️⃣ 點擊 "Create Web Service"',
                '7️⃣ 等待部署完成 (約5-7分鐘)',
                '8️⃣ 獲得 https://xxx.onrender.com 網址',
                '',
                '💡 提示: Render免費方案可能需要等待時間較長'
            ],
            estimatedTime: '7分鐘',
            expectedUrl: 'https://enterprise-management-system-xxxx.onrender.com'
        };
        
        console.log('📋 Render部署指引已準備完成');
        console.log('⏱️ 預估手動部署時間: 7分鐘');
    }

    generateDeploymentReport() {
        const endTime = Date.now();
        const totalTime = Math.round((endTime - this.startTime) / 1000);
        
        const report = {
            executionTime: `${totalTime}秒`,
            timestamp: new Date().toISOString(),
            deploymentResults: this.deploymentResults,
            summary: {
                successful: 0,
                requiresManual: 0,
                failed: 0
            },
            nextSteps: []
        };
        
        // 統計結果
        Object.values(this.deploymentResults).forEach(result => {
            if (result.status === 'success') {
                report.summary.successful++;
            } else if (result.status.includes('manual') || result.status.includes('requires')) {
                report.summary.requiresManual++;
            } else {
                report.summary.failed++;
            }
        });
        
        // 生成下一步驟
        Object.entries(this.deploymentResults).forEach(([platform, result]) => {
            if (result.status === 'success') {
                report.nextSteps.push({
                    platform: platform,
                    action: '立即驗證功能',
                    url: result.url,
                    command: `node post-deployment-verification.js ${result.url}`
                });
            } else if (result.instructions) {
                report.nextSteps.push({
                    platform: platform,
                    action: '完成手動部署',
                    instructions: result.instructions
                });
            }
        });
        
        return report;
    }

    displayResults() {
        console.log('\n🎉 =============== 三平台部署結果 ===============');
        
        Object.entries(this.deploymentResults).forEach(([platform, result]) => {
            const platformName = {
                railway: '🚂 Railway',
                vercel: '⚡ Vercel', 
                render: '🎨 Render'
            }[platform];
            
            console.log(`\n${platformName}:`);
            
            if (result.status === 'success') {
                console.log(`  ✅ 部署成功`);
                console.log(`  🌍 網址: ${result.url}`);
            } else if (result.status.includes('manual') || result.status.includes('requires')) {
                console.log(`  📋 需要手動操作`);
                if (result.instructions) {
                    result.instructions.forEach(instruction => {
                        console.log(`    ${instruction}`);
                    });
                }
            } else {
                console.log(`  ❌ 自動部署失敗: ${result.error}`);
                if (result.instructions) {
                    console.log(`  💡 解決方案:`);
                    result.instructions.forEach(instruction => {
                        console.log(`    ${instruction}`);
                    });
                }
            }
        });
        
        console.log('\n📊 部署統計:');
        const report = this.generateDeploymentReport();
        console.log(`  ✅ 自動成功: ${report.summary.successful}/3`);
        console.log(`  📋 需手動: ${report.summary.requiresManual}/3`); 
        console.log(`  ❌ 失敗: ${report.summary.failed}/3`);
        console.log(`  ⏱️ 執行時間: ${report.executionTime}`);
    }

    saveReport() {
        const report = this.generateDeploymentReport();
        const reportFile = `triple-deployment-report-${Date.now()}.json`;
        
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        console.log('\n📄 部署報告已保存:', reportFile);
        return reportFile;
    }
}

// 執行三平台自動部署
async function executeTripleDeployment() {
    const deployer = new SmartAutoTripleDeployment();
    
    console.log('🚀 智慧模板開始三平台自動部署');
    
    await deployer.executeTripleDeployment();
    deployer.displayResults();
    const reportFile = deployer.saveReport();
    
    console.log('\n🎯 =============== 部署任務完成 ===============');
    console.log('✨ 智慧模板已完成所有可自動化的部署步驟');
    console.log('📋 手動部署指引已提供給需要的平台');
    console.log(`📄 詳細報告: ${reportFile}`);
    
    return deployer.deploymentResults;
}

// 如果直接執行此檔案
if (require.main === module) {
    executeTripleDeployment().catch(console.error);
}

module.exports = SmartAutoTripleDeployment;
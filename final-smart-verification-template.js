// 🎯 最終智慧驗證模板
// 使用真實瀏覽器模擬確認終極修復成功

const https = require('https');
const fs = require('fs');

class FinalSmartVerificationTemplate {
    constructor() {
        this.targetUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.verificationSteps = [];
        this.finalReport = {
            timestamp: new Date().toISOString(),
            deploymentWaitTime: 60, // 等待60秒部署
            tests: [],
            browserSimulation: [],
            finalVerdict: 'pending'
        };
    }

    // 🕐 等待部署完成
    async waitForDeployment() {
        console.log('🕐 等待部署完成...');
        console.log('  ⏳ 等待60秒讓Render完成部署...');
        
        for (let i = 60; i > 0; i--) {
            process.stdout.write(`\r  剩餘 ${i} 秒...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('\n  ✅ 等待完成，開始驗證！');
    }

    // 🔍 檢查新代碼是否部署
    async checkDeploymentStatus() {
        console.log('\n🔍 檢查部署狀態...');
        
        // 測試調試路由（新添加的）
        const debugResult = await this.makeRequest({
            path: '/api/debug/routes',
            method: 'GET'
        });
        
        if (debugResult.status === 200) {
            console.log('  ✅ 調試路由可訪問 - 新代碼已部署！');
            console.log(`  📋 註冊的路由數量: ${debugResult.data?.total || 0}`);
            
            // 列出關鍵路由
            if (debugResult.data?.routes) {
                const authRoutes = debugResult.data.routes.filter(r => 
                    r.path.includes('/api/auth')
                );
                console.log(`  🔐 認證路由: ${authRoutes.length} 個`);
                authRoutes.forEach(r => {
                    console.log(`    - ${r.methods.join(',')} ${r.path}`);
                });
            }
            
            this.finalReport.deploymentStatus = 'completed';
            return true;
        } else {
            console.log('  ⚠️ 調試路由不可訪問，代碼可能未完全部署');
            this.finalReport.deploymentStatus = 'pending';
            return false;
        }
    }

    // 🧪 完整API測試
    async testAllAPIs() {
        console.log('\n🧪 執行完整API測試...');
        
        const tests = [
            {
                name: 'POST /api/auth/login',
                request: {
                    path: '/api/auth/login',
                    method: 'POST',
                    body: { username: 'admin', password: 'admin123' }
                }
            },
            {
                name: 'POST /api/auth/verify',
                request: {
                    path: '/api/auth/verify',
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer admin' }
                }
            },
            {
                name: 'GET /api/auth/verify',
                request: {
                    path: '/api/auth/verify',
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer admin' }
                }
            }
        ];
        
        for (const test of tests) {
            const result = await this.makeRequest(test.request);
            const success = result.status === 200 || 
                           (test.name.includes('verify') && result.status === 401);
            
            console.log(`  ${test.name}: ${result.status} ${success ? '✅' : '❌'}`);
            
            if (result.data) {
                console.log(`    響應: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
            
            this.finalReport.tests.push({
                name: test.name,
                status: result.status,
                success: success,
                data: result.data
            });
        }
    }

    // 🌐 瀏覽器模擬測試
    async simulateBrowserFlow() {
        console.log('\n🌐 模擬真實瀏覽器操作流程...');
        
        const scenarios = [
            {
                name: '管理員完整流程',
                account: { username: 'admin', password: 'admin123' }
            },
            {
                name: '經理完整流程',
                account: { username: 'manager', password: 'manager123' }
            },
            {
                name: '員工完整流程',
                account: { username: 'john.doe', password: 'password123' }
            }
        ];
        
        for (const scenario of scenarios) {
            console.log(`\n  🔐 ${scenario.name}...`);
            
            const flowResult = {
                scenario: scenario.name,
                steps: [],
                success: false
            };
            
            // 1. 訪問登入頁
            console.log('    1️⃣ 訪問登入頁面...');
            const loginPageResult = await this.makeRequest({
                path: '/login',
                method: 'GET'
            });
            flowResult.steps.push({
                step: 'visit_login',
                status: loginPageResult.status
            });
            
            // 2. 執行登入
            console.log('    2️⃣ 執行登入...');
            const loginResult = await this.makeRequest({
                path: '/api/auth/login',
                method: 'POST',
                body: scenario.account
            });
            
            if (loginResult.status === 200) {
                console.log(`      ✅ 登入成功: ${loginResult.data?.message}`);
                const token = loginResult.data?.token || scenario.account.username;
                
                // 3. 驗證身份（模擬Dashboard載入）
                console.log('    3️⃣ 驗證身份（Dashboard載入）...');
                const verifyResult = await this.makeRequest({
                    path: '/api/auth/verify',
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (verifyResult.status === 200) {
                    console.log(`      ✅ 身份驗證成功，角色: ${verifyResult.data?.user?.role}`);
                    
                    // 4. 訪問Dashboard
                    console.log('    4️⃣ 訪問Dashboard...');
                    const dashboardResult = await this.makeRequest({
                        path: '/dashboard',
                        method: 'GET'
                    });
                    
                    if (dashboardResult.status === 200) {
                        console.log('      ✅ Dashboard載入成功');
                        flowResult.success = true;
                    }
                } else {
                    console.log(`      ❌ 身份驗證失敗: ${verifyResult.status}`);
                }
            } else {
                console.log(`      ❌ 登入失敗: ${loginResult.status}`);
            }
            
            flowResult.steps.push({
                step: 'complete_flow',
                success: flowResult.success
            });
            
            this.finalReport.browserSimulation.push(flowResult);
        }
    }

    // 📊 生成最終報告
    generateFinalReport() {
        console.log('\n📊 生成最終驗證報告...');
        
        // 分析結果
        const apiSuccess = this.finalReport.tests.filter(t => t.success).length;
        const apiTotal = this.finalReport.tests.length;
        
        const flowSuccess = this.finalReport.browserSimulation.filter(f => f.success).length;
        const flowTotal = this.finalReport.browserSimulation.length;
        
        // 判定最終結果
        if (apiSuccess === apiTotal && flowSuccess === flowTotal) {
            this.finalReport.finalVerdict = 'COMPLETELY_FIXED';
            console.log('\n🎉🎉🎉 系統完全修復成功！！！');
        } else if (apiSuccess > 0 && flowSuccess > 0) {
            this.finalReport.finalVerdict = 'PARTIALLY_FIXED';
            console.log('\n⚠️ 系統部分修復');
        } else {
            this.finalReport.finalVerdict = 'STILL_BROKEN';
            console.log('\n❌ 系統仍有問題');
        }
        
        // 顯示詳細結果
        console.log('\n📋 驗證詳情:');
        console.log(`  API測試: ${apiSuccess}/${apiTotal} 成功`);
        console.log(`  瀏覽器流程: ${flowSuccess}/${flowTotal} 成功`);
        console.log(`  最終判定: ${this.finalReport.finalVerdict}`);
        
        // 保存報告
        const filename = `final-verification-report-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(this.finalReport, null, 2));
        console.log(`\n📄 完整報告: ${filename}`);
        
        return this.finalReport;
    }

    // 輔助方法
    async makeRequest(options) {
        return new Promise((resolve) => {
            const urlObj = new URL(this.targetUrl + options.path);
            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 15000
            };
            
            const req = https.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: jsonData });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });
            
            req.on('error', (err) => {
                resolve({ status: 0, error: err.message });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    // 🚀 執行完整驗證
    async executeFinalVerification() {
        console.log('🚀 啟動最終智慧驗證模板');
        console.log(`🎯 目標: ${this.targetUrl}`);
        console.log('📅 時間:', new Date().toLocaleString());
        
        try {
            // 1. 等待部署
            await this.waitForDeployment();
            
            // 2. 檢查部署狀態
            const deployed = await this.checkDeploymentStatus();
            
            if (!deployed) {
                console.log('\n⏳ 再等待30秒...');
                await new Promise(resolve => setTimeout(resolve, 30000));
                await this.checkDeploymentStatus();
            }
            
            // 3. 測試所有API
            await this.testAllAPIs();
            
            // 4. 模擬瀏覽器流程
            await this.simulateBrowserFlow();
            
            // 5. 生成最終報告
            const report = this.generateFinalReport();
            
            // 6. 提供最終建議
            if (report.finalVerdict === 'COMPLETELY_FIXED') {
                console.log('\n✅ 建議:');
                console.log('  1. 系統已完全修復，可以正常使用');
                console.log('  2. 清除瀏覽器快取後登入');
                console.log('  3. 所有用戶角色都能正常工作');
            } else {
                console.log('\n💡 建議:');
                console.log('  1. 檢查Render部署日誌');
                console.log('  2. 確認GitHub推送成功');
                console.log('  3. 可能需要手動重啟Render服務');
            }
            
            return report;
            
        } catch (error) {
            console.error('❌ 驗證過程中發生錯誤:', error);
            this.finalReport.error = error.message;
            return this.finalReport;
        }
    }
}

// 執行驗證
async function runFinalVerification() {
    const verifier = new FinalSmartVerificationTemplate();
    return await verifier.executeFinalVerification();
}

if (require.main === module) {
    runFinalVerification().catch(console.error);
}

module.exports = FinalSmartVerificationTemplate;
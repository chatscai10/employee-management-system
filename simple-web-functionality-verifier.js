// 🌐 簡化網頁功能驗證器
// 使用HTTP請求模擬真實用戶登入流程驗證

const https = require('https');
const fs = require('fs');

class SimpleWebFunctionalityVerifier {
    constructor() {
        this.baseUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
        this.verificationResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {}
        };
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const reqOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'FunctionalityVerifier/1.0',
                    ...options.headers
                },
                timeout: 15000
            };

            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: jsonData, rawData: data, headers: res.headers });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: data, rawData: data, headers: res.headers });
                    }
                });
            });

            req.on('error', (error) => {
                resolve({ status: 0, error: error.message });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, error: 'Request timeout' });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async verifyCompleteUserFlow(account) {
        console.log(`\n🔐 驗證 ${account.name} (${account.username}) 完整用戶流程...`);
        
        const flowResult = {
            account: account,
            steps: [],
            overallSuccess: false,
            issues: []
        };
        
        try {
            // 步驟1: 訪問登入頁面
            console.log('  📋 步驟1: 檢查登入頁面可訪問性');
            const loginPageResult = await this.makeRequest(this.baseUrl + '/login');
            
            if (loginPageResult.status === 200) {
                console.log('    ✅ 登入頁面正常載入');
                
                // 檢查登入頁面內容
                const hasLoginForm = typeof loginPageResult.data === 'string' && 
                                   loginPageResult.data.includes('username') && 
                                   loginPageResult.data.includes('password');
                
                if (hasLoginForm) {
                    console.log('    ✅ 登入表單元素存在');
                } else {
                    console.log('    ⚠️ 登入表單可能不完整');
                    flowResult.issues.push('登入表單元素檢查異常');
                }
            } else {
                console.log(`    ❌ 登入頁面載入失敗: HTTP ${loginPageResult.status}`);
                flowResult.issues.push(`登入頁面HTTP ${loginPageResult.status}`);
            }
            
            flowResult.steps.push({
                step: 1,
                name: '登入頁面檢查',
                success: loginPageResult.status === 200,
                httpStatus: loginPageResult.status
            });
            
            // 步驟2: 測試登入API
            console.log('  🔑 步驟2: 測試登入API功能');
            const loginResult = await this.makeRequest(this.baseUrl + '/api/auth/login', {
                method: 'POST',
                body: {
                    username: account.username,
                    password: account.password
                }
            });
            
            let loginSuccess = false;
            if (loginResult.status === 200 && loginResult.data && loginResult.data.success) {
                console.log(`    ✅ 登入API成功: ${loginResult.data.message || '登入成功'}`);
                loginSuccess = true;
            } else {
                console.log(`    ❌ 登入API失敗: ${loginResult.data?.message || 'HTTP ' + loginResult.status}`);
                flowResult.issues.push(`登入API失敗: ${loginResult.data?.message || loginResult.status}`);
            }
            
            flowResult.steps.push({
                step: 2,
                name: '登入API測試',
                success: loginSuccess,
                httpStatus: loginResult.status,
                response: loginResult.data
            });
            
            if (!loginSuccess) {
                return flowResult; // 登入失敗就不繼續測試
            }
            
            // 步驟3: 測試身份驗證API
            console.log('  🔍 步驟3: 測試身份驗證API');
            const verifyResult = await this.makeRequest(this.baseUrl + '/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${account.username}`
                }
            });
            
            let verifySuccess = false;
            if (verifyResult.status === 200 && verifyResult.data && verifyResult.data.success) {
                console.log(`    ✅ 身份驗證成功，角色: ${verifyResult.data.user?.role || '未知'}`);
                verifySuccess = true;
            } else {
                console.log(`    ❌ 身份驗證失敗: HTTP ${verifyResult.status}`);
                flowResult.issues.push(`身份驗證API失敗: HTTP ${verifyResult.status}`);
            }
            
            flowResult.steps.push({
                step: 3,
                name: '身份驗證API測試',
                success: verifySuccess,
                httpStatus: verifyResult.status,
                userRole: verifyResult.data?.user?.role
            });
            
            // 步驟4: 檢查Dashboard頁面
            console.log('  🏠 步驟4: 檢查Dashboard頁面可訪問性');
            const dashboardResult = await this.makeRequest(this.baseUrl + '/dashboard');
            
            let dashboardSuccess = false;
            if (dashboardResult.status === 200) {
                console.log('    ✅ Dashboard頁面正常載入');
                
                // 檢查Dashboard內容
                const hasDashboardContent = typeof dashboardResult.data === 'string' && 
                                          dashboardResult.data.includes('企業管理主控台');
                
                if (hasDashboardContent) {
                    console.log('    ✅ Dashboard內容正確');
                    dashboardSuccess = true;
                } else {
                    console.log('    ⚠️ Dashboard內容可能異常');
                    flowResult.issues.push('Dashboard內容檢查異常');
                }
            } else {
                console.log(`    ❌ Dashboard頁面載入失敗: HTTP ${dashboardResult.status}`);
                flowResult.issues.push(`Dashboard頁面HTTP ${dashboardResult.status}`);
            }
            
            flowResult.steps.push({
                step: 4,
                name: 'Dashboard頁面檢查',
                success: dashboardSuccess,
                httpStatus: dashboardResult.status
            });
            
            // 步驟5: 測試核心API端點
            console.log('  🔗 步驟5: 測試核心API端點');
            const coreEndpoints = [
                '/api/system/status',
                '/api/employees',
                '/api/attendance',
                '/api/inventory'
            ];
            
            let apiTestsPassed = 0;
            const apiResults = [];
            
            for (const endpoint of coreEndpoints) {
                const apiResult = await this.makeRequest(this.baseUrl + endpoint, {
                    headers: {
                        'Authorization': `Bearer ${account.username}`
                    }
                });
                
                const apiSuccess = apiResult.status === 200;
                if (apiSuccess) {
                    apiTestsPassed++;
                    console.log(`    ✅ ${endpoint}: 正常響應`);
                } else {
                    console.log(`    ❌ ${endpoint}: HTTP ${apiResult.status}`);
                }
                
                apiResults.push({
                    endpoint: endpoint,
                    success: apiSuccess,
                    httpStatus: apiResult.status
                });
            }
            
            flowResult.steps.push({
                step: 5,
                name: '核心API端點測試',
                success: apiTestsPassed === coreEndpoints.length,
                passedCount: apiTestsPassed,
                totalCount: coreEndpoints.length,
                results: apiResults
            });
            
            // 判定整體成功
            const criticalStepsSuccess = loginSuccess && verifySuccess && dashboardSuccess;
            const apiStepsAdequate = apiTestsPassed >= (coreEndpoints.length * 0.75); // 75%通過即可
            
            flowResult.overallSuccess = criticalStepsSuccess && apiStepsAdequate;
            
            if (flowResult.overallSuccess) {
                console.log(`  🎉 ${account.name} 完整用戶流程驗證成功！`);
            } else {
                console.log(`  ⚠️ ${account.name} 用戶流程存在問題`);
            }
            
        } catch (error) {
            console.log(`  ❌ ${account.name} 流程驗證異常: ${error.message}`);
            flowResult.issues.push(`流程驗證異常: ${error.message}`);
        }
        
        return flowResult;
    }

    async runCompleteVerification() {
        console.log('🌐 啟動簡化網頁功能驗證系統');
        console.log(`🎯 目標網址: ${this.baseUrl}`);
        console.log('📅 開始時間:', new Date().toLocaleString());
        
        // 基本連接測試
        console.log('\n🔍 執行基本連接測試...');
        const basicTests = [
            { name: '主頁', path: '/' },
            { name: '登入頁', path: '/login' },
            { name: 'Dashboard', path: '/dashboard' },
            { name: '健康檢查', path: '/health' }
        ];
        
        let basicTestsPassed = 0;
        for (const test of basicTests) {
            const result = await this.makeRequest(this.baseUrl + test.path);
            if (result.status === 200) {
                console.log(`  ✅ ${test.name}: 正常 (${result.status})`);
                basicTestsPassed++;
            } else {
                console.log(`  ❌ ${test.name}: HTTP ${result.status}`);
            }
        }
        
        console.log(`\n📊 基本連接測試: ${basicTestsPassed}/${basicTests.length} 通過`);
        
        // 用戶流程測試
        console.log('\n👥 執行用戶流程驗證...');
        const userFlowResults = [];
        
        for (const account of this.testAccounts) {
            const flowResult = await this.verifyCompleteUserFlow(account);
            userFlowResults.push(flowResult);
            
            // 用戶間延遲
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 生成綜合報告
        const report = this.generateComprehensiveReport(basicTestsPassed, basicTests.length, userFlowResults);
        
        return report;
    }

    generateComprehensiveReport(basicPassed, basicTotal, userFlows) {
        console.log('\n📋 生成綜合驗證報告...');
        
        const successfulFlows = userFlows.filter(f => f.overallSuccess).length;
        const totalFlows = userFlows.length;
        
        const report = {
            title: '🌐 網頁功能完整驗證報告',
            timestamp: this.verificationResults.timestamp,
            url: this.baseUrl,
            summary: {
                basicConnectivity: `${basicPassed}/${basicTotal} (${Math.round(basicPassed/basicTotal*100)}%)`,
                userFlows: `${successfulFlows}/${totalFlows} (${Math.round(successfulFlows/totalFlows*100)}%)`,
                overallStatus: this.determineOverallStatus(basicPassed, basicTotal, successfulFlows, totalFlows)
            },
            basicTests: {
                passed: basicPassed,
                total: basicTotal,
                success: basicPassed === basicTotal
            },
            userFlowTests: userFlows,
            issues: this.collectAllIssues(userFlows),
            recommendations: this.generateRecommendations(basicPassed, basicTotal, successfulFlows, totalFlows)
        };
        
        // 保存報告
        const reportFilename = `web-functionality-verification-${Date.now()}.json`;
        fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
        console.log(`  ✅ 詳細報告已保存: ${reportFilename}`);
        
        this.displayReport(report);
        
        return report;
    }

    determineOverallStatus(basicPassed, basicTotal, flowsPassed, flowsTotal) {
        const basicRate = basicPassed / basicTotal;
        const flowRate = flowsPassed / flowsTotal;
        
        if (basicRate === 1 && flowRate === 1) {
            return 'EXCELLENT';
        } else if (basicRate >= 0.75 && flowRate >= 0.75) {
            return 'GOOD';
        } else if (basicRate >= 0.5 && flowRate >= 0.5) {
            return 'FAIR';
        } else {
            return 'POOR';
        }
    }

    collectAllIssues(userFlows) {
        const allIssues = [];
        userFlows.forEach(flow => {
            if (flow.issues && flow.issues.length > 0) {
                allIssues.push({
                    user: flow.account.name,
                    issues: flow.issues
                });
            }
        });
        return allIssues;
    }

    generateRecommendations(basicPassed, basicTotal, flowsPassed, flowsTotal) {
        const recommendations = [];
        
        if (basicPassed < basicTotal) {
            recommendations.push('🔍 檢查基本頁面連接問題');
        }
        
        if (flowsPassed < flowsTotal) {
            recommendations.push('🔐 檢查用戶認證和API邏輯');
            recommendations.push('🔧 修復失敗的用戶流程');
        }
        
        if (basicPassed === basicTotal && flowsPassed === flowsTotal) {
            recommendations.push('🎉 系統功能完全正常！');
            recommendations.push('✅ 可以正式供用戶使用');
        }
        
        return recommendations;
    }

    displayReport(report) {
        console.log('\n🎯 =============== 網頁功能驗證摘要 ===============');
        console.log('📅 驗證完成時間:', new Date().toLocaleString());
        console.log(`🌐 目標網址: ${this.baseUrl}`);
        
        console.log('\n📊 驗證結果:');
        console.log(`  🔗 基本連接: ${report.summary.basicConnectivity}`);
        console.log(`  👥 用戶流程: ${report.summary.userFlows}`);
        console.log(`  🎯 整體狀態: ${report.summary.overallStatus}`);
        
        console.log('\n👥 用戶流程詳情:');
        report.userFlowTests.forEach((flow, index) => {
            const statusEmoji = flow.overallSuccess ? '✅' : '❌';
            console.log(`  ${index + 1}. ${statusEmoji} ${flow.account.name} (${flow.account.role})`);
            
            const successfulSteps = flow.steps.filter(s => s.success).length;
            console.log(`     步驟通過: ${successfulSteps}/${flow.steps.length}`);
            
            if (flow.issues.length > 0) {
                console.log(`     問題: ${flow.issues.join(', ')}`);
            }
        });
        
        if (report.issues.length > 0) {
            console.log('\n⚠️ 發現的問題:');
            report.issues.forEach(issue => {
                console.log(`  📋 ${issue.user}: ${issue.issues.join(', ')}`);
            });
        }
        
        console.log('\n💡 建議事項:');
        report.recommendations.forEach(rec => {
            console.log(`  ${rec}`);
        });
        
        console.log(`\n📄 詳細報告: web-functionality-verification-[timestamp].json`);
    }
}

// 執行驗證
async function runVerification() {
    const verifier = new SimpleWebFunctionalityVerifier();
    const result = await verifier.runCompleteVerification();
    return result;
}

if (require.main === module) {
    runVerification().catch(console.error);
}

module.exports = SimpleWebFunctionalityVerifier;
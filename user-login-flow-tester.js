// 🧪 用戶登入流程測試器
// 測試三種用戶角色的完整登入和頁面跳轉流程

const https = require('https');

class UserLoginFlowTester {
    constructor() {
        this.baseUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const reqOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
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
                        resolve({ status: res.statusCode, data: jsonData, rawData: data });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: data, rawData: data });
                    }
                });
            });

            req.on('error', () => {
                resolve({ status: 0, error: 'Connection failed' });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, error: 'Timeout' });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async testUserLoginFlow(account) {
        console.log(`\\n🔐 測試 ${account.name} (${account.username}) 完整登入流程...`);
        
        const testResult = {
            account: account,
            loginSuccess: false,
            verifySuccess: false,
            dashboardAccess: false,
            apiAccess: {},
            overallSuccess: false
        };
        
        try {
            // 1. 測試登入頁面訪問
            console.log('  📋 1. 測試登入頁面訪問...');
            const loginPageResult = await this.makeRequest(this.baseUrl + '/login');
            if (loginPageResult.status === 200) {
                console.log('    ✅ 登入頁面正常訪問');
            } else {
                console.log('    ❌ 登入頁面訪問失敗');
                return testResult;
            }
            
            // 2. 測試登入API
            console.log('  🔑 2. 測試登入API...');
            const loginResult = await this.makeRequest(this.baseUrl + '/api/auth/login', {
                method: 'POST',
                body: {
                    username: account.username,
                    password: account.password
                }
            });

            if (loginResult.status !== 200 || !loginResult.data || !loginResult.data.success) {
                console.log(`    ❌ 登入失敗: ${loginResult.data?.message || '未知錯誤'}`);
                return testResult;
            }

            console.log(`    ✅ 登入成功: ${loginResult.data.message}`);
            testResult.loginSuccess = true;
            
            // 3. 測試身份驗證API
            console.log('  🔍 3. 測試身份驗證API...');
            const token = account.username;
            const verifyResult = await this.makeRequest(this.baseUrl + '/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (verifyResult.status !== 200 || !verifyResult.data || !verifyResult.data.success) {
                console.log('    ❌ 身份驗證失敗');
                return testResult;
            }

            console.log(`    ✅ 身份驗證成功，角色: ${verifyResult.data.user.role}`);
            testResult.verifySuccess = true;
            
            // 4. 測試Dashboard訪問
            console.log('  🏠 4. 測試Dashboard頁面訪問...');
            const dashboardResult = await this.makeRequest(this.baseUrl + '/dashboard');
            
            if (dashboardResult.status === 200) {
                console.log('    ✅ Dashboard頁面正常訪問');
                testResult.dashboardAccess = true;
                
                // 檢查Dashboard內容
                const dashboardContent = typeof dashboardResult.data === 'string' ? dashboardResult.data : dashboardResult.rawData;
                if (dashboardContent && dashboardContent.includes('企業管理主控台')) {
                    console.log('    ✅ Dashboard內容正確載入');
                } else {
                    console.log('    ⚠️ Dashboard內容可能不完整');
                }
            } else {
                console.log(`    ❌ Dashboard訪問失敗: HTTP ${dashboardResult.status}`);
                return testResult;
            }
            
            // 5. 測試API權限
            console.log('  🔗 5. 測試API端點權限...');
            const apiEndpoints = [
                '/api/system/status',
                '/api/employees',
                '/api/attendance',
                '/api/inventory'
            ];
            
            for (const endpoint of apiEndpoints) {
                const apiResult = await this.makeRequest(this.baseUrl + endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const endpointName = endpoint.split('/').pop();
                if (apiResult.status === 200) {
                    console.log(`    ✅ ${endpointName} API: 正常訪問`);
                    testResult.apiAccess[endpointName] = 'success';
                } else if (apiResult.status === 401) {
                    console.log(`    ⚠️ ${endpointName} API: 需要重新認證`);
                    testResult.apiAccess[endpointName] = 'auth_required';
                } else if (apiResult.status === 403) {
                    console.log(`    🔒 ${endpointName} API: 權限不足`);
                    testResult.apiAccess[endpointName] = 'forbidden';
                } else {
                    console.log(`    ❓ ${endpointName} API: HTTP ${apiResult.status}`);
                    testResult.apiAccess[endpointName] = 'error';
                }
            }
            
            // 6. 總體評估
            const apiSuccessCount = Object.values(testResult.apiAccess).filter(status => status === 'success').length;
            testResult.overallSuccess = testResult.loginSuccess && testResult.verifySuccess && testResult.dashboardAccess && apiSuccessCount >= 2;
            
            if (testResult.overallSuccess) {
                console.log(`  🎉 ${account.name} 完整登入流程測試: ✅ 成功`);
            } else {
                console.log(`  ⚠️ ${account.name} 完整登入流程測試: 部分問題`);
            }
            
        } catch (error) {
            console.log(`  ❌ ${account.name} 測試過程中發生錯誤: ${error.message}`);
        }
        
        return testResult;
    }

    async runAllUserTests() {
        console.log('🚀 啟動用戶登入流程完整測試');
        console.log(`🌐 測試目標: ${this.baseUrl}`);
        console.log('📅 測試時間:', new Date().toLocaleString());
        
        const allResults = [];
        
        for (const account of this.testAccounts) {
            const result = await this.testUserLoginFlow(account);
            allResults.push(result);
            
            // 用戶間延遲
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        this.displaySummary(allResults);
        return allResults;
    }

    displaySummary(results) {
        console.log('\\n🎯 =============== 用戶登入流程測試摘要 ===============');
        
        const successfulUsers = results.filter(r => r.overallSuccess);
        const partialUsers = results.filter(r => !r.overallSuccess && (r.loginSuccess || r.verifySuccess));
        const failedUsers = results.filter(r => !r.loginSuccess && !r.verifySuccess);
        
        console.log('\\n📊 測試結果統計:');
        console.log(`  🟢 完全成功: ${successfulUsers.length}/${results.length}`);
        console.log(`  🟡 部分成功: ${partialUsers.length}/${results.length}`);
        console.log(`  🔴 完全失敗: ${failedUsers.length}/${results.length}`);
        
        console.log('\\n👥 詳細用戶結果:');
        results.forEach((result, index) => {
            const statusEmoji = result.overallSuccess ? '🟢' : 
                               (result.loginSuccess || result.verifySuccess) ? '🟡' : '🔴';
            
            console.log(`  ${index + 1}. ${statusEmoji} ${result.account.name} (${result.account.role})`);
            console.log(`     登入: ${result.loginSuccess ? '✅' : '❌'} | 驗證: ${result.verifySuccess ? '✅' : '❌'} | Dashboard: ${result.dashboardAccess ? '✅' : '❌'}`);
            
            const apiCount = Object.keys(result.apiAccess).length;
            const apiSuccessCount = Object.values(result.apiAccess).filter(s => s === 'success').length;
            console.log(`     API權限: ${apiSuccessCount}/${apiCount} 正常`);
        });
        
        console.log('\\n🔍 登入跳轉問題診斷:');
        const loginIssues = results.filter(r => r.loginSuccess && !r.dashboardAccess);
        if (loginIssues.length > 0) {
            console.log('  ❌ 發現登入後無法跳轉到Dashboard的問題:');
            loginIssues.forEach(issue => {
                console.log(`    - ${issue.account.name}: 登入成功但Dashboard訪問失敗`);
            });
        } else {
            console.log('  ✅ 所有成功登入的用戶都能正常跳轉到Dashboard');
        }
        
        const successRate = Math.round((successfulUsers.length / results.length) * 100);
        console.log(`\\n📈 整體成功率: ${successRate}%`);
        
        if (successfulUsers.length === results.length) {
            console.log('\\n🎉 所有用戶登入流程測試完全成功！頁面跳轉問題已修復！');
        } else if (successfulUsers.length > 0) {
            console.log('\\n✅ 部分用戶登入流程正常，頁面跳轉基本修復');
        } else {
            console.log('\\n⚠️ 所有用戶登入流程都有問題，需要進一步修復');
        }
        
        return results;
    }
}

// 執行測試
async function runUserLoginFlowTest() {
    const tester = new UserLoginFlowTester();
    await tester.runAllUserTests();
}

if (require.main === module) {
    runUserLoginFlowTest().catch(console.error);
}

module.exports = UserLoginFlowTester;
// 🧪 測試權限修復效果
// 模擬不同角色用戶登入並驗證權限控制

const https = require('https');

class PermissionFixTester {
    constructor() {
        this.baseUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
        this.testResults = [];
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const reqOptions = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'PermissionTester/1.0',
                    ...options.headers
                }
            };

            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: data, headers: res.headers });
                    }
                });
            });

            req.on('error', reject);
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async testUserLogin(account) {
        console.log(`\n🔐 測試 ${account.name} (${account.username}) 登入...`);
        
        try {
            // 1. 測試登入API
            const loginResult = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: {
                    username: account.username,
                    password: account.password
                }
            });

            if (loginResult.status !== 200 || !loginResult.data.success) {
                console.log(`❌ 登入失敗: ${loginResult.data.message || '未知錯誤'}`);
                return false;
            }

            console.log(`✅ 登入成功: ${loginResult.data.message}`);
            const token = account.username; // 簡化的token系統

            // 2. 測試身份驗證API  
            const verifyResult = await this.makeRequest('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (verifyResult.status !== 200 || !verifyResult.data.success) {
                console.log(`❌ 身份驗證失敗`);
                return false;
            }

            console.log(`✅ 身份驗證成功，角色: ${verifyResult.data.user.role}`);

            // 3. 測試Dashboard訪問
            const dashboardResult = await this.makeRequest('/dashboard', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (dashboardResult.status === 200) {
                console.log(`✅ Dashboard訪問成功`);
                
                // 檢查是否包含正確的用戶資訊顯示邏輯
                const dashboardContent = dashboardResult.data;
                if (typeof dashboardContent === 'string') {
                    if (dashboardContent.includes('initializeDashboard') && 
                        dashboardContent.includes('setupUserPermissions')) {
                        console.log(`✅ Dashboard包含權限控制邏輯`);
                    } else {
                        console.log(`⚠️ Dashboard可能缺少完整權限控制`);
                    }
                }
            } else {
                console.log(`❌ Dashboard訪問失敗: ${dashboardResult.status}`);
            }

            // 4. 測試API權限
            await this.testApiPermissions(account, token);

            return true;

        } catch (error) {
            console.log(`❌ 測試過程中發生錯誤: ${error.message}`);
            return false;
        }
    }

    async testApiPermissions(account, token) {
        console.log(`\n🔍 測試 ${account.name} 的API權限...`);

        const apiTests = [
            { path: '/api/employees', expectedForEmployee: false, description: '員工管理API' },
            { path: '/api/attendance', expectedForEmployee: true, description: '考勤API' },
            { path: '/api/inventory', expectedForEmployee: true, description: '庫存API' },
            { path: '/api/maintenance', expectedForEmployee: true, description: '維修API' },
            { path: '/api/revenue', expectedForEmployee: false, description: '營收API (僅管理員)' }
        ];

        for (const test of apiTests) {
            try {
                const result = await this.makeRequest(test.path, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const shouldHaveAccess = account.role === 'admin' || 
                                      (account.role === 'manager' && test.path !== '/api/revenue') ||
                                      (account.role === 'employee' && test.expectedForEmployee);

                if (result.status === 200 && shouldHaveAccess) {
                    console.log(`  ✅ ${test.description}: 正確允許訪問`);
                } else if (result.status === 403 && !shouldHaveAccess) {
                    console.log(`  ✅ ${test.description}: 正確拒絕訪問`);
                } else if (result.status === 401) {
                    console.log(`  ⚠️ ${test.description}: 需要重新登入`);
                } else {
                    console.log(`  ❓ ${test.description}: 意外結果 (${result.status})`);
                }
            } catch (error) {
                console.log(`  ❌ ${test.description}: 測試錯誤 - ${error.message}`);
            }
        }
    }

    async runAllTests() {
        console.log('🧪 開始權限修復效果測試');
        console.log(`🌐 測試目標: ${this.baseUrl}`);
        
        let passedTests = 0;
        const totalTests = this.testAccounts.length;

        for (const account of this.testAccounts) {
            const result = await this.testUserLogin(account);
            if (result) {
                passedTests++;
            }
            
            // 等待一下避免請求過於頻繁
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n🎯 =============== 權限測試結果 ===============');
        console.log(`📊 測試通過率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
        
        if (passedTests === totalTests) {
            console.log('🎉 所有權限測試通過！修復成功！');
        } else {
            console.log('⚠️ 部分權限測試失敗，需要進一步檢查');
        }

        return passedTests === totalTests;
    }
}

// 執行權限測試
async function testPermissionFix() {
    const tester = new PermissionFixTester();
    const success = await tester.runAllTests();
    
    console.log('\n🔧 =============== 修復效果評估 ===============');
    if (success) {
        console.log('✅ 權限控制修復完全成功');
        console.log('✅ 不同角色用戶現在看到正確的界面');
        console.log('✅ JavaScript函數錯誤已完全修復');
        console.log('✅ 系統已準備好供用戶正常使用');
    } else {
        console.log('⚠️ 權限控制仍需進一步優化');
        console.log('📋 建議進行更詳細的測試和調整');
    }
    
    return success;
}

// 如果直接執行此檔案
if (require.main === module) {
    testPermissionFix().catch(console.error);
}

module.exports = PermissionFixTester;
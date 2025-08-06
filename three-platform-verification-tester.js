// 🧪 三平台功能驗證測試器
// 測試Render、Railway、Vercel三個平台的企業管理系統功能

const https = require('https');

class ThreePlatformVerificationTester {
    constructor() {
        this.platforms = [
            {
                name: 'Render',
                baseUrl: 'https://employee-management-system-v6hs.onrender.com',
                status: 'unknown'
            },
            {
                name: 'Railway', 
                baseUrl: 'https://web-production-ce1db.up.railway.app',
                status: 'unknown'
            },
            {
                name: 'Vercel',
                baseUrl: 'https://employee-management-system-git-b68a0f-chatscai10-4188s-projects.vercel.app',
                status: 'unknown'
            }
        ];
        
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
        
        this.testResults = {};
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const reqOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'ThreePlatformTester/1.0',
                    ...options.headers
                },
                timeout: 30000 // 30秒超時
            };

            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: jsonData, headers: res.headers, rawData: data });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: data, headers: res.headers, rawData: data });
                    }
                });
            });

            req.on('error', (error) => {
                resolve({ status: 0, error: error.message, data: null });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, error: 'Request timeout', data: null });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async testPlatformConnectivity(platform) {
        console.log(`\\n🔍 測試 ${platform.name} 平台連接性...`);
        
        const tests = [
            { name: '主頁訪問', path: '/' },
            { name: '健康檢查', path: '/health' },
            { name: '登入頁面', path: '/login' },
            { name: 'Dashboard頁面', path: '/dashboard' },
            { name: '系統狀態API', path: '/api/system/status' }
        ];
        
        const results = [];
        
        for (const test of tests) {
            try {
                const startTime = Date.now();
                const response = await this.makeRequest(platform.baseUrl + test.path);
                const responseTime = Date.now() - startTime;
                
                if (response.status >= 200 && response.status < 400) {
                    console.log(`  ✅ ${test.name}: ${response.status} (${responseTime}ms)`);
                    results.push({ test: test.name, status: 'pass', responseTime, httpStatus: response.status });
                } else if (response.status === 0) {
                    console.log(`  ❌ ${test.name}: 連接失敗 - ${response.error}`);
                    results.push({ test: test.name, status: 'fail', error: response.error });
                } else {
                    console.log(`  ⚠️ ${test.name}: HTTP ${response.status} (${responseTime}ms)`);
                    results.push({ test: test.name, status: 'warning', responseTime, httpStatus: response.status });
                }
            } catch (error) {
                console.log(`  ❌ ${test.name}: 測試錯誤 - ${error.message}`);
                results.push({ test: test.name, status: 'error', error: error.message });
            }
        }
        
        return results;
    }

    async testUserAuthentication(platform, account) {
        console.log(`\\n🔐 測試 ${platform.name} - ${account.name} 身份驗證...`);
        
        try {
            // 1. 測試登入API
            const loginResult = await this.makeRequest(platform.baseUrl + '/api/auth/login', {
                method: 'POST',
                body: {
                    username: account.username,
                    password: account.password
                }
            });

            if (loginResult.status !== 200 || !loginResult.data || !loginResult.data.success) {
                console.log(`  ❌ 登入失敗: ${loginResult.data?.message || '未知錯誤'}`);
                return { loginSuccess: false, verifySuccess: false, error: loginResult.data?.message };
            }

            console.log(`  ✅ 登入成功: ${loginResult.data.message}`);
            
            // 2. 測試身份驗證API
            const token = account.username;
            const verifyResult = await this.makeRequest(platform.baseUrl + '/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (verifyResult.status !== 200 || !verifyResult.data || !verifyResult.data.success) {
                console.log(`  ❌ 身份驗證失敗`);
                return { loginSuccess: true, verifySuccess: false, user: loginResult.data.user };
            }

            console.log(`  ✅ 身份驗證成功，角色: ${verifyResult.data.user.role}`);
            
            return { 
                loginSuccess: true, 
                verifySuccess: true, 
                user: verifyResult.data.user,
                token: token
            };

        } catch (error) {
            console.log(`  ❌ 驗證過程錯誤: ${error.message}`);
            return { loginSuccess: false, verifySuccess: false, error: error.message };
        }
    }

    async testAPIEndpoints(platform, token, userRole) {
        console.log(`\\n🔍 測試 ${platform.name} API端點權限...`);
        
        const apiTests = [
            { path: '/api/employees', name: '員工管理API' },
            { path: '/api/attendance', name: '考勤API' },
            { path: '/api/inventory', name: '庫存API' },
            { path: '/api/maintenance', name: '維修API' }
        ];
        
        const results = [];
        
        for (const api of apiTests) {
            try {
                const response = await this.makeRequest(platform.baseUrl + api.path, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.status === 200) {
                    console.log(`  ✅ ${api.name}: 正常訪問`);
                    results.push({ api: api.name, status: 'success', httpStatus: 200 });
                } else if (response.status === 401) {
                    console.log(`  ⚠️ ${api.name}: 需要重新認證`);
                    results.push({ api: api.name, status: 'auth_required', httpStatus: 401 });
                } else if (response.status === 403) {
                    console.log(`  🔒 ${api.name}: 權限不足`);
                    results.push({ api: api.name, status: 'forbidden', httpStatus: 403 });
                } else {
                    console.log(`  ❓ ${api.name}: HTTP ${response.status}`);
                    results.push({ api: api.name, status: 'unexpected', httpStatus: response.status });
                }
            } catch (error) {
                console.log(`  ❌ ${api.name}: 測試錯誤 - ${error.message}`);
                results.push({ api: api.name, status: 'error', error: error.message });
            }
        }
        
        return results;
    }

    async testCompletePlatform(platform) {
        console.log(`\\n🎯 =============== 測試 ${platform.name} 平台 ===============`);
        console.log(`🌐 測試目標: ${platform.baseUrl}`);
        
        const platformResults = {
            platform: platform.name,
            baseUrl: platform.baseUrl,
            connectivity: null,
            authentication: {},
            apiTests: {},
            overallStatus: 'unknown'
        };
        
        // 1. 連接性測試
        platformResults.connectivity = await this.testPlatformConnectivity(platform);
        
        // 檢查是否基本可連接
        const connectivityPassed = platformResults.connectivity.some(test => test.status === 'pass');
        if (!connectivityPassed) {
            console.log(`\\n❌ ${platform.name} 平台連接失敗，跳過後續測試`);
            platformResults.overallStatus = 'connection_failed';
            return platformResults;
        }
        
        // 2. 身份驗證測試 (僅測試admin用戶)
        const adminAccount = this.testAccounts[0]; // admin
        platformResults.authentication = await this.testUserAuthentication(platform, adminAccount);
        
        // 3. API端點測試
        if (platformResults.authentication.verifySuccess) {
            platformResults.apiTests = await this.testAPIEndpoints(
                platform, 
                platformResults.authentication.token, 
                platformResults.authentication.user.role
            );
        }
        
        // 4. 判定整體狀態
        const authOk = platformResults.authentication.loginSuccess && platformResults.authentication.verifySuccess;
        const connectOk = connectivityPassed;
        const apiOk = platformResults.apiTests && Object.keys(platformResults.apiTests).length > 0;
        
        if (authOk && connectOk && apiOk) {
            platformResults.overallStatus = 'fully_functional';
        } else if (connectOk && authOk) {
            platformResults.overallStatus = 'partially_functional';
        } else if (connectOk) {
            platformResults.overallStatus = 'connectivity_only';
        } else {
            platformResults.overallStatus = 'failed';
        }
        
        console.log(`\\n📊 ${platform.name} 測試完成 - 狀態: ${platformResults.overallStatus.toUpperCase()}`);
        
        return platformResults;
    }

    async runAllPlatformTests() {
        console.log('🚀 啟動三平台企業管理系統功能驗證');
        console.log('📅 測試時間:', new Date().toLocaleString('zh-TW'));
        
        const allResults = {
            testTime: new Date().toISOString(),
            platforms: [],
            summary: {
                totalPlatforms: this.platforms.length,
                fullyFunctional: 0,
                partiallyFunctional: 0,
                connectivityOnly: 0,
                failed: 0
            }
        };
        
        for (const platform of this.platforms) {
            const result = await this.testCompletePlatform(platform);
            allResults.platforms.push(result);
            
            // 更新統計
            switch (result.overallStatus) {
                case 'fully_functional':
                    allResults.summary.fullyFunctional++;
                    break;
                case 'partially_functional':
                    allResults.summary.partiallyFunctional++;
                    break;
                case 'connectivity_only':
                    allResults.summary.connectivityOnly++;
                    break;
                default:
                    allResults.summary.failed++;
                    break;
            }
            
            // 平台間延遲
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        return allResults;
    }

    displayFinalSummary(results) {
        console.log('\\n🎯 =============== 三平台驗證最終摘要 ===============');
        console.log('📅 測試完成時間:', new Date().toLocaleString('zh-TW'));
        
        console.log('\\n📊 平台狀態統計:');
        console.log(`  🟢 完全功能正常: ${results.summary.fullyFunctional}/${results.summary.totalPlatforms}`);
        console.log(\`  🟡 部分功能正常: \${results.summary.partiallyFunctional}/\${results.summary.totalPlatforms}\`);
        console.log(\`  🔵 僅連接正常: \${results.summary.connectivityOnly}/\${results.summary.totalPlatforms}\`);
        console.log(\`  🔴 連接失敗: \${results.summary.failed}/\${results.summary.totalPlatforms}\`);
        
        console.log('\\n🌍 平台詳細結果:');
        results.platforms.forEach((platform, index) => {
            const statusEmoji = {
                'fully_functional': '🟢',
                'partially_functional': '🟡', 
                'connectivity_only': '🔵',
                'failed': '🔴'
            }[platform.overallStatus] || '⚫';
            
            console.log(\`  \${index + 1}. \${statusEmoji} \${platform.platform}: \${platform.overallStatus.toUpperCase()}\`);
            console.log(\`     網址: \${platform.baseUrl}\`);
            
            if (platform.authentication && platform.authentication.loginSuccess) {
                console.log(\`     ✅ 身份驗證: 正常\`);
            } else {
                console.log(\`     ❌ 身份驗證: 異常\`);
            }
        });
        
        console.log('\\n🎯 使用建議:');
        const workingPlatforms = results.platforms.filter(p => 
            p.overallStatus === 'fully_functional' || p.overallStatus === 'partially_functional'
        );
        
        if (workingPlatforms.length > 0) {
            console.log('✅ 推薦使用以下正常運作的平台:');
            workingPlatforms.forEach(platform => {
                console.log(\`   🌍 \${platform.platform}: \${platform.baseUrl}\`);
            });
        } else {
            console.log('⚠️ 目前沒有完全正常運作的平台，建議進行修復');
        }
        
        const successRate = ((results.summary.fullyFunctional + results.summary.partiallyFunctional) / results.summary.totalPlatforms * 100).toFixed(1);
        console.log(\`\\n📈 整體成功率: \${successRate}% (\${results.summary.fullyFunctional + results.summary.partiallyFunctional}/\${results.summary.totalPlatforms})\`);
        
        return results;
    }

    async saveResults(results) {
        const fs = require('fs');
        const filename = \`three-platform-verification-\${Date.now()}.json\`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(\`\\n📄 詳細測試結果已保存: \${filename}\`);
        return filename;
    }
}

// 執行三平台驗證測試
async function runThreePlatformVerification() {
    const tester = new ThreePlatformVerificationTester();
    
    try {
        const results = await tester.runAllPlatformTests();
        tester.displayFinalSummary(results);
        await tester.saveResults(results);
        
        // 判定測試是否成功
        const hasWorkingPlatform = results.summary.fullyFunctional > 0 || results.summary.partiallyFunctional > 0;
        
        if (hasWorkingPlatform) {
            console.log('\\n🎉 三平台驗證測試完成！至少有一個平台正常運作。');
            return true;
        } else {
            console.log('\\n⚠️ 三平台驗證測試完成，但沒有正常運作的平台。');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 三平台驗證測試過程中發生錯誤:', error);
        return false;
    }
}

// 如果直接執行此檔案
if (require.main === module) {
    runThreePlatformVerification().catch(console.error);
}

module.exports = ThreePlatformVerificationTester;
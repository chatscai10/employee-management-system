/**
 * 🧪 API端點測試器
 * 全面測試所有API端點的功能性
 */

const http = require('http');

class APIEndpointTester {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.testResults = [];
        this.authToken = null;
    }

    async runAllTests() {
        console.log('🧪 啟動API端點全面測試...');
        console.log('═'.repeat(80));

        try {
            // 1. 測試基本端點
            await this.testBasicEndpoints();
            
            // 2. 測試認證流程
            await this.testAuthentication();
            
            // 3. 測試受保護的端點
            await this.testProtectedEndpoints();
            
            // 4. 生成測試報告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ API測試執行失敗:', error.message);
        }
    }

    async testBasicEndpoints() {
        console.log('📋 測試基本端點...');
        
        const basicEndpoints = [
            { method: 'GET', path: '/', name: '首頁' },
            { method: 'GET', path: '/health', name: '健康檢查' },
            { method: 'GET', path: '/login', name: '登入頁面' },
            { method: 'GET', path: '/dashboard', name: '儀表板' },
            { method: 'GET', path: '/api/system/status', name: '系統狀態' },
            { method: 'GET', path: '/api/docs', name: 'API文檔' }
        ];

        for (const endpoint of basicEndpoints) {
            await this.testEndpoint(endpoint);
        }
    }

    async testAuthentication() {
        console.log('🔐 測試認證流程...');
        
        // 測試登入
        const loginData = {
            username: 'admin',
            password: 'admin123'
        };

        const loginResult = await this.testPOSTEndpoint({
            path: '/api/auth/login',
            name: '管理員登入',
            data: loginData
        });

        if (loginResult.success && loginResult.data.token) {
            this.authToken = loginResult.data.token;
            console.log('✅ 成功獲取認證令牌');
        }
    }

    async testProtectedEndpoints() {
        console.log('🛡️ 測試受保護端點...');
        
        const protectedEndpoints = [
            { method: 'GET', path: '/api/employees', name: '員工列表' },
            { method: 'GET', path: '/api/attendance', name: '考勤記錄' },
            { method: 'GET', path: '/api/inventory', name: '庫存查詢' },
            { method: 'GET', path: '/api/maintenance', name: '維修申請' },
            { method: 'GET', path: '/api/schedules', name: '排班查詢' },
            { method: 'GET', path: '/api/orders', name: '採購申請' },
            { method: 'GET', path: '/api/revenue', name: '營收分析' },
            { method: 'GET', path: '/api/promotion-votes', name: '升遷投票' }
        ];

        for (const endpoint of protectedEndpoints) {
            await this.testEndpoint(endpoint, true);
        }
    }

    async testEndpoint(endpoint, requireAuth = false) {
        try {
            const options = {
                hostname: 'localhost',
                port: 8080,
                path: endpoint.path,
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (requireAuth && this.authToken) {
                options.headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const result = await this.makeRequest(options);
            
            this.testResults.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                status: result.statusCode,
                success: result.statusCode >= 200 && result.statusCode < 400,
                responseTime: result.responseTime,
                contentLength: result.data ? result.data.length : 0,
                requireAuth,
                hasAuth: !!this.authToken
            });

            const statusIcon = result.statusCode >= 200 && result.statusCode < 400 ? '✅' : 
                              result.statusCode === 401 ? '🔐' : '❌';
            
            console.log(`   ${statusIcon} ${endpoint.name}: HTTP ${result.statusCode} (${result.responseTime}ms)`);

        } catch (error) {
            this.testResults.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                status: 'ERROR',
                success: false,
                error: error.message,
                requireAuth,
                hasAuth: !!this.authToken
            });
            
            console.log(`   ❌ ${endpoint.name}: 錯誤 - ${error.message}`);
        }
    }

    async testPOSTEndpoint(config) {
        try {
            const postData = JSON.stringify(config.data);
            
            const options = {
                hostname: 'localhost',
                port: 8080,
                path: config.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const result = await this.makeRequest(options, postData);
            
            this.testResults.push({
                endpoint: config.name,
                path: config.path,
                method: 'POST',
                status: result.statusCode,
                success: result.statusCode >= 200 && result.statusCode < 400,
                responseTime: result.responseTime,
                data: result.data
            });

            const statusIcon = result.statusCode >= 200 && result.statusCode < 400 ? '✅' : '❌';
            console.log(`   ${statusIcon} ${config.name}: HTTP ${result.statusCode} (${result.responseTime}ms)`);

            if (result.data) {
                try {
                    return { success: true, data: JSON.parse(result.data) };
                } catch (e) {
                    return { success: true, data: result.data };
                }
            }

            return { success: result.statusCode >= 200 && result.statusCode < 400 };

        } catch (error) {
            console.log(`   ❌ ${config.name}: 錯誤 - ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    makeRequest(options, postData = null) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    resolve({
                        statusCode: res.statusCode,
                        data,
                        responseTime,
                        headers: res.headers
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('請求超時'));
            });

            if (postData) {
                req.write(postData);
            }
            
            req.end();
        });
    }

    generateTestReport() {
        console.log('\n📊 API端點測試報告');
        console.log('═'.repeat(80));
        
        const totalTests = this.testResults.length;
        const successfulTests = this.testResults.filter(r => r.success).length;
        const failedTests = this.testResults.filter(r => !r.success).length;
        const authRequiredTests = this.testResults.filter(r => r.status === 401 || r.status === 403).length;
        
        console.log(`📋 總測試數: ${totalTests}`);
        console.log(`✅ 成功: ${successfulTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`🔐 需要認證: ${authRequiredTests}`);
        console.log(`📊 成功率: ${Math.round((successfulTests / totalTests) * 100)}%`);
        
        console.log('\n📋 詳細結果:');
        console.log('─'.repeat(80));
        
        this.testResults.forEach(result => {
            const status = result.success ? '✅ 通過' : 
                          result.status === 401 ? '🔐 需認證' : 
                          result.status === 404 ? '❓ 未找到' :
                          '❌ 失敗';
            
            console.log(`${status} | ${result.method.padEnd(4)} ${result.path.padEnd(25)} | ${result.endpoint}`);
            
            if (result.error) {
                console.log(`      錯誤: ${result.error}`);
            }
        });

        // 生成功能性測試建議
        console.log('\n💡 測試建議:');
        console.log('─'.repeat(40));
        
        if (authRequiredTests > 0) {
            console.log('🔐 發現需要認證的端點，這是正常的安全機制');
        }
        
        if (failedTests > 0) {
            console.log('⚠️ 部分端點測試失敗，請檢查伺服器日誌');
        }
        
        if (successfulTests === totalTests) {
            console.log('🎉 所有端點測試通過！系統運行完全正常');
        }

        console.log('\n📋 可用的功能測試:');
        console.log('1. 訪問 http://localhost:8080 查看系統首頁');
        console.log('2. 訪問 http://localhost:8080/login 進行用戶登入');
        console.log('3. 使用 admin/admin123 登入管理員帳戶');
        console.log('4. 訪問 http://localhost:8080/dashboard 查看儀表板');
        console.log('5. 查看 http://localhost:8080/api/docs API文檔');
    }
}

// 執行API測試
async function main() {
    const tester = new APIEndpointTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main();
}

module.exports = APIEndpointTester;
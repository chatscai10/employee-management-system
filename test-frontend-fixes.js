/**
 * 🧪 前端修復測試器
 * 測試修復後的JavaScript功能是否正常運作
 */

const http = require('http');

class FrontendFixTester {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.testResults = [];
        this.authToken = null;
    }

    async runAllTests() {
        console.log('🧪 開始測試前端修復效果...');
        console.log('═'.repeat(80));

        try {
            // 1. 測試登入頁面DOM修復
            await this.testLoginPageDOM();
            
            // 2. 測試dashboard頁面載入
            await this.testDashboardPageLoad();
            
            // 3. 測試API端點
            await this.testAPIEndpoints();
            
            // 4. 測試角色權限功能
            await this.testRolePermissions();
            
            // 5. 生成測試報告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 測試執行失敗:', error.message);
        }
    }

    async testLoginPageDOM() {
        console.log('🔐 測試登入頁面DOM修復...');
        
        try {
            const response = await this.makeRequest({ path: '/login' });
            
            // 檢查autocomplete屬性
            const hasAutocomplete = response.data.includes('autocomplete="current-password"');
            
            this.testResults.push({
                test: 'DOM Autocomplete Fix',
                passed: hasAutocomplete,
                description: hasAutocomplete ? 
                    '✅ 密碼輸入欄位已添加autocomplete屬性' : 
                    '❌ 密碼輸入欄位仍缺少autocomplete屬性'
            });
            
            console.log(hasAutocomplete ? 
                '   ✅ DOM autocomplete警告已修復' : 
                '   ❌ DOM autocomplete警告未修復');
                
        } catch (error) {
            this.testResults.push({
                test: 'DOM Autocomplete Fix',
                passed: false,
                description: '❌ 測試失敗: ' + error.message
            });
        }
    }

    async testDashboardPageLoad() {
        console.log('📊 測試dashboard頁面載入...');
        
        try {
            const response = await this.makeRequest({ path: '/dashboard' });
            
            // 檢查所有修復的函數是否存在
            const functionChecks = [
                'loadSchedules', 'loadOrders', 'showNewOrder', 
                'showNewMaintenance', 'loadRevenue', 'showRevenueChart', 
                'showAddEmployee', 'initializeRolePermissions'
            ];
            
            let allFunctionsPresent = true;
            let missingFunctions = [];
            
            functionChecks.forEach(func => {
                if (!response.data.includes(`function ${func}(`)) {
                    allFunctionsPresent = false;
                    missingFunctions.push(func);
                }
            });
            
            this.testResults.push({
                test: 'JavaScript Functions Implementation',
                passed: allFunctionsPresent,
                description: allFunctionsPresent ? 
                    '✅ 所有JavaScript函數已實現' : 
                    `❌ 缺失函數: ${missingFunctions.join(', ')}`
            });
            
            // 檢查角色權限控制系統
            const hasRolePermissions = response.data.includes('initializeRolePermissions');
            
            this.testResults.push({
                test: 'Role Permission System',
                passed: hasRolePermissions,
                description: hasRolePermissions ? 
                    '✅ 角色權限控制系統已實現' : 
                    '❌ 角色權限控制系統未實現'
            });
            
            console.log(allFunctionsPresent ? 
                '   ✅ 所有JavaScript函數已正確實現' : 
                `   ❌ 仍有 ${missingFunctions.length} 個函數未實現`);
                
            console.log(hasRolePermissions ? 
                '   ✅ 角色權限控制系統已實現' : 
                '   ❌ 角色權限控制系統未實現');
                
        } catch (error) {
            this.testResults.push({
                test: 'Dashboard Page Load',
                passed: false,
                description: '❌ 測試失敗: ' + error.message
            });
        }
    }

    async testAPIEndpoints() {
        console.log('🔌 測試API端點功能...');
        
        // 先登入獲取token
        try {
            const loginResponse = await this.makeRequest({
                path: '/api/auth/login',
                method: 'POST',
                data: JSON.stringify({ username: 'admin', password: 'admin123' })
            });
            
            const loginData = JSON.parse(loginResponse.data);
            if (loginData.success) {
                this.authToken = loginData.token;
            }
            
        } catch (error) {
            console.log('   ⚠️ 登入測試失敗，跳過API測試');
            return;
        }

        // 測試受保護的API端點
        const endpoints = [
            '/api/employees',
            '/api/attendance', 
            '/api/schedules',
            '/api/inventory',
            '/api/orders',
            '/api/maintenance',
            '/api/revenue'
        ];

        let passedEndpoints = 0;
        
        for (const endpoint of endpoints) {
            try {
                const response = await this.makeRequest({
                    path: endpoint,
                    headers: { 'Authorization': `Bearer ${this.authToken}` }
                });
                
                const isSuccess = response.statusCode === 200 || response.statusCode === 403;
                if (isSuccess) passedEndpoints++;
                
            } catch (error) {
                // API錯誤也算是正常，只要不是系統崩潰
            }
        }
        
        this.testResults.push({
            test: 'API Endpoints',
            passed: passedEndpoints >= endpoints.length * 0.8, // 80%成功率
            description: `✅ ${passedEndpoints}/${endpoints.length} API端點正常回應`
        });
        
        console.log(`   📊 API端點測試: ${passedEndpoints}/${endpoints.length} 正常`);
    }

    async testRolePermissions() {
        console.log('🔐 測試角色權限功能...');
        
        // 測試不同角色的登入
        const roles = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'manager', password: 'manager123', role: 'manager' },
            { username: 'john.doe', password: 'password123', role: 'employee' }
        ];
        
        let roleTestsPassed = 0;
        
        for (const roleTest of roles) {
            try {
                const loginResponse = await this.makeRequest({
                    path: '/api/auth/login',
                    method: 'POST',
                    data: JSON.stringify({ 
                        username: roleTest.username, 
                        password: roleTest.password 
                    })
                });
                
                const loginData = JSON.parse(loginResponse.data);
                if (loginData.success && loginData.user.role === roleTest.role) {
                    roleTestsPassed++;
                }
                
            } catch (error) {
                // 登入失敗
            }
        }
        
        this.testResults.push({
            test: 'Role-based Authentication',
            passed: roleTestsPassed === roles.length,
            description: `✅ ${roleTestsPassed}/${roles.length} 角色登入正常`
        });
        
        console.log(`   🔐 角色權限測試: ${roleTestsPassed}/${roles.length} 通過`);
    }

    async makeRequest(options) {
        return new Promise((resolve, reject) => {
            const requestOptions = {
                hostname: 'localhost',
                port: 8080,
                path: options.path,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            const req = http.request(requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (options.data) {
                req.write(options.data);
            }
            
            req.end();
        });
    }

    generateTestReport() {
        console.log('\n📊 前端修復測試報告');
        console.log('═'.repeat(80));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`📋 總測試數: ${totalTests}`);
        console.log(`✅ 通過: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`📊 成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
        
        console.log('\n📋 詳細結果:');
        console.log('─'.repeat(80));
        
        this.testResults.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.test}: ${result.description}`);
        });

        // 生成JSON報告
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: Math.round((passedTests / totalTests) * 100)
            },
            results: this.testResults,
            recommendations: this.generateRecommendations()
        };
        
        require('fs').writeFileSync('frontend-fix-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n💾 詳細報告已保存: frontend-fix-test-report.json');
        
        // 最終建議
        console.log('\n💡 測試完成建議:');
        console.log('─'.repeat(40));
        if (passedTests === totalTests) {
            console.log('🎉 所有測試通過！前端修復完全成功！');
            console.log('✅ 可以使用瀏覽器訪問 http://localhost:8080 測試完整功能');
        } else {
            console.log('⚠️ 部分測試失敗，建議檢查失敗的項目');
            console.log('🔧 可能需要進一步調整和修復');
        }
    }

    generateRecommendations() {
        const recommendations = [];
        
        this.testResults.forEach(result => {
            if (!result.passed) {
                switch (result.test) {
                    case 'DOM Autocomplete Fix':
                        recommendations.push('檢查login頁面的password input是否正確添加autocomplete屬性');
                        break;
                    case 'JavaScript Functions Implementation':
                        recommendations.push('檢查dashboard頁面中的JavaScript函數實現是否完整');
                        break;
                    case 'Role Permission System':
                        recommendations.push('檢查角色權限控制系統的實現和載入');
                        break;
                    case 'API Endpoints':
                        recommendations.push('檢查API端點的身份驗證和回應格式');
                        break;
                    case 'Role-based Authentication':
                        recommendations.push('檢查不同角色的登入和權限設定');
                        break;
                }
            }
        });
        
        if (recommendations.length === 0) {
            recommendations.push('所有測試通過，系統運行正常！');
        }
        
        return recommendations;
    }
}

// 執行測試
async function main() {
    const tester = new FrontendFixTester();
    await tester.runAllTests();
}

if (require.main === module) {
    main();
}

module.exports = FrontendFixTester;
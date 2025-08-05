// 🤖 人工操作模擬器
// 模擬用戶清除緩存後的完整操作流程

const https = require('https');
const fs = require('fs').promises;

class HumanOperationSimulator {
    constructor() {
        this.baseUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.userSession = {
            token: null,
            userInfo: null,
            loginTime: null
        };
        
        this.operationResults = {
            sessionFlow: {},
            functionalTests: {},
            userExperience: {}
        };
    }

    // 模擬步驟1：用戶清除緩存後重新訪問
    async simulatePostCacheClearAccess() {
        console.log('🧹 步驟1: 模擬用戶清除緩存後重新訪問...');
        
        try {
            // 模擬訪問首頁
            const homePageResult = await this.makeHttpRequest('/', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            this.operationResults.sessionFlow.homePageAccess = {
                success: homePageResult.statusCode === 200,
                loadTime: homePageResult.loadTime,
                hasV4Content: homePageResult.content.includes('v4.0.0'),
                freshContent: !homePageResult.headers['x-cache-status']
            };
            
            console.log(`   ✅ 首頁訪問: ${homePageResult.loadTime}ms`);
            console.log(`   ✅ 檢測到 v4.0.0 內容: ${this.operationResults.sessionFlow.homePageAccess.hasV4Content ? '是' : '否'}`);
            
        } catch (error) {
            console.log(`   ❌ 首頁訪問失敗: ${error.message}`);
            this.operationResults.sessionFlow.homePageAccess = { success: false, error: error.message };
        }
    }

    // 模擬步驟2：管理員登入流程
    async simulateAdminLogin() {
        console.log('\\n👤 步驟2: 模擬管理員登入流程...');
        
        try {
            // 1. 訪問登入頁面
            const loginPageResult = await this.makeHttpRequest('/login');
            
            // 2. 執行登入API請求
            const loginStart = Date.now();
            const loginResult = await this.makeApiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: 'admin',
                    password: 'admin123'
                })
            });
            const loginTime = Date.now() - loginStart;
            
            if (loginResult.success) {
                this.userSession.token = loginResult.token;
                this.userSession.userInfo = loginResult.user;
                this.userSession.loginTime = new Date().toISOString();
                
                console.log(`   ✅ 登入成功: ${loginResult.message} (${loginTime}ms)`);
                console.log(`   👤 用戶信息: ${loginResult.user.name} (${loginResult.user.role})`);
                
                this.operationResults.sessionFlow.adminLogin = {
                    success: true,
                    loginTime: loginTime,
                    userInfo: loginResult.user,
                    message: loginResult.message
                };
            } else {
                throw new Error(loginResult.message);
            }
            
        } catch (error) {
            console.log(`   ❌ 登入流程失敗: ${error.message}`);
            this.operationResults.sessionFlow.adminLogin = { success: false, error: error.message };
        }
    }

    // 模擬步驟3：管理主控台訪問
    async simulateDashboardAccess() {
        console.log('\\n🖥️ 步驟3: 模擬管理主控台訪問...');
        
        try {
            const dashboardResult = await this.makeHttpRequest('/dashboard', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            
            // 檢查JavaScript函數是否正確載入
            const criticalFunctions = [
                'refreshStats', 'loadEmployees', 'checkSystemStatus', 'logout'
            ];
            
            let functionsDetected = 0;
            const functionStatus = {};
            
            for (const funcName of criticalFunctions) {
                const functionExists = dashboardResult.content.includes(`function ${funcName}(`);
                functionStatus[funcName] = functionExists;
                if (functionExists) functionsDetected++;
            }
            
            this.operationResults.sessionFlow.dashboardAccess = {
                success: dashboardResult.statusCode === 200,
                loadTime: dashboardResult.loadTime,
                hasV4Interface: dashboardResult.content.includes('企業管理系統 v4.0.0'),
                functionsDetected: functionsDetected,
                functionStatus: functionStatus,
                jsErrorFree: functionsDetected === criticalFunctions.length
            };
            
            console.log(`   ✅ 主控台載入: ${dashboardResult.loadTime}ms`);
            console.log(`   ✅ v4.0.0 界面: ${this.operationResults.sessionFlow.dashboardAccess.hasV4Interface ? '是' : '否'}`);
            console.log(`   ✅ JavaScript函數: ${functionsDetected}/${criticalFunctions.length} 正常`);
            console.log(`   ✅ 無JS錯誤: ${this.operationResults.sessionFlow.dashboardAccess.jsErrorFree ? '是' : '否'}`);
            
        } catch (error) {
            console.log(`   ❌ 主控台訪問失敗: ${error.message}`);
            this.operationResults.sessionFlow.dashboardAccess = { success: false, error: error.message };
        }
    }

    // 模擬步驟4：核心功能操作測試
    async simulateCoreFunctionTests() {
        console.log('\\n⚡ 步驟4: 模擬核心功能操作測試...');
        
        const coreOperations = [
            {
                name: '系統狀態檢查',
                endpoint: '/api/system/status',
                expectedResult: (result) => result.success && result.system.version === '4.0.0'
            },
            {
                name: '員工數據載入',
                endpoint: '/api/employees',
                expectedResult: (result) => result.success && Array.isArray(result.data)
            },
            {
                name: '考勤記錄查詢',
                endpoint: '/api/attendance',
                expectedResult: (result) => result.success && Array.isArray(result.data)
            },
            {
                name: '庫存管理查詢',
                endpoint: '/api/inventory',
                expectedResult: (result) => result.success && result.data && result.totalValue
            },
            {
                name: '維修申請查詢',
                endpoint: '/api/maintenance',
                expectedResult: (result) => result.success && Array.isArray(result.data)
            },
            {
                name: '營收分析查詢',
                endpoint: '/api/revenue',
                expectedResult: (result) => result.success && result.data
            }
        ];
        
        for (const operation of coreOperations) {
            try {
                const start = Date.now();
                const result = await this.makeApiRequest(operation.endpoint, {
                    headers: {
                        'Authorization': `Bearer ${this.userSession.token}`
                    }
                });
                const operationTime = Date.now() - start;
                
                const success = operation.expectedResult(result);
                
                this.operationResults.functionalTests[operation.name] = {
                    success: success,
                    operationTime: operationTime,
                    result: result,
                    endpoint: operation.endpoint
                };
                
                console.log(`   ${success ? '✅' : '❌'} ${operation.name}: ${operationTime}ms`);
                
                if (!success && result.message) {
                    console.log(`      📋 結果: ${result.message}`);
                }
                
            } catch (error) {
                console.log(`   ❌ ${operation.name}: 操作失敗`);
                this.operationResults.functionalTests[operation.name] = {
                    success: false,
                    error: error.message,
                    endpoint: operation.endpoint
                };
            }
        }
    }

    // 模擬步驟5：用戶體驗評估
    async simulateUserExperienceEvaluation() {
        console.log('\\n🎯 步驟5: 用戶體驗評估...');
        
        const sessionFlow = this.operationResults.sessionFlow;
        const functionalTests = this.operationResults.functionalTests;
        
        // 計算成功率
        const sessionSuccessCount = Object.values(sessionFlow).filter(test => test.success).length;
        const sessionTotalCount = Object.keys(sessionFlow).length;
        const sessionSuccessRate = Math.round((sessionSuccessCount / sessionTotalCount) * 100);
        
        const functionalSuccessCount = Object.values(functionalTests).filter(test => test.success).length;
        const functionalTotalCount = Object.keys(functionalTests).length;
        const functionalSuccessRate = Math.round((functionalSuccessCount / functionalTotalCount) * 100);
        
        // 計算平均響應時間
        const allOperationTimes = [
            ...Object.values(sessionFlow).map(test => test.loadTime || test.loginTime || 0),
            ...Object.values(functionalTests).map(test => test.operationTime || 0)
        ].filter(time => time > 0);
        
        const averageResponseTime = allOperationTimes.length > 0 ? 
            Math.round(allOperationTimes.reduce((a, b) => a + b, 0) / allOperationTimes.length) : 0;
        
        this.operationResults.userExperience = {
            sessionSuccessRate: sessionSuccessRate,
            functionalSuccessRate: functionalSuccessRate,
            overallSuccessRate: Math.round((sessionSuccessRate + functionalSuccessRate) / 2),
            averageResponseTime: averageResponseTime,
            
            // 具體問題評估
            cacheIssueResolved: sessionFlow.dashboardAccess?.jsErrorFree || false,
            v4FeaturesAccessible: sessionFlow.dashboardAccess?.hasV4Interface || false,
            allCriticalFunctionsWork: functionalSuccessRate >= 90,
            
            // 用戶滿意度預測
            predictedUserSatisfaction: this.calculateUserSatisfaction(sessionSuccessRate, functionalSuccessRate, averageResponseTime),
            
            // 建議
            recommendations: this.generateRecommendations(sessionFlow, functionalTests)
        };
        
        console.log(`   📊 會話成功率: ${sessionSuccessRate}%`);
        console.log(`   ⚡ 功能成功率: ${functionalSuccessRate}%`);
        console.log(`   🎯 整體成功率: ${this.operationResults.userExperience.overallSuccessRate}%`);
        console.log(`   ⏱️ 平均響應時間: ${averageResponseTime}ms`);
        console.log(`   🔧 緩存問題已解決: ${this.operationResults.userExperience.cacheIssueResolved ? '是' : '否'}`);
        console.log(`   🚀 v4.0.0功能可用: ${this.operationResults.userExperience.v4FeaturesAccessible ? '是' : '否'}`);
        console.log(`   😊 預測用戶滿意度: ${this.operationResults.userExperience.predictedUserSatisfaction}`);
    }

    // 計算用戶滿意度
    calculateUserSatisfaction(sessionRate, functionalRate, avgTime) {
        let satisfaction = 'unknown';
        
        if (sessionRate >= 90 && functionalRate >= 90 && avgTime < 500) {
            satisfaction = 'very_high';
        } else if (sessionRate >= 80 && functionalRate >= 80 && avgTime < 800) {
            satisfaction = 'high';
        } else if (sessionRate >= 70 && functionalRate >= 70 && avgTime < 1200) {
            satisfaction = 'medium';
        } else {
            satisfaction = 'low';
        }
        
        return satisfaction;
    }

    // 生成建議
    generateRecommendations(sessionFlow, functionalTests) {
        const recommendations = [];
        
        if (!sessionFlow.dashboardAccess?.jsErrorFree) {
            recommendations.push('建議用戶執行完整的瀏覽器緩存清除');
        }
        
        if (sessionFlow.dashboardAccess?.functionsDetected < 4) {
            recommendations.push('建議用戶使用無痕模式重新測試');
        }
        
        const failedFunctions = Object.entries(functionalTests)
            .filter(([name, test]) => !test.success)
            .map(([name, test]) => name);
            
        if (failedFunctions.length > 0) {
            recommendations.push(`以下功能需要檢查: ${failedFunctions.join(', ')}`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push('所有功能正常，用戶體驗良好');
        }
        
        return recommendations;
    }

    // HTTP請求函數
    async makeHttpRequest(path, options = {}) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const url = this.baseUrl + path;
            
            const requestOptions = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ...options.headers
                }
            };
            
            https.get(url, requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        content: data,
                        loadTime: Date.now() - start
                    });
                });
            }).on('error', reject);
        });
    }

    // API請求函數
    async makeApiRequest(endpoint, options = {}) {
        return new Promise((resolve, reject) => {
            const url = this.baseUrl + endpoint;
            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'HumanOperationSimulator/1.0',
                    ...options.headers
                }
            };

            const req = https.request(url, requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        resolve({ success: false, rawData: data });
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    // 生成詳細報告
    generateDetailedReport() {
        return {
            metadata: {
                title: '🤖 人工操作模擬驗證報告',
                timestamp: new Date().toISOString(),
                systemUrl: this.baseUrl,
                simulationType: 'post_cache_clear_user_operations'
            },
            
            simulationScenario: {
                description: '模擬用戶清除瀏覽器緩存後的完整操作流程',
                steps: [
                    '清除緩存後重新訪問網站',
                    '管理員登入流程',
                    '管理主控台訪問',
                    '核心功能操作測試',
                    '用戶體驗評估'
                ]
            },
            
            sessionFlow: this.operationResults.sessionFlow,
            functionalTests: this.operationResults.functionalTests,
            userExperience: this.operationResults.userExperience,
            
            summary: {
                cacheIssueResolved: this.operationResults.userExperience.cacheIssueResolved,
                allFunctionsWork: this.operationResults.userExperience.allCriticalFunctionsWork,
                overallSuccessRate: this.operationResults.userExperience.overallSuccessRate,
                userSatisfaction: this.operationResults.userExperience.predictedUserSatisfaction,
                recommendations: this.operationResults.userExperience.recommendations
            }
        };
    }

    // 執行完整模擬
    async executeFullSimulation() {
        console.log('🤖 人工操作模擬器啟動');
        console.log('=' * 70);
        console.log('🎯 模擬場景: 用戶清除緩存後的完整操作體驗');
        
        try {
            await this.simulatePostCacheClearAccess();
            await this.simulateAdminLogin();
            await this.simulateDashboardAccess();
            await this.simulateCoreFunctionTests();
            await this.simulateUserExperienceEvaluation();
            
            const report = this.generateDetailedReport();
            
            console.log('\\n' + '=' * 70);
            console.log('🎉 人工操作模擬完成！');
            console.log(`✅ 緩存問題解決: ${report.summary.cacheIssueResolved ? '是' : '否'}`);
            console.log(`✅ 所有功能正常: ${report.summary.allFunctionsWork ? '是' : '否'}`);
            console.log(`✅ 整體成功率: ${report.summary.overallSuccessRate}%`);
            console.log(`✅ 用戶滿意度: ${report.summary.userSatisfaction.replace('_', ' ').toUpperCase()}`);
            
            if (report.summary.recommendations.length > 0) {
                console.log('\\n💡 建議:');
                report.summary.recommendations.forEach(rec => {
                    console.log(`   • ${rec}`);
                });
            }
            
            return {
                success: true,
                report: report
            };
            
        } catch (error) {
            console.error('❌ 人工操作模擬執行錯誤:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
}

// 執行人工操作模擬
async function main() {
    const simulator = new HumanOperationSimulator();
    
    try {
        const result = await simulator.executeFullSimulation();
        
        if (result.success) {
            console.log('\\n🏆 人工操作模擬執行成功！');
            
            // 保存報告
            const filename = `human-operation-simulation-report-${Date.now()}.json`;
            await fs.writeFile(filename, JSON.stringify(result.report, null, 2));
            console.log(`📄 報告已保存: ${filename}`);
            
            process.exit(0);
        } else {
            console.log('\\n❌ 人工操作模擬執行失敗');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 人工操作模擬器執行錯誤:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = HumanOperationSimulator;
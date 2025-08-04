// 🔍 智慧驗證引擎 v2.0 - 真實網址完整功能測試
// 專為確定性部署修復後的深度驗證而設計

const https = require('https');
const fs = require('fs').promises;

class SmartVerificationEngineV2 {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.testSuite = {
            basic: [
                { path: '/', name: '主頁載入', expectedStatus: 200 },
                { path: '/health', name: '系統健康檢查', expectedStatus: 200 },
                { path: '/api/health', name: 'API健康檢查', expectedStatus: 200 }
            ],
            api: [
                { path: '/api/products', name: '產品管理API', expectedStatus: 200 },
                { path: '/api/inventory', name: '庫存管理API', expectedStatus: 200 },
                { path: '/api/login', name: '登入頁面', expectedStatus: 200 }
            ],
            advanced: [
                { 
                    path: '/api/login', 
                    method: 'POST', 
                    name: '員工登入功能',
                    body: { username: 'test', password: '123456' },
                    expectedStatus: 200
                },
                { 
                    path: '/api/login', 
                    method: 'POST', 
                    name: '錯誤登入測試',
                    body: { username: 'wrong', password: 'wrong' },
                    expectedStatus: 401
                }
            ]
        };
        this.results = {
            basic: [],
            api: [],
            advanced: [],
            summary: {}
        };
    }

    async testEndpoint({ path, method = 'GET', name, expectedStatus, body = null }) {
        return new Promise((resolve) => {
            const url = this.serviceUrl + path;
            const options = {
                method,
                headers: {
                    'User-Agent': 'Smart-Verification-Engine-v2.0',
                    'Accept': 'application/json, text/html, */*'
                }
            };

            if (method === 'POST' && body) {
                options.headers['Content-Type'] = 'application/json';
            }

            console.log(`🔍 測試: ${name} (${method} ${path})`);

            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        name,
                        path,
                        method,
                        expectedStatus,
                        actualStatus: res.statusCode,
                        success: res.statusCode === expectedStatus,
                        responseTime: Date.now() - startTime,
                        contentLength: data.length,
                        contentType: res.headers['content-type'] || 'unknown',
                        timestamp: new Date().toISOString(),
                        // 內容分析
                        isPlaceholder: data.includes('placeholder') || data.includes('unicorn'),
                        isV2System: data.includes('v2.0.0') || data.includes('確定性部署'),
                        hasExpectedContent: this.analyzeContent(data, path),
                        responsePreview: data.substring(0, 200).replace(/\s+/g, ' ').trim()
                    };

                    const statusIcon = result.success ? '✅' : '❌';
                    const timeColor = result.responseTime < 500 ? '⚡' : result.responseTime < 2000 ? '🕐' : '🐌'; 
                    
                    console.log(`   ${statusIcon} ${result.actualStatus} (期望 ${expectedStatus}) ${timeColor}${result.responseTime}ms`);
                    
                    if (result.isV2System) {
                        console.log(`   🎯 檢測到 v2.0.0 確定性部署版本`);
                    }
                    
                    if (result.isPlaceholder) {
                        console.log(`   ⚠️ 仍顯示佔位頁面`);
                    }

                    resolve(result);
                });
            });

            const startTime = Date.now();

            req.on('error', (error) => {
                console.log(`   ❌ 連接失敗: ${error.message}`);
                resolve({
                    name,
                    path,
                    method,
                    expectedStatus,
                    actualStatus: 0,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });

            req.setTimeout(15000, () => {
                req.destroy();
                console.log(`   ⏰ 請求超時`);
                resolve({
                    name,
                    path, 
                    method,
                    expectedStatus,
                    actualStatus: 0,
                    success: false,
                    error: 'timeout',
                    timestamp: new Date().toISOString()
                });
            });

            if (method === 'POST' && body) {
                req.write(JSON.stringify(body));
            }

            req.end();
        });
    }

    analyzeContent(content, path) {
        const patterns = {
            '/': ['企業員工管理系統', '確定性部署', 'v2.0.0'],
            '/health': ['healthy', 'status', 'Google Cloud Run'],
            '/api/health': ['healthy', 'status', 'v2.0.0'],
            '/api/products': ['success', 'data', '筆記本電腦'],
            '/api/inventory': ['success', 'data', '倉庫'],
            '/api/login': ['登入系統', '測試帳號', 'test']
        };

        const expectedPatterns = patterns[path] || [];
        return expectedPatterns.some(pattern => content.includes(pattern));
    }

    async runBasicTests() {
        console.log('\n🔵 執行基礎功能測試...');
        console.log('─'.repeat(50));
        
        for (const test of this.testSuite.basic) {
            const result = await this.testEndpoint(test);
            this.results.basic.push(result);
            await this.delay(1000); // 避免過於頻繁的請求
        }
    }

    async runApiTests() {
        console.log('\n🟢 執行 API 功能測試...');
        console.log('─'.repeat(50));
        
        for (const test of this.testSuite.api) {
            const result = await this.testEndpoint(test);
            this.results.api.push(result);
            await this.delay(1000);
        }
    }

    async runAdvancedTests() {
        console.log('\n🟡 執行進階功能測試...');
        console.log('─'.repeat(50));
        
        for (const test of this.testSuite.advanced) {
            const result = await this.testEndpoint(test);
            this.results.advanced.push(result);
            await this.delay(1500);
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateSummary() {
        const allResults = [
            ...this.results.basic,
            ...this.results.api,
            ...this.results.advanced
        ];

        const summary = {
            totalTests: allResults.length,
            successfulTests: allResults.filter(r => r.success).length,
            failedTests: allResults.filter(r => !r.success).length,
            averageResponseTime: Math.round(
                allResults.filter(r => r.responseTime)
                         .reduce((sum, r) => sum + r.responseTime, 0) / 
                allResults.filter(r => r.responseTime).length
            ),
            v2SystemDetected: allResults.some(r => r.isV2System),
            placeholderDetected: allResults.some(r => r.isPlaceholder),
            hasExpectedContent: allResults.filter(r => r.hasExpectedContent).length,
            systemStatus: this.determineSystemStatus(allResults)
        };

        summary.successRate = Math.round((summary.successfulTests / summary.totalTests) * 100);
        
        this.results.summary = summary;
        return summary;
    }

    determineSystemStatus(results) {
        const successRate = (results.filter(r => r.success).length / results.length) * 100;
        const hasV2System = results.some(r => r.isV2System);
        const hasPlaceholder = results.some(r => r.isPlaceholder);
        
        if (hasPlaceholder) {
            return {
                status: 'BUILD_IN_PROGRESS',
                message: '🔄 構建仍在進行中，顯示佔位頁面',
                confidence: 'low'
            };
        } else if (hasV2System && successRate >= 80) {
            return {
                status: 'DEFINITIVE_FIX_SUCCESS',
                message: '🎉 確定性修復成功！v2.0.0 系統正常運行',
                confidence: 'high'
            };
        } else if (successRate >= 60) {
            return {
                status: 'PARTIAL_SUCCESS',
                message: '⚠️ 部分功能正常，可能需要進一步調整',
                confidence: 'medium'
            };
        } else {
            return {
                status: 'DEPLOYMENT_FAILED',
                message: '❌ 部署失敗，需要檢查構建日誌',
                confidence: 'low'
            };
        }
    }

    async runCompleteVerification() {
        console.log('🔍 智慧驗證引擎 v2.0 - 確定性部署修復驗證');
        console.log('═'.repeat(70));
        console.log(`📍 目標服務: ${this.serviceUrl}`);
        console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
        
        // 執行所有測試套件
        await this.runBasicTests();
        await this.runApiTests();
        await this.runAdvancedTests();
        
        // 生成摘要
        const summary = this.generateSummary();
        
        console.log('\n📊 智慧驗證結果摘要');
        console.log('═'.repeat(70));
        console.log(`🎯 系統狀態: ${summary.systemStatus.status}`);
        console.log(`📝 狀態說明: ${summary.systemStatus.message}`);
        console.log(`📈 成功率: ${summary.successRate}% (${summary.successfulTests}/${summary.totalTests})`);
        console.log(`⚡ 平均回應時間: ${summary.averageResponseTime}ms`);
        console.log(`🎯 v2.0.0 系統: ${summary.v2SystemDetected ? '✅ 檢測到' : '❌ 未檢測到'}`);
        console.log(`⚠️ 佔位頁面: ${summary.placeholderDetected ? '❌ 仍存在' : '✅ 已消失'}`);
        console.log(`📋 內容驗證: ${summary.hasExpectedContent}/${summary.totalTests} 通過`);
        
        // 詳細結果
        if (summary.failedTests > 0) {
            console.log('\n❌ 失敗的測試:');
            const failedResults = [
                ...this.results.basic,
                ...this.results.api,
                ...this.results.advanced
            ].filter(r => !r.success);
            
            failedResults.forEach(result => {
                console.log(`   - ${result.name}: ${result.error || result.actualStatus}`);
            });
        }
        
        // 生成建議
        console.log('\n💡 建議行動:');
        if (summary.systemStatus.status === 'DEFINITIVE_FIX_SUCCESS') {
            console.log('   🎉 確定性修復完全成功！');
            console.log('   ✅ 系統已完全恢復正常運行');
            console.log('   🧪 可以開始使用所有功能');
            console.log('   🔐 測試帳號: test/123456, admin/admin123, demo/demo');
        } else if (summary.systemStatus.status === 'BUILD_IN_PROGRESS') {
            console.log('   ⏰ 等待 5-10 分鐘讓構建完成');
            console.log('   🔄 重新運行驗證確認結果');
        } else {
            console.log('   🔍 檢查 Google Cloud Build 日誌');
            console.log('   🔧 可能需要進一步調整配置');
        }
        
        return {
            summary,
            details: this.results,
            timestamp: new Date().toISOString()
        };
    }

    async saveVerificationReport(report) {
        const filename = `smart-verification-report-v2-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        try {
            await fs.writeFile(filename, JSON.stringify(report, null, 2));
            console.log(`\n📄 詳細驗證報告已保存: ${filename}`);
        } catch (error) {
            console.log(`❌ 保存報告失敗: ${error.message}`);
        }
        
        return filename;
    }
}

// 立即執行完整智慧驗證
async function main() {
    const verifier = new SmartVerificationEngineV2();
    
    try {
        const report = await verifier.runCompleteVerification();
        await verifier.saveVerificationReport(report);
        
        console.log('\n🎯 智慧驗證引擎 v2.0 執行完成！');
        
        // 返回驗證結果供外部使用
        return report;
        
    } catch (error) {
        console.error('❌ 智慧驗證執行錯誤:', error);
        return { error: error.message };
    }
}

if (require.main === module) {
    main().then(report => {
        const exitCode = report.summary?.systemStatus?.status === 'DEFINITIVE_FIX_SUCCESS' ? 0 : 1;
        process.exit(exitCode);
    });
}

module.exports = SmartVerificationEngineV2;
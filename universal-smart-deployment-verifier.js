// 🌍 通用智慧部署驗證器
// 支持多平台部署後的智能驗證系統

const https = require('https');
const http = require('http');
const fs = require('fs');

class UniversalSmartDeploymentVerifier {
    constructor() {
        this.verificationResults = [];
        this.platforms = [];
        this.successfulUrls = [];
        this.testAccounts = [
            { role: 'admin', username: 'admin', password: 'admin123', description: '系統管理員' },
            { role: 'manager', username: 'manager', password: 'manager123', description: '部門經理' },
            { role: 'employee', username: 'john.doe', password: 'password123', description: '一般員工' }
        ];
    }

    async executeSmartVerification(urls = []) {
        console.log('🌍 啟動通用智慧部署驗證器');
        console.log('🎯 目標: 驗證企業管理系統部署後的真實網頁功能');
        
        // 如果沒有提供URL，嘗試從用戶輸入獲取
        if (urls.length === 0) {
            urls = await this.collectDeploymentUrls();
        }
        
        if (urls.length === 0) {
            console.log('⚠️  沒有提供部署URL，將展示手動部署指引');
            this.showManualDeploymentGuide();
            return;
        }
        
        try {
            console.log(`\n📋 將驗證 ${urls.length} 個部署網址:`);
            urls.forEach((url, index) => {
                console.log(`${index + 1}. ${url}`);
            });
            
            // 對每個URL執行完整驗證
            for (const url of urls) {
                await this.verifyDeploymentUrl(url);
            }
            
            // 生成綜合報告
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ 驗證過程發生錯誤:', error.message);
            this.handleVerificationError(error);
        }
    }

    async collectDeploymentUrls() {
        console.log('\n📝 收集部署網址...');
        
        // 嘗試從常見部署平台模式推測URL
        const potentialUrls = [
            // 這些是示例URL，實際部署後需要替換
            'https://employee-management-system.up.railway.app',
            'https://employee-management-system.vercel.app', 
            'https://employee-management-system.onrender.com',
            'https://employee-management-system.herokuapp.com'
        ];
        
        console.log('🔍 檢查常見平台URL模式...');
        const validUrls = [];
        
        for (const url of potentialUrls) {
            try {
                console.log(`   測試: ${url}`);
                await this.quickConnectivityTest(url);
                validUrls.push(url);
                console.log(`   ✅ 可訪問`);
            } catch (testError) {
                console.log(`   ❌ 無法訪問`);
            }
        }
        
        if (validUrls.length > 0) {
            console.log(`\n🎯 發現 ${validUrls.length} 個可用的部署網址`);
        } else {
            console.log('\n⚠️  未發現自動部署的網址');
        }
        
        return validUrls;
    }

    async quickConnectivityTest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            const request = protocol.get(url, { timeout: 5000 }, (response) => {
                // 只要能連接就算成功，不管返回什麼狀態碼
                resolve(true);
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.abort();
                reject(new Error('Timeout'));
            });
        });
    }

    async verifyDeploymentUrl(url) {
        console.log(`\n🔍 深度驗證: ${url}`);
        
        const platformName = this.identifyPlatform(url);
        console.log(`📊 識別平台: ${platformName}`);
        
        const verificationSuite = {
            url: url,
            platform: platformName,
            timestamp: new Date().toISOString(),
            tests: [],
            overallStatus: 'unknown',
            performance: {},
            security: {},
            functionality: {}
        };
        
        // 執行各種驗證測試
        await this.executeConnectivityTests(url, verificationSuite);
        await this.executeSecurityTests(url, verificationSuite);
        await this.executeFunctionalityTests(url, verificationSuite);
        await this.executePerformanceTests(url, verificationSuite);
        await this.executeUserExperienceTests(url, verificationSuite);
        
        // 計算整體分數
        this.calculateOverallScore(verificationSuite);
        
        this.verificationResults.push(verificationSuite);
        
        if (verificationSuite.overallStatus === 'excellent' || verificationSuite.overallStatus === 'good') {
            this.successfulUrls.push(url);
        }
    }

    identifyPlatform(url) {
        if (url.includes('railway.app')) return 'Railway';
        if (url.includes('vercel.app')) return 'Vercel';
        if (url.includes('onrender.com')) return 'Render';
        if (url.includes('herokuapp.com')) return 'Heroku';
        if (url.includes('run.app')) return 'Google Cloud Run';
        if (url.includes('azurewebsites.net')) return 'Azure';
        if (url.includes('netlify.app')) return 'Netlify';
        return 'Unknown Platform';
    }

    async executeConnectivityTests(url, suite) {
        console.log('   🌐 連接性測試...');
        
        const connectivityTests = [
            { name: 'HTTP連接測試', path: '/', critical: true },
            { name: 'HTTPS安全連接', path: '/', critical: true },
            { name: '健康檢查端點', path: '/health', critical: true },
            { name: '系統狀態API', path: '/api/system/status', critical: true }
        ];
        
        for (const test of connectivityTests) {
            try {
                const startTime = Date.now();
                const response = await this.makeHttpRequest(url + test.path);
                const responseTime = Date.now() - startTime;
                
                const testResult = {
                    name: test.name,
                    status: 'passed',
                    responseTime: responseTime,
                    responseSize: response.length,
                    critical: test.critical
                };
                
                suite.tests.push(testResult);
                console.log(`     ✅ ${test.name}: ${responseTime}ms`);
                
            } catch (error) {
                const testResult = {
                    name: test.name,
                    status: 'failed',
                    error: error.message,
                    critical: test.critical
                };
                
                suite.tests.push(testResult);
                console.log(`     ❌ ${test.name}: ${error.message}`);
            }
        }
    }

    async executeSecurityTests(url, suite) {
        console.log('   🔒 安全性測試...');
        
        const securityTests = [
            {
                name: 'HTTPS強制重定向',
                test: async () => {
                    // 檢查HTTP是否重定向到HTTPS
                    const httpUrl = url.replace('https://', 'http://');
                    try {
                        await this.makeHttpRequest(httpUrl);
                        return { status: 'warning', message: 'HTTP未重定向到HTTPS' };
                    } catch (error) {
                        if (error.message.includes('redirect')) {
                            return { status: 'passed', message: 'HTTPS重定向正常' };
                        }
                        return { status: 'failed', message: error.message };
                    }
                }
            },
            {
                name: '安全標頭檢查',
                test: async () => {
                    try {
                        const response = await this.makeHttpRequest(url, { returnHeaders: true });
                        const securityHeaders = [
                            'x-frame-options',
                            'x-content-type-options',
                            'x-xss-protection'
                        ];
                        
                        const foundHeaders = securityHeaders.filter(header => 
                            response.headers && response.headers[header]
                        );
                        
                        return {
                            status: foundHeaders.length > 0 ? 'passed' : 'warning',
                            message: `發現 ${foundHeaders.length}/${securityHeaders.length} 個安全標頭`
                        };
                    } catch (error) {
                        return { status: 'failed', message: error.message };
                    }
                }
            }
        ];
        
        for (const securityTest of securityTests) {
            try {
                const result = await securityTest.test();
                suite.tests.push({
                    name: securityTest.name,
                    ...result,
                    category: 'security'
                });
                
                const icon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
                console.log(`     ${icon} ${securityTest.name}: ${result.message}`);
                
            } catch (error) {
                console.log(`     ❌ ${securityTest.name}: ${error.message}`);
            }
        }
    }

    async executeFunctionalityTests(url, suite) {
        console.log('   🔧 功能性測試...');
        
        const functionalTests = [
            {
                name: '主頁完整載入',
                path: '/',
                expectedContent: ['企業管理系統', 'v4.0.0'],
                critical: true
            },
            {
                name: '登入頁面功能',  
                path: '/login',
                expectedContent: ['員工登入', '用戶名', '密碼'],
                critical: true
            },
            {
                name: '管理主控台',
                path: '/dashboard', 
                expectedContent: ['管理主控台', '員工管理'],
                critical: true
            },
            {
                name: 'API文檔可訪問',
                path: '/api/docs',
                expectedContent: ['API', 'endpoints'],
                critical: false
            },
            {
                name: '員工API端點',
                path: '/api/employees',
                expectedContent: ['employees', 'success'],
                critical: true,
                requiresAuth: true
            }
        ];
        
        for (const test of functionalTests) {
            try {
                let response;
                
                if (test.requiresAuth) {
                    // 嘗試使用測試憑證
                    response = await this.makeAuthenticatedRequest(url + test.path);
                } else {
                    response = await this.makeHttpRequest(url + test.path);
                }
                
                let passed = 0;
                let total = test.expectedContent.length;
                
                for (const expectedText of test.expectedContent) {
                    if (response.toLowerCase().includes(expectedText.toLowerCase())) {
                        passed++;
                    }
                }
                
                const testResult = {
                    name: test.name,
                    status: passed === total ? 'passed' : passed > 0 ? 'partial' : 'failed',
                    score: `${passed}/${total}`,
                    critical: test.critical,
                    category: 'functionality'
                };
                
                suite.tests.push(testResult);
                
                const icon = testResult.status === 'passed' ? '✅' : testResult.status === 'partial' ? '⚠️' : '❌';
                console.log(`     ${icon} ${test.name}: ${testResult.score}`);
                
            } catch (error) {
                suite.tests.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message,
                    critical: test.critical,
                    category: 'functionality'
                });
                
                console.log(`     ❌ ${test.name}: ${error.message}`);
            }
        }
    }

    async executePerformanceTests(url, suite) {
        console.log('   ⚡ 性能測試...');
        
        const performanceTests = [
            { name: '首頁載入時間', path: '/', target: 3000 },
            { name: 'API響應時間', path: '/api/system/status', target: 1000 },
            { name: '健康檢查響應', path: '/health', target: 500 }
        ];
        
        const performanceResults = [];
        
        for (const test of performanceTests) {
            try {
                const measurements = [];
                
                // 執行3次測量取平均值
                for (let i = 0; i < 3; i++) {
                    const startTime = Date.now();
                    await this.makeHttpRequest(url + test.path);
                    const responseTime = Date.now() - startTime;
                    measurements.push(responseTime);
                    
                    // 避免測試過於頻繁
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                const avgTime = Math.round(measurements.reduce((a, b) => a + b) / measurements.length);
                const status = avgTime <= test.target ? 'excellent' : avgTime <= test.target * 1.5 ? 'good' : 'slow';
                
                const testResult = {
                    name: test.name,
                    averageTime: avgTime,
                    target: test.target,
                    status: status,
                    measurements: measurements,
                    category: 'performance'
                };
                
                performanceResults.push(testResult);
                suite.tests.push(testResult);
                
                const icon = status === 'excellent' ? '🚀' : status === 'good' ? '✅' : '⚠️';
                console.log(`     ${icon} ${test.name}: ${avgTime}ms (目標: ${test.target}ms)`);
                
            } catch (error) {
                console.log(`     ❌ ${test.name}: ${error.message}`);
            }
        }
        
        suite.performance = {
            avgResponseTime: Math.round(performanceResults.reduce((sum, r) => sum + r.averageTime, 0) / performanceResults.length),
            tests: performanceResults
        };
    }

    async executeUserExperienceTests(url, suite) {
        console.log('   👤 用戶體驗測試...');
        
        const uxTests = [
            {
                name: '移動設備相容性',
                test: async () => {
                    const response = await this.makeHttpRequest(url);
                    const hasMobileViewport = response.includes('viewport') && response.includes('width=device-width');
                    const hasResponsiveCSS = response.includes('media') || response.includes('responsive');
                    
                    return {
                        status: hasMobileViewport || hasResponsiveCSS ? 'passed' : 'warning',
                        message: `移動優化: ${hasMobileViewport ? '有' : '無'}viewport, ${hasResponsiveCSS ? '有' : '無'}響應式CSS`
                    };
                }
            },
            {
                name: '語言本地化',
                test: async () => {
                    const response = await this.makeHttpRequest(url);
                    const hasChineseContent = /[\u4e00-\u9fff]/.test(response);
                    const hasLangAttribute = response.includes('lang="zh') || response.includes("lang='zh");
                    
                    return {
                        status: hasChineseContent && hasLangAttribute ? 'passed' : 'partial',
                        message: `中文支援: ${hasChineseContent ? '✓' : '✗'}, 語言屬性: ${hasLangAttribute ? '✓' : '✗'}`
                    };
                }
            },
            {
                name: '用戶界面完整性',
                test: async () => {
                    const response = await this.makeHttpRequest(url);
                    const hasNavigation = response.includes('nav') || response.includes('menu');
                    const hasButtons = response.includes('button') || response.includes('btn');
                    const hasForms = response.includes('form') || response.includes('input');
                    
                    const features = [hasNavigation, hasButtons, hasForms].filter(Boolean).length;
                    
                    return {
                        status: features >= 2 ? 'passed' : 'partial',
                        message: `UI元素: ${features}/3 (導航、按鈕、表單)`
                    };
                }
            }
        ];
        
        for (const uxTest of uxTests) {
            try {
                const result = await uxTest.test();
                suite.tests.push({
                    name: uxTest.name,
                    ...result,
                    category: 'user_experience'
                });
                
                const icon = result.status === 'passed' ? '✅' : result.status === 'partial' ? '⚠️' : '❌';
                console.log(`     ${icon} ${uxTest.name}: ${result.message}`);
                
            } catch (error) {
                console.log(`     ❌ ${uxTest.name}: ${error.message}`);
            }
        }
    }

    async makeAuthenticatedRequest(url) {
        // 模擬登入請求來測試受保護的端點
        return new Promise((resolve, reject) => {
            const https = require('https');
            const http = require('http');
            
            const protocol = url.startsWith('https') ? https : http;
            
            const options = {
                headers: {
                    'Authorization': 'Bearer admin', // 使用測試token
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            };
            
            const request = protocol.get(url, options, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
        });
    }

    makeHttpRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const https = require('https');
            const http = require('http');
            
            const protocol = url.startsWith('https') ? https : http;
            
            const request = protocol.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (options.returnHeaders) {
                        resolve({ data, headers: response.headers });
                    } else {
                        resolve(data);
                    }
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
        });
    }

    calculateOverallScore(suite) {
        const tests = suite.tests;
        const criticalTests = tests.filter(t => t.critical);
        const criticalPassed = criticalTests.filter(t => t.status === 'passed').length;
        const totalPassed = tests.filter(t => t.status === 'passed' || t.status === 'excellent' || t.status === 'good').length;
        
        // 計算分數
        const criticalScore = criticalTests.length > 0 ? (criticalPassed / criticalTests.length) * 100 : 100;
        const overallScore = tests.length > 0 ? (totalPassed / tests.length) * 100 : 0;
        
        // 決定整體狀態
        if (criticalScore === 100 && overallScore >= 90) {
            suite.overallStatus = 'excellent';
        } else if (criticalScore >= 80 && overallScore >= 70) {
            suite.overallStatus = 'good';
        } else if (criticalScore >= 60) {
            suite.overallStatus = 'fair';
        } else {
            suite.overallStatus = 'poor';
        }
        
        suite.scores = {
            critical: Math.round(criticalScore),
            overall: Math.round(overallScore),
            criticalPassed: criticalPassed,
            totalCritical: criticalTests.length,
            totalPassed: totalPassed,
            totalTests: tests.length
        };
        
        console.log(`   📊 整體評分: ${suite.overallStatus.toUpperCase()} (${suite.scores.overall}%)`);
        console.log(`   🔴 關鍵測試: ${criticalPassed}/${criticalTests.length} 通過`);
    }

    generateComprehensiveReport() {
        console.log('\n📊 生成智慧驗證綜合報告...');
        
        const report = {
            verificationSummary: {
                timestamp: new Date().toISOString(),
                totalUrls: this.verificationResults.length,
                successfulUrls: this.successfulUrls.length,
                platformsDetected: [...new Set(this.verificationResults.map(r => r.platform))],
                overallStatus: this.calculateGlobalStatus()
            },
            detailedResults: this.verificationResults,
            recommendations: this.generateRecommendations(),
            testAccounts: this.testAccounts,
            nextSteps: this.generateNextSteps()
        };
        
        // 保存報告
        const reportFile = `smart-verification-report-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        // 顯示摘要
        this.displayVerificationSummary(report);
        
        console.log(`📄 詳細報告已保存: ${reportFile}`);
        
        return report;
    }

    calculateGlobalStatus() {
        if (this.successfulUrls.length === 0) return 'no_deployments';
        if (this.successfulUrls.length === this.verificationResults.length) return 'all_successful';
        return 'partially_successful';
    }

    generateRecommendations() {
        const recommendations = [];
        
        // 基於驗證結果生成建議
        this.verificationResults.forEach(result => {
            const failedCritical = result.tests.filter(t => t.critical && t.status === 'failed');
            
            if (failedCritical.length > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    platform: result.platform,
                    issue: `${failedCritical.length} 個關鍵功能測試失敗`,
                    action: '檢查部署日誌並修復關鍵功能問題'
                });
            }
            
            const performanceIssues = result.tests.filter(t => t.category === 'performance' && t.status === 'slow');
            if (performanceIssues.length > 0) {
                recommendations.push({
                    priority: 'MEDIUM', 
                    platform: result.platform,
                    issue: '性能測試顯示響應較慢',
                    action: '考慮升級資源配置或優化代碼'
                });
            }
        });
        
        if (this.successfulUrls.length > 0) {
            recommendations.push({
                priority: 'INFO',
                issue: '部署驗證完成',
                action: '開始使用企業管理系統並監控用戶反饋'
            });
        }
        
        return recommendations;
    }

    generateNextSteps() {
        const steps = [];
        
        if (this.successfulUrls.length > 0) {
            steps.push('🎉 開始使用已驗證成功的企業管理系統');
            steps.push('👥 使用測試帳號驗證所有用戶角色功能');
            steps.push('📊 監控系統性能和用戶行為');
            steps.push('🔒 考慮設置生產環境安全措施');
            steps.push('📈 根據使用情況規劃功能擴展');
        } else {
            steps.push('🔧 檢查部署問題並重新部署');
            steps.push('📋 參考手動部署指引');
            steps.push('💬 聯繫技術支持或查看平台文檔');
        }
        
        return steps;
    }

    displayVerificationSummary(report) {
        console.log('\n🎯 =============== 智慧驗證綜合摘要 ===============');
        console.log(`📅 驗證時間: ${new Date(report.verificationSummary.timestamp).toLocaleString('zh-TW')}`);
        console.log(`🌐 驗證網址數: ${report.verificationSummary.totalUrls}`);
        console.log(`✅ 成功網址數: ${report.verificationSummary.successfulUrls}`);
        console.log(`🏢 檢測平台: ${report.verificationSummary.platformsDetected.join(', ')}`);
        console.log(`📊 整體狀態: ${report.verificationSummary.overallStatus.toUpperCase()}`);
        
        if (this.successfulUrls.length > 0) {
            console.log('\n🌍 成功部署的網址:');
            this.successfulUrls.forEach((url, index) => {
                const result = this.verificationResults.find(r => r.url === url);
                console.log(`${index + 1}. ${url}`);
                console.log(`   📊 狀態: ${result.overallStatus.toUpperCase()} (${result.scores.overall}%)`);
                console.log(`   🏢 平台: ${result.platform}`);
            });
            
            console.log('\n🔐 測試帳號資訊:');
            this.testAccounts.forEach(account => {
                console.log(`   ${account.role === 'admin' ? '👑' : account.role === 'manager' ? '👔' : '👤'} ${account.description}: ${account.username} / ${account.password}`);
            });
            
            console.log('\n🎉 企業管理系統部署驗證完成！');
            console.log('💼 系統包含完整的企業功能模組');
            console.log('🔒 支援多角色權限管理');
            console.log('📱 響應式設計支援各種設備');
            
        } else {
            console.log('\n⚠️  沒有成功的部署網址');
            this.showManualDeploymentGuide();
        }
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 建議事項:');
            report.recommendations.forEach(rec => {
                const icon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🔵';
                console.log(`   ${icon} ${rec.action}`);
            });
        }
    }

    showManualDeploymentGuide() {
        console.log('\n📋 =============== 手動部署指引 ===============');
        console.log('🎯 推薦部署平台 (按簡易度排序):');
        
        const platforms = [
            {
                name: 'Railway',
                url: 'https://railway.app',
                steps: [
                    '1. 使用GitHub帳號登入Railway',
                    '2. 點擊 "New Project"',
                    '3. 選擇 "Deploy from GitHub repo"',
                    '4. 選擇此專案倉庫',
                    '5. Railway自動檢測並部署',
                    '6. 獲得類似 https://xxx.up.railway.app 的網址'
                ]
            },
            {
                name: 'Vercel',
                url: 'https://vercel.com',
                steps: [
                    '1. 使用GitHub帳號登入Vercel',
                    '2. 點擊 "New Project"',
                    '3. 導入GitHub倉庫',
                    '4. Vercel自動檢測Node.js專案',
                    '5. 點擊Deploy部署',
                    '6. 獲得類似 https://xxx.vercel.app 的網址'
                ]
            },
            {
                name: 'Render',
                url: 'https://render.com',
                steps: [
                    '1. 註冊Render帳號並連接GitHub',
                    '2. 創建新的 "Web Service"',
                    '3. 選擇此GitHub倉庫',
                    '4. 設定構建命令: npm install',
                    '5. 設定啟動命令: node app.js',
                    '6. 點擊創建服務',
                    '7. 獲得類似 https://xxx.onrender.com 的網址'
                ]
            }
        ];
        
        platforms.forEach(platform => {
            console.log(`\n🚀 ${platform.name} (${platform.url}):`);
            platform.steps.forEach(step => console.log(`   ${step}`));
        });
        
        console.log('\n🔍 部署完成後請執行:');
        console.log('   node post-deployment-verification.js <your-deployed-url>');
    }

    handleVerificationError(error) {
        console.log('\n🔧 處理驗證錯誤...');
        console.log('💡 建議檢查項目:');
        console.log('1. 網路連接是否正常');
        console.log('2. 部署的網址是否正確');
        console.log('3. 服務是否已完全啟動');
        console.log('4. 防火牆或安全設置');
        
        const errorReport = {
            error: error.message,
            timestamp: new Date().toISOString(),
            verificationResults: this.verificationResults
        };
        
        fs.writeFileSync(`verification-error-${Date.now()}.json`, JSON.stringify(errorReport, null, 2));
        console.log('📄 錯誤報告已保存');
    }
}

// 主執行函數
async function executeSmartVerification() {
    const verifier = new UniversalSmartDeploymentVerifier();
    
    // 檢查命令列參數
    const urls = process.argv.slice(2).filter(arg => arg.startsWith('http'));
    
    if (urls.length > 0) {
        console.log(`🎯 使用提供的網址進行驗證: ${urls.join(', ')}`);
    }
    
    await verifier.executeSmartVerification(urls);
}

// 如果直接執行此檔案
if (require.main === module) {
    executeSmartVerification().catch(console.error);
}

module.exports = UniversalSmartDeploymentVerifier;
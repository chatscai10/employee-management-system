#!/usr/bin/env node

/**
 * 🌐 真實網址智慧驗證分析引擎
 * 針對線上部署的系統進行深度分析和驗證
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

class LiveURLSmartVerification {
    constructor() {
        this.config = {
            // 真實部署URL
            liveUrl: 'https://employee-management-system-213410885168.asia-east1.run.app',
            
            // 測試端點配置
            endpoints: [
                { path: '/', method: 'GET', expectedStatus: 200, type: 'frontend', description: '前端首頁' },
                { path: '/health', method: 'GET', expectedStatus: 200, type: 'health', description: '系統健康檢查' },
                { path: '/api/health', method: 'GET', expectedStatus: 200, type: 'api', description: 'API健康檢查' },
                { path: '/api', method: 'GET', expectedStatus: 200, type: 'api', description: 'API總覽' },
                { path: '/api/employees', method: 'GET', expectedStatus: 200, type: 'api', description: '員工API' },
                { path: '/api/products', method: 'GET', expectedStatus: 200, type: 'api', description: '產品API' },
                { path: '/api/inventory', method: 'GET', expectedStatus: 200, type: 'api', description: '庫存API' },
                { 
                    path: '/api/login', 
                    method: 'POST', 
                    expectedStatus: 200, 
                    type: 'api', 
                    description: '登入API',
                    body: { name: '測試員工', idNumber: 'A123456789' }
                }
            ],
            
            // 性能測試配置
            performanceThresholds: {
                responseTime: 3000, // 3秒
                availabilityTarget: 99.0, // 99%
                errorRateTarget: 1.0 // 1%
            },
            
            // Telegram通知配置
            telegram: {
                botToken: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
                chatId: '-1002658082392'
            }
        };
        
        this.results = {
            overall: { score: 0, status: 'unknown', tested: false },
            endpoints: {},
            performance: { responseTime: [], availability: 0, errorRate: 0 },
            security: { https: false, headers: {}, certificates: {} },
            functionality: {},
            errors: [],
            insights: []
        };
    }

    /**
     * 🚀 執行完整的線上智慧驗證
     */
    async executeLiveVerification() {
        console.log('🌐 啟動真實網址智慧驗證分析');
        console.log('=' .repeat(60));
        console.log(`🎯 目標URL: ${this.config.liveUrl}`);
        console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
        
        try {
            // 階段1: 基礎連接性測試
            await this.performConnectivityTests();
            
            // 階段2: 端點功能驗證
            await this.performEndpointTests();
            
            // 階段3: 性能分析
            await this.performPerformanceAnalysis();
            
            // 階段4: 安全性檢查
            await this.performSecurityAnalysis();
            
            // 階段5: 業務功能驗證
            await this.performBusinessFunctionTests();
            
            // 階段6: 生成分析報告
            await this.generateAnalysisReport();
            
            // 階段7: 發送結果通知
            await this.sendVerificationNotification();
            
        } catch (error) {
            console.error('❌ 驗證過程發生錯誤:', error.message);
            this.results.errors.push(error.message);
        }
        
        return this.results;
    }

    /**
     * 🔍 基礎連接性測試
     */
    async performConnectivityTests() {
        console.log('🔍 執行基礎連接性測試...');
        
        try {
            const startTime = Date.now();
            const response = await this.makeRequest(this.config.liveUrl, 'GET');
            const responseTime = Date.now() - startTime;
            
            this.results.performance.responseTime.push(responseTime);
            
            if (response.success) {
                console.log(`✅ 基礎連接成功 (${responseTime}ms)`);
                this.results.overall.tested = true;
            } else {
                console.log(`❌ 基礎連接失敗: ${response.error}`);
                this.results.errors.push(`基礎連接失敗: ${response.error}`);
            }
            
        } catch (error) {
            console.log(`❌ 連接性測試異常: ${error.message}`);
            this.results.errors.push(`連接性測試異常: ${error.message}`);
        }
    }

    /**
     * 🔌 端點功能驗證
     */
    async performEndpointTests() {
        console.log('🔌 執行端點功能驗證...');
        
        for (const endpoint of this.config.endpoints) {
            const testKey = `${endpoint.method} ${endpoint.path}`;
            console.log(`  測試: ${testKey} - ${endpoint.description}`);
            
            try {
                const startTime = Date.now();
                const url = `${this.config.liveUrl}${endpoint.path}`;
                const response = await this.makeRequest(url, endpoint.method, endpoint.body);
                const responseTime = Date.now() - startTime;
                
                this.results.endpoints[testKey] = {
                    success: response.success && response.statusCode === endpoint.expectedStatus,
                    statusCode: response.statusCode,
                    responseTime: responseTime,
                    hasData: response.hasData,
                    dataLength: response.dataLength,
                    error: response.error,
                    type: endpoint.type,
                    description: endpoint.description
                };
                
                this.results.performance.responseTime.push(responseTime);
                
                const status = this.results.endpoints[testKey].success ? '✅ 成功' : '❌ 失敗';
                console.log(`    結果: ${status} (${response.statusCode}, ${responseTime}ms)`);
                
                if (response.error) {
                    console.log(`    錯誤: ${response.error}`);
                }
                
            } catch (error) {
                this.results.endpoints[testKey] = {
                    success: false,
                    error: error.message,
                    type: endpoint.type,
                    description: endpoint.description
                };
                console.log(`    結果: ❌ 測試異常 - ${error.message}`);
            }
        }
    }

    /**
     * ⚡ 性能分析
     */
    async performPerformanceAnalysis() {
        console.log('⚡ 執行性能分析...');
        
        // 計算平均響應時間
        const responseTimes = this.results.performance.responseTime;
        if (responseTimes.length > 0) {
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);
            const minResponseTime = Math.min(...responseTimes);
            
            this.results.performance.avgResponseTime = avgResponseTime;
            this.results.performance.maxResponseTime = maxResponseTime;
            this.results.performance.minResponseTime = minResponseTime;
            
            console.log(`  平均響應時間: ${avgResponseTime.toFixed(0)}ms`);
            console.log(`  最快響應時間: ${minResponseTime}ms`);
            console.log(`  最慢響應時間: ${maxResponseTime}ms`);
            
            // 性能評級
            if (avgResponseTime < 1000) {
                this.results.performance.grade = 'A+ 優秀';
            } else if (avgResponseTime < 2000) {
                this.results.performance.grade = 'A 良好';
            } else if (avgResponseTime < 3000) {
                this.results.performance.grade = 'B 可接受';
            } else {
                this.results.performance.grade = 'C 需要優化';
            }
        }
        
        // 計算可用性
        const totalTests = Object.keys(this.results.endpoints).length;
        const successfulTests = Object.values(this.results.endpoints).filter(r => r.success).length;
        this.results.performance.availability = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
        
        console.log(`  系統可用性: ${this.results.performance.availability.toFixed(1)}%`);
        console.log(`  性能評級: ${this.results.performance.grade || 'N/A'}`);
    }

    /**
     * 🔒 安全性檢查
     */
    async performSecurityAnalysis() {
        console.log('🔒 執行安全性檢查...');
        
        // 檢查HTTPS
        this.results.security.https = this.config.liveUrl.startsWith('https://');
        console.log(`  HTTPS加密: ${this.results.security.https ? '✅ 啟用' : '❌ 未啟用'}`);
        
        // 檢查安全標頭 (通過健康檢查端點)
        try {
            const response = await this.makeRequest(`${this.config.liveUrl}/health`, 'GET', null, true);
            if (response.headers) {
                this.results.security.headers = {
                    'x-powered-by': response.headers['x-powered-by'] || 'Not disclosed',
                    'strict-transport-security': !!response.headers['strict-transport-security'],
                    'x-content-type-options': !!response.headers['x-content-type-options'],
                    'x-frame-options': !!response.headers['x-frame-options'],
                    'x-xss-protection': !!response.headers['x-xss-protection']
                };
                
                console.log(`  安全標頭檢查:`);
                console.log(`    HSTS: ${this.results.security.headers['strict-transport-security'] ? '✅' : '❌'}`);
                console.log(`    Content-Type保護: ${this.results.security.headers['x-content-type-options'] ? '✅' : '❌'}`);
                console.log(`    點擊劫持保護: ${this.results.security.headers['x-frame-options'] ? '✅' : '❌'}`);
                console.log(`    XSS保護: ${this.results.security.headers['x-xss-protection'] ? '✅' : '❌'}`);
            }
        } catch (error) {
            console.log(`  安全標頭檢查失敗: ${error.message}`);
        }
    }

    /**
     * 🧪 業務功能驗證
     */
    async performBusinessFunctionTests() {
        console.log('🧪 執行業務功能驗證...');
        
        const businessTests = [
            {
                name: '系統健康狀態',
                test: async () => await this.testSystemHealth()
            },
            {
                name: 'API服務可用性',
                test: async () => await this.testAPIAvailability()
            },
            {
                name: '員工登入功能',
                test: async () => await this.testEmployeeLogin()
            },
            {
                name: '數據API完整性',
                test: async () => await this.testDataAPIIntegrity()
            }
        ];
        
        for (const test of businessTests) {
            console.log(`  驗證: ${test.name}`);
            try {
                const result = await test.test();
                this.results.functionality[test.name] = result;
                console.log(`    結果: ${result.success ? '✅ 通過' : '❌ 失敗'}`);
                if (result.details) {
                    console.log(`    詳情: ${result.details}`);
                }
                if (result.error) {
                    console.log(`    錯誤: ${result.error}`);
                }
            } catch (error) {
                this.results.functionality[test.name] = {
                    success: false,
                    error: error.message
                };
                console.log(`    結果: ❌ 測試異常 - ${error.message}`);
            }
        }
    }

    /**
     * 🌐 發送HTTP請求
     */
    async makeRequest(url, method = 'GET', body = null, includeHeaders = false) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const isHttps = url.startsWith('https');
            const httpModule = isHttps ? https : http;
            
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'User-Agent': 'Smart-Verification-Engine/1.0',
                    'Accept': 'application/json, text/html, */*'
                },
                timeout: 10000
            };
            
            if (body && method === 'POST') {
                const postData = JSON.stringify(body);
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }
            
            const req = httpModule.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    const result = {
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        hasData: data.length > 0,
                        dataLength: data.length,
                        data: data
                    };
                    
                    if (includeHeaders) {
                        result.headers = res.headers;
                    }
                    
                    resolve(result);
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: '請求超時',
                    responseTime: Date.now() - startTime
                });
            });
            
            if (body && method === 'POST') {
                req.write(JSON.stringify(body));
            }
            
            req.end();
        });
    }

    /**
     * 🏥 測試系統健康狀態
     */
    async testSystemHealth() {
        try {
            const response = await this.makeRequest(`${this.config.liveUrl}/health`, 'GET');
            if (response.success && response.data) {
                try {
                    const healthData = JSON.parse(response.data);
                    return {
                        success: healthData.success === true,
                        details: `系統版本: ${healthData.data?.version}, 運行時間: ${Math.floor((healthData.data?.uptime || 0) / 60)}分鐘`,
                        healthData: healthData
                    };
                } catch (parseError) {
                    return {
                        success: false,
                        error: '健康檢查響應格式錯誤'
                    };
                }
            }
            return {
                success: false,
                error: `健康檢查失敗: HTTP ${response.statusCode}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔌 測試API服務可用性
     */
    async testAPIAvailability() {
        try {
            const response = await this.makeRequest(`${this.config.liveUrl}/api`, 'GET');
            if (response.success && response.data) {
                try {
                    const apiData = JSON.parse(response.data);
                    const endpointCount = Object.keys(apiData.endpoints || {}).length;
                    return {
                        success: true,
                        details: `API版本: ${apiData.version}, 端點數量: ${endpointCount}`,
                        apiData: apiData
                    };
                } catch (parseError) {
                    return {
                        success: false,
                        error: 'API響應格式錯誤'
                    };
                }
            }
            return {
                success: false,
                error: `API服務不可用: HTTP ${response.statusCode}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 👤 測試員工登入功能
     */
    async testEmployeeLogin() {
        try {
            const loginData = { name: '測試員工', idNumber: 'A123456789' };
            const response = await this.makeRequest(`${this.config.liveUrl}/api/login`, 'POST', loginData);
            
            if (response.success && response.data) {
                try {
                    const result = JSON.parse(response.data);
                    return {
                        success: result.success === true,
                        details: result.success ? `登入成功: ${result.data?.name}` : `登入失敗: ${result.message}`,
                        loginResult: result
                    };
                } catch (parseError) {
                    return {
                        success: false,
                        error: '登入響應格式錯誤'
                    };
                }
            }
            return {
                success: false,
                error: `登入API不可用: HTTP ${response.statusCode}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 📊 測試數據API完整性
     */
    async testDataAPIIntegrity() {
        const dataAPIs = [
            { name: 'employees', path: '/api/employees' },
            { name: 'products', path: '/api/products' },
            { name: 'inventory', path: '/api/inventory' }
        ];
        
        const results = [];
        let successCount = 0;
        
        for (const api of dataAPIs) {
            try {
                const response = await this.makeRequest(`${this.config.liveUrl}${api.path}`, 'GET');
                if (response.success && response.data) {
                    try {
                        const data = JSON.parse(response.data);
                        if (data.success && Array.isArray(data.data)) {
                            results.push(`${api.name}: ${data.data.length}筆記錄`);
                            successCount++;
                        } else {
                            results.push(`${api.name}: 數據格式錯誤`);
                        }
                    } catch (parseError) {
                        results.push(`${api.name}: JSON解析失敗`);
                    }
                } else {
                    results.push(`${api.name}: HTTP ${response.statusCode}`);
                }
            } catch (error) {
                results.push(`${api.name}: ${error.message}`);
            }
        }
        
        return {
            success: successCount === dataAPIs.length,
            details: results.join(', '),
            successRate: `${successCount}/${dataAPIs.length}`
        };
    }

    /**
     * 📊 計算綜合評分
     */
    calculateOverallScore() {
        let totalPoints = 0;
        let maxPoints = 0;
        
        // 端點可用性評分 (40%)
        const endpointTests = Object.values(this.results.endpoints);
        if (endpointTests.length > 0) {
            const successfulEndpoints = endpointTests.filter(e => e.success).length;
            totalPoints += (successfulEndpoints / endpointTests.length) * 40;
        }
        maxPoints += 40;
        
        // 性能評分 (30%)
        if (this.results.performance.avgResponseTime) {
            const responseTime = this.results.performance.avgResponseTime;
            let performanceScore = 0;
            if (responseTime < 1000) performanceScore = 30;
            else if (responseTime < 2000) performanceScore = 24;
            else if (responseTime < 3000) performanceScore = 18;
            else performanceScore = 10;
            totalPoints += performanceScore;
        }
        maxPoints += 30;
        
        // 業務功能評分 (20%)
        const functionalTests = Object.values(this.results.functionality);
        if (functionalTests.length > 0) {
            const successfulFunctions = functionalTests.filter(f => f.success).length;
            totalPoints += (successfulFunctions / functionalTests.length) * 20;
        }
        maxPoints += 20;
        
        // 安全性評分 (10%)
        let securityScore = 0;
        if (this.results.security.https) securityScore += 5;
        const securityHeaders = Object.values(this.results.security.headers || {}).filter(Boolean).length;
        securityScore += Math.min(securityHeaders, 5);
        totalPoints += securityScore;
        maxPoints += 10;
        
        const finalScore = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
        
        this.results.overall.score = finalScore;
        this.results.overall.tested = true;
        
        if (finalScore >= 90) {
            this.results.overall.status = 'excellent';
            this.results.overall.grade = 'A+';
        } else if (finalScore >= 80) {
            this.results.overall.status = 'good';
            this.results.overall.grade = 'A';
        } else if (finalScore >= 70) {
            this.results.overall.status = 'fair';
            this.results.overall.grade = 'B';
        } else if (finalScore >= 60) {
            this.results.overall.status = 'poor';
            this.results.overall.grade = 'C';
        } else {
            this.results.overall.status = 'critical';
            this.results.overall.grade = 'D';
        }
        
        return finalScore;
    }

    /**
     * 📄 生成分析報告
     */
    async generateAnalysisReport() {
        console.log('📄 生成深度分析報告...');
        
        const score = this.calculateOverallScore();
        const timestamp = new Date().toLocaleString('zh-TW');
        
        const report = `# 🌐 線上系統智慧驗證深度分析報告

## 📋 驗證概覽
**驗證時間**: ${timestamp}  
**目標系統**: ${this.config.liveUrl}  
**綜合評分**: ${score.toFixed(1)}/100 (${this.results.overall.grade})  
**系統狀態**: ${this.getStatusDescription()}  

## 🔍 端點功能分析

### 📊 端點測試統計
- **總端點數**: ${Object.keys(this.results.endpoints).length}
- **成功端點**: ${Object.values(this.results.endpoints).filter(e => e.success).length}
- **失敗端點**: ${Object.values(this.results.endpoints).filter(e => !e.success).length}
- **成功率**: ${this.results.performance.availability.toFixed(1)}%

### 🔌 詳細端點測試結果
${Object.entries(this.results.endpoints).map(([endpoint, result]) => 
`- **${endpoint}**: ${result.success ? '✅ 成功' : '❌ 失敗'} (${result.statusCode || 'N/A'}, ${result.responseTime || 0}ms)
  - 類型: ${result.type}
  - 說明: ${result.description}${result.error ? `\n  - 錯誤: ${result.error}` : ''}`
).join('\n')}

## ⚡ 性能分析報告

### 📈 響應時間分析
- **平均響應時間**: ${this.results.performance.avgResponseTime?.toFixed(0) || 'N/A'}ms
- **最快響應**: ${this.results.performance.minResponseTime || 'N/A'}ms
- **最慢響應**: ${this.results.performance.maxResponseTime || 'N/A'}ms
- **性能評級**: ${this.results.performance.grade || 'N/A'}

### 📊 可用性指標
- **系統可用性**: ${this.results.performance.availability.toFixed(1)}%
- **SLA達成**: ${this.results.performance.availability >= 99 ? '✅ 達標' : '❌ 未達標'}

## 🔒 安全性分析

### 🛡️ 基礎安全
- **HTTPS加密**: ${this.results.security.https ? '✅ 啟用' : '❌ 未啟用'}

### 📋 安全標頭檢查
${this.results.security.headers ? Object.entries(this.results.security.headers).map(([header, status]) => 
`- **${header}**: ${typeof status === 'boolean' ? (status ? '✅ 啟用' : '❌ 未啟用') : status}`
).join('\n') : '未檢測到安全標頭'}

## 🧪 業務功能驗證

${Object.entries(this.results.functionality).map(([name, result]) => 
`### ${name}
- **狀態**: ${result.success ? '✅ 正常' : '❌ 異常'}
- **詳情**: ${result.details || '無'}${result.error ? `\n- **錯誤**: ${result.error}` : ''}`
).join('\n\n')}

## 📈 綜合評估

### 🎯 評分明細
- **端點可用性** (40%): ${((Object.values(this.results.endpoints).filter(e => e.success).length / Object.keys(this.results.endpoints).length) * 40).toFixed(1)}/40
- **系統性能** (30%): ${this.getPerformanceScore()}/30
- **業務功能** (20%): ${this.getFunctionalScore()}/20
- **安全配置** (10%): ${this.getSecurityScore()}/10

### 🏆 最終評級
**${this.results.overall.grade} 級 - ${this.getGradeDescription()}**

## 💡 優化建議

${this.generateRecommendations()}

## 🚨 問題總結

${this.results.errors.length > 0 ? 
`### ❌ 發現的問題
${this.results.errors.map(error => `- ${error}`).join('\n')}` : 
'### ✅ 未發現重大問題'}

## 📊 技術指標摘要

| 指標 | 數值 | 狀態 |
|------|------|------|
| 綜合評分 | ${score.toFixed(1)}/100 | ${this.results.overall.grade} |
| 系統可用性 | ${this.results.performance.availability.toFixed(1)}% | ${this.results.performance.availability >= 99 ? '✅' : '❌'} |
| 平均響應時間 | ${this.results.performance.avgResponseTime?.toFixed(0) || 'N/A'}ms | ${this.results.performance.avgResponseTime < 2000 ? '✅' : '⚠️'} |
| HTTPS安全 | ${this.results.security.https ? '啟用' : '未啟用'} | ${this.results.security.https ? '✅' : '❌'} |
| 端點成功率 | ${this.results.performance.availability.toFixed(1)}% | ${this.results.performance.availability >= 95 ? '✅' : '❌'} |

---
**報告生成時間**: ${timestamp}  
**驗證工具**: 線上系統智慧驗證引擎 v1.0  
**技術支援**: Claude Code 智慧分析系統
`;

        const fileName = `live-url-verification-report-${new Date().toISOString().split('T')[0]}.md`;
        fs.writeFileSync(fileName, report, 'utf8');
        console.log(`✅ 深度分析報告已生成: ${fileName}`);
        
        return fileName;
    }

    /**
     * 輔助方法：獲取狀態描述
     */
    getStatusDescription() {
        const score = this.results.overall.score;
        if (score >= 90) return '🟢 系統運行優秀，各項指標表現卓越';
        if (score >= 80) return '🟡 系統運行良好，有少量優化空間';
        if (score >= 70) return '🟠 系統基本可用，存在一些問題需要關注';
        if (score >= 60) return '🔴 系統存在較多問題，需要立即改進';
        return '🚨 系統狀態嚴重，需要緊急處理';
    }

    getGradeDescription() {
        switch (this.results.overall.grade) {
            case 'A+': return '優秀 - 生產級系統標準';
            case 'A': return '良好 - 企業級應用水準';
            case 'B': return '可接受 - 基本功能完整';
            case 'C': return '需改進 - 存在明顯問題';
            case 'D': return '不合格 - 需要重大修復';
            default: return '未評級';
        }
    }

    getPerformanceScore() {
        if (!this.results.performance.avgResponseTime) return 0;
        const responseTime = this.results.performance.avgResponseTime;
        if (responseTime < 1000) return 30;
        if (responseTime < 2000) return 24;
        if (responseTime < 3000) return 18;
        return 10;
    }

    getFunctionalScore() {
        const functionalTests = Object.values(this.results.functionality);
        if (functionalTests.length === 0) return 0;
        const successfulFunctions = functionalTests.filter(f => f.success).length;
        return (successfulFunctions / functionalTests.length) * 20;
    }

    getSecurityScore() {
        let score = 0;
        if (this.results.security.https) score += 5;
        const securityHeaders = Object.values(this.results.security.headers || {}).filter(Boolean).length;
        score += Math.min(securityHeaders, 5);
        return score;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.performance.avgResponseTime > 2000) {
            recommendations.push('🚀 **性能優化**: 平均響應時間較慢，建議優化數據庫查詢和API響應速度');
        }
        
        if (this.results.performance.availability < 99) {
            recommendations.push('📈 **可用性提升**: 系統可用性未達99%，建議加強錯誤處理和容錯機制');
        }
        
        if (!this.results.security.https) {
            recommendations.push('🔒 **安全加強**: 建議啟用HTTPS加密傳輸');
        }
        
        const failedEndpoints = Object.values(this.results.endpoints).filter(e => !e.success);
        if (failedEndpoints.length > 0) {
            recommendations.push(`🔧 **端點修復**: ${failedEndpoints.length}個端點需要修復`);
        }
        
        if (recommendations.length === 0) {
            recommendations.push('🎉 **優秀表現**: 系統運行狀態良好，繼續保持現有品質');
        }
        
        return recommendations.map(r => `- ${r}`).join('\n');
    }

    /**
     * ✈️ 發送驗證結果通知
     */
    async sendVerificationNotification() {
        console.log('✈️ 發送驗證結果通知...');
        
        const score = this.results.overall.score;
        const statusEmoji = score >= 90 ? '🟢' : score >= 80 ? '🟡' : score >= 70 ? '🟠' : '🔴';
        
        const message = `🌐 <b>線上系統智慧驗證報告</b>

${statusEmoji} <b>綜合評分</b>: ${score.toFixed(1)}/100 (${this.results.overall.grade}級)
🎯 <b>目標系統</b>: ${this.config.liveUrl}
⏰ <b>驗證時間</b>: ${new Date().toLocaleString('zh-TW')}

📊 <b>關鍵指標</b>:
• 系統可用性: ${this.results.performance.availability.toFixed(1)}%
• 平均響應: ${this.results.performance.avgResponseTime?.toFixed(0) || 'N/A'}ms
• 端點成功: ${Object.values(this.results.endpoints).filter(e => e.success).length}/${Object.keys(this.results.endpoints).length}
• HTTPS安全: ${this.results.security.https ? '✅' : '❌'}

🔍 <b>業務功能驗證</b>:
${Object.entries(this.results.functionality).map(([name, result]) => 
`• ${name}: ${result.success ? '✅' : '❌'}`
).join('\n')}

💡 <b>系統狀態</b>: ${this.getStatusDescription()}

🎯 <b>評級說明</b>: ${this.getGradeDescription()}

🔗 <b>系統連結</b>: ${this.config.liveUrl}

📋 詳細報告已生成，請查看本地檔案
🤖 <b>驗證工具</b>: 線上智慧驗證引擎 v1.0`;

        return new Promise((resolve) => {
            const postData = JSON.stringify({
                chat_id: this.config.telegram.chatId,
                text: message,
                parse_mode: 'HTML'
            });

            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.config.telegram.botToken}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Telegram驗證通知發送成功');
                } else {
                    console.log(`⚠️ Telegram通知狀態: ${res.statusCode}`);
                }
                resolve();
            });

            req.on('error', (error) => {
                console.log('⚠️ Telegram通知發送錯誤:', error.message);
                resolve();
            });

            req.write(postData);
            req.end();
        });
    }
}

// 🚀 主程序執行
async function main() {
    const verifier = new LiveURLSmartVerification();
    
    try {
        console.log('\n🌐 開始執行線上系統智慧驗證...\n');
        const results = await verifier.executeLiveVerification();
        
        console.log('\n🎊 線上智慧驗證完成！');
        console.log(`📊 綜合評分: ${results.overall.score.toFixed(1)}/100 (${results.overall.grade}級)`);
        console.log(`🎯 系統狀態: ${results.overall.status}`);
        console.log(`✅ 成功端點: ${Object.values(results.endpoints).filter(e => e.success).length}/${Object.keys(results.endpoints).length}`);
        console.log(`⚡ 平均響應: ${results.performance.avgResponseTime?.toFixed(0) || 'N/A'}ms`);
        console.log(`🔒 HTTPS安全: ${results.security.https ? '✅ 啟用' : '❌ 未啟用'}`);
        
        console.log('\n🌟 線上系統智慧驗證分析完成！');
        
        process.exit(results.overall.score >= 70 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ 線上驗證失敗:', error.message);
        process.exit(1);
    }
}

// 執行主程序
if (require.main === module) {
    main();
}

module.exports = LiveURLSmartVerification;
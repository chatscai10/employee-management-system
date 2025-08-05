#!/usr/bin/env node
/**
 * 智慧API模板測試引擎
 * Intelligent API Template Testing Engine
 * 
 * 一個全面的API端點測試和分析工具，專為員工管理系統設計
 * 具備智慧探測、多方法測試、認證分析、性能評估等功能
 * 
 * 創建時間: 2025-08-05
 * 版本: 1.0.0
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs').promises;
const path = require('path');

class IntelligentAPITestingEngine {
    constructor(baseUrl, options = {}) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜線
        this.options = {
            timeout: options.timeout || 30000,
            maxConcurrency: options.maxConcurrency || 5,
            userAgent: options.userAgent || 'Intelligent-API-Testing-Engine/1.0.0',
            maxRetries: options.maxRetries || 3,
            ...options
        };
        
        this.testResults = [];
        this.systemMetrics = {
            totalEndpoints: 0,
            successfulTests: 0,
            failedTests: 0,
            averageResponseTime: 0,
            authRequiredEndpoints: 0,
            publicEndpoints: 0
        };
        
        // 已知的API端點列表
        this.knownEndpoints = [
            { path: '/', method: 'GET', type: 'page', description: '主頁' },
            { path: '/login', method: 'GET', type: 'page', description: '登入頁面' },
            { path: '/dashboard', method: 'GET', type: 'page', protected: true, description: '儀表板' },
            { path: '/health', method: 'GET', type: 'api', description: '健康檢查' },
            { path: '/api/auth/login', method: 'POST', type: 'api', description: '登入API' },
            { path: '/api/system/status', method: 'GET', type: 'api', description: '系統狀態' },
            { path: '/api/employees', method: 'GET', type: 'api', protected: true, description: '員工管理' },
            { path: '/api/attendance', method: 'GET', type: 'api', protected: true, description: '出勤管理' },
            { path: '/api/inventory', method: 'GET', type: 'api', protected: true, description: '庫存管理' },
            { path: '/api/maintenance', method: 'GET', type: 'api', protected: true, description: '維護管理' },
            { path: '/api/docs', method: 'GET', type: 'api', description: 'API文檔' }
        ];
        
        // 測試用的範例數據
        this.testData = {
            login: {
                username: 'test@example.com',
                password: 'testpassword',
                email: 'test@example.com'
            },
            employee: {
                name: 'Test Employee',
                position: 'Developer',
                department: 'IT',
                email: 'employee@test.com'
            }
        };
    }

    /**
     * 執行HTTP請求的核心方法
     */
    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'User-Agent': this.options.userAgent,
                    'Accept': 'application/json, text/html, text/plain, */*',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    ...options.headers
                },
                timeout: this.options.timeout
            };

            // 如果有POST數據，添加Content-Type和Content-Length
            if (options.data) {
                const postData = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
                requestOptions.headers['Content-Type'] = options.contentType || 'application/json';
                requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const startTime = Date.now();
            const req = client.request(requestOptions, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', () => {
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    resolve({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        headers: res.headers,
                        body: body,
                        responseTime: responseTime,
                        url: url,
                        method: requestOptions.method
                    });
                });
            });

            req.on('error', (err) => {
                reject({
                    error: err.message,
                    code: err.code,
                    url: url,
                    method: requestOptions.method
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject({
                    error: 'Request timeout',
                    code: 'TIMEOUT',
                    url: url,
                    method: requestOptions.method
                });
            });

            // 發送POST數據
            if (options.data) {
                const postData = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
                req.write(postData);
            }

            req.end();
        });
    }

    /**
     * 分析響應內容類型和結構
     */
    analyzeResponse(response) {
        const analysis = {
            contentType: 'unknown',
            isJson: false,
            isHtml: false,
            isText: false,
            structure: {},
            errors: [],
            features: [],
            authentication: {
                required: false,
                method: 'unknown',
                hints: []
            }
        };

        // 分析Content-Type
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
            analysis.contentType = 'json';
            analysis.isJson = true;
        } else if (contentType.includes('text/html')) {
            analysis.contentType = 'html';
            analysis.isHtml = true;
        } else if (contentType.includes('text/plain')) {
            analysis.contentType = 'text';
            analysis.isText = true;
        }

        // 嘗試解析JSON
        if (analysis.isJson || response.body.trim().startsWith('{') || response.body.trim().startsWith('[')) {
            try {
                const jsonData = JSON.parse(response.body);
                analysis.structure = this.analyzeJsonStructure(jsonData);
                analysis.isJson = true;
            } catch (e) {
                analysis.errors.push('Invalid JSON format');
            }
        }

        // 分析認證需求
        if (response.statusCode === 401) {
            analysis.authentication.required = true;
            analysis.authentication.hints.push('返回401未授權狀態');
        }
        
        if (response.statusCode === 403) {
            analysis.authentication.required = true;
            analysis.authentication.hints.push('返回403禁止訪問狀態');
        }

        // 分析HTML內容中的認證線索
        if (analysis.isHtml) {
            if (response.body.includes('login') || response.body.includes('signin')) {
                analysis.authentication.hints.push('頁面包含登入相關內容');
            }
            if (response.body.includes('dashboard') || response.body.includes('admin')) {
                analysis.features.push('管理介面相關');
            }
        }

        // 分析重定向
        if (response.statusCode >= 300 && response.statusCode < 400) {
            const location = response.headers.location;
            if (location) {
                if (location.includes('login')) {
                    analysis.authentication.required = true;
                    analysis.authentication.hints.push('重定向到登入頁面');
                }
            }
        }

        return analysis;
    }

    /**
     * 分析JSON結構
     */
    analyzeJsonStructure(data, depth = 0, maxDepth = 3) {
        if (depth > maxDepth) return { type: 'deep_object', note: '結構過深，已截斷' };
        
        if (Array.isArray(data)) {
            return {
                type: 'array',
                length: data.length,
                sample: data.length > 0 ? this.analyzeJsonStructure(data[0], depth + 1, maxDepth) : null
            };
        } else if (typeof data === 'object' && data !== null) {
            const structure = { type: 'object', properties: {} };
            for (const [key, value] of Object.entries(data)) {
                structure.properties[key] = {
                    type: typeof value,
                    sample: depth < maxDepth ? this.analyzeJsonStructure(value, depth + 1, maxDepth) : value
                };
            }
            return structure;
        } else {
            return { type: typeof data, value: data };
        }
    }

    /**
     * 測試單個端點的多種HTTP方法
     */
    async testEndpointMethods(endpoint) {
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
        const results = [];
        
        for (const method of methods) {
            try {
                const url = `${this.baseUrl}${endpoint.path}`;
                let requestOptions = { method };
                
                // 為POST/PUT/PATCH添加測試數據
                if (['POST', 'PUT', 'PATCH'].includes(method)) {
                    if (endpoint.path.includes('login')) {
                        requestOptions.data = this.testData.login;
                    } else if (endpoint.path.includes('employee')) {
                        requestOptions.data = this.testData.employee;
                    } else {
                        requestOptions.data = { test: true, timestamp: Date.now() };
                    }
                }
                
                const response = await this.makeRequest(url, requestOptions);
                const analysis = this.analyzeResponse(response);
                
                results.push({
                    method,
                    success: true,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    analysis,
                    response: {
                        headers: response.headers,
                        bodyLength: response.body.length,
                        bodyPreview: response.body.substring(0, 200)
                    }
                });
                
            } catch (error) {
                results.push({
                    method,
                    success: false,
                    error: error.error || error.message,
                    code: error.code
                });
            }
        }
        
        return results;
    }

    /**
     * 執行性能測試
     */
    async performanceTest(endpoint, concurrency = 3, iterations = 5) {
        const url = `${this.baseUrl}${endpoint.path}`;
        const results = [];
        
        console.log(`🔥 執行性能測試: ${endpoint.path} (並發: ${concurrency}, 迭代: ${iterations})`);
        
        for (let i = 0; i < iterations; i++) {
            const promises = [];
            const startTime = Date.now();
            
            for (let j = 0; j < concurrency; j++) {
                promises.push(this.makeRequest(url, { method: endpoint.method || 'GET' }));
            }
            
            try {
                const responses = await Promise.allSettled(promises);
                const endTime = Date.now();
                
                const successful = responses.filter(r => r.status === 'fulfilled').length;
                const failed = responses.filter(r => r.status === 'rejected').length;
                const avgResponseTime = responses
                    .filter(r => r.status === 'fulfilled')
                    .reduce((sum, r) => sum + r.value.responseTime, 0) / successful;
                
                results.push({
                    iteration: i + 1,
                    totalTime: endTime - startTime,
                    successful,
                    failed,
                    avgResponseTime: Math.round(avgResponseTime),
                    concurrency
                });
                
            } catch (error) {
                results.push({
                    iteration: i + 1,
                    error: error.message,
                    concurrency
                });
            }
        }
        
        return {
            endpoint: endpoint.path,
            results,
            summary: {
                totalRequests: concurrency * iterations,
                avgTotalTime: Math.round(results.reduce((sum, r) => sum + (r.totalTime || 0), 0) / results.length),
                avgResponseTime: Math.round(results.reduce((sum, r) => sum + (r.avgResponseTime || 0), 0) / results.length),
                successRate: results.reduce((sum, r) => sum + (r.successful || 0), 0) / (concurrency * iterations) * 100
            }
        };
    }

    /**
     * 生成智慧修復建議
     */
    generateRepairSuggestions(testResult) {
        const suggestions = [];
        
        // 基於狀態碼的建議
        if (testResult.statusCode >= 500) {
            suggestions.push({
                level: 'critical',
                category: 'server_error',
                message: '伺服器內部錯誤，需要檢查後端日誌和錯誤處理',
                action: '檢查伺服器日誌，修復代碼錯誤'
            });
        }
        
        if (testResult.statusCode === 404) {
            suggestions.push({
                level: 'high',
                category: 'routing',
                message: '端點不存在，可能需要添加路由或修正URL',
                action: '檢查路由配置，確認端點是否正確實現'
            });
        }
        
        if (testResult.statusCode === 401 || testResult.statusCode === 403) {
            suggestions.push({
                level: 'medium',
                category: 'authentication',
                message: '需要實現認證機制',
                action: '添加JWT token或session認證'
            });
        }
        
        // 基於響應時間的建議
        if (testResult.responseTime > 5000) {
            suggestions.push({
                level: 'medium',
                category: 'performance',
                message: '響應時間過長，可能影響用戶體驗',
                action: '優化數據庫查詢，添加緩存機制'
            });
        }
        
        // 基於內容分析的建議
        if (testResult.analysis && testResult.analysis.errors.length > 0) {
            suggestions.push({
                level: 'high',
                category: 'data_format',
                message: 'API響應格式有誤',
                action: '檢查並修正API響應格式'
            });
        }
        
        return suggestions;
    }

    /**
     * 主要的測試執行方法
     */
    async runComprehensiveTest() {
        console.log('🚀 開始執行智慧API模板測試引擎');
        console.log(`📡 目標URL: ${this.baseUrl}`);
        console.log(`🔍 測試端點數量: ${this.knownEndpoints.length}`);
        console.log('═'.repeat(80));
        
        this.systemMetrics.totalEndpoints = this.knownEndpoints.length;
        const startTime = Date.now();
        
        for (const [index, endpoint] of this.knownEndpoints.entries()) {
            console.log(`\n📍 測試端點 ${index + 1}/${this.knownEndpoints.length}: ${endpoint.path}`);
            console.log(`   描述: ${endpoint.description}`);
            console.log(`   類型: ${endpoint.type} | 保護: ${endpoint.protected ? '是' : '否'}`);
            
            const testResult = {
                endpoint: endpoint.path,
                description: endpoint.description,
                type: endpoint.type,
                protected: endpoint.protected || false,
                timestamp: new Date().toISOString(),
                methods: [],
                performance: null,
                suggestions: [],
                score: 0
            };
            
            try {
                // 1. 測試多種HTTP方法
                console.log('   🔧 測試HTTP方法...');
                testResult.methods = await this.testEndpointMethods(endpoint);
                
                // 2. 執行性能測試（僅對GET端點）
                if (endpoint.method === 'GET' || !endpoint.method) {
                    console.log('   ⚡ 執行性能測試...');
                    testResult.performance = await this.performanceTest(endpoint, 2, 3);
                }
                
                // 3. 生成修復建議
                const primaryMethod = testResult.methods.find(m => m.method === (endpoint.method || 'GET'));
                if (primaryMethod) {
                    testResult.suggestions = this.generateRepairSuggestions(primaryMethod);
                }
                
                // 4. 計算端點評分
                testResult.score = this.calculateEndpointScore(testResult);
                
                // 5. 更新系統指標
                if (testResult.methods.some(m => m.success && m.statusCode < 400)) {
                    this.systemMetrics.successfulTests++;
                } else {
                    this.systemMetrics.failedTests++;
                }
                
                if (testResult.protected) {
                    this.systemMetrics.authRequiredEndpoints++;
                } else {
                    this.systemMetrics.publicEndpoints++;
                }
                
                console.log(`   ✅ 測試完成 | 評分: ${testResult.score}/100`);
                
            } catch (error) {
                console.log(`   ❌ 測試失敗: ${error.message}`);
                testResult.error = error.message;
                this.systemMetrics.failedTests++;
            }
            
            this.testResults.push(testResult);
        }
        
        const endTime = Date.now();
        this.systemMetrics.totalTestTime = endTime - startTime;
        this.systemMetrics.averageResponseTime = this.calculateAverageResponseTime();
        
        console.log('\n' + '═'.repeat(80));
        console.log('🎉 所有測試完成！');
        
        // 生成並保存報告
        await this.generateReports();
        
        return this.testResults;
    }

    /**
     * 計算端點評分
     */
    calculateEndpointScore(testResult) {
        let score = 0;
        
        // 基礎可用性評分 (40分)
        const successfulMethods = testResult.methods.filter(m => m.success && m.statusCode < 400);
        score += (successfulMethods.length / testResult.methods.length) * 40;
        
        // 性能評分 (30分)
        if (testResult.performance) {
            const avgResponseTime = testResult.performance.summary.avgResponseTime;
            if (avgResponseTime < 1000) score += 30;
            else if (avgResponseTime < 3000) score += 20;
            else if (avgResponseTime < 5000) score += 10;
            // 超過5秒不加分
        } else {
            score += 15; // 非GET端點給予基礎分數
        }
        
        // 功能完整性評分 (20分)
        const hasValidJson = testResult.methods.some(m => m.analysis && m.analysis.isJson);
        const hasProperAuth = testResult.protected ? 
            testResult.methods.some(m => m.statusCode === 401 || m.statusCode === 403) : true;
        
        if (hasValidJson) score += 10;
        if (hasProperAuth) score += 10;
        
        // 錯誤處理評分 (10分)
        const hasGoodErrorHandling = testResult.methods.some(m => 
            m.statusCode >= 400 && m.statusCode < 500 && m.analysis && m.analysis.isJson
        );
        if (hasGoodErrorHandling) score += 10;
        
        return Math.round(score);
    }

    /**
     * 計算平均響應時間
     */
    calculateAverageResponseTime() {
        const allResponseTimes = [];
        this.testResults.forEach(result => {
            result.methods.forEach(method => {
                if (method.success && method.responseTime) {
                    allResponseTimes.push(method.responseTime);
                }
            });
        });
        
        if (allResponseTimes.length === 0) return 0;
        return Math.round(allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length);
    }

    /**
     * 生成完整測試報告
     */
    async generateReports() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 1. 生成JSON報告
        const jsonReport = {
            metadata: {
                testDate: new Date().toISOString(),
                baseUrl: this.baseUrl,
                engineVersion: '1.0.0',
                totalTestTime: this.systemMetrics.totalTestTime
            },
            systemMetrics: this.systemMetrics,
            testResults: this.testResults,
            summary: this.generateSummary()
        };
        
        const jsonReportPath = `D:\\0802\\api-test-report-${timestamp}.json`;
        await fs.writeFile(jsonReportPath, JSON.stringify(jsonReport, null, 2), 'utf8');
        
        // 2. 生成可讀格式報告
        const readableReport = this.generateReadableReport(jsonReport);
        const txtReportPath = `D:\\0802\\api-test-report-${timestamp}.txt`;
        await fs.writeFile(txtReportPath, readableReport, 'utf8');
        
        console.log(`📊 JSON報告已保存: ${jsonReportPath}`);
        console.log(`📝 文字報告已保存: ${txtReportPath}`);
        
        return { jsonReportPath, txtReportPath, data: jsonReport };
    }

    /**
     * 生成測試摘要
     */
    generateSummary() {
        const totalScore = this.testResults.reduce((sum, result) => sum + (result.score || 0), 0);
        const avgScore = this.testResults.length > 0 ? Math.round(totalScore / this.testResults.length) : 0;
        
        const criticalIssues = this.testResults.filter(result => 
            result.suggestions && result.suggestions.some(s => s.level === 'critical')
        ).length;
        
        const highIssues = this.testResults.filter(result =>
            result.suggestions && result.suggestions.some(s => s.level === 'high')
        ).length;
        
        return {
            overallScore: avgScore,
            totalEndpoints: this.systemMetrics.totalEndpoints,
            successfulEndpoints: this.systemMetrics.successfulTests,
            failedEndpoints: this.systemMetrics.failedTests,
            averageResponseTime: this.systemMetrics.averageResponseTime,
            criticalIssues,
            highIssues,
            authenticationEndpoints: this.systemMetrics.authRequiredEndpoints,
            publicEndpoints: this.systemMetrics.publicEndpoints
        };
    }

    /**
     * 生成可讀格式報告
     */
    generateReadableReport(jsonReport) {
        const { metadata, systemMetrics, testResults, summary } = jsonReport;
        
        let report = '';
        report += '═'.repeat(80) + '\n';
        report += '🚀 智慧API模板測試引擎 - 完整測試報告\n';
        report += '═'.repeat(80) + '\n';
        report += `📅 測試時間: ${new Date(metadata.testDate).toLocaleString('zh-TW')}\n`;
        report += `🌐 目標URL: ${metadata.baseUrl}\n`;
        report += `⏱️  總測試時間: ${Math.round(metadata.totalTestTime / 1000)}秒\n`;
        report += `🏆 整體評分: ${summary.overallScore}/100\n\n`;
        
        // 系統概覽
        report += '📊 系統概覽\n';
        report += '─'.repeat(50) + '\n';
        report += `總端點數量: ${summary.totalEndpoints}\n`;
        report += `成功測試: ${summary.successfulEndpoints}\n`;
        report += `失敗測試: ${summary.failedEndpoints}\n`;
        report += `平均響應時間: ${summary.averageResponseTime}ms\n`;
        report += `需要認證端點: ${summary.authenticationEndpoints}\n`;
        report += `公開端點: ${summary.publicEndpoints}\n`;
        report += `嚴重問題: ${summary.criticalIssues}\n`;
        report += `高優先級問題: ${summary.highIssues}\n\n`;
        
        // 詳細端點測試結果
        report += '🔍 詳細端點測試結果\n';
        report += '─'.repeat(50) + '\n';
        
        testResults.forEach((result, index) => {
            report += `\n${index + 1}. ${result.endpoint}\n`;
            report += `   描述: ${result.description}\n`;
            report += `   類型: ${result.type} | 保護: ${result.protected ? '是' : '否'}\n`;
            report += `   評分: ${result.score}/100\n`;
            
            // HTTP方法測試結果
            report += '   HTTP方法測試:\n';
            result.methods.forEach(method => {
                const status = method.success ? 
                    `✅ ${method.statusCode} (${method.responseTime}ms)` : 
                    `❌ ${method.error}`;
                report += `     ${method.method.padEnd(8)}: ${status}\n`;
            });
            
            // 性能測試結果
            if (result.performance) {
                const perf = result.performance.summary;
                report += `   性能測試: 平均${perf.avgResponseTime}ms, 成功率${perf.successRate.toFixed(1)}%\n`;
            }
            
            // 修復建議
            if (result.suggestions && result.suggestions.length > 0) {
                report += '   🔧 修復建議:\n';
                result.suggestions.forEach(suggestion => {
                    const levelIcon = suggestion.level === 'critical' ? '🚨' : 
                                    suggestion.level === 'high' ? '⚠️' : '💡';
                    report += `     ${levelIcon} [${suggestion.category}] ${suggestion.message}\n`;
                    report += `        建議動作: ${suggestion.action}\n`;
                });
            }
        });
        
        // 總結建議
        report += '\n🎯 總結建議\n';
        report += '─'.repeat(50) + '\n';
        
        if (summary.overallScore >= 80) {
            report += '✅ 系統整體運行良好，API架構完善。\n';
        } else if (summary.overallScore >= 60) {
            report += '⚠️ 系統基本可用，但存在一些需要改進的地方。\n';
        } else {
            report += '🚨 系統存在較多問題，建議優先修復關鍵功能。\n';
        }
        
        if (summary.criticalIssues > 0) {
            report += `🚨 發現 ${summary.criticalIssues} 個嚴重問題，請立即修復。\n`;
        }
        
        if (summary.averageResponseTime > 3000) {
            report += '⚡ 響應時間較慢，建議優化性能。\n';
        }
        
        report += '\n═'.repeat(80) + '\n';
        report += '報告生成完成 | Intelligent API Testing Engine v1.0.0\n';
        report += '═'.repeat(80) + '\n';
        
        return report;
    }
}

/**
 * 主執行函數
 */
async function main() {
    const targetUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
    
    console.log('🔧 初始化智慧API測試引擎...');
    const testEngine = new IntelligentAPITestingEngine(targetUrl, {
        timeout: 15000,
        maxConcurrency: 3,
        maxRetries: 2
    });
    
    try {
        const results = await testEngine.runComprehensiveTest();
        
        console.log('\n🎉 測試完成！主要發現:');
        console.log(`📊 整體評分: ${testEngine.generateSummary().overallScore}/100`);
        console.log(`✅ 成功端點: ${testEngine.systemMetrics.successfulTests}`);
        console.log(`❌ 失敗端點: ${testEngine.systemMetrics.failedTests}`);
        console.log(`⚡ 平均響應時間: ${testEngine.systemMetrics.averageResponseTime}ms`);
        
        return results;
        
    } catch (error) {
        console.error('❌ 測試執行失敗:', error.message);
        process.exit(1);
    }
}

// 如果直接運行此文件，執行主函數
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { IntelligentAPITestingEngine };
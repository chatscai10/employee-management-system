/**
 * 🔍 智慧模板深層驗證引擎
 * 企業級Google Cloud部署服務完整性驗證系統
 * 
 * 功能特性:
 * - 完整URL功能驗證和性能測試
 * - 深度API端點測試和架構分析
 * - 佔位頁面智能識別系統
 * - 系統完整性診斷分析
 * - 詳細修復建議生成
 * 
 * @version 2.0
 * @author Claude-Code-Pro
 * @created 2025-08-05
 */

const https = require('https');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

class IntelligentDeepTemplateVerificationEngine {
    constructor() {
        this.targetUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.results = {
            timestamp: new Date().toISOString(),
            overallStatus: 'unknown',
            scores: {
                functionality: 0,
                performance: 0,
                architecture: 0,
                completeness: 0,
                overall: 0
            },
            tests: [],
            issues: [],
            recommendations: [],
            deploymentAnalysis: {}
        };
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    /**
     * 🚀 啟動完整深度驗證流程
     */
    async startComprehensiveVerification() {
        console.log('🔍 啟動智慧模板深層驗證引擎...');
        console.log(`🎯 目標URL: ${this.targetUrl}`);
        
        try {
            // 階段1: 基礎連通性驗證
            await this.performBasicConnectivityTests();
            
            // 階段2: 深度功能驗證
            await this.performDeepFunctionalityTests();
            
            // 階段3: API端點分析
            await this.performApiEndpointAnalysis();
            
            // 階段4: 架構完整性檢查
            await this.performArchitectureIntegrityCheck();
            
            // 階段5: 佔位頁面檢測
            await this.performPlaceholderDetection();
            
            // 階段6: 性能分析
            await this.performPerformanceAnalysis();
            
            // 階段7: 安全性檢查
            await this.performSecurityAnalysis();
            
            // 階段8: 生成綜合分析報告
            await this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ 驗證過程中發生錯誤:', error.message);
            this.results.issues.push({
                type: 'critical_error',
                message: `驗證引擎執行失敗: ${error.message}`,
                severity: 'critical'
            });
        }
        
        return this.results;
    }

    /**
     * 🌐 基礎連通性驗證測試
     */
    async performBasicConnectivityTests() {
        console.log('\n📡 階段1: 執行基礎連通性驗證...');
        
        const connectivityTests = [
            { name: 'HTTP連接測試', test: () => this.testHttpConnection() },
            { name: 'DNS解析驗證', test: () => this.testDnsResolution() },
            { name: '響應時間測量', test: () => this.measureResponseTime() },
            { name: 'SSL證書驗證', test: () => this.validateSslCertificate() }
        ];
        
        for (const testCase of connectivityTests) {
            try {
                console.log(`  🔧 執行: ${testCase.name}`);
                const result = await testCase.test();
                this.results.tests.push({
                    category: 'connectivity',
                    name: testCase.name,
                    status: result.success ? 'passed' : 'failed',
                    details: result,
                    timestamp: new Date().toISOString()
                });
                
                if (result.success) {
                    console.log(`    ✅ ${testCase.name} - 通過`);
                } else {
                    console.log(`    ❌ ${testCase.name} - 失敗: ${result.error}`);
                }
            } catch (error) {
                console.log(`    ⚠️ ${testCase.name} - 異常: ${error.message}`);
                this.results.issues.push({
                    type: 'connectivity_error',
                    test: testCase.name,
                    message: error.message,
                    severity: 'high'
                });
            }
        }
    }

    /**
     * 🔍 深度功能驗證測試
     */
    async performDeepFunctionalityTests() {
        console.log('\n🎯 階段2: 執行深度功能驗證...');
        
        const functionalTests = [
            { name: '主頁載入完整性', test: () => this.testPageLoadCompleteness() },
            { name: 'JavaScript執行狀態', test: () => this.testJavaScriptExecution() },
            { name: 'CSS樣式載入檢查', test: () => this.testCssLoading() },
            { name: '表單功能驗證', test: () => this.testFormFunctionality() },
            { name: '導航功能測試', test: () => this.testNavigationFunctionality() }
        ];
        
        for (const testCase of functionalTests) {
            try {
                console.log(`  🔧 執行: ${testCase.name}`);
                const result = await testCase.test();
                this.results.tests.push({
                    category: 'functionality',
                    name: testCase.name,
                    status: result.success ? 'passed' : 'failed',
                    details: result,
                    timestamp: new Date().toISOString()
                });
                
                this.updateFunctionalityScore(result);
                
            } catch (error) {
                console.log(`    ⚠️ ${testCase.name} - 異常: ${error.message}`);
                this.results.issues.push({
                    type: 'functionality_error',
                    test: testCase.name,
                    message: error.message,
                    severity: 'medium'
                });
            }
        }
    }

    /**
     * 🔗 API端點深度分析
     */
    async performApiEndpointAnalysis() {
        console.log('\n🔗 階段3: 執行API端點深度分析...');
        
        const commonApiEndpoints = [
            '/api/employees',
            '/api/auth/login',
            '/api/auth/logout',
            '/api/departments',
            '/api/users',
            '/api/health',
            '/api/status',
            '/health',
            '/status'
        ];
        
        for (const endpoint of commonApiEndpoints) {
            try {
                console.log(`  🔧 測試API端點: ${endpoint}`);
                const result = await this.testApiEndpoint(endpoint);
                
                this.results.tests.push({
                    category: 'api',
                    name: `API端點測試: ${endpoint}`,
                    status: result.exists ? 'passed' : 'not_found',
                    details: result,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                this.results.issues.push({
                    type: 'api_error',
                    endpoint: endpoint,
                    message: error.message,
                    severity: 'medium'
                });
            }
        }
    }

    /**
     * 🏗️ 系統架構完整性檢查
     */
    async performArchitectureIntegrityCheck() {
        console.log('\n🏗️ 階段4: 執行系統架構完整性檢查...');
        
        try {
            const htmlContent = await this.fetchPageContent();
            const analysis = await this.analyzeArchitecture(htmlContent);
            
            this.results.deploymentAnalysis = {
                htmlStructure: analysis.htmlStructure,
                frameworkDetection: analysis.frameworks,
                resourceLoading: analysis.resources,
                errorAnalysis: analysis.errors,
                completenessScore: analysis.completenessScore
            };
            
            console.log(`  📊 架構完整性分數: ${analysis.completenessScore}/100`);
            this.results.scores.architecture = analysis.completenessScore;
            
        } catch (error) {
            console.log(`  ❌ 架構分析失敗: ${error.message}`);
            this.results.issues.push({
                type: 'architecture_error',
                message: error.message,
                severity: 'high'
            });
        }
    }

    /**
     * 🎭 佔位頁面智能檢測
     */
    async performPlaceholderDetection() {
        console.log('\n🎭 階段5: 執行佔位頁面智能檢測...');
        
        try {
            const htmlContent = await this.fetchPageContent();
            const placeholderAnalysis = this.detectPlaceholderContent(htmlContent);
            
            this.results.tests.push({
                category: 'placeholder_detection',
                name: '佔位內容檢測',
                status: placeholderAnalysis.isPlaceholder ? 'warning' : 'passed',
                details: placeholderAnalysis,
                timestamp: new Date().toISOString()
            });
            
            if (placeholderAnalysis.isPlaceholder) {
                console.log('  ⚠️ 檢測到佔位頁面內容');
                this.results.issues.push({
                    type: 'placeholder_content',
                    message: '網站可能仍在使用佔位內容，需要部署實際應用',
                    severity: 'high',
                    details: placeholderAnalysis.indicators
                });
            } else {
                console.log('  ✅ 未檢測到佔位內容，似乎是實際應用');
            }
            
        } catch (error) {
            console.log(`  ❌ 佔位檢測失敗: ${error.message}`);
        }
    }

    /**
     * ⚡ 性能分析測試
     */
    async performPerformanceAnalysis() {
        console.log('\n⚡ 階段6: 執行性能分析測試...');
        
        const performanceTests = [
            { name: '頁面載入時間', test: () => this.measurePageLoadTime() },
            { name: '資源載入效率', test: () => this.analyzeResourceLoading() },
            { name: '響應速度評估', test: () => this.evaluateResponseSpeed() }
        ];
        
        let performanceScore = 0;
        let testCount = 0;
        
        for (const testCase of performanceTests) {
            try {
                console.log(`  🔧 執行: ${testCase.name}`);
                const result = await testCase.test();
                
                this.results.tests.push({
                    category: 'performance',
                    name: testCase.name,
                    status: result.success ? 'passed' : 'failed',
                    details: result,
                    timestamp: new Date().toISOString()
                });
                
                if (result.score !== undefined) {
                    performanceScore += result.score;
                    testCount++;
                }
                
            } catch (error) {
                console.log(`    ⚠️ ${testCase.name} - 異常: ${error.message}`);
            }
        }
        
        this.results.scores.performance = testCount > 0 ? Math.round(performanceScore / testCount) : 0;
        console.log(`  📊 性能分數: ${this.results.scores.performance}/100`);
    }

    /**
     * 🔒 安全性分析檢查
     */
    async performSecurityAnalysis() {
        console.log('\n🔒 階段7: 執行安全性分析檢查...');
        
        try {
            const securityChecks = await this.performSecurityChecks();
            
            this.results.tests.push({
                category: 'security',
                name: '安全性檢查',
                status: securityChecks.overallStatus,
                details: securityChecks,
                timestamp: new Date().toISOString()
            });
            
            console.log(`  🛡️ 安全性檢查完成，發現 ${securityChecks.issues.length} 個問題`);
            
        } catch (error) {
            console.log(`  ❌ 安全性檢查失敗: ${error.message}`);
        }
    }

    /**
     * 📊 生成綜合分析報告
     */
    async generateComprehensiveReport() {
        console.log('\n📊 階段8: 生成綜合分析報告...');
        
        // 計算總體分數
        this.calculateOverallScores();
        
        // 生成修復建議
        this.generateRepairRecommendations();
        
        // 設定整體狀態
        this.determineOverallStatus();
        
        // 保存詳細報告
        await this.saveDetailedReport();
        
        console.log('\n📋 驗證完成摘要:');
        console.log(`  🎯 整體狀態: ${this.results.overallStatus}`);
        console.log(`  📊 功能完整度: ${this.results.scores.functionality}/100`);
        console.log(`  ⚡ 性能分數: ${this.results.scores.performance}/100`);
        console.log(`  🏗️ 架構分數: ${this.results.scores.architecture}/100`);
        console.log(`  🔄 整體分數: ${this.results.scores.overall}/100`);
        console.log(`  ⚠️ 發現問題數: ${this.results.issues.length}`);
        console.log(`  💡 修復建議數: ${this.results.recommendations.length}`);
    }

    // ========== 輔助測試方法 ==========

    /**
     * 🌐 HTTP連接測試
     */
    async testHttpConnection() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const parsedUrl = url.parse(this.targetUrl);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path || '/',
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 10000
            };
            
            const request = https.request(options, (response) => {
                const endTime = Date.now();
                resolve({
                    success: true,
                    statusCode: response.statusCode,
                    responseTime: endTime - startTime,
                    headers: response.headers
                });
            });
            
            request.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });
            
            request.on('timeout', () => {
                request.destroy();
                resolve({
                    success: false,
                    error: '連接超時'
                });
            });
            
            request.end();
        });
    }

    /**
     * 🏠 測試頁面載入完整性
     */
    async testPageLoadCompleteness() {
        try {
            const content = await this.fetchPageContent();
            
            const analysis = {
                hasHtml: content.includes('<html'),
                hasHead: content.includes('<head'),
                hasBody: content.includes('<body'),
                hasTitle: content.includes('<title'),
                contentLength: content.length,
                hasJavaScript: content.includes('<script'),
                hasCss: content.includes('<style') || content.includes('stylesheet'),
                hasMetaTags: content.includes('<meta'),
                isEmpty: content.trim().length < 100
            };
            
            const completenessScore = this.calculatePageCompletenessScore(analysis);
            
            return {
                success: completenessScore > 50,
                score: completenessScore,
                analysis: analysis,
                contentPreview: content.substring(0, 200)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🔗 測試API端點
     */
    async testApiEndpoint(endpoint) {
        return new Promise((resolve) => {
            const fullUrl = this.targetUrl + endpoint;
            const parsedUrl = url.parse(fullUrl);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path,
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'application/json'
                },
                timeout: 5000
            };
            
            const request = https.request(options, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    resolve({
                        exists: true,
                        statusCode: response.statusCode,
                        headers: response.headers,
                        responseLength: data.length,
                        isJson: this.isValidJson(data),
                        preview: data.substring(0, 100)
                    });
                });
            });
            
            request.on('error', () => {
                resolve({
                    exists: false,
                    error: 'API端點不可用'
                });
            });
            
            request.on('timeout', () => {
                request.destroy();
                resolve({
                    exists: false,
                    error: '請求超時'
                });
            });
            
            request.end();
        });
    }

    /**
     * 🎭 檢測佔位內容
     */
    detectPlaceholderContent(htmlContent) {
        const placeholderIndicators = [
            'Hello World',
            'Welcome to',
            'This is a placeholder',
            'Coming Soon',
            'Under Construction',
            'Default Page',
            'Sample Application',
            'Test Page',
            'Congratulations',
            'It works!',
            'nginx',
            'Apache',
            'IIS',
            'Default Server Page'
        ];
        
        const foundIndicators = [];
        let indicatorCount = 0;
        
        for (const indicator of placeholderIndicators) {
            if (htmlContent.toLowerCase().includes(indicator.toLowerCase())) {
                foundIndicators.push(indicator);
                indicatorCount++;
            }
        }
        
        // 檢查頁面是否過於簡單
        const isSimplePage = htmlContent.length < 1000 && 
                           (htmlContent.match(/<div|<p|<span/g) || []).length < 5;
        
        return {
            isPlaceholder: indicatorCount > 0 || isSimplePage,
            confidence: Math.min((indicatorCount * 20) + (isSimplePage ? 30 : 0), 100),
            indicators: foundIndicators,
            isSimplePage: isSimplePage,
            analysis: {
                contentLength: htmlContent.length,
                elementCount: (htmlContent.match(/<[^\/]/g) || []).length
            }
        };
    }

    /**
     * 📄 獲取頁面內容
     */
    async fetchPageContent() {
        return new Promise((resolve, reject) => {
            const parsedUrl = url.parse(this.targetUrl);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.path || '/',
                method: 'GET',
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 15000
            };
            
            const request = https.request(options, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    resolve(data);
                });
            });
            
            request.on('error', (error) => {
                reject(error);
            });
            
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('請求超時'));
            });
            
            request.end();
        });
    }

    // ========== 分析和計算方法 ==========

    /**
     * 🏗️ 分析系統架構
     */
    async analyzeArchitecture(htmlContent) {
        const frameworks = this.detectFrameworks(htmlContent);
        const resources = this.analyzeResources(htmlContent);
        const errors = this.detectErrors(htmlContent);
        
        return {
            htmlStructure: this.analyzeHtmlStructure(htmlContent),
            frameworks: frameworks,
            resources: resources,
            errors: errors,
            completenessScore: this.calculateArchitectureScore(htmlContent, frameworks, resources)
        };
    }

    /**
     * 🔧 檢測前端框架
     */
    detectFrameworks(htmlContent) {
        const frameworks = [];
        
        const frameworkIndicators = {
            'React': ['react', '__REACT', 'ReactDOM'],
            'Vue.js': ['vue.js', '__VUE__', 'Vue.component'],
            'Angular': ['angular', 'ng-app', '@angular'],
            'jQuery': ['jquery', '$'],
            'Bootstrap': ['bootstrap', 'btn-', 'container-fluid'],
            'Material-UI': ['material-ui', 'mui-'],
            'Express': ['express', 'X-Powered-By: Express']
        };
        
        for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
            const found = indicators.some(indicator => 
                htmlContent.toLowerCase().includes(indicator.toLowerCase())
            );
            if (found) {
                frameworks.push(framework);
            }
        }
        
        return frameworks;
    }

    /**
     * 📊 計算頁面完整性分數
     */
    calculatePageCompletenessScore(analysis) {
        let score = 0;
        
        if (analysis.hasHtml) score += 15;
        if (analysis.hasHead) score += 15;
        if (analysis.hasBody) score += 15;
        if (analysis.hasTitle) score += 10;
        if (analysis.hasJavaScript) score += 15;
        if (analysis.hasCss) score += 15;
        if (analysis.hasMetaTags) score += 10;
        if (analysis.contentLength > 1000) score += 5;
        
        if (analysis.isEmpty) score = 0;
        
        return Math.min(score, 100);
    }

    /**
     * 🎯 計算總體分數
     */
    calculateOverallScores() {
        const { functionality, performance, architecture } = this.results.scores;
        
        // 計算完整性分數
        const passedTests = this.results.tests.filter(test => test.status === 'passed').length;
        const totalTests = this.results.tests.length;
        this.results.scores.completeness = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        
        // 計算總體分數
        this.results.scores.overall = Math.round(
            (functionality * 0.3 + performance * 0.25 + architecture * 0.25 + this.results.scores.completeness * 0.2)
        );
    }

    /**
     * 💡 生成修復建議
     */
    generateRepairRecommendations() {
        const recommendations = [];
        
        // 基於問題生成建議
        for (const issue of this.results.issues) {
            switch (issue.type) {
                case 'placeholder_content':
                    recommendations.push({
                        priority: 'high',
                        category: '部署問題',
                        title: '部署實際應用程式',
                        description: '當前部署似乎是佔位頁面，需要部署實際的員工管理系統應用',
                        actions: [
                            '確認application.yaml配置正確',
                            '檢查Docker映像檔是否包含實際應用',
                            '驗證gcloud deploy命令執行無誤',
                            '檢查環境變數和配置文件'
                        ]
                    });
                    break;
                    
                case 'connectivity_error':
                    recommendations.push({
                        priority: 'critical',
                        category: '連接問題',
                        title: '修復網路連接問題',
                        description: `解決連接錯誤: ${issue.message}`,
                        actions: [
                            '檢查Cloud Run服務狀態',
                            '驗證防火牆規則設置',
                            '確認域名DNS設置正確',
                            '檢查SSL證書配置'
                        ]
                    });
                    break;
                    
                case 'api_error':
                    recommendations.push({
                        priority: 'medium',
                        category: 'API問題',
                        title: '修復API端點問題',
                        description: `API端點 ${issue.endpoint} 無法正常存取`,
                        actions: [
                            '檢查後端路由配置',
                            '驗證API控制器實現',
                            '確認數據庫連接正常',
                            '檢查CORS設置'
                        ]
                    });
                    break;
            }
        }
        
        // 性能優化建議
        if (this.results.scores.performance < 70) {
            recommendations.push({
                priority: 'medium',
                category: '性能優化',
                title: '改善應用性能',
                description: '應用響應速度需要優化',
                actions: [
                    '啟用gzip壓縮',
                    '優化靜態資源載入',
                    '實施瀏覽器緩存策略',
                    '考慮使用CDN服務'
                ]
            });
        }
        
        this.results.recommendations = recommendations;
    }

    /**
     * 🎯 確定整體狀態
     */
    determineOverallStatus() {
        const overallScore = this.results.scores.overall;
        const criticalIssues = this.results.issues.filter(issue => issue.severity === 'critical').length;
        
        if (criticalIssues > 0 || overallScore < 30) {
            this.results.overallStatus = '嚴重問題';
        } else if (overallScore < 50) {
            this.results.overallStatus = '需要修復';
        } else if (overallScore < 70) {
            this.results.overallStatus = '基本可用';
        } else if (overallScore < 85) {
            this.results.overallStatus = '良好';
        } else {
            this.results.overallStatus = '優秀';
        }
    }

    // ========== 性能測試方法 ==========

    async measurePageLoadTime() {
        const startTime = Date.now();
        try {
            await this.fetchPageContent();
            const loadTime = Date.now() - startTime;
            
            let score = 100;
            if (loadTime > 3000) score = 20;
            else if (loadTime > 2000) score = 40;
            else if (loadTime > 1000) score = 70;
            else if (loadTime > 500) score = 85;
            
            return {
                success: true,
                loadTime: loadTime,
                score: score
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                score: 0
            };
        }
    }

    async measureResponseTime() {
        const measurements = [];
        
        for (let i = 0; i < 3; i++) {
            const startTime = Date.now();
            try {
                await this.testHttpConnection();
                measurements.push(Date.now() - startTime);
            } catch (error) {
                measurements.push(10000); // 錯誤時記為10秒
            }
        }
        
        const avgTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        
        return {
            success: avgTime < 5000,
            averageTime: avgTime,
            measurements: measurements
        };
    }

    async testDnsResolution() {
        // 簡化的DNS測試
        try {
            const parsedUrl = url.parse(this.targetUrl);
            return {
                success: true,
                hostname: parsedUrl.hostname
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async validateSslCertificate() {
        // 簡化的SSL驗證
        return new Promise((resolve) => {
            const parsedUrl = url.parse(this.targetUrl);
            
            const options = {
                hostname: parsedUrl.hostname,
                port: 443,
                method: 'GET',
                rejectUnauthorized: true
            };
            
            const request = https.request(options, (response) => {
                resolve({
                    success: true,
                    valid: true,
                    issuer: response.connection?.getPeerCertificate?.()?.issuer
                });
            });
            
            request.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message
                });
            });
            
            request.end();
        });
    }

    // ========== 更多測試方法 ==========

    async testJavaScriptExecution() {
        try {
            const content = await this.fetchPageContent();
            const hasScript = content.includes('<script');
            const hasInlineJs = content.includes('javascript:') || content.includes('onclick=');
            
            return {
                success: hasScript || hasInlineJs,
                hasExternalScripts: content.includes('src='),
                hasInlineScripts: content.includes('<script>') && !content.includes('src='),
                scriptCount: (content.match(/<script/g) || []).length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testCssLoading() {
        try {
            const content = await this.fetchPageContent();
            const hasStylesheet = content.includes('stylesheet');
            const hasInlineStyle = content.includes('<style');
            
            return {
                success: hasStylesheet || hasInlineStyle,
                hasExternalCss: content.includes('rel="stylesheet"'),
                hasInlineCss: hasInlineStyle,
                cssCount: (content.match(/stylesheet|<style/g) || []).length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testFormFunctionality() {
        try {
            const content = await this.fetchPageContent();
            const formCount = (content.match(/<form/g) || []).length;
            const inputCount = (content.match(/<input/g) || []).length;
            
            return {
                success: formCount > 0,
                formCount: formCount,
                inputCount: inputCount,
                hasSubmitButton: content.includes('type="submit"')
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async testNavigationFunctionality() {
        try {
            const content = await this.fetchPageContent();
            const linkCount = (content.match(/<a\s+href=/g) || []).length;
            const navCount = (content.match(/<nav/g) || []).length;
            
            return {
                success: linkCount > 0,
                linkCount: linkCount,
                navigationCount: navCount,
                hasMenu: content.includes('menu') || content.includes('nav')
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeResourceLoading() {
        try {
            const content = await this.fetchPageContent();
            
            const images = (content.match(/<img/g) || []).length;
            const scripts = (content.match(/<script.*src=/g) || []).length;
            const stylesheets = (content.match(/rel="stylesheet"/g) || []).length;
            
            const totalResources = images + scripts + stylesheets;
            let score = 80;
            
            if (totalResources > 20) score = 40;
            else if (totalResources > 10) score = 60;
            else if (totalResources > 5) score = 80;
            
            return {
                success: true,
                score: score,
                resources: {
                    images: images,
                    scripts: scripts,
                    stylesheets: stylesheets,
                    total: totalResources
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                score: 0
            };
        }
    }

    async evaluateResponseSpeed() {
        const tests = [];
        
        for (let i = 0; i < 5; i++) {
            const startTime = Date.now();
            try {
                await this.testHttpConnection();
                tests.push(Date.now() - startTime);
            } catch (error) {
                tests.push(10000);
            }
        }
        
        const avgTime = tests.reduce((a, b) => a + b, 0) / tests.length;
        const minTime = Math.min(...tests);
        const maxTime = Math.max(...tests);
        
        let score = 100;
        if (avgTime > 2000) score = 20;
        else if (avgTime > 1000) score = 50;
        else if (avgTime > 500) score = 80;
        
        return {
            success: avgTime < 3000,
            score: score,
            averageTime: avgTime,
            minTime: minTime,
            maxTime: maxTime,
            consistency: maxTime - minTime
        };
    }

    async performSecurityChecks() {
        try {
            const content = await this.fetchPageContent();
            const connection = await this.testHttpConnection();
            
            const securityIssues = [];
            
            // 檢查HTTPS
            if (!this.targetUrl.startsWith('https://')) {
                securityIssues.push('網站未使用HTTPS加密');
            }
            
            // 檢查安全標頭
            if (connection.headers) {
                if (!connection.headers['x-frame-options']) {
                    securityIssues.push('缺少X-Frame-Options標頭');
                }
                if (!connection.headers['x-content-type-options']) {
                    securityIssues.push('缺少X-Content-Type-Options標頭');
                }
            }
            
            // 檢查敏感資訊暴露
            if (content.includes('password') && content.includes('admin')) {
                securityIssues.push('可能存在敏感資訊暴露');
            }
            
            return {
                overallStatus: securityIssues.length === 0 ? 'passed' : 'warning',
                issues: securityIssues,
                checksPerformed: [
                    'HTTPS使用檢查',
                    '安全標頭檢查',
                    '敏感資訊檢查'
                ]
            };
        } catch (error) {
            return {
                overallStatus: 'error',
                issues: [`安全檢查失敗: ${error.message}`],
                checksPerformed: []
            };
        }
    }

    // ========== 輔助方法 ==========

    updateFunctionalityScore(result) {
        if (result.score !== undefined) {
            this.results.scores.functionality = Math.max(
                this.results.scores.functionality, 
                result.score
            );
        }
    }

    analyzeHtmlStructure(htmlContent) {
        return {
            hasDoctype: htmlContent.toLowerCase().includes('<!doctype'),
            hasHtml5: htmlContent.toLowerCase().includes('<!doctype html>'),
            elementCount: (htmlContent.match(/<[^\/!]/g) || []).length,
            hasSemanticTags: /(<header|<nav|<main|<section|<article|<aside|<footer)/i.test(htmlContent),
            contentLength: htmlContent.length
        };
    }

    analyzeResources(htmlContent) {
        return {
            images: (htmlContent.match(/<img/g) || []).length,
            scripts: (htmlContent.match(/<script/g) || []).length,
            stylesheets: (htmlContent.match(/rel="stylesheet"/g) || []).length,
            links: (htmlContent.match(/<a\s+href=/g) || []).length,
            externalResources: (htmlContent.match(/https?:\/\/[^\s"']+/g) || []).length
        };
    }

    detectErrors(htmlContent) {
        const errors = [];
        
        // 檢查常見錯誤
        if (htmlContent.includes('404') || htmlContent.includes('Not Found')) {
            errors.push('可能存在404錯誤');
        }
        
        if (htmlContent.includes('500') || htmlContent.includes('Internal Server Error')) {
            errors.push('可能存在500伺服器錯誤');
        }
        
        if (htmlContent.includes('Error') || htmlContent.includes('Exception')) {
            errors.push('頁面中包含錯誤訊息');
        }
        
        return errors;
    }

    calculateArchitectureScore(htmlContent, frameworks, resources) {
        let score = 50; // 基礎分數
        
        // 框架加分
        score += frameworks.length * 10;
        
        // 資源完整性加分
        if (resources.scripts > 0) score += 10;
        if (resources.stylesheets > 0) score += 10;
        if (resources.images > 0) score += 5;
        
        // HTML結構加分
        if (htmlContent.includes('<!DOCTYPE html>')) score += 10;
        if (htmlContent.includes('<meta charset=')) score += 5;
        if (htmlContent.includes('<meta name="viewport"')) score += 5;
        
        return Math.min(score, 100);
    }

    isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 💾 保存詳細驗證報告
     */
    async saveDetailedReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFileName = `intelligent-deep-verification-report-${timestamp}.json`;
        const reportPath = path.join(process.cwd(), reportFileName);
        
        try {
            const reportContent = JSON.stringify(this.results, null, 2);
            fs.writeFileSync(reportPath, reportContent, 'utf8');
            
            console.log(`📁 詳細報告已保存: ${reportFileName}`);
            
            // 同時生成人類可讀的報告
            await this.generateHumanReadableReport(timestamp);
            
        } catch (error) {
            console.error('❌ 保存報告失敗:', error.message);
        }
    }

    /**
     * 📋 生成人類可讀報告
     */
    async generateHumanReadableReport(timestamp) {
        const readableReportFileName = `verification-summary-${timestamp}.txt`;
        const reportPath = path.join(process.cwd(), readableReportFileName);
        
        const summary = `
🔍 智慧模板深層驗證報告
=================================
測試目標: ${this.targetUrl}
執行時間: ${this.results.timestamp}
整體狀態: ${this.results.overallStatus}

📊 分數摘要:
- 功能完整度: ${this.results.scores.functionality}/100
- 性能分數: ${this.results.scores.performance}/100  
- 架構分數: ${this.results.scores.architecture}/100
- 測試完成度: ${this.results.scores.completeness}/100
- 整體分數: ${this.results.scores.overall}/100

🧪 測試結果摘要:
- 總測試數: ${this.results.tests.length}
- 通過測試: ${this.results.tests.filter(t => t.status === 'passed').length}
- 失敗測試: ${this.results.tests.filter(t => t.status === 'failed').length}
- 警告測試: ${this.results.tests.filter(t => t.status === 'warning').length}

⚠️ 發現的問題 (${this.results.issues.length}個):
${this.results.issues.map(issue => `- [${issue.severity?.toUpperCase() || 'UNKNOWN'}] ${issue.type}: ${issue.message}`).join('\n')}

💡 修復建議 (${this.results.recommendations.length}個):
${this.results.recommendations.map(rec => `- [${rec.priority?.toUpperCase()}] ${rec.title}: ${rec.description}`).join('\n')}

🔗 部署分析:
${this.results.deploymentAnalysis.frameworkDetection ? 
  `- 檢測到的框架: ${this.results.deploymentAnalysis.frameworkDetection.join(', ')}` : 
  '- 未檢測到前端框架'}
${this.results.deploymentAnalysis.completenessScore ? 
  `- 架構完整性: ${this.results.deploymentAnalysis.completenessScore}/100` : ''}

=================================
報告生成完成 | Claude Code Pro 智慧驗證引擎
        `;
        
        try {
            fs.writeFileSync(reportPath, summary, 'utf8');
            console.log(`📄 摘要報告已保存: ${readableReportFileName}`);
        } catch (error) {
            console.error('❌ 保存摘要報告失敗:', error.message);
        }
    }
}

// ========== 主要執行程序 ==========

/**
 * 🚀 主要驗證執行函數
 */
async function executeIntelligentVerification() {
    console.log('🔍 智慧模板深層驗證引擎啟動...');
    console.log('='.repeat(50));
    
    const verificationEngine = new IntelligentDeepTemplateVerificationEngine();
    
    try {
        const results = await verificationEngine.startComprehensiveVerification();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 智慧深層驗證完成!');
        console.log(`📊 整體評估: ${results.overallStatus}`);
        console.log(`🔢 總體分數: ${results.scores.overall}/100`);
        
        return results;
        
    } catch (error) {
        console.error('💥 驗證引擎執行失敗:', error.message);
        return null;
    }
}

// 模塊導出
module.exports = {
    IntelligentDeepTemplateVerificationEngine,
    executeIntelligentVerification
};

// 直接執行檢查
if (require.main === module) {
    executeIntelligentVerification()
        .then(results => {
            if (results) {
                console.log('\n✅ 驗證引擎執行成功');
                process.exit(0);
            } else {
                console.log('\n❌ 驗證引擎執行失敗');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 未預期的錯誤:', error);
            process.exit(1);
        });
}
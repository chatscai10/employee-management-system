// 🌐 深度網址分析引擎 - 真實部署系統完整性深度分析
// 對部署後的網址進行徹底的功能完整性檢測和分析

const https = require('https');
const fs = require('fs').promises;

class DeepUrlAnalysisEngine {
    constructor() {
        this.targetUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.analysisResults = {
            systemInfo: {},
            pageAnalysis: {},
            apiDiscovery: {},
            functionalityMapping: {},
            completenessAssessment: {},
            securityAnalysis: {},
            performanceMetrics: {}
        };
        
        // 企業系統預期功能列表
        this.expectedFeatures = {
            authentication: ['login', 'logout', 'role-based access'],
            employeeManagement: ['employee list', 'employee details', 'department management'],
            attendance: ['check-in', 'check-out', 'attendance records', 'scheduling'],
            inventory: ['item management', 'stock tracking', 'purchase orders'],
            maintenance: ['equipment maintenance', 'repair requests', 'issue tracking'],
            revenue: ['revenue tracking', 'financial reports', 'department performance'],
            promotion: ['promotion voting', 'candidate evaluation'],
            system: ['health monitoring', 'system status', 'API documentation']
        };
        
        // 預期API端點
        this.expectedApiEndpoints = [
            '/health',
            '/api/system/status',
            '/api/auth/login',
            '/api/employees',
            '/api/employees/:id',
            '/api/attendance',
            '/api/attendance/checkin',
            '/api/schedules',
            '/api/inventory',
            '/api/orders',
            '/api/maintenance',
            '/api/revenue',
            '/api/promotion-votes',
            '/api/docs'
        ];
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve) => {
            const url = this.targetUrl + path;
            
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Deep-Analysis-Engine/1.0',
                    'Accept': 'text/html,application/json,*/*'
                },
                timeout: 15000
            };
            
            const finalOptions = { ...defaultOptions, ...options };
            if (finalOptions.headers && options.headers) {
                finalOptions.headers = { ...defaultOptions.headers, ...options.headers };
            }
            
            const req = https.request(url, finalOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                        success: res.statusCode >= 200 && res.statusCode < 300,
                        responseTime: Date.now() - startTime
                    });
                });
            });

            const startTime = Date.now();

            req.on('error', (error) => {
                resolve({
                    error: error.message,
                    success: false,
                    statusCode: 0,
                    responseTime: Date.now() - startTime
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({
                    error: 'Request timeout',
                    success: false,
                    statusCode: 0,
                    responseTime: Date.now() - startTime
                });
            });

            if (options.body) {
                req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async analyzeSystemInfo() {
        console.log('🔍 分析系統基本資訊...');
        
        // 檢查健康端點
        const healthResponse = await this.makeRequest('/health');
        let systemInfo = {
            accessible: healthResponse.success,
            responseTime: healthResponse.responseTime
        };
        
        if (healthResponse.success) {
            try {
                const healthData = JSON.parse(healthResponse.body);
                systemInfo = {
                    ...systemInfo,
                    version: healthData.version,
                    status: healthData.status,
                    timestamp: healthData.timestamp,
                    message: healthData.message
                };
                console.log(`   ✅ 系統可訪問 - 版本: ${healthData.version}`);
                console.log(`   📊 回應時間: ${healthResponse.responseTime}ms`);
            } catch (error) {
                systemInfo.parseError = error.message;
                console.log(`   ⚠️ 健康檢查回應解析失敗: ${error.message}`);
            }
        } else {
            console.log(`   ❌ 系統無法訪問: ${healthResponse.error || healthResponse.statusCode}`);
        }
        
        this.analysisResults.systemInfo = systemInfo;
        return systemInfo;
    }

    async analyzePageStructure() {
        console.log('\n📄 分析頁面結構和內容...');
        
        const pagesToAnalyze = ['/', '/login', '/dashboard'];
        const pageAnalysis = {};
        
        for (const page of pagesToAnalyze) {
            console.log(`   🔍 分析頁面: ${page}`);
            
            const response = await this.makeRequest(page);
            const analysis = {
                accessible: response.success,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                contentLength: response.body ? response.body.length : 0
            };
            
            if (response.success && response.body) {
                // HTML內容分析
                const content = response.body;
                analysis.contentType = response.headers['content-type'] || 'unknown';
                analysis.hasHTML = content.includes('<!DOCTYPE html>');
                analysis.hasCSS = content.includes('<style>') || content.includes('.css');
                analysis.hasJavaScript = content.includes('<script>');
                
                // 版本檢測
                analysis.hasV3Reference = content.includes('v3.0.0') || content.includes('3.0.0');
                analysis.hasV4Reference = content.includes('v4.0.0') || content.includes('4.0.0');
                
                // 功能檢測
                analysis.hasLoginForm = content.includes('login') || content.includes('登入');
                analysis.hasDashboard = content.includes('dashboard') || content.includes('主控台');
                analysis.hasEmployeeFeatures = content.includes('employee') || content.includes('員工');
                analysis.hasEnterpriseFeatures = content.includes('企業') || content.includes('Enterprise');
                
                // API引用檢測
                analysis.apiReferences = [];
                const apiMatches = content.match(/\/api\/[a-zA-Z0-9\/\-_]+/g);
                if (apiMatches) {
                    analysis.apiReferences = [...new Set(apiMatches)];
                }
                
                console.log(`     ✅ 頁面可訪問 (${analysis.contentLength} bytes)`);
                console.log(`     📊 版本標識: v3=${analysis.hasV3Reference}, v4=${analysis.hasV4Reference}`);
                console.log(`     🔧 功能標識: 登入=${analysis.hasLoginForm}, 主控台=${analysis.hasDashboard}`);
                console.log(`     🌐 API引用: ${analysis.apiReferences.length}個端點`);
            } else {
                console.log(`     ❌ 頁面無法訪問: ${response.error || response.statusCode}`);
            }
            
            pageAnalysis[page] = analysis;
        }
        
        this.analysisResults.pageAnalysis = pageAnalysis;
        return pageAnalysis;
    }

    async discoverApiEndpoints() {
        console.log('\n🔍 執行API端點發現和深度掃描...');
        
        const apiDiscovery = {
            discoveredEndpoints: {},
            missingEndpoints: [],
            unexpectedEndpoints: [],
            functionalCategories: {}
        };
        
        // 測試所有預期的API端點
        for (const endpoint of this.expectedApiEndpoints) {
            console.log(`   🧪 測試端點: ${endpoint}`);
            
            const response = await this.makeRequest(endpoint);
            const endpointAnalysis = {
                accessible: response.success,
                statusCode: response.statusCode,
                responseTime: response.responseTime,
                requiresAuth: false,
                dataStructure: null,
                functionality: 'unknown'
            };
            
            if (response.success) {
                try {
                    // 嘗試解析JSON回應
                    if (response.body) {
                        const data = JSON.parse(response.body);
                        endpointAnalysis.dataStructure = {
                            hasSuccessField: 'success' in data,
                            hasDataField: 'data' in data,
                            hasCountField: 'count' in data,
                            hasMessageField: 'message' in data,
                            responseType: typeof data,
                            keyCount: Object.keys(data).length
                        };
                        
                        // 功能分類
                        if (endpoint.includes('auth')) {
                            endpointAnalysis.functionality = 'authentication';
                        } else if (endpoint.includes('employee')) {
                            endpointAnalysis.functionality = 'employee_management';
                        } else if (endpoint.includes('attendance')) {
                            endpointAnalysis.functionality = 'attendance_tracking';
                        } else if (endpoint.includes('inventory')) {
                            endpointAnalysis.functionality = 'inventory_management';
                        } else if (endpoint.includes('maintenance')) {
                            endpointAnalysis.functionality = 'maintenance_system';
                        } else if (endpoint.includes('system')) {
                            endpointAnalysis.functionality = 'system_monitoring';
                        }
                    }
                    
                    console.log(`     ✅ 端點可用 (${response.responseTime}ms)`);
                    if (endpointAnalysis.dataStructure) {
                        console.log(`     📊 數據結構: ${endpointAnalysis.dataStructure.keyCount}個字段`);
                    }
                } catch (error) {
                    // 可能是HTML回應
                    endpointAnalysis.contentType = 'html';
                    console.log(`     ✅ 端點回應HTML內容`);
                }
            } else if (response.statusCode === 401 || response.statusCode === 403) {
                endpointAnalysis.requiresAuth = true;
                console.log(`     🔐 端點需要身份驗證 (${response.statusCode})`);
            } else {
                console.log(`     ❌ 端點不可用: ${response.statusCode}`);
                apiDiscovery.missingEndpoints.push(endpoint);
            }
            
            apiDiscovery.discoveredEndpoints[endpoint] = endpointAnalysis;
        }
        
        // 統計功能類別
        for (const [endpoint, analysis] of Object.entries(apiDiscovery.discoveredEndpoints)) {
            const func = analysis.functionality;
            if (func !== 'unknown') {
                if (!apiDiscovery.functionalCategories[func]) {
                    apiDiscovery.functionalCategories[func] = [];
                }
                apiDiscovery.functionalCategories[func].push(endpoint);
            }
        }
        
        this.analysisResults.apiDiscovery = apiDiscovery;
        return apiDiscovery;
    }

    async testAuthenticationFlow() {
        console.log('\n🔐 測試身份驗證流程...');
        
        const authAnalysis = {
            loginEndpointExists: false,
            loginFlowWorks: false,
            supportedRoles: [],
            authMechanisms: []
        };
        
        // 測試登入端點
        const loginResponse = await this.makeRequest('/api/auth/login', {
            method: 'POST',
            body: { username: 'test', password: 'test' }
        });
        
        if (loginResponse.success || loginResponse.statusCode === 401 || loginResponse.statusCode === 400) {
            authAnalysis.loginEndpointExists = true;
            console.log('   ✅ 登入端點存在');
            
            try {
                const loginData = JSON.parse(loginResponse.body);
                if (loginData.message) {
                    authAnalysis.authMechanisms.push('json_response');
                    console.log(`   📝 登入回應: ${loginData.message}`);
                }
            } catch (error) {
                console.log('   ⚠️ 登入回應解析失敗');
            }
        } else {
            console.log('   ❌ 登入端點不存在');
        }
        
        // 測試已知測試帳號
        const testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'manager', password: 'manager123', role: 'manager' },
            { username: 'employee', password: 'password123', role: 'employee' }
        ];
        
        for (const account of testAccounts) {
            console.log(`   🧪 測試帳號: ${account.username}`);
            
            const authResponse = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: { username: account.username, password: account.password }
            });
            
            if (authResponse.success) {
                try {
                    const authData = JSON.parse(authResponse.body);
                    if (authData.success && authData.user) {
                        authAnalysis.loginFlowWorks = true;
                        authAnalysis.supportedRoles.push(account.role);
                        console.log(`     ✅ ${account.role}登入成功`);
                    }
                } catch (error) {
                    console.log(`     ⚠️ ${account.role}登入回應解析失敗`);
                }
            } else {
                console.log(`     ❌ ${account.role}登入失敗: ${authResponse.statusCode}`);
            }
        }
        
        this.analysisResults.authenticationAnalysis = authAnalysis;
        return authAnalysis;
    }

    async assessCompleteness() {
        console.log('\n📊 評估系統功能完整性...');
        
        const completenessAssessment = {
            overallCompleteness: 0,
            categoryCompleteness: {},
            missingFeatures: [],
            presentFeatures: [],
            versionConsistency: {
                claimedVersion: null,
                actualVersion: null,
                consistent: false
            }
        };
        
        // 版本一致性檢查
        const systemInfo = this.analysisResults.systemInfo;
        const pageAnalysis = this.analysisResults.pageAnalysis;
        
        if (systemInfo.version) {
            completenessAssessment.versionConsistency.claimedVersion = systemInfo.version;
            
            // 檢查頁面內容是否與聲稱版本一致
            let actualVersionIndicators = [];
            for (const [page, analysis] of Object.entries(pageAnalysis)) {
                if (analysis.hasV3Reference) actualVersionIndicators.push('v3.0.0');
                if (analysis.hasV4Reference) actualVersionIndicators.push('v4.0.0');
            }
            
            const mostCommonVersion = actualVersionIndicators.length > 0 ? 
                actualVersionIndicators[0] : systemInfo.version;
            completenessAssessment.versionConsistency.actualVersion = mostCommonVersion;
            completenessAssessment.versionConsistency.consistent = 
                systemInfo.version === mostCommonVersion;
        }
        
        // 功能完整性評估
        const apiDiscovery = this.analysisResults.apiDiscovery;
        const totalExpectedEndpoints = this.expectedApiEndpoints.length;
        const workingEndpoints = Object.values(apiDiscovery.discoveredEndpoints)
            .filter(ep => ep.accessible || ep.requiresAuth).length;
        
        const endpointCompleteness = (workingEndpoints / totalExpectedEndpoints) * 100;
        
        // 企業功能評估
        for (const [category, features] of Object.entries(this.expectedFeatures)) {
            const categoryEndpoints = this.expectedApiEndpoints.filter(ep => 
                ep.toLowerCase().includes(category.toLowerCase().substring(0, 4))
            );
            
            const workingCategoryEndpoints = categoryEndpoints.filter(ep => {
                const epAnalysis = apiDiscovery.discoveredEndpoints[ep];
                return epAnalysis && (epAnalysis.accessible || epAnalysis.requiresAuth);
            });
            
            const categoryCompleteness = categoryEndpoints.length > 0 ? 
                (workingCategoryEndpoints.length / categoryEndpoints.length) * 100 : 0;
            
            completenessAssessment.categoryCompleteness[category] = {
                completeness: Math.round(categoryCompleteness),
                workingEndpoints: workingCategoryEndpoints.length,
                totalEndpoints: categoryEndpoints.length,
                endpoints: categoryEndpoints
            };
            
            if (categoryCompleteness >= 50) {
                completenessAssessment.presentFeatures.push(category);
            } else {
                completenessAssessment.missingFeatures.push(category);
            }
        }
        
        // 總體完整性計算
        const avgCategoryCompleteness = Object.values(completenessAssessment.categoryCompleteness)
            .reduce((sum, cat) => sum + cat.completeness, 0) / 
            Object.keys(completenessAssessment.categoryCompleteness).length;
        
        completenessAssessment.overallCompleteness = Math.round(
            (endpointCompleteness + avgCategoryCompleteness) / 2
        );
        
        console.log(`   📈 整體完整性: ${completenessAssessment.overallCompleteness}%`);
        console.log(`   ✅ 存在功能: ${completenessAssessment.presentFeatures.join(', ')}`);
        console.log(`   ❌ 缺失功能: ${completenessAssessment.missingFeatures.join(', ')}`);
        console.log(`   🔄 版本一致性: ${completenessAssessment.versionConsistency.consistent ? '一致' : '不一致'}`);
        
        this.analysisResults.completenessAssessment = completenessAssessment;
        return completenessAssessment;
    }

    async performSecurityAnalysis() {
        console.log('\n🛡️ 執行安全性分析...');
        
        const securityAnalysis = {
            httpsEnabled: this.targetUrl.startsWith('https://'),
            authenticationRequired: false,
            errorHandling: 'unknown',
            dataExposure: 'low',
            securityHeaders: {},
            vulnerabilities: []
        };
        
        // 檢查安全標頭
        const response = await this.makeRequest('/');
        if (response.headers) {
            securityAnalysis.securityHeaders = {
                'content-security-policy': response.headers['content-security-policy'] || 'missing',
                'x-frame-options': response.headers['x-frame-options'] || 'missing',
                'x-content-type-options': response.headers['x-content-type-options'] || 'missing',
                'strict-transport-security': response.headers['strict-transport-security'] || 'missing'
            };
        }
        
        // 測試未授權API訪問
        const protectedEndpoints = ['/api/employees', '/api/revenue', '/api/system/status'];
        let protectedCount = 0;
        
        for (const endpoint of protectedEndpoints) {
            const testResponse = await this.makeRequest(endpoint);
            if (testResponse.statusCode === 401 || testResponse.statusCode === 403) {
                protectedCount++;
            }
        }
        
        securityAnalysis.authenticationRequired = protectedCount > 0;
        
        console.log(`   🔒 HTTPS啟用: ${securityAnalysis.httpsEnabled ? '是' : '否'}`);
        console.log(`   🔐 需要身份驗證: ${securityAnalysis.authenticationRequired ? '是' : '否'}`);
        console.log(`   🛡️ 受保護端點: ${protectedCount}/${protectedEndpoints.length}`);
        
        this.analysisResults.securityAnalysis = securityAnalysis;
        return securityAnalysis;
    }

    generateComprehensiveReport() {
        console.log('\n📋 生成深度分析綜合報告...');
        
        const report = {
            metadata: {
                analysisTime: new Date().toISOString(),
                targetUrl: this.targetUrl,
                analysisScope: '深度功能完整性分析',
                reportVersion: '1.0.0'
            },
            
            executiveSummary: {
                systemAccessible: this.analysisResults.systemInfo.accessible,
                detectedVersion: this.analysisResults.systemInfo.version,
                overallCompleteness: this.analysisResults.completenessAssessment?.overallCompleteness || 0,
                versionConsistent: this.analysisResults.completenessAssessment?.versionConsistency?.consistent || false,
                securityLevel: this.analysisResults.securityAnalysis?.httpsEnabled ? 'good' : 'poor',
                recommendation: '需要詳細檢查和改進'
            },
            
            detailedAnalysis: this.analysisResults,
            
            conclusions: this.generateConclusions(),
            
            recommendations: this.generateRecommendations()
        };
        
        // 更新執行摘要的建議
        const completeness = report.executiveSummary.overallCompleteness;
        if (completeness >= 90) {
            report.executiveSummary.recommendation = '系統功能完整，建議投入生產使用';
        } else if (completeness >= 70) {
            report.executiveSummary.recommendation = '系統基本完整，需要少量改進';
        } else if (completeness >= 50) {
            report.executiveSummary.recommendation = '系統功能不完整，需要重要改進';
        } else {
            report.executiveSummary.recommendation = '系統功能嚴重不完整，需要重大修復';
        }
        
        return report;
    }

    generateConclusions() {
        const conclusions = [];
        
        // 系統可訪問性結論
        if (this.analysisResults.systemInfo.accessible) {
            conclusions.push('✅ 系統成功部署且可正常訪問');
        } else {
            conclusions.push('❌ 系統無法訪問，存在部署問題');
        }
        
        // 版本一致性結論
        const versionConsistency = this.analysisResults.completenessAssessment?.versionConsistency;
        if (versionConsistency) {
            if (versionConsistency.consistent) {
                conclusions.push(`✅ 系統版本一致：${versionConsistency.claimedVersion}`);
            } else {
                conclusions.push(`⚠️ 版本不一致：聲稱${versionConsistency.claimedVersion}，實際${versionConsistency.actualVersion}`);
            }
        }
        
        // API完整性結論
        const apiDiscovery = this.analysisResults.apiDiscovery;
        if (apiDiscovery) {
            const workingEndpoints = Object.values(apiDiscovery.discoveredEndpoints)
                .filter(ep => ep.accessible || ep.requiresAuth).length;
            const totalEndpoints = this.expectedApiEndpoints.length;
            
            if (workingEndpoints >= totalEndpoints * 0.9) {
                conclusions.push('✅ API端點完整性良好');
            } else if (workingEndpoints >= totalEndpoints * 0.5) {
                conclusions.push('⚠️ API端點部分缺失');
            } else {
                conclusions.push('❌ API端點嚴重缺失');
            }
        }
        
        // 功能完整性結論
        const completeness = this.analysisResults.completenessAssessment?.overallCompleteness;
        if (completeness !== undefined) {
            if (completeness >= 80) {
                conclusions.push('✅ 企業功能完整性優秀');
            } else if (completeness >= 60) {
                conclusions.push('⚠️ 企業功能完整性中等');
            } else {
                conclusions.push('❌ 企業功能完整性不足');
            }
        }
        
        return conclusions;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // 基於分析結果生成建議
        const completeness = this.analysisResults.completenessAssessment?.overallCompleteness || 0;
        const versionConsistent = this.analysisResults.completenessAssessment?.versionConsistency?.consistent;
        const missingEndpoints = this.analysisResults.apiDiscovery?.missingEndpoints || [];
        
        if (!versionConsistent) {
            recommendations.push({
                priority: 'high',
                category: 'version_consistency',
                action: '修復版本不一致問題',
                details: '確保所有頁面和API端點都反映正確的系統版本'
            });
        }
        
        if (missingEndpoints.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'api_completeness',
                action: '實現缺失的API端點',
                details: `需要實現: ${missingEndpoints.join(', ')}`
            });
        }
        
        if (completeness < 70) {
            recommendations.push({
                priority: 'medium',
                category: 'functionality',
                action: '完善企業功能模組',
                details: '補充缺失的企業管理功能，提高系統完整性'
            });
        }
        
        const securityAnalysis = this.analysisResults.securityAnalysis;
        if (securityAnalysis && !securityAnalysis.authenticationRequired) {
            recommendations.push({
                priority: 'high',
                category: 'security',
                action: '加強身份驗證',
                details: '確保敏感API端點需要適當的身份驗證'
            });
        }
        
        return recommendations;
    }

    async saveAnalysisReport(report) {
        const filename = `deep-url-analysis-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        try {
            await fs.writeFile(filename, JSON.stringify(report, null, 2));
            console.log(`\n📄 深度分析報告已保存: ${filename}`);
            return filename;
        } catch (error) {
            console.log(`❌ 保存報告失敗: ${error.message}`);
            return null;
        }
    }

    async executeDeepAnalysis() {
        console.log('🌐 深度網址分析引擎啟動');
        console.log('=' * 70);
        console.log(`🎯 分析目標: ${this.targetUrl}`);
        
        try {
            // 執行所有分析步驟
            await this.analyzeSystemInfo();
            await this.analyzePageStructure();
            await this.discoverApiEndpoints();
            await this.testAuthenticationFlow();
            await this.assessCompleteness();
            await this.performSecurityAnalysis();
            
            // 生成綜合報告
            const comprehensiveReport = this.generateComprehensiveReport();
            
            // 保存報告
            const filename = await this.saveAnalysisReport(comprehensiveReport);
            
            console.log('\n🎊 深度網址分析完成！');
            console.log(`📊 整體完整性: ${comprehensiveReport.executiveSummary.overallCompleteness}%`);
            console.log(`📋 建議: ${comprehensiveReport.executiveSummary.recommendation}`);
            
            return {
                success: true,
                report: comprehensiveReport,
                filename: filename
            };
            
        } catch (error) {
            console.error('❌ 深度分析執行錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 執行深度網址分析
async function main() {
    const analyzer = new DeepUrlAnalysisEngine();
    
    try {
        const result = await analyzer.executeDeepAnalysis();
        
        if (result.success && result.report.executiveSummary.overallCompleteness >= 70) {
            console.log('🎉 深度分析: 系統功能完整性良好！');
            process.exit(0);
        } else if (result.success && result.report.executiveSummary.overallCompleteness >= 40) {
            console.log('⚠️ 深度分析: 系統需要改進');
            process.exit(1);
        } else {
            console.log('❌ 深度分析: 系統存在重大問題');
            process.exit(2);
        }
        
    } catch (error) {
        console.error('❌ 深度分析引擎執行錯誤:', error);
        process.exit(3);
    }
}

if (require.main === module) {
    main();
}

module.exports = DeepUrlAnalysisEngine;
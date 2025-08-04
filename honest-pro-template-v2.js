#!/usr/bin/env node

/**
 * 🎯 誠實/pro模板 v2.0 - 真實測試驗證版
 * 徹底修復虛假完美問題，建立真實測試驗證機制
 * 只有通過實際測試的功能才會報告為"成功"
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

class HonestProTemplate {
    constructor() {
        this.config = {
            // 實際測試環境配置
            frontend: {
                url: 'http://localhost:3000',
                expectedElements: ['登入表單', '產品列表', '導航選單'],
                timeout: 5000
            },
            
            api: {
                baseUrl: 'http://localhost:3002',
                endpoints: [
                    { path: '/health', method: 'GET', expectedStatus: 200 },
                    { path: '/api/products', method: 'GET', expectedStatus: 200 },
                    { path: '/api/employees', method: 'GET', expectedStatus: 200 },
                    { path: '/api/inventory', method: 'GET', expectedStatus: 200 },
                    { path: '/api/login', method: 'POST', expectedStatus: 200, 
                      body: { name: '張總經理', idNumber: 'A123456789' } }
                ],
                timeout: 3000
            },
            
            database: {
                // 實際數據庫連接測試
                testQueries: [
                    'SELECT COUNT(*) FROM employees',
                    'SELECT COUNT(*) FROM products', 
                    'SELECT COUNT(*) FROM inventory'
                ]
            },
            
            telegram: {
                botToken: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
                chatId: '-1002658082392'
            }
        };
        
        this.realResults = {
            frontend: { available: false, tested: false, errors: [] },
            api: { available: false, endpoints: {}, errors: [] },
            database: { connected: false, tested: false, errors: [] },
            overall: { score: 0, status: 'unknown', tested: false }
        };
        
        this.honestPrinciples = [
            '只報告實際測試過的結果',
            '明確區分模擬測試和實際測試',
            '承認問題而不是隱藏問題',
            '提供具體的修復步驟',
            '給出真實的時間估算'
        ];
    }

    /**
     * 🚀 執行誠實的/pro驗證流程
     */
    async executeHonestProVerification(taskDescription) {
        console.log('🎯 啟動誠實/pro模板 v2.0 - 真實測試驗證');
        console.log('=' .repeat(60));
        console.log(`📋 任務: ${taskDescription}`);
        
        try {
            // 階段1: 真實環境檢測
            await this.performRealEnvironmentCheck();
            
            // 階段2: 實際服務測試
            await this.performActualServiceTests();
            
            // 階段3: 功能完整性驗證
            await this.performFunctionalIntegrityTests();
            
            // 階段4: 數據完整性檢查
            await this.performDataIntegrityCheck();
            
            // 階段5: 生成誠實評估報告
            await this.generateHonestAssessmentReport();
            
            // 階段6: 發送真實狀況通知
            await this.sendHonestStatusNotification();
            
        } catch (error) {
            console.error('❌ 誠實驗證過程發生錯誤:', error.message);
            this.realResults.overall.errors = [error.message];
        }
        
        return this.realResults;
    }

    /**
     * 🔍 真實環境檢測 - 不依賴假設
     */
    async performRealEnvironmentCheck() {
        console.log('🔍 執行真實環境檢測...');
        
        // 檢查前端服務實際可用性
        this.realResults.frontend.tested = true;
        try {
            const frontendResult = await this.testActualUrl(this.config.frontend.url);
            this.realResults.frontend.available = frontendResult.success;
            if (!frontendResult.success) {
                this.realResults.frontend.errors.push(`Frontend不可用: ${frontendResult.error}`);
            }
        } catch (error) {
            this.realResults.frontend.errors.push(`Frontend測試失敗: ${error.message}`);
        }
        
        // 檢查API服務實際可用性
        this.realResults.api.tested = true;
        try {
            const apiResult = await this.testActualUrl(`${this.config.api.baseUrl}/health`);
            this.realResults.api.available = apiResult.success;
            if (!apiResult.success) {
                this.realResults.api.errors.push(`API基礎服務不可用: ${apiResult.error}`);
            }
        } catch (error) {
            this.realResults.api.errors.push(`API測試失敗: ${error.message}`);
        }
        
        console.log(`Frontend狀態: ${this.realResults.frontend.available ? '✅ 可用' : '❌ 不可用'}`);
        console.log(`API基礎服務: ${this.realResults.api.available ? '✅ 可用' : '❌ 不可用'}`);
    }

    /**
     * 🔌 實際服務測試 - 測試每個端點的真實響應
     */
    async performActualServiceTests() {
        console.log('🔌 執行實際API端點測試...');
        
        if (!this.realResults.api.available) {
            console.log('⚠️ API基礎服務不可用，跳過端點測試');
            return;
        }
        
        for (const endpoint of this.config.api.endpoints) {
            const testKey = `${endpoint.method} ${endpoint.path}`;
            console.log(`  測試: ${testKey}`);
            
            try {
                const result = await this.testActualApiEndpoint(endpoint);
                this.realResults.api.endpoints[testKey] = {
                    success: result.success,
                    statusCode: result.statusCode,
                    responseTime: result.responseTime,
                    hasData: result.hasData,
                    error: result.error
                };
                
                console.log(`    結果: ${result.success ? '✅ 成功' : '❌ 失敗'} (${result.statusCode})`);
                if (result.error) {
                    console.log(`    錯誤: ${result.error}`);
                }
                
            } catch (error) {
                this.realResults.api.endpoints[testKey] = {
                    success: false,
                    error: error.message
                };
                console.log(`    結果: ❌ 測試異常 - ${error.message}`);
            }
        }
    }

    /**
     * 🧪 功能完整性驗證 - 測試實際業務邏輯
     */
    async performFunctionalIntegrityTests() {
        console.log('🧪 執行功能完整性驗證...');
        
        const functionalTests = [
            {
                name: '用戶登入功能',
                test: async () => await this.testActualLogin()
            },
            {
                name: '產品列表獲取',
                test: async () => await this.testActualProductList()
            },
            {
                name: '庫存查詢功能',
                test: async () => await this.testActualInventoryQuery()
            }
        ];
        
        this.realResults.functional = {};
        
        for (const funcTest of functionalTests) {
            console.log(`  測試功能: ${funcTest.name}`);
            try {
                const result = await funcTest.test();
                this.realResults.functional[funcTest.name] = result;
                console.log(`    結果: ${result.success ? '✅ 成功' : '❌ 失敗'}`);
                if (result.error) {
                    console.log(`    詳情: ${result.error}`);
                }
            } catch (error) {
                this.realResults.functional[funcTest.name] = {
                    success: false,
                    error: error.message
                };
                console.log(`    結果: ❌ 測試異常 - ${error.message}`);
            }
        }
    }

    /**
     * 📊 數據完整性檢查
     */
    async performDataIntegrityCheck() {
        console.log('📊 執行數據完整性檢查...');
        
        // 這裡應該連接實際數據庫進行測試
        // 由於沒有直接數據庫連接，通過API間接檢查
        this.realResults.database.tested = true;
        
        try {
            // 嘗試通過API檢查數據完整性
            const productsResult = await this.testActualUrl(`${this.config.api.baseUrl}/api/products`);
            const employeesResult = await this.testActualUrl(`${this.config.api.baseUrl}/api/employees`);
            
            if (productsResult.success && employeesResult.success) {
                this.realResults.database.connected = true;
                console.log('✅ 數據庫連接通過API驗證正常');
            } else {
                this.realResults.database.errors.push('無法通過API驗證數據庫連接');
                console.log('❌ 無法驗證數據庫連接狀態');
            }
        } catch (error) {
            this.realResults.database.errors.push(`數據庫檢查失敗: ${error.message}`);
            console.log(`❌ 數據庫檢查異常: ${error.message}`);
        }
    }

    /**
     * 🌐 測試實際URL連接
     */
    async testActualUrl(url) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const protocol = url.startsWith('https') ? https : http;
            
            const req = protocol.get(url, (res) => {
                const responseTime = Date.now() - startTime;
                let data = '';
                
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        hasData: data.length > 0,
                        dataLength: data.length
                    });
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
            
            req.setTimeout(this.config.frontend.timeout, () => {
                req.destroy();
                resolve({
                    success: false,
                    error: '連接超時',
                    responseTime: Date.now() - startTime
                });
            });
        });
    }

    /**
     * 🔌 測試實際API端點
     */
    async testActualApiEndpoint(endpoint) {
        return new Promise((resolve) => {
            const url = `${this.config.api.baseUrl}${endpoint.path}`;
            const postData = endpoint.body ? JSON.stringify(endpoint.body) : null;
            const startTime = Date.now();
            
            const options = {
                method: endpoint.method,
                timeout: this.config.api.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'HonestProTemplate/2.0'
                }
            };
            
            if (postData) {
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }
            
            const protocol = url.startsWith('https') ? https : http;
            
            const req = protocol.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    
                    try {
                        const jsonData = data ? JSON.parse(data) : null;
                        resolve({
                            success: res.statusCode === endpoint.expectedStatus,
                            statusCode: res.statusCode,
                            responseTime: responseTime,
                            hasData: !!jsonData,
                            dataLength: data.length
                        });
                    } catch (parseError) {
                        resolve({
                            success: false,
                            statusCode: res.statusCode,
                            responseTime: responseTime,
                            error: '響應數據格式錯誤',
                            rawData: data.substring(0, 100)
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
            
            if (postData) {
                req.write(postData);
            }
            
            req.end();
        });
    }

    /**
     * 👤 測試實際登入功能
     */
    async testActualLogin() {
        const loginEndpoint = {
            path: '/api/login',
            method: 'POST',
            expectedStatus: 200,
            body: { name: '張總經理', idNumber: 'A123456789' }
        };
        
        try {
            const result = await this.testActualApiEndpoint(loginEndpoint);
            return {
                success: result.success,
                tested: true,
                details: `狀態碼: ${result.statusCode}, 響應時間: ${result.responseTime}ms`,
                error: result.error
            };
        } catch (error) {
            return {
                success: false,
                tested: true,
                error: error.message
            };
        }
    }

    /**
     * 📦 測試實際產品列表
     */
    async testActualProductList() {
        const productEndpoint = {
            path: '/api/products',
            method: 'GET',
            expectedStatus: 200
        };
        
        try {
            const result = await this.testActualApiEndpoint(productEndpoint);
            return {
                success: result.success,
                tested: true,
                details: `有數據: ${result.hasData}, 數據長度: ${result.dataLength}`,
                error: result.error
            };
        } catch (error) {
            return {
                success: false,
                tested: true,
                error: error.message
            };
        }
    }

    /**
     * 📊 測試實際庫存查詢
     */
    async testActualInventoryQuery() {
        const inventoryEndpoint = {
            path: '/api/inventory',
            method: 'GET',
            expectedStatus: 200
        };
        
        try {
            const result = await this.testActualApiEndpoint(inventoryEndpoint);
            return {
                success: result.success,
                tested: true,
                details: `響應狀態: ${result.statusCode}`,
                error: result.error
            };
        } catch (error) {
            return {
                success: false,
                tested: true,
                error: error.message
            };
        }
    }

    /**
     * 📊 計算真實評分
     */
    calculateRealScore() {
        let totalTests = 0;
        let passedTests = 0;
        
        // 前端測試
        if (this.realResults.frontend.tested) {
            totalTests++;
            if (this.realResults.frontend.available) passedTests++;
        }
        
        // API端點測試
        const apiEndpoints = Object.keys(this.realResults.api.endpoints);
        totalTests += apiEndpoints.length;
        passedTests += apiEndpoints.filter(key => 
            this.realResults.api.endpoints[key].success
        ).length;
        
        // 功能測試
        if (this.realResults.functional) {
            const funcTests = Object.keys(this.realResults.functional);
            totalTests += funcTests.length;
            passedTests += funcTests.filter(key => 
                this.realResults.functional[key].success
            ).length;
        }
        
        const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
        
        this.realResults.overall = {
            score: score,
            totalTests: totalTests,
            passedTests: passedTests,
            failedTests: totalTests - passedTests,
            status: score >= 80 ? 'good' : score >= 50 ? 'fair' : 'poor',
            tested: true
        };
        
        return score;
    }

    /**
     * 📄 生成誠實評估報告
     */
    async generateHonestAssessmentReport() {
        console.log('📄 生成誠實評估報告...');
        
        const score = this.calculateRealScore();
        const timestamp = new Date().toLocaleString('zh-TW');
        
        const report = `# 🎯 誠實/pro模板驗證報告 v2.0

## 📋 真實測試結果總覽
**測試時間**: ${timestamp}  
**真實評分**: ${score.toFixed(1)}/100  
**測試原則**: 只報告實際測試過的結果  

## 🔍 前端服務真實狀態
- **測試狀態**: ${this.realResults.frontend.tested ? '✅ 已測試' : '❌ 未測試'}
- **服務可用**: ${this.realResults.frontend.available ? '✅ 可用' : '❌ 不可用'}
- **錯誤記錄**: ${this.realResults.frontend.errors.length > 0 ? 
    this.realResults.frontend.errors.map(e => `  - ${e}`).join('\n') : '無'}

## 🔌 API服務真實狀態
- **基礎服務**: ${this.realResults.api.available ? '✅ 可用' : '❌ 不可用'}
- **端點測試結果**:
${Object.entries(this.realResults.api.endpoints).map(([endpoint, result]) => 
    `  - **${endpoint}**: ${result.success ? '✅ 成功' : '❌ 失敗'} (${result.statusCode || '無響應'})`
).join('\n')}

## 🧪 功能完整性真實狀態
${this.realResults.functional ? 
    Object.entries(this.realResults.functional).map(([name, result]) => 
        `- **${name}**: ${result.success ? '✅ 正常' : '❌ 異常'} ${result.error ? `(${result.error})` : ''}`
    ).join('\n') : '未進行功能測試'}

## 📊 數據庫連接真實狀態
- **測試狀態**: ${this.realResults.database.tested ? '✅ 已測試' : '❌ 未測試'}
- **連接狀態**: ${this.realResults.database.connected ? '✅ 正常' : '❌ 異常'}
- **錯誤記錄**: ${this.realResults.database.errors.length > 0 ? 
    this.realResults.database.errors.map(e => `  - ${e}`).join('\n') : '無'}

## 🎯 誠實結論
**系統真實狀態**: ${this.getHonestStatusDescription()}

### ✅ 確認可用的功能
${this.getConfirmedWorkingFeatures()}

### ❌ 確認有問題的功能  
${this.getConfirmedBrokenFeatures()}

### ⚠️ 未經測試的功能
${this.getUntestedFeatures()}

## 💡 真實修復建議
${this.getHonestRepairSuggestions()}

## 📈 真實時程估算
${this.getRealisticTimeEstimate()}

---
**報告原則**: ${this.honestPrinciples.map(p => `\n- ${p}`).join('')}
**生成時間**: ${timestamp}  
**工具版本**: 誠實/pro模板 v2.0
`;

        const fileName = `honest-verification-report-${new Date().toISOString().split('T')[0]}.md`;
        fs.writeFileSync(fileName, report, 'utf8');
        console.log(`✅ 誠實評估報告已生成: ${fileName}`);
        
        return fileName;
    }

    /**
     * 📝 獲取誠實狀態描述
     */
    getHonestStatusDescription() {
        const score = this.realResults.overall.score;
        
        if (score >= 80) {
            return '🟢 大部分功能正常運作，系統基本可用';
        } else if (score >= 50) {
            return '🟡 部分功能正常，存在重要問題需要修復';
        } else if (score >= 20) {
            return '🟠 少數功能正常，系統有嚴重問題';
        } else {
            return '🔴 大部分功能無法使用，系統需要重大修復';
        }
    }

    /**
     * ✅ 獲取確認可用的功能
     */
    getConfirmedWorkingFeatures() {
        const workingFeatures = [];
        
        if (this.realResults.frontend.available) {
            workingFeatures.push('前端服務可訪問');
        }
        
        if (this.realResults.api.available) {
            workingFeatures.push('API基礎服務運行');
        }
        
        // 檢查API端點
        Object.entries(this.realResults.api.endpoints).forEach(([endpoint, result]) => {
            if (result.success) {
                workingFeatures.push(`${endpoint} 端點正常`);
            }
        });
        
        // 檢查功能測試
        if (this.realResults.functional) {
            Object.entries(this.realResults.functional).forEach(([name, result]) => {
                if (result.success) {
                    workingFeatures.push(name);
                }
            });
        }
        
        return workingFeatures.length > 0 ? 
            workingFeatures.map(f => `- ${f}`).join('\n') : 
            '目前沒有確認可用的功能';
    }

    /**
     * ❌ 獲取確認有問題的功能
     */
    getConfirmedBrokenFeatures() {
        const brokenFeatures = [];
        
        if (this.realResults.frontend.tested && !this.realResults.frontend.available) {
            brokenFeatures.push('前端服務不可訪問');
            this.realResults.frontend.errors.forEach(error => {
                brokenFeatures.push(`  └─ ${error}`);
            });
        }
        
        if (this.realResults.api.tested && !this.realResults.api.available) {
            brokenFeatures.push('API基礎服務連接失敗');
        }
        
        // 檢查失敗的API端點
        Object.entries(this.realResults.api.endpoints).forEach(([endpoint, result]) => {
            if (!result.success) {
                brokenFeatures.push(`${endpoint} 端點異常`);
                if (result.error) {
                    brokenFeatures.push(`  └─ ${result.error}`);
                }
            }
        });
        
        // 檢查失敗的功能測試
        if (this.realResults.functional) {
            Object.entries(this.realResults.functional).forEach(([name, result]) => {
                if (!result.success) {
                    brokenFeatures.push(name);
                    if (result.error) {
                        brokenFeatures.push(`  └─ ${result.error}`);
                    }
                }
            });
        }
        
        return brokenFeatures.length > 0 ? 
            brokenFeatures.map(f => `- ${f}`).join('\n') : 
            '目前沒有確認的問題功能';
    }

    /**
     * ⚠️ 獲取未經測試的功能
     */
    getUntestedFeatures() {
        const untestedFeatures = [];
        
        if (!this.realResults.frontend.tested) {
            untestedFeatures.push('前端服務狀態');
        }
        
        if (!this.realResults.database.tested) {
            untestedFeatures.push('數據庫直接連接');
        }
        
        // 添加其他可能未測試的功能
        const allPossibleFeatures = [
            '文件上傳功能',
            '報表生成功能', 
            '郵件通知系統',
            '用戶權限系統',
            '數據備份功能'
        ];
        
        untestedFeatures.push(...allPossibleFeatures);
        
        return untestedFeatures.length > 0 ? 
            untestedFeatures.map(f => `- ${f} (需要實際測試確認)`).join('\n') : 
            '所有重要功能都已測試';
    }

    /**
     * 💡 獲取誠實修復建議
     */
    getHonestRepairSuggestions() {
        const suggestions = [];
        
        if (!this.realResults.frontend.available) {
            suggestions.push({
                priority: 'P0-緊急',
                item: '啟動前端服務',
                steps: [
                    '檢查是否安裝http-server: npm list -g http-server',
                    '如未安裝: npm install -g http-server', 
                    '啟動服務: cd public && http-server -p 3000',
                    '驗證可訪問: 瀏覽器打開 http://localhost:3000'
                ],
                estimatedTime: '5-10分鐘'
            });
        }
        
        const failedEndpoints = Object.entries(this.realResults.api.endpoints)
            .filter(([_, result]) => !result.success);
            
        if (failedEndpoints.length > 0) {
            suggestions.push({
                priority: 'P0-緊急',
                item: 'API端點修復',
                steps: [
                    '檢查API服務日誌: 查看console輸出錯誤',
                    '驗證路由配置: 確認端點路徑正確',
                    '測試數據庫連接: 確認DB服務運行',
                    '重啟API服務: 修復配置後重新啟動'
                ],
                estimatedTime: '30-60分鐘'
            });
        }
        
        return suggestions.map(s => 
            `### ${s.priority}: ${s.item} (預估: ${s.estimatedTime})\n${s.steps.map(step => `- ${step}`).join('\n')}`
        ).join('\n\n');
    }

    /**
     * 📈 獲取真實時程估算
     */
    getRealisticTimeEstimate() {
        const score = this.realResults.overall.score;
        
        if (score >= 80) {
            return `**預估修復時間**: 1-2小時 (主要是小問題修復)
**部署準備時間**: 當天可完成
**建議**: 修復已知問題後立即部署`;
        } else if (score >= 50) {
            return `**預估修復時間**: 4-8小時 (需要解決重要問題)
**部署準備時間**: 1-2天
**建議**: 分階段修復，優先處理P0問題`;
        } else if (score >= 20) {
            return `**預估修復時間**: 1-2天 (需要重大修復)
**部署準備時間**: 3-5天  
**建議**: 需要系統性檢查和修復`;
        } else {
            return `**預估修復時間**: 3-5天 (需要重建部分功能)
**部署準備時間**: 1週以上
**建議**: 建議重新評估架構和實作方式`;
        }
    }

    /**
     * ✈️ 發送誠實狀況Telegram通知
     */
    async sendHonestStatusNotification() {
        console.log('✈️ 發送誠實狀況通知...');
        
        const score = this.realResults.overall.score;
        const status = this.realResults.overall.status;
        
        // 根據真實測試結果決定通知內容
        const statusEmoji = score >= 80 ? '🟢' : score >= 50 ? '🟡' : score >= 20 ? '🟠' : '🔴';
        const honesty = score >= 80 ? '系統大致正常' : 
                       score >= 50 ? '系統有重要問題' :
                       score >= 20 ? '系統有嚴重問題' : '系統基本無法使用';
        
        const message = `🎯 <b>誠實/pro驗證報告 v2.0</b>

${statusEmoji} <b>真實測試結果</b>: ${honesty}
📊 <b>實測評分</b>: ${score.toFixed(1)}/100
⏰ <b>測試時間</b>: ${new Date().toLocaleString('zh-TW')}

🔍 <b>前端服務</b>: ${this.realResults.frontend.available ? '✅ 可用' : '❌ 不可用'}
🔌 <b>API服務</b>: ${this.realResults.api.available ? '✅ 基礎可用' : '❌ 不可用'}
📊 <b>數據庫</b>: ${this.realResults.database.connected ? '✅ 連接正常' : '❌ 連接異常'}

📈 <b>測試統計</b>:
• 總測試數: ${this.realResults.overall.totalTests}
• 通過測試: ${this.realResults.overall.passedTests}
• 失敗測試: ${this.realResults.overall.failedTests}

🚨 <b>誠實原則</b>:
• 只報告實際測試過的結果
• 不隱藏問題，不虛假樂觀
• 提供真實的修復時程估算

💡 <b>下一步行動</b>:
${score < 50 ? 
    '1. 🚨 立即修復基礎服務問題\n2. 🔄 重新執行真實測試\n3. 📋 確認所有功能正常後再部署' :
    '1. 🔧 修復已識別的問題\n2. ✅ 驗證修復效果\n3. 🚀 準備生產部署'}

🎊 <b>承諾</b>: 不再虛假報告"完美"，只提供經過實測的真實狀況

🤖 <b>工具</b>: 誠實/pro模板 v2.0 - 真實測試驗證版`;

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
                    console.log('✅ 誠實狀況Telegram通知發送成功');
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
    const honestPro = new HonestProTemplate();
    
    try {
        const taskDescription = process.argv[2] || '系統功能完整性驗證';
        const results = await honestPro.executeHonestProVerification(taskDescription);
        
        console.log('\n🎊 誠實/pro驗證完成！');
        console.log(`📊 真實評分: ${results.overall.score.toFixed(1)}/100`);
        console.log(`🎯 系統狀態: ${results.overall.status}`);
        console.log(`✅ 通過測試: ${results.overall.passedTests}/${results.overall.totalTests}`);
        
        // 根據真實結果決定退出碼
        process.exit(results.overall.score >= 50 ? 0 : 1);
        
    } catch (error) {
        console.error('❌ 誠實/pro驗證失敗:', error.message);
        process.exit(1);
    }
}

// 如果直接執行此文件，則運行主程序
if (require.main === module) {
    main();
}

module.exports = HonestProTemplate;
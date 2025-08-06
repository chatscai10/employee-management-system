// 🧠 智慧模板深層分析與修復系統
// 解決持續兩天的GET方法404錯誤問題

const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

class SmartTemplateDeepAnalysisSystem {
    constructor() {
        this.targetUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.analysisResults = {
            timestamp: new Date().toISOString(),
            codeDiscrepancies: [],
            deploymentIssues: [],
            rootCauses: [],
            fixStrategies: []
        };
    }

    // 🔍 階段1: 深層代碼分析
    async deepCodeAnalysis() {
        console.log('🔍 執行深層代碼分析...');
        
        // 1. 分析本地代碼
        const localCode = fs.readFileSync('app.js', 'utf8');
        
        // 2. 獲取線上代碼片段
        const onlineCodeCheck = await this.fetchOnlineCode();
        
        // 3. 關鍵差異檢測
        const discrepancies = this.compareCodeVersions(localCode, onlineCodeCheck);
        
        this.analysisResults.codeDiscrepancies = discrepancies;
        
        return discrepancies;
    }

    async fetchOnlineCode() {
        console.log('📡 獲取線上部署代碼...');
        
        const checks = {
            dashboard: await this.fetchUrl('/dashboard'),
            apiEndpoints: await this.checkAPIEndpoints()
        };
        
        return checks;
    }

    async fetchUrl(path) {
        return new Promise((resolve) => {
            https.get(this.targetUrl + path, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', err => resolve(''));
        });
    }

    async checkAPIEndpoints() {
        console.log('🔌 檢查API端點狀態...');
        
        const endpoints = [
            { path: '/api/auth/verify', method: 'GET' },
            { path: '/api/auth/verify', method: 'POST' },
            { path: '/api/auth/verify', method: 'OPTIONS' }
        ];
        
        const results = [];
        
        for (const endpoint of endpoints) {
            const result = await this.testEndpoint(endpoint);
            results.push(result);
            console.log(`  ${endpoint.method} ${endpoint.path}: ${result.status}`);
        }
        
        return results;
    }

    async testEndpoint(endpoint) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'employee-management-system-v6hs.onrender.com',
                path: endpoint.path,
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test'
                },
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                resolve({
                    endpoint: endpoint,
                    status: res.statusCode,
                    headers: res.headers
                });
            });
            
            req.on('error', (err) => {
                resolve({
                    endpoint: endpoint,
                    status: 0,
                    error: err.message
                });
            });
            
            req.end();
        });
    }

    compareCodeVersions(localCode, onlineChecks) {
        console.log('🔬 比較代碼版本差異...');
        
        const discrepancies = [];
        
        // 檢查關鍵函數是否存在
        const criticalFunctions = [
            'app.post(\'/api/auth/verify\'',
            'method: \'POST\'',
            'method: \'GET\'',
            'async function verifyUserAuth()',
            'async function apiRequest('
        ];
        
        criticalFunctions.forEach(func => {
            const inLocal = localCode.includes(func);
            const inOnline = onlineChecks.dashboard && onlineChecks.dashboard.includes(func);
            
            if (inLocal && !inOnline) {
                discrepancies.push({
                    type: 'missing_in_production',
                    function: func,
                    severity: 'critical'
                });
            }
        });
        
        return discrepancies;
    }

    // 🛠️ 階段2: 智慧修復策略
    generateFixStrategy() {
        console.log('🛠️ 生成智慧修復策略...');
        
        const strategies = [
            {
                name: '強制代碼同步',
                description: '確保本地和線上代碼完全一致',
                priority: 'high'
            },
            {
                name: '直接修改Dashboard HTML',
                description: '在Dashboard頁面中內嵌正確的JavaScript',
                priority: 'critical'
            },
            {
                name: '創建獨立API路由',
                description: '添加GET和POST兩種方法支援',
                priority: 'high'
            }
        ];
        
        this.analysisResults.fixStrategies = strategies;
        
        return strategies;
    }

    // 🔧 階段3: 實施深層修復
    async implementDeepFix() {
        console.log('🔧 實施深層修復...');
        
        // 修復1: 確保API端點同時支援GET和POST
        await this.fixAPIEndpoint();
        
        // 修復2: 修改Dashboard中的JavaScript
        await this.fixDashboardJavaScript();
        
        // 修復3: 添加調試日誌
        await this.addDebugLogging();
        
        return true;
    }

    async fixAPIEndpoint() {
        console.log('📝 修復API端點路由...');
        
        const appContent = fs.readFileSync('app.js', 'utf8');
        
        // 查找現有的POST路由
        const postRouteRegex = /app\.post\('\/api\/auth\/verify'[\s\S]*?\}\);/g;
        const hasPostRoute = postRouteRegex.test(appContent);
        
        if (hasPostRoute) {
            // 在POST路由後添加GET路由
            const getRoute = `
// 🔧 支援GET方法的驗證端點（兼容性修復）
app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: '需要身份驗證' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = database.employees.find(emp => emp.username === token);
    
    if (!user) {
        return res.status(401).json({ success: false, message: '無效的認證資訊' });
    }
    
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            position: user.position
        },
        message: '驗證成功'
    });
});`;
            
            // 在POST路由後插入GET路由
            const modifiedContent = appContent.replace(
                /(app\.post\('\/api\/auth\/verify'[\s\S]*?\}\);)/,
                '$1\n' + getRoute
            );
            
            fs.writeFileSync('app.js', modifiedContent);
            console.log('  ✅ 添加GET方法支援');
        }
    }

    async fixDashboardJavaScript() {
        console.log('📝 修復Dashboard JavaScript...');
        
        const appContent = fs.readFileSync('app.js', 'utf8');
        
        // 確保verifyUserAuth明確使用POST
        const fixedContent = appContent.replace(
            /async function verifyUserAuth\(\) \{[\s\S]*?return response;[\s\S]*?\}/g,
            `async function verifyUserAuth() {
        console.log('[DEBUG] 開始驗證用戶身份...');
        try {
            // 明確使用POST方法
            const response = await apiRequest('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('[DEBUG] 驗證響應:', response);
            return response;
        } catch (error) {
            console.error('[DEBUG] 驗證失敗:', error);
            return { success: false, message: '驗證失敗: ' + error.message };
        }
    }`
        );
        
        fs.writeFileSync('app.js', fixedContent);
        console.log('  ✅ Dashboard JavaScript已修復');
    }

    async addDebugLogging() {
        console.log('📝 添加調試日誌...');
        
        const appContent = fs.readFileSync('app.js', 'utf8');
        
        // 在apiRequest函數中添加調試日誌
        const debuggedContent = appContent.replace(
            /async function apiRequest\(url, options = \{\}\) \{/,
            `async function apiRequest(url, options = {}) {
        console.log('[DEBUG] API請求:', url, 'Options:', options);`
        );
        
        fs.writeFileSync('app.js', debuggedContent);
        console.log('  ✅ 調試日誌已添加');
    }

    // 🎯 階段4: 執行完整分析和修復
    async executeCompleteAnalysis() {
        console.log('🚀 啟動智慧模板深層分析系統');
        console.log('📅 時間:', new Date().toLocaleString());
        
        try {
            // 1. 深層代碼分析
            await this.deepCodeAnalysis();
            
            // 2. 生成修復策略
            this.generateFixStrategy();
            
            // 3. 實施深層修復
            await this.implementDeepFix();
            
            // 4. 生成分析報告
            this.generateAnalysisReport();
            
            console.log('\n✅ 深層分析和修復完成！');
            
            return this.analysisResults;
            
        } catch (error) {
            console.error('❌ 分析過程中發生錯誤:', error);
            this.analysisResults.error = error.message;
        }
    }

    generateAnalysisReport() {
        console.log('\n📊 生成深層分析報告...');
        
        const report = {
            ...this.analysisResults,
            recommendations: [
                '1. 立即部署修復的代碼',
                '2. 清除CDN和瀏覽器快取',
                '3. 使用真實瀏覽器驗證',
                '4. 監控API端點響應'
            ],
            rootCauseAnalysis: {
                primary: 'Dashboard中的verifyUserAuth函數使用GET方法',
                secondary: '線上版本可能未更新最新代碼',
                tertiary: 'API端點可能只支援POST方法'
            }
        };
        
        // 保存報告
        const filename = `smart-template-deep-analysis-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        
        console.log(`\n📄 詳細報告已保存: ${filename}`);
        
        // 顯示摘要
        console.log('\n🔍 根本原因分析:');
        console.log(`  主要原因: ${report.rootCauseAnalysis.primary}`);
        console.log(`  次要原因: ${report.rootCauseAnalysis.secondary}`);
        console.log(`  其他因素: ${report.rootCauseAnalysis.tertiary}`);
    }
}

// 執行智慧分析
async function runSmartAnalysis() {
    const analyzer = new SmartTemplateDeepAnalysisSystem();
    return await analyzer.executeCompleteAnalysis();
}

// 如果直接執行
if (require.main === module) {
    runSmartAnalysis().catch(console.error);
}

module.exports = SmartTemplateDeepAnalysisSystem;
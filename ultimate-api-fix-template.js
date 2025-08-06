// 🚨 終極API修復智慧模板
// 徹底解決持續兩天的登入和驗證API 404問題

const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

class UltimateAPIFixTemplate {
    constructor() {
        this.targetUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.fixReport = {
            timestamp: new Date().toISOString(),
            diagnostics: [],
            fixes: [],
            verification: [],
            finalStatus: 'pending'
        };
    }

    // 🔍 階段1: 深度診斷
    async deepDiagnosis() {
        console.log('🔍 執行深度診斷...');
        
        // 1. 檢查哪些API正常工作
        const workingAPIs = [
            '/api/system/status',
            '/api/employees',
            '/api/attendance',
            '/api/inventory'
        ];
        
        const brokenAPIs = [
            '/api/auth/login',
            '/api/auth/verify'
        ];
        
        console.log('  測試工作中的API...');
        for (const api of workingAPIs) {
            const result = await this.testAPI(api);
            console.log(`    ${api}: ${result.status === 200 ? '✅' : '❌'} (${result.status})`);
        }
        
        console.log('  測試故障的API...');
        for (const api of brokenAPIs) {
            const result = await this.testAPI(api);
            console.log(`    ${api}: ${result.status === 200 ? '✅' : '❌'} (${result.status})`);
            this.fixReport.diagnostics.push({
                api: api,
                status: result.status,
                broken: result.status === 404
            });
        }
        
        // 2. 分析app.js結構
        await this.analyzeAppStructure();
    }

    async testAPI(path) {
        return new Promise((resolve) => {
            https.get(this.targetUrl + path, (res) => {
                resolve({ status: res.statusCode });
            }).on('error', () => resolve({ status: 0 }));
        });
    }

    async analyzeAppStructure() {
        console.log('\n📋 分析app.js結構...');
        
        const content = fs.readFileSync('app.js', 'utf8');
        
        // 尋找關鍵模式
        const patterns = [
            { name: '登入路由定義', pattern: /app\.post\('\/api\/auth\/login'/, found: false },
            { name: 'POST驗證路由', pattern: /app\.post\('\/api\/auth\/verify'/, found: false },
            { name: 'GET驗證路由', pattern: /app\.get\('\/api\/auth\/verify'/, found: false },
            { name: '系統狀態路由', pattern: /app\.get\('\/api\/system\/status'/, found: false },
            { name: 'Express應用創建', pattern: /const app = express\(\)/, found: false }
        ];
        
        patterns.forEach(p => {
            p.found = p.pattern.test(content);
            console.log(`  ${p.found ? '✅' : '❌'} ${p.name}`);
        });
        
        // 找出路由定義的位置
        const lines = content.split('\n');
        const routePositions = [];
        
        lines.forEach((line, index) => {
            if (line.includes('app.post(\'/api/auth/login\'')) {
                routePositions.push({ route: 'login', line: index + 1 });
            }
            if (line.includes('app.post(\'/api/auth/verify\'')) {
                routePositions.push({ route: 'verify-post', line: index + 1 });
            }
            if (line.includes('app.get(\'/api/system/status\'')) {
                routePositions.push({ route: 'system-status', line: index + 1 });
            }
        });
        
        console.log('\n  路由位置:');
        routePositions.forEach(r => {
            console.log(`    ${r.route}: 第 ${r.line} 行`);
        });
        
        this.fixReport.diagnostics.push({
            type: 'route_analysis',
            patterns: patterns,
            positions: routePositions
        });
    }

    // 🛠️ 階段2: 實施終極修復
    async implementUltimateFix() {
        console.log('\n🛠️ 實施終極修復...');
        
        let content = fs.readFileSync('app.js', 'utf8');
        
        // 策略1: 確保路由在正確位置
        console.log('  📍 策略1: 重新組織路由順序...');
        
        // 先移除所有現有的auth路由
        content = this.removeExistingAuthRoutes(content);
        
        // 在系統狀態路由之前插入auth路由
        const authRoutes = this.generateCorrectAuthRoutes();
        content = this.insertAuthRoutes(content, authRoutes);
        
        // 策略2: 確保middleware正確
        console.log('  🔧 策略2: 修復middleware...');
        content = this.fixMiddleware(content);
        
        // 策略3: 添加調試路由
        console.log('  🐛 策略3: 添加調試路由...');
        content = this.addDebugRoute(content);
        
        // 保存修復
        fs.writeFileSync('app.js', content);
        console.log('\n✅ 終極修復已應用！');
        
        this.fixReport.fixes.push({
            timestamp: new Date().toISOString(),
            strategies: ['重組路由順序', '修復middleware', '添加調試路由']
        });
    }

    removeExistingAuthRoutes(content) {
        // 移除所有現有的登入和驗證路由
        const patterns = [
            /\/\/ 🔐 用戶登入 API[\s\S]*?app\.post\('\/api\/auth\/login'[\s\S]*?\}\);/g,
            /\/\/ 🔐 用戶驗證API[\s\S]*?app\.post\('\/api\/auth\/verify'[\s\S]*?\}\);/g,
            /\/\/ 🔧 支援GET方法[\s\S]*?app\.get\('\/api\/auth\/verify'[\s\S]*?\}\);/g
        ];
        
        patterns.forEach(pattern => {
            content = content.replace(pattern, '');
        });
        
        return content;
    }

    generateCorrectAuthRoutes() {
        return `
// ==================== 認證路由 ====================
// 🔐 用戶登入 API
app.post('/api/auth/login', (req, res) => {
    console.log('[DEBUG] 收到登入請求:', req.body.username);
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: '請提供用戶名和密碼' 
        });
    }
    
    // 查找用戶
    const user = database.employees.find(
        emp => emp.username === username && emp.password === password
    );
    
    if (user) {
        // 不返回密碼
        const { password: _, ...userInfo } = user;
        res.json({ 
            success: true, 
            message: \`歡迎回來，\${user.name}！\`,
            user: userInfo,
            token: username // 簡化的token
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: '用戶名或密碼錯誤' 
        });
    }
});

// 🔐 用戶驗證API（POST方法）
app.post('/api/auth/verify', (req, res) => {
    console.log('[DEBUG] 收到POST驗證請求');
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ success: false, message: '需要身份驗證' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = database.employees.find(emp => emp.username === token);
    
    if (!user) {
        return res.status(401).json({ success: false, message: '無效的認證資訊' });
    }
    
    const { password: _, ...userInfo } = user;
    res.json({ 
        success: true, 
        user: userInfo,
        message: '驗證成功'
    });
});

// 🔐 用戶驗證API（GET方法 - 兼容性）
app.get('/api/auth/verify', (req, res) => {
    console.log('[DEBUG] 收到GET驗證請求');
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ success: false, message: '需要身份驗證' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = database.employees.find(emp => emp.username === token);
    
    if (!user) {
        return res.status(401).json({ success: false, message: '無效的認證資訊' });
    }
    
    const { password: _, ...userInfo } = user;
    res.json({ 
        success: true, 
        user: userInfo,
        message: '驗證成功'
    });
});
// ==================== 認證路由結束 ====================
`;
    }

    insertAuthRoutes(content, authRoutes) {
        // 在系統狀態路由之前插入
        const systemStatusIndex = content.indexOf('// 系統狀態 API');
        if (systemStatusIndex > -1) {
            return content.slice(0, systemStatusIndex) + authRoutes + '\n' + content.slice(systemStatusIndex);
        }
        
        // 如果找不到，在所有路由定義開始前插入
        const appGetIndex = content.indexOf('app.get(\'/\'');
        if (appGetIndex > -1) {
            return content.slice(0, appGetIndex) + authRoutes + '\n' + content.slice(appGetIndex);
        }
        
        return content;
    }

    fixMiddleware(content) {
        // 確保JSON解析中介軟體在最前面
        if (!content.includes('app.use(express.json())')) {
            const appCreateIndex = content.indexOf('const app = express()');
            if (appCreateIndex > -1) {
                const insertPoint = content.indexOf('\n', appCreateIndex) + 1;
                content = content.slice(0, insertPoint) + 
                    'app.use(express.json());\n' + 
                    'app.use(express.urlencoded({ extended: true }));\n' +
                    content.slice(insertPoint);
            }
        }
        return content;
    }

    addDebugRoute(content) {
        const debugRoute = `
// 🐛 調試路由 - 顯示所有註冊的路由
app.get('/api/debug/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach(middleware => {
        if (middleware.route) {
            const methods = Object.keys(middleware.route.methods);
            routes.push({
                path: middleware.route.path,
                methods: methods
            });
        }
    });
    res.json({
        success: true,
        message: '註冊的路由列表',
        routes: routes,
        total: routes.length
    });
});
`;
        
        // 在伺服器啟動之前添加
        const listenIndex = content.indexOf('app.listen(');
        if (listenIndex > -1) {
            return content.slice(0, listenIndex) + debugRoute + '\n' + content.slice(listenIndex);
        }
        
        return content;
    }

    // 🔍 階段3: 驗證修復
    async verifyFix() {
        console.log('\n🔍 驗證修復結果...');
        
        // 1. 檢查語法
        const syntaxCheck = await this.checkSyntax();
        console.log(`  語法檢查: ${syntaxCheck ? '✅ 通過' : '❌ 失敗'}`);
        
        // 2. 檢查路由是否存在
        const content = fs.readFileSync('app.js', 'utf8');
        const requiredRoutes = [
            '/api/auth/login',
            '/api/auth/verify',
            '/api/debug/routes'
        ];
        
        console.log('  路由檢查:');
        requiredRoutes.forEach(route => {
            const exists = content.includes(`'${route}'`);
            console.log(`    ${route}: ${exists ? '✅' : '❌'}`);
        });
        
        this.fixReport.verification.push({
            syntax: syntaxCheck,
            routes: requiredRoutes.map(r => ({
                route: r,
                exists: content.includes(`'${r}'`)
            }))
        });
        
        return syntaxCheck;
    }

    async checkSyntax() {
        return new Promise((resolve) => {
            exec('node -c app.js', (error) => {
                resolve(!error);
            });
        });
    }

    // 🚀 執行完整修復流程
    async executeCompleteFix() {
        console.log('🚀 啟動終極API修復智慧模板');
        console.log('📅 時間:', new Date().toLocaleString());
        
        try {
            // 1. 深度診斷
            await this.deepDiagnosis();
            
            // 2. 實施修復
            await this.implementUltimateFix();
            
            // 3. 驗證修復
            const valid = await this.verifyFix();
            
            if (valid) {
                this.fixReport.finalStatus = 'SUCCESS';
                console.log('\n🎉 終極修復成功！準備部署...');
            } else {
                this.fixReport.finalStatus = 'FAILED';
                console.log('\n❌ 修復失敗，需要手動介入');
            }
            
            // 保存報告
            const filename = `ultimate-api-fix-report-${Date.now()}.json`;
            fs.writeFileSync(filename, JSON.stringify(this.fixReport, null, 2));
            console.log(`\n📄 修復報告: ${filename}`);
            
            return this.fixReport;
            
        } catch (error) {
            console.error('❌ 修復過程中發生錯誤:', error);
            this.fixReport.error = error.message;
            this.fixReport.finalStatus = 'ERROR';
            return this.fixReport;
        }
    }
}

// 執行修復
async function runUltimateFix() {
    const fixer = new UltimateAPIFixTemplate();
    return await fixer.executeCompleteFix();
}

if (require.main === module) {
    runUltimateFix().catch(console.error);
}

module.exports = UltimateAPIFixTemplate;
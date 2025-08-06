// 🚨 完整API修復腳本 - 修復語法錯誤和邏輯問題

const fs = require('fs');

console.log('🚨 執行完整API修復...');

// 讀取當前的app.js
let appContent = fs.readFileSync('app.js', 'utf8');

// 1. 先移除所有錯誤的驗證路由
console.log('🧹 清理錯誤的路由定義...');
appContent = appContent.replace(/\/\/ 🔐 用戶驗證API[\s\S]*?app\.post\('\/api\/auth\/verify'[\s\S]*?\}\);[\s\S]*?app\.get\('\/api\/auth\/verify'[\s\S]*?\}\);[\s\S]*?\}\);/g, '');

// 2. 在正確的位置添加完整的驗證路由
const verifyRoutes = `
// 🔐 用戶驗證API（支援POST方法）
app.post('/api/auth/verify', (req, res) => {
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
    
    const { password: _, ...userInfo } = user;
    res.json({ 
        success: true, 
        user: userInfo,
        message: '驗證成功'
    });
});`;

// 在登入路由後添加驗證路由
appContent = appContent.replace(
    /(app\.post\('\/api\/auth\/login'[\s\S]*?\}\);)/,
    '$1\n' + verifyRoutes
);

// 3. 修復Dashboard中的verifyUserAuth函數（移除重複的catch）
console.log('🔧 修復Dashboard JavaScript...');
appContent = appContent.replace(
    /async function verifyUserAuth\(\) \{[\s\S]*?\}[\s\S]*?catch[\s\S]*?\}[\s\S]*?\}/g,
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

// 4. 確保apiRequest函數正確
console.log('🔧 確保apiRequest函數正確...');
appContent = appContent.replace(
    /async function apiRequest\(url, options = \{\}\) \{[\s\S]*?const token = localStorage\.getItem\('userToken'\) \|\| '';/,
    `async function apiRequest(url, options = {}) {
        console.log('[DEBUG] API請求:', url, 'Options:', options);
        const token = localStorage.getItem('userToken') || '';`
);

// 5. 保存修復後的文件
fs.writeFileSync('app.js', appContent);
console.log('✅ 所有修復已完成！');

// 6. 驗證修復
console.log('\n🔍 驗證修復結果...');
const verifiedContent = fs.readFileSync('app.js', 'utf8');

const checks = [
    { name: 'POST /api/auth/verify 路由', pattern: /app\.post\('\/api\/auth\/verify'/ },
    { name: 'GET /api/auth/verify 路由', pattern: /app\.get\('\/api\/auth\/verify'/ },
    { name: 'verifyUserAuth使用POST', pattern: /method: 'POST'/ },
    { name: 'apiRequest調試日誌', pattern: /console\.log\('\[DEBUG\] API請求:'/ }
];

let allPassed = true;
checks.forEach(check => {
    const passed = check.pattern.test(verifiedContent);
    console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
});

if (allPassed) {
    console.log('\n🎉 所有檢查通過！準備部署...');
} else {
    console.log('\n⚠️ 某些檢查未通過，請手動檢查');
}
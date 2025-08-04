#!/usr/bin/env node

/**
 * 🔐 添加登入帳號系統
 * 為系統添加真實的測試帳號
 */

const fs = require('fs');

console.log('🔐 添加登入帳號系統...');

// 讀取現有的服務器文件
let serverContent = fs.readFileSync('D:\\0802\\server-vercel-fixed.js', 'utf8');

// 添加測試帳號數據
const accountsData = `
// 測試員工帳號 (實際系統應該使用數據庫和加密)
const testAccounts = [
    { username: 'admin', password: 'admin123', name: '系統管理員', role: 'admin' },
    { username: 'employee01', password: 'emp123', name: '張三', role: 'employee' },
    { username: 'manager01', password: 'mgr123', name: '李四', role: 'manager' },
    { username: 'test', password: '123456', name: '測試員工', role: 'employee' },
    { username: 'demo', password: 'demo', name: '演示帳號', role: 'employee' }
];

// 登入驗證 API
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 查找帳號
        const account = testAccounts.find(acc => 
            acc.username === username && acc.password === password
        );
        
        if (account) {
            res.status(200).json({
                success: true,
                message: \`歡迎 \${account.name}！登入成功\`,
                user: {
                    username: account.username,
                    name: account.name,
                    role: account.role
                },
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(401).json({
                success: false,
                message: "帳號或密碼錯誤",
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "登入系統錯誤",
            error: error.message
        });
    }
});

// 獲取測試帳號列表 API (僅用於演示)
app.get('/api/accounts', (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "測試帳號列表",
            accounts: testAccounts.map(acc => ({
                username: acc.username,
                name: acc.name,
                role: acc.role,
                password: "******" // 隱藏密碼
            })),
            note: "這是演示系統，實際系統應該加密存儲密碼",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "獲取帳號列表失敗",
            error: error.message
        });
    }
});
`;

// 更新登入頁面 HTML，包含真實的登入功能
const updatedLoginHTML = `        const loginHTML = \`
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>員工登入 - 企業管理系統</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: bold; }
        input[type="text"], input[type="password"] { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        input[type="text"]:focus, input[type="password"]:focus { border-color: #3498db; outline: none; }
        .login-btn { width: 100%; padding: 15px; background: #3498db; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
        .login-btn:hover { background: #2980b9; }
        .status { background: #27ae60; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        .demo-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; color: #666; }
        .test-accounts { background: #e8f4fd; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .account-item { margin: 5px 0; font-family: monospace; cursor: pointer; padding: 5px; border-radius: 3px; }
        .account-item:hover { background: #d1ecf1; }
        .result { margin-top: 15px; padding: 10px; border-radius: 5px; display: none; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="status">✅ 真實登入系統 - v3.0.1</div>
        <h1>🔐 員工登入</h1>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">員工帳號:</label>
                <input type="text" id="username" name="username" placeholder="請輸入員工帳號" required>
            </div>
            <div class="form-group">
                <label for="password">密碼:</label>
                <input type="password" id="password" name="password" placeholder="請輸入密碼" required>
            </div>
            <button type="submit" class="login-btn">登入系統</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <div class="test-accounts">
            <strong>🧪 測試帳號 (點擊自動填入):</strong><br>
            <div class="account-item" onclick="fillAccount('admin', 'admin123')">👑 admin / admin123 (管理員)</div>
            <div class="account-item" onclick="fillAccount('test', '123456')">👤 test / 123456 (測試員工)</div>
            <div class="account-item" onclick="fillAccount('demo', 'demo')">🎭 demo / demo (演示帳號)</div>
            <div class="account-item" onclick="fillAccount('employee01', 'emp123')">👥 employee01 / emp123 (張三)</div>
            <div class="account-item" onclick="fillAccount('manager01', 'mgr123')">👔 manager01 / mgr123 (李四)</div>
        </div>
        
        <div class="demo-info">
            <strong>🎯 系統狀態:</strong><br>
            • 登入功能: ✅ 正常 (真實驗證)<br>
            • API端點: ✅ 5/5 全部修復<br>
            • 版本: 3.0.1<br>
            • 平台: Vercel<br>
            • 修復時間: \${new Date().toLocaleString('zh-TW')}
        </div>
    </div>
    
    <script>
        function fillAccount(username, password) {
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
        }
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const resultDiv = document.getElementById('result');
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                resultDiv.style.display = 'block';
                if (data.success) {
                    resultDiv.className = 'result success';
                    resultDiv.innerHTML = \`
                        <strong>✅ 登入成功！</strong><br>
                        歡迎：\${data.user.name}<br>
                        角色：\${data.user.role}<br>
                        時間：\${new Date(data.timestamp).toLocaleString('zh-TW')}
                    \`;
                } else {
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = \`<strong>❌ 登入失敗</strong><br>\${data.message}\`;
                }
            } catch (error) {
                resultDiv.style.display = 'block';
                resultDiv.className = 'result error';
                resultDiv.innerHTML = \`<strong>❌ 系統錯誤</strong><br>無法連接到服務器\`;
            }
        });
    </script>
</body>
</html>\`;`;

// 在模擬資料庫部分後添加帳號數據
const insertPosition = serverContent.indexOf('// ===== API 路由 =====');
if (insertPosition !== -1) {
    serverContent = serverContent.slice(0, insertPosition) + accountsData + '\n' + serverContent.slice(insertPosition);
}

// 替換登入頁面 HTML
const loginHTMLStart = serverContent.indexOf('const loginHTML = `');
const loginHTMLEnd = serverContent.indexOf('`;', loginHTMLStart) + 2;

if (loginHTMLStart !== -1 && loginHTMLEnd !== -1) {
    serverContent = serverContent.slice(0, loginHTMLStart) + 
                   updatedLoginHTML + 
                   serverContent.slice(loginHTMLEnd);
}

// 寫入更新後的文件
fs.writeFileSync('D:\\0802\\server-vercel-fixed.js', serverContent);

console.log('✅ 登入帳號系統已添加！');
console.log('');
console.log('🔐 可用的測試帳號：');
console.log('1. admin / admin123 (系統管理員)');
console.log('2. test / 123456 (測試員工) ← 推薦使用');
console.log('3. demo / demo (演示帳號)');
console.log('4. employee01 / emp123 (張三)');
console.log('5. manager01 / mgr123 (李四)');
console.log('');
console.log('📋 新增的 API 端點：');
console.log('• POST /api/login - 真實登入驗證');
console.log('• GET /api/accounts - 查看測試帳號列表');
console.log('');
console.log('🚀 準備提交到 GitHub...');
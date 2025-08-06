// 🔧 修復頁面路由 - 添加缺失的HTML頁面

const fs = require('fs');

console.log('🔧 修復頁面路由...');

const content = fs.readFileSync('app.js', 'utf8');

// 檢查是否已有頁面路由
const hasLoginRoute = content.includes("app.get('/login'");
const hasDashboardRoute = content.includes("app.get('/dashboard'");
const hasHomeRoute = content.includes("app.get('/'");

console.log(`  首頁路由: ${hasHomeRoute ? '✅ 存在' : '❌ 缺失'}`);
console.log(`  登入路由: ${hasLoginRoute ? '✅ 存在' : '❌ 缺失'}`);
console.log(`  Dashboard路由: ${hasDashboardRoute ? '✅ 存在' : '❌ 缺失'}`);

if (!hasHomeRoute || !hasLoginRoute || !hasDashboardRoute) {
    console.log('\n📝 添加缺失的頁面路由...');
    
    // 準備要插入的路由
    const pageRoutes = `
// ==================== 頁面路由 ====================
// 首頁路由
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 登入頁面
app.get('/login', (req, res) => {
    const loginHtml = \`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企業管理系統 - 登入</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .login-container {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 2rem;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            width: 100%;
            padding: 1rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
        .error-message {
            color: #e53e3e;
            margin-top: 1rem;
            text-align: center;
            display: none;
        }
        .test-accounts {
            margin-top: 2rem;
            padding: 1rem;
            background: #f7fafc;
            border-radius: 5px;
            font-size: 0.875rem;
        }
        .test-accounts h3 {
            margin-bottom: 0.5rem;
            color: #4a5568;
        }
        .test-accounts p {
            margin: 0.25rem 0;
            color: #718096;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🏢 企業管理系統</h1>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">用戶名稱</label>
                <input type="text" id="username" name="username" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">密碼</label>
                <input type="password" id="password" name="password" required autocomplete="current-password">
            </div>
            <button type="submit">登入</button>
        </form>
        <div id="errorMessage" class="error-message"></div>
        
        <div class="test-accounts">
            <h3>測試帳號</h3>
            <p>👑 管理員: admin / admin123</p>
            <p>👔 經理: manager / manager123</p>
            <p>👤 員工: john.doe / password123</p>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('userToken', data.token || username);
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                } else {
                    errorDiv.textContent = data.message || '登入失敗';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                errorDiv.textContent = '網路錯誤，請稍後再試';
                errorDiv.style.display = 'block';
            }
        });
    </script>
</body>
</html>\`;
    res.send(loginHtml);
});

// Dashboard頁面
app.get('/dashboard', (req, res) => {
    const dashboardHtml = \`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企業管理系統 - 主控台</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f5f7fa;
        }
        .header {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .module-card {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .module-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .module-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .module-title {
            font-size: 1.25rem;
            color: #333;
            margin-bottom: 0.5rem;
        }
        .module-desc {
            color: #666;
            font-size: 0.875rem;
        }
        button {
            padding: 0.5rem 1rem;
            background: #e53e3e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #c53030;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏢 企業管理主控台</h1>
        <div class="user-info">
            <span>👤 歡迎，<strong id="username">載入中...</strong></span>
            <button onclick="logout()">登出</button>
        </div>
    </div>
    
    <div class="container">
        <h2>功能模組</h2>
        <div class="modules-grid" id="modulesGrid"></div>
    </div>

    <script>
        // 檢查登入狀態
        const userToken = localStorage.getItem('userToken');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!userToken) {
            window.location.href = '/login';
        }
        
        // 顯示用戶名
        document.getElementById('username').textContent = currentUser.name || '未知用戶';
        
        // 功能模組
        const modules = [
            { icon: '👥', title: '員工管理', desc: '管理員工資料', roles: ['admin', 'manager'] },
            { icon: '📅', title: '考勤記錄', desc: '查看考勤狀態', roles: ['admin', 'manager', 'employee'] },
            { icon: '🗓️', title: '排班管理', desc: '安排工作班次', roles: ['admin', 'manager'] },
            { icon: '📦', title: '庫存管理', desc: '追蹤庫存狀態', roles: ['admin', 'manager'] },
            { icon: '🛒', title: '採購申請', desc: '提交採購需求', roles: ['admin', 'manager', 'employee'] },
            { icon: '🔧', title: '維修報告', desc: '報告設備問題', roles: ['admin', 'manager', 'employee'] },
            { icon: '💰', title: '營收分析', desc: '查看營收數據', roles: ['admin'] },
            { icon: '📢', title: '行銷活動', desc: '管理促銷活動', roles: ['admin', 'manager'] }
        ];
        
        // 顯示模組
        const grid = document.getElementById('modulesGrid');
        modules.forEach(module => {
            if (module.roles.includes(currentUser.role)) {
                const card = document.createElement('div');
                card.className = 'module-card';
                card.innerHTML = \`
                    <div class="module-icon">\${module.icon}</div>
                    <div class="module-title">\${module.title}</div>
                    <div class="module-desc">\${module.desc}</div>
                \`;
                card.onclick = () => alert(\`\${module.title} 功能開發中...\`);
                grid.appendChild(card);
            }
        });
        
        function logout() {
            localStorage.removeItem('userToken');
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
        }
    </script>
</body>
</html>\`;
    res.send(dashboardHtml);
});
// ==================== 頁面路由結束 ====================
`;
    
    // 找到插入位置（在認證路由之後）
    const insertIndex = content.indexOf('// ==================== 認證路由結束 ====================');
    if (insertIndex > -1) {
        const newContent = content.slice(0, insertIndex + 58) + '\n' + pageRoutes + '\n' + content.slice(insertIndex + 58);
        fs.writeFileSync('app.js', newContent);
        console.log('✅ 頁面路由已添加！');
    } else {
        console.log('❌ 找不到合適的插入位置');
    }
} else {
    console.log('✅ 所有頁面路由都已存在');
}
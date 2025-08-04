const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// 測試資料
const accounts = [
    { username: 'test', password: '123456', name: '測試員工' },
    { username: 'admin', password: 'admin123', name: '管理員' }
];

const products = [
    { id: 1, name: '筆記本電腦', price: 25000, stock: 50 },
    { id: 2, name: '辦公椅', price: 3500, stock: 20 }
];

// 健康檢查
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', version: '3.0.0', timestamp: new Date().toISOString() });
});

// 主頁
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>企業管理系統 v3.0.0</title>
    <style>
        body { font-family: system-ui; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; }
        .success { background: #28a745; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        h1 { color: #2c3e50; text-align: center; }
        .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px; }
        .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="success">
            <h2>🎉 全新部署成功！</h2>
            <p>企業管理系統 v3.0.0 正常運行</p>
        </div>
        <h1>🚀 企業員工管理系統</h1>
        <div class="cards">
            <div class="card">
                <h3>📊 系統狀態</h3>
                <p>版本: 3.0.0</p>
                <p>狀態: 運行正常</p>
                <a href="/health" class="btn">健康檢查</a>
            </div>
            <div class="card">
                <h3>📋 API 服務</h3>
                <p>所有端點正常</p>
                <a href="/api/products" class="btn">產品管理</a>
                <a href="/api/login" class="btn">員工登入</a>
            </div>
        </div>
        <p style="text-align: center; margin-top: 30px; color: #6c757d;">
            🕐 部署時間: ${new Date().toLocaleString('zh-TW')}
        </p>
    </div>
</body>
</html>`);
});

// API 端點
app.get('/api/products', (req, res) => {
    res.json({ success: true, data: products, count: products.length });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const account = accounts.find(a => a.username === username && a.password === password);
    
    if (account) {
        res.json({ success: true, message: `歡迎 ${account.name}！`, user: account });
    } else {
        res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }
});

app.get('/api/login', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>員工登入</title>
    <style>
        body { font-family: system-ui; margin: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-box { background: white; padding: 40px; border-radius: 15px; max-width: 400px; width: 100%; }
        .success-banner { background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #ddd; border-radius: 6px; }
        button { width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        .test-accounts { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .account { margin: 5px 0; cursor: pointer; padding: 8px; background: white; border-radius: 4px; }
        .account:hover { background: #e3f2fd; }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="success-banner">🎉 全新部署成功</div>
        <h2 style="text-align: center; color: #2c3e50;">🔐 員工登入</h2>
        <form id="form">
            <input type="text" id="username" placeholder="員工帳號" required>
            <input type="password" id="password" placeholder="登入密碼" required>
            <button type="submit">登入系統</button>
        </form>
        <div class="test-accounts">
            <strong>測試帳號:</strong>
            <div class="account" onclick="fill('test','123456')">test / 123456</div>
            <div class="account" onclick="fill('admin','admin123')">admin / admin123</div>
        </div>
        <div id="result" style="margin-top: 15px; padding: 10px; border-radius: 6px; display: none;"></div>
    </div>
    
    <script>
        function fill(u, p) {
            document.getElementById('username').value = u;
            document.getElementById('password').value = p;
        }
        
        document.getElementById('form').onsubmit = async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const result = document.getElementById('result');
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                result.style.display = 'block';
                
                if (data.success) {
                    result.style.background = '#d4edda';
                    result.style.color = '#155724';
                    result.innerHTML = '✅ ' + data.message + ' 正在跳轉到管理主控台...';
                    
                    // 儲存用戶資訊並跳轉到主控台
                    sessionStorage.setItem('user', JSON.stringify(data.user));
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    result.style.background = '#f8d7da';
                    result.style.color = '#721c24';
                    result.innerHTML = '❌ ' + data.message;
                }
            } catch (error) {
                result.style.display = 'block';
                result.style.background = '#f8d7da';
                result.style.color = '#721c24';
                result.innerHTML = '❌ 連接失敗';
            }
        };
    </script>
</body>
</html>`);
});

// 管理主控台頁面
app.get('/dashboard', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>企業管理主控台</title>
    <style>
        body { font-family: system-ui; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .header { background: rgba(255,255,255,0.95); padding: 15px 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { margin: 0; color: #2c3e50; display: inline-block; }
        .user-info { float: right; color: #666; }
        .logout-btn { background: #dc3545; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 15px; }
        .container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; }
        .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .card h3 { color: #2c3e50; margin-top: 0; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .btn { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin: 8px 5px; border: none; cursor: pointer; }
        .btn:hover { background: #2980b9; }
        .btn-success { background: #28a745; }
        .btn-warning { background: #ffc107; color: #333; }
        .btn-info { background: #17a2b8; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #3498db; }
        .features-list { list-style: none; padding: 0; }
        .features-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .features-list li:before { content: "✅ "; color: #28a745; font-weight: bold; }
        .quick-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 企業管理系統 v3.0.0</h1>
        <div class="user-info">
            歡迎回來，<span id="username">管理員</span>
            <button class="logout-btn" onclick="logout()">登出</button>
        </div>
        <div style="clear: both;"></div>
    </div>

    <div class="container">
        <div class="dashboard-grid">
            
            <!-- 系統狀態卡片 -->
            <div class="card">
                <h3>📊 系統狀態總覽</h3>
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">100%</div>
                        <div>系統健康度</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">v3.0.0</div>
                        <div>目前版本</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">24/7</div>
                        <div>服務時間</div>
                    </div>
                </div>
                <button class="btn btn-info" onclick="checkHealth()">健康檢查</button>
                <div id="health-result" style="margin-top: 10px; padding: 10px; border-radius: 6px; display: none;"></div>
            </div>

            <!-- 員工管理卡片 -->
            <div class="card">
                <h3>👥 員工管理</h3>
                <ul class="features-list">
                    <li>員工帳號管理</li>
                    <li>權限控制系統</li>
                    <li>登入記錄查詢</li>
                    <li>員工資料維護</li>
                </ul>
                <div class="quick-actions">
                    <button class="btn">查看員工列表</button>
                    <button class="btn btn-success">新增員工</button>
                </div>
            </div>

            <!-- 產品管理卡片 -->
            <div class="card">
                <h3>📦 產品管理</h3>
                <p>管理企業產品庫存、價格和供應商資訊</p>
                <div class="quick-actions">
                    <button class="btn" onclick="loadProducts()">產品列表</button>
                    <button class="btn btn-success">新增產品</button>
                    <button class="btn btn-warning">庫存管理</button>
                </div>
                <div id="products-preview" style="margin-top: 15px; max-height: 200px; overflow-y: auto;"></div>
            </div>

            <!-- 系統工具卡片 -->
            <div class="card">
                <h3>🔧 系統工具</h3>
                <ul class="features-list">
                    <li>資料備份與還原</li>
                    <li>系統日誌查看</li>
                    <li>API 端點測試</li>
                    <li>效能監控</li>
                </ul>
                <div class="quick-actions">
                    <button class="btn btn-info" onclick="testApi()">測試 API</button>
                    <button class="btn">查看日誌</button>
                </div>
            </div>

            <!-- 快速操作卡片 -->
            <div class="card">
                <h3>⚡ 快速操作</h3>
                <div class="quick-actions">
                    <a href="/api/products" class="btn" target="_blank">產品 API</a>
                    <a href="/health" class="btn" target="_blank">系統健康</a>
                    <a href="/" class="btn">回到首頁</a>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <strong>🎉 全新部署成功！</strong><br>
                    <small>v3.0.0 版本已完全正常運行</small>
                </div>
            </div>

        </div>
    </div>

    <script>
        // 載入用戶資訊
        window.onload = function() {
            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
            if (user.name) {
                document.getElementById('username').textContent = user.name;
            }
        };

        // 登出功能
        function logout() {
            sessionStorage.removeItem('user');
            alert('登出成功');
            window.location.href = '/api/login';
        }

        // 健康檢查
        async function checkHealth() {
            const result = document.getElementById('health-result');
            result.style.display = 'block';
            result.innerHTML = '檢查中...';
            
            try {
                const response = await fetch('/health');
                const data = await response.json();
                result.style.background = '#d4edda';
                result.style.color = '#155724';
                result.innerHTML = \`✅ 系統狀態: \${data.status} | 版本: \${data.version}\`;
            } catch (error) {
                result.style.background = '#f8d7da';  
                result.style.color = '#721c24';
                result.innerHTML = '❌ 健康檢查失敗';
            }
        }

        // 載入產品資料
        async function loadProducts() {
            const preview = document.getElementById('products-preview');
            preview.innerHTML = '載入中...';
            
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                
                if (data.success && data.data) {
                    let html = '<div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">';
                    html += \`<strong>產品總數: \${data.count}</strong><br><br>\`;
                    
                    data.data.forEach(product => {
                        html += \`<div style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px;">
                            <strong>\${product.name}</strong> - NT$ \${product.price.toLocaleString()} 
                            <span style="color: #666;">(庫存: \${product.stock})</span>
                        </div>\`;
                    });
                    
                    html += '</div>';
                    preview.innerHTML = html;
                } else {
                    preview.innerHTML = '無法載入產品資料';
                }
            } catch (error) {
                preview.innerHTML = '載入失敗: ' + error.message;
            }
        }

        // API 測試
        async function testApi() {
            const endpoints = ['/health', '/api/products', '/api/login'];
            let results = '🔍 API 測試結果:\\n\\n';
            
            for (let endpoint of endpoints) {
                try {
                    const start = Date.now();
                    const response = await fetch(endpoint);
                    const time = Date.now() - start;
                    results += \`✅ \${endpoint}: \${response.status} (\${time}ms)\\n\`;
                } catch (error) {
                    results += \`❌ \${endpoint}: 失敗\\n\`;
                }
            }
            
            alert(results);
        }
    </script>
</body>
</html>`);
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: '端點未找到' });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 企業管理系統 v3.0.0 已啟動於 Port ${PORT}`);
    console.log(`✅ 全新部署成功`);
});
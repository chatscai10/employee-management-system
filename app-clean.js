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
                    result.innerHTML = '✅ ' + data.message;
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

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: '端點未找到' });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 企業管理系統 v3.0.0 已啟動於 Port ${PORT}`);
    console.log(`✅ 全新部署成功`);
});
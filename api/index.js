// 🚀 純 Node.js 無伺服器函數 - 最穩定版本
// 完全移除 Express，使用原生 Node.js

// 測試帳號數據
const testAccounts = [
    { username: 'admin', password: 'admin123', name: '系統管理員', role: 'admin' },
    { username: 'test', password: '123456', name: '測試員工', role: 'employee' },
    { username: 'demo', password: 'demo', name: '演示帳號', role: 'employee' },
    { username: 'employee01', password: 'emp123', name: '張三', role: 'employee' },
    { username: 'manager01', password: 'mgr123', name: '李四', role: 'manager' }
];

const products = [
    { id: 1, name: '筆記本電腦', category: '電子產品', price: 25000, stock: 50 },
    { id: 2, name: '辦公椅', category: '辦公用品', price: 3500, stock: 20 },
    { id: 3, name: '投影機', category: '電子產品', price: 15000, stock: 10 }
];

const inventory = [
    { id: 1, product_id: 1, quantity: 50, location: '倉庫A', last_updated: '2025-08-04' },
    { id: 2, product_id: 2, quantity: 20, location: '倉庫B', last_updated: '2025-08-04' },
    { id: 3, product_id: 3, quantity: 10, location: '倉庫A', last_updated: '2025-08-04' }
];

// 解析請求體
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
}

// 設置響應頭
function setHeaders(res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// 主處理函數
module.exports = async (req, res) => {
    try {
        const { method, url } = req;
        
        setHeaders(res);

        // OPTIONS 預檢請求
        if (method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        // 健康檢查
        if (url === '/api/health' && method === 'GET') {
            res.status(200).json({
                status: 'healthy',
                service: '企業員工管理系統',
                version: '3.0.3',
                platform: 'Vercel Native',
                timestamp: new Date().toISOString(),
                fixed: 'FUNCTION_INVOCATION_FAILED 使用原生Node.js修復'
            });
            return;
        }

        // 產品管理
        if (url === '/api/products' && method === 'GET') {
            res.status(200).json({
                success: true,
                message: "產品數據獲取成功",
                data: products,
                count: products.length,
                timestamp: new Date().toISOString()
            });
            return;
        }

        // 庫存管理
        if (url === '/api/inventory' && method === 'GET') {
            const inventoryWithProducts = inventory.map(inv => {
                const product = products.find(p => p.id === inv.product_id);
                return {
                    ...inv,
                    product_name: product?.name || '未知產品',
                    product_category: product?.category || '未分類'
                };
            });

            res.status(200).json({
                success: true,
                message: "庫存數據獲取成功",
                data: inventoryWithProducts,
                count: inventoryWithProducts.length,
                timestamp: new Date().toISOString()
            });
            return;
        }

        // 登入驗證 POST
        if (url === '/api/login' && method === 'POST') {
            const body = await parseBody(req);
            const { username, password } = body;
            
            const account = testAccounts.find(acc => 
                acc.username === username && acc.password === password
            );
            
            if (account) {
                res.status(200).json({
                    success: true,
                    message: `歡迎 ${account.name}！登入成功`,
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
            return;
        }

        // 測試帳號列表
        if (url === '/api/accounts' && method === 'GET') {
            res.status(200).json({
                success: true,
                message: "測試帳號列表",
                accounts: testAccounts.map(acc => ({
                    username: acc.username,
                    name: acc.name,
                    role: acc.role,
                    password: "******"
                })),
                timestamp: new Date().toISOString()
            });
            return;
        }

        // 登入頁面 GET
        if (url === '/api/login' && method === 'GET') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).end(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>員工登入 - v3.0.3</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 400px; width: 100%; }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        .status { background: #27ae60; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: bold; }
        input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        input:focus { border-color: #3498db; outline: none; }
        .btn { width: 100%; padding: 15px; background: #3498db; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .btn:hover { background: #2980b9; }
        .accounts { background: #e8f4fd; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .account { margin: 5px 0; font-family: monospace; cursor: pointer; padding: 5px; border-radius: 3px; }
        .account:hover { background: #d1ecf1; }
        .result { margin-top: 15px; padding: 10px; border-radius: 5px; display: none; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">✅ 原生Node.js修復版 - v3.0.3</div>
        <h1>🔐 員工登入</h1>
        <form id="form">
            <div class="form-group">
                <label>員工帳號:</label>
                <input type="text" id="username" required>
            </div>
            <div class="form-group">
                <label>密碼:</label>
                <input type="password" id="password" required>
            </div>
            <button type="submit" class="btn">登入系統</button>
        </form>
        
        <div id="result" class="result"></div>
        
        <div class="accounts">
            <strong>🧪 測試帳號:</strong><br>
            <div class="account" onclick="fill('test','123456')">👤 test / 123456</div>
            <div class="account" onclick="fill('demo','demo')">🎭 demo / demo</div>
            <div class="account" onclick="fill('admin','admin123')">👑 admin / admin123</div>
        </div>
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
                    result.className = 'result success';
                    result.innerHTML = '✅ 登入成功！<br>歡迎：' + data.user.name + '<br>角色：' + data.user.role;
                } else {
                    result.className = 'result error';
                    result.innerHTML = '❌ ' + data.message;
                }
            } catch (error) {
                result.style.display = 'block';
                result.className = 'result error';
                result.innerHTML = '❌ 連接失敗';
            }
        };
    </script>
</body>
</html>`);
            return;
        }

        // API 文檔
        if (url === '/api' && method === 'GET') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).end(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API 文檔 v3.0.3</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .status { background: #27ae60; color: white; padding: 10px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
        .endpoint { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { background: #3498db; color: white; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        .url { font-family: monospace; color: #2c3e50; font-weight: bold; margin-left: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 企業管理系統 API v3.0.3</h1>
        <div class="status">✅ 使用原生Node.js修復 - 完全穩定</div>
        
        <div class="endpoint">
            <span class="method">GET</span>
            <span class="url">/api/health</span>
            <div>系統健康檢查</div>
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span>
            <span class="url">/api/products</span>
            <div>產品管理數據</div>
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span>
            <span class="url">/api/inventory</span>
            <div>庫存管理數據</div>
        </div>
        
        <div class="endpoint">
            <span class="method">GET/POST</span>
            <span class="url">/api/login</span>
            <div>員工登入系統</div>
        </div>
        
        <div class="endpoint">
            <span class="method">GET</span>
            <span class="url">/api/accounts</span>
            <div>測試帳號列表</div>
        </div>
        
        <p style="text-align: center; color: #27ae60; font-weight: bold;">🎉 原生Node.js - 絕對穩定！</p>
    </div>
</body>
</html>`);
            return;
        }

        // 主頁面
        if (url === '/' && method === 'GET') {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.status(200).end(`<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企業員工管理系統 v3.0.3</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; }
        .status { background: #27ae60; color: white; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .link { display: inline-block; background: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin: 5px; }
        .link:hover { background: #2980b9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 企業員工管理系統</h1>
            <p>版本 3.0.3 | 原生Node.js穩定版</p>
        </div>
        
        <div class="status">
            ✅ 使用原生Node.js完全修復 FUNCTION_INVOCATION_FAILED
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📊 系統狀態</h3>
                <p>版本: 3.0.3</p>
                <p>狀態: 原生Node.js穩定運行</p>
                <a href="/api/health" class="link">健康檢查</a>
            </div>
            
            <div class="card">
                <h3>📋 API 服務</h3>
                <a href="/api" class="link">API 文檔</a>
                <a href="/api/products" class="link">產品管理</a>
                <a href="/api/inventory" class="link">庫存管理</a>
            </div>
            
            <div class="card">
                <h3>👥 員工系統</h3>
                <p>測試帳號: test/123456, demo/demo</p>
                <a href="/api/login" class="link">員工登入</a>
                <a href="/api/accounts" class="link">測試帳號</a>
            </div>
        </div>
    </div>
</body>
</html>`);
            return;
        }

        // 404 處理
        res.status(404).json({
            success: false,
            message: "端點未找到",
            version: "3.0.3",
            availableEndpoints: [
                "GET /",
                "GET /api",
                "GET /api/health",
                "GET /api/products",
                "GET /api/inventory", 
                "GET/POST /api/login",
                "GET /api/accounts"
            ]
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: "服務器錯誤",
            error: error.message,
            version: "3.0.3",
            note: "使用原生Node.js修復"
        });
    }
};
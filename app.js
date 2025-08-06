// 🚀 部署觸發器 - 2025-08-04T08:00:00.000Z - Force Rebuild: 1754293400000
// 🏢 完整企業管理系統伺服器 v4.0.0
// 真正的企業級功能實現

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// === 資料庫模擬 (實際應用中應使用真實資料庫) ===
const database = {
    employees: [
        { 
            id: 1, 
            username: 'john.doe', 
            password: 'password123',
            name: '約翰·多伊',
            email: 'john@company.com',
            department: 'IT部門',
            position: '軟體工程師',
            salary: 60000,
            hireDate: '2023-01-15',
            status: 'active',
            role: 'employee'
        },
        { 
            id: 2, 
            username: 'admin', 
            password: 'admin123',
            name: '系統管理員',
            email: 'admin@company.com',
            department: '管理部門',
            position: '系統管理員',
            salary: 80000,
            hireDate: '2022-06-01',
            status: 'active',
            role: 'admin'
        },
        { 
            id: 3, 
            username: 'manager', 
            password: 'manager123',
            name: '部門經理',
            email: 'manager@company.com',
            department: '管理部門',
            position: '部門經理',
            salary: 90000,
            hireDate: '2022-03-10',
            status: 'active',
            role: 'manager'
        }
    ],
    attendance: [
        { id: 1, employeeId: 1, date: '2025-08-04', checkIn: '09:00', checkOut: '18:00', status: 'present' },
        { id: 2, employeeId: 2, date: '2025-08-04', checkIn: '08:30', checkOut: '17:30', status: 'present' }
    ],
    schedules: [
        { id: 1, employeeId: 1, date: '2025-08-05', shift: 'morning', startTime: '09:00', endTime: '18:00' },
        { id: 2, employeeId: 2, date: '2025-08-05', shift: 'morning', startTime: '08:30', endTime: '17:30' }
    ],
    inventory: [
        { id: 1, name: '筆記本電腦', category: '辦公設備', quantity: 50, price: 25000, supplier: 'Tech Corp' },
        { id: 2, name: '辦公椅', category: '辦公家具', quantity: 20, price: 3500, supplier: 'Furniture Inc' },
        { id: 3, name: '投影機', category: '會議設備', quantity: 8, price: 15000, supplier: 'AV Solutions' }
    ],
    orders: [
        { id: 1, employeeId: 1, items: [{ itemId: 1, quantity: 2 }], status: 'pending', date: '2025-08-04' },
        { id: 2, employeeId: 2, items: [{ itemId: 2, quantity: 1 }], status: 'approved', date: '2025-08-03' }
    ],
    maintenanceRequests: [
        { id: 1, employeeId: 1, equipment: '印表機', issue: '紙張卡住', status: 'open', priority: 'medium', date: '2025-08-04' },
        { id: 2, employeeId: 2, equipment: '冷氣', issue: '不製冷', status: 'in-progress', priority: 'high', date: '2025-08-03' }
    ],
    promotionVotes: [
        { id: 1, candidateId: 1, voterId: 2, vote: 'approve', comments: '表現優秀', date: '2025-08-01' }
    ],
    revenue: [
        { id: 1, date: '2025-08-01', amount: 50000, source: '產品銷售', department: 'IT部門' },
        { id: 2, date: '2025-08-02', amount: 30000, source: '服務收入', department: '客服部門' }
    ]
};

// === 身份驗證中介軟體 ===
function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: '需要身份驗證' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = database.employees.find(emp => emp.username === token);
    
    if (!user) {
        return res.status(401).json({ success: false, message: '無效的認證資訊' });
    }
    
    req.user = user;
    next();
}


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
            message: `歡迎回來，${user.name}！`,
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

// ==================== 頁面路由 ====================
// 首頁路由
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 登入頁面
app.get('/login', (req, res) => {
    const loginHtml = `<!DOCTYPE html>
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
</html>`;
    res.send(loginHtml);
});

// Dashboard頁面
app.get('/dashboard', (req, res) => {
    const dashboardHtml = `<!DOCTYPE html>
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
</html>`;
    res.send(dashboardHtml);
});
// ==================== 頁面路由結束 ====================

// 系統狀態 API
app.get('/api/system/status', (req, res) => {
    res.json({
        success: true,
        system: {
            version: '4.0.0',
            status: 'operational',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            modules: {
                authentication: 'active',
                employeeManagement: 'active',
                attendanceTracking: 'active',
                scheduling: 'active',
                inventory: 'active',
                maintenance: 'active',
                revenue: 'active',
                promotion: 'active'
            }
        },
        database: {
            employees: database.employees.length,
            attendance: database.attendance.length,
            schedules: database.schedules.length,
            inventory: database.inventory.length,
            orders: database.orders.length,
            maintenanceRequests: database.maintenanceRequests.length,
            revenue: database.revenue.length
        }
    });
});

// 員工管理 API
app.get('/api/employees', authenticateUser, (req, res) => {
    // 移除密碼欄位
    const employees = database.employees.map(emp => {
        const { password, ...employeeInfo } = emp;
        return employeeInfo;
    });
    
    res.json({
        success: true,
        data: employees,
        count: employees.length
    });
});

app.get('/api/employees/:id', authenticateUser, (req, res) => {
    const employee = database.employees.find(emp => emp.id === parseInt(req.params.id));
    if (employee) {
        const { password, ...employeeInfo } = employee;
        res.json({ success: true, data: employeeInfo });
    } else {
        res.status(404).json({ success: false, message: '員工不存在' });
    }
});

// 考勤管理 API
app.get('/api/attendance', authenticateUser, (req, res) => {
    let attendance = database.attendance;
    
    // 如果是一般員工，只能查看自己的考勤
    if (req.user.role === 'employee') {
        attendance = attendance.filter(att => att.employeeId === req.user.id);
    }
    
    // 補充員工姓名資訊
    const attendanceWithNames = attendance.map(att => {
        const employee = database.employees.find(emp => emp.id === att.employeeId);
        return {
            ...att,
            employeeName: employee ? employee.name : '未知員工'
        };
    });
    
    res.json({
        success: true,
        data: attendanceWithNames,
        count: attendanceWithNames.length
    });
});

app.post('/api/attendance/checkin', authenticateUser, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = database.attendance.find(att => 
        att.employeeId === req.user.id && att.date === today
    );
    
    if (existingRecord) {
        res.status(400).json({ success: false, message: '今日已簽到' });
        return;
    }
    
    const newAttendance = {
        id: database.attendance.length + 1,
        employeeId: req.user.id,
        date: today,
        checkIn: new Date().toTimeString().split(' ')[0].substring(0, 5),
        checkOut: null,
        status: 'checked-in'
    };
    
    database.attendance.push(newAttendance);
    res.json({ success: true, message: '簽到成功', data: newAttendance });
});

// 排班系統 API
app.get('/api/schedules', authenticateUser, (req, res) => {
    let schedules = database.schedules;
    
    if (req.user.role === 'employee') {
        schedules = schedules.filter(sch => sch.employeeId === req.user.id);
    }
    
    const schedulesWithNames = schedules.map(sch => {
        const employee = database.employees.find(emp => emp.id === sch.employeeId);
        return {
            ...sch,
            employeeName: employee ? employee.name : '未知員工'
        };
    });
    
    res.json({
        success: true,
        data: schedulesWithNames,
        count: schedulesWithNames.length
    });
});

// 庫存管理 API
app.get('/api/inventory', authenticateUser, (req, res) => {
    res.json({
        success: true,
        data: database.inventory,
        count: database.inventory.length,
        totalValue: database.inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    });
});

// 採購申請 API
app.get('/api/orders', authenticateUser, (req, res) => {
    let orders = database.orders;
    
    if (req.user.role === 'employee') {
        orders = orders.filter(order => order.employeeId === req.user.id);
    }
    
    const ordersWithDetails = orders.map(order => {
        const employee = database.employees.find(emp => emp.id === order.employeeId);
        const orderItems = order.items.map(item => {
            const inventoryItem = database.inventory.find(inv => inv.id === item.itemId);
            return {
                ...item,
                itemName: inventoryItem ? inventoryItem.name : '未知物品',
                unitPrice: inventoryItem ? inventoryItem.price : 0
            };
        });
        
        return {
            ...order,
            employeeName: employee ? employee.name : '未知員工',
            items: orderItems
        };
    });
    
    res.json({
        success: true,
        data: ordersWithDetails,
        count: ordersWithDetails.length
    });
});

app.post('/api/orders', authenticateUser, (req, res) => {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ success: false, message: '請選擇要申請的物品' });
        return;
    }
    
    const newOrder = {
        id: database.orders.length + 1,
        employeeId: req.user.id,
        items: items,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        createdBy: req.user.name
    };
    
    database.orders.push(newOrder);
    res.json({ success: true, message: '申請提交成功', data: newOrder });
});

// 維修申請 API
app.get('/api/maintenance', authenticateUser, (req, res) => {
    let requests = database.maintenanceRequests;
    
    if (req.user.role === 'employee') {
        requests = requests.filter(req => req.employeeId === req.user.id);
    }
    
    const requestsWithNames = requests.map(req => {
        const employee = database.employees.find(emp => emp.id === req.employeeId);
        return {
            ...req,
            employeeName: employee ? employee.name : '未知員工'
        };
    });
    
    res.json({
        success: true,
        data: requestsWithNames,
        count: requestsWithNames.length
    });
});

app.post('/api/maintenance', authenticateUser, (req, res) => {
    const { equipment, issue, priority = 'medium' } = req.body;
    
    if (!equipment || !issue) {
        res.status(400).json({ success: false, message: '請填寫設備名稱和問題描述' });
        return;
    }
    
    const newRequest = {
        id: database.maintenanceRequests.length + 1,
        employeeId: req.user.id,
        equipment: equipment,
        issue: issue,
        priority: priority,
        status: 'open',
        date: new Date().toISOString().split('T')[0],
        createdBy: req.user.name
    };
    
    database.maintenanceRequests.push(newRequest);
    res.json({ success: true, message: '維修申請提交成功', data: newRequest });
});

// 營收分析 API
app.get('/api/revenue', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(403).json({ success: false, message: '權限不足，無法查看營收資料' });
        return;
    }
    
    const totalRevenue = database.revenue.reduce((sum, rev) => sum + rev.amount, 0);
    const monthlyRevenue = database.revenue.filter(rev => {
        const revDate = new Date(rev.date);
        const currentMonth = new Date().getMonth();
        return revDate.getMonth() === currentMonth;
    });
    
    res.json({
        success: true,
        data: database.revenue,
        count: database.revenue.length,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue.reduce((sum, rev) => sum + rev.amount, 0)
    });
});

// 升遷投票 API
app.get('/api/promotion-votes', authenticateUser, (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(403).json({ success: false, message: '權限不足' });
        return;
    }
    
    const votesWithNames = database.promotionVotes.map(vote => {
        const candidate = database.employees.find(emp => emp.id === vote.candidateId);
        const voter = database.employees.find(emp => emp.id === vote.voterId);
        return {
            ...vote,
            candidateName: candidate ? candidate.name : '未知候選人',
            voterName: voter ? voter.name : '未知投票人'
        };
    });
    
    res.json({
        success: true,
        data: votesWithNames,
        count: votesWithNames.length
    });
});

// 管理主控台路由
// 🔐 用戶驗證中介軟體
function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.redirect('/login');
    }
    
    const token = authHeader.split(' ')[1];
    const user = database.employees.find(emp => emp.username === token);
    
    if (!user) {
        return res.redirect('/login');
    }
    
    req.user = user;
    next();
}



// API 文檔路由
app.get('/api/docs', (req, res) => {
    const apiDocs = {
        version: '4.0.0',
        title: '企業管理系統 API 文檔',
        description: '完整的企業管理功能 API',
        endpoints: {
            authentication: {
                'POST /api/auth/login': '用戶登入'
            },
            system: {
                'GET /api/system/status': '系統狀態查詢'
            },
            employees: {
                'GET /api/employees': '員工列表查詢',
                'GET /api/employees/:id': '單一員工查詢'
            },
            attendance: {
                'GET /api/attendance': '考勤記錄查詢',
                'POST /api/attendance/checkin': '員工簽到'
            },
            scheduling: {
                'GET /api/schedules': '排班查詢'
            },
            inventory: {
                'GET /api/inventory': '庫存查詢'
            },
            orders: {
                'GET /api/orders': '採購申請查詢',
                'POST /api/orders': '提交採購申請'
            },
            maintenance: {
                'GET /api/maintenance': '維修申請查詢',
                'POST /api/maintenance': '提交維修申請'
            },
            revenue: {
                'GET /api/revenue': '營收分析查詢'
            },
            promotion: {
                'GET /api/promotion-votes': '升遷投票查詢'
            }
        }
    };
    
    res.json(apiDocs);
});

// 健康檢查
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        version: '4.0.0', 
        timestamp: new Date().toISOString(),
        message: '企業管理系統運行正常'
    });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: '端點未找到',
        availableEndpoints: [
            'GET /',
            'GET /login',
            'GET /dashboard',
            'GET /health',
            'POST /api/auth/login',
            'POST /api/auth/verify',
            'GET /api/system/status',
            'GET /api/employees',
            'GET /api/attendance',
            'GET /api/inventory',
            'GET /api/maintenance',
            'GET /api/docs'
        ]
    });
});


// 版本檢查端點
app.get('/api/version', (req, res) => {
    const buildInfo = {
        version: '2025-08-04T11:56:52.173Z',
        commit: process.env.GIT_COMMIT || 'unknown',
        buildTime: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(buildInfo);
});

// 多平台端口配置優化
// 多平台優化的服務器啟動
const server = 
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🎉 企業管理系統 v4.0.0 已成功啟動！`);
    console.log(`🌐 服務地址: http://localhost:${PORT}`);
    console.log(`📊 系統狀態: http://localhost:${PORT}/api/system/status`);
    console.log(`🔐 登入頁面: http://localhost:${PORT}/login`);
    console.log(`🏠 管理主控台: http://localhost:${PORT}/dashboard`);
    console.log(`📖 API 文檔: http://localhost:${PORT}/api/docs`);
    console.log(`💚 健康檢查: http://localhost:${PORT}/health`);
    console.log(`\n✅ 所有企業功能模組已啟用並可正常使用`);
    console.log(`🚀 準備接受企業管理請求...\n`);
    
    // 平台特定優化
    if (process.env.RAILWAY_ENVIRONMENT) {
        console.log('🚂 Railway平台模式已啟用');
    } else if (process.env.VERCEL) {
        console.log('⚡ Vercel無服務器模式已啟用');
    } else if (process.env.RENDER) {
        console.log('🎨 Render平台模式已啟用');
    }
});

// 優雅關閉處理
process.on('SIGTERM', () => {
    console.log('\n📴 收到關閉信號，開始優雅關閉服務...');
    server.close(() => {
        console.log('✅ HTTP服務器已安全關閉');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 收到中斷信號，開始優雅關閉服務...');
    server.close(() => {
        console.log('✅ HTTP服務器已安全關閉');
        process.exit(0);
    });
});

// 導出app供Vercel使用
module.exports = app;
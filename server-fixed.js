const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8080;

// 中間件
app.use(cors());
app.use(express.json());

// 生產環境安全標頭
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')));

// Telegram Bot 配置
const TELEGRAM_BOT_TOKEN = '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc';
const TELEGRAM_CHAT_ID = '-1002658082392';

// 發送Telegram通知
async function sendTelegramNotification(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('✅ Telegram通知發送成功');
    } catch (error) {
        console.error('❌ Telegram通知發送失敗:', error.message);
    }
}

// 模擬數據庫
let employees = [
    {
        employeeId: 'EMP001',
        name: '測試員工',
        idNumber: 'A123456789',
        phone: '0912345678',
        department: '技術部',
        position: '軟體工程師',
        store: '總公司',
        isActive: true,
        registrationDate: new Date().toISOString()
    },
    {
        employeeId: 'EMP002',
        name: '陳小明',
        idNumber: 'B987654321',
        phone: '0987654321',
        department: '業務部',
        position: '業務專員',
        store: '台北分店',
        isActive: true,
        registrationDate: new Date().toISOString()
    }
];

// 產品資料
let products = [
    { id: 1, name: '筆記型電腦', category: '電子產品', price: 25000, stock: 15 },
    { id: 2, name: '辦公椅', category: '家具', price: 3500, stock: 8 },
    { id: 3, name: '印表機', category: '辦公用品', price: 8000, stock: 5 },
    { id: 4, name: 'USB隨身碟', category: '電子產品', price: 500, stock: 50 },
    { id: 5, name: '白板筆', category: '文具', price: 25, stock: 100 }
];

// 庫存資料
let inventory = [
    { id: 1, productId: 1, productName: '筆記型電腦', currentStock: 15, minStock: 5, maxStock: 30, lastUpdated: new Date().toISOString() },
    { id: 2, productId: 2, productName: '辦公椅', currentStock: 8, minStock: 3, maxStock: 20, lastUpdated: new Date().toISOString() },
    { id: 3, productId: 3, productName: '印表機', currentStock: 5, minStock: 2, maxStock: 15, lastUpdated: new Date().toISOString() },
    { id: 4, productId: 4, productName: 'USB隨身碟', currentStock: 50, minStock: 10, maxStock: 100, lastUpdated: new Date().toISOString() },
    { id: 5, productId: 5, productName: '白板筆', currentStock: 100, minStock: 20, maxStock: 200, lastUpdated: new Date().toISOString() }
];

let attendanceRecords = [];
let revenueRecords = [];
let orders = [];

// 健康檢查端點
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'production'
    });
});

// API 根端點 - 提供 API 文檔
app.get('/api', (req, res) => {
    res.json({
        message: '企業庫存管理系統 API',
        version: '2.0.0',
        endpoints: {
            health: 'GET /api/health - 系統健康檢查',
            employees: 'GET /api/employees - 獲取員工列表',
            products: 'GET /api/products - 獲取產品列表',
            inventory: 'GET /api/inventory - 獲取庫存列表',
            login: 'POST /api/login - 員工登入',
            attendance: {
                checkin: 'POST /api/attendance/checkin - 上班打卡',
                checkout: 'POST /api/attendance/checkout - 下班打卡',
                records: 'GET /api/attendance/records - 獲取出勤記錄'
            },
            revenue: 'GET /api/revenue - 獲取營業額記錄',
            orders: 'GET /api/orders - 獲取訂單列表'
        },
        timestamp: new Date().toISOString()
    });
});

// 員工API
app.get('/api/employees', (req, res) => {
    try {
        res.json({
            success: true,
            data: employees,
            total: employees.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('獲取員工資料失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取員工資料失敗',
            error: error.message
        });
    }
});

// 產品管理 API
app.get('/api/products', (req, res) => {
    try {
        res.json({
            success: true,
            data: products,
            total: products.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('獲取產品資料失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取產品資料失敗',
            error: error.message
        });
    }
});

// 庫存管理 API
app.get('/api/inventory', (req, res) => {
    try {
        res.json({
            success: true,
            data: inventory,
            total: inventory.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('獲取庫存資料失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取庫存資料失敗',
            error: error.message
        });
    }
});

// 員工登入API
app.post('/api/login', async (req, res) => {
    try {
        const { name, idNumber } = req.body;
        
        // 驗證必填字段
        if (!name || !idNumber) {
            return res.status(400).json({
                success: false,
                message: '姓名和身分證字號為必填項目'
            });
        }
        
        // 查找員工
        const employee = employees.find(emp => 
            emp.name === name && emp.idNumber === idNumber && emp.isActive
        );
        
        if (!employee) {
            // 發送登入失敗通知
            await sendTelegramNotification(
                `🚨 <b>登入失敗通知</b>\n` +
                `👤 嘗試登入者: ${name}\n` +
                `🆔 身分證字號: ${idNumber}\n` +
                `⏰ 時間: ${new Date().toLocaleString('zh-TW')}\n` +
                `❌ 原因: 員工資料不存在或已停用`
            );
            
            return res.status(401).json({
                success: false,
                message: '員工資料不存在或帳號已停用'
            });
        }
        
        // 登入成功
        const loginTime = new Date().toISOString();
        
        // 發送登入成功通知
        await sendTelegramNotification(
            `✅ <b>員工登入通知</b>\n` +
            `👤 員工姓名: ${employee.name}\n` +
            `🏢 部門: ${employee.department}\n` +
            `💼 職位: ${employee.position}\n` +
            `🏪 店面: ${employee.store}\n` +
            `⏰ 登入時間: ${new Date().toLocaleString('zh-TW')}\n` +
            `📱 員工編號: ${employee.employeeId}`
        );
        
        res.json({
            success: true,
            message: '登入成功',
            data: {
                employeeId: employee.employeeId,
                name: employee.name,
                department: employee.department,
                position: employee.position,
                store: employee.store,
                loginTime: loginTime
            }
        });
        
    } catch (error) {
        console.error('登入處理失敗:', error);
        res.status(500).json({
            success: false,
            message: '登入處理失敗',
            error: error.message
        });
    }
});

// 上班打卡API
app.post('/api/attendance/checkin', async (req, res) => {
    try {
        const { employeeId, name, location } = req.body;
        
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: '員工ID為必填項目'
            });
        }
        
        const employee = employees.find(emp => emp.employeeId === employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: '員工不存在'
            });
        }
        
        const checkinTime = new Date();
        const record = {
            id: attendanceRecords.length + 1,
            employeeId,
            name: name || employee.name,
            checkinTime: checkinTime.toISOString(),
            location: location || '未指定',
            status: 'checked_in'
        };
        
        attendanceRecords.push(record);
        
        // 發送打卡通知
        await sendTelegramNotification(
            `⏰ <b>上班打卡通知</b>\n` +
            `👤 員工: ${record.name}\n` +
            `📍 地點: ${record.location}\n` +
            `⏰ 時間: ${checkinTime.toLocaleString('zh-TW')}\n` +
            `✅ 狀態: 已上班打卡`
        );
        
        res.json({
            success: true,
            message: '上班打卡成功',
            data: record
        });
        
    } catch (error) {
        console.error('上班打卡失敗:', error);
        res.status(500).json({
            success: false,
            message: '上班打卡失敗',
            error: error.message
        });
    }
});

// 下班打卡API
app.post('/api/attendance/checkout', async (req, res) => {
    try {
        const { employeeId, name } = req.body;
        
        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: '員工ID為必填項目'
            });
        }
        
        const checkinRecord = attendanceRecords.find(
            record => record.employeeId === employeeId && record.status === 'checked_in'
        );
        
        if (!checkinRecord) {
            return res.status(400).json({
                success: false,
                message: '找不到對應的上班打卡記錄'
            });
        }
        
        const checkoutTime = new Date();
        checkinRecord.checkoutTime = checkoutTime.toISOString();
        checkinRecord.status = 'checked_out';
        
        // 計算工作時數
        const checkinDate = new Date(checkinRecord.checkinTime);
        const workHours = Math.round((checkoutTime - checkinDate) / (1000 * 60 * 60) * 100) / 100;
        checkinRecord.workHours = workHours;
        
        // 發送下班打卡通知
        await sendTelegramNotification(
            `🏠 <b>下班打卡通知</b>\n` +
            `👤 員工: ${checkinRecord.name}\n` +
            `⏰ 下班時間: ${checkoutTime.toLocaleString('zh-TW')}\n` +
            `🕒 工作時數: ${workHours} 小時\n` +
            `✅ 狀態: 已下班打卡`
        );
        
        res.json({
            success: true,
            message: '下班打卡成功',
            data: checkinRecord
        });
        
    } catch (error) {
        console.error('下班打卡失敗:', error);
        res.status(500).json({
            success: false,
            message: '下班打卡失敗',
            error: error.message
        });
    }
});

// 獲取出勤記錄API
app.get('/api/attendance/records', (req, res) => {
    try {
        const { employeeId, date } = req.query;
        
        let filteredRecords = attendanceRecords;
        
        if (employeeId) {
            filteredRecords = filteredRecords.filter(record => record.employeeId === employeeId);
        }
        
        if (date) {
            const targetDate = new Date(date).toDateString();
            filteredRecords = filteredRecords.filter(record => 
                new Date(record.checkinTime).toDateString() === targetDate
            );
        }
        
        res.json({
            success: true,
            data: filteredRecords,
            total: filteredRecords.length
        });
        
    } catch (error) {
        console.error('獲取出勤記錄失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取出勤記錄失敗',
            error: error.message
        });
    }
});

// 營業額記錄API
app.get('/api/revenue', (req, res) => {
    try {
        res.json({
            success: true,
            data: revenueRecords,
            total: revenueRecords.length,
            totalRevenue: revenueRecords.reduce((sum, record) => sum + record.amount, 0)
        });
    } catch (error) {
        console.error('獲取營業額記錄失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取營業額記錄失敗',
            error: error.message
        });
    }
});

// 訂單列表API
app.get('/api/orders', (req, res) => {
    try {
        res.json({
            success: true,
            data: orders,
            total: orders.length
        });
    } catch (error) {
        console.error('獲取訂單列表失敗:', error);
        res.status(500).json({
            success: false,
            message: '獲取訂單列表失敗',
            error: error.message
        });
    }
});

// 前端路由 - 服務 React 應用
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 全局錯誤處理
app.use((error, req, res, next) => {
    console.error('全局錯誤:', error);
    res.status(500).json({
        success: false,
        message: '服務器內部錯誤',
        error: process.env.NODE_ENV === 'development' ? error.message : '服務暫不可用'
    });
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '請求的資源不存在',
        path: req.path,
        method: req.method
    });
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`🚀 企業庫存管理系統API服務器運行在端口 ${PORT}`);
    console.log(`📱 健康檢查: http://localhost:${PORT}/api/health`);
    console.log(`📚 API文檔: http://localhost:${PORT}/api`);
    console.log(`🌐 前端界面: http://localhost:${PORT}`);
    
    // 發送啟動通知
    sendTelegramNotification(
        `🚀 <b>系統啟動通知</b>\n` +
        `📱 服務: 企業庫存管理系統\n` +
        `🌐 端口: ${PORT}\n` +
        `⏰ 啟動時間: ${new Date().toLocaleString('zh-TW')}\n` +
        `✅ 狀態: 服務器已成功啟動並運行`
    );
});

module.exports = app;
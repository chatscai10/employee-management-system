const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3005;

// 中間件
app.use(express.json());
app.use(express.static('.'));

// CORS 設置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 模擬數據庫 - 員工資料
let employees = [
    {
        employeeId: 'EMP001',
        name: '測試員工',
        idNumber: 'A123456789',
        birthDate: '1990-01-01',
        gender: '男',
        license: '汽車駕照',
        phone: '0912345678',
        address: '桃園市中壢區忠孝路123號',
        emergencyContact: '測試家長',
        relationship: '父親',
        emergencyPhone: '0987654321',
        startDate: '2024-01-01',
        store: '內壢忠孝店',
        position: '實習生',
        lineUserId: 'auto_generated_test',
        status: '在職',
        registrationDate: '2024-01-01T00:00:00.000Z',
        isActive: true
    }
];

// 考勤記錄
let attendanceRecords = [];
// 營收記錄
let revenueRecords = [];

// 主頁路由 - 提供新的HTML檔案
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-new.html'));
});

// 系統健康檢查 API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: '企業員工管理系統 - 內壢忠孝店',
        version: '4.0 完整重構版',
        description: '全新設計的員工管理系統，包含完整註冊流程',
        modules: {
            employees: '✅ 正常運行',
            attendance: '✅ 正常運行',
            revenue: '✅ 正常運行'
        },
        features: [
            '✅ 姓名+身分證號登入',
            '✅ 11項必填註冊欄位',
            '✅ 動態模態視窗註冊',
            '✅ 自動設定分店和職位',
            '✅ 完整員工資料管理'
        ],
        statistics: {
            totalEmployees: employees.length,
            attendanceRecords: attendanceRecords.length,
            revenueRecords: revenueRecords.length
        },
        store: '內壢忠孝店',
        defaultPosition: '實習生'
    });
});

// 員工註冊 API (全新設計)
app.post('/api/register', (req, res) => {
    try {
        const { 
            name, idNumber, birthDate, gender, license, phone, address,
            emergencyContact, relationship, emergencyPhone, startDate,
            store, position, lineUserId, status
        } = req.body;
        
        // 驗證必填欄位
        const requiredFields = {
            name: '姓名',
            idNumber: '身分證號',
            birthDate: '出生日期',
            gender: '性別',
            license: '駕照',
            phone: '聯絡電話',
            address: '地址',
            emergencyContact: '緊急聯絡人',
            relationship: '關係',
            emergencyPhone: '緊急聯絡人電話',
            startDate: '到職日'
        };

        for (let [field, displayName] of Object.entries(requiredFields)) {
            if (!req.body[field]) {
                return res.json({ 
                    success: false, 
                    message: `請填寫${displayName}` 
                });
            }
        }
        
        // 檢查身分證號格式
        const idPattern = /^[A-Z][12][0-9]{8}$/;
        if (!idPattern.test(idNumber)) {
            return res.json({ 
                success: false, 
                message: '身分證號格式不正確' 
            });
        }
        
        // 檢查是否已註冊
        const existingEmployee = employees.find(emp => emp.idNumber === idNumber);
        if (existingEmployee) {
            return res.json({ 
                success: false, 
                message: '此身分證號已註冊過' 
            });
        }
        
        // 生成員工編號
        const employeeId = 'EMP' + String(employees.length + 1).padStart(3, '0');
        
        // 創建新員工記錄
        const newEmployee = {
            employeeId,
            name,
            idNumber,
            birthDate,
            gender,
            license,
            phone,
            address,
            emergencyContact,
            relationship,
            emergencyPhone,
            startDate,
            store: store || '內壢忠孝店',
            position: position || '實習生',
            lineUserId: lineUserId || `auto_generated_${Date.now()}`,
            status: status || '審核中',
            registrationDate: new Date().toISOString(),
            isActive: false // 新註冊需要審核
        };
        
        employees.push(newEmployee);
        
        res.json({
            success: true,
            message: '員工註冊申請提交成功！請等待審核',
            data: { 
                employeeId, 
                name, 
                store: newEmployee.store, 
                position: newEmployee.position,
                status: newEmployee.status
            }
        });
        
    } catch (error) {
        console.error('註冊錯誤:', error);
        res.json({ 
            success: false, 
            message: '系統錯誤，請稍後再試' 
        });
    }
});

// 員工登入 API (使用姓名+身分證號)
app.post('/api/login', (req, res) => {
    try {
        const { name, idNumber } = req.body;
        
        if (!name || !idNumber) {
            return res.json({ 
                success: false, 
                message: '請輸入姓名和身分證號' 
            });
        }
        
        const employee = employees.find(emp => 
            emp.name === name && 
            emp.idNumber === idNumber && 
            emp.isActive
        );
        
        if (!employee) {
            return res.json({ 
                success: false, 
                message: '姓名或身分證號錯誤，或帳號尚未審核通過' 
            });
        }
        
        res.json({
            success: true,
            message: '登入成功',
            data: {
                employeeId: employee.employeeId,
                name: employee.name,
                store: employee.store,
                position: employee.position,
                status: employee.status
            }
        });
        
    } catch (error) {
        console.error('登入錯誤:', error);
        res.json({ 
            success: false, 
            message: '系統錯誤，請稍後再試' 
        });
    }
});

// 員工查詢 API
app.get('/api/employees', (req, res) => {
    try {
        const employeeList = employees.map(emp => ({
            employeeId: emp.employeeId,
            name: emp.name,
            store: emp.store,
            position: emp.position,
            status: emp.status,
            startDate: emp.startDate,
            phone: emp.phone
        }));
        
        res.json({
            success: true,
            message: '員工資料查詢成功',
            data: employeeList,
            total: employeeList.length
        });
        
    } catch (error) {
        res.json({ 
            success: false, 
            message: '系統錯誤，請稍後再試' 
        });
    }
});

// 考勤打卡 API
app.post('/api/attendance', (req, res) => {
    try {
        const { employeeId, type, location } = req.body;
        
        const employee = employees.find(emp => emp.employeeId === employeeId);
        if (!employee) {
            return res.json({ 
                success: false, 
                message: '員工不存在' 
            });
        }
        
        const now = new Date();
        const record = {
            id: attendanceRecords.length + 1,
            employeeId,
            employeeName: employee.name,
            type, // 'clock-in' or 'clock-out'
            timestamp: now.toISOString(),
            location: location || '內壢忠孝店',
            date: now.toDateString()
        };
        
        attendanceRecords.push(record);
        
        res.json({
            success: true,
            message: `${type === 'clock-in' ? '上班' : '下班'}打卡成功`,
            data: record
        });
        
    } catch (error) {
        res.json({ 
            success: false, 
            message: '打卡失敗，請稍後再試' 
        });
    }
});

// 營收記錄 API
app.post('/api/revenue', (req, res) => {
    try {
        const { employeeId, amount, description } = req.body;
        
        const employee = employees.find(emp => emp.employeeId === employeeId);
        if (!employee) {
            return res.json({ 
                success: false, 
                message: '員工不存在' 
            });
        }
        
        const record = {
            id: revenueRecords.length + 1,
            employeeId,
            employeeName: employee.name,
            amount: parseFloat(amount),
            description: description || '',
            timestamp: new Date().toISOString(),
            store: employee.store
        };
        
        revenueRecords.push(record);
        
        res.json({
            success: true,
            message: '營收記錄新增成功',
            data: record
        });
        
    } catch (error) {
        res.json({ 
            success: false, 
            message: '營收記錄失敗，請稍後再試' 
        });
    }
});

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '找不到請求的資源',
        path: req.path
    });
});

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 企業員工管理系統 v4.0 重構版已啟動`);
    console.log(`📍 服務地址: http://0.0.0.0:${PORT}`);
    console.log(`🏪 分店: 內壢忠孝店`);
    console.log(`✅ 功能模組: 全新註冊流程、姓名登入、完整員工管理`);
    console.log(`🔒 安全特性: 身分證驗證、完整個人資料、狀態管理`);
    console.log(`💾 數據存儲: 記憶體數據庫 (${employees.length} 名員工)`);
    console.log(`🧪 測試帳號: 測試員工 / A123456789`);
    console.log(`📋 註冊欄位: 11項必填欄位 + 4項自動設定`);
    console.log(`🎯 系統狀態: ✅ 全新重構完成，符合需求規格！`);
});

module.exports = app;
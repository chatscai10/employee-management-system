#!/usr/bin/env node

/**
 * 🧪 獨立 API 測試版本
 * 不依賴資料庫連接，純粹測試 API 端點和 Docker 容器
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8081;

// 安全中間件
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5000',
        'https://employee-management-v2-41bb5.web.app',
        'https://employee-management-v2-41bb5.firebaseapp.com'
    ],
    credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 靜態檔案服務
app.use(express.static('public'));

// 健康檢查端點
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        message: '✅ API 服務運行正常 (測試模式)'
    });
});

// 登入端點
app.post('/api/login', (req, res) => {
    const { name, idNumber } = req.body;
    
    // 模擬員工資料庫
    const employees = [
        { employeeId: 'EMP001', name: '測試員工', idNumber: 'A123456789', department: '技術部', position: '軟體工程師', store: '總公司' },
        { employeeId: 'EMP002', name: '王小明', idNumber: 'B987654321', department: '業務部', position: '業務經理', store: '台北分店' },
        { employeeId: 'EMP003', name: '李小華', idNumber: 'C246813579', department: '人事部', position: '人事專員', store: '台中分店' }
    ];
    
    const employee = employees.find(emp => emp.name === name && emp.idNumber === idNumber);
    
    if (employee) {
        res.json({
            success: true,
            data: employee,
            message: '登入成功',
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(401).json({
            success: false,
            message: '姓名或身分證號錯誤',
            timestamp: new Date().toISOString()
        });
    }
});

// 模擬 API 端點
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: '測試產品 1', category: '電子產品', price: 1000 },
            { id: 2, name: '測試產品 2', category: '家具', price: 2000 }
        ],
        total: 2,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/inventory', (req, res) => {
    res.json({
        success: true,
        data: [
            { product_id: 1, quantity: 50, location: '倉庫A' },
            { product_id: 2, quantity: 30, location: '倉庫B' }
        ],
        total: 2,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/suppliers', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: '測試供應商 1', contact: 'test1@example.com' },
            { id: 2, name: '測試供應商 2', contact: 'test2@example.com' }
        ],
        total: 2,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/categories', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: '電子產品', description: '各種電子設備' },
            { id: 2, name: '家具', description: '辦公和家用家具' }
        ],
        total: 2,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/revenue', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, item: '產品銷售', amount: 50000, date: '2025-08-01' },
            { id: 2, item: '服務收入', amount: 30000, date: '2025-08-02' }
        ],
        total: 80000,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/expense', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, item: '辦公用品', amount: 5000, date: '2025-08-01' },
            { id: 2, item: '運輸費用', amount: 3000, date: '2025-08-02' }
        ],
        total: 8000,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/employees', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: '測試員工 1', department: 'IT', position: '工程師' },
            { id: 2, name: '測試員工 2', department: '業務', position: '經理' }
        ],
        total: 2,
        timestamp: new Date().toISOString()
    });
});

// 系統資訊端點
app.get('/api/system/info', (req, res) => {
    res.json({
        success: true,
        system: {
            name: 'Google Cloud 企業級庫存管理系統',
            version: '1.0.0',
            mode: 'test_standalone',
            environment: process.env.NODE_ENV || 'development',
            platform: process.platform,
            node_version: process.version,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        },
        features: {
            api_endpoints: 8,
            database_connection: false,
            cloud_integration: false,
            security_enabled: true,
            cors_enabled: true,
            compression_enabled: true
        }
    });
});

// 測試連接端點
app.get('/api/test/connectivity', (req, res) => {
    res.json({
        success: true,
        message: '🎉 API 連接測試成功',
        tests: {
            express_server: true,
            cors_middleware: true,
            security_headers: true,
            json_parsing: true,
            static_files: true
        },
        timestamp: new Date().toISOString()
    });
});

// 404 處理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API 端點不存在',
        requested_path: req.originalUrl,
        available_endpoints: [
            '/health',
            '/api/products',
            '/api/inventory',
            '/api/suppliers',
            '/api/categories',
            '/api/revenue',
            '/api/expense',
            '/api/employees',
            '/api/system/info',
            '/api/test/connectivity'
        ],
        timestamp: new Date().toISOString()
    });
});

// 錯誤處理
app.use((error, req, res, next) => {
    console.error('API 錯誤:', error);
    res.status(500).json({
        success: false,
        error: '伺服器內部錯誤',
        timestamp: new Date().toISOString()
    });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 測試 API 伺服器啟動成功');
    console.log(`📡 服務地址: http://0.0.0.0:${PORT}`);
    console.log(`🔍 健康檢查: http://0.0.0.0:${PORT}/health`);
    console.log(`📊 系統資訊: http://0.0.0.0:${PORT}/api/system/info`);
    console.log(`🧪 連接測試: http://0.0.0.0:${PORT}/api/test/connectivity`);
    console.log('✅ 所有 API 端點可用，準備接受請求');
});

// 優雅關閉
process.on('SIGTERM', () => {
    console.log('📛 收到終止信號，正在優雅關閉...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📛 收到中斷信號，正在優雅關閉...');
    process.exit(0);
});
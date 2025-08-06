// 🔍 部署後驗證腳本
// 使用方法: node post-deployment-verification.js <your-deployed-url>

const https = require('https');
const http = require('http');

async function verifyDeployment(baseUrl) {
    console.log('🔍 開始驗證部署的企業管理系統...');
    console.log('🌐 目標網址:', baseUrl);
    
    const tests = [
        { name: '主頁載入', path: '/', expected: '企業管理系統' },
        { name: '健康檢查', path: '/health', expected: 'healthy' },
        { name: '系統API', path: '/api/system/status', expected: 'success' },
        { name: '登入頁面', path: '/login', expected: '員工登入' }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        try {
            const response = await makeRequest(baseUrl + test.path);
            if (response.includes(test.expected)) {
                console.log('✅', test.name, '通過');
                passed++;
            } else {
                console.log('❌', test.name, '失敗');
            }
        } catch (error) {
            console.log('❌', test.name, '錯誤:', error.message);
        }
    }
    
    console.log(`\n📊 驗證結果: ${passed}/${tests.length} 通過`);
    
    if (passed === tests.length) {
        console.log('🎉 部署驗證完全成功！');
        console.log('🔐 測試帳號:');
        console.log('   管理員: admin / admin123');
        console.log('   經理: manager / manager123');
        console.log('   員工: john.doe / password123');
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

const url = process.argv[2];
if (!url) {
    console.log('使用方法: node post-deployment-verification.js <your-deployed-url>');
    process.exit(1);
}

verifyDeployment(url);
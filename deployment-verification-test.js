/**
 * 部署驗證測試腳本 - 驗證系統功能和API端點
 */

const https = require('https');
const http = require('http');

const baseUrl = 'https://employee-management-system-213410885168.asia-east1.run.app';

// API端點測試清單
const apiEndpoints = [
    { path: '/api/health', method: 'GET', description: '系統健康檢查' },
    { path: '/api', method: 'GET', description: 'API總覽' },
    { path: '/api/employees', method: 'GET', description: '員工管理API' },
    { path: '/api/attendance', method: 'GET', description: '考勤管理API' },
    { path: '/api/revenue', method: 'GET', description: '營收管理API' },
    { path: '/api/ordering', method: 'GET', description: '叫貨系統API' },
    { path: '/api/schedule', method: 'GET', description: '排班系統API' },
    { path: '/api/promotion', method: 'GET', description: '升遷投票API' },
    { path: '/api/maintenance', method: 'GET', description: '維修管理API' }
];

// 前端頁面測試清單
const frontendPages = [
    { path: '/', description: '主頁面' },
    { path: '/index.html', description: '系統首頁' }
];

// 發送HTTP請求
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const protocol = url.startsWith('https:') ? https : http;
        
        const req = protocol.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    headers: res.headers,
                    data: data,
                    responseTime: responseTime
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('請求超時'));
        });
    });
}

// 測試API端點
async function testApiEndpoint(endpoint) {
    try {
        const url = `${baseUrl}${endpoint.path}`;
        console.log(`🧪 測試 ${endpoint.description}: ${endpoint.path}`);
        
        const response = await makeRequest(url);
        
        if (response.statusCode === 200) {
            console.log(`   ✅ 成功 - 狀態碼: ${response.statusCode}, 響應時間: ${response.responseTime}ms`);
            
            // 嘗試解析JSON回應
            try {
                const jsonData = JSON.parse(response.data);
                if (jsonData.success !== undefined) {
                    console.log(`   📊 API回應: success=${jsonData.success}`);
                }
                if (jsonData.service) {
                    console.log(`   🏷️ 服務名稱: ${jsonData.service}`);
                }
                if (jsonData.version) {
                    console.log(`   📦 版本: ${jsonData.version}`);
                }
            } catch (parseError) {
                console.log(`   📄 回應類型: HTML/文本內容 (${response.data.length} 字元)`);
            }
            
            return { success: true, endpoint: endpoint.path, responseTime: response.responseTime };
        } else {
            console.log(`   ❌ 失敗 - 狀態碼: ${response.statusCode}, 訊息: ${response.statusMessage}`);
            return { success: false, endpoint: endpoint.path, error: `HTTP ${response.statusCode}` };
        }
    } catch (error) {
        console.log(`   ❌ 錯誤: ${error.message}`);
        return { success: false, endpoint: endpoint.path, error: error.message };
    }
}

// 測試前端頁面
async function testFrontendPage(page) {
    try {
        const url = `${baseUrl}${page.path}`;
        console.log(`🌐 測試 ${page.description}: ${page.path}`);
        
        const response = await makeRequest(url);
        
        if (response.statusCode === 200) {
            const isHtml = response.headers['content-type']?.includes('text/html');
            console.log(`   ✅ 成功 - 狀態碼: ${response.statusCode}, 響應時間: ${response.responseTime}ms`);
            console.log(`   📄 內容類型: ${response.headers['content-type']}`);
            console.log(`   📏 內容大小: ${response.data.length} 字元`);
            
            if (isHtml) {
                // 檢查HTML內容關鍵字
                const content = response.data.toLowerCase();
                const keywords = ['企業員工管理系統', 'employee management', '員工', '管理'];
                const foundKeywords = keywords.filter(keyword => content.includes(keyword));
                console.log(`   🔍 找到關鍵字: ${foundKeywords.join(', ')}`);
            }
            
            return { success: true, page: page.path, responseTime: response.responseTime };
        } else {
            console.log(`   ❌ 失敗 - 狀態碼: ${response.statusCode}, 訊息: ${response.statusMessage}`);
            return { success: false, page: page.path, error: `HTTP ${response.statusCode}` };
        }
    } catch (error) {
        console.log(`   ❌ 錯誤: ${error.message}`);
        return { success: false, page: page.path, error: error.message };
    }
}

// 執行完整驗證測試
async function runVerificationTests() {
    console.log('🚀 開始部署驗證測試...\n');
    console.log(`🔗 測試目標: ${baseUrl}\n`);

    const results = {
        apiTests: [],
        frontendTests: [],
        summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            averageResponseTime: 0
        }
    };

    // 測試API端點
    console.log('📡 測試API端點...\n');
    for (const endpoint of apiEndpoints) {
        const result = await testApiEndpoint(endpoint);
        results.apiTests.push(result);
        console.log(''); // 空行分隔
        await sleep(500); // 避免過快請求
    }

    // 測試前端頁面
    console.log('🌐 測試前端頁面...\n');
    for (const page of frontendPages) {
        const result = await testFrontendPage(page);
        results.frontendTests.push(result);
        console.log(''); // 空行分隔
        await sleep(500);
    }

    // 計算統計結果
    const allTests = [...results.apiTests, ...results.frontendTests];
    results.summary.totalTests = allTests.length;
    results.summary.passedTests = allTests.filter(test => test.success).length;
    results.summary.failedTests = allTests.filter(test => !test.success).length;
    
    const responseTimes = allTests
        .filter(test => test.success && test.responseTime)
        .map(test => test.responseTime);
    
    if (responseTimes.length > 0) {
        results.summary.averageResponseTime = Math.round(
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        );
    }

    // 顯示測試結果摘要
    console.log('📊 測試結果摘要:');
    console.log(`   總測試數: ${results.summary.totalTests}`);
    console.log(`   通過測試: ${results.summary.passedTests} ✅`);
    console.log(`   失敗測試: ${results.summary.failedTests} ${results.summary.failedTests > 0 ? '❌' : '✅'}`);
    console.log(`   成功率: ${Math.round((results.summary.passedTests / results.summary.totalTests) * 100)}%`);
    console.log(`   平均響應時間: ${results.summary.averageResponseTime}ms\n`);

    // 顯示詳細結果
    if (results.summary.failedTests > 0) {
        console.log('❌ 失敗的測試:');
        allTests.filter(test => !test.success).forEach(test => {
            console.log(`   - ${test.endpoint || test.page}: ${test.error}`);
        });
        console.log('');
    }

    if (results.summary.passedTests > 0) {
        console.log('✅ 通過的測試:');
        allTests.filter(test => test.success).forEach(test => {
            console.log(`   - ${test.endpoint || test.page}: ${test.responseTime}ms`);
        });
        console.log('');
    }

    return results;
}

// 延遲函數
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 如果直接執行此腳本
if (require.main === module) {
    runVerificationTests().then(results => {
        const successRate = (results.summary.passedTests / results.summary.totalTests) * 100;
        
        if (successRate >= 80) {
            console.log('🎉 部署驗證測試完成！系統運行正常。');
            process.exit(0);
        } else {
            console.log('⚠️ 部署驗證測試完成，但有部分功能異常，請檢查。');
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ 驗證測試執行失敗:', error.message);
        process.exit(1);
    });
}

module.exports = { runVerificationTests, testApiEndpoint, testFrontendPage };
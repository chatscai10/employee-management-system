// 🔍 檢查最新 Google Cloud 部署狀態
// 驗證 europe-west1 服務是否已修復成功

const https = require('https');

class LatestDeploymentChecker {
    constructor() {
        // 基於最新部署的可能網址格式
        this.possibleUrls = [
            'https://employee-management-system-213410885168.europe-west1.run.app',
            'https://employee-management-system-adept-arbor-467807-t9.europe-west1.run.app',
            'https://employee-management-system-467807.europe-west1.run.app'
        ];
        this.endpoints = [
            '/',
            '/api/health',
            '/api/products',
            '/api/login'
        ];
    }

    async testUrl(baseUrl, path) {
        return new Promise((resolve) => {
            const url = baseUrl + path;
            
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        url: baseUrl,
                        path,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        isPlaceholder: data.includes('placeholder') || data.includes('unicorn'),
                        isProduction: data.includes('企業管理') || data.includes('Google Cloud'),
                        hasLoginForm: data.includes('登入') && data.includes('帳號'),
                        contentLength: data.length,
                        timestamp: new Date().toISOString()
                    };
                    
                    resolve(result);
                });
            });
            
            req.on('error', () => {
                resolve({
                    url: baseUrl,
                    path,
                    status: 0,
                    success: false,
                    error: 'connection_failed',
                    timestamp: new Date().toISOString()
                });
            });
            
            req.setTimeout(8000, () => {
                req.destroy();
                resolve({
                    url: baseUrl,
                    path,
                    status: 0,
                    success: false,
                    error: 'timeout',
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    async findWorkingService() {
        console.log('🔍 檢查最新 Google Cloud 部署狀態...');
        console.log('📍 檢查 europe-west1 服務（15分鐘前部署）');
        console.log('');
        
        const results = [];
        
        for (const baseUrl of this.possibleUrls) {
            console.log(`🌐 測試網址: ${baseUrl}`);
            
            // 測試主要端點
            const mainTest = await this.testUrl(baseUrl, '/');
            const healthTest = await this.testUrl(baseUrl, '/api/health');
            
            if (mainTest.success) {
                if (mainTest.isProduction) {
                    console.log(`🎉 找到運行中的生產服務！`);
                    console.log(`   狀態: ${mainTest.status}`);
                    console.log(`   類型: 生產環境`);
                    
                    // 測試所有端點
                    const allTests = [];
                    for (const endpoint of this.endpoints) {
                        const test = await this.testUrl(baseUrl, endpoint);
                        allTests.push(test);
                        console.log(`   ${endpoint}: ${test.success ? '✅' : '❌'} ${test.status}`);
                    }
                    
                    results.push({
                        baseUrl,
                        status: 'PRODUCTION_READY',
                        tests: allTests,
                        workingEndpoints: allTests.filter(t => t.success).length,
                        totalEndpoints: allTests.length
                    });
                    
                    return { found: true, baseUrl, results: allTests };
                    
                } else if (mainTest.isPlaceholder) {
                    console.log(`⚠️ 仍是佔位頁面`);
                    results.push({
                        baseUrl,
                        status: 'PLACEHOLDER',
                        message: '構建可能仍在進行或失敗'
                    });
                } else {
                    console.log(`✅ 回應正常但內容未知`);
                    results.push({
                        baseUrl,
                        status: 'UNKNOWN_CONTENT',
                        httpStatus: mainTest.status
                    });
                }
            } else {
                console.log(`❌ 無法連接 (${mainTest.error || mainTest.status})`);
                results.push({
                    baseUrl,
                    status: 'CONNECTION_FAILED',
                    error: mainTest.error || mainTest.status
                });
            }
            console.log('');
        }
        
        return { found: false, results };
    }

    async generateStatusReport() {
        const checkResult = await this.findWorkingService();
        
        const report = {
            timestamp: new Date().toISOString(),
            deploymentAge: '15 minutes ago',
            region: 'europe-west1',
            projectId: 'adept-arbor-467807-t9',
            serviceName: 'employee-management-system',
            checkResults: checkResult,
            recommendations: []
        };

        if (checkResult.found) {
            report.status = 'SUCCESS';
            report.workingUrl = checkResult.baseUrl;
            report.message = '🎉 部署成功！服務正常運行';
            report.recommendations = [
                '✅ 服務已成功修復並運行',
                '🧪 測試登入功能: test/123456',
                '📊 驗證產品和庫存管理功能',
                '🎯 系統已可正常使用'
            ];
        } else {
            const placeholderCount = checkResult.results.filter(r => r.status === 'PLACEHOLDER').length;
            const failedCount = checkResult.results.filter(r => r.status === 'CONNECTION_FAILED').length;
            
            if (placeholderCount > 0) {
                report.status = 'BUILD_IN_PROGRESS';
                report.message = '🔄 構建仍在進行中，請稍候';
                report.recommendations = [
                    '⏰ 再等待 5-10 分鐘讓構建完成',
                    '🔍 檢查 Cloud Build 日誌確認進度',
                    '🔧 如果持續失敗，檢查 GitHub 代碼'
                ];
            } else if (failedCount === checkResult.results.length) {
                report.status = 'DEPLOYMENT_FAILED';
                report.message = '❌ 所有測試網址都無法連接';
                report.recommendations = [
                    '🔍 檢查 Cloud Run 服務實際網址',
                    '🔧 確認服務是否正確啟動',
                    '📋 查看 Cloud Run 日誌'
                ];
            } else {
                report.status = 'UNKNOWN';
                report.message = '❓ 無法確定服務狀態';
                report.recommendations = [
                    '🔍 手動檢查 Cloud Run 控制台',
                    '📋 查看詳細的部署日誌'
                ];
            }
        }

        console.log('📊 最新部署狀態報告');
        console.log('═'.repeat(50));
        console.log(`🎯 狀態: ${report.status}`);
        console.log(`📝 說明: ${report.message}`);
        console.log(`⏰ 部署時間: ${report.deploymentAge}`);
        console.log(`🌏 區域: ${report.region}`);
        
        if (report.workingUrl) {
            console.log(`🌐 工作網址: ${report.workingUrl}`);
        }
        
        console.log('\n🚀 建議行動:');
        report.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        return report;
    }
}

// 立即執行檢查
async function main() {
    const checker = new LatestDeploymentChecker();
    const report = await checker.generateStatusReport();
    
    const fs = require('fs').promises;
    await fs.writeFile('latest-deployment-status.json', JSON.stringify(report, null, 2));
    console.log('\n📄 詳細報告已保存: latest-deployment-status.json');
    
    if (report.status === 'SUCCESS') {
        console.log('\n🎉 恭喜！您的 Google Cloud 部署已成功完成！');
        console.log(`🔗 立即訪問: ${report.workingUrl}`);
        console.log('🧪 測試帳號: test/123456, demo/demo, admin/admin123');
    } else {
        console.log('\n⏰ 部署可能仍在進行中，建議稍後再次檢查');
    }
    
    return report;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LatestDeploymentChecker;
// 🔍 Google Cloud 服務驗證工具
// 全面檢查部署狀態並提供解決方案

const https = require('https');

class GCloudServiceVerifier {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.endpoints = [
            '/',
            '/api/health',
            '/api/products',
            '/api/inventory', 
            '/api/login',
            '/api/accounts'
        ];
        this.results = [];
    }

    async testEndpoint(path) {
        return new Promise((resolve) => {
            const url = this.serviceUrl + path;
            console.log(`🔍 測試: ${url}`);
            
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        path,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        contentLength: data.length,
                        isPlaceholder: data.includes('placeholder') || data.includes('unicorn'),
                        isProduction: data.includes('Google Cloud') && data.includes('企業管理'),
                        timestamp: new Date().toISOString()
                    };
                    
                    if (result.isPlaceholder) {
                        console.log(`⚠️ ${path}: 佔位頁面 (構建可能仍在進行)`);
                    } else if (result.isProduction) {
                        console.log(`✅ ${path}: 生產服務正常`);
                    } else {
                        console.log(`${result.success ? '✅' : '❌'} ${path}: ${res.statusCode}`);
                    }
                    
                    resolve(result);
                });
            });
            
            req.on('error', (error) => {
                console.log(`❌ ${path}: ${error.message}`);
                resolve({
                    path,
                    status: 0,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                resolve({
                    path,
                    status: 0,
                    success: false,
                    error: 'timeout',
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    async checkServiceStatus() {
        console.log('🚀 Google Cloud 服務狀態檢查');
        console.log('═'.repeat(60));
        console.log(`📍 服務網址: ${this.serviceUrl}`);
        console.log(`⏰ 檢查時間: ${new Date().toLocaleString('zh-TW')}`);
        console.log('');
        
        // 並行測試所有端點
        const promises = this.endpoints.map(endpoint => this.testEndpoint(endpoint));
        this.results = await Promise.all(promises);
        
        return this.analyzeResults();
    }

    analyzeResults() {
        const placeholderCount = this.results.filter(r => r.isPlaceholder).length;
        const productionCount = this.results.filter(r => r.isProduction).length;
        const errorCount = this.results.filter(r => !r.success).length;
        const successCount = this.results.filter(r => r.success).length;
        
        let status = 'UNKNOWN';
        let message = '';
        let nextActions = [];
        
        if (placeholderCount > 0) {
            status = 'BUILD_IN_PROGRESS';
            message = '🔄 構建正在進行中，顯示佔位頁面';
            nextActions = [
                '⏰ 等待 2-3 分鐘讓構建完成',
                '🔍 檢查 Cloud Build 日誌',
                '🔄 如果超過 10 分鐘仍是佔位頁面，需要檢查構建錯誤'
            ];
        } else if (productionCount > 0) {
            status = 'PRODUCTION_READY';
            message = '🎉 生產服務已成功部署並運行';
            nextActions = [
                '✅ 服務完全正常，可以使用',
                '🧪 測試登入功能: test/123456',
                '📊 驗證所有業務功能'
            ];
        } else if (errorCount === this.results.length) {
            status = 'SERVICE_DOWN';
            message = '❌ 服務完全無法訪問';
            nextActions = [
                '🔧 檢查 Cloud Run 服務狀態',
                '📋 查看最新構建日誌',
                '🔄 觸發重新部署'
            ];
        } else {
            status = 'PARTIAL_SUCCESS';
            message = '⚠️ 部分端點正常，部分異常';
            nextActions = [
                '🔍 檢查異常端點的具體錯誤',
                '🔧 修復路由或功能問題'
            ];
        }

        const report = {
            timestamp: new Date().toISOString(),
            serviceUrl: this.serviceUrl,
            status,
            message,
            statistics: {
                totalEndpoints: this.results.length,
                successfulEndpoints: successCount,
                placeholderPages: placeholderCount,
                productionPages: productionCount,
                errorEndpoints: errorCount,
                successRate: Math.round((successCount / this.results.length) * 100)
            },
            results: this.results,
            nextActions,
            troubleshooting: {
                buildInProgress: placeholderCount > 0,
                needsToWait: placeholderCount > 0,
                needsToDebug: errorCount > successCount,
                readyToUse: productionCount > 0
            }
        };

        console.log('\n📊 檢查結果摘要:');
        console.log(`🎯 狀態: ${status}`);
        console.log(`📝 說明: ${message}`);
        console.log(`📈 成功率: ${report.statistics.successRate}%`);
        console.log(`🔍 詳細結果:`);
        console.log(`   - 成功端點: ${successCount}/${this.results.length}`);
        console.log(`   - 佔位頁面: ${placeholderCount}`);
        console.log(`   - 生產頁面: ${productionCount}`);
        console.log(`   - 錯誤端點: ${errorCount}`);

        console.log('\n🚀 建議行動:');
        nextActions.forEach((action, i) => {
            console.log(`   ${i + 1}. ${action}`);
        });

        if (report.troubleshooting.buildInProgress) {
            console.log('\n💡 重要提示:');
            console.log('   🔄 檢測到佔位頁面，表示構建正在進行中');
            console.log('   ⏰ 通常需要 3-8 分鐘完成構建和部署');
            console.log('   🎯 構建完成後所有功能將自動可用');
        }

        return report;
    }

    async generateDetailedReport() {
        const analysis = await this.checkServiceStatus();
        
        // 保存詳細報告
        const fs = require('fs').promises;
        await fs.writeFile('gcloud-service-status-report.json', JSON.stringify(analysis, null, 2));
        console.log('\n📄 詳細報告已保存: gcloud-service-status-report.json');
        
        return analysis;
    }
}

// 立即執行檢查
async function main() {
    const verifier = new GCloudServiceVerifier();
    const report = await verifier.generateDetailedReport();
    
    console.log('\n🎯 Google Cloud 服務驗證完成！');
    
    if (report.troubleshooting.readyToUse) {
        console.log('🎉 恭喜！您的企業管理系統已成功部署到 Google Cloud');
        console.log('🔗 立即訪問: https://employee-management-system-213410885168.europe-west1.run.app');
    } else if (report.troubleshooting.buildInProgress) {
        console.log('⏰ 系統正在構建中，請稍後再次檢查');
        console.log('🔄 建議 5 分鐘後重新運行此檢查工具');
    } else {
        console.log('🔧 系統需要進一步調試，請參考建議行動');
    }
    
    return report;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = GCloudServiceVerifier;
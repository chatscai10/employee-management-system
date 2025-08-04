// 🧠 智慧驗證系統 - 真實網址深度驗證
// 自動檢測並修復 Vercel 部署問題

const https = require('https');
const http = require('http');

class SmartVerificationSystem {
    constructor() {
        this.baseUrl = 'https://employee-management-system.vercel.app';
        this.endpoints = [
            '/',
            '/api',
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
            const url = this.baseUrl + path;
            console.log(`🔍 測試端點: ${url}`);
            
            const req = https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        path,
                        status: res.statusCode,
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        contentLength: data.length,
                        hasContent: data.length > 0,
                        timestamp: new Date().toISOString()
                    };
                    
                    if (data.includes('v3.1.0') || data.includes('智慧修復')) {
                        result.smartFixDetected = true;
                    }
                    
                    console.log(`${result.success ? '✅' : '❌'} ${path}: ${res.statusCode}`);
                    resolve(result);
                });
            });
            
            req.on('error', (error) => {
                console.log(`❌ ${path}: 連接失敗 - ${error.message}`);
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
                console.log(`⏰ ${path}: 超時`);
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

    async runVerification() {
        console.log('🚀 啟動智慧驗證系統 v3.1.0');
        console.log(`📍 目標網址: ${this.baseUrl}`);
        console.log('─'.repeat(60));
        
        // 並行測試所有端點
        const promises = this.endpoints.map(endpoint => this.testEndpoint(endpoint));
        this.results = await Promise.all(promises);
        
        return this.generateReport();
    }

    generateReport() {
        const successCount = this.results.filter(r => r.success).length;
        const totalCount = this.results.length;
        const successRate = Math.round((successCount / totalCount) * 100);
        
        const report = {
            summary: {
                totalEndpoints: totalCount,
                successfulEndpoints: successCount,
                failedEndpoints: totalCount - successCount,
                successRate: successRate,
                systemStatus: successRate >= 80 ? 'healthy' : 'needs_attention',
                verificationTime: new Date().toISOString()
            },
            details: this.results,
            recommendations: this.generateRecommendations(successRate)
        };
        
        console.log('\n📊 驗證結果摘要:');
        console.log(`✅ 成功端點: ${successCount}/${totalCount}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log(`🏥 系統狀態: ${report.summary.systemStatus}`);
        
        if (successRate < 100) {
            console.log('\n❌ 失敗端點:');
            this.results.filter(r => !r.success).forEach(result => {
                console.log(`   - ${result.path}: ${result.error || result.status}`);
            });
        }
        
        return report;
    }

    generateRecommendations(successRate) {
        const recommendations = [];
        
        if (successRate < 50) {
            recommendations.push('🚨 系統可能未正確部署，建議檢查 Vercel 配置');
            recommendations.push('🔧 確認 api/index.js 和 vercel.json 是否正確推送');
            recommendations.push('🔄 建議重新部署整個系統');
        } else if (successRate < 80) {
            recommendations.push('⚠️ 部分端點失效，建議檢查路由配置');
            recommendations.push('🔍 檢查無伺服器函數是否正確啟動');
        } else if (successRate < 100) {
            recommendations.push('🎯 系統基本正常，僅需微調個別端點');
            recommendations.push('✨ 建議進行完整功能測試');
        } else {
            recommendations.push('🎉 所有端點完全正常！');
            recommendations.push('🚀 系統已成功修復並穩定運行');
            recommendations.push('✅ 可進行生產環境使用');
        }
        
        return recommendations;
    }

    async saveReport(report) {
        const fs = require('fs').promises;
        const filename = `verification-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        try {
            await fs.writeFile(filename, JSON.stringify(report, null, 2));
            console.log(`📄 報告已保存: ${filename}`);
        } catch (error) {
            console.log(`❌ 保存報告失敗: ${error.message}`);
        }
        
        return report;
    }
}

// 立即執行驗證
async function main() {
    const verifier = new SmartVerificationSystem();
    
    try {
        const report = await verifier.runVerification();
        await verifier.saveReport(report);
        
        console.log('\n🎯 智慧驗證完成！');
        console.log('📋 詳細報告已生成');
        
        return report;
    } catch (error) {
        console.error('❌ 驗證系統錯誤:', error);
        return { error: error.message };
    }
}

if (require.main === module) {
    main().then(report => {
        process.exit(report.error ? 1 : 0);
    });
}

module.exports = SmartVerificationSystem;
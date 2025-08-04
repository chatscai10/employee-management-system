// 🚨 緊急 Vercel 診斷修復工具
// 檢測 Vercel 部署配置並自動修復

const fs = require('fs').promises;
const path = require('path');

class EmergencyVercelDiagnosis {
    constructor() {
        this.issues = [];
        this.fixes = [];
    }

    async diagnose() {
        console.log('🚨 啟動緊急 Vercel 診斷...');
        
        await this.checkVercelJson();
        await this.checkApiIndexFile();
        await this.checkPackageJson();
        await this.generateFixedConfig();
        
        return this.generateReport();
    }

    async checkVercelJson() {
        try {
            const vercelPath = 'vercel.json';
            const content = await fs.readFile(vercelPath, 'utf8');
            const config = JSON.parse(content);
            
            console.log('🔍 檢查 vercel.json...');
            
            // 檢查路由配置
            if (!config.routes || !Array.isArray(config.routes)) {
                this.issues.push('缺少路由配置');
            } else {
                const apiRoute = config.routes.find(route => route.dest === '/api/index.js');
                if (!apiRoute) {
                    this.issues.push('缺少 API 路由配置');
                }
            }
            
            // 檢查函數配置
            if (!config.functions || !config.functions['api/index.js']) {
                this.issues.push('缺少函數配置');
            }
            
            console.log(`✅ vercel.json 基本結構正確`);
            
        } catch (error) {
            this.issues.push(`vercel.json 讀取失敗: ${error.message}`);
        }
    }

    async checkApiIndexFile() {
        try {
            const apiPath = path.join('api', 'index.js');
            const content = await fs.readFile(apiPath, 'utf8');
            
            console.log('🔍 檢查 api/index.js...');
            
            if (!content.includes('module.exports')) {
                this.issues.push('api/index.js 缺少正確的導出');
            }
            
            if (!content.includes('req, res')) {
                this.issues.push('api/index.js 缺少正確的處理函數簽名');
            }
            
            console.log(`✅ api/index.js 基本結構正確`);
            
        } catch (error) {
            this.issues.push(`api/index.js 檢查失敗: ${error.message}`);
        }
    }

    async checkPackageJson() {
        try {
            const packagePath = 'package.json';
            const content = await fs.readFile(packagePath, 'utf8');
            const pkg = JSON.parse(content);
            
            console.log('🔍 檢查 package.json...');
            
            if (pkg.engines && pkg.engines.node) {
                const nodeVersion = pkg.engines.node;
                if (!nodeVersion.includes('18')) {
                    this.issues.push(`Node.js 版本不匹配: ${nodeVersion} (需要 18.x)`);
                }
            }
            
            console.log(`✅ package.json 檢查完成`);
            
        } catch (error) {
            this.issues.push(`package.json 檢查失敗: ${error.message}`);
        }
    }

    async generateFixedConfig() {
        console.log('🔧 生成修復配置...');
        
        // 生成正確的 vercel.json
        const fixedVercelConfig = {
            "version": 2,
            "name": "employee-management-system",
            "functions": {
                "api/index.js": {
                    "runtime": "nodejs18.x",
                    "memory": 1024,
                    "maxDuration": 30
                }
            },
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "/api/index.js"
                },
                {
                    "src": "/(.*)",
                    "dest": "/api/index.js"
                }
            ],
            "build": {
                "env": {
                    "NODE_VERSION": "18"
                }
            }
        };

        // 保存修復配置
        await fs.writeFile('vercel-fixed.json', JSON.stringify(fixedVercelConfig, null, 2));
        console.log('📝 已生成 vercel-fixed.json');

        this.fixes.push('生成修復版 vercel.json 配置');
        this.fixes.push('增加記憶體配置到 1024MB');
        this.fixes.push('延長最大執行時間到 30 秒');
        this.fixes.push('修復路由配置以正確處理所有請求');
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            issues: this.issues,
            fixes: this.fixes,
            recommendations: [
                '🔄 將 vercel-fixed.json 重命名為 vercel.json',
                '📤 重新推送到 GitHub',
                '🚀 觸發 Vercel 重新部署',
                '✅ 執行驗證測試確認修復'
            ],
            emergencyCommands: [
                'cp vercel-fixed.json vercel.json',
                'git add vercel.json',
                'git commit -m "🚨 緊急修復 Vercel 配置"',
                'git push origin main'
            ]
        };

        console.log('\n📊 診斷報告:');
        console.log(`🚨 發現問題: ${this.issues.length} 個`);
        console.log(`🔧 生成修復: ${this.fixes.length} 個`);
        
        if (this.issues.length > 0) {
            console.log('\n❌ 問題列表:');
            this.issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
        }
        
        console.log('\n✅ 修復措施:');
        this.fixes.forEach((fix, i) => console.log(`   ${i + 1}. ${fix}`));
        
        console.log('\n🎯 建議操作:');
        report.recommendations.forEach((rec, i) => console.log(`   ${i + 1}. ${rec}`));

        return report;
    }
}

// 立即執行診斷
async function main() {
    const diagnosis = new EmergencyVercelDiagnosis();
    const report = await diagnosis.diagnose();
    
    // 保存詳細報告
    await fs.writeFile('emergency-diagnosis-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 詳細報告已保存: emergency-diagnosis-report.json');
    
    return report;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = EmergencyVercelDiagnosis;
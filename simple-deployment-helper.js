// 🤖 簡化版部署助手
// 提供Railway和Vercel部署的詳細指引

const fs = require('fs');
const https = require('https');

class SimpleDeploymentHelper {
    constructor() {
        this.platforms = {
            railway: 'https://railway.app',
            vercel: 'https://vercel.com'
        };
    }

    async testCurrentStatus() {
        console.log('🔍 測試當前三平台狀態...');
        
        const platforms = [
            { name: 'Render', url: 'https://employee-management-system-v6hs.onrender.com' },
            { name: 'Railway', url: 'https://web-production-ce1db.up.railway.app' },
            { name: 'Vercel', url: 'https://employee-management-system-git-b68a0f-chatscai10-4188s-projects.vercel.app' }
        ];
        
        for (const platform of platforms) {
            try {
                const response = await this.makeRequest(platform.url + '/health');
                if (response.status === 200) {
                    console.log(`  ✅ ${platform.name}: 正常運作`);
                } else {
                    console.log(`  ❌ ${platform.name}: HTTP ${response.status}`);
                }
            } catch (error) {
                console.log(`  ❌ ${platform.name}: 連接失敗`);
            }
        }
    }

    async makeRequest(url) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                resolve({ status: res.statusCode });
            });
            
            req.on('error', () => resolve({ status: 0 }));
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0 });
            });
            
            req.end();
        });
    }

    generateRailwayInstructions() {
        console.log('\\n🚂 =============== Railway 部署指引 ===============');
        console.log('📋 配置文件已準備: railway.toml, nixpacks.toml');
        console.log('');
        console.log('📝 部署步驟:');
        console.log('  1. 🌍 訪問 https://railway.app');
        console.log('  2. 🔑 使用GitHub帳號登入');
        console.log('  3. ➕ 點擊 "New Project" 按鈕');
        console.log('  4. 📂 選擇 "Deploy from GitHub repo"');
        console.log('  5. 🔗 選擇 chatscai10/employee-management-system 倉庫');
        console.log('  6. ⚙️ Railway自動檢測配置並開始部署');
        console.log('  7. ⏳ 等待3-5分鐘完成部署');
        console.log('  8. 🔗 複製部署URL (https://xxx.up.railway.app)');
        console.log('  9. ✅ 測試健康檢查: [URL]/health');
        console.log('  10. 🔐 測試登入功能: [URL]/login');
        console.log('');
        console.log('💡 故障排除:');
        console.log('  - 如果倉庫未顯示，檢查GitHub權限');
        console.log('  - 如果部署失敗，檢查部署日誌');
        console.log('  - 確保PORT配置正確');
    }

    generateVercelInstructions() {
        console.log('\\n⚡ =============== Vercel 部署指引 ===============');
        console.log('📋 配置文件已準備: vercel.json, api/index.js');
        console.log('');
        console.log('📝 部署步驟:');
        console.log('  1. 🌍 訪問 https://vercel.com');
        console.log('  2. 🔑 使用GitHub帳號登入');
        console.log('  3. ➕ 點擊 "New Project" 按鈕');
        console.log('  4. 📂 選擇 "Import Git Repository"');
        console.log('  5. 🔍 搜索並選擇 employee-management-system 倉庫');
        console.log('  6. ⚙️ 確認配置設定並點擊Deploy');
        console.log('  7. ⏳ 等待1-3分鐘完成Serverless部署');
        console.log('  8. 🔗 複製部署URL (https://xxx.vercel.app)');
        console.log('  9. 🔌 測試API端點: [URL]/api/system/status');
        console.log('  10. 🔐 測試登入功能: [URL]/login');
        console.log('');
        console.log('💡 故障排除:');
        console.log('  - 如果建置失敗，檢查Node.js版本配置');
        console.log('  - 如果函數超時，檢查serverless配置');
        console.log('  - 確保路由配置正確');
    }

    generateCompletionChecklist() {
        console.log('\\n📋 =============== 部署完成檢查清單 ===============');
        console.log('');
        console.log('✅ 準備工作:');
        console.log('  □ 配置文件已生成 (railway.toml, vercel.json等)');
        console.log('  □ 代碼已推送到GitHub');
        console.log('  □ Render平台運作正常');
        console.log('');
        console.log('🚂 Railway部署:');
        console.log('  □ 訪問Railway.app並登入');
        console.log('  □ 創建新專案並連接倉庫');
        console.log('  □ 等待部署完成');
        console.log('  □ 獲取並測試部署URL');
        console.log('');
        console.log('⚡ Vercel部署:');
        console.log('  □ 訪問Vercel.com並登入');
        console.log('  □ 創建新專案並導入倉庫');
        console.log('  □ 等待Serverless部署完成');
        console.log('  □ 獲取並測試部署URL');
        console.log('');
        console.log('🔍 最終驗證:');
        console.log('  □ 運行三平台測試工具');
        console.log('  □ 測試所有用戶登入流程');
        console.log('  □ 確認三個平台都正常運作');
        console.log('  □ 生成最終驗證報告');
    }

    async executeHelper() {
        console.log('🤖 啟動簡化版部署助手');
        console.log('📅 時間:', new Date().toLocaleString());
        
        // 1. 測試當前狀態
        await this.testCurrentStatus();
        
        // 2. 顯示部署指引
        this.generateRailwayInstructions();
        this.generateVercelInstructions();
        this.generateCompletionChecklist();
        
        console.log('\\n🎯 =============== 部署助手摘要 ===============');
        console.log('📋 已提供詳細的部署指引');
        console.log('🔧 所有必要的配置文件已準備好');
        console.log('🎯 按照指引完成手動部署');
        console.log('✅ 使用驗證工具確認部署成功');
        console.log('');
        console.log('🚀 準備好開始部署！請按照上述指引操作。');
    }
}

// 執行部署助手
async function runHelper() {
    const helper = new SimpleDeploymentHelper();
    await helper.executeHelper();
}

if (require.main === module) {
    runHelper().catch(console.error);
}

module.exports = SimpleDeploymentHelper;
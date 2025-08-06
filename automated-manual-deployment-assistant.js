// 🤖 自動化手動部署助手
// 智能指導用戶完成Railway和Vercel平台的手動部署

const fs = require('fs');
const https = require('https');

class AutomatedManualDeploymentAssistant {
    constructor() {
        this.deploymentSteps = {
            railway: {
                platform: 'Railway',
                url: 'https://railway.app',
                difficulty: 'Easy',
                estimatedTime: '5-10 minutes',
                configFiles: ['railway.toml', 'nixpacks.toml'],
                steps: [
                    {
                        step: 1,
                        title: '打開Railway網站',
                        action: '在瀏覽器中訪問 https://railway.app',
                        description: '使用您的GitHub帳號登入Railway平台',
                        tips: ['確保您已登入GitHub', '選擇GitHub登入選項']
                    },
                    {
                        step: 2,
                        title: '創建新專案',
                        action: '點擊 "New Project" 按鈕',
                        description: '開始創建新的Railway專案',
                        tips: ['新專案按鈕通常在頁面右上角', '如果沒看到可嘗試刷新頁面']
                    },
                    {
                        step: 3,
                        title: '連接GitHub倉庫',
                        action: '選擇 "Deploy from GitHub repo"',
                        description: '選擇當前的企業管理系統倉庫',
                        tips: ['選擇 chatscai10/employee-management-system', '如果看不到倉庫，檢查GitHub權限']
                    },
                    {
                        step: 4,
                        title: '確認部署配置',
                        action: 'Railway自動檢測配置並開始部署',
                        description: 'Railway會使用我們生成的railway.toml配置',
                        tips: ['等待自動檢測完成', '確認顯示為Node.js項目']
                    },
                    {
                        step: 5,
                        title: '等待部署完成',
                        action: '監控部署進度',
                        description: '通常需要3-5分鐘完成首次部署',
                        tips: ['查看部署日誌確認沒有錯誤', '等待狀態變為 "Active"']
                    },
                    {
                        step: 6,
                        title: '獲取部署URL',
                        action: '複製Railway提供的公開URL',
                        description: '格式類似: https://xxx.up.railway.app',
                        tips: ['URL通常在專案設定中', '測試URL是否可以正常訪問']
                    }
                ]
            },
            vercel: {
                platform: 'Vercel',
                url: 'https://vercel.com',
                difficulty: 'Easy',
                estimatedTime: '5-10 minutes',
                configFiles: ['vercel.json', 'api/index.js'],
                steps: [
                    {
                        step: 1,
                        title: '打開Vercel網站',
                        action: '在瀏覽器中訪問 https://vercel.com',
                        description: '使用您的GitHub帳號登入Vercel平台',
                        tips: ['確保您已登入GitHub', '選擇 "Continue with GitHub"']
                    },
                    {
                        step: 2,
                        title: '創建新專案',
                        action: '點擊 "New Project" 按鈕',
                        description: '開始創建新的Vercel專案',
                        tips: ['新專案按鈕在控制台首頁', '可能顯示為 "Add New..."']
                    },
                    {
                        step: 3,
                        title: '導入GitHub倉庫',
                        action: '選擇 "Import Git Repository"',
                        description: '找到並選擇企業管理系統倉庫',
                        tips: ['搜索 employee-management-system', '選擇 chatscai10 帳號下的倉庫']
                    },
                    {
                        step: 4,
                        title: '配置專案設定',
                        action: '確認專案配置並點擊Deploy',
                        description: 'Vercel會自動檢測Node.js專案和vercel.json配置',
                        tips: ['確認Framework選擇為 "Other"', '建置指令可以保持預設']
                    },
                    {
                        step: 5,
                        title: '等待部署完成',
                        action: '監控Serverless部署進度',
                        description: 'Vercel部署通常非常快速，1-3分鐘完成',
                        tips: ['觀察部署日誌', '等待出現慶祝動畫']
                    },
                    {
                        step: 6,
                        title: '獲取部署URL',
                        action: '複製Vercel提供的部署URL',
                        description: '格式類似: https://xxx.vercel.app',
                        tips: ['URL會自動顯示', '可以立即點擊測試']
                    }
                ]
            }
        };
        
        this.troubleshooting = {
            railway: [
                {
                    problem: '部署失敗：端口綁定錯誤',
                    solution: '確認railway.toml中的PORT配置正確',
                    checkFiles: ['railway.toml']
                },
                {
                    problem: '健康檢查失敗',
                    solution: '確認/health端點可以正常響應',
                    testUrl: '/health'
                },
                {
                    problem: '倉庫未顯示',
                    solution: '檢查GitHub權限，確保Railway有訪問權限',
                    action: '重新授權GitHub連接'
                }
            ],
            vercel: [
                {
                    problem: '建置失敗：Runtime錯誤',
                    solution: '檢查vercel.json中的Node.js版本配置',
                    checkFiles: ['vercel.json']
                },
                {
                    problem: '函數超時',
                    solution: '確認serverless函數配置正確',
                    checkFiles: ['api/index.js']
                },
                {
                    problem: '路由404錯誤',
                    solution: '檢查vercel.json中的路由配置',
                    checkFiles: ['vercel.json']
                }
            ]
        };
    }

    generateInteractiveGuide() {
        console.log('🤖 生成互動式部署指南...');
        
        const guideHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 智慧部署助手 - Railway & Vercel 部署指南</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
            padding: 2rem;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e9ecef;
        }
        .platform-selector {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            justify-content: center;
        }
        .platform-btn {
            padding: 1rem 2rem;
            border: 2px solid #3498db;
            background: white;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
            transition: all 0.3s;
        }
        .platform-btn:hover {
            background: #3498db;
            color: white;
        }
        .platform-btn.active {
            background: #3498db;
            color: white;
        }
        .guide-content {
            display: none;
            margin-top: 2rem;
        }
        .guide-content.active {
            display: block;
        }
        .step {
            background: #f8f9fa;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 10px;
            border-left: 5px solid #28a745;
        }
        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }
        .step-number {
            background: #28a745;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            font-weight: bold;
        }
        .step-title {
            font-size: 1.2rem;
            font-weight: bold;
            color: #2c3e50;
        }
        .step-action {
            color: #e74c3c;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .step-description {
            color: #666;
            margin-bottom: 1rem;
        }
        .tips {
            background: #e8f6ff;
            padding: 1rem;
            border-radius: 5px;
            border-left: 3px solid #3498db;
        }
        .tip-item {
            color: #2980b9;
            margin-bottom: 0.5rem;
        }
        .progress {
            background: #e9ecef;
            height: 20px;
            border-radius: 10px;
            margin: 1rem 0;
            overflow: hidden;
        }
        .progress-bar {
            background: linear-gradient(45deg, #28a745, #20c997);
            height: 100%;
            width: 0%;
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .complete-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
            font-weight: bold;
        }
        .complete-btn:hover {
            background: #218838;
        }
        .troubleshooting {
            background: #fff3cd;
            padding: 1rem;
            border-radius: 5px;
            border-left: 3px solid #ffc107;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 智慧部署助手</h1>
            <p>自動化手動部署指南 - Railway & Vercel 平台</p>
            <p style="color: #666; margin-top: 0.5rem;">📅 ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="platform-selector">
            <button class="platform-btn" onclick="showPlatform('railway')">🚂 Railway 部署</button>
            <button class="platform-btn" onclick="showPlatform('vercel')">⚡ Vercel 部署</button>
        </div>
        
        <div id="railway-guide" class="guide-content">
            <h2>🚂 Railway 平台部署指南</h2>
            <p><strong>預估時間:</strong> 5-10 分鐘 | <strong>難度:</strong> 簡單</p>
            <div class="progress">
                <div class="progress-bar" id="railway-progress"></div>
            </div>
            <div id="railway-steps"></div>
        </div>
        
        <div id="vercel-guide" class="guide-content">
            <h2>⚡ Vercel 平台部署指南</h2>
            <p><strong>預估時間:</strong> 5-10 分鐘 | <strong>難度:</strong> 簡單</p>
            <div class="progress">
                <div class="progress-bar" id="vercel-progress"></div>
            </div>
            <div id="vercel-steps"></div>
        </div>
    </div>
    
    <script>
        let currentPlatform = null;
        let completedSteps = { railway: 0, vercel: 0 };
        
        const deploymentSteps = ${JSON.stringify(this.deploymentSteps, null, 2)};
        
        function showPlatform(platform) {
            currentPlatform = platform;
            
            // 更新按鈕狀態
            document.querySelectorAll('.platform-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // 顯示對應指南
            document.querySelectorAll('.guide-content').forEach(guide => {
                guide.classList.remove('active');
            });
            document.getElementById(platform + '-guide').classList.add('active');
            
            // 生成步驟
            generateSteps(platform);
        }
        
        function generateSteps(platform) {
            const steps = deploymentSteps[platform].steps;
            const stepsContainer = document.getElementById(platform + '-steps');
            
            stepsContainer.innerHTML = '';
            
            steps.forEach(step => {
                const stepDiv = document.createElement('div');
                stepDiv.className = 'step';
                stepDiv.innerHTML = \`
                    <div class="step-header">
                        <div class="step-number">${step.step}</div>
                        <div class="step-title">${step.title}</div>
                    </div>
                    <div class="step-action">👉 ${step.action}</div>
                    <div class="step-description">${step.description}</div>
                    <div class="tips">
                        <strong>💡 提示:</strong>
                        ${step.tips.map(tip => \`<div class="tip-item">• ${tip}</div>`).join('')}
                    </div>
                    <button class="complete-btn" onclick="completeStep('${platform}', ${step.step})">
                        ✅ 完成此步驟
                    </button>
                \`;
                
                stepsContainer.appendChild(stepDiv);
            });
        }
        
        function completeStep(platform, stepNumber) {
            if (stepNumber <= completedSteps[platform] + 1) {
                completedSteps[platform] = Math.max(completedSteps[platform], stepNumber);
                updateProgress(platform);
            }
        }
        
        function updateProgress(platform) {
            const totalSteps = deploymentSteps[platform].steps.length;
            const completed = completedSteps[platform];
            const percentage = (completed / totalSteps) * 100;
            
            document.getElementById(platform + '-progress').style.width = percentage + '%';
            
            if (completed === totalSteps) {
                alert('🎉 ' + deploymentSteps[platform].platform + ' 部署步驟完成！\\n\\n請檢查部署URL並測試功能。');
            }
        }
        
        // 預設顯示Railway
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelector('.platform-btn').click();
        });
    </script>
</body>
</html>`;
        
        fs.writeFileSync('interactive-deployment-guide.html', guideHtml);
        console.log('  ✅ 互動式部署指南已生成: interactive-deployment-guide.html');
        
        return 'interactive-deployment-guide.html';
    }

    generateDeploymentChecklist() {
        console.log('📋 生成部署檢查清單...');
        
        const checklist = {
            title: '🎯 智慧部署檢查清單',
            timestamp: new Date().toISOString(),
            preDeployment: {
                title: '部署前檢查',
                items: [
                    { task: '確認所有配置文件已生成', files: ['railway.toml', 'nixpacks.toml', 'vercel.json', 'api/index.js'] },
                    { task: '確認GitHub倉庫已更新', action: 'git push origin main' },
                    { task: '確認現有Render部署正常', url: 'https://employee-management-system-v6hs.onrender.com' },
                    { task: '準備GitHub帳號權限', note: '確保Railway和Vercel可以訪問倉庫' }
                ]
            },
            railwayDeployment: {
                title: '🚂 Railway 部署檢查',
                items: [
                    { step: 1, task: '訪問 https://railway.app', status: 'pending' },
                    { step: 2, task: '使用GitHub登入', status: 'pending' },
                    { step: 3, task: '創建新專案', status: 'pending' },
                    { step: 4, task: '連接GitHub倉庫', status: 'pending' },
                    { step: 5, task: '等待自動部署', status: 'pending' },
                    { step: 6, task: '獲取部署URL', expectedFormat: 'https://xxx.up.railway.app', status: 'pending' },
                    { step: 7, task: '測試健康檢查', testUrl: '[URL]/health', status: 'pending' },
                    { step: 8, task: '測試登入功能', testUrl: '[URL]/login', status: 'pending' }
                ]
            },
            vercelDeployment: {
                title: '⚡ Vercel 部署檢查',
                items: [
                    { step: 1, task: '訪問 https://vercel.com', status: 'pending' },
                    { step: 2, task: '使用GitHub登入', status: 'pending' },
                    { step: 3, task: '創建新專案', status: 'pending' },
                    { step: 4, task: '導入GitHub倉庫', status: 'pending' },
                    { step: 5, task: '確認配置設定', status: 'pending' },
                    { step: 6, task: '等待Serverless部署', status: 'pending' },
                    { step: 7, task: '獲取部署URL', expectedFormat: 'https://xxx.vercel.app', status: 'pending' },
                    { step: 8, task: '測試API端點', testUrl: '[URL]/api/system/status', status: 'pending' },
                    { step: 9, task: '測試登入功能', testUrl: '[URL]/login', status: 'pending' }
                ]
            },
            postDeployment: {
                title: '部署後驗證',
                items: [
                    { task: '運行三平台驗證測試', command: 'node simple-three-platform-tester.js' },
                    { task: '測試用戶登入流程', command: 'node user-login-flow-tester.js' },
                    { task: '檢查所有API端點', action: '測試各個功能模組' },
                    { task: '生成最終驗證報告', expected: '三個平台都正常運作' }
                ]
            }
        };
        
        const checklistFilename = `deployment-checklist-${Date.now()}.json`;
        fs.writeFileSync(checklistFilename, JSON.stringify(checklist, null, 2));
        
        console.log(`  ✅ 部署檢查清單已保存: ${checklistFilename}`);
        return checklistFilename;
    }

    async testCurrentDeploymentStatus() {
        console.log('🔍 測試當前部署狀態...');
        
        const platforms = [
            { name: 'Render', url: 'https://employee-management-system-v6hs.onrender.com' },
            { name: 'Railway', url: 'https://web-production-ce1db.up.railway.app' },
            { name: 'Vercel', url: 'https://employee-management-system-git-b68a0f-chatscai10-4188s-projects.vercel.app' }
        ];
        
        const results = {};
        
        for (const platform of platforms) {
            console.log(`  🌍 測試 ${platform.name}...`);
            
            try {
                const response = await this.makeRequest(platform.url + '/health');
                
                if (response.status === 200) {
                    console.log(`    ✅ ${platform.name}: 正常運作`);
                    results[platform.name] = { status: 'working', url: platform.url };
                } else {
                    console.log(`    ⚠️ ${platform.name}: HTTP ${response.status}`);
                    results[platform.name] = { status: 'issues', httpStatus: response.status, url: platform.url };
                }
            } catch (error) {
                console.log(`    ❌ ${platform.name}: 連接失敗`);
                results[platform.name] = { status: 'failed', error: error.message, url: platform.url };
            }
        }
        
        return results;
    }

    async makeRequest(url) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: 'GET',
                timeout: 10000
            };
            
            const req = https.request(options, (res) => {
                resolve({ status: res.statusCode });
            });
            
            req.on('error', (error) => {
                resolve({ status: 0, error: error.message });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, error: 'timeout' });
            });
            
            req.end();
        });
    }

    displayExecutionSummary() {
        console.log('\\n🎯 =============== 自動化手動部署助手執行摘要 ===============');
        console.log('📅 完成時間:', new Date().toLocaleString());
        
        console.log('\\n✅ 已生成工具:');
        console.log('  📋 互動式部署指南: interactive-deployment-guide.html');
        console.log('  📝 部署檢查清單: deployment-checklist-[timestamp].json');
        console.log('  🤖 自動化助手腳本: automated-manual-deployment-assistant.js');
        
        console.log('\\n🎯 下一步操作:');
        console.log('  1. 📖 打開 interactive-deployment-guide.html 獲得詳細指導');
        console.log('  2. 🚂 按照指南完成Railway平台部署');
        console.log('  3. ⚡ 按照指南完成Vercel平台部署');
        console.log('  4. ✅ 使用三平台驗證工具測試所有部署');
        
        console.log('\\n💡 使用建議:');
        console.log('  🌟 互動式指南提供逐步指導和進度追蹤');
        console.log('  📋 檢查清單確保所有步驟都已完成');
        console.log('  🔍 驗證工具確認部署成功並正常運作');
        
        console.log('\\n🎉 自動化手動部署助手準備完成！');
    }

    async executeAssistant() {
        console.log('🤖 啟動自動化手動部署助手');
        console.log('📅 執行時間:', new Date().toLocaleString());
        
        try {
            // 1. 測試當前狀態
            const currentStatus = await this.testCurrentDeploymentStatus();
            
            // 2. 生成互動式指南
            const guideFile = this.generateInteractiveGuide();
            
            // 3. 生成檢查清單
            const checklistFile = this.generateDeploymentChecklist();
            
            // 4. 顯示摘要
            this.displayExecutionSummary();
            
            return {
                success: true,
                currentStatus: currentStatus,
                generatedFiles: [guideFile, checklistFile],
                nextSteps: [
                    '打開 interactive-deployment-guide.html',
                    '按照指南完成Railway部署',
                    '按照指南完成Vercel部署',
                    '運行驗證測試確認成功'
                ]
            };
            
        } catch (error) {
            console.error('❌ 部署助手執行錯誤:', error);
            return { success: false, error: error.message };
        }
    }
}

// 執行自動化手動部署助手
async function runDeploymentAssistant() {
    const assistant = new AutomatedManualDeploymentAssistant();
    const result = await assistant.executeAssistant();
    return result;
}

// 如果直接執行此檔案
if (require.main === module) {
    runDeploymentAssistant().catch(console.error);
}

module.exports = AutomatedManualDeploymentAssistant;
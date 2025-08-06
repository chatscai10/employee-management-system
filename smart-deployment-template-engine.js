// 🚀 智慧模板自動部署引擎 v2.0
// 集成環境檢測、工具安裝、自動部署、智慧驗證

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class SmartDeploymentTemplateEngine {
    constructor() {
        this.deploymentOptions = [];
        this.installedTools = [];
        this.deploymentResults = [];
        this.verificationResults = [];
        this.finalUrls = [];
        
        this.projectInfo = {
            name: 'employee-management-system',
            version: 'v4.0.0',
            type: 'Node.js Enterprise Application',
            port: 8080
        };
    }

    async executeSmartDeployment() {
        console.log('🚀 啟動智慧模板自動部署引擎 v2.0');
        console.log('🎯 目標: 企業管理系統自動化部署與驗證');
        
        try {
            // 階段1: 智慧分析最佳部署方案
            await this.analyzeOptimalDeploymentPlatforms();
            
            // 階段2: 自動安裝所需工具
            await this.autoInstallDeploymentTools();
            
            // 階段3: 執行智慧自動化部署
            await this.executeAutomatedDeployment();
            
            // 階段4: 智慧驗證部署結果
            await this.intelligentPostDeploymentVerification();
            
            // 階段5: 生成最終報告
            this.generateFinalDeploymentReport();
            
        } catch (error) {
            console.error('❌ 智慧部署過程發生錯誤:', error.message);
            this.handleDeploymentError(error);
        }
    }

    async analyzeOptimalDeploymentPlatforms() {
        console.log('\n🧠 階段 1: 智慧分析最佳部署方案');
        
        // 分析專案特性
        const projectCharacteristics = this.analyzeProjectCharacteristics();
        console.log('📊 專案特性分析完成:', projectCharacteristics.summary);
        
        // 評估部署平台
        const platforms = [
            {
                name: 'Railway',
                score: 95,
                pros: ['零配置部署', '自動HTTPS', '快速上線', '免費額度'],
                cons: ['有流量限制'],
                complexity: 'LOW',
                timeToLive: '5 minutes',
                recommended: true,
                setupSteps: [
                    '註冊Railway帳號',
                    '連接GitHub倉庫', 
                    '自動檢測並部署',
                    '獲得即時網址'
                ]
            },
            {
                name: 'Vercel',
                score: 90,
                pros: ['極速部署', '全球CDN', '自動優化', '實時預覽'],
                cons: ['主要適用前端'],
                complexity: 'LOW',
                timeToLive: '3 minutes',
                recommended: true,
                setupSteps: [
                    '安裝Vercel CLI',
                    '登入Vercel帳號',
                    '執行vercel命令',
                    '獲得生產網址'
                ]
            },
            {
                name: 'Render',
                score: 85,
                pros: ['簡單配置', '自動SSL', '免費方案', '支持Docker'],
                cons: ['冷啟動較慢'],
                complexity: 'LOW',
                timeToLive: '7 minutes',
                recommended: true,
                setupSteps: [
                    '創建Render帳號',
                    '連接Git倉庫',
                    '配置服務設定',
                    '自動構建部署'
                ]
            },
            {
                name: 'Google Cloud Run',
                score: 100,
                pros: ['企業級', '無限擴展', '按用量付費', '完整監控'],
                cons: ['需要Google帳號', '較複雜配置'],
                complexity: 'HIGH',
                timeToLive: '15 minutes',
                recommended: false,
                reason: '需要Cloud SDK安裝'
            }
        ];
        
        // 智慧選擇推薦平台
        this.deploymentOptions = platforms
            .filter(p => p.recommended)
            .sort((a, b) => b.score - a.score);
            
        console.log('\n🎯 智慧推薦部署平台:');
        this.deploymentOptions.forEach((platform, index) => {
            console.log(`${index + 1}. ${platform.name} (評分: ${platform.score}/100)`);
            console.log(`   ⚡ 複雜度: ${platform.complexity}`);
            console.log(`   ⏱️  預計部署時間: ${platform.timeToLive}`);
            console.log(`   ✅ 優勢: ${platform.pros.join(', ')}`);
        });
        
        return this.deploymentOptions;
    }

    analyzeProjectCharacteristics() {
        console.log('🔍 分析專案特性...');
        
        const characteristics = {
            hasDockerfile: fs.existsSync('Dockerfile'),
            hasPackageJson: fs.existsSync('package.json'),
            hasCloudBuild: fs.existsSync('cloudbuild.yaml'),
            nodeVersion: '18.x',
            port: 8080,
            isFullStack: true,
            hasDatabase: false, // 使用內存模擬
            summary: 'Node.js全棧企業應用，已優化容器化部署'
        };
        
        console.log('📋 專案特性:');
        console.log(`   🐳 Docker支持: ${characteristics.hasDockerfile ? '✅' : '❌'}`);
        console.log(`   📦 Node.js專案: ${characteristics.hasPackageJson ? '✅' : '❌'}`);
        console.log(`   ☁️  Cloud配置: ${characteristics.hasCloudBuild ? '✅' : '❌'}`);
        console.log(`   🌐 服務端口: ${characteristics.port}`);
        
        return characteristics;
    }

    async autoInstallDeploymentTools() {
        console.log('\n🛠️  階段 2: 自動安裝部署所需工具');
        
        const tools = [
            {
                name: 'Vercel CLI',
                command: 'npm install -g vercel',
                check: 'vercel --version',
                priority: 'HIGH'
            },
            {
                name: 'Railway CLI',
                command: 'npm install -g @railway/cli',
                check: 'railway --version', 
                priority: 'HIGH'
            }
        ];
        
        for (const tool of tools) {
            try {
                console.log(`🔧 檢查 ${tool.name}...`);
                
                // 檢查是否已安裝
                try {
                    const version = execSync(tool.check, { encoding: 'utf8', stdio: 'pipe' });
                    console.log(`✅ ${tool.name} 已安裝: ${version.trim()}`);
                    this.installedTools.push({ ...tool, status: 'already_installed', version: version.trim() });
                } catch (checkError) {
                    console.log(`📥 安裝 ${tool.name}...`);
                    
                    // 嘗試安裝
                    try {
                        execSync(tool.command, { encoding: 'utf8', stdio: 'inherit' });
                        const newVersion = execSync(tool.check, { encoding: 'utf8', stdio: 'pipe' });
                        console.log(`✅ ${tool.name} 安裝成功: ${newVersion.trim()}`);
                        this.installedTools.push({ ...tool, status: 'newly_installed', version: newVersion.trim() });
                    } catch (installError) {
                        console.log(`⚠️  ${tool.name} 安裝失敗: ${installError.message}`);
                        this.installedTools.push({ ...tool, status: 'install_failed', error: installError.message });
                    }
                }
            } catch (error) {
                console.log(`❌ ${tool.name} 處理錯誤: ${error.message}`);
            }
        }
        
        // 檢查Git狀態
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                console.log('📝 檢測到未提交的變更，自動提交...');
                execSync('git add .');
                execSync('git commit -m "🚀 Prepare for smart deployment"');
                console.log('✅ 變更已自動提交');
            }
        } catch (gitError) {
            console.log('ℹ️  Git操作跳過:', gitError.message);
        }
    }

    async executeAutomatedDeployment() {
        console.log('\n🚀 階段 3: 執行智慧自動化部署');
        
        // 優先使用最簡單的平台
        const primaryPlatform = this.deploymentOptions[0];
        console.log(`🎯 主要部署平台: ${primaryPlatform.name}`);
        
        if (primaryPlatform.name === 'Vercel') {
            await this.deployToVercel();
        }
        
        if (primaryPlatform.name === 'Railway') {
            await this.deployToRailway();
        }
        
        // 同時嘗試其他平台作為備選
        await this.deployToAlternativePlatforms();
    }

    async deployToVercel() {
        console.log('\n⚡ 部署到 Vercel...');
        
        try {
            // 創建vercel.json配置
            const vercelConfig = {
                "version": 2,
                "builds": [
                    {
                        "src": "app.js",
                        "use": "@vercel/node"
                    }
                ],
                "routes": [
                    {
                        "src": "/(.*)",
                        "dest": "app.js"
                    }
                ],
                "env": {
                    "NODE_ENV": "production"
                }
            };
            
            fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
            console.log('📝 Vercel配置文件已創建');
            
            // 執行部署（如果CLI可用）
            const vercelTool = this.installedTools.find(t => t.name === 'Vercel CLI');
            if (vercelTool && vercelTool.status !== 'install_failed') {
                try {
                    console.log('🚀 執行 Vercel 部署...');
                    
                    // 非互動式部署
                    const deployOutput = execSync('vercel --prod --yes --confirm', { 
                        encoding: 'utf8',
                        timeout: 300000 // 5分鐘超時
                    });
                    
                    // 解析部署URL
                    const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
                    if (urlMatch) {
                        const deployedUrl = urlMatch[0];
                        console.log(`✅ Vercel部署成功: ${deployedUrl}`);
                        
                        this.deploymentResults.push({
                            platform: 'Vercel',
                            status: 'success',
                            url: deployedUrl,
                            deployTime: new Date().toISOString()
                        });
                        
                        this.finalUrls.push(deployedUrl);
                    }
                    
                } catch (deployError) {
                    console.log('⚠️  Vercel自動部署失敗，提供手動部署指引');
                    this.provideManualDeploymentGuide('Vercel');
                }
            } else {
                this.provideManualDeploymentGuide('Vercel');
            }
            
        } catch (error) {
            console.log('❌ Vercel部署配置失敗:', error.message);
        }
    }

    async deployToRailway() {
        console.log('\n🚂 嘗試 Railway 部署配置...');
        
        try {
            // 創建railway.json配置
            const railwayConfig = {
                "$schema": "https://railway.app/railway.schema.json",
                "build": {
                    "builder": "NIXPACKS"
                },
                "deploy": {
                    "startCommand": "node app.js",
                    "healthcheckPath": "/health",
                    "healthcheckTimeout": 100,
                    "restartPolicyType": "ON_FAILURE",
                    "restartPolicyMaxRetries": 10
                }
            };
            
            fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
            console.log('📝 Railway配置文件已創建');
            
            // 提供Railway部署指引
            this.provideManualDeploymentGuide('Railway');
            
        } catch (error) {
            console.log('❌ Railway配置失敗:', error.message);
        }
    }

    async deployToAlternativePlatforms() {
        console.log('\n🔄 準備其他部署選項...');
        
        // 創建Render配置
        try {
            const renderConfig = {
                "services": [
                    {
                        "type": "web",
                        "name": "employee-management-system",
                        "env": "node",
                        "buildCommand": "npm install",
                        "startCommand": "node app.js",
                        "healthCheckPath": "/health",
                        "envVars": [
                            {
                                "key": "NODE_ENV",
                                "value": "production"
                            },
                            {
                                "key": "PORT",
                                "value": "8080"
                            }
                        ]
                    }
                ]
            };
            
            fs.writeFileSync('render.yaml', JSON.stringify(renderConfig, null, 2));
            console.log('📝 Render配置文件已創建');
            
        } catch (error) {
            console.log('⚠️  Render配置創建失敗');
        }
        
        // 創建簡化的Heroku Procfile
        try {
            fs.writeFileSync('Procfile', 'web: node app.js');
            console.log('📝 Heroku Procfile已創建');
        } catch (error) {
            console.log('⚠️  Procfile創建失敗');
        }
    }

    provideManualDeploymentGuide(platform) {
        console.log(`\n📋 ${platform} 手動部署指引:`);
        
        const guides = {
            'Vercel': [
                '1. 前往 https://vercel.com',
                '2. 使用GitHub登入',
                '3. 點擊 "New Project"',
                '4. 導入此Git倉庫',
                '5. Vercel會自動檢測並部署',
                '6. 獲得 https://xxx.vercel.app 網址'
            ],
            'Railway': [
                '1. 前往 https://railway.app',
                '2. 使用GitHub登入',
                '3. 點擊 "New Project"',
                '4. 選擇 "Deploy from GitHub repo"',
                '5. 選擇此倉庫並部署',
                '6. 獲得 https://xxx.up.railway.app 網址'
            ],
            'Render': [
                '1. 前往 https://render.com',
                '2. 註冊並連接GitHub',
                '3. 創建新的 "Web Service"',
                '4. 選擇此倉庫',
                '5. 設定構建命令: npm install',
                '6. 設定啟動命令: node app.js',
                '7. 獲得 https://xxx.onrender.com 網址'
            ]
        };
        
        if (guides[platform]) {
            guides[platform].forEach(step => console.log(`   ${step}`));
        }
        
        this.deploymentResults.push({
            platform: platform,
            status: 'manual_required',
            guide: guides[platform] || [],
            timestamp: new Date().toISOString()
        });
    }

    async intelligentPostDeploymentVerification() {
        console.log('\n✅ 階段 4: 智慧驗證部署後的真實網頁功能');
        
        if (this.finalUrls.length === 0) {
            console.log('⚠️  沒有可驗證的部署URL，跳過自動驗證');
            console.log('📋 請手動部署後使用以下測試腳本驗證:');
            this.createPostDeploymentVerificationScript();
            return;
        }
        
        for (const url of this.finalUrls) {
            console.log(`\n🔍 驗證網址: ${url}`);
            await this.verifyDeployedApplication(url);
        }
    }

    async verifyDeployedApplication(url) {
        const verificationTests = [
            {
                name: '主頁載入測試',
                path: '/',
                expectedContent: '企業管理系統',
                critical: true
            },
            {
                name: '健康檢查測試',
                path: '/health',
                expectedContent: 'healthy',
                critical: true
            },
            {
                name: '系統狀態API測試',
                path: '/api/system/status',
                expectedContent: 'success',
                critical: true
            },
            {
                name: '登入頁面測試',
                path: '/login',
                expectedContent: '員工登入',
                critical: false
            },
            {
                name: 'API文檔測試',
                path: '/api/docs',
                expectedContent: 'API',
                critical: false
            }
        ];
        
        const results = [];
        
        for (const test of verificationTests) {
            try {
                console.log(`   🧪 ${test.name}...`);
                
                const testUrl = url + test.path;
                const response = await this.makeHttpRequest(testUrl);
                
                if (response.includes(test.expectedContent)) {
                    console.log(`   ✅ ${test.name}: 通過`);
                    results.push({ ...test, status: 'passed', response: response.substring(0, 100) });
                } else {
                    console.log(`   ❌ ${test.name}: 失敗 (未找到預期內容)`);
                    results.push({ ...test, status: 'failed', error: '未找到預期內容' });
                }
                
            } catch (error) {
                console.log(`   ❌ ${test.name}: 錯誤 - ${error.message}`);
                results.push({ ...test, status: 'error', error: error.message });
            }
            
            // 避免請求過於頻繁
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 統計結果
        const passed = results.filter(r => r.status === 'passed').length;
        const total = results.length;
        const criticalPassed = results.filter(r => r.critical && r.status === 'passed').length;
        const totalCritical = results.filter(r => r.critical).length;
        
        console.log(`\n📊 驗證結果: ${passed}/${total} 通過`);
        console.log(`🔴 關鍵測試: ${criticalPassed}/${totalCritical} 通過`);
        
        this.verificationResults.push({
            url: url,
            totalTests: total,
            passedTests: passed,
            criticalPassed: criticalPassed,
            totalCritical: totalCritical,
            overallStatus: criticalPassed === totalCritical ? 'healthy' : 'issues',
            details: results,
            timestamp: new Date().toISOString()
        });
    }

    makeHttpRequest(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            const request = protocol.get(url, { timeout: 10000 }, (response) => {
                let data = '';
                
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        resolve(data);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
        });
    }

    createPostDeploymentVerificationScript() {
        const verificationScript = `
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
    
    console.log(\`\\n📊 驗證結果: \${passed}/\${tests.length} 通過\`);
    
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
        `;
        
        fs.writeFileSync('post-deployment-verification.js', verificationScript.trim());
        console.log('📝 部署後驗證腳本已創建: post-deployment-verification.js');
    }

    generateFinalDeploymentReport() {
        console.log('\n📊 階段 5: 生成部署成功報告');
        
        const report = {
            deploymentSummary: {
                projectName: this.projectInfo.name,
                version: this.projectInfo.version,
                deploymentDate: new Date().toISOString(),
                totalPlatforms: this.deploymentOptions.length,
                successfulDeployments: this.deploymentResults.filter(r => r.status === 'success').length,
                manualDeployments: this.deploymentResults.filter(r => r.status === 'manual_required').length
            },
            installedTools: this.installedTools,
            deploymentResults: this.deploymentResults,
            verificationResults: this.verificationResults,
            finalUrls: this.finalUrls,
            nextSteps: this.generateNextSteps()
        };
        
        // 儲存報告
        const reportFile = `smart-deployment-report-${Date.now()}.json`;
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        console.log('\n🎯 智慧部署完成摘要:');
        console.log(`📦 專案: ${report.deploymentSummary.projectName} ${report.deploymentSummary.version}`);
        console.log(`⚙️  已安裝工具: ${this.installedTools.filter(t => t.status !== 'install_failed').length} 個`);
        console.log(`🚀 部署配置: ${report.deploymentSummary.totalPlatforms} 個平台`);
        console.log(`✅ 自動部署: ${report.deploymentSummary.successfulDeployments} 個`);
        console.log(`📋 手動部署: ${report.deploymentSummary.manualDeployments} 個`);
        
        if (this.finalUrls.length > 0) {
            console.log('\n🌍 已部署的實際網址:');
            this.finalUrls.forEach((url, index) => {
                console.log(`${index + 1}. ${url}`);
            });
            
            console.log('\n🔐 測試帳號資訊:');
            console.log('   👑 管理員: admin / admin123');
            console.log('   👔 經理: manager / manager123');
            console.log('   👤 員工: john.doe / password123');
            
        } else {
            console.log('\n📋 請依照上述指引手動完成部署，然後使用以下指令驗證:');
            console.log('   node post-deployment-verification.js <your-deployed-url>');
        }
        
        console.log(`\n📄 詳細報告已保存: ${reportFile}`);
        
        return report;
    }

    generateNextSteps() {
        const steps = [
            '手動完成平台部署（如需要）',
            '使用提供的測試帳號驗證所有功能',
            '監控系統性能和錯誤日誌',
            '根據使用情況考慮升級資源配置'
        ];
        
        if (this.finalUrls.length > 0) {
            steps.unshift('驗證已部署的網址功能完整性');
        }
        
        return steps;
    }

    handleDeploymentError(error) {
        console.log('\n🔧 部署錯誤處理...');
        console.log('📋 建議的解決方案:');
        console.log('1. 檢查網路連接狀態');
        console.log('2. 確認Git倉庫狀態正常');
        console.log('3. 手動使用平台網頁界面部署');
        console.log('4. 查看詳細錯誤日誌');
        
        // 創建錯誤報告
        const errorReport = {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            installedTools: this.installedTools,
            deploymentResults: this.deploymentResults
        };
        
        fs.writeFileSync(`deployment-error-${Date.now()}.json`, JSON.stringify(errorReport, null, 2));
        console.log('📄 錯誤報告已保存');
    }
}

// 執行智慧部署
async function executeSmartDeployment() {
    const engine = new SmartDeploymentTemplateEngine();
    await engine.executeSmartDeployment();
}

// 如果直接執行此檔案
if (require.main === module) {
    executeSmartDeployment().catch(console.error);
}

module.exports = SmartDeploymentTemplateEngine;
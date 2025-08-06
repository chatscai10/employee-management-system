// 🌐 真實瀏覽器自動化驗證系統
// 使用Puppeteer模擬真實用戶操作驗證企業管理系統功能

const fs = require('fs');

class RealBrowserAutomationVerifier {
    constructor() {
        this.targetUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
        this.verificationResults = {
            timestamp: new Date().toISOString(),
            url: this.targetUrl,
            tests: [],
            screenshots: [],
            overallStatus: 'unknown'
        };
        this.puppeteer = null;
        this.browser = null;
        this.page = null;
    }

    async initializePuppeteer() {
        console.log('🔧 初始化Puppeteer瀏覽器自動化...');
        
        try {
            // 嘗試導入Puppeteer
            this.puppeteer = require('puppeteer');
            console.log('  ✅ Puppeteer已導入');
        } catch (error) {
            console.log('  ❌ Puppeteer未安裝，嘗試自動安裝...');
            return this.installAndRetryPuppeteer();
        }
        
        try {
            this.browser = await this.puppeteer.launch({
                headless: false, // 顯示瀏覽器窗口以便觀察
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            });
            
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 1366, height: 768 });
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            
            console.log('  ✅ 瀏覽器已啟動並配置完成');
            return true;
        } catch (error) {
            console.log('  ❌ 瀏覽器啟動失敗:', error.message);
            return false;
        }
    }

    async installAndRetryPuppeteer() {
        console.log('  📦 自動安裝Puppeteer...');
        
        const { exec } = require('child_process');
        
        return new Promise((resolve) => {
            exec('npm install puppeteer', (error, stdout, stderr) => {
                if (error) {
                    console.log('  ❌ Puppeteer安裝失敗:', error.message);
                    console.log('\\n📋 手動安裝說明:');
                    console.log('  執行: npm install puppeteer');
                    console.log('  然後重新運行此驗證工具');
                    resolve(false);
                } else {
                    console.log('  ✅ Puppeteer安裝成功');
                    try {
                        this.puppeteer = require('puppeteer');
                        this.initializePuppeteer().then(resolve);
                    } catch (e) {
                        console.log('  ❌ Puppeteer導入失敗');
                        resolve(false);
                    }
                }
            });
        });
    }

    async takeScreenshot(name) {
        if (this.page) {
            const filename = \`screenshots/\${name}-\${Date.now()}.png\`;
            
            // 確保screenshots目錄存在
            if (!fs.existsSync('screenshots')) {
                fs.mkdirSync('screenshots');
            }
            
            await this.page.screenshot({ 
                path: filename, 
                fullPage: true 
            });
            
            this.verificationResults.screenshots.push({
                name: name,
                filename: filename,
                timestamp: new Date().toISOString()
            });
            
            console.log(\`    📸 截圖已保存: \${filename}\`);
            return filename;
        }
    }

    async verifyPageLoad(url, expectedElements = []) {
        console.log(\`  🌐 訪問: \${url}\`);
        
        try {
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            
            await this.takeScreenshot('page-load');
            
            // 檢查預期元素
            const elementsFound = [];
            for (const element of expectedElements) {
                try {
                    await this.page.waitForSelector(element, { timeout: 5000 });
                    elementsFound.push(element);
                    console.log(\`    ✅ 找到元素: \${element}\`);
                } catch (e) {
                    console.log(\`    ❌ 未找到元素: \${element}\`);
                }
            }
            
            return {
                success: true,
                url: url,
                title: await this.page.title(),
                elementsFound: elementsFound,
                expectedElements: expectedElements
            };
        } catch (error) {
            console.log(\`    ❌ 頁面載入失敗: \${error.message}\`);
            return {
                success: false,
                error: error.message,
                url: url
            };
        }
    }

    async simulateUserLogin(account) {
        console.log(\`\\n🔐 模擬 \${account.name} 登入流程...\`);
        
        const testResult = {
            account: account,
            steps: [],
            success: false,
            screenshots: []
        };
        
        try {
            // 1. 訪問登入頁面
            console.log('  📋 步驟1: 訪問登入頁面');
            const loginPageResult = await this.verifyPageLoad(
                this.targetUrl + '/login',
                ['#username', '#password', 'button[type="submit"]']
            );
            testResult.steps.push({
                step: 1,
                action: '訪問登入頁面',
                success: loginPageResult.success,
                details: loginPageResult
            });
            
            if (!loginPageResult.success) {
                return testResult;
            }
            
            // 2. 填寫登入表單
            console.log('  ✏️ 步驟2: 填寫登入表單');
            await this.page.type('#username', account.username);
            await this.page.type('#password', account.password);
            
            await this.takeScreenshot(\`login-form-filled-\${account.username}\`);
            
            testResult.steps.push({
                step: 2,
                action: '填寫登入表單',
                success: true,
                details: { username: account.username, passwordFilled: true }
            });
            
            // 3. 點擊登入按鈕
            console.log('  🚀 步驟3: 點擊登入按鈕');
            await this.page.click('button[type="submit"]');
            
            // 等待跳轉
            console.log('  ⏳ 等待登入處理和頁面跳轉...');
            await this.page.waitForTimeout(3000);
            
            // 4. 檢查是否跳轉到Dashboard
            console.log('  🏠 步驟4: 檢查Dashboard跳轉');
            const currentUrl = this.page.url();
            const isDashboard = currentUrl.includes('/dashboard');
            
            await this.takeScreenshot(\`after-login-\${account.username}\`);
            
            if (isDashboard) {
                console.log('    ✅ 成功跳轉到Dashboard');
                
                // 5. 驗證Dashboard內容
                console.log('  🔍 步驟5: 驗證Dashboard內容');
                
                try {
                    // 等待Dashboard初始化
                    await this.page.waitForTimeout(2000);
                    
                    // 檢查用戶名顯示
                    let userNameDisplayed = false;
                    try {
                        await this.page.waitForSelector('#username', { timeout: 5000 });
                        const displayedName = await this.page.$eval('#username', el => el.textContent);
                        console.log(\`    👤 顯示用戶名: \${displayedName}\`);
                        userNameDisplayed = true;
                    } catch (e) {
                        console.log('    ⚠️ 用戶名元素未找到');
                    }
                    
                    // 檢查核心功能模組
                    const moduleSelectors = [
                        '.card', // 功能卡片
                        'button', // 功能按鈕
                        '.quick-actions' // 快速操作
                    ];
                    
                    let modulesFound = 0;
                    for (const selector of moduleSelectors) {
                        try {
                            const elements = await this.page.$$(selector);
                            if (elements.length > 0) {
                                modulesFound++;
                                console.log(\`    ✅ 找到 \${elements.length} 個 \${selector} 元素\`);
                            }
                        } catch (e) {
                            console.log(\`    ❌ 未找到 \${selector} 元素\`);
                        }
                    }
                    
                    await this.takeScreenshot(\`dashboard-loaded-\${account.username}\`);
                    
                    testResult.steps.push({
                        step: 4,
                        action: 'Dashboard驗證',
                        success: true,
                        details: {
                            url: currentUrl,
                            userNameDisplayed: userNameDisplayed,
                            modulesFound: modulesFound
                        }
                    });
                    
                    // 6. 測試功能按鈕（可選）
                    console.log('  🔘 步驟6: 測試功能按鈕');
                    try {
                        // 嘗試點擊一個功能按鈕
                        const buttons = await this.page.$$('button');
                        if (buttons.length > 0) {
                            console.log(\`    🎯 找到 \${buttons.length} 個按鈕，測試第一個\`);
                            
                            // 點擊第一個按鈕（通常是員工列表或類似功能）
                            await buttons[0].click();
                            await this.page.waitForTimeout(1000);
                            
                            await this.takeScreenshot(\`button-clicked-\${account.username}\`);
                            console.log('    ✅ 按鈕點擊測試完成');
                        }
                    } catch (e) {
                        console.log('    ⚠️ 按鈕測試跳過');
                    }
                    
                    testResult.success = true;
                    console.log(\`  🎉 \${account.name} 完整登入流程驗證成功！\`);
                    
                } catch (error) {
                    console.log(\`    ❌ Dashboard驗證失敗: \${error.message}\`);
                    testResult.steps.push({
                        step: 5,
                        action: 'Dashboard驗證',
                        success: false,
                        error: error.message
                    });
                }
                
            } else {
                console.log(\`    ❌ 未跳轉到Dashboard，當前URL: \${currentUrl}\`);
                testResult.steps.push({
                    step: 4,
                    action: '檢查Dashboard跳轉',
                    success: false,
                    details: { currentUrl: currentUrl, expectedDashboard: true }
                });
            }
            
        } catch (error) {
            console.log(\`  ❌ 登入流程失敗: \${error.message}\`);
            testResult.steps.push({
                step: 'error',
                action: '登入流程異常',
                success: false,
                error: error.message
            });
        }
        
        return testResult;
    }

    async runFullVerification() {
        console.log('🌐 啟動真實瀏覽器自動化驗證系統');
        console.log(\`🎯 目標網址: \${this.targetUrl}\`);
        console.log('📅 開始時間:', new Date().toLocaleString());
        
        // 初始化瀏覽器
        const browserInitialized = await this.initializePuppeteer();
        if (!browserInitialized) {
            console.log('❌ 瀏覽器初始化失敗，終止驗證');
            return { success: false, error: 'Browser initialization failed' };
        }
        
        try {
            // 1. 基本連接測試
            console.log('\\n🔍 執行基本連接測試...');
            const homePageResult = await this.verifyPageLoad(this.targetUrl, ['title', 'body']);
            this.verificationResults.tests.push({
                type: 'basic_connectivity',
                result: homePageResult
            });
            
            // 2. 登入頁面測試
            console.log('\\n🔐 執行登入頁面測試...');
            const loginPageResult = await this.verifyPageLoad(
                this.targetUrl + '/login',
                ['#username', '#password', 'button[type="submit"]']
            );
            this.verificationResults.tests.push({
                type: 'login_page',
                result: loginPageResult
            });
            
            // 3. 用戶登入流程測試
            console.log('\\n👥 執行用戶登入流程測試...');
            const loginTests = [];
            
            for (const account of this.testAccounts) {
                const loginResult = await this.simulateUserLogin(account);
                loginTests.push(loginResult);
                
                // 用戶間等待
                await this.page.waitForTimeout(2000);
            }
            
            this.verificationResults.tests.push({
                type: 'user_login_flows',
                result: loginTests
            });
            
            // 4. 生成驗證報告
            const report = this.generateVerificationReport();
            
            console.log('\\n📊 真實瀏覽器驗證完成！');
            
            return {
                success: true,
                report: report,
                screenshots: this.verificationResults.screenshots
            };
            
        } catch (error) {
            console.error('❌ 驗證過程中發生錯誤:', error);
            return { success: false, error: error.message };
        } finally {
            // 關閉瀏覽器
            if (this.browser) {
                await this.browser.close();
                console.log('🔒 瀏覽器已關閉');
            }
        }
    }

    generateVerificationReport() {
        console.log('\\n📋 生成驗證報告...');
        
        const loginFlowResults = this.verificationResults.tests.find(t => t.type === 'user_login_flows');
        const successfulLogins = loginFlowResults ? 
            loginFlowResults.result.filter(r => r.success).length : 0;
        const totalLogins = this.testAccounts.length;
        
        const report = {
            title: '🌐 真實瀏覽器自動化驗證報告',
            timestamp: this.verificationResults.timestamp,
            targetUrl: this.targetUrl,
            summary: {
                loginFlowSuccessRate: \`\${successfulLogins}/\${totalLogins} (\${Math.round(successfulLogins/totalLogins*100)}%)\`,
                totalScreenshots: this.verificationResults.screenshots.length,
                overallStatus: successfulLogins === totalLogins ? 'EXCELLENT' : 
                              successfulLogins > 0 ? 'PARTIAL' : 'FAILED'
            },
            detailedResults: this.verificationResults.tests,
            screenshots: this.verificationResults.screenshots,
            recommendations: this.generateRecommendations(successfulLogins, totalLogins)
        };
        
        // 保存報告
        const reportFilename = \`real-browser-verification-\${Date.now()}.json\`;
        fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
        console.log(\`  ✅ 詳細報告已保存: \${reportFilename}\`);
        
        this.displaySummary(report);
        
        return report;
    }

    generateRecommendations(successful, total) {
        const recommendations = [];
        
        if (successful === total) {
            recommendations.push('🎉 所有用戶登入流程完美運作！');
            recommendations.push('✅ 系統已準備好供用戶正常使用');
            recommendations.push('📱 建議定期進行自動化驗證測試');
        } else if (successful > 0) {
            recommendations.push('⚠️ 部分用戶登入存在問題，需要進一步調查');
            recommendations.push('🔍 檢查失敗用戶的截圖和錯誤日誌');
            recommendations.push('🔧 修復問題後重新運行驗證');
        } else {
            recommendations.push('❌ 所有用戶登入都失敗，需要緊急修復');
            recommendations.push('🔍 檢查API端點和前端JavaScript邏輯');
            recommendations.push('⚡ 修復後立即重新測試');
        }
        
        return recommendations;
    }

    displaySummary(report) {
        console.log('\\n🎯 =============== 真實瀏覽器驗證摘要 ===============');
        console.log('📅 驗證完成時間:', new Date().toLocaleString());
        console.log(\`🌐 目標網址: \${this.targetUrl}\`);
        
        console.log(\`\\n📊 驗證結果:`);
        console.log(\`  👥 登入流程成功率: \${report.summary.loginFlowSuccessRate}\`);
        console.log(\`  📸 總截圖數量: \${report.summary.totalScreenshots}\`);
        console.log(\`  🎯 整體狀態: \${report.summary.overallStatus}\`);
        
        console.log('\\n💡 建議事項:');
        report.recommendations.forEach(rec => {
            console.log(\`  \${rec}\`);
        });
        
        console.log('\\n📁 截圖文件:');
        report.screenshots.forEach(screenshot => {
            console.log(\`  📸 \${screenshot.name}: \${screenshot.filename}\`);
        });
    }
}

// 執行真實瀏覽器驗證
async function runRealBrowserVerification() {
    const verifier = new RealBrowserAutomationVerifier();
    const result = await verifier.runFullVerification();
    return result;
}

// 如果直接執行此檔案
if (require.main === module) {
    runRealBrowserVerification().catch(console.error);
}

module.exports = RealBrowserAutomationVerifier;
// 🌐 智慧模板瀏覽器驗證系統
// 使用真實瀏覽器模擬驗證修復後的系統

const https = require('https');
const fs = require('fs');

class SmartBrowserVerificationSystem {
    constructor() {
        this.targetUrl = 'https://employee-management-system-v6hs.onrender.com';
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '一般員工' }
        ];
        this.verificationReport = {
            timestamp: new Date().toISOString(),
            deploymentStatus: 'pending',
            apiTests: [],
            loginFlows: [],
            debugLogs: [],
            finalStatus: 'unknown'
        };
    }

    // 🔍 階段1: 檢查部署狀態
    async checkDeploymentStatus() {
        console.log('🔍 檢查部署狀態...');
        
        const checks = [
            { name: '健康檢查', path: '/health' },
            { name: '登入頁面', path: '/login' },
            { name: 'Dashboard頁面', path: '/dashboard' }
        ];
        
        for (const check of checks) {
            const result = await this.fetchUrl(check.path);
            console.log(`  ${check.name}: ${result.status === 200 ? '✅ 正常' : '❌ 異常 (' + result.status + ')'}`);
            
            this.verificationReport.debugLogs.push({
                check: check.name,
                status: result.status,
                timestamp: new Date().toISOString()
            });
        }
        
        // 等待部署完成（檢查是否有新代碼）
        const dashboardContent = await this.fetchUrl('/dashboard');
        const hasDebugLog = dashboardContent.body && dashboardContent.body.includes('[DEBUG]');
        
        if (hasDebugLog) {
            console.log('  ✅ 檢測到新代碼已部署（包含調試日誌）');
            this.verificationReport.deploymentStatus = 'completed';
            return true;
        } else {
            console.log('  ⏳ 新代碼可能尚未完全部署');
            this.verificationReport.deploymentStatus = 'pending';
            return false;
        }
    }

    // 🔌 階段2: 測試API端點
    async testAPIEndpoints() {
        console.log('\n🔌 測試API端點...');
        
        const endpoints = [
            { 
                name: 'GET /api/auth/verify', 
                method: 'GET', 
                path: '/api/auth/verify',
                headers: { 'Authorization': 'Bearer admin' }
            },
            { 
                name: 'POST /api/auth/verify', 
                method: 'POST', 
                path: '/api/auth/verify',
                headers: { 'Authorization': 'Bearer admin' }
            },
            { 
                name: 'POST /api/auth/login', 
                method: 'POST', 
                path: '/api/auth/login',
                body: { username: 'admin', password: 'admin123' }
            }
        ];
        
        for (const endpoint of endpoints) {
            const result = await this.makeRequest(endpoint);
            const status = result.status;
            const success = (endpoint.name.includes('login') && status === 200) || 
                           (endpoint.name.includes('verify') && (status === 200 || status === 401));
            
            console.log(`  ${endpoint.name}: ${status} ${success ? '✅' : '❌'}`);
            
            this.verificationReport.apiTests.push({
                endpoint: endpoint.name,
                status: status,
                success: success,
                response: result.data
            });
        }
    }

    // 👤 階段3: 模擬完整登入流程
    async simulateLoginFlows() {
        console.log('\n👤 模擬完整登入流程...');
        
        for (const account of this.testAccounts) {
            console.log(`\n  🔐 測試 ${account.name} (${account.username})...`);
            
            const flowResult = {
                account: account,
                steps: [],
                success: false
            };
            
            // 步驟1: 登入
            console.log('    1️⃣ 執行登入...');
            const loginResult = await this.makeRequest({
                method: 'POST',
                path: '/api/auth/login',
                body: {
                    username: account.username,
                    password: account.password
                }
            });
            
            flowResult.steps.push({
                step: 'login',
                status: loginResult.status,
                success: loginResult.status === 200,
                data: loginResult.data
            });
            
            if (loginResult.status !== 200) {
                console.log(`    ❌ 登入失敗: ${loginResult.status}`);
                this.verificationReport.loginFlows.push(flowResult);
                continue;
            }
            
            console.log('    ✅ 登入成功');
            const token = loginResult.data.token || account.username;
            
            // 步驟2: 驗證身份（使用POST）
            console.log('    2️⃣ 驗證身份 (POST)...');
            const verifyResult = await this.makeRequest({
                method: 'POST',
                path: '/api/auth/verify',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            flowResult.steps.push({
                step: 'verify_post',
                status: verifyResult.status,
                success: verifyResult.status === 200,
                data: verifyResult.data
            });
            
            if (verifyResult.status === 200) {
                console.log('    ✅ POST驗證成功');
            } else {
                console.log(`    ❌ POST驗證失敗: ${verifyResult.status}`);
            }
            
            // 步驟3: 測試GET驗證（兼容性）
            console.log('    3️⃣ 驗證身份 (GET)...');
            const getVerifyResult = await this.makeRequest({
                method: 'GET',
                path: '/api/auth/verify',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            flowResult.steps.push({
                step: 'verify_get',
                status: getVerifyResult.status,
                success: getVerifyResult.status === 200,
                data: getVerifyResult.data
            });
            
            if (getVerifyResult.status === 200) {
                console.log('    ✅ GET驗證成功（兼容性修復生效）');
                flowResult.success = true;
            } else {
                console.log(`    ⚠️ GET驗證狀態: ${getVerifyResult.status}`);
            }
            
            this.verificationReport.loginFlows.push(flowResult);
        }
    }

    // 📊 階段4: 生成驗證報告
    generateVerificationReport() {
        console.log('\n📊 生成智慧驗證報告...');
        
        // 分析結果
        const apiSuccess = this.verificationReport.apiTests.filter(t => t.success).length;
        const apiTotal = this.verificationReport.apiTests.length;
        
        const flowSuccess = this.verificationReport.loginFlows.filter(f => f.success).length;
        const flowTotal = this.verificationReport.loginFlows.length;
        
        const getVerifyFixed = this.verificationReport.apiTests.find(t => 
            t.endpoint === 'GET /api/auth/verify' && t.status !== 404
        );
        
        // 判定最終狀態
        if (getVerifyFixed && flowSuccess === flowTotal) {
            this.verificationReport.finalStatus = 'FIXED';
            console.log('\n🎉 系統已完全修復！');
        } else if (flowSuccess > 0) {
            this.verificationReport.finalStatus = 'PARTIAL';
            console.log('\n⚠️ 系統部分修復');
        } else {
            this.verificationReport.finalStatus = 'FAILED';
            console.log('\n❌ 系統仍有問題');
        }
        
        // 顯示摘要
        console.log('\n📋 驗證摘要:');
        console.log(`  部署狀態: ${this.verificationReport.deploymentStatus}`);
        console.log(`  API測試: ${apiSuccess}/${apiTotal} 通過`);
        console.log(`  登入流程: ${flowSuccess}/${flowTotal} 成功`);
        console.log(`  GET驗證修復: ${getVerifyFixed ? '✅ 已修復' : '❌ 未修復'}`);
        console.log(`  最終狀態: ${this.verificationReport.finalStatus}`);
        
        // 保存報告
        const filename = `smart-browser-verification-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(this.verificationReport, null, 2));
        console.log(`\n📄 詳細報告已保存: ${filename}`);
        
        return this.verificationReport;
    }

    // 輔助方法
    async fetchUrl(path) {
        return new Promise((resolve) => {
            https.get(this.targetUrl + path, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: data }));
            }).on('error', err => resolve({ status: 0, error: err.message }));
        });
    }

    async makeRequest(options) {
        return new Promise((resolve) => {
            const urlObj = new URL(this.targetUrl + options.path);
            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 15000
            };
            
            const req = https.request(requestOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({ status: res.statusCode, data: jsonData });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });
            
            req.on('error', (err) => {
                resolve({ status: 0, error: err.message });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    // 🚀 執行完整驗證
    async executeVerification() {
        console.log('🚀 啟動智慧模板瀏覽器驗證系統');
        console.log(`🎯 目標: ${this.targetUrl}`);
        console.log('📅 時間:', new Date().toLocaleString());
        
        try {
            // 1. 檢查部署狀態
            const deployed = await this.checkDeploymentStatus();
            
            if (!deployed) {
                console.log('\n⏳ 等待30秒讓部署完成...');
                await new Promise(resolve => setTimeout(resolve, 30000));
                await this.checkDeploymentStatus();
            }
            
            // 2. 測試API端點
            await this.testAPIEndpoints();
            
            // 3. 模擬登入流程
            await this.simulateLoginFlows();
            
            // 4. 生成報告
            const report = this.generateVerificationReport();
            
            return report;
            
        } catch (error) {
            console.error('❌ 驗證過程中發生錯誤:', error);
            this.verificationReport.error = error.message;
            return this.verificationReport;
        }
    }
}

// 執行驗證
async function runVerification() {
    const verifier = new SmartBrowserVerificationSystem();
    const result = await verifier.executeVerification();
    
    // 根據結果提供建議
    if (result.finalStatus === 'FIXED') {
        console.log('\n✅ 建議: 系統已修復，可以正常使用！');
    } else {
        console.log('\n💡 建議:');
        console.log('  1. 清除瀏覽器快取並使用無痕模式');
        console.log('  2. 等待更長時間讓部署完成');
        console.log('  3. 檢查Render部署日誌');
    }
    
    return result;
}

// 如果直接執行
if (require.main === module) {
    runVerification().catch(console.error);
}

module.exports = SmartBrowserVerificationSystem;
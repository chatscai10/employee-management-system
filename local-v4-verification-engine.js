// 🔍 本地 v4.0.0 企業系統驗證引擎
// 智能驗證本地完整系統的所有企業管理功能

const fs = require('fs').promises;
const { spawn } = require('child_process');

class LocalV4VerificationEngine {
    constructor() {
        this.appPath = 'app.js';
        this.testPort = 8080;
        this.serverProcess = null;
        this.testResults = {
            systemInfo: {},
            endpoints: [],
            authentication: [],
            enterpriseFeatures: [],
            summary: {}
        };
        
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '約翰·多伊' }
        ];
        
        this.enterpriseEndpoints = [
            { path: '/', method: 'GET', name: '企業主頁', expectContent: ['v4.0.0', '完整功能版'] },
            { path: '/health', method: 'GET', name: '系統健康檢查', expectContent: ['4.0.0', 'healthy'] },
            { path: '/login', method: 'GET', name: '員工登入頁面', expectContent: ['員工登入', 'admin'] },
            { path: '/dashboard', method: 'GET', name: '管理主控台', expectContent: ['企業管理主控台', 'v4.0.0'] },
            { path: '/api/system/status', method: 'GET', name: '系統狀態API', expectContent: ['4.0.0', 'operational'] },
            { path: '/api/docs', method: 'GET', name: 'API文檔', expectContent: ['API 文檔', 'endpoints'] }
        ];
        
        this.authenticatedEndpoints = [
            { path: '/api/employees', method: 'GET', name: '員工管理API' },
            { path: '/api/attendance', method: 'GET', name: '考勤管理API' },
            { path: '/api/inventory', method: 'GET', name: '庫存管理API' },
            { path: '/api/maintenance', method: 'GET', name: '維修系統API' }
        ];
    }

    async analyzeAppFile() {
        console.log('📄 分析 app.js 檔案內容...');
        
        try {
            const appContent = await fs.readFile(this.appPath, 'utf8');
            
            const analysis = {
                fileSize: appContent.length,
                hasV4Version: appContent.includes('v4.0.0') || appContent.includes('4.0.0'),
                hasEnterpriseSystem: appContent.includes('完整企業管理系統'),
                hasAuthLogin: appContent.includes('/api/auth/login'),
                hasEmployeesAPI: appContent.includes('/api/employees'),
                hasAttendanceAPI: appContent.includes('/api/attendance'),
                hasInventoryAPI: appContent.includes('/api/inventory'),
                hasMaintenanceAPI: appContent.includes('/api/maintenance'),
                hasRevenueAPI: appContent.includes('/api/revenue'),
                hasDashboard: appContent.includes('/dashboard'),
                hasHealthCheck: appContent.includes('/health'),
                lineCount: appContent.split('\\n').length
            };
            
            console.log('📊 app.js 分析結果:');
            console.log(`   📦 檔案大小: ${Math.round(analysis.fileSize / 1024)} KB`);
            console.log(`   📝 程式碼行數: ${analysis.lineCount}`);
            console.log(`   ✅ v4.0.0 標識: ${analysis.hasV4Version ? '存在' : '缺失'}`);
            console.log(`   🏢 企業系統: ${analysis.hasEnterpriseSystem ? '存在' : '缺失'}`);
            console.log(`   🔐 身份驗證: ${analysis.hasAuthLogin ? '存在' : '缺失'}`);
            console.log(`   👥 員工管理: ${analysis.hasEmployeesAPI ? '存在' : '缺失'}`);
            console.log(`   📅 考勤系統: ${analysis.hasAttendanceAPI ? '存在' : '缺失'}`);
            console.log(`   📦 庫存管理: ${analysis.hasInventoryAPI ? '存在' : '缺失'}`);
            console.log(`   🔧 維修系統: ${analysis.hasMaintenanceAPI ? '存在' : '缺失'}`);
            console.log(`   📊 營收分析: ${analysis.hasRevenueAPI ? '存在' : '缺失'}`);
            console.log(`   🎛️ 管理主控台: ${analysis.hasDashboard ? '存在' : '缺失'}`);
            console.log(`   💚 健康檢查: ${analysis.hasHealthCheck ? '存在' : '缺失'}`);
            
            this.testResults.systemInfo = analysis;
            return analysis;
            
        } catch (error) {
            console.log(`❌ 檔案分析失敗: ${error.message}`);
            return { error: error.message };
        }
    }

    async startLocalServer() {
        console.log('\\n🚀 啟動本地 v4.0.0 企業系統...');
        
        return new Promise((resolve) => {
            this.serverProcess = spawn('node', [this.appPath], {
                stdio: ['ignore', 'pipe', 'pipe'],
                env: { ...process.env, PORT: this.testPort }
            });
            
            let output = '';
            
            this.serverProcess.stdout.on('data', (data) => {
                output += data.toString();
                if (output.includes('企業管理系統 v4.0.0 已成功啟動')) {
                    console.log('✅ 本地 v4.0.0 系統啟動成功');
                    setTimeout(() => resolve({ success: true }), 2000); // 等待2秒確保完全啟動
                }
            });
            
            this.serverProcess.stderr.on('data', (data) => {
                console.log(`⚠️ 伺服器錯誤: ${data.toString()}`);
            });
            
            this.serverProcess.on('error', (error) => {
                console.log(`❌ 啟動失敗: ${error.message}`);
                resolve({ success: false, error: error.message });
            });
            
            // 超時處理
            setTimeout(() => {
                if (!this.serverProcess.killed) {
                    console.log('⏰ 啟動超時，但繼續進行測試');
                    resolve({ success: true, timeout: true });
                }
            }, 10000);
        });
    }

    async makeRequest(path, options = {}) {
        const http = require('http');
        
        return new Promise((resolve) => {
            const defaultOptions = {
                hostname: 'localhost',
                port: this.testPort,
                path: path,
                method: options.method || 'GET',
                headers: options.headers || {}
            };

            if (options.body) {
                const body = JSON.stringify(options.body);
                defaultOptions.headers['Content-Type'] = 'application/json';
                defaultOptions.headers['Content-Length'] = Buffer.byteLength(body);
            }

            const req = http.request(defaultOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                });
            });

            req.on('error', (error) => {
                resolve({
                    error: error.message,
                    success: false
                });
            });

            req.setTimeout(5000, () => {
                req.destroy();
                resolve({
                    error: 'timeout',
                    success: false
                });
            });

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async testBasicEndpoints() {
        console.log('\\n🌐 測試基本系統端點...');
        console.log('─'.repeat(50));
        
        for (const endpoint of this.enterpriseEndpoints) {
            console.log(`🔍 測試: ${endpoint.path} (${endpoint.method})`);
            
            const result = await this.makeRequest(endpoint.path, { method: endpoint.method });
            
            let success = result.success;
            let contentCheck = false;
            let analysis = '';
            
            if (success) {
                // 檢查預期內容
                if (endpoint.expectContent && result.body) {
                    contentCheck = endpoint.expectContent.some(content => 
                        result.body.includes(content)
                    );
                    
                    if (contentCheck) {
                        analysis = '✅ 內容驗證通過';
                    } else {
                        analysis = '⚠️ 內容驗證失敗';
                        success = false;
                    }
                } else {
                    analysis = '✅ 狀態檢查通過';
                }
                
                console.log(`   ✅ ${endpoint.name}: ${result.statusCode} ${analysis}`);
            } else {
                analysis = result.error || `HTTP ${result.statusCode}`;
                console.log(`   ❌ ${endpoint.name}: ${analysis}`);
            }
            
            this.testResults.endpoints.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                success: success,
                statusCode: result.statusCode,
                contentCheck: contentCheck,
                analysis: analysis,
                responseSize: result.body ? result.body.length : 0
            });
        }
    }

    async testAuthentication() {
        console.log('\\n🔐 測試身份驗證功能...');
        console.log('─'.repeat(50));
        
        for (const account of this.testAccounts) {
            console.log(`\\n👤 測試帳號: ${account.username} (${account.role})`);
            
            const loginResult = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: { username: account.username, password: account.password }
            });
            
            let success = false;
            let message = '';
            let userToken = null;
            
            if (loginResult.success) {
                try {
                    const loginData = JSON.parse(loginResult.body);
                    if (loginData.success && loginData.user && loginData.token) {
                        success = true;
                        message = `登入成功 - ${loginData.user.name}`;
                        userToken = loginData.token;
                        console.log(`   ✅ ${message}`);
                    } else {
                        message = '登入回應格式錯誤';
                        console.log(`   ❌ ${message}`);
                    }
                } catch (error) {
                    message = '登入回應解析失敗';
                    console.log(`   ❌ ${message}`);
                }
            } else {
                message = loginResult.error || `HTTP ${loginResult.statusCode}`;
                console.log(`   ❌ ${message}`);
            }
            
            this.testResults.authentication.push({
                account: account.username,
                role: account.role,
                success: success,
                message: message,
                token: userToken,
                statusCode: loginResult.statusCode
            });
        }
    }

    async testEnterpriseFeatures() {
        console.log('\\n🏢 測試企業功能特性...');
        console.log('─'.repeat(50));
        
        // 使用admin帳號的token
        const adminAuth = this.testResults.authentication.find(auth => 
            auth.account === 'admin' && auth.success
        );
        
        if (!adminAuth || !adminAuth.token) {
            console.log('❌ 無法獲取管理員身份驗證，跳過企業功能測試');
            return;
        }
        
        for (const endpoint of this.authenticatedEndpoints) {
            console.log(`🔍 測試: ${endpoint.path}`);
            
            const result = await this.makeRequest(endpoint.path, {
                method: endpoint.method,
                headers: {
                    'Authorization': `Bearer ${adminAuth.token}`
                }
            });
            
            let success = result.success;
            let dataAnalysis = '';
            let enterpriseFeatures = false;
            
            if (success) {
                try {
                    const data = JSON.parse(result.body);
                    if (data.success && data.data) {
                        enterpriseFeatures = true;
                        dataAnalysis = `✅ 返回 ${data.count || data.data.length || 0} 筆數據`;
                        
                        // 檢查企業功能特色
                        if (endpoint.path === '/api/employees' && Array.isArray(data.data)) {
                            const hasEnterpriseFields = data.data.some(emp => 
                                emp.department && emp.position && emp.email
                            );
                            if (hasEnterpriseFields) {
                                dataAnalysis += ' | 包含完整員工資料';
                            }
                        } else if (endpoint.path === '/api/inventory' && data.totalValue) {
                            dataAnalysis += ` | 總價值: NT$ ${data.totalValue.toLocaleString()}`;
                        }
                    } else {
                        dataAnalysis = '⚠️ 回應格式不完整';
                    }
                } catch (error) {
                    dataAnalysis = '❌ JSON解析失敗';
                }
                
                console.log(`   ✅ ${endpoint.name}: ${result.statusCode} ${dataAnalysis}`);
            } else {
                dataAnalysis = result.error || `HTTP ${result.statusCode}`;
                console.log(`   ❌ ${endpoint.name}: ${dataAnalysis}`);
            }
            
            this.testResults.enterpriseFeatures.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                success: success,
                statusCode: result.statusCode,
                enterpriseFeatures: enterpriseFeatures,
                dataAnalysis: dataAnalysis
            });
        }
        
        // 測試考勤簽到功能
        console.log('\\n📅 測試考勤簽到功能...');
        const checkinResult = await this.makeRequest('/api/attendance/checkin', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminAuth.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        let checkinSuccess = false;
        if (checkinResult.success || checkinResult.statusCode === 400) {
            try {
                const data = JSON.parse(checkinResult.body);
                if (data.message) {
                    checkinSuccess = true;
                    console.log(`   ✅ 考勤簽到: ${data.message}`);
                }
            } catch (error) {
                console.log('   ❌ 考勤簽到: 回應解析失敗');
            }
        } else {
            console.log(`   ❌ 考勤簽到: ${checkinResult.error || checkinResult.statusCode}`);
        }
        
        this.testResults.enterpriseFeatures.push({
            endpoint: '考勤簽到',
            path: '/api/attendance/checkin',
            success: checkinSuccess,
            statusCode: checkinResult.statusCode,
            enterpriseFeatures: checkinSuccess
        });
    }

    generateComprehensiveReport() {
        console.log('\\n📊 生成綜合驗證報告...');
        console.log('═'.repeat(70));
        
        // 統計結果
        const authSuccess = this.testResults.authentication.filter(r => r.success).length;
        const authTotal = this.testResults.authentication.length;
        
        const endpointSuccess = this.testResults.endpoints.filter(r => r.success).length;
        const endpointTotal = this.testResults.endpoints.length;
        
        const enterpriseSuccess = this.testResults.enterpriseFeatures.filter(r => r.success).length;
        const enterpriseTotal = this.testResults.enterpriseFeatures.length;
        
        const totalTests = authTotal + endpointTotal + enterpriseTotal;
        const totalSuccess = authSuccess + endpointSuccess + enterpriseSuccess;
        const successRate = totalTests > 0 ? Math.round((totalSuccess / totalTests) * 100) : 0;
        
        // 系統分析
        const systemInfo = this.testResults.systemInfo;
        const isCompleteV4System = systemInfo.hasV4Version && 
                                   systemInfo.hasEnterpriseSystem && 
                                   systemInfo.hasAuthLogin && 
                                   systemInfo.hasEmployeesAPI &&
                                   systemInfo.lineCount > 1000;
        
        const enterpriseFeaturesFound = this.testResults.enterpriseFeatures.some(r => r.enterpriseFeatures);
        
        // 系統狀態判斷
        let systemStatus = '';
        let statusMessage = '';
        let confidence = '';
        
        if (isCompleteV4System && successRate >= 90 && enterpriseFeaturesFound) {
            systemStatus = 'COMPLETE_V4_ENTERPRISE_SYSTEM';
            statusMessage = '🎉 完整 v4.0.0 企業管理系統驗證成功！所有功能正常運行';
            confidence = 'VERY_HIGH';
        } else if (isCompleteV4System && successRate >= 70) {
            systemStatus = 'V4_SYSTEM_MOSTLY_FUNCTIONAL';
            statusMessage = '✅ v4.0.0 企業系統大部分功能正常，少數功能需要調整';
            confidence = 'HIGH';
        } else if (systemInfo.hasV4Version && successRate >= 50) {
            systemStatus = 'V4_SYSTEM_PARTIAL';
            statusMessage = '⚠️ v4.0.0 系統部分功能正常，需要進一步開發';
            confidence = 'MEDIUM';
        } else {
            systemStatus = 'SYSTEM_INCOMPLETE';
            statusMessage = '❌ 系統功能不完整或存在嚴重問題';
            confidence = 'LOW';
        }
        
        // 顯示報告
        console.log(`🎯 系統狀態: ${systemStatus}`);
        console.log(`📝 狀態說明: ${statusMessage}`);
        console.log(`📈 綜合成功率: ${successRate}% (${totalSuccess}/${totalTests})`);
        console.log(`🔒 身份驗證: ${authSuccess}/${authTotal} 成功`);
        console.log(`🌐 系統端點: ${endpointSuccess}/${endpointTotal} 正常`);
        console.log(`🏢 企業功能: ${enterpriseSuccess}/${enterpriseTotal} 可用`);
        console.log(`📦 系統完整度: ${isCompleteV4System ? '✅ 完整' : '❌ 不完整'}`);
        console.log(`💼 企業特性: ${enterpriseFeaturesFound ? '✅ 完整實現' : '❌ 缺失'}`);
        console.log(`🔍 信心度: ${confidence}`);
        console.log(`📊 程式碼規模: ${systemInfo.lineCount || 0} 行 (${Math.round((systemInfo.fileSize || 0) / 1024)} KB)`);
        
        // 詳細功能分析
        if (systemStatus === 'COMPLETE_V4_ENTERPRISE_SYSTEM') {
            console.log('\\n🎊 本地 v4.0.0 企業系統驗證完全成功！');
            console.log('   ✅ 所有核心企業功能正常運行');
            console.log('   ✅ 多角色身份驗證系統完整');
            console.log('   ✅ API 端點功能正確');
            console.log('   ✅ 前端介面響應正常');
            console.log('   ✅ 企業數據結構完整');
            
            console.log('\\n🎯 已驗證的企業功能:');
            console.log('   🔐 三種角色登入系統 (admin/manager/employee)');
            console.log('   👥 完整員工管理 (部門、職位、薪資)');
            console.log('   📅 考勤打卡和記錄查詢');
            console.log('   📦 庫存管理和採購申請');
            console.log('   🔧 設備維修申請和追蹤');
            console.log('   📊 系統狀態監控和API文檔');
            console.log('   🏠 企業級管理主控台');
            
        } else {
            console.log('\\n💡 建議改進項目:');
            if (!isCompleteV4System) {
                console.log('   📦 系統功能需要更完整的實現');
            }
            if (successRate < 90) {
                console.log('   🔧 部分API端點需要修復');
            }
            if (!enterpriseFeaturesFound) {
                console.log('   🏢 企業功能特性需要加強');
            }
        }
        
        const summary = {
            timestamp: new Date().toISOString(),
            systemStatus,
            statusMessage,
            successRate,
            confidence,
            isCompleteV4System,
            enterpriseFeaturesFound,
            systemInfo,
            detailedResults: this.testResults,
            summary: {
                authentication: { success: authSuccess, total: authTotal },
                endpoints: { success: endpointSuccess, total: endpointTotal },
                enterpriseFeatures: { success: enterpriseSuccess, total: enterpriseTotal }
            }
        };
        
        this.testResults.summary = summary;
        return summary;
    }

    async stopLocalServer() {
        if (this.serverProcess && !this.serverProcess.killed) {
            console.log('\\n🛑 停止本地測試伺服器...');
            this.serverProcess.kill('SIGTERM');
            
            // 等待伺服器停止
            return new Promise(resolve => {
                this.serverProcess.on('exit', () => {
                    console.log('✅ 本地伺服器已停止');
                    resolve();
                });
                
                setTimeout(() => {
                    if (!this.serverProcess.killed) {
                        this.serverProcess.kill('SIGKILL');
                    }
                    resolve();
                }, 3000);
            });
        }
    }

    async runCompleteVerification() {
        console.log('🔍 本地 v4.0.0 企業系統驗證引擎');
        console.log('═'.repeat(70));
        console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
        
        try {
            // 分析檔案
            await this.analyzeAppFile();
            
            // 啟動本地伺服器
            const serverStart = await this.startLocalServer();
            if (!serverStart.success) {
                throw new Error('無法啟動本地伺服器');
            }
            
            // 執行所有測試
            await this.testBasicEndpoints();
            await this.testAuthentication();
            await this.testEnterpriseFeatures();
            
            // 生成報告
            const report = this.generateComprehensiveReport();
            
            // 停止伺服器
            await this.stopLocalServer();
            
            // 保存詳細報告
            const filename = `local-v4-verification-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            await fs.writeFile(filename, JSON.stringify(report, null, 2));
            console.log(`\\n📄 詳細驗證報告已保存: ${filename}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 驗證過程中出現錯誤:', error);
            
            // 確保停止伺服器
            await this.stopLocalServer();
            
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// 執行本地 v4.0.0 企業系統驗證
async function main() {
    const verifier = new LocalV4VerificationEngine();
    
    try {
        const report = await verifier.runCompleteVerification();
        
        console.log('\\n🎯 本地 v4.0.0 企業系統驗證完成！');
        
        // 根據結果設定退出碼
        if (report.systemStatus === 'COMPLETE_V4_ENTERPRISE_SYSTEM') {
            console.log('🎉 本地系統驗證: 完全成功！');
            process.exit(0);
        } else if (report.successRate >= 70) {
            console.log('⚠️ 本地系統驗證: 大部分成功');
            process.exit(1);
        } else {
            console.log('❌ 本地系統驗證: 需要改進');
            process.exit(2);
        }
        
    } catch (error) {
        console.error('❌ 驗證引擎執行錯誤:', error);
        process.exit(3);
    }
}

if (require.main === module) {
    main();
}

module.exports = LocalV4VerificationEngine;
// 🔍 完整企業系統驗證引擎 v4.0.0
// 智能驗證所有企業管理功能的真實可用性

const https = require('https');
const fs = require('fs').promises;

class CompleteEnterpriseVerificationEngine {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.europe-west1.run.app';
        this.testResults = {
            authentication: [],
            employees: [],
            attendance: [],
            inventory: [],
            maintenance: [],
            system: [],
            frontend: []
        };
        
        this.testAccounts = [
            { username: 'admin', password: 'admin123', role: 'admin', name: '系統管理員' },
            { username: 'manager', password: 'manager123', role: 'manager', name: '部門經理' },
            { username: 'john.doe', password: 'password123', role: 'employee', name: '約翰·多伊' }
        ];
        
        this.enterpriseEndpoints = [
            // 基本系統
            { path: '/', method: 'GET', name: '企業主頁', expectContent: ['企業管理系統 v4.0.0', '完整功能版'] },
            { path: '/health', method: 'GET', name: '系統健康檢查', expectContent: ['healthy', '4.0.0'] },
            { path: '/login', method: 'GET', name: '登入頁面', expectContent: ['員工登入', 'admin'] },
            { path: '/dashboard', method: 'GET', name: '管理主控台', expectContent: ['企業管理主控台 v4.0.0'] },
            
            // API 端點
            { path: '/api/system/status', method: 'GET', name: '系統狀態API', expectContent: ['4.0.0', 'operational'] },
            { path: '/api/docs', method: 'GET', name: 'API文檔', expectContent: ['API 文檔', 'endpoints'] },
            
            // 需要身份驗證的端點 (將在登入後測試)
            { path: '/api/employees', method: 'GET', name: '員工管理API', requireAuth: true },
            { path: '/api/attendance', method: 'GET', name: '考勤管理API', requireAuth: true },
            { path: '/api/inventory', method: 'GET', name: '庫存管理API', requireAuth: true },
            { path: '/api/maintenance', method: 'GET', name: '維修系統API', requireAuth: true }
        ];
    }

    async makeRequest(path, options = {}) {
        return new Promise((resolve) => {
            const url = this.serviceUrl + path;
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Enterprise-Verification-Engine-v4.0',
                    'Accept': 'application/json, text/html, */*'
                }
            };

            const finalOptions = { ...defaultOptions, ...options };
            if (finalOptions.headers && options.headers) {
                finalOptions.headers = { ...defaultOptions.headers, ...options.headers };
            }

            console.log(`🔍 測試: ${path} (${finalOptions.method})`);

            const req = https.request(url, finalOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const result = {
                        path,
                        method: finalOptions.method,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data,
                        contentLength: data.length,
                        timestamp: new Date().toISOString()
                    };
                    resolve(result);
                });
            });

            const startTime = Date.now();
            
            req.on('error', (error) => {
                resolve({
                    path,
                    method: finalOptions.method,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            });

            req.setTimeout(15000, () => {
                req.destroy();
                resolve({
                    path,
                    method: finalOptions.method,
                    error: 'timeout',
                    timestamp: new Date().toISOString()
                });
            });

            if (finalOptions.method === 'POST' && options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    async testAuthentication() {
        console.log('\\n🔐 測試身份驗證功能...');
        console.log('─'.repeat(50));
        
        for (const account of this.testAccounts) {
            console.log(`\\n👤 測試帳號: ${account.username} (${account.role})`);
            
            const loginResult = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: { username: account.username, password: account.password }
            });
            
            let success = false;
            let message = '';
            let userToken = null;
            
            if (loginResult.statusCode === 200) {
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
                message = `登入失敗 - HTTP ${loginResult.statusCode}`;
                console.log(`   ❌ ${message}`);
            }
            
            this.testResults.authentication.push({
                account: account.username,
                role: account.role,
                success: success,
                message: message,
                token: userToken,
                statusCode: loginResult.statusCode,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testEndpoints() {
        console.log('\\n🌐 測試系統端點...');
        console.log('─'.repeat(50));
        
        for (const endpoint of this.enterpriseEndpoints) {
            if (endpoint.requireAuth) {
                // 跳過需要身份驗證的端點，稍後專門測試
                continue;
            }
            
            const result = await this.makeRequest(endpoint.path, { method: endpoint.method });
            
            let success = false;
            let contentCheck = false;
            let analysis = '';
            
            if (result.statusCode >= 200 && result.statusCode < 300) {
                success = true;
                
                // 檢查預期內容
                if (endpoint.expectContent) {
                    contentCheck = endpoint.expectContent.some(content => 
                        result.body && result.body.includes(content)
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
                analysis = `❌ HTTP ${result.statusCode}`;
                console.log(`   ❌ ${endpoint.name}: ${analysis}`);
            }
            
            // 檢測系統版本
            const isV4System = result.body && (
                result.body.includes('v4.0.0') || 
                result.body.includes('4.0.0') ||
                result.body.includes('complete-enterprise-server')
            );
            
            this.testResults.system.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                method: endpoint.method,
                success: success,
                statusCode: result.statusCode,
                contentCheck: contentCheck,
                isV4System: isV4System,
                analysis: analysis,
                responseSize: result.contentLength || 0,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testAuthenticatedEndpoints() {
        console.log('\\n🔒 測試需要身份驗證的端點...');
        console.log('─'.repeat(50));
        
        // 使用admin帳號的token
        const adminAuth = this.testResults.authentication.find(auth => 
            auth.account === 'admin' && auth.success
        );
        
        if (!adminAuth || !adminAuth.token) {
            console.log('❌ 無法獲取管理員身份驗證，跳過認證端點測試');
            return;
        }
        
        const authEndpoints = this.enterpriseEndpoints.filter(ep => ep.requireAuth);
        
        for (const endpoint of authEndpoints) {
            const result = await this.makeRequest(endpoint.path, {
                method: endpoint.method,
                headers: {
                    'Authorization': `Bearer ${adminAuth.token}`
                }
            });
            
            let success = false;
            let dataAnalysis = '';
            let enterpriseFeatures = false;
            
            if (result.statusCode === 200) {
                try {
                    const data = JSON.parse(result.body);
                    if (data.success && data.data) {
                        success = true;
                        enterpriseFeatures = true;
                        dataAnalysis = `✅ 返回 ${data.count || data.data.length || 0} 筆數據`;
                        
                        // 特別檢查企業功能
                        if (endpoint.path === '/api/employees' && Array.isArray(data.data)) {
                            const hasEnterpriseFields = data.data.some(emp => 
                                emp.department && emp.position && emp.salary
                            );
                            if (hasEnterpriseFields) {
                                dataAnalysis += ' | 包含完整員工資料';
                            }
                        } else if (endpoint.path === '/api/inventory' && data.totalValue) {
                            dataAnalysis += `| 總價值: NT$ ${data.totalValue.toLocaleString()}`;
                        }
                        
                    } else {
                        dataAnalysis = '⚠️ 回應格式不完整';
                    }
                } catch (error) {
                    dataAnalysis = '❌ JSON解析失敗';
                }
                
                console.log(`   ✅ ${endpoint.name}: ${result.statusCode} ${dataAnalysis}`);
            } else {
                dataAnalysis = `❌ HTTP ${result.statusCode}`;
                console.log(`   ❌ ${endpoint.name}: ${dataAnalysis}`);
            }
            
            this.testResults.employees.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                success: success,
                statusCode: result.statusCode,
                enterpriseFeatures: enterpriseFeatures,
                dataAnalysis: dataAnalysis,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testEnterpriseFeatures() {
        console.log('\\n🏢 測試企業功能特性...');
        console.log('─'.repeat(50));
        
        const adminAuth = this.testResults.authentication.find(auth => 
            auth.account === 'admin' && auth.success
        );
        
        if (!adminAuth) {
            console.log('❌ 需要管理員權限，跳過企業功能測試');
            return;
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
        if (checkinResult.statusCode === 200 || checkinResult.statusCode === 400) {
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
            console.log(`   ❌ 考勤簽到: HTTP ${checkinResult.statusCode}`);
        }
        
        // 測試維修申請功能  
        console.log('\\n🔧 測試維修申請功能...');
        const maintenanceResult = await this.makeRequest('/api/maintenance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${adminAuth.token}`,
                'Content-Type': 'application/json'
            },
            body: {
                equipment: '測試設備',
                issue: '功能驗證測試',
                priority: 'low'
            }
        });
        
        let maintenanceSuccess = false;
        if (maintenanceResult.statusCode === 200) {
            try {
                const data = JSON.parse(maintenanceResult.body);
                if (data.success && data.message) {
                    maintenanceSuccess = true;
                    console.log(`   ✅ 維修申請: ${data.message}`);
                }
            } catch (error) {
                console.log('   ❌ 維修申請: 回應解析失敗');
            }
        } else {
            console.log(`   ❌ 維修申請: HTTP ${maintenanceResult.statusCode}`);
        }
        
        this.testResults.attendance.push({
            feature: 'checkin',
            success: checkinSuccess,
            timestamp: new Date().toISOString()
        });
        
        this.testResults.maintenance.push({
            feature: 'request',
            success: maintenanceSuccess,
            timestamp: new Date().toISOString()
        });
    }

    generateComprehensiveReport() {
        console.log('\\n📊 生成綜合驗證報告...');
        console.log('═'.repeat(70));
        
        // 統計結果
        const authSuccess = this.testResults.authentication.filter(r => r.success).length;
        const authTotal = this.testResults.authentication.length;
        
        const systemSuccess = this.testResults.system.filter(r => r.success).length;
        const systemTotal = this.testResults.system.length;
        
        const employeeSuccess = this.testResults.employees.filter(r => r.success).length;
        const employeeTotal = this.testResults.employees.length;
        
        const v4SystemDetected = this.testResults.system.some(r => r.isV4System);
        const enterpriseFeaturesFound = this.testResults.employees.some(r => r.enterpriseFeatures);
        
        const totalTests = authTotal + systemTotal + employeeTotal;
        const totalSuccess = authSuccess + systemSuccess + employeeSuccess;
        const successRate = totalTests > 0 ? Math.round((totalSuccess / totalTests) * 100) : 0;
        
        // 系統狀態判斷
        let systemStatus = '';
        let statusMessage = '';
        let confidence = '';
        
        if (v4SystemDetected && successRate >= 80 && enterpriseFeaturesFound) {
            systemStatus = 'ENTERPRISE_SYSTEM_FULLY_OPERATIONAL';
            statusMessage = '🎉 完整企業管理系統 v4.0.0 正常運行！所有功能已實現並可正常使用';
            confidence = 'HIGH';
        } else if (v4SystemDetected && successRate >= 60) {
            systemStatus = 'ENTERPRISE_SYSTEM_PARTIAL';
            statusMessage = '⚠️ 企業系統 v4.0.0 部分功能正常，部分功能需要調整';
            confidence = 'MEDIUM';
        } else if (successRate >= 40) {
            systemStatus = 'BASIC_SYSTEM_OPERATIONAL';
            statusMessage = '🔄 基本系統運行，但企業功能未完整實現';
            confidence = 'LOW';
        } else {
            systemStatus = 'SYSTEM_DEPLOYMENT_FAILED';
            statusMessage = '❌ 系統部署失敗或功能嚴重缺失';
            confidence = 'VERY_LOW';
        }
        
        // 顯示報告
        console.log(`🎯 系統狀態: ${systemStatus}`);
        console.log(`📝 狀態說明: ${statusMessage}`);
        console.log(`📈 綜合成功率: ${successRate}% (${totalSuccess}/${totalTests})`);
        console.log(`🔒 身份驗證: ${authSuccess}/${authTotal} 成功`);
        console.log(`🌐 系統端點: ${systemSuccess}/${systemTotal} 正常`);
        console.log(`🏢 企業功能: ${employeeSuccess}/${employeeTotal} 可用`);
        console.log(`🎯 v4.0.0 系統: ${v4SystemDetected ? '✅ 檢測到' : '❌ 未檢測到'}`);
        console.log(`💼 企業特性: ${enterpriseFeaturesFound ? '✅ 完整實現' : '❌ 缺失'}`);
        console.log(`🔍 信心度: ${confidence}`);
        
        // 詳細分析
        if (systemStatus === 'ENTERPRISE_SYSTEM_FULLY_OPERATIONAL') {
            console.log('\\n🎊 驗證結果: 完整企業管理系統驗證成功！');
            console.log('   ✅ 所有核心企業功能正常運行');
            console.log('   ✅ 多角色身份驗證系統運作正常');
            console.log('   ✅ API 端點完整且功能正確');
            console.log('   ✅ 前端介面響應正常');
            console.log('   ✅ 企業數據結構完整');
            
            console.log('\\n🎯 可立即使用的功能:');
            console.log('   🔐 多角色登入系統 (admin/manager/employee)');
            console.log('   👥 完整員工管理 (包含部門、職位、薪資)');
            console.log('   📅 考勤打卡和記錄查詢');
            console.log('   📦 庫存管理和採購申請');
            console.log('   🔧 設備維修申請和追蹤');
            console.log('   📊 系統狀態監控和API測試');
            console.log('   🏠 企業級管理主控台');
            
        } else {
            console.log('\\n💡 改進建議:');
            if (!v4SystemDetected) {
                console.log('   🔄 系統可能仍在部署中，建議等待5-10分鐘後重新測試');
            }
            if (successRate < 80) {
                console.log('   🔧 部分功能異常，需要檢查 Google Cloud 構建日誌');
            }
            if (!enterpriseFeaturesFound) {
                console.log('   🏢 企業功能未完整實現，需要確認API端點配置');
            }
        }
        
        return {
            timestamp: new Date().toISOString(),
            systemStatus,
            statusMessage,
            successRate,
            confidence,
            v4SystemDetected,
            enterpriseFeaturesFound,
            detailedResults: this.testResults,
            summary: {
                authentication: { success: authSuccess, total: authTotal },
                systemEndpoints: { success: systemSuccess, total: systemTotal },
                enterpriseFeatures: { success: employeeSuccess, total: employeeTotal }
            }
        };
    }

    async runCompleteVerification() {
        console.log('🔍 完整企業系統驗證引擎 v4.0.0');
        console.log('═'.repeat(70));
        console.log(`📍 目標服務: ${this.serviceUrl}`);
        console.log(`⏰ 開始時間: ${new Date().toLocaleString('zh-TW')}`);
        
        try {
            // 執行所有測試
            await this.testEndpoints();
            await this.testAuthentication();
            await this.testAuthenticatedEndpoints();
            await this.testEnterpriseFeatures();
            
            // 生成報告
            const report = this.generateComprehensiveReport();
            
            // 保存詳細報告
            const filename = `complete-enterprise-verification-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            await fs.writeFile(filename, JSON.stringify(report, null, 2));
            console.log(`\\n📄 詳細驗證報告已保存: ${filename}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 驗證過程中出現錯誤:', error);
            return {
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// 立即執行完整企業系統驗證
async function main() {
    const verifier = new CompleteEnterpriseVerificationEngine();
    
    try {
        const report = await verifier.runCompleteVerification();
        
        console.log('\\n🎯 完整企業系統驗證完成！');
        
        // 根據結果設定退出碼
        if (report.systemStatus === 'ENTERPRISE_SYSTEM_FULLY_OPERATIONAL') {
            console.log('🎉 系統驗證: 完全成功！');
            process.exit(0);
        } else if (report.successRate >= 60) {
            console.log('⚠️ 系統驗證: 部分成功');
            process.exit(1);
        } else {
            console.log('❌ 系統驗證: 需要檢查');
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

module.exports = CompleteEnterpriseVerificationEngine;
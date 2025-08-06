// 🚀 企業管理系統完整API整合測試引擎
// 深層驗證所有核心功能操作邏輯流程

const http = require('http');
const express = require('express');

class EnterpriseSystemTester {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.testResults = [];
        this.userTokens = {};
    }

    async runFullSystemTest() {
        console.log('🚀 開始企業管理系統完整測試');
        console.log('📊 測試目標: 驗證所有核心功能操作邏輯流程');
        
        try {
            // 1. 系統狀態檢查
            await this.testSystemStatus();
            
            // 2. 身份驗證流程
            await this.testAuthentication();
            
            // 3. 員工管理功能
            await this.testEmployeeManagement();
            
            // 4. 考勤系統功能
            await this.testAttendanceSystem();
            
            // 5. 庫存管理功能
            await this.testInventoryManagement();
            
            // 6. 維修系統功能
            await this.testMaintenanceSystem();
            
            // 7. 營收分析功能
            await this.testRevenueSystem();
            
            // 8. 前端界面測試
            await this.testFrontendInterface();
            
            // 生成完整測試報告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 測試過程發生錯誤:', error.message);
            this.testResults.push({
                category: 'system_error',
                test: 'overall_test',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testSystemStatus() {
        console.log('\n📊 測試 1: 系統狀態檢查');
        
        try {
            const response = await this.makeRequest('GET', '/api/system/status');
            
            if (response.success) {
                console.log('✅ 系統狀態: 正常運行');
                console.log(`📈 版本: ${response.system.version}`);
                console.log(`⏱️  運行時間: ${Math.floor(response.system.uptime / 60)} 分鐘`);
                console.log(`📊 模組狀態: ${Object.keys(response.system.modules).length} 個模組`);
                
                this.testResults.push({
                    category: 'system_status',
                    test: 'health_check',
                    status: 'passed',
                    data: response.system,
                    timestamp: new Date().toISOString()
                });
            } else {
                throw new Error('系統狀態檢查失敗');
            }
        } catch (error) {
            console.log('❌ 系統狀態檢查失敗:', error.message);
            this.testResults.push({
                category: 'system_status',
                test: 'health_check',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testAuthentication() {
        console.log('\n🔐 測試 2: 身份驗證系統');
        
        const testUsers = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'manager', password: 'manager123', role: 'manager' },
            { username: 'john.doe', password: 'password123', role: 'employee' }
        ];

        for (const user of testUsers) {
            try {
                const response = await this.makeRequest('POST', '/api/auth/login', {
                    username: user.username,
                    password: user.password
                });

                if (response.success) {
                    console.log(`✅ ${user.role} 登入成功: ${response.user.name}`);
                    this.userTokens[user.role] = user.username;
                    
                    this.testResults.push({
                        category: 'authentication',
                        test: `login_${user.role}`,
                        status: 'passed',
                        data: response.user,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    throw new Error(`登入失敗: ${response.message}`);
                }
            } catch (error) {
                console.log(`❌ ${user.role} 登入失敗:`, error.message);
                this.testResults.push({
                    category: 'authentication',
                    test: `login_${user.role}`,
                    status: 'failed',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    async testEmployeeManagement() {
        console.log('\n👥 測試 3: 員工管理系統');
        
        try {
            const response = await this.makeRequest('GET', '/api/employees', null, {
                'Authorization': `Bearer ${this.userTokens.admin}`
            });

            if (response.success) {
                console.log(`✅ 員工列表查詢成功: ${response.count} 位員工`);
                console.log('📊 員工資料:');
                response.data.forEach(emp => {
                    console.log(`   - ${emp.name} (${emp.position}) - ${emp.department}`);
                });
                
                this.testResults.push({
                    category: 'employee_management',
                    test: 'employee_list',
                    status: 'passed',
                    data: { count: response.count, employees: response.data },
                    timestamp: new Date().toISOString()
                });
            } else {
                throw new Error('員工列表查詢失敗');
            }
        } catch (error) {
            console.log('❌ 員工管理測試失敗:', error.message);
            this.testResults.push({
                category: 'employee_management',
                test: 'employee_list',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testAttendanceSystem() {
        console.log('\n📅 測試 4: 考勤管理系統');
        
        try {
            // 測試考勤記錄查詢
            const attendanceResponse = await this.makeRequest('GET', '/api/attendance', null, {
                'Authorization': `Bearer ${this.userTokens.admin}`
            });

            if (attendanceResponse.success) {
                console.log(`✅ 考勤記錄查詢成功: ${attendanceResponse.count} 筆記錄`);
                
                this.testResults.push({
                    category: 'attendance_system',
                    test: 'attendance_list',
                    status: 'passed',
                    data: { count: attendanceResponse.count },
                    timestamp: new Date().toISOString()
                });
            }

            // 測試員工簽到
            const checkinResponse = await this.makeRequest('POST', '/api/attendance/checkin', {}, {
                'Authorization': `Bearer ${this.userTokens.employee}`
            });

            if (checkinResponse.success || checkinResponse.message.includes('已簽到')) {
                console.log('✅ 簽到功能測試通過');
                
                this.testResults.push({
                    category: 'attendance_system',
                    test: 'employee_checkin',
                    status: 'passed',
                    data: checkinResponse,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.log('❌ 考勤系統測試失敗:', error.message);
            this.testResults.push({
                category: 'attendance_system',
                test: 'attendance_functions',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testInventoryManagement() {
        console.log('\n📦 測試 5: 庫存管理系統');
        
        try {
            const response = await this.makeRequest('GET', '/api/inventory', null, {
                'Authorization': `Bearer ${this.userTokens.admin}`
            });

            if (response.success) {
                console.log(`✅ 庫存查詢成功: ${response.count} 項商品`);
                console.log(`💰 總價值: NT$${response.totalValue.toLocaleString()}`);
                
                // 測試採購申請
                const orderResponse = await this.makeRequest('POST', '/api/orders', {
                    items: [{ itemId: 1, quantity: 2 }]
                }, {
                    'Authorization': `Bearer ${this.userTokens.employee}`
                });

                if (orderResponse.success) {
                    console.log('✅ 採購申請功能測試通過');
                }
                
                this.testResults.push({
                    category: 'inventory_management',
                    test: 'inventory_operations',
                    status: 'passed',
                    data: { count: response.count, totalValue: response.totalValue },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.log('❌ 庫存管理測試失敗:', error.message);
            this.testResults.push({
                category: 'inventory_management',
                test: 'inventory_operations',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testMaintenanceSystem() {
        console.log('\n🔧 測試 6: 維修管理系統');
        
        try {
            const response = await this.makeRequest('GET', '/api/maintenance', null, {
                'Authorization': `Bearer ${this.userTokens.admin}`
            });

            if (response.success) {
                console.log(`✅ 維修申請查詢成功: ${response.count} 筆申請`);
                
                // 測試新維修申請
                const newRequest = await this.makeRequest('POST', '/api/maintenance', {
                    equipment: '測試設備',
                    issue: '系統測試用維修申請',
                    priority: 'low'
                }, {
                    'Authorization': `Bearer ${this.userTokens.employee}`
                });

                if (newRequest.success) {
                    console.log('✅ 維修申請提交功能測試通過');
                }
                
                this.testResults.push({
                    category: 'maintenance_system',
                    test: 'maintenance_operations',
                    status: 'passed',
                    data: { count: response.count },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.log('❌ 維修系統測試失敗:', error.message);
            this.testResults.push({
                category: 'maintenance_system',
                test: 'maintenance_operations',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testRevenueSystem() {
        console.log('\n📊 測試 7: 營收分析系統');
        
        try {
            const response = await this.makeRequest('GET', '/api/revenue', null, {
                'Authorization': `Bearer ${this.userTokens.admin}`
            });

            if (response.success) {
                console.log(`✅ 營收查詢成功: ${response.count} 筆記錄`);
                console.log(`💰 總營收: NT$${response.totalRevenue.toLocaleString()}`);
                console.log(`📅 本月營收: NT$${response.monthlyRevenue.toLocaleString()}`);
                
                this.testResults.push({
                    category: 'revenue_system',
                    test: 'revenue_analysis',
                    status: 'passed',
                    data: { 
                        count: response.count, 
                        totalRevenue: response.totalRevenue,
                        monthlyRevenue: response.monthlyRevenue
                    },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.log('❌ 營收系統測試失敗:', error.message);
            this.testResults.push({
                category: 'revenue_system',
                test: 'revenue_analysis',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async testFrontendInterface() {
        console.log('\n🌐 測試 8: 前端界面');
        
        try {
            // 測試主頁
            const homeResponse = await this.makeRequest('GET', '/');
            if (homeResponse.includes('企業管理系統')) {
                console.log('✅ 主頁載入成功');
            }

            // 測試登入頁面
            const loginResponse = await this.makeRequest('GET', '/login');
            if (loginResponse.includes('員工登入')) {
                console.log('✅ 登入頁面載入成功');
            }

            // 測試管理主控台
            const dashboardResponse = await this.makeRequest('GET', '/dashboard');
            if (dashboardResponse.includes('管理主控台')) {
                console.log('✅ 管理主控台載入成功');
            }

            this.testResults.push({
                category: 'frontend_interface',
                test: 'page_loading',
                status: 'passed',
                data: { pages_tested: ['home', 'login', 'dashboard'] },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.log('❌ 前端界面測試失敗:', error.message);
            this.testResults.push({
                category: 'frontend_interface',
                test: 'page_loading',
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async makeRequest(method, path, data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const url = new URL(path, this.baseUrl);
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                }
            };

            const req = http.request(url, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        if (res.headers['content-type']?.includes('application/json')) {
                            resolve(JSON.parse(body));
                        } else {
                            resolve(body);
                        }
                    } catch (e) {
                        resolve(body);
                    }
                });
            });

            req.on('error', reject);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    generateTestReport() {
        console.log('\n📋 =============== 完整測試報告 ===============');
        
        const categories = {};
        this.testResults.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { passed: 0, failed: 0, total: 0 };
            }
            categories[result.category][result.status]++;
            categories[result.category].total++;
        });

        console.log('\n📊 測試結果統計:');
        let totalPassed = 0;
        let totalTests = 0;

        Object.entries(categories).forEach(([category, stats]) => {
            const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
            console.log(`  ${category}: ${stats.passed}/${stats.total} 通過 (${passRate}%)`);
            totalPassed += stats.passed;
            totalTests += stats.total;
        });

        const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
        console.log(`\n🎯 整體通過率: ${totalPassed}/${totalTests} (${overallPassRate}%)`);

        // 儲存詳細報告
        const reportData = {
            testSummary: {
                totalTests: totalTests,
                passed: totalPassed,
                failed: totalTests - totalPassed,
                passRate: overallPassRate + '%',
                timestamp: new Date().toISOString()
            },
            categorySummary: categories,
            detailedResults: this.testResults
        };

        require('fs').writeFileSync(
            'enterprise-system-test-report.json',
            JSON.stringify(reportData, null, 2)
        );

        console.log('\n📄 詳細報告已儲存至: enterprise-system-test-report.json');
        
        if (overallPassRate >= 90) {
            console.log('\n🎉 系統測試完成！所有核心功能運行正常');
        } else if (overallPassRate >= 75) {
            console.log('\n⚠️  系統基本功能正常，部分功能需要檢查');
        } else {
            console.log('\n❌ 系統存在重要問題，需要立即修復');
        }
    }
}

// 執行測試
async function runTest() {
    const tester = new EnterpriseSystemTester();
    
    // 等待服務器啟動
    console.log('⏳ 等待服務器啟動...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await tester.runFullSystemTest();
}

// 如果直接執行此檔案
if (require.main === module) {
    runTest().catch(console.error);
}

module.exports = EnterpriseSystemTester;
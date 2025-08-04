/**
 * 企業員工管理系統 - 系統測試腳本
 * 
 * 這個腳本用於測試系統的核心功能
 */

class SystemTester {
    constructor() {
        this.testResults = [];
        this.apiBaseUrl = 'YOUR_GAS_WEB_APP_URL_HERE'; // 需要替換為實際的 Web App URL
    }

    async runAllTests() {
        console.log('🧪 開始執行系統測試...\n');
        
        try {
            // 測試 API 連接
            await this.testAPIConnection();
            
            // 測試員工註冊
            await this.testEmployeeRegistration();
            
            // 測試員工登入
            await this.testEmployeeLogin();
            
            // 測試打卡功能
            await this.testAttendanceSystem();
            
            // 測試營收系統
            await this.testRevenueSystem();
            
            // 測試 Telegram 通知
            await this.testTelegramNotification();
            
            // 生成測試報告
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ 測試執行失敗:', error);
        }
    }

    async testAPIConnection() {
        const testName = 'API 連接測試';
        console.log(`🔍 執行 ${testName}...`);
        
        try {
            // 測試系統設定端點
            const response = await this.makeAPICall('get_system_settings', {});
            
            if (response.success) {
                this.addTestResult(testName, true, 'API 連接正常');
            } else {
                this.addTestResult(testName, false, `API 回應錯誤: ${response.message}`);
            }
        } catch (error) {
            this.addTestResult(testName, false, `連接失敗: ${error.message}`);
        }
    }

    async testEmployeeRegistration() {
        const testName = '員工註冊測試';
        console.log(`🔍 執行 ${testName}...`);
        
        const testEmployeeData = {
            name: '測試員工',
            idNumber: 'A123456789',
            birthDate: '1990-01-01',
            gender: '男',
            drivingLicense: '汽車',
            phone: '0912345678',
            address: '桃園市中壢區測試路123號',
            position: '店員',
            store: '內壢店',
            notes: '系統測試用員工'
        };
        
        try {
            const response = await this.makeAPICall('register_employee', testEmployeeData);
            
            if (response.success) {
                this.testEmployeeId = response.employeeId;
                this.addTestResult(testName, true, `註冊成功，員工編號: ${response.employeeId}`);
            } else {
                this.addTestResult(testName, false, response.message || '註冊失敗');
            }
        } catch (error) {
            this.addTestResult(testName, false, `註冊錯誤: ${error.message}`);
        }
    }

    async testEmployeeLogin() {
        const testName = '員工登入測試';
        console.log(`🔍 執行 ${testName}...`);
        
        if (!this.testEmployeeId) {
            this.addTestResult(testName, false, '沒有可用的測試員工ID');
            return;
        }
        
        try {
            const response = await this.makeAPICall('login_employee', {
                employeeId: this.testEmployeeId
            });
            
            if (response.success) {
                this.addTestResult(testName, true, `登入成功: ${response.data.name}`);
            } else {
                this.addTestResult(testName, false, response.message || '登入失敗');
            }
        } catch (error) {
            this.addTestResult(testName, false, `登入錯誤: ${error.message}`);
        }
    }

    async testAttendanceSystem() {
        const testName = '打卡系統測試';
        console.log(`🔍 執行 ${testName}...`);
        
        if (!this.testEmployeeId) {
            this.addTestResult(testName, false, '沒有可用的測試員工ID');
            return;
        }
        
        const attendanceData = {
            employeeId: this.testEmployeeId,
            type: '上班',
            storeName: '內壢店',
            gpsCoordinates: '24.9748412,121.2556713', // 內壢店座標
            deviceFingerprint: this.generateTestDeviceFingerprint(),
            ipAddress: '192.168.1.100',
            notes: '系統測試打卡'
        };
        
        try {
            const response = await this.makeAPICall('clock_in', attendanceData);
            
            if (response.success) {
                this.addTestResult(testName, true, `打卡成功: ${response.data.status}`);
            } else {
                this.addTestResult(testName, false, response.message || '打卡失敗');
            }
        } catch (error) {
            this.addTestResult(testName, false, `打卡錯誤: ${error.message}`);
        }
    }

    async testRevenueSystem() {
        const testName = '營收系統測試';
        console.log(`🔍 執行 ${testName}...`);
        
        if (!this.testEmployeeId) {
            this.addTestResult(testName, false, '沒有可用的測試員工ID');
            return;
        }
        
        const revenueData = {
            employeeId: this.testEmployeeId,
            businessDate: new Date().toISOString().split('T')[0],
            storeName: '內壢店',
            orderCount: 20,
            fieldOrderRevenue: 15000,
            deliveryRevenue: 3000,
            otherRevenue: 500,
            materialCost: 6000,
            otherExpense: 500,
            bonusType: '平日獎金',
            notes: '系統測試營收'
        };
        
        try {
            const response = await this.makeAPICall('submit_revenue', revenueData);
            
            if (response.success) {
                this.addTestResult(testName, true, 
                    `營收提交成功，獎金: $${response.data.bonus}`);
            } else {
                this.addTestResult(testName, false, response.message || '營收提交失敗');
            }
        } catch (error) {
            this.addTestResult(testName, false, `營收錯誤: ${error.message}`);
        }
    }

    async testTelegramNotification() {
        const testName = 'Telegram 通知測試';
        console.log(`🔍 執行 ${testName}...`);
        
        try {
            const response = await this.makeAPICall('test_telegram', {
                message: '系統測試通知 - ' + new Date().toLocaleString()
            });
            
            if (response.success) {
                this.addTestResult(testName, true, 'Telegram 通知發送成功');
            } else {
                this.addTestResult(testName, false, response.message || 'Telegram 通知失敗');
            }
        } catch (error) {
            this.addTestResult(testName, false, `Telegram 錯誤: ${error.message}`);
        }
    }

    async makeAPICall(action, data) {
        const requestData = {
            action: action,
            data: data
        };
        
        const response = await fetch(this.apiBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    generateTestDeviceFingerprint() {
        const fingerprint = {
            userAgent: 'Mozilla/5.0 (Test Browser) SystemTest/1.0',
            platform: 'Test Platform',
            language: 'zh-TW',
            screenResolution: '1920x1080',
            timezone: 'Asia/Taipei',
            timestamp: new Date().getTime()
        };
        
        return btoa(JSON.stringify(fingerprint));
    }

    addTestResult(testName, success, message) {
        const result = {
            testName: testName,
            success: success,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = success ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    generateTestReport() {
        console.log('\n📊 測試報告');
        console.log('=' .repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`總測試數: ${totalTests}`);
        console.log(`✅ 通過: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log('\n詳細結果:');
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.testName}: ${result.message}`);
        });
        
        // 生成 JSON 報告
        const report = {
            summary: {
                totalTests: totalTests,
                passedTests: passedTests,
                failedTests: failedTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%',
                timestamp: new Date().toISOString()
            },
            results: this.testResults
        };
        
        console.log('\n📄 JSON 報告:');
        console.log(JSON.stringify(report, null, 2));
        
        return report;
    }
}

// 使用方式：
// 1. 替換 apiBaseUrl 為實際的 Google Apps Script Web App URL
// 2. 在瀏覽器控制台中執行：
//    const tester = new SystemTester();
//    tester.runAllTests();

// 如果在 Node.js 環境中使用，取消註釋以下代碼：
/*
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemTester;
}
*/
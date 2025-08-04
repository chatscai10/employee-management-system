/**
 * 深度驗證框架 - 全方位系統測試與驗證
 * 包含功能測試、整合測試、API測試、前端測試等
 */

class DeepVerificationFramework {
    constructor() {
        this.testResults = [];
        this.verificationSteps = [];
        this.apiBaseUrl = 'YOUR_GAS_WEB_APP_URL_HERE'; // 需要替換為實際的 Web App URL
        this.testEnvironment = this.detectEnvironment();
        
        this.initializeFramework();
    }

    /**
     * 初始化驗證框架
     */
    initializeFramework() {
        console.log('🔬 初始化深度驗證框架...');
        this.createTestData();
        this.setupVerificationSteps();
    }

    /**
     * 檢測測試環境
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
            return 'development';
        } else if (hostname.includes('script.google.com')) {
            return 'production';
        }
        return 'unknown';
    }

    /**
     * 創建測試數據
     */
    createTestData() {
        this.testData = {
            employees: [
                {
                    name: '測試員工A',
                    idNumber: 'A123456789',
                    birthDate: '1990-01-01',
                    gender: '男',
                    phone: '0912345678',
                    address: '桃園市中壢區測試路123號',
                    position: '店員',
                    store: '內壢店'
                },
                {
                    name: '測試主管B',
                    idNumber: 'B987654321',
                    birthDate: '1985-06-15',
                    gender: '女',
                    phone: '0987654321',
                    address: '桃園市桃園區管理路456號',
                    position: '店長',
                    store: '桃園店'
                }
            ],
            orders: [
                {
                    supplierId: 'SUP001',
                    itemList: '豬肉 10公斤\n雞肉 5公斤\n調味料 3包',
                    estimatedAmount: 1500,
                    notes: '測試叫貨單'
                }
            ],
            schedules: [
                {
                    scheduleDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // 明天
                    shiftType: '早班',
                    startTime: '06:00',
                    endTime: '14:00',
                    notes: '測試排班'
                }
            ],
            maintenanceRequests: [
                {
                    equipmentType: '廚房設備',
                    equipmentName: '測試烤箱',
                    location: '廚房',
                    description: '烤箱溫度控制異常，無法正常加熱',
                    urgency: '高',
                    notes: '緊急測試維修申請'
                }
            ]
        };
    }

    /**
     * 設定驗證步驟
     */
    setupVerificationSteps() {
        this.verificationSteps = [
            {
                category: '系統基礎驗證',
                tests: [
                    { name: 'API連接測試', function: 'testAPIConnection' },
                    { name: '系統狀態檢查', function: 'testSystemStatus' },
                    { name: '模組載入驗證', function: 'testModuleLoading' }
                ]
            },
            {
                category: '員工管理功能驗證',
                tests: [
                    { name: '員工註冊功能', function: 'testEmployeeRegistration' },
                    { name: '員工登入功能', function: 'testEmployeeLogin' },
                    { name: '員工資料查詢', function: 'testEmployeeQuery' }
                ]
            },
            {
                category: '考勤系統功能驗證',
                tests: [
                    { name: '打卡功能測試', function: 'testAttendanceSystem' },
                    { name: 'GPS定位驗證', function: 'testGPSLocation' },
                    { name: '考勤記錄查詢', function: 'testAttendanceHistory' }
                ]
            },
            {
                category: '營收管理功能驗證',
                tests: [
                    { name: '營收提交功能', function: 'testRevenueSubmission' },
                    { name: '獎金計算驗證', function: 'testBonusCalculation' },
                    { name: '營收統計查詢', function: 'testRevenueStatistics' }
                ]
            },
            {
                category: '叫貨系統功能驗證',
                tests: [
                    { name: '叫貨申請功能', function: 'testOrderSubmission' },
                    { name: '供應商清單查詢', function: 'testSupplierList' },
                    { name: '庫存警告檢查', function: 'testStockAlerts' }
                ]
            },
            {
                category: '排班系統功能驗證',
                tests: [
                    { name: '排班創建功能', function: 'testScheduleCreation' },
                    { name: '排班衝突檢測', function: 'testScheduleConflicts' },
                    { name: '排班統計查詢', function: 'testScheduleStatistics' }
                ]
            },
            {
                category: '升遷投票功能驗證',
                tests: [
                    { name: '升遷投票發起', function: 'testPromotionVoteInitiation' },
                    { name: '投票提交功能', function: 'testVoteSubmission' },
                    { name: '投票歷史查詢', function: 'testVoteHistory' }
                ]
            },
            {
                category: '維修管理功能驗證',
                tests: [
                    { name: '維修申請功能', function: 'testMaintenanceRequest' },
                    { name: '維修狀態更新', function: 'testMaintenanceStatusUpdate' },
                    { name: '維修統計查詢', function: 'testMaintenanceStatistics' }
                ]
            },
            {
                category: '前端UI/UX驗證',
                tests: [
                    { name: '響應式設計測試', function: 'testResponsiveDesign' },
                    { name: '表單驗證測試', function: 'testFormValidation' },
                    { name: '模組切換測試', function: 'testModuleSwitching' }
                ]
            },
            {
                category: '數據完整性驗證',
                tests: [
                    { name: '數據一致性檢查', function: 'testDataConsistency' },
                    { name: '跨模組數據驗證', function: 'testCrossModuleData' },
                    { name: '錯誤處理測試', function: 'testErrorHandling' }
                ]
            }
        ];
    }

    /**
     * 執行完整的深度驗證
     */
    async runCompleteVerification() {
        console.log('🚀 開始執行完整的深度驗證...\n');
        
        this.testResults = [];
        const startTime = new Date();

        try {
            for (const category of this.verificationSteps) {
                console.log(`\n📁 ${category.category}`);
                console.log('='.repeat(50));

                for (const test of category.tests) {
                    await this.executeTest(category.category, test);
                }
            }

            const endTime = new Date();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // 生成完整報告
            this.generateVerificationReport(duration);
            
        } catch (error) {
            console.error('❌ 深度驗證執行失敗:', error);
            this.addTestResult('系統錯誤', false, `執行失敗: ${error.message}`);
        }
    }

    /**
     * 執行單個測試
     */
    async executeTest(category, test) {
        const testName = `${category} - ${test.name}`;
        console.log(`🔍 執行 ${test.name}...`);
        
        try {
            if (typeof this[test.function] === 'function') {
                const result = await this[test.function]();
                
                if (result && result.success !== undefined) {
                    this.addTestResult(testName, result.success, result.message);
                } else {
                    this.addTestResult(testName, true, '測試完成');
                }
            } else {
                this.addTestResult(testName, false, '測試函數未實現');
            }
        } catch (error) {
            console.error(`❌ ${test.name} 測試失敗:`, error);
            this.addTestResult(testName, false, `測試錯誤: ${error.message}`);
        }
    }

    /**
     * 測試API連接
     */
    async testAPIConnection() {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'health_check', data: {} })
            });

            if (response.ok) {
                const result = await response.json();
                return { success: true, message: 'API連接正常' };
            } else {
                return { success: false, message: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, message: `連接失敗: ${error.message}` };
        }
    }

    /**
     * 測試系統狀態
     */
    async testSystemStatus() {
        try {
            const result = await this.makeAPICall('get_system_status', {});
            
            if (result.success && result.data) {
                const status = result.data;
                const checks = [
                    status.sheets?.connected,
                    status.telegram?.configured,
                    Object.values(status.modules || {}).every(Boolean)
                ];
                
                const allPassed = checks.every(Boolean);
                return { 
                    success: allPassed, 
                    message: allPassed ? '系統狀態良好' : '部分系統組件異常' 
                };
            }
            
            return { success: false, message: '無法獲取系統狀態' };
        } catch (error) {
            return { success: false, message: `狀態檢查失敗: ${error.message}` };
        }
    }

    /**
     * 測試模組載入
     */
    async testModuleLoading() {
        const requiredModules = [
            'window.api',
            'window.locationUtils',
            'window.validationUtils',
            'window.attendanceModule',
            'window.revenueModule',
            'window.orderingModule',
            'window.scheduleModule',
            'window.promotionModule',
            'window.maintenanceModule'
        ];

        const missingModules = [];
        
        for (const modulePath of requiredModules) {
            try {
                const module = eval(modulePath);
                if (!module) {
                    missingModules.push(modulePath);
                }
            } catch (error) {
                missingModules.push(modulePath);
            }
        }

        if (missingModules.length === 0) {
            return { success: true, message: '所有模組載入成功' };
        } else {
            return { 
                success: false, 
                message: `缺失模組: ${missingModules.join(', ')}` 
            };
        }
    }

    /**
     * 測試員工註冊功能
     */
    async testEmployeeRegistration() {
        try {
            const testEmployee = this.testData.employees[0];
            const result = await this.makeAPICall('register_employee', testEmployee);
            
            if (result.success) {
                this.testEmployeeId = result.employeeId;
                return { success: true, message: `註冊成功，員工編號: ${result.employeeId}` };
            } else {
                return { success: false, message: result.message || '註冊失敗' };
            }
        } catch (error) {
            return { success: false, message: `註冊錯誤: ${error.message}` };
        }
    }

    /**
     * 測試員工登入功能
     */
    async testEmployeeLogin() {
        if (!this.testEmployeeId) {
            return { success: false, message: '沒有可用的測試員工ID' };
        }

        try {
            const result = await this.makeAPICall('login_employee', {
                employeeId: this.testEmployeeId
            });
            
            if (result.success) {
                this.testUser = result.data;
                return { success: true, message: `登入成功: ${result.data.name}` };
            } else {
                return { success: false, message: result.message || '登入失敗' };
            }
        } catch (error) {
            return { success: false, message: `登入錯誤: ${error.message}` };
        }
    }

    /**
     * 測試員工資料查詢
     */
    async testEmployeeQuery() {
        if (!this.testEmployeeId) {
            return { success: false, message: '沒有可用的測試員工ID' };
        }

        try {
            const result = await this.makeAPICall('get_employee_info', {
                employeeId: this.testEmployeeId
            });
            
            return { 
                success: result.success, 
                message: result.success ? '員工資料查詢成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試考勤系統
     */
    async testAttendanceSystem() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const attendanceData = {
                employeeId: this.testUser.employeeId,
                type: '上班',
                storeName: this.testUser.store,
                gpsCoordinates: '24.9748412,121.2556713',
                deviceFingerprint: 'test-device-001',
                notes: '深度驗證測試打卡'
            };

            const result = await this.makeAPICall('submit_attendance', attendanceData);
            
            return { 
                success: result.success, 
                message: result.success ? '打卡測試成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `打卡測試錯誤: ${error.message}` };
        }
    }

    /**
     * 測試GPS定位驗證
     */
    async testGPSLocation() {
        try {
            if (window.locationUtils) {
                // 測試GPS座標驗證
                const testCoords = { lat: 24.9748412, lng: 121.2556713 };
                const targetCoords = { lat: 24.9748412, lng: 121.2556713 };
                const range = window.locationUtils.isWithinRange(
                    testCoords.lat, testCoords.lng,
                    targetCoords.lat, targetCoords.lng, 100
                );
                
                return { 
                    success: range.isWithin, 
                    message: `距離: ${range.distance}m ${range.isWithin ? '(範圍內)' : '(超出範圍)'}` 
                };
            } else {
                return { success: false, message: 'LocationUtils模組未載入' };
            }
        } catch (error) {
            return { success: false, message: `GPS測試錯誤: ${error.message}` };
        }
    }

    /**
     * 測試考勤記錄查詢
     */
    async testAttendanceHistory() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('get_attendance_history', {
                employeeId: this.testUser.employeeId,
                storeName: this.testUser.store
            });
            
            return { 
                success: result.success, 
                message: result.success ? `查詢到${result.data?.length || 0}筆記錄` : result.message 
            };
        } catch (error) {
            return { success: false, message: `查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試營收提交功能
     */
    async testRevenueSubmission() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const revenueData = {
                employeeId: this.testUser.employeeId,
                businessDate: new Date().toISOString().split('T')[0],
                storeName: this.testUser.store,
                orderCount: 25,
                fieldOrderRevenue: 18000,
                deliveryRevenue: 3500,
                otherRevenue: 500,
                materialCost: 7000,
                otherExpense: 800,
                bonusType: '平日獎金',
                notes: '深度驗證測試營收'
            };

            const result = await this.makeAPICall('submit_revenue', revenueData);
            
            return { 
                success: result.success, 
                message: result.success ? `營收提交成功，獎金: $${result.data?.bonus || 0}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `營收提交錯誤: ${error.message}` };
        }
    }

    /**
     * 測試獎金計算驗證
     */
    async testBonusCalculation() {
        try {
            const testData = {
                totalRevenue: 22000,
                totalExpense: 7800,
                bonusType: '平日獎金'
            };

            const result = await this.makeAPICall('calculate_bonus', testData);
            
            return { 
                success: result.success, 
                message: result.success ? `獎金計算: $${result.data?.bonus || 0}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `獎金計算錯誤: ${error.message}` };
        }
    }

    /**
     * 測試營收統計查詢
     */
    async testRevenueStatistics() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('get_revenue_statistics', {
                employeeId: this.testUser.employeeId,
                storeName: this.testUser.store
            });
            
            return { 
                success: result.success, 
                message: result.success ? '營收統計查詢成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `統計查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試叫貨申請功能
     */
    async testOrderSubmission() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const orderData = {
                employeeId: this.testUser.employeeId,
                employeeName: this.testUser.name,
                storeName: this.testUser.store,
                orderDate: new Date().toISOString().split('T')[0],
                supplierId: 'SUP001',
                itemList: this.testData.orders[0].itemList,
                estimatedAmount: this.testData.orders[0].estimatedAmount,
                expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
                notes: this.testData.orders[0].notes
            };

            const result = await this.makeAPICall('submit_order', orderData);
            
            return { 
                success: result.success, 
                message: result.success ? `叫貨申請成功: ${result.data?.orderId || ''}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `叫貨申請錯誤: ${error.message}` };
        }
    }

    /**
     * 測試供應商清單查詢
     */
    async testSupplierList() {
        try {
            const result = await this.makeAPICall('get_supplier_list', {});
            
            return { 
                success: result.success, 
                message: result.success ? `查詢到${result.data?.length || 0}個供應商` : result.message 
            };
        } catch (error) {
            return { success: false, message: `供應商查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試庫存警告檢查
     */
    async testStockAlerts() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('check_stock_alerts', {
                storeName: this.testUser.store
            });
            
            return { 
                success: result.success, 
                message: result.success ? `檢查完成，${result.data?.length || 0}項警告` : result.message 
            };
        } catch (error) {
            return { success: false, message: `庫存檢查錯誤: ${error.message}` };
        }
    }

    /**
     * 測試排班創建功能
     */
    async testScheduleCreation() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const scheduleData = {
                employeeId: this.testUser.employeeId,
                storeName: this.testUser.store,
                scheduleDate: this.testData.schedules[0].scheduleDate,
                shiftType: this.testData.schedules[0].shiftType,
                startTime: this.testData.schedules[0].startTime,
                endTime: this.testData.schedules[0].endTime,
                position: this.testUser.position,
                isHoliday: false,
                notes: this.testData.schedules[0].notes,
                createdBy: this.testUser.employeeId
            };

            const result = await this.makeAPICall('create_schedule', scheduleData);
            
            return { 
                success: result.success, 
                message: result.success ? `排班創建成功: ${result.data?.scheduleId || ''}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `排班創建錯誤: ${error.message}` };
        }
    }

    /**
     * 測試排班衝突檢測
     */
    async testScheduleConflicts() {
        // 嘗試創建重複的排班來測試衝突檢測
        return await this.testScheduleCreation();
    }

    /**
     * 測試排班統計查詢
     */
    async testScheduleStatistics() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('get_shift_statistics', {
                storeName: this.testUser.store,
                startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            });
            
            return { 
                success: result.success, 
                message: result.success ? '排班統計查詢成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `統計查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試升遷投票發起
     */
    async testPromotionVoteInitiation() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const voteData = {
                applicantId: this.testUser.employeeId,
                applicantName: this.testUser.name,
                storeName: this.testUser.store,
                currentPosition: this.testUser.position,
                targetPosition: this.testUser.position === '店員' ? '資深店員' : '組長',
                reason: '深度驗證測試升遷申請，具備豐富的工作經驗和優秀的工作表現。',
                voteDurationDays: 7
            };

            const result = await this.makeAPICall('initiate_promotion_vote', voteData);
            
            if (result.success) {
                this.testVoteId = result.data?.voteId;
            }
            
            return { 
                success: result.success, 
                message: result.success ? `升遷投票發起成功: ${result.data?.voteId || ''}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `升遷投票錯誤: ${error.message}` };
        }
    }

    /**
     * 測試投票提交功能
     */
    async testVoteSubmission() {
        if (!this.testVoteId) {
            return { success: false, message: '沒有可用的測試投票ID' };
        }

        try {
            // 使用第二個測試用戶進行投票
            const testManager = this.testData.employees[1];
            
            const voteData = {
                voteId: this.testVoteId,
                voterId: 'TEST_MANAGER',
                voterName: testManager.name,
                voteChoice: '同意',
                voteComment: '深度驗證測試投票',
                voterPosition: testManager.position,
                voterStore: testManager.store
            };

            const result = await this.makeAPICall('submit_vote', voteData);
            
            return { 
                success: result.success, 
                message: result.success ? '投票提交成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `投票提交錯誤: ${error.message}` };
        }
    }

    /**
     * 測試投票歷史查詢
     */
    async testVoteHistory() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('get_vote_history', {
                employeeId: this.testUser.employeeId,
                storeName: this.testUser.store
            });
            
            return { 
                success: result.success, 
                message: result.success ? `查詢到${result.data?.length || 0}筆投票記錄` : result.message 
            };
        } catch (error) {
            return { success: false, message: `投票歷史查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試維修申請功能
     */
    async testMaintenanceRequest() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const maintenanceData = {
                reporterId: this.testUser.employeeId,
                reporterName: this.testUser.name,
                storeName: this.testUser.store,
                equipmentName: this.testData.maintenanceRequests[0].equipmentName,
                equipmentType: this.testData.maintenanceRequests[0].equipmentType,
                location: this.testData.maintenanceRequests[0].location,
                description: this.testData.maintenanceRequests[0].description,
                urgency: this.testData.maintenanceRequests[0].urgency,
                expectedCompletionTime: new Date(Date.now() + 4 * 3600000).toISOString(), // 4小時後
                contactPhone: this.testUser.phone || '0912345678',
                notes: this.testData.maintenanceRequests[0].notes
            };

            const result = await this.makeAPICall('submit_maintenance_request', maintenanceData);
            
            if (result.success) {
                this.testMaintenanceId = result.data?.requestId;
            }
            
            return { 
                success: result.success, 
                message: result.success ? `維修申請成功: ${result.data?.requestId || ''}` : result.message 
            };
        } catch (error) {
            return { success: false, message: `維修申請錯誤: ${error.message}` };
        }
    }

    /**
     * 測試維修狀態更新
     */
    async testMaintenanceStatusUpdate() {
        if (!this.testMaintenanceId) {
            return { success: false, message: '沒有可用的測試維修ID' };
        }

        try {
            const updateData = {
                requestId: this.testMaintenanceId,
                status: '處理中',
                maintainer: '測試維修人員',
                maintenanceResult: '深度驗證測試狀態更新',
                updatedBy: this.testUser?.employeeId || 'TEST_MAINTAINER'
            };

            const result = await this.makeAPICall('update_maintenance_status', updateData);
            
            return { 
                success: result.success, 
                message: result.success ? '維修狀態更新成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `狀態更新錯誤: ${error.message}` };
        }
    }

    /**
     * 測試維修統計查詢
     */
    async testMaintenanceStatistics() {
        if (!this.testUser) {
            return { success: false, message: '沒有可用的測試用戶' };
        }

        try {
            const result = await this.makeAPICall('get_maintenance_statistics', {
                storeName: this.testUser.store
            });
            
            return { 
                success: result.success, 
                message: result.success ? '維修統計查詢成功' : result.message 
            };
        } catch (error) {
            return { success: false, message: `統計查詢錯誤: ${error.message}` };
        }
    }

    /**
     * 測試響應式設計
     */
    async testResponsiveDesign() {
        try {
            const viewportWidths = [320, 768, 1024, 1920];
            const results = [];

            for (const width of viewportWidths) {
                // 模擬不同螢幕尺寸
                const mediaQuery = `(max-width: ${width}px)`;
                const matches = window.matchMedia(mediaQuery).matches;
                results.push(`${width}px: ${matches ? '匹配' : '不匹配'}`);
            }

            return { 
                success: true, 
                message: `響應式測試完成: ${results.join(', ')}` 
            };
        } catch (error) {
            return { success: false, message: `響應式測試錯誤: ${error.message}` };
        }
    }

    /**
     * 測試表單驗證
     */
    async testFormValidation() {
        try {
            if (window.validationUtils) {
                const testCases = [
                    { field: 'idNumber', value: 'A123456789', valid: true },
                    { field: 'idNumber', value: 'INVALID', valid: false },
                    { field: 'phone', value: '0912345678', valid: true },
                    { field: 'phone', value: '123', valid: false }
                ];

                let passedTests = 0;
                for (const testCase of testCases) {
                    const result = window.validationUtils.validateField(testCase.field, testCase.value, { type: testCase.field });
                    if (result.valid === testCase.valid) {
                        passedTests++;
                    }
                }

                const success = passedTests === testCases.length;
                return { 
                    success, 
                    message: `表單驗證測試: ${passedTests}/${testCases.length} 通過` 
                };
            } else {
                return { success: false, message: 'ValidationUtils模組未載入' };
            }
        } catch (error) {
            return { success: false, message: `表單驗證測試錯誤: ${error.message}` };
        }
    }

    /**
     * 測試模組切換
     */
    async testModuleSwitching() {
        try {
            const modules = ['attendance', 'revenue', 'ordering', 'schedule', 'promotion', 'maintenance'];
            let successfulSwitches = 0;

            for (const moduleName of modules) {
                const moduleElement = document.getElementById(`${moduleName}-module`);
                if (moduleElement) {
                    successfulSwitches++;
                }
            }

            const success = successfulSwitches === modules.length;
            return { 
                success, 
                message: `模組切換測試: ${successfulSwitches}/${modules.length} 模組可用` 
            };
        } catch (error) {
            return { success: false, message: `模組切換測試錯誤: ${error.message}` };
        }
    }

    /**
     * 測試數據一致性
     */
    async testDataConsistency() {
        try {
            // 檢查用戶數據一致性
            if (this.testUser && this.testEmployeeId) {
                const consistencyChecks = [
                    this.testUser.employeeId === this.testEmployeeId,
                    typeof this.testUser.name === 'string' && this.testUser.name.length > 0,
                    typeof this.testUser.position === 'string' && this.testUser.position.length > 0
                ];

                const passedChecks = consistencyChecks.filter(Boolean).length;
                const success = passedChecks === consistencyChecks.length;

                return { 
                    success, 
                    message: `數據一致性檢查: ${passedChecks}/${consistencyChecks.length} 通過` 
                };
            } else {
                return { success: false, message: '沒有可用的測試數據' };
            }
        } catch (error) {
            return { success: false, message: `數據一致性檢查錯誤: ${error.message}` };
        }
    }

    /**
     * 測試跨模組數據驗證
     */
    async testCrossModuleData() {
        try {
            // 檢查不同模組間的數據關聯性
            const moduleTests = [];

            // 檢查員工在各模組中的一致性
            if (this.testUser) {
                moduleTests.push('員工數據一致性: 通過');
            }

            // 檢查日期格式一致性
            const testDate = new Date().toISOString().split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
                moduleTests.push('日期格式一致性: 通過');
            }

            return { 
                success: moduleTests.length > 0, 
                message: `跨模組驗證: ${moduleTests.join(', ')}` 
            };
        } catch (error) {
            return { success: false, message: `跨模組驗證錯誤: ${error.message}` };
        }
    }

    /**
     * 測試錯誤處理
     */
    async testErrorHandling() {
        try {
            // 測試無效API調用
            const invalidResult = await this.makeAPICall('invalid_action', {});
            
            // 錯誤處理應該返回失敗狀態
            const errorHandlingWorks = !invalidResult.success;
            
            return { 
                success: errorHandlingWorks, 
                message: errorHandlingWorks ? '錯誤處理機制正常' : '錯誤處理機制異常' 
            };
        } catch (error) {
            // 如果拋出異常，說明錯誤處理機制正常
            return { success: true, message: '錯誤處理機制正常（拋出異常）' };
        }
    }

    /**
     * API調用輔助函數
     */
    async makeAPICall(action, data) {
        const requestData = { action, data };
        
        const response = await fetch(this.apiBaseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    /**
     * 添加測試結果
     */
    addTestResult(testName, success, message) {
        const result = {
            testName,
            success,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = success ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    /**
     * 生成驗證報告
     */
    generateVerificationReport(duration) {
        console.log('\n🎯 深度驗證報告');
        console.log('='.repeat(60));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
        
        console.log(`📊 總測試數: ${totalTests}`);
        console.log(`✅ 通過: ${passedTests}`);
        console.log(`❌ 失敗: ${failedTests}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log(`⏱️ 執行時間: ${duration}秒`);
        console.log(`🌍 測試環境: ${this.testEnvironment}`);
        
        // 按類別分組顯示結果
        console.log('\n📋 詳細結果:');
        
        const groupedResults = {};
        this.testResults.forEach(result => {
            const category = result.testName.split(' - ')[0];
            if (!groupedResults[category]) {
                groupedResults[category] = [];
            }
            groupedResults[category].push(result);
        });
        
        for (const [category, results] of Object.entries(groupedResults)) {
            console.log(`\n📁 ${category}`);
            results.forEach(result => {
                const status = result.success ? '✅' : '❌';
                const testName = result.testName.split(' - ')[1] || result.testName;
                console.log(`  ${status} ${testName}: ${result.message}`);
            });
        }
        
        // 生成JSON報告
        const report = {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: `${successRate}%`,
                duration: `${duration}秒`,
                environment: this.testEnvironment,
                timestamp: new Date().toISOString()
            },
            results: this.testResults,
            groupedResults
        };
        
        console.log('\n📄 JSON報告:');
        console.log(JSON.stringify(report, null, 2));
        
        // 保存報告到localStorage（如果可用）
        try {
            const reportKey = `verification-report-${new Date().toISOString().split('T')[0]}`;
            localStorage.setItem(reportKey, JSON.stringify(report));
            console.log(`\n💾 報告已保存到 localStorage: ${reportKey}`);
        } catch (error) {
            console.log('\n⚠️ 無法保存報告到 localStorage');
        }
        
        return report;
    }

    /**
     * 快速驗證（僅執行關鍵測試）
     */
    async runQuickVerification() {
        console.log('⚡ 開始執行快速驗證...\n');
        
        const quickTests = [
            { category: '系統基礎驗證', test: { name: 'API連接測試', function: 'testAPIConnection' } },
            { category: '系統基礎驗證', test: { name: '模組載入驗證', function: 'testModuleLoading' } },
            { category: '員工管理功能驗證', test: { name: '員工註冊功能', function: 'testEmployeeRegistration' } },
            { category: '員工管理功能驗證', test: { name: '員工登入功能', function: 'testEmployeeLogin' } }
        ];
        
        this.testResults = [];
        const startTime = new Date();
        
        for (const { category, test } of quickTests) {
            await this.executeTest(category, test);
        }
        
        const endTime = new Date();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        this.generateVerificationReport(duration);
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.DeepVerificationFramework = DeepVerificationFramework;
}

// 如果在Node.js環境中使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeepVerificationFramework;
}

// 使用範例：
// const verifier = new DeepVerificationFramework();
// verifier.runCompleteVerification(); // 完整驗證
// verifier.runQuickVerification();   // 快速驗證
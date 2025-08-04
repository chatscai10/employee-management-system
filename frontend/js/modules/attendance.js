/**
 * 打卡模組 - 處理員工上下班打卡功能
 */

class AttendanceModule {
    constructor() {
        this.isClockingIn = false;
        this.watchPositionId = null;
        this.attendanceHistory = [];
        this.todayStatus = null;
        
        this.initializeAttendance();
    }

    /**
     * 初始化模組（標準介面）
     */
    async initializeModule() {
        await this.initializeAttendance();
    }

    /**
     * 載入數據（標準介面）
     */
    async loadData(user) {
        this.currentUser = user;
        await this.loadTodayStatus();
        await this.loadAttendanceHistory();
        return this.attendanceHistory;
    }

    /**
     * 初始化打卡模組
     */
    async initializeAttendance() {
        try {
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 檢查GPS權限
            await this.checkLocationPermission();
            
        } catch (error) {
            console.error('打卡模組初始化失敗:', error);
        }
    }

    /**
     * 載入打卡模組數據
     */
    async loadData(user) {
        try {
            if (!user) {
                throw new AttendanceError('用戶資訊不存在');
            }

            // 獲取今日打卡狀態
            await this.loadTodayStatus(user.employeeId);
            
            // 獲取打卡歷史
            await this.loadAttendanceHistory(user.employeeId);
            
            // 更新UI
            this.updateAttendanceUI();
            
        } catch (error) {
            console.error('載入打卡數據失敗:', error);
            this.showAttendanceMessage('載入打卡資料失敗', 'error');
        }
    }

    /**
     * 上班打卡
     */
    async clockIn(storeName) {
        return await this.performClockAction('上班', storeName);
    }

    /**
     * 下班打卡
     */
    async clockOut(storeName) {
        return await this.performClockAction('下班', storeName);
    }

    /**
     * 執行打卡動作
     */
    async performClockAction(type, storeName) {
        if (this.isClockingIn) {
            throw new AttendanceError('打卡正在進行中，請稍候');
        }

        try {
            this.isClockingIn = true;
            this.updateClockButtonState(type, '定位中...');

            // 驗證用戶登入狀態
            const currentUser = window.authModule.getCurrentUser();
            if (!currentUser) {
                throw new AttendanceError('請先登入');
            }

            // 驗證分店選擇
            if (!storeName) {
                throw new AttendanceError('請選擇分店');
            }

            // 獲取GPS位置
            this.updateClockButtonState(type, 'GPS定位中...');
            const location = await this.getCurrentLocation();

            // 生成設備指紋
            this.updateClockButtonState(type, '生成設備指紋...');
            const deviceFingerprint = await window.deviceUtils.generateFingerprint();

            // 驗證位置是否在允許範圍內
            this.updateClockButtonState(type, '驗證位置...');
            const locationValidation = await this.validateLocation(location, storeName);

            // 準備打卡數據
            const attendanceData = {
                employeeId: currentUser.employeeId,
                employeeName: currentUser.name,
                type: type,
                storeName: storeName,
                gpsCoordinates: `${location.latitude},${location.longitude}`,
                deviceFingerprint: deviceFingerprint.hash,
                timestamp: new Date().toISOString(),
                accuracy: location.accuracy,
                distance: locationValidation.distance
            };

            // 調用後端API
            this.updateClockButtonState(type, '提交打卡...');
            const action = type === '上班' ? 'clock_in' : 'clock_out';
            const result = await window.api.call(action, attendanceData);

            if (result.success) {
                // 更新本地狀態
                await this.updateLocalAttendanceState(type, result.data);
                
                // 記錄打卡事件
                this.logAttendanceEvent('CLOCK_SUCCESS', { type, storeName, result: result.data });
                
                this.showAttendanceMessage(`${type}打卡成功！`, 'success');
                return { success: true, data: result.data };
            } else {
                throw new AttendanceError(result.message || `${type}打卡失敗`);
            }

        } catch (error) {
            this.logAttendanceEvent('CLOCK_ERROR', { type, storeName, error: error.message });
            this.showAttendanceMessage(error.message, 'error');
            throw error;
        } finally {
            this.isClockingIn = false;
            this.updateClockButtonState(type, type === '上班' ? '上班打卡' : '下班打卡');
        }
    }

    /**
     * 獲取當前GPS位置
     */
    async getCurrentLocation() {
        try {
            const location = await window.locationUtils.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 60000
            });

            return location;
        } catch (error) {
            if (error.code === 'PERMISSION_DENIED') {
                throw new AttendanceError('請允許存取位置權限以進行打卡');
            } else if (error.code === 'TIMEOUT') {
                throw new AttendanceError('GPS定位超時，請確認GPS功能已開啟');
            } else {
                throw new AttendanceError('無法獲取位置資訊，請檢查GPS設定');
            }
        }
    }

    /**
     * 驗證位置是否在允許範圍內
     */
    async validateLocation(userLocation, storeName) {
        try {
            // 獲取分店位置資訊
            const storeLocation = await this.getStoreLocation(storeName);
            
            if (!storeLocation) {
                throw new AttendanceError('找不到分店位置資訊');
            }

            // 計算距離
            const distance = window.locationUtils.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                storeLocation.latitude,
                storeLocation.longitude
            );

            const allowedRadius = storeLocation.radius || 100; // 預設100公尺

            // 檢查是否在允許範圍內
            const isWithinRange = distance <= allowedRadius;
            
            return {
                isValid: isWithinRange,
                distance: distance,
                allowedRadius: allowedRadius,
                storeLocation: storeLocation,
                message: isWithinRange ? 
                    '位置驗證通過' : 
                    `距離分店${Math.round(distance)}公尺，超出允許範圍${allowedRadius}公尺`
            };

        } catch (error) {
            throw new AttendanceError(`位置驗證失敗: ${error.message}`);
        }
    }

    /**
     * 獲取分店位置資訊
     */
    async getStoreLocation(storeName) {
        try {
            // 從系統設定中獲取分店資訊
            const settings = await window.api.call('get_system_settings');
            
            if (settings.success && settings.data.stores) {
                const store = settings.data.stores.find(s => s.name === storeName);
                return store || null;
            }

            // 如果無法從後端獲取，使用預設值
            const defaultStores = {
                '內壢店': {
                    latitude: 24.9748412,
                    longitude: 121.2556713,
                    radius: 100
                },
                '桃園店': {
                    latitude: 24.9880023,
                    longitude: 121.2812737,
                    radius: 100
                }
            };

            return defaultStores[storeName] || null;
        } catch (error) {
            console.warn('獲取分店位置失敗，使用預設值:', error);
            return null;
        }
    }

    /**
     * 載入今日打卡狀態
     */
    async loadTodayStatus(employeeId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const result = await window.api.call('get_attendance_history', {
                employeeId: employeeId,
                startDate: today,
                endDate: today
            });

            if (result.success && result.data.length > 0) {
                const todayRecords = result.data;
                this.todayStatus = this.calculateTodayStatus(todayRecords);
            } else {
                this.todayStatus = { 
                    clockedIn: false, 
                    clockedOut: false, 
                    status: '尚未打卡' 
                };
            }
        } catch (error) {
            console.error('載入今日狀態失敗:', error);
            this.todayStatus = { 
                clockedIn: false, 
                clockedOut: false, 
                status: '無法載入狀態' 
            };
        }
    }

    /**
     * 載入打卡歷史
     */
    async loadAttendanceHistory(employeeId, days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const result = await window.api.call('get_attendance_history', {
                employeeId: employeeId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            if (result.success) {
                this.attendanceHistory = result.data || [];
            } else {
                this.attendanceHistory = [];
            }
        } catch (error) {
            console.error('載入打卡歷史失敗:', error);
            this.attendanceHistory = [];
        }
    }

    /**
     * 計算今日狀態
     */
    calculateTodayStatus(records) {
        const clockInRecord = records.find(r => r.type === '上班');
        const clockOutRecord = records.find(r => r.type === '下班');

        let status = '尚未打卡';
        if (clockInRecord && clockOutRecord) {
            status = '已完成打卡';
        } else if (clockInRecord) {
            status = '已上班打卡';
        }

        return {
            clockedIn: !!clockInRecord,
            clockedOut: !!clockOutRecord,
            status: status,
            clockInTime: clockInRecord?.timestamp,
            clockOutTime: clockOutRecord?.timestamp,
            clockInRecord: clockInRecord,
            clockOutRecord: clockOutRecord
        };
    }

    /**
     * 更新本地打卡狀態
     */
    async updateLocalAttendanceState(type, recordData) {
        // 更新今日狀態
        if (type === '上班') {
            this.todayStatus.clockedIn = true;
            this.todayStatus.clockInTime = recordData.timestamp;
            this.todayStatus.clockInRecord = recordData;
            this.todayStatus.status = '已上班打卡';
        } else {
            this.todayStatus.clockedOut = true;
            this.todayStatus.clockOutTime = recordData.timestamp;
            this.todayStatus.clockOutRecord = recordData;
            this.todayStatus.status = '已完成打卡';
        }

        // 添加到歷史記錄
        this.attendanceHistory.unshift(recordData);

        // 更新UI
        this.updateAttendanceUI();
    }

    /**
     * 更新打卡UI
     */
    updateAttendanceUI() {
        // 更新今日狀態
        const statusElement = document.getElementById('today-status');
        if (statusElement && this.todayStatus) {
            statusElement.textContent = this.todayStatus.status;
        }

        // 更新按鈕狀態
        this.updateClockButtonsAvailability();

        // 更新歷史記錄
        this.updateAttendanceHistoryUI();
    }

    /**
     * 更新打卡按鈕可用性
     */
    updateClockButtonsAvailability() {
        const clockInBtn = document.getElementById('clock-in-btn');
        const clockOutBtn = document.getElementById('clock-out-btn');

        if (clockInBtn && clockOutBtn && this.todayStatus) {
            // 上班打卡按鈕 - 如果已經上班打卡則禁用
            clockInBtn.disabled = this.todayStatus.clockedIn || this.isClockingIn;
            
            // 下班打卡按鈕 - 如果沒有上班打卡或已經下班打卡則禁用
            clockOutBtn.disabled = !this.todayStatus.clockedIn || this.todayStatus.clockedOut || this.isClockingIn;
        }
    }

    /**
     * 更新打卡按鈕狀態文字
     */
    updateClockButtonState(type, text) {
        const buttonId = type === '上班' ? 'clock-in-btn' : 'clock-out-btn';
        const button = document.getElementById(buttonId);
        
        if (button) {
            button.textContent = text;
            button.disabled = this.isClockingIn;
        }
    }

    /**
     * 更新打卡歷史UI
     */
    updateAttendanceHistoryUI() {
        const container = document.getElementById('attendance-records');
        if (!container) return;

        if (this.attendanceHistory.length === 0) {
            container.innerHTML = '<p>暫無打卡記錄</p>';
            return;
        }

        const recordsHTML = this.attendanceHistory.map(record => {
            const date = new Date(record.timestamp);
            const timeString = date.toLocaleString('zh-TW');
            const statusClass = record.status === '正常' ? 'normal' : 
                               record.status === '遲到' ? 'late' : 'abnormal';

            return `
                <div class="attendance-record ${statusClass}">
                    <div class="record-header">
                        <span class="record-type">${record.type}</span>
                        <span class="record-time">${timeString}</span>
                    </div>
                    <div class="record-details">
                        <span class="record-store">${record.storeName}</span>
                        <span class="record-status">${record.status}</span>
                        ${record.lateMinutes > 0 ? `<span class="late-minutes">遲到${record.lateMinutes}分鐘</span>` : ''}
                    </div>
                    ${record.anomalyReason ? `<div class="record-anomaly">${record.anomalyReason}</div>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = recordsHTML;
    }

    /**
     * 檢查位置權限
     */
    async checkLocationPermission() {
        try {
            const permission = await window.locationUtils.getPermissionStatus();
            
            if (permission.state === 'denied') {
                this.showAttendanceMessage('位置權限被拒絕，無法進行打卡', 'warning');
            } else if (permission.state === 'prompt') {
                this.showAttendanceMessage('打卡時需要獲取位置權限', 'info');
            }
            
            return permission;
        } catch (error) {
            console.warn('檢查位置權限失敗:', error);
            return { state: 'unknown' };
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 上班打卡按鈕
        const clockInBtn = document.getElementById('clock-in-btn');
        if (clockInBtn) {
            clockInBtn.addEventListener('click', async () => {
                const storeSelect = document.getElementById('attendance-store');
                const storeName = storeSelect ? storeSelect.value : '';
                
                if (!storeName) {
                    this.showAttendanceMessage('請選擇分店', 'warning');
                    return;
                }
                
                try {
                    await this.clockIn(storeName);
                } catch (error) {
                    // 錯誤已在performClockAction中處理
                }
            });
        }

        // 下班打卡按鈕
        const clockOutBtn = document.getElementById('clock-out-btn');
        if (clockOutBtn) {
            clockOutBtn.addEventListener('click', async () => {
                const storeSelect = document.getElementById('attendance-store');
                const storeName = storeSelect ? storeSelect.value : '';
                
                if (!storeName) {
                    this.showAttendanceMessage('請選擇分店', 'warning');
                    return;
                }
                
                try {
                    await this.clockOut(storeName);
                } catch (error) {
                    // 錯誤已在performClockAction中處理
                }
            });
        }
    }

    /**
     * 顯示打卡訊息
     */
    showAttendanceMessage(message, type = 'info') {
        if (window.app && typeof window.app.showMessage === 'function') {
            window.app.showMessage(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * 記錄打卡事件
     */
    logAttendanceEvent(eventType, data = null, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            data: data,
            error: error
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[Attendance Module]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('attendanceLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近30條日誌
            if (logs.length > 30) {
                logs.splice(0, logs.length - 30);
            }
            
            localStorage.setItem('attendanceLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 獲取打卡日誌
     */
    getAttendanceLogs() {
        try {
            return JSON.parse(localStorage.getItem('attendanceLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除打卡日誌
     */
    clearAttendanceLogs() {
        localStorage.removeItem('attendanceLogs');
    }

    /**
     * 獲取今日狀態
     */
    getTodayStatus() {
        return this.todayStatus;
    }

    /**
     * 獲取打卡歷史
     */
    getAttendanceHistory() {
        return this.attendanceHistory;
    }
}

/**
 * 打卡錯誤類型
 */
class AttendanceError extends Error {
    constructor(message, code = 'ATTENDANCE_ERROR') {
        super(message);
        this.name = 'AttendanceError';
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.AttendanceModule = AttendanceModule;
    window.AttendanceError = AttendanceError;
}
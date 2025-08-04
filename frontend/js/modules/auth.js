/**
 * 認證模組 - 處理登入、註冊和用戶狀態管理
 */

class AuthModule {
    constructor() {
        this.currentUser = null;
        this.tokenExpirationTime = 24 * 60 * 60 * 1000; // 24小時
        this.sessionCheckInterval = 5 * 60 * 1000; // 5分鐘檢查一次
        this.sessionTimer = null;
        
        this.initializeAuth();
    }

    /**
     * 初始化模組（標準介面）
     */
    async initializeModule() {
        await this.initializeAuth();
    }

    /**
     * 載入數據（標準介面）
     */
    async loadData(user) {
        this.currentUser = user;
        return this.currentUser;
    }

    /**
     * 初始化認證模組
     */
    async initializeAuth() {
        try {
            // 從本地存儲載入用戶狀態
            await this.loadUserFromStorage();
            
            // 開始定期檢查session狀態
            this.startSessionMonitoring();
            
            // 監聽storage變化（多標籤頁同步）
            this.setupStorageListener();
            
        } catch (error) {
            console.error('認證模組初始化失敗:', error);
            this.clearUserSession();
        }
    }

    /**
     * 用戶登入
     */
    async login(loginData) {
        try {
            // 輸入驗證
            const validation = this.validateLoginData(loginData);
            if (!validation.valid) {
                throw new AuthError(validation.errors[0]);
            }

            // 清理輸入數據
            const sanitizedData = window.validationUtils.sanitizeObject(loginData);
            
            // 生成設備指紋
            const deviceFingerprint = await window.deviceUtils.generateFingerprint();
            
            // 準備登入請求數據
            const requestData = {
                ...sanitizedData,
                deviceFingerprint: deviceFingerprint.hash,
                loginTime: new Date().toISOString(),
                clientInfo: this.getClientInfo()
            };

            // 調用後端API
            const result = await window.api.call('login_employee', requestData);
            
            if (result.success) {
                // 保存用戶資訊和登入狀態
                this.setUserSession(result.data, deviceFingerprint);
                
                // 記錄登入事件
                this.logAuthEvent('LOGIN_SUCCESS', result.data);
                
                return {
                    success: true,
                    user: result.data,
                    message: '登入成功'
                };
            } else {
                this.logAuthEvent('LOGIN_FAILED', null, result.message);
                throw new AuthError(result.message || '登入失敗');
            }
            
        } catch (error) {
            this.logAuthEvent('LOGIN_ERROR', null, error.message);
            
            if (error instanceof AuthError) {
                throw error;
            } else {
                throw new AuthError('登入過程中發生錯誤，請稍後再試');
            }
        }
    }

    /**
     * 用戶註冊
     */
    async register(registrationData) {
        try {
            // 輸入驗證
            const validation = window.validationUtils.validateEmployeeRegistration(registrationData);
            if (!validation.valid) {
                throw new AuthError(validation.errors[0]);
            }

            // 清理輸入數據
            const sanitizedData = window.validationUtils.sanitizeObject(registrationData);
            
            // 添加額外的註冊資訊
            const requestData = {
                ...sanitizedData,
                registrationTime: new Date().toISOString(),
                clientInfo: this.getClientInfo()
            };

            // 調用後端API
            const result = await window.api.call('register_employee', requestData);
            
            if (result.success) {
                this.logAuthEvent('REGISTER_SUCCESS', result.data);
                
                return {
                    success: true,
                    employeeId: result.data.employeeId,
                    message: '註冊成功！請使用員工編號登入'
                };
            } else {
                this.logAuthEvent('REGISTER_FAILED', null, result.errors?.join(', '));
                throw new AuthError(result.errors?.[0] || result.message || '註冊失敗');
            }
            
        } catch (error) {
            this.logAuthEvent('REGISTER_ERROR', null, error.message);
            
            if (error instanceof AuthError) {
                throw error;
            } else {
                throw new AuthError('註冊過程中發生錯誤，請稍後再試');
            }
        }
    }

    /**
     * 用戶登出
     */
    async logout() {
        try {
            const currentUser = this.getCurrentUser();
            
            // 清除用戶session
            this.clearUserSession();
            
            // 記錄登出事件
            this.logAuthEvent('LOGOUT', currentUser);
            
            // 停止session監控
            this.stopSessionMonitoring();
            
            return { success: true, message: '已成功登出' };
            
        } catch (error) {
            console.error('登出過程中發生錯誤:', error);
            // 即使發生錯誤也要清除本地session
            this.clearUserSession();
            return { success: true, message: '已登出' };
        }
    }

    /**
     * 檢查登入狀態
     */
    async checkAuthStatus() {
        try {
            if (!this.currentUser) {
                return { authenticated: false, message: '未登入' };
            }

            // 檢查token是否過期
            if (this.isSessionExpired()) {
                this.clearUserSession();
                return { authenticated: false, message: 'Session已過期，請重新登入' };
            }

            // 向後端驗證用戶狀態
            const result = await window.api.call('get_employee_info', {
                employeeId: this.currentUser.employeeId
            });

            if (result.success) {
                // 更新用戶資訊
                this.updateUserInfo(result.data);
                return { 
                    authenticated: true, 
                    user: this.currentUser,
                    message: '登入狀態有效'
                };
            } else {
                this.clearUserSession();
                return { authenticated: false, message: '用戶狀態無效，請重新登入' };
            }
            
        } catch (error) {
            console.error('檢查認證狀態失敗:', error);
            this.clearUserSession();
            return { authenticated: false, message: '無法驗證登入狀態' };
        }
    }

    /**
     * 獲取當前用戶
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * 檢查用戶權限
     */
    hasPermission(requiredPermission) {
        if (!this.currentUser) {
            return false;
        }

        const userPermission = this.currentUser.permission || '員工';
        const permissionLevels = {
            '員工': 1,
            '主管': 2,
            '管理員': 3
        };

        const userLevel = permissionLevels[userPermission] || 0;
        const requiredLevel = permissionLevels[requiredPermission] || 999;

        return userLevel >= requiredLevel;
    }

    /**
     * 設定用戶session
     */
    setUserSession(userData, deviceFingerprint = null) {
        this.currentUser = {
            ...userData,
            loginTime: new Date().toISOString(),
            deviceFingerprint: deviceFingerprint?.hash,
            sessionExpiration: Date.now() + this.tokenExpirationTime
        };

        // 保存到localStorage
        try {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('authTimestamp', Date.now().toString());
        } catch (error) {
            console.warn('無法保存用戶session:', error);
        }

        // 觸發認證狀態變化事件
        this.dispatchAuthEvent('authStateChanged', { authenticated: true, user: this.currentUser });
    }

    /**
     * 清除用戶session
     */
    clearUserSession() {
        this.currentUser = null;

        // 清除localStorage
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTimestamp');
        } catch (error) {
            console.warn('無法清除用戶session:', error);
        }

        // 觸發認證狀態變化事件
        this.dispatchAuthEvent('authStateChanged', { authenticated: false, user: null });
    }

    /**
     * 從storage載入用戶
     */
    async loadUserFromStorage() {
        try {
            const savedUser = localStorage.getItem('currentUser');
            const authTimestamp = localStorage.getItem('authTimestamp');

            if (savedUser && authTimestamp) {
                const userData = JSON.parse(savedUser);
                const timestamp = parseInt(authTimestamp);

                // 檢查是否過期
                if (Date.now() - timestamp < this.tokenExpirationTime) {
                    this.currentUser = userData;
                    
                    // 向後端驗證狀態
                    const authStatus = await this.checkAuthStatus();
                    if (!authStatus.authenticated) {
                        this.clearUserSession();
                    }
                } else {
                    this.clearUserSession();
                }
            }
        } catch (error) {
            console.error('載入用戶資訊失敗:', error);
            this.clearUserSession();
        }
    }

    /**
     * 更新用戶資訊
     */
    updateUserInfo(newUserData) {
        if (this.currentUser) {
            this.currentUser = {
                ...this.currentUser,
                ...newUserData,
                lastUpdate: new Date().toISOString()
            };

            // 更新localStorage
            try {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            } catch (error) {
                console.warn('無法更新用戶資訊:', error);
            }
        }
    }

    /**
     * 檢查session是否過期
     */
    isSessionExpired() {
        if (!this.currentUser || !this.currentUser.sessionExpiration) {
            return true;
        }
        
        return Date.now() > this.currentUser.sessionExpiration;
    }

    /**
     * 開始session監控
     */
    startSessionMonitoring() {
        this.stopSessionMonitoring(); // 確保沒有重複的定時器
        
        this.sessionTimer = setInterval(async () => {
            if (this.currentUser) {
                const authStatus = await this.checkAuthStatus();
                if (!authStatus.authenticated) {
                    this.dispatchAuthEvent('sessionExpired', { message: authStatus.message });
                }
            }
        }, this.sessionCheckInterval);
    }

    /**
     * 停止session監控
     */
    stopSessionMonitoring() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    /**
     * 設定storage監聽器（多標籤頁同步）
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                if (e.newValue) {
                    // 其他標籤頁登入了
                    try {
                        this.currentUser = JSON.parse(e.newValue);
                        this.dispatchAuthEvent('authStateChanged', { 
                            authenticated: true, 
                            user: this.currentUser 
                        });
                    } catch (error) {
                        console.error('解析用戶資訊失敗:', error);
                    }
                } else {
                    // 其他標籤頁登出了
                    this.currentUser = null;
                    this.dispatchAuthEvent('authStateChanged', { 
                        authenticated: false, 
                        user: null 
                    });
                }
            }
        });
    }

    /**
     * 驗證登入數據
     */
    validateLoginData(data) {
        const errors = [];

        if (!data.employeeId && !data.idNumber) {
            errors.push('請輸入員工編號或身分證號碼');
        }

        if (data.employeeId && data.employeeId.trim().length === 0) {
            errors.push('員工編號不能為空');
        }

        if (data.idNumber && data.idNumber.trim().length === 0) {
            errors.push('身分證號碼不能為空');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 獲取客戶端資訊
     */
    getClientInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
    }

    /**
     * 記錄認證事件
     */
    logAuthEvent(eventType, userData = null, message = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            userId: userData?.employeeId || this.currentUser?.employeeId,
            userName: userData?.name || this.currentUser?.name,
            message: message,
            clientInfo: this.getClientInfo()
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[Auth Module]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('authLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近50條日誌
            if (logs.length > 50) {
                logs.splice(0, logs.length - 50);
            }
            
            localStorage.setItem('authLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 觸發認證事件
     */
    dispatchAuthEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { 
            detail: detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    /**
     * 獲取認證日誌
     */
    getAuthLogs() {
        try {
            return JSON.parse(localStorage.getItem('authLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除認證日誌
     */
    clearAuthLogs() {
        localStorage.removeItem('authLogs');
    }

    /**
     * 重新整理用戶token（如果需要）
     */
    async refreshToken() {
        if (!this.currentUser) {
            throw new AuthError('未登入');
        }

        try {
            const result = await window.api.call('refresh_token', {
                employeeId: this.currentUser.employeeId
            });

            if (result.success) {
                this.updateUserInfo(result.data);
                return { success: true, message: 'Token更新成功' };
            } else {
                throw new AuthError('Token更新失敗');
            }
        } catch (error) {
            this.clearUserSession();
            throw new AuthError('Token更新失敗，請重新登入');
        }
    }
}

/**
 * 認證錯誤類型
 */
class AuthError extends Error {
    constructor(message, code = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthError';
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.AuthModule = AuthModule;
    window.AuthError = AuthError;
}
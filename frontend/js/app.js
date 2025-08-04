/**
 * 企業員工管理系統 - 主應用程式
 */

class EmployeeManagementApp {
    constructor() {
        this.currentUser = null;
        this.currentModule = 'attendance';
        this.init();
    }

    async init() {
        try {
            // 顯示載入畫面
            this.showLoading();
            
            // 初始化組件
            await this.initializeComponents();
            
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 檢查登入狀態
            await this.checkLoginStatus();
            
            // 隱藏載入畫面，顯示適當的畫面
            this.hideLoading();
            
        } catch (error) {
            console.error('應用程式初始化失敗:', error);
            this.showMessage('系統初始化失敗，請重新整理頁面', 'error');
            this.hideLoading();
        }
    }

    async initializeComponents() {
        // 初始化API
        window.api = new APIClient();
        
        // 初始化工具類
        window.locationUtils = new LocationUtils();
        window.deviceUtils = new DeviceUtils();
        window.validationUtils = new ValidationUtils();
        
        // 初始化模組
        window.authModule = new AuthModule();
        window.attendanceModule = new AttendanceModule();
        window.revenueModule = new RevenueModule();
        window.orderingModule = new OrderingModule();
        window.scheduleModule = new ScheduleModule();
        window.promotionModule = new PromotionModule();
        window.maintenanceModule = new MaintenanceModule();
        
        // 設定當前時間更新
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);
    }

    setupEventListeners() {
        // 登入相關
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });

        document.getElementById('back-to-login').addEventListener('click', () => {
            this.showLoginScreen();
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // 主畫面導航
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const module = btn.dataset.module;
                this.switchModule(module);
            });
        });

        // 登出
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // 登入方式切換
        document.getElementById('login-method').addEventListener('change', (e) => {
            const input = document.getElementById('login-input');
            if (e.target.value === 'employeeId') {
                input.placeholder = '請輸入員工編號';
                input.pattern = '';
            } else {
                input.placeholder = '請輸入身分證號碼';
                input.pattern = '[A-Z][12][0-9]{8}';
            }
        });
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showLoginScreen() {
        this.hideLoading();
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'none';
        
        // 清空表單
        document.getElementById('login-form').reset();
    }

    showRegisterScreen() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'block';
        document.getElementById('main-screen').style.display = 'none';
        
        // 清空表單
        document.getElementById('register-form').reset();
        
        // 設定預設日期為今天
        document.getElementById('business-date').value = new Date().toISOString().split('T')[0];
    }

    showMainScreen() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('register-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        
        // 載入初始模組
        this.switchModule(this.currentModule);
    }

    async checkLoginStatus() {
        // 檢查 localStorage 中的登入資訊
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                
                // 驗證登入狀態是否仍然有效
                const result = await window.api.call('get_employee_info', {
                    employeeId: this.currentUser.employeeId
                });
                
                if (result.success) {
                    this.updateUserInfo();
                    this.showMainScreen();
                    return;
                }
            } catch (error) {
                console.error('驗證登入狀態失敗:', error);
            }
        }
        
        // 如果沒有有效的登入狀態，顯示登入畫面
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginScreen();
    }

    async handleLogin() {
        try {
            const method = document.getElementById('login-method').value;
            const input = document.getElementById('login-input').value.trim();
            
            if (!input) {
                this.showMessage('請輸入登入資訊', 'warning');
                return;
            }
            
            // 顯示載入狀態
            const submitBtn = document.querySelector('#login-form button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '登入中...';
            submitBtn.disabled = true;
            
            const loginData = {};
            if (method === 'employeeId') {
                loginData.employeeId = input;
            } else {
                loginData.idNumber = input;
            }
            
            const result = await window.api.call('login_employee', loginData);
            
            if (result.success) {
                this.currentUser = result.data;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                this.updateUserInfo();
                this.showMainScreen();
                this.showMessage('登入成功！', 'success');
            } else {
                this.showMessage(result.message || '登入失敗', 'error');
            }
            
        } catch (error) {
            console.error('登入錯誤:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.querySelector('#login-form button[type="submit"]');
            submitBtn.textContent = '登入';
            submitBtn.disabled = false;
        }
    }

    async handleRegister() {
        try {
            // 收集表單數據
            const formData = {
                name: document.getElementById('name').value.trim(),
                idNumber: document.getElementById('id-number').value.trim(),
                birthDate: document.getElementById('birth-date').value,
                gender: document.getElementById('gender').value,
                drivingLicense: Array.from(document.getElementById('driving-license').selectedOptions)
                    .map(option => option.value).join(','),
                phone: document.getElementById('phone').value.trim(),
                address: document.getElementById('address').value.trim(),
                position: document.getElementById('position').value,
                store: document.getElementById('store').value,
                notes: document.getElementById('notes').value.trim()
            };
            
            // 前端驗證
            const validation = window.validationUtils.validateEmployeeRegistration(formData);
            if (!validation.valid) {
                this.showMessage(validation.errors[0], 'warning');
                return;
            }
            
            // 顯示載入狀態
            const submitBtn = document.querySelector('#register-form button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '註冊中...';
            submitBtn.disabled = true;
            
            const result = await window.api.call('register_employee', formData);
            
            if (result.success) {
                this.showMessage('註冊成功！請使用員工編號登入', 'success');
                this.showLoginScreen();
            } else {
                if (result.errors && result.errors.length > 0) {
                    this.showMessage(result.errors[0], 'error');
                } else {
                    this.showMessage(result.message || '註冊失敗', 'error');
                }
            }
            
        } catch (error) {
            console.error('註冊錯誤:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.querySelector('#register-form button[type="submit"]');
            submitBtn.textContent = '註冊';
            submitBtn.disabled = false;
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLoginScreen();
        this.showMessage('已成功登出', 'info');
    }

    updateUserInfo() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = 
                `${this.currentUser.name} (${this.currentUser.position})`;
        }
    }

    switchModule(moduleName) {
        // 更新導航狀態
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.module === moduleName) {
                btn.classList.add('active');
            }
        });
        
        // 隱藏所有模組
        document.querySelectorAll('.module').forEach(module => {
            module.classList.remove('active');
        });
        
        // 顯示選中的模組
        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.add('active');
            this.currentModule = moduleName;
            
            // 載入模組數據
            this.loadModuleData(moduleName);
        }
    }

    async loadModuleData(moduleName) {
        if (!this.currentUser) return;
        
        try {
            switch (moduleName) {
                case 'attendance':
                    await window.attendanceModule.loadData(this.currentUser);
                    break;
                case 'revenue':
                    await window.revenueModule.loadData(this.currentUser);
                    break;
                case 'ordering':
                    await window.orderingModule.loadData(this.currentUser);
                    break;
                case 'schedule':
                    await window.scheduleModule.loadData(this.currentUser);
                    break;
                case 'promotion':
                    await window.promotionModule.loadData(this.currentUser);
                    break;
                case 'maintenance':
                    await window.maintenanceModule.loadData(this.currentUser);
                    break;
            }
        } catch (error) {
            console.error(`載入${moduleName}模組數據失敗:`, error);
        }
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-TW', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        container.appendChild(messageElement);
        
        // 自動移除訊息
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
}

// 當頁面載入完成時啟動應用程式
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EmployeeManagementApp();
});
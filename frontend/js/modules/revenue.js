/**
 * 營收模組 - 處理營收記錄和獎金計算功能
 */

class RevenueModule {
    constructor() {
        this.currentRevenueData = {};
        this.revenueHistory = [];
        this.isSubmitting = false;
        
        this.initializeRevenue();
    }

    /**
     * 初始化模組（標準介面）
     */
    async initializeModule() {
        await this.initializeRevenue();
    }

    /**
     * 載入數據（標準介面）
     */
    async loadData(user) {
        this.currentUser = user;
        await this.loadRevenueHistory();
        return this.revenueHistory;
    }

    /**
     * 初始化營收模組
     */
    async initializeRevenue() {
        try {
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 設定預設日期
            this.setDefaultBusinessDate();
            
        } catch (error) {
            console.error('營收模組初始化失敗:', error);
        }
    }

    /**
     * 載入營收模組數據
     */
    async loadData(user) {
        try {
            if (!user) {
                throw new RevenueError('用戶資訊不存在');
            }

            // 載入營收歷史
            await this.loadRevenueHistory(user.employeeId);
            
            // 重置表單
            this.resetRevenueForm();
            
        } catch (error) {
            console.error('載入營收數據失敗:', error);
            this.showRevenueMessage('載入營收資料失敗', 'error');
        }
    }

    /**
     * 提交營收記錄
     */
    async submitRevenue(revenueData) {
        if (this.isSubmitting) {
            throw new RevenueError('營收提交正在進行中，請稍候');
        }

        try {
            this.isSubmitting = true;
            this.updateSubmitButtonState('提交中...');

            // 驗證用戶登入狀態
            const currentUser = window.authModule.getCurrentUser();
            if (!currentUser) {
                throw new RevenueError('請先登入');
            }

            // 驗證營收數據
            const validation = this.validateRevenueData(revenueData);
            if (!validation.valid) {
                throw new RevenueError(validation.errors[0]);
            }

            // 清理輸入數據
            const sanitizedData = window.validationUtils.sanitizeObject(revenueData);
            
            // 計算營收統計
            const calculations = this.calculateRevenueSummary(sanitizedData);
            
            // 準備提交數據
            const requestData = {
                ...sanitizedData,
                employeeId: currentUser.employeeId,
                employeeName: currentUser.name,
                ...calculations,
                submitTime: new Date().toISOString()
            };

            // 調用後端API
            const result = await window.api.call('submit_revenue', requestData);

            if (result.success) {
                // 更新本地狀態
                this.updateLocalRevenueState(result.data);
                
                // 記錄營收事件
                this.logRevenueEvent('SUBMIT_SUCCESS', { data: requestData, result: result.data });
                
                this.showRevenueMessage('營收記錄提交成功！', 'success');
                
                // 重置表單
                this.resetRevenueForm();
                
                return { success: true, data: result.data };
            } else {
                throw new RevenueError(result.message || '營收提交失敗');
            }

        } catch (error) {
            this.logRevenueEvent('SUBMIT_ERROR', { data: revenueData, error: error.message });
            this.showRevenueMessage(error.message, 'error');
            throw error;
        } finally {
            this.isSubmitting = false;
            this.updateSubmitButtonState('提交營收記錄');
        }
    }

    /**
     * 計算獎金
     */
    async calculateBonus(revenueData) {
        try {
            // 驗證用戶登入狀態
            const currentUser = window.authModule.getCurrentUser();
            if (!currentUser) {
                throw new RevenueError('請先登入');
            }

            // 準備計算數據
            const requestData = {
                employeeId: currentUser.employeeId,
                employeeName: currentUser.name,
                ...revenueData
            };

            // 調用後端API
            const result = await window.api.call('calculate_bonus', requestData);

            if (result.success) {
                return result.data;
            } else {
                throw new RevenueError(result.message || '獎金計算失敗');
            }

        } catch (error) {
            this.logRevenueEvent('BONUS_CALC_ERROR', { data: revenueData, error: error.message });
            throw error;
        }
    }

    /**
     * 驗證營收數據
     */
    validateRevenueData(data) {
        return window.validationUtils.validateRevenueData(data);
    }

    /**
     * 計算營收統計
     */
    calculateRevenueSummary(data) {
        // 收入計算
        const fieldRevenue = parseFloat(data.fieldOrderRevenue) || 0;
        const deliveryRevenue = parseFloat(data.deliveryRevenue) || 0;
        const otherRevenue = parseFloat(data.otherRevenue) || 0;
        const totalRevenue = fieldRevenue + deliveryRevenue + otherRevenue;

        // 支出計算
        const materialCost = parseFloat(data.materialCost) || 0;
        const otherExpense = parseFloat(data.otherExpense) || 0;
        const totalExpense = materialCost + otherExpense;

        // 淨收入
        const netIncome = totalRevenue - totalExpense;

        // 平均客單價
        const orderCount = parseInt(data.orderCount) || 0;
        const averageOrderValue = orderCount > 0 ? Math.round(fieldRevenue / orderCount) : 0;

        return {
            totalRevenue: totalRevenue,
            totalExpense: totalExpense,
            netIncome: netIncome,
            averageOrderValue: averageOrderValue
        };
    }

    /**
     * 載入營收歷史
     */
    async loadRevenueHistory(employeeId, days = 30) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const result = await window.api.call('get_revenue_history', {
                employeeId: employeeId,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });

            if (result.success) {
                this.revenueHistory = result.data || [];
            } else {
                this.revenueHistory = [];
            }
        } catch (error) {
            console.error('載入營收歷史失敗:', error);
            this.revenueHistory = [];
        }
    }

    /**
     * 更新本地營收狀態
     */
    updateLocalRevenueState(recordData) {
        // 添加到歷史記錄
        this.revenueHistory.unshift(recordData);
        
        // 限制歷史記錄數量
        if (this.revenueHistory.length > 100) {
            this.revenueHistory = this.revenueHistory.slice(0, 100);
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 營收表單提交
        const revenueForm = document.getElementById('revenue-form');
        if (revenueForm) {
            revenueForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRevenueSubmit();
            });
        }

        // 實時計算監聽器
        this.setupRealtimeCalculation();
    }

    /**
     * 設定實時計算
     */
    setupRealtimeCalculation() {
        const calculationFields = [
            'field-revenue', 'delivery-revenue', 'other-revenue',
            'material-cost', 'other-expense', 'order-count', 'bonus-type'
        ];

        calculationFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updateRealtimeCalculation();
                });
                field.addEventListener('change', () => {
                    this.updateRealtimeCalculation();
                });
            }
        });
    }

    /**
     * 更新實時計算
     */
    async updateRealtimeCalculation() {
        try {
            const revenueData = this.collectRevenueFormData();
            const calculations = this.calculateRevenueSummary(revenueData);
            
            // 更新UI顯示
            this.updateSummaryDisplay(calculations);
            
            // 如果有足夠的數據，計算獎金
            if (revenueData.bonusType && calculations.totalRevenue > 0) {
                try {
                    const bonusResult = await this.calculateBonus(revenueData);
                    this.updateBonusDisplay(bonusResult.bonus || 0);
                } catch (error) {
                    // 獎金計算失敗時顯示0
                    this.updateBonusDisplay(0);
                }
            } else {
                this.updateBonusDisplay(0);
            }
            
        } catch (error) {
            console.warn('實時計算失敗:', error);
        }
    }

    /**
     * 更新摘要顯示
     */
    updateSummaryDisplay(calculations) {
        const elements = {
            'total-revenue': `$${calculations.totalRevenue.toLocaleString()}`,
            'total-expense': `$${calculations.totalExpense.toLocaleString()}`,
            'net-income': `$${calculations.netIncome.toLocaleString()}`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // 添加顏色樣式
                if (id === 'net-income') {
                    element.className = calculations.netIncome >= 0 ? 'positive' : 'negative';
                }
            }
        });
    }

    /**
     * 更新獎金顯示
     */
    updateBonusDisplay(bonus) {
        const element = document.getElementById('estimated-bonus');
        if (element) {
            element.textContent = `$${bonus.toLocaleString()}`;
            element.className = bonus > 0 ? 'positive' : 'neutral';
        }
    }

    /**
     * 收集營收表單數據
     */
    collectRevenueFormData() {
        return {
            businessDate: document.getElementById('business-date')?.value || '',
            storeName: document.getElementById('revenue-store')?.value || '',
            orderCount: document.getElementById('order-count')?.value || 0,
            fieldOrderRevenue: document.getElementById('field-revenue')?.value || 0,
            deliveryRevenue: document.getElementById('delivery-revenue')?.value || 0,
            otherRevenue: document.getElementById('other-revenue')?.value || 0,
            materialCost: document.getElementById('material-cost')?.value || 0,
            otherExpense: document.getElementById('other-expense')?.value || 0,
            bonusType: document.getElementById('bonus-type')?.value || '',
            notes: document.getElementById('revenue-notes')?.value || ''
        };
    }

    /**
     * 處理營收表單提交
     */
    async handleRevenueSubmit() {
        try {
            const revenueData = this.collectRevenueFormData();
            await this.submitRevenue(revenueData);
        } catch (error) {
            // 錯誤已在submitRevenue中處理
        }
    }

    /**
     * 重置營收表單
     */
    resetRevenueForm() {
        const form = document.getElementById('revenue-form');
        if (form) {
            form.reset();
            
            // 重設預設日期
            this.setDefaultBusinessDate();
            
            // 清除計算結果
            this.updateSummaryDisplay({
                totalRevenue: 0,
                totalExpense: 0,
                netIncome: 0
            });
            this.updateBonusDisplay(0);
        }
    }

    /**
     * 設定預設營業日期
     */
    setDefaultBusinessDate() {
        const businessDateField = document.getElementById('business-date');
        if (businessDateField) {
            // 設定為昨天（營收通常是隔天提交）
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            businessDateField.value = yesterday.toISOString().split('T')[0];
        }
    }

    /**
     * 更新提交按鈕狀態
     */
    updateSubmitButtonState(text) {
        const submitBtn = document.querySelector('#revenue-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = text;
            submitBtn.disabled = this.isSubmitting;
        }
    }

    /**
     * 顯示營收訊息
     */
    showRevenueMessage(message, type = 'info') {
        if (window.app && typeof window.app.showMessage === 'function') {
            window.app.showMessage(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * 記錄營收事件
     */
    logRevenueEvent(eventType, data = null, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType: eventType,
            data: data,
            error: error
        };

        // 開發模式下輸出到控制台
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log('[Revenue Module]', logEntry);
        }

        // 存儲到本地（用於調試）
        try {
            const logs = JSON.parse(localStorage.getItem('revenueLogs') || '[]');
            logs.push(logEntry);
            
            // 只保留最近30條日誌
            if (logs.length > 30) {
                logs.splice(0, logs.length - 30);
            }
            
            localStorage.setItem('revenueLogs', JSON.stringify(logs));
        } catch (e) {
            // 忽略存儲錯誤
        }
    }

    /**
     * 獲取營收日誌
     */
    getRevenueLogs() {
        try {
            return JSON.parse(localStorage.getItem('revenueLogs') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * 清除營收日誌
     */
    clearRevenueLogs() {
        localStorage.removeItem('revenueLogs');
    }

    /**
     * 獲取營收歷史
     */
    getRevenueHistory() {
        return this.revenueHistory;
    }

    /**
     * 匯出營收數據
     */
    exportRevenueData(format = 'csv') {
        try {
            if (this.revenueHistory.length === 0) {
                this.showRevenueMessage('沒有可匯出的營收數據', 'warning');
                return;
            }

            if (format === 'csv') {
                this.exportToCSV();
            } else if (format === 'json') {
                this.exportToJSON();
            } else {
                throw new RevenueError('不支援的匯出格式');
            }
        } catch (error) {
            this.showRevenueMessage(`匯出失敗: ${error.message}`, 'error');
        }
    }

    /**
     * 匯出為CSV
     */
    exportToCSV() {
        const headers = [
            '營業日期', '分店', '員工', '訂單數', '現場收入', '外送收入', 
            '其他收入', '總收入', '材料成本', '其他支出', '總支出', 
            '淨收入', '獎金類別', '計算獎金', '提交時間'
        ];

        const csvContent = [
            headers.join(','),
            ...this.revenueHistory.map(record => [
                record.businessDate,
                record.storeName,
                record.employeeName,
                record.orderCount,
                record.fieldOrderRevenue,
                record.deliveryRevenue,
                record.otherRevenue,
                record.totalRevenue,
                record.materialCost,
                record.otherExpense,
                record.totalExpense,
                record.netIncome,
                record.bonusType,
                record.calculatedBonus,
                record.submitTime
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'revenue-data.csv', 'text/csv');
    }

    /**
     * 匯出為JSON
     */
    exportToJSON() {
        const jsonContent = JSON.stringify(this.revenueHistory, null, 2);
        this.downloadFile(jsonContent, 'revenue-data.json', 'application/json');
    }

    /**
     * 下載檔案
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

/**
 * 營收錯誤類型
 */
class RevenueError extends Error {
    constructor(message, code = 'REVENUE_ERROR') {
        super(message);
        this.name = 'RevenueError';
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.RevenueModule = RevenueModule;
    window.RevenueError = RevenueError;
}
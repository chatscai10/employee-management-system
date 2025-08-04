/**
 * 排班管理模組 - 前端介面與操作
 */

class ScheduleModule {
    constructor() {
        this.currentUser = null;
        this.schedules = [];
        this.selectedDate = new Date();
        this.currentView = 'week'; // week, month
        
        this.initializeModule();
    }

    /**
     * 初始化模組
     */
    async initializeModule() {
        try {
            // 設定事件監聽器
            this.setupEventListeners();
            
            // 初始化UI組件
            this.initializeUI();
            
        } catch (error) {
            console.error('排班模組初始化失敗:', error);
            this.showMessage('排班模組初始化失敗', 'error');
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 新增排班按鈕
        const addScheduleBtn = document.getElementById('add-schedule-btn');
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', () => this.showScheduleForm());
        }

        // 提交排班表單
        const submitScheduleBtn = document.getElementById('submit-schedule-btn');
        if (submitScheduleBtn) {
            submitScheduleBtn.addEventListener('click', () => this.submitSchedule());
        }

        // 查看統計按鈕
        const viewStatsBtn = document.getElementById('view-schedule-stats-btn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => this.viewScheduleStatistics());
        }

        // 視圖切換
        const viewToggle = document.getElementById('schedule-view-toggle');
        if (viewToggle) {
            viewToggle.addEventListener('change', (e) => {
                this.currentView = e.target.value;
                this.refreshScheduleView();
            });
        }

        // 日期導航
        const prevBtn = document.getElementById('schedule-prev-btn');
        const nextBtn = document.getElementById('schedule-next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateDate(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateDate(1));
        }

        // 排班表單中的班別變化
        const shiftTypeSelect = document.getElementById('schedule-shift-type');
        if (shiftTypeSelect) {
            shiftTypeSelect.addEventListener('change', () => this.onShiftTypeChange());
        }
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        // 設定預設日期為今天
        const scheduleDateInput = document.getElementById('schedule-date');
        if (scheduleDateInput) {
            const today = new Date();
            scheduleDateInput.value = today.toISOString().split('T')[0];
            scheduleDateInput.min = today.toISOString().split('T')[0];
        }

        // 初始化當前日期顯示
        this.updateDateDisplay();
        
        // 載入排班資料
        this.refreshScheduleView();
    }

    /**
     * 顯示排班表單
     */
    showScheduleForm() {
        const modal = document.getElementById('schedule-form-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // 重置表單
            const form = document.getElementById('schedule-form');
            if (form) {
                form.reset();
                this.initializeUI();
            }
        }
    }

    /**
     * 隱藏排班表單
     */
    hideScheduleForm() {
        const modal = document.getElementById('schedule-form-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 班別變化事件
     */
    onShiftTypeChange() {
        const shiftType = document.getElementById('schedule-shift-type').value;
        const startTimeInput = document.getElementById('schedule-start-time');
        const endTimeInput = document.getElementById('schedule-end-time');
        
        // 根據班別設定預設時間
        const shiftTimes = {
            '早班': { start: '06:00', end: '14:00' },
            '中班': { start: '14:00', end: '22:00' },
            '晚班': { start: '22:00', end: '06:00' },
            '全天': { start: '09:00', end: '18:00' }
        };
        
        if (shiftTimes[shiftType]) {
            startTimeInput.value = shiftTimes[shiftType].start;
            endTimeInput.value = shiftTimes[shiftType].end;
            
            // 更新工時顯示
            this.updateWorkHoursDisplay();
        }
    }

    /**
     * 更新工時顯示
     */
    updateWorkHoursDisplay() {
        const startTime = document.getElementById('schedule-start-time').value;
        const endTime = document.getElementById('schedule-end-time').value;
        const workHoursDisplay = document.getElementById('work-hours-display');
        
        if (startTime && endTime && workHoursDisplay) {
            const hours = this.calculateWorkHours(startTime, endTime);
            workHoursDisplay.textContent = `工作時數: ${hours} 小時`;
        }
    }

    /**
     * 計算工作時數
     */
    calculateWorkHours(startTime, endTime) {
        const start = new Date(`2024-01-01 ${startTime}`);
        const end = new Date(`2024-01-01 ${endTime}`);
        
        // 處理跨夜班
        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }
        
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return Math.round(diffHours * 100) / 100;
    }

    /**
     * 提交排班
     */
    async submitSchedule() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            // 收集表單數據
            const formData = {
                employeeId: this.currentUser.employeeId,
                storeName: this.currentUser.store,
                scheduleDate: document.getElementById('schedule-date').value,
                shiftType: document.getElementById('schedule-shift-type').value,
                startTime: document.getElementById('schedule-start-time').value,
                endTime: document.getElementById('schedule-end-time').value,
                position: document.getElementById('schedule-position').value || this.currentUser.position,
                isHoliday: document.getElementById('schedule-is-holiday').checked,
                notes: document.getElementById('schedule-notes').value.trim(),
                createdBy: this.currentUser.employeeId
            };

            // 前端驗證
            const validation = this.validateScheduleData(formData);
            if (!validation.valid) {
                this.showMessage(validation.errors[0], 'warning');
                return;
            }

            // 顯示載入狀態
            const submitBtn = document.getElementById('submit-schedule-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            // 調用後端API
            const result = await window.api.call('create_schedule', formData);

            if (result.success) {
                this.showMessage('排班創建成功！', 'success');
                
                // 關閉表單
                this.hideScheduleForm();
                
                // 重新載入排班資料
                await this.loadScheduleData();
                this.refreshScheduleView();
                
            } else {
                if (result.conflicts && result.conflicts.length > 0) {
                    this.showConflictDialog(result.conflicts);
                } else {
                    this.showMessage(result.errors?.[0] || result.message || '排班創建失敗', 'error');
                }
            }

        } catch (error) {
            console.error('提交排班失敗:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.getElementById('submit-schedule-btn');
            submitBtn.textContent = '提交排班';
            submitBtn.disabled = false;
        }
    }

    /**
     * 驗證排班數據
     */
    validateScheduleData(data) {
        const errors = [];

        if (!data.scheduleDate) {
            errors.push('請選擇排班日期');
        }

        if (!data.shiftType) {
            errors.push('請選擇班別');
        }

        if (!data.startTime) {
            errors.push('請設定開始時間');
        }

        if (!data.endTime) {
            errors.push('請設定結束時間');
        }

        // 檢查日期不能是過去
        const scheduleDate = new Date(data.scheduleDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (scheduleDate < today) {
            errors.push('排班日期不能是過去日期');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 顯示衝突對話框
     */
    showConflictDialog(conflicts) {
        const conflictText = conflicts.map(conflict => 
            `日期: ${conflict.date}, 現有班次: ${conflict.existingShift}, 新班次: ${conflict.newShift}`
        ).join('\n');

        const message = `檢測到排班衝突:\n${conflictText}\n\n是否要強制建立排班？`;
        
        if (confirm(message)) {
            // TODO: 實現強制建立排班的邏輯
            this.showMessage('強制建立排班功能開發中', 'info');
        }
    }

    /**
     * 載入排班資料
     */
    async loadScheduleData() {
        try {
            if (!this.currentUser) return;

            // 計算日期範圍
            const dateRange = this.getDateRange();
            
            const result = await window.api.call('get_schedule', {
                employeeId: this.currentView === 'personal' ? this.currentUser.employeeId : null,
                storeName: this.currentUser.store,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });

            if (result.success) {
                this.schedules = result.data;
            } else {
                console.warn('載入排班資料失敗:', result.message);
                this.schedules = [];
            }

        } catch (error) {
            console.error('載入排班資料失敗:', error);
            this.schedules = [];
        }
    }

    /**
     * 獲取日期範圍
     */
    getDateRange() {
        const currentDate = new Date(this.selectedDate);
        let startDate, endDate;

        if (this.currentView === 'week') {
            // 週視圖：從週一到週日
            const dayOfWeek = currentDate.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() + mondayOffset);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else {
            // 月視圖：整個月
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    /**
     * 刷新排班視圖
     */
    refreshScheduleView() {
        this.loadScheduleData().then(() => {
            if (this.currentView === 'week') {
                this.renderWeekView();
            } else {
                this.renderMonthView();
            }
        });
    }

    /**
     * 渲染週視圖
     */
    renderWeekView() {
        const container = document.getElementById('schedule-calendar-container');
        if (!container) return;

        const dateRange = this.getDateRange();
        const startDate = new Date(dateRange.startDate);
        
        // 建立週視圖HTML
        let html = `
            <div class="week-view">
                <div class="week-header">
                    ${this.generateWeekHeader(startDate)}
                </div>
                <div class="week-body">
                    ${this.generateWeekBody(startDate)}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * 生成週標題
     */
    generateWeekHeader(startDate) {
        const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
        let html = '<div class="time-column">時間</div>';

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            html += `
                <div class="day-column">
                    <div class="day-name">${days[i]}</div>
                    <div class="day-date">${date.getDate()}</div>
                </div>
            `;
        }

        return html;
    }

    /**
     * 生成週內容
     */
    generateWeekBody(startDate) {
        const timeSlots = this.generateTimeSlots();
        let html = '';

        timeSlots.forEach(timeSlot => {
            html += `<div class="time-row">`;
            html += `<div class="time-label">${timeSlot}</div>`;
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                
                const daySchedules = this.schedules.filter(schedule => 
                    schedule.scheduleDate === dateStr &&
                    this.isTimeInRange(timeSlot, schedule.startTime, schedule.endTime)
                );

                html += `<div class="day-cell" data-date="${dateStr}" data-time="${timeSlot}">`;
                
                daySchedules.forEach(schedule => {
                    const statusClass = schedule.status === '正常' ? 'normal' : 'abnormal';
                    html += `
                        <div class="schedule-block ${statusClass}" data-schedule-id="${schedule.scheduleId}">
                            <div class="employee-name">${schedule.employeeName}</div>
                            <div class="shift-info">${schedule.shiftType} (${schedule.startTime}-${schedule.endTime})</div>
                            <div class="position">${schedule.position}</div>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
            
            html += `</div>`;
        });

        return html;
    }

    /**
     * 生成時間段
     */
    generateTimeSlots() {
        const slots = [];
        for (let hour = 6; hour < 24; hour += 2) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            slots.push(timeStr);
        }
        return slots;
    }

    /**
     * 檢查時間是否在範圍內
     */
    isTimeInRange(checkTime, startTime, endTime) {
        const check = this.timeToMinutes(checkTime);
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        
        // 處理跨夜班
        if (end < start) {
            return check >= start || check <= end;
        } else {
            return check >= start && check <= end;
        }
    }

    /**
     * 時間轉換為分鐘
     */
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    /**
     * 渲染月視圖
     */
    renderMonthView() {
        const container = document.getElementById('schedule-calendar-container');
        if (!container) return;

        // 簡化的月視圖實現
        let html = '<div class="month-view">';
        html += '<div class="month-header">月視圖開發中...</div>';
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * 日期導航
     */
    navigateDate(direction) {
        if (this.currentView === 'week') {
            this.selectedDate.setDate(this.selectedDate.getDate() + (direction * 7));
        } else {
            this.selectedDate.setMonth(this.selectedDate.getMonth() + direction);
        }
        
        this.updateDateDisplay();
        this.refreshScheduleView();
    }

    /**
     * 更新日期顯示
     */
    updateDateDisplay() {
        const dateDisplay = document.getElementById('current-date-display');
        if (!dateDisplay) return;

        let displayText;
        if (this.currentView === 'week') {
            const dateRange = this.getDateRange();
            displayText = `${dateRange.startDate} ~ ${dateRange.endDate}`;
        } else {
            displayText = `${this.selectedDate.getFullYear()}年${this.selectedDate.getMonth() + 1}月`;
        }

        dateDisplay.textContent = displayText;
    }

    /**
     * 查看排班統計
     */
    async viewScheduleStatistics() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            const dateRange = this.getDateRange();
            
            const result = await window.api.call('get_shift_statistics', {
                storeName: this.currentUser.store,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });

            if (result.success) {
                this.displayStatistics(result.data);
            } else {
                this.showMessage('載入統計失敗', 'error');
            }

        } catch (error) {
            console.error('載入統計失敗:', error);
            this.showMessage('載入統計失敗', 'error');
        }
    }

    /**
     * 顯示統計資料
     */
    displayStatistics(stats) {
        const modal = document.getElementById('schedule-stats-modal');
        const content = document.getElementById('schedule-stats-content');
        
        if (!modal || !content) return;

        let html = `
            <h3>排班統計資料</h3>
            <div class="stats-overview">
                <div class="stat-item">
                    <label>總排班數：</label>
                    <span>${stats.totalSchedules}</span>
                </div>
                <div class="stat-item">
                    <label>總工時：</label>
                    <span>${stats.totalWorkHours} 小時</span>
                </div>
                <div class="stat-item">
                    <label>平均工時：</label>
                    <span>${stats.averageWorkHours} 小時</span>
                </div>
            </div>
            
            <div class="stats-breakdown">
                <h4>班別分布</h4>
                <div class="shift-stats">
        `;

        Object.entries(stats.byShiftType).forEach(([shiftType, count]) => {
            html += `
                <div class="shift-stat">
                    <span class="shift-name">${shiftType}：</span>
                    <span class="shift-count">${count} 次</span>
                </div>
            `;
        });

        html += `
                </div>
                
                <h4>職位分布</h4>
                <div class="position-stats">
        `;

        Object.entries(stats.byPosition).forEach(([position, count]) => {
            html += `
                <div class="position-stat">
                    <span class="position-name">${position}：</span>
                    <span class="position-count">${count} 次</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        content.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * 載入模組數據
     */
    async loadData(user) {
        this.currentUser = user;
        
        try {
            // 載入排班資料
            await this.loadScheduleData();
            
            // 刷新視圖
            this.refreshScheduleView();
            
        } catch (error) {
            console.error('載入排班模組數據失敗:', error);
        }
    }

    /**
     * 顯示訊息
     */
    showMessage(message, type = 'info') {
        if (window.app && window.app.showMessage) {
            window.app.showMessage(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// 全域導出
if (typeof window !== 'undefined') {
    window.ScheduleModule = ScheduleModule;
}
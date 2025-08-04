/**
 * 維修管理模組 - 前端介面與操作
 */

class MaintenanceModule {
    constructor() {
        this.currentUser = null;
        this.maintenanceRequests = [];
        this.filterStatus = 'all';
        this.currentEditingRequest = null;
        
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
            console.error('維修管理模組初始化失敗:', error);
            this.showMessage('維修管理模組初始化失敗', 'error');
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 新增維修申請按鈕
        const addRequestBtn = document.getElementById('add-maintenance-request-btn');
        if (addRequestBtn) {
            addRequestBtn.addEventListener('click', () => this.showMaintenanceForm());
        }

        // 提交維修申請表單
        const submitRequestBtn = document.getElementById('submit-maintenance-request-btn');
        if (submitRequestBtn) {
            submitRequestBtn.addEventListener('click', () => this.submitMaintenanceRequest());
        }

        // 查看維修統計按鈕
        const viewStatsBtn = document.getElementById('view-maintenance-stats-btn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => this.viewMaintenanceStatistics());
        }

        // 狀態篩選器
        const statusFilter = document.getElementById('maintenance-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterStatus = e.target.value;
                this.renderMaintenanceList();
            });
        }

        // 緊急程度變化事件
        const urgencySelect = document.getElementById('maintenance-urgency');
        if (urgencySelect) {
            urgencySelect.addEventListener('change', () => this.onUrgencyChange());
        }

        // 設備類型變化事件
        const equipmentSelect = document.getElementById('maintenance-equipment-type');
        if (equipmentSelect) {
            equipmentSelect.addEventListener('change', () => this.onEquipmentTypeChange());
        }

        // 照片上傳事件
        const photoInput = document.getElementById('maintenance-photo');
        if (photoInput) {
            photoInput.addEventListener('change', () => this.onPhotoSelected());
        }

        // 關閉維修詳情視窗
        const closeDetailBtn = document.getElementById('close-maintenance-detail-btn');
        if (closeDetailBtn) {
            closeDetailBtn.addEventListener('click', () => this.hideMaintenanceDetail());
        }
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        // 設定今天的日期為預設值
        const requestDateInput = document.getElementById('maintenance-request-date');
        if (requestDateInput) {
            const today = new Date();
            requestDateInput.value = today.toISOString().split('T')[0];
        }

        // 設定設備類型選項
        this.setupEquipmentOptions();
        
        // 載入維修申請資料
        this.loadMaintenanceRequests();
    }

    /**
     * 設定設備類型選項
     */
    setupEquipmentOptions() {
        const equipmentTypes = [
            '廚房設備',
            '冷凍冷藏設備',
            '空調系統',
            '電力系統',
            '水電設備',
            '收銀系統',
            '監控設備',
            '清潔設備',
            '其他設備'
        ];

        const equipmentSelect = document.getElementById('maintenance-equipment-type');
        if (equipmentSelect) {
            equipmentTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                equipmentSelect.appendChild(option);
            });
        }
    }

    /**
     * 顯示維修申請表單
     */
    showMaintenanceForm() {
        const modal = document.getElementById('maintenance-form-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // 重置表單
            const form = document.getElementById('maintenance-form');
            if (form) {
                form.reset();
                this.initializeUI();
                
                // 自動填入用戶資訊
                if (this.currentUser) {
                    const storeSelect = document.getElementById('maintenance-store');
                    const reporterInput = document.getElementById('maintenance-reporter');
                    const phoneInput = document.getElementById('maintenance-phone');
                    
                    if (storeSelect) storeSelect.value = this.currentUser.store;
                    if (reporterInput) reporterInput.value = this.currentUser.name;
                    if (phoneInput) phoneInput.value = this.currentUser.phone || '';
                }
            }
        }
    }

    /**
     * 隱藏維修申請表單
     */
    hideMaintenanceForm() {
        const modal = document.getElementById('maintenance-form-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 緊急程度變化事件
     */
    onUrgencyChange() {
        const urgency = document.getElementById('maintenance-urgency').value;
        const expectedTimeInput = document.getElementById('maintenance-expected-time');
        
        if (expectedTimeInput) {
            const now = new Date();
            let expectedHours = 24; // 預設24小時
            
            switch (urgency) {
                case '緊急':
                    expectedHours = 2;
                    break;
                case '高':
                    expectedHours = 4;
                    break;
                case '中':
                    expectedHours = 12;
                    break;
                case '低':
                    expectedHours = 48;
                    break;
            }
            
            const expectedTime = new Date(now.getTime() + (expectedHours * 60 * 60 * 1000));
            expectedTimeInput.value = expectedTime.toISOString().slice(0, 16);
        }
    }

    /**
     * 設備類型變化事件
     */
    onEquipmentTypeChange() {
        const equipmentType = document.getElementById('maintenance-equipment-type').value;
        const locationSelect = document.getElementById('maintenance-location');
        
        // 根據設備類型設定常見位置
        const locationOptions = {
            '廚房設備': ['廚房', '備餐區', '洗碗區'],
            '冷凍冷藏設備': ['冷凍庫', '冷藏庫', '展示櫃', '飲料櫃'],
            '空調系統': ['用餐區', '廚房', '辦公室', '倉庫'],
            '電力系統': ['配電箱', '用餐區', '廚房', '倉庫'],
            '水電設備': ['廚房', '洗手間', '清潔區'],
            '收銀系統': ['收銀台', '辦公室'],
            '監控設備': ['入口', '用餐區', '廚房', '倉庫'],
            '清潔設備': ['清潔區', '洗手間', '廚房'],
            '其他設備': ['用餐區', '廚房', '辦公室', '倉庫']
        };

        if (locationSelect && locationOptions[equipmentType]) {
            // 清空現有選項
            locationSelect.innerHTML = '<option value="">請選擇位置</option>';
            
            // 添加新選項
            locationOptions[equipmentType].forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationSelect.appendChild(option);
            });
        }
    }

    /**
     * 照片選擇事件
     */
    onPhotoSelected() {
        const photoInput = document.getElementById('maintenance-photo');
        const photoPreview = document.getElementById('photo-preview');
        
        if (photoInput.files && photoInput.files[0] && photoPreview) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.innerHTML = `
                    <img src="${e.target.result}" alt="維修照片預覽" style="max-width: 200px; max-height: 200px;">
                    <p>照片預覽</p>
                `;
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    }

    /**
     * 提交維修申請
     */
    async submitMaintenanceRequest() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            // 收集表單數據
            const formData = {
                reporterId: this.currentUser.employeeId,
                reporterName: this.currentUser.name,
                storeName: document.getElementById('maintenance-store').value,
                equipmentName: document.getElementById('maintenance-equipment-name').value.trim(),
                equipmentType: document.getElementById('maintenance-equipment-type').value,
                location: document.getElementById('maintenance-location').value,
                description: document.getElementById('maintenance-description').value.trim(),
                urgency: document.getElementById('maintenance-urgency').value,
                expectedCompletionTime: document.getElementById('maintenance-expected-time').value,
                contactPhone: document.getElementById('maintenance-phone').value.trim(),
                notes: document.getElementById('maintenance-notes').value.trim()
            };

            // 前端驗證
            const validation = this.validateMaintenanceData(formData);
            if (!validation.valid) {
                this.showMessage(validation.errors[0], 'warning');
                return;
            }

            // 處理照片上傳（簡化處理，實際需要上傳到雲端）
            const photoInput = document.getElementById('maintenance-photo');
            if (photoInput.files && photoInput.files[0]) {
                formData.hasPhoto = true;
                formData.photoName = photoInput.files[0].name;
                // 實際應用中需要將照片上傳到雲端儲存並獲得URL
            }

            // 顯示載入狀態
            const submitBtn = document.getElementById('submit-maintenance-request-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            // 調用後端API
            const result = await window.api.call('submit_maintenance_request', formData);

            if (result.success) {
                this.showMessage('維修申請提交成功！', 'success');
                
                // 關閉表單
                this.hideMaintenanceForm();
                
                // 重新載入維修申請資料
                await this.loadMaintenanceRequests();
                
            } else {
                this.showMessage(result.message || '維修申請提交失敗', 'error');
            }

        } catch (error) {
            console.error('提交維修申請失敗:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.getElementById('submit-maintenance-request-btn');
            submitBtn.textContent = '提交申請';
            submitBtn.disabled = false;
        }
    }

    /**
     * 驗證維修申請數據
     */
    validateMaintenanceData(data) {
        const errors = [];

        if (!data.equipmentName || data.equipmentName.length < 2) {
            errors.push('設備名稱至少需要2個字元');
        }

        if (!data.equipmentType) {
            errors.push('請選擇設備類型');
        }

        if (!data.location) {
            errors.push('請選擇設備位置');
        }

        if (!data.description || data.description.length < 10) {
            errors.push('故障描述至少需要10個字元');
        }

        if (!data.urgency) {
            errors.push('請選擇緊急程度');
        }

        if (!data.expectedCompletionTime) {
            errors.push('請設定預期完成時間');
        }

        if (!data.contactPhone) {
            errors.push('請填寫聯絡電話');
        }

        // 驗證電話格式
        const phonePattern = /^[0-9-+\s()]+$/;
        if (data.contactPhone && !phonePattern.test(data.contactPhone)) {
            errors.push('聯絡電話格式不正確');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 載入維修申請資料
     */
    async loadMaintenanceRequests() {
        try {
            if (!this.currentUser) return;

            const result = await window.api.call('get_maintenance_records', {
                storeName: this.currentUser.store,
                employeeId: this.currentUser.employeeId
            });

            if (result.success) {
                this.maintenanceRequests = result.data || [];
                this.renderMaintenanceList();
            } else {
                console.warn('載入維修申請資料失敗:', result.message);
                this.maintenanceRequests = [];
                this.renderMaintenanceList();
            }

        } catch (error) {
            console.error('載入維修申請資料失敗:', error);
            this.maintenanceRequests = [];
            this.renderMaintenanceList();
        }
    }

    /**
     * 渲染維修申請列表
     */
    renderMaintenanceList() {
        const container = document.getElementById('maintenance-list-container');
        if (!container) return;

        // 篩選資料
        let filteredRequests = this.maintenanceRequests;
        if (this.filterStatus !== 'all') {
            filteredRequests = this.maintenanceRequests.filter(request => request.status === this.filterStatus);
        }

        if (filteredRequests.length === 0) {
            container.innerHTML = `
                <div class="no-maintenance-message">
                    <p>沒有找到維修申請記錄</p>
                </div>
            `;
            return;
        }

        let html = '';
        filteredRequests.forEach(request => {
            const isOverdue = this.isOverdue(request);
            const statusClass = this.getStatusClass(request.status);
            const urgencyClass = this.getUrgencyClass(request.urgency);

            html += `
                <div class="maintenance-card ${statusClass} ${isOverdue ? 'overdue' : ''}" data-request-id="${request.requestId}">
                    <div class="maintenance-header">
                        <h4>${request.equipmentName}</h4>
                        <div class="maintenance-badges">
                            <span class="urgency-badge ${urgencyClass}">${request.urgency}</span>
                            <span class="status-badge ${statusClass}">${request.status}</span>
                            ${isOverdue ? '<span class="overdue-badge">逾期</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="maintenance-info">
                        <div class="maintenance-meta">
                            <span class="equipment-type">${request.equipmentType}</span>
                            <span class="location">${request.location}</span>
                            <span class="reporter">${request.reporterName}</span>
                        </div>
                        
                        <div class="maintenance-description">
                            <p>${request.description.length > 100 ? request.description.substring(0, 100) + '...' : request.description}</p>
                        </div>
                        
                        <div class="maintenance-timeline">
                            <div class="timeline-item">
                                <label>報修時間:</label>
                                <span>${new Date(request.requestTime).toLocaleString()}</span>
                            </div>
                            ${request.acceptTime ? `
                                <div class="timeline-item">
                                    <label>受理時間:</label>
                                    <span>${new Date(request.acceptTime).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            <div class="timeline-item">
                                <label>預期完成:</label>
                                <span>${new Date(request.expectedCompletionTime).toLocaleString()}</span>
                            </div>
                            ${request.completionTime ? `
                                <div class="timeline-item">
                                    <label>完成時間:</label>
                                    <span>${new Date(request.completionTime).toLocaleString()}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="maintenance-actions">
                        <button class="btn btn-info" onclick="maintenanceModule.showMaintenanceDetail('${request.requestId}')">
                            查看詳情
                        </button>
                        ${this.canUpdateStatus(request) ? `
                            <button class="btn btn-warning" onclick="maintenanceModule.showUpdateStatusModal('${request.requestId}')">
                                更新狀態
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 檢查是否逾期
     */
    isOverdue(request) {
        if (request.status === '已完成') return false;
        return new Date() > new Date(request.expectedCompletionTime);
    }

    /**
     * 獲取狀態樣式類別
     */
    getStatusClass(status) {
        const statusClasses = {
            '待受理': 'pending',
            '處理中': 'processing',
            '已完成': 'completed',
            '已取消': 'cancelled'
        };
        return statusClasses[status] || 'unknown';
    }

    /**
     * 獲取緊急程度樣式類別
     */
    getUrgencyClass(urgency) {
        const urgencyClasses = {
            '緊急': 'urgent',
            '高': 'high',
            '中': 'medium',
            '低': 'low'
        };
        return urgencyClasses[urgency] || 'unknown';
    }

    /**
     * 檢查用戶是否可以更新狀態
     */
    canUpdateStatus(request) {
        if (!this.currentUser) return false;
        
        // 維修人員、管理員或店長可以更新狀態
        const allowedRoles = ['維修人員', '店長', '副店長', '總經理'];
        return allowedRoles.includes(this.currentUser.position) || 
               request.reporterId === this.currentUser.employeeId;
    }

    /**
     * 顯示維修詳情
     */
    async showMaintenanceDetail(requestId) {
        const request = this.maintenanceRequests.find(r => r.requestId === requestId);
        if (!request) {
            this.showMessage('找不到維修申請記錄', 'error');
            return;
        }

        this.renderMaintenanceDetail(request);
    }

    /**
     * 渲染維修詳情
     */
    renderMaintenanceDetail(request) {
        const modal = document.getElementById('maintenance-detail-modal');
        const content = document.getElementById('maintenance-detail-content');
        
        if (!modal || !content) return;

        const isOverdue = this.isOverdue(request);
        
        const html = `
            <h3>維修申請詳情</h3>
            
            <div class="maintenance-detail-info">
                <div class="detail-section">
                    <h4>基本資訊</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>維修單號:</label>
                            <span>${request.requestId}</span>
                        </div>
                        <div class="detail-item">
                            <label>設備名稱:</label>
                            <span>${request.equipmentName}</span>
                        </div>
                        <div class="detail-item">
                            <label>設備類型:</label>
                            <span>${request.equipmentType}</span>
                        </div>
                        <div class="detail-item">
                            <label>設備位置:</label>
                            <span>${request.location}</span>
                        </div>
                        <div class="detail-item">
                            <label>分店:</label>
                            <span>${request.storeName}</span>
                        </div>
                        <div class="detail-item">
                            <label>緊急程度:</label>
                            <span class="urgency-badge ${this.getUrgencyClass(request.urgency)}">${request.urgency}</span>
                        </div>
                        <div class="detail-item">
                            <label>狀態:</label>
                            <span class="status-badge ${this.getStatusClass(request.status)}">${request.status}
                                ${isOverdue ? '<span class="overdue-badge">逾期</span>' : ''}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>報修資訊</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>報修人:</label>
                            <span>${request.reporterName}</span>
                        </div>
                        <div class="detail-item">
                            <label>聯絡電話:</label>
                            <span>${request.contactPhone}</span>
                        </div>
                        <div class="detail-item">
                            <label>報修時間:</label>
                            <span>${new Date(request.requestTime).toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>預期完成:</label>
                            <span>${new Date(request.expectedCompletionTime).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>故障描述</h4>
                    <p>${request.description}</p>
                </div>
                
                ${request.notes ? `
                    <div class="detail-section">
                        <h4>備註</h4>
                        <p>${request.notes}</p>
                    </div>
                ` : ''}
                
                ${request.maintainer || request.acceptTime ? `
                    <div class="detail-section">
                        <h4>處理資訊</h4>
                        <div class="detail-grid">
                            ${request.maintainer ? `
                                <div class="detail-item">
                                    <label>維修人員:</label>
                                    <span>${request.maintainer}</span>
                                </div>
                            ` : ''}
                            ${request.acceptTime ? `
                                <div class="detail-item">
                                    <label>受理時間:</label>
                                    <span>${new Date(request.acceptTime).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            ${request.completionTime ? `
                                <div class="detail-item">
                                    <label>完成時間:</label>
                                    <span>${new Date(request.completionTime).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            ${request.maintenanceCost ? `
                                <div class="detail-item">
                                    <label>維修費用:</label>
                                    <span>$${request.maintenanceCost}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${request.maintenanceResult ? `
                    <div class="detail-section">
                        <h4>維修結果</h4>
                        <p>${request.maintenanceResult}</p>
                    </div>
                ` : ''}
                
                ${request.photoPath ? `
                    <div class="detail-section">
                        <h4>相關照片</h4>
                        <div class="photo-gallery">
                            <img src="${request.photoPath}" alt="維修照片" style="max-width: 100%; height: auto;">
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        content.innerHTML = html;
        modal.style.display = 'block';
    }

    /**
     * 隱藏維修詳情
     */
    hideMaintenanceDetail() {
        const modal = document.getElementById('maintenance-detail-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 查看維修統計
     */
    async viewMaintenanceStatistics() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            const result = await window.api.call('get_maintenance_statistics', {
                storeName: this.currentUser.store
            });

            if (result.success) {
                this.displayMaintenanceStatistics(result.data);
            } else {
                this.showMessage('載入維修統計失敗', 'error');
            }

        } catch (error) {
            console.error('載入維修統計失敗:', error);
            this.showMessage('載入維修統計失敗', 'error');
        }
    }

    /**
     * 顯示維修統計資料
     */
    displayMaintenanceStatistics(stats) {
        const modal = document.getElementById('maintenance-stats-modal');
        const content = document.getElementById('maintenance-stats-content');
        
        if (!modal || !content) return;

        let html = `
            <h3>維修統計資料</h3>
            <div class="stats-overview">
                <div class="stat-item">
                    <label>總申請數：</label>
                    <span>${stats.totalRequests}</span>
                </div>
                <div class="stat-item">
                    <label>已完成：</label>
                    <span>${stats.completedRequests}</span>
                </div>
                <div class="stat-item">
                    <label>處理中：</label>
                    <span>${stats.processingRequests}</span>
                </div>
                <div class="stat-item">
                    <label>待受理：</label>
                    <span>${stats.pendingRequests}</span>
                </div>
                <div class="stat-item">
                    <label>逾期案件：</label>
                    <span class="warning">${stats.overdueRequests}</span>
                </div>
                <div class="stat-item">
                    <label>平均處理時間：</label>
                    <span>${stats.averageProcessingTime} 小時</span>
                </div>
                <div class="stat-item">
                    <label>總維修費用：</label>
                    <span>$${stats.totalMaintenanceCost}</span>
                </div>
            </div>
            
            <div class="stats-breakdown">
                <h4>設備類型分布</h4>
                <div class="equipment-stats">
        `;

        Object.entries(stats.byEquipmentType).forEach(([equipmentType, count]) => {
            html += `
                <div class="equipment-stat">
                    <span class="equipment-name">${equipmentType}：</span>
                    <span class="equipment-count">${count} 次</span>
                </div>
            `;
        });

        html += `
                </div>
                
                <h4>緊急程度分布</h4>
                <div class="urgency-stats">
        `;

        Object.entries(stats.byUrgency).forEach(([urgency, count]) => {
            html += `
                <div class="urgency-stat">
                    <span class="urgency-name ${this.getUrgencyClass(urgency)}">${urgency}：</span>
                    <span class="urgency-count">${count} 次</span>
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
            // 載入維修申請資料
            await this.loadMaintenanceRequests();
            
        } catch (error) {
            console.error('載入維修管理模組數據失敗:', error);
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
    window.MaintenanceModule = MaintenanceModule;
}
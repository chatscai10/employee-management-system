/**
 * 叫貨管理模組 - 前端介面與操作
 */

class OrderingModule {
    constructor() {
        this.currentUser = null;
        this.orders = [];
        this.suppliers = [];
        this.productCatalog = {};
        
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
            console.error('叫貨管理模組初始化失敗:', error);
            this.showMessage('叫貨管理模組初始化失敗', 'error');
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 新增叫貨按鈕
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', () => this.showOrderForm());
        }

        // 提交叫貨表單
        const submitOrderBtn = document.getElementById('submit-order-btn');
        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', () => this.submitOrder());
        }

        // 查看叫貨歷史按鈕
        const viewHistoryBtn = document.getElementById('view-order-history-btn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.viewOrderHistory());
        }

        // 檢查庫存警告按鈕
        const checkStockBtn = document.getElementById('check-stock-btn');
        if (checkStockBtn) {
            checkStockBtn.addEventListener('click', () => this.checkStockAlerts());
        }

        // 供應商變化事件
        const supplierSelect = document.getElementById('order-supplier');
        if (supplierSelect) {
            supplierSelect.addEventListener('change', () => this.onSupplierChange());
        }

        // 叫貨日期變化事件
        const orderDateInput = document.getElementById('order-date');
        if (orderDateInput) {
            orderDateInput.addEventListener('change', () => this.onOrderDateChange());
        }

        // 預估金額變化事件
        const amountInput = document.getElementById('order-amount');
        if (amountInput) {
            amountInput.addEventListener('input', () => this.updateOrderSummary());
        }
    }

    /**
     * 初始化UI
     */
    initializeUI() {
        // 設定今天的日期為預設值
        const orderDateInput = document.getElementById('order-date');
        if (orderDateInput) {
            const today = new Date();
            orderDateInput.value = today.toISOString().split('T')[0];
            
            // 設定最小日期為今天
            orderDateInput.min = today.toISOString().split('T')[0];
        }

        // 載入供應商清單
        this.loadSuppliers();
        
        // 載入叫貨記錄
        this.loadOrderHistory();
    }

    /**
     * 載入供應商清單
     */
    async loadSuppliers() {
        try {
            const result = await window.api.call('get_supplier_list', {});
            
            if (result.success) {
                this.suppliers = result.data || [];
                this.populateSupplierOptions();
            } else {
                console.warn('載入供應商清單失敗:', result.message);
                // 使用預設供應商清單
                this.useDefaultSuppliers();
            }
        } catch (error) {
            console.error('載入供應商清單失敗:', error);
            this.useDefaultSuppliers();
        }
    }

    /**
     * 使用預設供應商清單
     */
    useDefaultSuppliers() {
        this.suppliers = [
            { id: 'SUP001', name: '台灣食品供應商', category: '食材' },
            { id: 'SUP002', name: '新鮮蔬果批發', category: '蔬果' },
            { id: 'SUP003', name: '冷凍食品公司', category: '冷凍食品' },
            { id: 'SUP004', name: '飲料供應商', category: '飲料' },
            { id: 'SUP005', name: '包裝材料商', category: '包材' },
            { id: 'SUP006', name: '清潔用品供應商', category: '清潔用品' }
        ];
        this.populateSupplierOptions();
    }

    /**
     * 填充供應商選項
     */
    populateSupplierOptions() {
        const supplierSelect = document.getElementById('order-supplier');
        if (!supplierSelect) return;

        // 清空現有選項
        supplierSelect.innerHTML = '<option value="">請選擇供應商</option>';

        this.suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = `${supplier.name} (${supplier.category})`;
            supplierSelect.appendChild(option);
        });
    }

    /**
     * 顯示叫貨表單
     */
    showOrderForm() {
        const modal = document.getElementById('order-form-modal');
        if (modal) {
            modal.style.display = 'block';
            
            // 重置表單
            const form = document.getElementById('order-form');
            if (form) {
                form.reset();
                this.initializeUI();
                
                // 自動填入用戶資訊
                if (this.currentUser) {
                    const storeSelect = document.getElementById('order-store');
                    if (storeSelect) {
                        storeSelect.value = this.currentUser.store;
                    }
                }
            }
        }
    }

    /**
     * 隱藏叫貨表單
     */
    hideOrderForm() {
        const modal = document.getElementById('order-form-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 供應商變化事件
     */
    onSupplierChange() {
        const supplierId = document.getElementById('order-supplier').value;
        if (supplierId) {
            this.loadProductCatalog(supplierId);
        }
    }

    /**
     * 載入產品目錄
     */
    async loadProductCatalog(supplierId) {
        try {
            const supplier = this.suppliers.find(s => s.id === supplierId);
            if (!supplier) return;

            const result = await window.api.call('get_product_catalog', {
                supplierId: supplierId,
                category: supplier.category
            });

            if (result.success) {
                this.productCatalog[supplierId] = result.data || [];
                this.updateProductSuggestions(supplier.category);
            } else {
                console.warn('載入產品目錄失敗:', result.message);
                this.useDefaultProductCatalog(supplier.category);
            }
        } catch (error) {
            console.error('載入產品目錄失敗:', error);
            const supplier = this.suppliers.find(s => s.id === supplierId);
            if (supplier) {
                this.useDefaultProductCatalog(supplier.category);
            }
        }
    }

    /**
     * 使用預設產品目錄
     */
    useDefaultProductCatalog(category) {
        const defaultCatalogs = {
            '食材': ['豬肉', '牛肉', '雞肉', '魚類', '蝦子', '調味料', '麵條', '米飯'],
            '蔬果': ['高麗菜', '大白菜', '胡蘿蔔', '洋蔥', '蘋果', '香蕉', '橘子'],
            '冷凍食品': ['冷凍薯條', '冷凍雞塊', '冷凍蔬菜', '冰淇淋', '冷凍水餃'],
            '飲料': ['可樂', '雪碧', '果汁', '礦泉水', '茶類', '咖啡'],
            '包材': ['外帶盒', '塑膠袋', '紙袋', '吸管', '餐具', '杯子'],
            '清潔用品': ['洗碗精', '清潔劑', '拖把', '抹布', '垃圾袋', '消毒液']
        };

        this.updateProductSuggestions(category, defaultCatalogs[category] || []);
    }

    /**
     * 更新產品建議
     */
    updateProductSuggestions(category, products = null) {
        const itemsTextarea = document.getElementById('order-items');
        if (!itemsTextarea) return;

        const suggestionText = products || this.getProductsForCategory(category);
        
        if (suggestionText.length > 0) {
            const placeholder = `建議品項（${category}）：\n${suggestionText.join(', ')}\n\n請輸入實際叫貨品項和數量，例如：\n豬肉 10公斤\n高麗菜 5顆\n洗碗精 2瓶`;
            itemsTextarea.placeholder = placeholder;
        }
    }

    /**
     * 獲取類別產品
     */
    getProductsForCategory(category) {
        // 從載入的目錄中獲取產品，如果沒有則返回空陣列
        const supplierId = document.getElementById('order-supplier').value;
        return this.productCatalog[supplierId] || [];
    }

    /**
     * 叫貨日期變化事件
     */
    onOrderDateChange() {
        const orderDate = document.getElementById('order-date').value;
        const deliveryInput = document.getElementById('expected-delivery');
        
        if (orderDate && deliveryInput) {
            // 自動設定預計到貨日為叫貨日後3天
            const orderDateTime = new Date(orderDate);
            const deliveryDate = new Date(orderDateTime.getTime() + (3 * 24 * 60 * 60 * 1000));
            deliveryInput.value = deliveryDate.toISOString().split('T')[0];
            deliveryInput.min = orderDate; // 到貨日不能早於叫貨日
        }
    }

    /**
     * 更新訂單摘要
     */
    updateOrderSummary() {
        const amount = parseFloat(document.getElementById('order-amount').value) || 0;
        const items = document.getElementById('order-items').value.trim();
        
        // 這裡可以添加更複雜的計算邏輯
        // 例如根據品項數量計算總金額，或顯示預估利潤等
    }

    /**
     * 提交叫貨申請
     */
    async submitOrder() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            // 收集表單數據
            const formData = {
                employeeId: this.currentUser.employeeId,
                employeeName: this.currentUser.name,
                storeName: document.getElementById('order-store').value,
                orderDate: document.getElementById('order-date').value,
                supplierId: document.getElementById('order-supplier').value,
                itemList: document.getElementById('order-items').value.trim(),
                estimatedAmount: parseFloat(document.getElementById('order-amount').value) || 0,
                expectedDeliveryDate: document.getElementById('expected-delivery').value,
                notes: document.getElementById('order-notes').value.trim()
            };

            // 前端驗證
            const validation = this.validateOrderData(formData);
            if (!validation.valid) {
                this.showMessage(validation.errors[0], 'warning');
                return;
            }

            // 顯示載入狀態
            const submitBtn = document.getElementById('submit-order-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '提交中...';
            submitBtn.disabled = true;

            // 調用後端API
            const result = await window.api.call('submit_order', formData);

            if (result.success) {
                this.showMessage('叫貨申請提交成功！', 'success');
                
                // 關閉表單
                this.hideOrderForm();
                
                // 重新載入叫貨記錄
                await this.loadOrderHistory();
                
            } else {
                this.showMessage(result.message || '叫貨申請提交失敗', 'error');
            }

        } catch (error) {
            console.error('提交叫貨申請失敗:', error);
            this.showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.getElementById('submit-order-btn');
            submitBtn.textContent = '提交申請';
            submitBtn.disabled = false;
        }
    }

    /**
     * 驗證叫貨數據
     */
    validateOrderData(data) {
        const errors = [];

        if (!data.orderDate) {
            errors.push('請選擇叫貨日期');
        }

        if (!data.storeName) {
            errors.push('請選擇分店');
        }

        if (!data.supplierId) {
            errors.push('請選擇供應商');
        }

        if (!data.itemList || data.itemList.length < 5) {
            errors.push('品項清單至少需要5個字元');
        }

        if (!data.estimatedAmount || data.estimatedAmount <= 0) {
            errors.push('預估金額必須大於0');
        }

        if (!data.expectedDeliveryDate) {
            errors.push('請設定預計到貨日');
        }

        // 檢查到貨日不能早於叫貨日
        if (data.orderDate && data.expectedDeliveryDate) {
            const orderDate = new Date(data.orderDate);
            const deliveryDate = new Date(data.expectedDeliveryDate);
            
            if (deliveryDate < orderDate) {
                errors.push('預計到貨日不能早於叫貨日期');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 載入叫貨歷史
     */
    async loadOrderHistory() {
        try {
            if (!this.currentUser) return;

            const result = await window.api.call('get_order_history', {
                employeeId: this.currentUser.employeeId,
                storeName: this.currentUser.store
            });

            if (result.success) {
                this.orders = result.data || [];
                this.renderOrderList();
            } else {
                console.warn('載入叫貨歷史失敗:', result.message);
                this.orders = [];
                this.renderOrderList();
            }

        } catch (error) {
            console.error('載入叫貨歷史失敗:', error);
            this.orders = [];
            this.renderOrderList();
        }
    }

    /**
     * 渲染叫貨列表
     */
    renderOrderList() {
        const container = document.getElementById('order-list-container');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="no-orders-message">
                    <p>暫無叫貨記錄</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.orders.forEach(order => {
            const statusClass = this.getStatusClass(order.status);
            const isOverdue = this.isOrderOverdue(order);

            html += `
                <div class="order-card ${statusClass} ${isOverdue ? 'overdue' : ''}" data-order-id="${order.orderId}">
                    <div class="order-header">
                        <h4>${order.orderId}</h4>
                        <div class="order-badges">
                            <span class="status-badge ${statusClass}">${order.status}</span>
                            ${isOverdue ? '<span class="overdue-badge">逾期</span>' : ''}
                        </div>
                    </div>
                    
                    <div class="order-info">
                        <div class="order-meta">
                            <span class="supplier">${this.getSupplierName(order.supplierId)}</span>
                            <span class="amount">$${order.estimatedAmount.toLocaleString()}</span>
                            <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div class="order-items">
                            <p>${order.itemList.length > 80 ? order.itemList.substring(0, 80) + '...' : order.itemList}</p>
                        </div>
                        
                        <div class="order-timeline">
                            <div class="timeline-item">
                                <label>叫貨日期:</label>
                                <span>${new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>
                            <div class="timeline-item">
                                <label>預計到貨:</label>
                                <span>${new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                            </div>
                            ${order.actualDeliveryDate ? `
                                <div class="timeline-item">
                                    <label>實際到貨:</label>
                                    <span>${new Date(order.actualDeliveryDate).toLocaleDateString()}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-info" onclick="orderingModule.showOrderDetail('${order.orderId}')">
                            查看詳情
                        </button>
                        ${this.canUpdateOrder(order) ? `
                            <button class="btn btn-warning" onclick="orderingModule.showUpdateOrderModal('${order.orderId}')">
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
     * 獲取供應商名稱
     */
    getSupplierName(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        return supplier ? supplier.name : supplierId;
    }

    /**
     * 檢查訂單是否逾期
     */
    isOrderOverdue(order) {
        if (order.status === '已到貨') return false;
        return new Date() > new Date(order.expectedDeliveryDate);
    }

    /**
     * 獲取狀態樣式類別
     */
    getStatusClass(status) {
        const statusClasses = {
            '待確認': 'pending',
            '已確認': 'confirmed',
            '配送中': 'shipping',
            '已到貨': 'delivered',
            '已取消': 'cancelled'
        };
        return statusClasses[status] || 'unknown';
    }

    /**
     * 檢查用戶是否可以更新訂單
     */
    canUpdateOrder(order) {
        if (!this.currentUser) return false;
        
        // 管理員或申請人可以更新狀態
        const allowedRoles = ['店長', '副店長', '總經理'];
        return allowedRoles.includes(this.currentUser.position) || 
               order.employeeId === this.currentUser.employeeId;
    }

    /**
     * 顯示訂單詳情
     */
    showOrderDetail(orderId) {
        const order = this.orders.find(o => o.orderId === orderId);
        if (!order) {
            this.showMessage('找不到訂單記錄', 'error');
            return;
        }

        // 這裡可以顯示訂單詳情模態視窗
        // 簡化實現，直接顯示alert
        const supplierName = this.getSupplierName(order.supplierId);
        const details = `
訂單編號: ${order.orderId}
供應商: ${supplierName}
叫貨日期: ${new Date(order.orderDate).toLocaleDateString()}
預計到貨: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}
金額: $${order.estimatedAmount.toLocaleString()}
狀態: ${order.status}
品項清單:
${order.itemList}
${order.notes ? '\n備註: ' + order.notes : ''}
        `;
        
        alert(details);
    }

    /**
     * 查看叫貨歷史
     */
    async viewOrderHistory() {
        // 已經在載入數據時顯示了歷史記錄
        await this.loadOrderHistory();
        this.showMessage('叫貨歷史已更新', 'info');
    }

    /**
     * 檢查庫存警告
     */
    async checkStockAlerts() {
        try {
            if (!this.currentUser) {
                this.showMessage('請先登入', 'warning');
                return;
            }

            const result = await window.api.call('check_stock_alerts', {
                storeName: this.currentUser.store
            });

            if (result.success) {
                this.displayStockAlerts(result.data);
            } else {
                this.showMessage('檢查庫存警告失敗', 'error');
            }

        } catch (error) {
            console.error('檢查庫存警告失敗:', error);
            this.showMessage('檢查庫存警告失敗', 'error');
        }
    }

    /**
     * 顯示庫存警告
     */
    displayStockAlerts(alerts) {
        if (!alerts || alerts.length === 0) {
            this.showMessage('目前沒有庫存警告', 'success');
            return;
        }

        let alertMessage = '庫存警告:\n';
        alerts.forEach(alert => {
            const level = alert.level === 'critical' ? '緊急' : '低庫存';
            alertMessage += `${level}: ${alert.itemName} (剩餘: ${alert.currentStock})\n`;
        });

        alert(alertMessage);
    }

    /**
     * 載入模組數據
     */
    async loadData(user) {
        this.currentUser = user;
        
        try {
            // 載入供應商清單
            await this.loadSuppliers();
            
            // 載入叫貨歷史
            await this.loadOrderHistory();
            
        } catch (error) {
            console.error('載入叫貨管理模組數據失敗:', error);
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
    window.OrderingModule = OrderingModule;
}
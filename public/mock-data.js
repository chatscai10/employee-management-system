// 🧪 模擬數據系統 - 無需外部API的本地運行版本

// 模擬員工資料庫
const mockEmployees = [
    { employeeId: 'EMP001', name: '測試員工', idNumber: 'A123456789', department: '技術部', position: '軟體工程師', store: '總公司', isActive: true, status: '在職' },
    { employeeId: 'EMP002', name: '王小明', idNumber: 'B987654321', department: '業務部', position: '業務經理', store: '台北分店', isActive: true, status: '在職' },
    { employeeId: 'EMP003', name: '李小華', idNumber: 'C246813579', department: '人事部', position: '人事專員', store: '台中分店', isActive: false, status: '審核中' }
];

// 模擬分店資料
const mockStores = [
    { id: 'STORE001', storeId: 'STORE001', name: '總公司', address: '台北市信義區', manager: '張總經理' },
    { id: 'STORE002', storeId: 'STORE002', name: '台北分店', address: '台北市大安區', manager: '李經理' },
    { id: 'STORE003', storeId: 'STORE003', name: '台中分店', address: '台中市西屯區', manager: '王經理' }
];

// 模擬考勤記錄
const mockAttendance = [
    { employeeId: 'EMP001', date: '2025-08-03', clockIn: '09:00', clockOut: '18:00', status: '正常' },
    { employeeId: 'EMP001', date: '2025-08-02', clockIn: '09:15', clockOut: '18:00', status: '遲到' }
];

// 模擬營收記錄
const mockRevenue = [
    { id: 'REV001', employeeId: 'EMP001', amount: 25000, date: '2025-08-03', type: '產品銷售' },
    { id: 'REV002', employeeId: 'EMP001', amount: 15000, date: '2025-08-02', type: '服務收入' }
];

// 模擬叫貨記錄
const mockOrdering = [
    { id: 'ORD001', employeeId: 'EMP001', items: ['雞排', '珍奶'], totalAmount: 150, status: '已送達', date: '2025-08-03' },
    { id: 'ORD002', employeeId: 'EMP001', items: ['便當', '飲料'], totalAmount: 120, status: '處理中', date: '2025-08-02' }
];

// 模擬維修記錄
const mockMaintenance = [
    { 
        id: 'MAIN001', 
        employeeId: 'EMP001', 
        equipment: '收銀機', 
        issue: '螢幕閃爍', 
        issueType: '故障',
        priority: '緊急',
        description: '收銀機螢幕出現閃爍現象，影響結帳作業',
        status: '已修復', 
        date: '2025-08-03',
        reportTime: '2025-08-03T09:00:00.000Z',
        photos: []
    },
    { 
        id: 'MAIN002', 
        employeeId: 'EMP001', 
        equipment: '冰箱', 
        issue: '溫度異常', 
        issueType: '保養',
        priority: '一般',
        description: '冰箱溫度無法維持在設定範圍內',
        status: '處理中', 
        date: '2025-08-02',
        reportTime: '2025-08-02T14:30:00.000Z',
        photos: []
    }
];

// 模擬排班記錄
const mockScheduling = [
    { employeeId: 'EMP001', month: '2025-08', vacationDates: ['2025-08-10', '2025-08-15'], status: '已核准' }
];

// 模擬投票記錄
const mockVoting = [
    { 
        id: 'VOTE001', 
        candidateId: 'EMP001', 
        candidateName: '測試員工',
        position: '店長', 
        status: '進行中', 
        votes: 5, 
        totalVoters: 10,
        description: '申請晉升為店長職位',
        startDate: '2025-08-01',
        endDate: '2025-08-15',
        agreedVotes: 5,
        currentApprovalRate: 0.5
    }
];

// 模擬API響應格式
class MockAPI {
    static success(data, message = '操作成功') {
        return {
            success: true,
            data: data,
            message: message,
            timestamp: new Date().toISOString()
        };
    }
    
    static error(message = '操作失敗') {
        return {
            success: false,
            message: message,
            timestamp: new Date().toISOString()
        };
    }
    
    // 登入驗證
    static login(name, idNumber) {
        const employee = mockEmployees.find(emp => emp.name === name && emp.idNumber === idNumber);
        if (employee) {
            return this.success(employee, '登入成功');
        } else {
            return this.error('姓名或身分證號錯誤');
        }
    }
    
    // 健康檢查
    static health() {
        return this.success({
            status: 'healthy',
            version: '1.0.0',
            uptime: Math.floor(Math.random() * 86400),
            memory: { used: 50, total: 100 }
        });
    }
    
    // 員工管理
    static getEmployees() {
        return this.success(mockEmployees);
    }
    
    // 考勤統計
    static getAttendanceStats(employeeId) {
        return this.success({
            workDays: 22,
            lateMinutes: 15,
            totalHours: 176
        });
    }
    
    // 今日考勤
    static getTodayAttendance(employeeId) {
        const records = mockAttendance.filter(att => att.employeeId === employeeId);
        return { success: true, records, message: '考勤記錄載入成功' };
    }
    
    // 分店列表
    static getStores() {
        return this.success(mockStores);
    }
    
    // 營收記錄
    static getRevenueList(employeeId) {
        const records = mockRevenue.filter(rev => rev.employeeId === employeeId);
        return { success: true, records, message: '營收記錄載入成功' };
    }
    
    // 叫貨記錄
    static getOrderingList(employeeId) {
        const records = mockOrdering.filter(ord => ord.employeeId === employeeId);
        return { success: true, records, message: '叫貨記錄載入成功' };
    }
    
    // 維修記錄
    static getMaintenanceList(employeeId) {
        const records = mockMaintenance.filter(main => main.employeeId === employeeId);
        return { success: true, records, message: '維修記錄載入成功' };
    }
    
    // 排班記錄
    static getSchedulingList(employeeId) {
        const records = mockScheduling.filter(sch => sch.employeeId === employeeId);
        return { success: true, records, message: '排班記錄載入成功' };
    }
    
    // 投票記錄
    static getVotingList(employeeId) {
        const records = mockVoting.filter(vote => vote.candidateId === employeeId);
        return { success: true, records, message: '投票記錄載入成功' };
    }
    
    // 進行中投票
    static getActiveVotes() {
        const records = mockVoting.filter(vote => vote.status === '進行中');
        return { success: true, records, message: '進行中投票載入成功' };
    }
    
    // 收入項目類別
    static getRevenueCategories() {
        return this.success({
            income: [
                { id: 1, categoryName: '產品銷售', name: '產品銷售', active: true },
                { id: 2, categoryName: '服務收入', name: '服務收入', active: true },
                { id: 3, categoryName: '租金收入', name: '租金收入', active: true },
                { id: 4, categoryName: '其他收入', name: '其他收入', active: true }
            ],
            expense: [
                { id: 1, categoryName: '食材成本', name: '食材成本', active: true },
                { id: 2, categoryName: '人事費用', name: '人事費用', active: true },
                { id: 3, categoryName: '租金支出', name: '租金支出', active: true },
                { id: 4, categoryName: '水電費', name: '水電費', active: true }
            ]
        });
    }
    
    // 叫貨品項
    static getOrderingItems() {
        return this.success([
            { id: 1, name: '雞排', category: '主食', price: 60, unit: '份', active: true },
            { id: 2, name: '珍珠奶茶', category: '飲料', price: 45, unit: '杯', active: true },
            { id: 3, name: '便當', category: '主食', price: 85, unit: '個', active: true },
            { id: 4, name: '炸雞', category: '主食', price: 120, unit: '份', active: true },
            { id: 5, name: '薯條', category: '配菜', price: 35, unit: '份', active: true },
            { id: 6, name: '可樂', category: '飲料', price: 25, unit: '杯', active: true }
        ]);
    }
    
    // 管理員系統API
    static getAdminEmployees() {
        return this.success({
            employees: mockEmployees,
            total: mockEmployees.length
        });
    }
    
    static getAdminStores() {
        return this.success({
            stores: mockStores,
            total: mockStores.length
        });
    }
    
    static getAdminSettings() {
        return this.success({
            votingPositions: ['店長', '經理', '主管', '組長'],
            revenueCategories: this.getRevenueCategories().data,
            systemConfig: {
                maxVacationDays: 7,
                minAdvanceDays: 3,
                autoApproval: false
            }
        });
    }
    
    static getPhotoStats() {
        return this.success({
            totalPhotos: 156,
            storageUsed: '2.3GB',
            avgSize: '15MB',
            lastUpload: '2025-08-03T10:30:00Z'
        });
    }
    
    static getAdminPhotos(page = 1, limit = 20) {
        const photos = [
            { id: 1, filename: 'receipt_001.jpg', size: '2.1MB', uploadTime: '2025-08-03T09:00:00Z', store: '總公司' },
            { id: 2, filename: 'maintenance_photo.jpg', size: '1.8MB', uploadTime: '2025-08-02T14:30:00Z', store: '台北分店' }
        ];
        return this.success({
            photos: photos,
            total: photos.length,
            page: page,
            limit: limit
        });
    }
    
    // 模擬POST操作
    static submitData(type, data) {
        console.log(`📝 模擬提交 ${type}:`, data);
        return this.success(data, `${type} 提交成功`);
    }
}

// 導出給其他檔案使用
window.MockAPI = MockAPI;
window.mockEmployees = mockEmployees;
window.mockStores = mockStores;

console.log('🧪 模擬數據系統載入完成');
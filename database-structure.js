// 企業員工管理系統 - 完整數據庫結構設計
// 手機端優先的員工管理系統

// 系統初始化數據
const initializeDatabase = () => {
    return {
        // 員工數據
        employees: [
            {
                employeeId: 'EMP001',
                name: '測試員工',
                idNumber: 'A123456789',
                birthDate: '1990-01-01',
                gender: '男',
                license: '汽車駕照',
                phone: '0912345678',
                address: '桃園市中壢區忠孝路123號',
                emergencyContact: '測試家長',
                relationship: '父親',
                emergencyPhone: '0987654321',
                startDate: '2024-01-01',
                store: '內壢忠孝店',
                position: '實習生',
                lineUserId: 'auto_generated_test',
                status: '在職',
                isActive: true,
                registrationDate: '2024-01-01T00:00:00.000Z',
                deviceFingerprint: 'test_device_001',
                totalWorkDays: 365,
                monthlyLateMinutes: 0
            }
        ],

        // 分店設定
        stores: [
            {
                storeId: 'ST001',
                name: '內壢忠孝店',
                people: 2,
                open: '1500-0200',
                latitude: 24.9748412,
                longitude: 121.2556713,
                radius: 100,
                address: '桃園市中壢區忠孝路93-1號',
                isActive: true
            },
            {
                storeId: 'ST002', 
                name: '桃園龍安店',
                people: 2,
                open: '1500-0200',
                latitude: 24.9880023,
                longitude: 121.2812737,
                radius: 100,
                address: '桃園市桃園區龍安街38-8號',
                isActive: true
            },
            {
                storeId: 'ST003',
                name: '中壢龍崗店', 
                people: 2,
                open: '1500-0200',
                latitude: 24.9298502,
                longitude: 121.2529472,
                radius: 100,
                address: '桃園市中壢區龍崗路321號',
                isActive: true
            }
        ],

        // 系統參數設定
        systemSettings: {
            // 排班系統參數
            scheduling: {
                defaultMonth: null, // 自動設定下個月
                maxVacationDays: 8, // 每人休假上限天數
                maxDailyVacationTotal: 2, // 每日休假總上限人數
                maxWeekendVacationDays: 3, // 週末休假上限天數
                maxStoreVacationPerDay: 1, // 同店每日休假上限
                maxStandbyVacationPerDay: 1, // 待命每日休假上限
                maxPartTimeVacationPerDay: 1, // 兼職每日休假上限
                operationTimeMinutes: 5, // 排班操作時間(分鐘)
                openDay: 16, // 每月開啟日
                openTime: '02:00', // 開啟時間
                closeDay: 21, // 每月關閉日
                closeTime: '02:00', // 關閉時間
                forbiddenDates: {}, // 各分店禁休日期
                holidayDates: {}, // 各分店公休日期
                currentStatus: 'closed', // 當前狀態
                currentUser: null, // 當前使用者
                sessionStartTime: null, // 開始時間
                sessionEndTime: null // 結束時間
            },

            // 投票系統參數
            voting: {
                positions: [
                    {
                        level: 1,
                        name: '實習生',
                        salary: 25000,
                        bonusRate: 0.05,
                        quota: 999,
                        requiredDays: 0,
                        failureCooldownDays: 30,
                        approvalRate: 0.6,
                        votingPeriodDays: 7,
                        maxLateMinutesPerMonth: 60,
                        punishment: '口頭警告',
                        notes: '新進員工職位'
                    },
                    {
                        level: 2,
                        name: '正職員工',
                        salary: 35000,
                        bonusRate: 0.08,
                        quota: 20,
                        requiredDays: 90,
                        failureCooldownDays: 60,
                        approvalRate: 0.6,
                        votingPeriodDays: 7,
                        maxLateMinutesPerMonth: 45,
                        punishment: '書面警告',
                        notes: '基本正職'
                    },
                    {
                        level: 3,
                        name: '資深員工',
                        salary: 45000,
                        bonusRate: 0.12,
                        quota: 10,
                        requiredDays: 365,
                        failureCooldownDays: 90,
                        approvalRate: 0.7,
                        votingPeriodDays: 10,
                        maxLateMinutesPerMonth: 30,
                        punishment: '減薪處分',
                        notes: '資深職位，需一年以上經驗'
                    }
                ]
            },

            // 營收系統參數
            revenue: {
                weekdayFormula: {
                    threshold: 13000,
                    rate: 0.30,
                    description: '大於13000的30%'
                },
                holidayFormula: {
                    threshold: 0,
                    rate: 0.38,
                    description: '大於0的38%'
                },
                serviceFees: {
                    panda: 0.35,
                    uber: 0.35,
                    inStore: 0
                }
            },

            // 作廢功能開關
            voidSettings: {
                attendance: true,
                revenue: true,
                ordering: true,
                maintenance: true,
                scheduling: false, // 排班不允許作廢
                voting: false // 投票不允許作廢
            },

            // 備份設定
            backup: {
                intervalDays: 5,
                email: 'backup@company.com'
            },

            // Telegram通知設定
            telegram: {
                botToken: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
                bossGroupId: '-1002658082392',
                employeeGroupId: '-1002658082392'
            }
        },

        // 營收類別預設項目
        revenueCategories: {
            income: [
                {
                    id: 'income001',
                    categoryName: '現金銷售',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 1,
                    isActive: true,
                    description: '店內現金直接銷售'
                },
                {
                    id: 'income002',
                    categoryName: '信用卡銷售',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 2,
                    isActive: true,
                    description: '信用卡刷卡銷售'
                },
                {
                    id: 'income003',
                    categoryName: '熊貓外送',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 3,
                    isActive: true,
                    description: '熊貓外送平台訂單'
                },
                {
                    id: 'income004',
                    categoryName: 'UBER外送',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 4,
                    isActive: true,
                    description: 'UBER外送平台訂單'
                },
                {
                    id: 'income005',
                    categoryName: '會員儲值',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 5,
                    isActive: true,
                    description: '會員卡儲值收入'
                },
                {
                    id: 'income006',
                    categoryName: '優惠券銷售',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 6,
                    isActive: true,
                    description: '優惠券及禮品卡銷售'
                },
                {
                    id: 'income007',
                    categoryName: '其他收入',
                    categoryType: 'income',
                    isDefault: true,
                    storeId: 'all',
                    displayOrder: 7,
                    isActive: true,
                    description: '其他雜項收入'
                }
            ],
            expense: [] // 支出項目保持自訂新增方式
        },

        // 叫貨品項清單
        orderingItems: [
            {
                itemId: 'ITEM001',
                supplier: '聯華食品',
                brand: '飛飞',
                product: '雞胸肉',
                unit: '份',
                unitPrice: 150,
                category: '肉類',
                isActive: true
            },
            {
                itemId: 'ITEM002', 
                supplier: '聯華食品',
                brand: '跳跳',
                product: '薯條',
                unit: '包',
                unitPrice: 80,
                category: '配菜',
                isActive: true
            },
            {
                itemId: 'ITEM003',
                supplier: '台糖',
                brand: '玫瑰',
                product: '麵粉',
                unit: '袋',
                unitPrice: 120,
                category: '原料',
                isActive: true
            },
            {
                itemId: 'ITEM004',
                supplier: '台糖', 
                brand: '大大',
                product: '調味料',
                unit: '組',
                unitPrice: 200,
                category: '調料',
                isActive: true
            },
            {
                itemId: 'ITEM005',
                supplier: '本地供應商',
                brand: '美味',
                product: '雞排',
                unit: '包',
                unitPrice: 300,
                category: '主食',
                isActive: true
            }
        ],

        // 考勤記錄
        attendanceRecords: [],

        // 營收記錄  
        revenueRecords: [],

        // 叫貨記錄
        orderingRecords: [],

        // 品項異常回報記錄
        issueReports: [],

        // 維修記錄
        maintenanceRecords: [],

        // 排班系統設定 - 完整配置
        schedulingSettings: {
            // 時間控制規則
            timeControl: {
                openDay: 16,           // 每月16號開啟
                openHour: 2,           // 02:00開啟
                closeDay: 21,          // 每月21號關閉  
                closeHour: 2,          // 02:00關閉
                operationTimeMinutes: 5, // 每次操作5分鐘限制
                autoKickOut: true      // 自動踢出未完成用戶
            },
            
            // 休假限制規則
            vacationRules: {
                maxVacationDaysPerMonth: 8,      // 每人每月休假上限: 8天
                maxDailyVacationTotal: 2,        // 每日休假總上限: 2人
                maxWeekendVacationsPerMonth: 3,  // 每月週末休假上限: 3天 (週五六日)
                maxDailyVacationPerStore: 1,     // 同店每日休假上限: 1人
                maxDailyVacationStandby: 1,      // 待命每日休假上限: 1人
                maxDailyVacationPartTime: 1,     // 兼職每日休假上限: 1人
                weekendDays: [0, 5, 6]          // 週末定義: 週五(5)、週六(6)、週日(0)
            },
            
            // 系統狀態
            systemStatus: {
                currentMonth: '',               // 當前排班月份 (YYYY-MM)
                isOpen: false,                 // 排班系統是否開啟
                currentUser: null,             // 當前使用者
                sessionStartTime: null,        // 會話開始時間
                sessionEndTime: null,          // 會話結束時間
                lastAutoCheck: null            // 上次自動檢查時間
            },
            
            // 分店特殊日期設定 (JSON格式)
            storeSettings: {
                '內壢忠孝店': {
                    storeId: 'ST001',
                    restrictedDates: [           // 禁休日期
                        '2025-08-15',            // 重要營業日
                        '2025-08-25',            // 月底結算日
                        '2025-09-15',
                        '2025-09-25'
                    ],
                    publicHolidays: [            // 公休日期 (計入員工休假額度)
                        '2025-08-10',            // 店休日
                        '2025-08-24',            // 設備維護日
                        '2025-09-14',
                        '2025-09-28'
                    ]
                },
                '桃園龍安店': {
                    storeId: 'ST002',
                    restrictedDates: [
                        '2025-08-12',
                        '2025-08-26',
                        '2025-09-12',
                        '2025-09-26'
                    ],
                    publicHolidays: [
                        '2025-08-11',
                        '2025-08-25',
                        '2025-09-15',
                        '2025-09-29'
                    ]
                },
                '中壢龍崗店': {
                    storeId: 'ST003',
                    restrictedDates: [
                        '2025-08-10',
                        '2025-08-20',
                        '2025-09-10',
                        '2025-09-20'
                    ],
                    publicHolidays: [
                        '2025-08-09',
                        '2025-08-23',
                        '2025-09-13',
                        '2025-09-27'
                    ]
                }
            },
            
            // 規則驗證配置
            validation: {
                enableFrontendValidation: true,   // 前端即時驗證
                enableBackendValidation: true,    // 後端安全驗證
                showDetailedErrors: true,         // 顯示詳細錯誤
                enableRealTimeCheck: true         // 即時規則檢查
            }
        },

        // 排班記錄
        schedulingRecords: [],

        // 員工排班會話記錄 (防止超時和衝突)
        schedulingSessions: [],

        // 投票記錄
        votingRecords: [],

        // 通知記錄
        notificationRecords: [],

        // 上傳檔案記錄
        uploadedFiles: []
    };
};

// 數據驗證函數
const validateEmployeeData = (employeeData) => {
    const required = [
        'name', 'idNumber', 'birthDate', 'gender', 'license',
        'phone', 'address', 'emergencyContact', 'relationship', 
        'emergencyPhone', 'startDate'
    ];
    
    for (let field of required) {
        if (!employeeData[field]) {
            throw new Error(`缺少必填欄位: ${field}`);
        }
    }
    
    // 身分證號格式驗證
    const idPattern = /^[A-Z][12][0-9]{8}$/;
    if (!idPattern.test(employeeData.idNumber)) {
        throw new Error('身分證號格式不正確');
    }
    
    return true;
};

// GPS距離計算函數
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 地球半徑(公尺)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 距離(公尺)
};

// 獎金計算函數
const calculateBonus = (incomeItems, bonusType, settings) => {
    let totalIncome = 0;
    
    incomeItems.forEach(item => {
        let adjustedAmount = item.amount;
        if (item.category === '熊貓') {
            adjustedAmount *= (1 - settings.revenue.serviceFees.panda);
        } else if (item.category === 'UBER') {
            adjustedAmount *= (1 - settings.revenue.serviceFees.uber);
        }
        totalIncome += adjustedAmount;
    });

    let bonusAmount = 0;
    
    if (bonusType === '平日獎金') {
        if (totalIncome > settings.revenue.weekdayFormula.threshold) {
            bonusAmount = totalIncome * settings.revenue.weekdayFormula.rate;
        }
    } else if (bonusType === '假日獎金') {
        if (totalIncome >= settings.revenue.holidayFormula.threshold) {
            bonusAmount = totalIncome * settings.revenue.holidayFormula.rate;
        }
    }
    
    return {
        totalIncome,
        bonusAmount,
        isQualified: bonusAmount > 0
    };
};

// 設備指紋生成
const generateDeviceFingerprint = (userAgent, platform, language) => {
    const fingerprint = btoa(`${userAgent}_${platform}_${language}_${Date.now()}`);
    return fingerprint.substring(0, 16);
};

// 分店自動檢測 (根據GPS位置)
const detectStore = (latitude, longitude, stores) => {
    for (let store of stores) {
        const distance = calculateDistance(
            latitude, longitude,
            store.latitude, store.longitude
        );
        
        if (distance <= store.radius) {
            return {
                store: store,
                distance: Math.round(distance)
            };
        }
    }
    
    return null;
};

module.exports = {
    initializeDatabase,
    validateEmployeeData,
    calculateDistance,
    calculateBonus,
    generateDeviceFingerprint,
    detectStore
};
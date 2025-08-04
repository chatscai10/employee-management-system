-- Google Cloud 庫存管理系統資料庫結構
-- 針對 Cloud SQL (MySQL 8.0) 優化設計
-- 支援多分店、動態配置、完整審計追蹤

-- 設定 SQL 模式和字符集
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET NAMES utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- =============================================================================
-- 核心表格：產品分類管理 (動態配置支援)
-- =============================================================================
CREATE TABLE IF NOT EXISTS product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL COMMENT '分類名稱',
    category_code VARCHAR(20) UNIQUE COMMENT '分類代碼',
    parent_category_id INT COMMENT '父分類ID (階層支援)',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    display_order INT DEFAULT 0 COMMENT '顯示順序',
    description TEXT COMMENT '分類描述',
    icon_url VARCHAR(255) COMMENT '分類圖示URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    created_by VARCHAR(10) COMMENT '建立者',
    updated_by VARCHAR(10) COMMENT '更新者',
    
    -- 外鍵約束
    FOREIGN KEY (parent_category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    
    -- 索引優化
    INDEX idx_category_active (is_active),
    INDEX idx_category_parent (parent_category_id),
    INDEX idx_category_order (display_order),
    
    -- 唯一約束
    UNIQUE KEY uk_category_name_active (category_name, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='產品分類表 - 支援階層分類和動態管理';

-- =============================================================================
-- 核心表格：供應商管理
-- =============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(200) NOT NULL COMMENT '供應商名稱',
    supplier_code VARCHAR(50) UNIQUE COMMENT '供應商代碼',
    contact_person VARCHAR(100) COMMENT '聯絡人',
    phone VARCHAR(20) COMMENT '電話',
    email VARCHAR(100) COMMENT '電子郵件',
    address TEXT COMMENT '地址',
    payment_terms VARCHAR(100) COMMENT '付款條件',
    credit_limit DECIMAL(12,2) DEFAULT 0 COMMENT '信用額度',
    tax_number VARCHAR(50) COMMENT '統一編號',
    bank_account VARCHAR(100) COMMENT '銀行帳號',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    rating ENUM('A', 'B', 'C', 'D') DEFAULT 'B' COMMENT '供應商評級',
    notes TEXT COMMENT '備註',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_by VARCHAR(10),
    
    -- 索引優化
    INDEX idx_supplier_active (is_active),
    INDEX idx_supplier_rating (rating),
    INDEX idx_supplier_code (supplier_code),
    
    -- 全文搜索索引
    FULLTEXT INDEX ft_supplier_search (supplier_name, contact_person)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='供應商管理表 - 完整供應商資訊管理';

-- =============================================================================
-- 增強產品表格 (擴展現有products表)
-- =============================================================================
-- 檢查是否需要新增欄位到現有的products表
-- 由於無法確定現有表結構，這裡提供完整的產品表定義

CREATE TABLE IF NOT EXISTS products_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(200) NOT NULL COMMENT '產品名稱',
    product_code VARCHAR(50) UNIQUE COMMENT '產品代碼',
    barcode VARCHAR(50) COMMENT '條碼',
    category_id INT COMMENT '產品分類ID',
    supplier_id INT COMMENT '供應商ID',
    unit VARCHAR(20) DEFAULT '個' COMMENT '單位',
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '成本價',
    selling_price DECIMAL(10,2) DEFAULT 0 COMMENT '售價',
    profit_margin DECIMAL(5,2) DEFAULT 0 COMMENT '利潤率(%)',
    
    -- 庫存管理欄位
    track_inventory BOOLEAN DEFAULT TRUE COMMENT '是否追蹤庫存',
    low_stock_threshold INT DEFAULT 10 COMMENT '低庫存警報閾值',
    max_stock_level INT DEFAULT 1000 COMMENT '最大庫存水位',
    reorder_point INT DEFAULT 20 COMMENT '再訂購點',
    reorder_quantity INT DEFAULT 100 COMMENT '建議訂購量',
    
    -- 產品屬性
    weight DECIMAL(8,3) COMMENT '重量(kg)',
    dimensions VARCHAR(50) COMMENT '尺寸(長x寬x高)',
    shelf_life_days INT COMMENT '保質期(天)',
    storage_conditions TEXT COMMENT '儲存條件',
    
    -- 狀態管理
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    is_perishable BOOLEAN DEFAULT FALSE COMMENT '是否易腐',
    requires_serial BOOLEAN DEFAULT FALSE COMMENT '是否需要序號管理',
    
    -- 審計欄位
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_by VARCHAR(10),
    
    -- 外鍵約束
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    
    -- 索引優化
    INDEX idx_product_category (category_id),
    INDEX idx_product_supplier (supplier_id),
    INDEX idx_product_active (is_active),
    INDEX idx_product_track_inventory (track_inventory),
    INDEX idx_product_barcode (barcode),
    
    -- 複合索引
    INDEX idx_product_category_active (category_id, is_active),
    INDEX idx_product_low_stock (low_stock_threshold, track_inventory),
    
    -- 全文搜索
    FULLTEXT INDEX ft_product_search (product_name, product_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='產品主檔表 - 完整產品資訊和庫存設定';

-- =============================================================================
-- 核心表格：庫存管理 (多分店支援)
-- =============================================================================
CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL COMMENT '產品ID',
    store_id VARCHAR(10) NOT NULL COMMENT '分店代碼',
    
    -- 庫存數量
    current_stock INT NOT NULL DEFAULT 0 COMMENT '當前庫存',
    reserved_stock INT DEFAULT 0 COMMENT '預留庫存',
    available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED COMMENT '可用庫存',
    damaged_stock INT DEFAULT 0 COMMENT '損壞庫存',
    
    -- 庫存成本
    unit_cost DECIMAL(10,2) DEFAULT 0 COMMENT '單位成本',
    total_value DECIMAL(12,2) GENERATED ALWAYS AS (current_stock * unit_cost) STORED COMMENT '庫存總值',
    
    -- 庫存管理資訊
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間',
    last_restock_date DATE COMMENT '最後進貨日期',
    last_count_date DATE COMMENT '最後盤點日期',
    next_reorder_date DATE COMMENT '下次訂購日期',
    
    -- 警報設定 (可覆蓋產品預設值)
    low_stock_threshold INT COMMENT '分店特定低庫存閾值',
    max_stock_level INT COMMENT '分店特定最大庫存',
    
    -- 位置資訊
    location_zone VARCHAR(50) COMMENT '庫存區域',
    location_shelf VARCHAR(50) COMMENT '貨架位置',
    
    -- 審計資訊
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(10) COMMENT '最後更新者',
    
    -- 外鍵約束
    FOREIGN KEY (product_id) REFERENCES products_enhanced(id) ON DELETE CASCADE,
    -- 注意：stores表的外鍵需要根據實際表結構調整
    
    -- 主要約束
    UNIQUE KEY uk_product_store (product_id, store_id),
    
    -- 索引優化
    INDEX idx_inventory_store (store_id),
    INDEX idx_inventory_product (product_id),
    INDEX idx_inventory_current_stock (current_stock),
    INDEX idx_inventory_available_stock (available_stock),
    INDEX idx_inventory_updated (last_updated),
    
    -- 複合索引
    INDEX idx_inventory_store_product (store_id, product_id),
    INDEX idx_inventory_low_stock (store_id, current_stock, low_stock_threshold),
    INDEX idx_inventory_restock (next_reorder_date, store_id),
    
    -- 條件索引 (低庫存)
    INDEX idx_inventory_critical_stock (store_id, product_id) 
    -- WHERE current_stock <= COALESCE(low_stock_threshold, 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='庫存主檔表 - 多分店庫存管理';

-- =============================================================================
-- 核心表格：庫存異動記錄 (完整審計追蹤)
-- =============================================================================
CREATE TABLE IF NOT EXISTS inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL COMMENT '產品ID',
    store_id VARCHAR(10) NOT NULL COMMENT '分店代碼',
    
    -- 異動資訊
    change_type ENUM('IN', 'OUT', 'ADJUST', 'TRANSFER', 'DAMAGE', 'COUNT') NOT NULL COMMENT '異動類型',
    quantity_change INT NOT NULL COMMENT '數量變化 (+/-)',
    previous_stock INT NOT NULL COMMENT '異動前庫存',
    new_stock INT NOT NULL COMMENT '異動後庫存',
    
    -- 成本資訊
    unit_cost DECIMAL(10,2) COMMENT '單位成本',
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (ABS(quantity_change) * unit_cost) STORED COMMENT '異動總成本',
    
    -- 關聯資訊
    reference_type ENUM('ORDER', 'PURCHASE', 'TRANSFER', 'ADJUSTMENT', 'DAMAGE', 'COUNT') COMMENT '關聯單據類型',
    reference_id VARCHAR(50) COMMENT '關聯單據號',
    batch_number VARCHAR(50) COMMENT '批次號',
    
    -- 異動原因
    reason TEXT COMMENT '異動原因',
    notes TEXT COMMENT '備註',
    
    -- 審計資訊
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '異動時間',
    created_by VARCHAR(10) NOT NULL COMMENT '操作者',
    approved_by VARCHAR(10) COMMENT '核准者',
    approved_at TIMESTAMP NULL COMMENT '核准時間',
    
    -- 系統資訊
    ip_address VARCHAR(45) COMMENT '操作IP',
    user_agent TEXT COMMENT '瀏覽器資訊',
    
    -- 外鍵約束
    FOREIGN KEY (product_id) REFERENCES products_enhanced(id),
    
    -- 索引優化
    INDEX idx_logs_product (product_id),
    INDEX idx_logs_store (store_id),
    INDEX idx_logs_date (created_at),
    INDEX idx_logs_type (change_type),
    INDEX idx_logs_reference (reference_type, reference_id),
    INDEX idx_logs_user (created_by),
    
    -- 複合索引
    INDEX idx_logs_product_date (product_id, created_at),
    INDEX idx_logs_store_date (store_id, created_at),
    INDEX idx_logs_store_product (store_id, product_id),
    
    -- 分析用索引
    INDEX idx_logs_analysis (store_id, change_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='庫存異動記錄表 - 完整庫存變動追蹤';

-- =============================================================================
-- 動態配置表格：收入項目管理
-- =============================================================================
CREATE TABLE IF NOT EXISTS revenue_items_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL COMMENT '收入類別名稱',
    category_code VARCHAR(20) UNIQUE COMMENT '類別代碼',
    
    -- 分店關聯
    store_id VARCHAR(10) COMMENT '特定分店 (NULL表示全店適用)',
    
    -- 顯示設定
    display_order INT DEFAULT 0 COMMENT '顯示順序',
    icon_name VARCHAR(50) COMMENT '圖示名稱',
    color_code VARCHAR(7) COMMENT '顏色代碼',
    
    -- 財務設定
    tax_rate DECIMAL(5,2) DEFAULT 0 COMMENT '稅率(%)',
    service_fee_rate DECIMAL(5,2) DEFAULT 0 COMMENT '服務費率(%)',
    commission_rate DECIMAL(5,2) DEFAULT 0 COMMENT '抽成率(%)',
    
    -- 統計設定
    include_in_daily_report BOOLEAN DEFAULT TRUE COMMENT '是否納入日報',
    include_in_kpi BOOLEAN DEFAULT TRUE COMMENT '是否納入KPI統計',
    
    -- 狀態管理
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    is_default BOOLEAN DEFAULT FALSE COMMENT '是否為預設項目',
    effective_date DATE COMMENT '生效日期',
    expiry_date DATE COMMENT '失效日期',
    
    -- 審計欄位
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_by VARCHAR(10),
    
    -- 索引優化
    INDEX idx_revenue_store (store_id),
    INDEX idx_revenue_active (is_active),
    INDEX idx_revenue_order (display_order),
    INDEX idx_revenue_default (is_default),
    INDEX idx_revenue_effective (effective_date, expiry_date),
    
    -- 複合索引
    INDEX idx_revenue_store_active (store_id, is_active),
    UNIQUE KEY uk_revenue_store_code (store_id, category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='收入項目表 - 動態配置支援分店特定設定';

-- =============================================================================
-- 動態配置表格：支出項目管理
-- =============================================================================
CREATE TABLE IF NOT EXISTS expense_items_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL COMMENT '支出類別名稱',
    category_code VARCHAR(20) UNIQUE COMMENT '類別代碼',
    
    -- 分店關聯
    store_id VARCHAR(10) COMMENT '特定分店 (NULL表示全店適用)',
    
    -- 顯示設定
    display_order INT DEFAULT 0 COMMENT '顯示順序',
    icon_name VARCHAR(50) COMMENT '圖示名稱',
    color_code VARCHAR(7) COMMENT '顏色代碼',
    
    -- 財務設定
    is_tax_deductible BOOLEAN DEFAULT TRUE COMMENT '是否可抵稅',
    requires_receipt BOOLEAN DEFAULT TRUE COMMENT '是否需要發票',
    max_amount_per_transaction DECIMAL(10,2) COMMENT '單筆最大金額',
    requires_approval BOOLEAN DEFAULT FALSE COMMENT '是否需要核准',
    approval_threshold DECIMAL(10,2) COMMENT '核准門檻金額',
    
    -- 分類設定
    expense_type ENUM('FIXED', 'VARIABLE', 'CAPITAL', 'OPERATIONAL') DEFAULT 'OPERATIONAL' COMMENT '支出類型',
    department VARCHAR(50) COMMENT '部門',
    cost_center VARCHAR(50) COMMENT '成本中心',
    
    -- 統計設定
    include_in_daily_report BOOLEAN DEFAULT TRUE COMMENT '是否納入日報',
    include_in_budget BOOLEAN DEFAULT TRUE COMMENT '是否納入預算管控',
    
    -- 狀態管理
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    effective_date DATE COMMENT '生效日期',
    expiry_date DATE COMMENT '失效日期',
    
    -- 審計欄位
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_by VARCHAR(10),
    
    -- 索引優化
    INDEX idx_expense_store (store_id),
    INDEX idx_expense_active (is_active),
    INDEX idx_expense_type (expense_type),
    INDEX idx_expense_order (display_order),
    INDEX idx_expense_approval (requires_approval),
    INDEX idx_expense_effective (effective_date, expiry_date),
    
    -- 複合索引
    INDEX idx_expense_store_active (store_id, is_active),
    UNIQUE KEY uk_expense_store_code (store_id, category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='支出項目表 - 動態配置支援分店特定設定';

-- =============================================================================
-- 系統配置表格：庫存警報設定
-- =============================================================================
CREATE TABLE IF NOT EXISTS inventory_alert_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    store_id VARCHAR(10) COMMENT '分店代碼 (NULL表示全店預設)',
    category_id INT COMMENT '產品分類ID (NULL表示全分類)',
    
    -- 警報設定
    low_stock_threshold INT DEFAULT 10 COMMENT '低庫存閾值',
    critical_stock_threshold INT DEFAULT 5 COMMENT '嚴重缺貨閾值',
    overstocks_threshold INT DEFAULT 1000 COMMENT '庫存過多閾值',
    
    -- 通知設定
    enable_telegram_alert BOOLEAN DEFAULT TRUE COMMENT '啟用Telegram警報',
    enable_email_alert BOOLEAN DEFAULT FALSE COMMENT '啟用郵件警報',
    enable_sms_alert BOOLEAN DEFAULT FALSE COMMENT '啟用簡訊警報',
    
    -- 警報頻率
    alert_frequency ENUM('IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY') DEFAULT 'DAILY' COMMENT '警報頻率',
    quiet_hours_start TIME COMMENT '靜音開始時間',
    quiet_hours_end TIME COMMENT '靜音結束時間',
    
    -- 收件人設定
    telegram_chat_ids TEXT COMMENT 'Telegram群組ID列表 (JSON格式)',
    email_recipients TEXT COMMENT '郵件收件人列表 (JSON格式)',
    sms_recipients TEXT COMMENT '簡訊收件人列表 (JSON格式)',
    
    -- 狀態管理
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否啟用',
    
    -- 審計欄位
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(10),
    updated_by VARCHAR(10),
    
    -- 外鍵約束
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE CASCADE,
    
    -- 索引優化
    INDEX idx_alert_store (store_id),
    INDEX idx_alert_category (category_id),
    INDEX idx_alert_active (is_active),
    
    -- 唯一約束
    UNIQUE KEY uk_alert_store_category (store_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='庫存警報設定表 - 可依分店和分類設定不同警報規則';

-- =============================================================================
-- 系統配置表格：動態配置版本控制
-- =============================================================================
CREATE TABLE IF NOT EXISTS configuration_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_type ENUM('PRODUCT_CATEGORY', 'SUPPLIER', 'REVENUE_ITEM', 'EXPENSE_ITEM', 'INVENTORY_ALERT') NOT NULL COMMENT '配置類型',
    config_id INT NOT NULL COMMENT '配置項目ID',
    
    -- 版本資訊
    version_number INT NOT NULL DEFAULT 1 COMMENT '版本號',
    config_data JSON NOT NULL COMMENT '配置資料快照',
    change_summary TEXT COMMENT '變更摘要',
    
    -- 狀態管理
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否為當前版本',
    
    -- 審計資訊
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '版本建立時間',
    created_by VARCHAR(10) NOT NULL COMMENT '變更者',
    
    -- 索引優化
    INDEX idx_config_type_id (config_type, config_id),
    INDEX idx_config_version (config_type, config_id, version_number),
    INDEX idx_config_active (config_type, config_id, is_active),
    INDEX idx_config_date (created_at),
    
    -- 唯一約束 (每個配置項目只能有一個當前版本)
    UNIQUE KEY uk_config_active (config_type, config_id, is_active) 
    -- 需要配合觸發器確保只有一個 is_active=TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='配置版本控制表 - 追蹤所有動態配置的變更歷史';

-- =============================================================================
-- 效能優化視圖
-- =============================================================================

-- 庫存總覽視圖 (管理員儀表板)
CREATE OR REPLACE VIEW v_inventory_summary AS
SELECT 
    i.store_id,
    COUNT(*) as total_products,
    SUM(i.current_stock) as total_stock,
    SUM(i.total_value) as total_value,
    COUNT(CASE WHEN i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) THEN 1 END) as low_stock_count,
    COUNT(CASE WHEN i.current_stock = 0 THEN 1 END) as out_of_stock_count,
    AVG(i.current_stock) as avg_stock_level,
    MAX(i.last_updated) as last_inventory_update
FROM inventory i
LEFT JOIN products_enhanced p ON i.product_id = p.id
WHERE p.is_active = TRUE
GROUP BY i.store_id;

-- 低庫存警報視圖 (即時監控)
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    i.store_id,
    i.product_id,
    p.product_name,
    p.product_code,
    pc.category_name,
    s.supplier_name,
    i.current_stock,
    COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) as threshold,
    i.location_zone,
    i.location_shelf,
    CASE 
        WHEN i.current_stock = 0 THEN 'OUT_OF_STOCK'
        WHEN i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) * 0.5 THEN 'CRITICAL'
        ELSE 'LOW'
    END as alert_level,
    i.last_updated
FROM inventory i
JOIN products_enhanced p ON i.product_id = p.id
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.is_active = TRUE 
AND p.track_inventory = TRUE
AND i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10)
ORDER BY 
    CASE 
        WHEN i.current_stock = 0 THEN 1
        WHEN i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) * 0.5 THEN 2
        ELSE 3
    END,
    i.current_stock ASC;

-- 庫存異動分析視圖 (數據分析)
CREATE OR REPLACE VIEW v_inventory_movement_analysis AS
SELECT 
    il.store_id,
    il.product_id,
    p.product_name,
    DATE(il.created_at) as movement_date,
    il.change_type,
    SUM(il.quantity_change) as total_quantity_change,
    SUM(il.total_cost) as total_cost_impact,
    COUNT(*) as transaction_count,
    AVG(il.quantity_change) as avg_quantity_per_transaction
FROM inventory_logs il
JOIN products_enhanced p ON il.product_id = p.id
WHERE il.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY 
    il.store_id,
    il.product_id,
    DATE(il.created_at),
    il.change_type
ORDER BY movement_date DESC, total_quantity_change DESC;

-- =============================================================================
-- 系統初始資料
-- =============================================================================

-- 插入預設產品分類
INSERT IGNORE INTO product_categories (category_name, category_code, display_order, description) VALUES
('飲料', 'BEVERAGE', 1, '各類飲品'),
('食品', 'FOOD', 2, '食物類商品'),
('日用品', 'DAILY', 3, '日常用品'),
('文具', 'STATIONERY', 4, '辦公文具'),
('電子產品', 'ELECTRONICS', 5, '電子設備'),
('清潔用品', 'CLEANING', 6, '清潔相關用品');

-- 插入預設收入項目
INSERT IGNORE INTO revenue_items_enhanced (category_name, category_code, display_order, is_default, tax_rate) VALUES
('現金銷售', 'CASH_SALE', 1, TRUE, 5.00),
('信用卡銷售', 'CARD_SALE', 2, TRUE, 5.00),
('熊貓外送', 'PANDA_DELIVERY', 3, TRUE, 5.00),
('UBER外送', 'UBER_DELIVERY', 4, TRUE, 5.00),
('其他收入', 'OTHER_INCOME', 5, FALSE, 5.00);

-- 插入預設支出項目
INSERT IGNORE INTO expense_items_enhanced (category_name, category_code, display_order, expense_type, requires_receipt) VALUES
('進貨成本', 'PURCHASE_COST', 1, 'VARIABLE', TRUE),
('租金', 'RENT', 2, 'FIXED', TRUE),
('水電費', 'UTILITIES', 3, 'FIXED', TRUE),
('人事費用', 'PAYROLL', 4, 'FIXED', TRUE),
('維修費', 'MAINTENANCE', 5, 'VARIABLE', TRUE),
('廣告費', 'ADVERTISING', 6, 'VARIABLE', TRUE),
('雜項支出', 'MISCELLANEOUS', 7, 'VARIABLE', FALSE);

-- 插入預設庫存警報設定
INSERT IGNORE INTO inventory_alert_settings (store_id, low_stock_threshold, critical_stock_threshold, enable_telegram_alert) VALUES
(NULL, 10, 5, TRUE);  -- 全店預設設定

-- =============================================================================
-- 觸發器：自動管理庫存異動記錄
-- =============================================================================

DELIMITER $$

-- 庫存更新觸發器 (記錄所有庫存變動)
CREATE TRIGGER tr_inventory_update_log 
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    -- 只有當庫存數量實際改變時才記錄
    IF OLD.current_stock != NEW.current_stock THEN
        INSERT INTO inventory_logs (
            product_id,
            store_id,
            change_type,
            quantity_change,
            previous_stock,
            new_stock,
            unit_cost,
            reason,
            created_by
        ) VALUES (
            NEW.product_id,
            NEW.store_id,
            CASE 
                WHEN NEW.current_stock > OLD.current_stock THEN 'IN'
                WHEN NEW.current_stock < OLD.current_stock THEN 'OUT'
                ELSE 'ADJUST'
            END,
            NEW.current_stock - OLD.current_stock,
            OLD.current_stock,
            NEW.current_stock,
            NEW.unit_cost,
            '系統自動記錄',
            NEW.updated_by
        );
    END IF;
END$$

-- 配置版本控制觸發器
CREATE TRIGGER tr_config_version_control 
BEFORE INSERT ON configuration_versions
FOR EACH ROW
BEGIN
    -- 確保每個配置項目只有一個當前版本
    IF NEW.is_active = TRUE THEN
        UPDATE configuration_versions 
        SET is_active = FALSE 
        WHERE config_type = NEW.config_type 
        AND config_id = NEW.config_id 
        AND is_active = TRUE;
    END IF;
END$$

DELIMITER ;

-- =============================================================================
-- 分區設定 (大數據量優化)
-- =============================================================================

-- 如果預期庫存異動記錄很大，可以考慮按日期分區
-- ALTER TABLE inventory_logs 
-- PARTITION BY RANGE (YEAR(created_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p2026 VALUES LESS THAN (2027),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- =============================================================================
-- 效能監控查詢 (用於系統監控)
-- =============================================================================

-- 檢查索引使用情況
-- SHOW INDEX FROM inventory;
-- SHOW INDEX FROM inventory_logs;

-- 檢查表大小
-- SELECT 
--     table_name,
--     ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Table Size (MB)"
-- FROM information_schema.tables 
-- WHERE table_schema = DATABASE()
-- AND table_name IN ('inventory', 'inventory_logs', 'products_enhanced')
-- ORDER BY (data_length + index_length) DESC;

-- =============================================================================
-- 完成訊息
-- =============================================================================

SELECT '🎉 Google Cloud 庫存管理系統資料庫結構建立完成!' as message;
SELECT CONCAT('📊 共建立 ', COUNT(*), ' 個表格') as summary 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN (
    'product_categories', 'suppliers', 'products_enhanced', 
    'inventory', 'inventory_logs', 'revenue_items_enhanced', 
    'expense_items_enhanced', 'inventory_alert_settings', 
    'configuration_versions'
);

-- 顯示所有相關表格
SELECT table_name as '📋 已建立的表格', table_comment as '說明'
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN (
    'product_categories', 'suppliers', 'products_enhanced', 
    'inventory', 'inventory_logs', 'revenue_items_enhanced', 
    'expense_items_enhanced', 'inventory_alert_settings', 
    'configuration_versions'
)
ORDER BY table_name;
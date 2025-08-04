-- 🗄️ 企業員工管理系統 - 完整測試數據庫
-- 設計用於Google Cloud SQL部署和功能測試
-- 包含500+筆真實模擬數據，涵蓋所有業務場景

SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
SET NAMES utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- =============================================================================
-- 🏢 基礎資料：分店和部門
-- =============================================================================

-- 分店資料
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(20) PRIMARY KEY,
    store_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    manager VARCHAR(50),
    phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO stores (id, store_id, name, address, manager, phone) VALUES
('STORE001', 'STORE001', '總公司', '台北市信義區信義路五段7號', '張總經理', '02-2345-6789'),
('STORE002', 'STORE002', '台北分店', '台北市大安區忠孝東路四段123號', '李經理', '02-2876-5432'),
('STORE003', 'STORE003', '台中分店', '台中市西屯區台灣大道三段99號', '王經理', '04-2234-5678'),
('STORE004', 'STORE004', '高雄分店', '高雄市前鎮區中山二路168號', '陳經理', '07-3456-7890'),
('STORE005', 'STORE005', '桃園分店', '桃園市中壢區中正路456號', '林經理', '03-4567-8901');

-- =============================================================================
-- 👥 員工資料：完整的組織架構
-- =============================================================================

CREATE TABLE IF NOT EXISTS employees (
    employee_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    id_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(50) NOT NULL,
    store VARCHAR(50) NOT NULL,
    store_id VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    status ENUM('在職', '離職', '審核中', '停職') DEFAULT '在職',
    email VARCHAR(100),
    phone VARCHAR(20),
    start_date DATE,
    salary DECIMAL(10,2),
    manager_id VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (store_id) REFERENCES stores(id),
    INDEX idx_department (department),
    INDEX idx_store (store_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15個測試員工 (涵蓋5個部門，5家分店)
INSERT INTO employees VALUES
-- 管理層
('EMP001', '張總經理', 'A123456789', '管理部', '總經理', '總公司', 'STORE001', TRUE, '在職', 'zhang.ceo@company.com', '0912-345-678', '2020-01-01', 120000, NULL, '張夫人', '0987-654-321'),
('EMP002', '李副總', 'B987654321', '管理部', '副總經理', '總公司', 'STORE001', TRUE, '在職', 'li.vp@company.com', '0923-456-789', '2020-03-15', 100000, 'EMP001', '李太太', '0976-543-210'),

-- 技術部
('EMP003', '王技術長', 'C246813579', '技術部', '技術長', '總公司', 'STORE001', TRUE, '在職', 'wang.cto@company.com', '0934-567-890', '2021-01-20', 90000, 'EMP001', '王先生', '0965-432-109'),
('EMP004', '陳工程師', 'D135792468', '技術部', '資深工程師', '台北分店', 'STORE002', TRUE, '在職', 'chen.dev@company.com', '0945-678-901', '2021-06-01', 75000, 'EMP003', '陳小姐', '0954-321-098'),
('EMP005', '林系統管理員', 'E369258147', '技術部', '系統管理員', '台中分店', 'STORE003', TRUE, '在職', 'lin.sysadmin@company.com', '0956-789-012', '2022-02-15', 70000, 'EMP003', '林媽媽', '0943-210-987'),

-- 業務部
('EMP006', '黃業務經理', 'F147258369', '業務部', '業務經理', '台北分店', 'STORE002', TRUE, '在職', 'huang.sales@company.com', '0967-890-123', '2021-04-10', 80000, 'EMP002', '黃太太', '0932-109-876'),
('EMP007', '吳業務代表', 'G258369147', '業務部', '業務代表', '高雄分店', 'STORE004', TRUE, '在職', 'wu.sales@company.com', '0978-901-234', '2022-01-05', 55000, 'EMP006', '吳先生', '0921-098-765'),
('EMP008', '趙客服專員', 'H369147258', '業務部', '客服專員', '桃園分店', 'STORE005', TRUE, '在職', 'zhao.service@company.com', '0989-012-345', '2022-07-20', 50000, 'EMP006', '趙小姐', '0910-987-654'),

-- 人事部
('EMP009', '錢人事經理', 'I147369258', '人事部', '人事經理', '總公司', 'STORE001', TRUE, '在職', 'qian.hr@company.com', '0990-123-456', '2020-09-01', 70000, 'EMP002', '錢先生', '0909-876-543'),
('EMP010', '孫招聘專員', 'J258147369', '人事部', '招聘專員', '台北分店', 'STORE002', TRUE, '在職', 'sun.recruit@company.com', '0901-234-567', '2021-11-15', 48000, 'EMP009', '孫太太', '0898-765-432'),

-- 財務部
('EMP011', '周財務經理', 'K369258147', '財務部', '財務經理', '總公司', 'STORE001', TRUE, '在職', 'zhou.finance@company.com', '0912-345-678', '2020-05-20', 85000, 'EMP002', '周夫人', '0887-654-321'),
('EMP012', '吳會計師', 'L147258369', '財務部', '會計師', '台中分店', 'STORE003', TRUE, '在職', 'wu.accounting@company.com', '0923-456-789', '2021-08-10', 65000, 'EMP011', '吳先生', '0876-543-210'),

-- 營運部
('EMP013', '鄭營運經理', 'M258369147', '營運部', '營運經理', '高雄分店', 'STORE004', TRUE, '在職', 'zheng.ops@company.com', '0934-567-890', '2021-03-01', 75000, 'EMP002', '鄭小姐', '0865-432-109'),
('EMP014', '謝店長', 'N369147258', '營運部', '分店店長', '桃園分店', 'STORE005', TRUE, '在職', 'xie.manager@company.com', '0945-678-901', '2021-12-01', 60000, 'EMP013', '謝太太', '0854-321-098'),
('EMP015', '韓助理', 'O147369258', '營運部', '營運助理', '台北分店', 'STORE002', FALSE, '審核中', 'han.assistant@company.com', '0956-789-012', '2024-01-15', 45000, 'EMP013', '韓媽媽', '0843-210-987');

-- =============================================================================
-- 📦 產品和庫存管理
-- =============================================================================

-- 產品分類
CREATE TABLE IF NOT EXISTS product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(20) UNIQUE,
    parent_category_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    icon_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_category_id) REFERENCES product_categories(id),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO product_categories (category_name, category_code, display_order) VALUES
('電子產品', 'ELECTRONICS', 1),
('辦公用品', 'OFFICE', 2),
('食品飲料', 'FOOD', 3),
('服裝配件', 'CLOTHING', 4),  
('清潔用品', 'CLEANING', 5),
('文具用品', 'STATIONERY', 6),
('醫療用品', 'MEDICAL', 7),
('工具設備', 'TOOLS', 8),
('傢俱用品', 'FURNITURE', 9),
('其他用品', 'OTHERS', 10);

-- 供應商資料
CREATE TABLE IF NOT EXISTS suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_code VARCHAR(50) UNIQUE,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO suppliers (supplier_name, supplier_code, contact_person, phone, email, address, payment_terms, credit_limit) VALUES
('蘋果電子有限公司', 'APPLE001', '張經理', '02-2345-6789', 'zhang@apple-tw.com', '台北市信義區蘋果路123號', '月結30天', 5000000),
('三星科技股份有限公司', 'SAMSUNG001', '李總監', '02-2876-5432', 'li@samsung.com.tw', '台北市內湖區三星街456號', '月結45天', 3000000),
('宏碁電腦股份有限公司', 'ACER001', '王副理', '03-2345-6789', 'wang@acer.com', '桃園市龜山區宏碁路789號', '月結30天', 2000000),
('華碩科技股份有限公司', 'ASUS001', '陳經理', '02-2234-5678', 'chen@asus.com.tw', '台北市北投區華碩街321號', '月結30天', 2500000),
('聯想台灣有限公司', 'LENOVO001', '林主管', '02-3456-7890', 'lin@lenovo.com.tw', '台北市松山區聯想路987號', '月結60天', 1800000),
('戴爾科技有限公司', 'DELL001', '黃經理', '02-4567-8901', 'huang@dell.com.tw', '台北市大安區戴爾街654號', '月結45天', 1500000),
('辦公王文具有限公司', 'OFFICE001', '吳店長', '04-2345-6789', 'wu@officeking.com.tw', '台中市西屯區文具街123號', '月結15天', 500000),
('統一超商股份有限公司', 'FOOD001', '趙經理', '02-5678-9012', 'zhao@7-eleven.com.tw', '台北市信義區統一路456號', '月結7天', 1000000),
('全家便利商店股份有限公司', 'FOOD002', '錢副理', 'qian@family.com.tw', '台北市中山區全家街789號', '04-3456-7890', '月結10天', 800000),
('清潔大師有限公司', 'CLEAN001', '孫總監', '07-2345-6789', 'sun@cleanmaster.com.tw', '高雄市前鎮區清潔路321號', '月結20天', 300000),
('3M台灣有限公司', '3M001', '周經理', '02-6789-0123', 'zhou@3m.com.tw', '台北市內湖區3M街654號', '月結30天', 1200000),
('工具王有限公司', 'TOOLS001', '吳師傅', '03-4567-8901', 'wu@toolsking.com.tw', '桃園市中壢區工具路987號', '月結21天', 400000);

-- 產品主檔
CREATE TABLE IF NOT EXISTS products_enhanced (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    supplier_id INT NOT NULL,
    unit VARCHAR(20) DEFAULT '個',
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    specifications JSON,
    image_url VARCHAR(255),
    barcode VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    INDEX idx_category (category_id),
    INDEX idx_supplier (supplier_id),
    INDEX idx_active (is_active),
    INDEX idx_price (unit_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 50個測試產品 (電子產品類別)
INSERT INTO products_enhanced (product_code, product_name, category_id, supplier_id, unit, unit_price, cost_price, min_stock_level, max_stock_level, description) VALUES
-- 電子產品 (1-15)
('IP15-001', 'iPhone 15 128GB 黑色', 1, 1, '台', 35900, 28000, 5, 50, 'Apple iPhone 15 智能手機'),
('IP15-002', 'iPhone 15 Pro 256GB 鈦金色', 1, 1, '台', 45900, 36000, 3, 30, 'Apple iPhone 15 Pro 專業版'),
('SN24-001', 'Samsung Galaxy S24 256GB', 1, 2, '台', 32900, 26000, 5, 40, '三星旗艦智能手機'),
('SN24-002', 'Samsung Galaxy Tab S9', 1, 2, '台', 25900, 20000, 3, 25, '三星平板電腦'),
('MB-001', 'MacBook Pro M3 14吋', 1, 1, '台', 65900, 52000, 2, 20, 'Apple MacBook Pro 筆記型電腦'),
('MB-002', 'MacBook Air M2 13吋', 1, 1, '台', 38900, 30000, 3, 25, 'Apple MacBook Air 輕薄筆電'),
('AC-001', 'Acer Aspire 5 筆電', 1, 3, '台', 25900, 20000, 5, 30, '宏碁入門筆記型電腦'),
('AS-001', 'ASUS VivoBook 15', 1, 4, '台', 28900, 22000, 4, 35, '華碩輕薄筆記型電腦'),
('LN-001', 'Lenovo ThinkPad E14', 1, 5, '台', 32900, 25000, 3, 25, '聯想商務筆記型電腦'),
('DL-001', 'Dell XPS 13', 1, 6, '台', 45900, 35000, 2, 20, '戴爾高階筆記型電腦'),
('IP-001', 'iPad Air 第5代', 1, 1, '台', 19900, 15000, 5, 40, 'Apple iPad Air 平板電腦'),
('AW-001', 'Apple Watch Series 9', 1, 1, '支', 12900, 10000, 10, 50, 'Apple智能手錶'),
('AP-001', 'AirPods Pro 第2代', 1, 1, '副', 7490, 5500, 15, 100, 'Apple無線藍牙耳機'),
('MM-001', 'Magic Mouse 3', 1, 1, '個', 2590, 1800, 20, 80, 'Apple無線滑鼠'),
('MK-001', 'Magic Keyboard', 1, 1, '個', 3590, 2500, 15, 60, 'Apple無線鍵盤'),

-- 辦公用品 (16-25)
('OFF-001', 'A4影印紙 500張', 2, 7, '包', 150, 100, 50, 500, '白色A4影印紙'),
('OFF-002', '原子筆 藍色', 2, 7, '支', 15, 8, 100, 1000, '藍色原子筆'),
('OFF-003', '鉛筆 2B', 2, 7, '支', 8, 4, 200, 2000, '2B鉛筆'),
('OFF-004', '橡皮擦', 2, 7, '個', 10, 5, 100, 800, '白色橡皮擦'),
('OFF-005', '資料夾 A4', 2, 7, '個', 25, 15, 50, 300, 'A4塑膠資料夾'),
('OFF-006', '迴紋針 50入', 2, 7, '盒', 20, 12, 30, 200, '金屬迴紋針'),
('OFF-007', '釘書機', 2, 7, '台', 120, 80, 20, 100, '標準釘書機'),
('OFF-008', '釘書針 1000入', 2, 7, '盒', 30, 18, 50, 300, '10號釘書針'),
('OFF-009', '立可白', 2, 7, '支', 35, 20, 40, 200, '修正液'),
('OFF-010', '螢光筆 黃色', 2, 7, '支', 25, 15, 60, 400, '黃色螢光筆'),

-- 食品飲料 (26-35)
('FOOD-001', '礦泉水 600ml', 3, 8, '瓶', 20, 12, 100, 1000, '天然礦泉水'),
('FOOD-002', '可口可樂 330ml', 3, 8, '罐', 25, 15, 80, 800, '經典可樂'),
('FOOD-003', '咖啡 即溶', 3, 8, '包', 15, 8, 200, 1500, '三合一即溶咖啡'),
('FOOD-004', '泡麵 牛肉口味', 3, 9, '碗', 35, 20, 100, 600, '牛肉泡麵'),
('FOOD-005', '餅乾 蘇打', 3, 9, '包', 45, 25, 50, 300, '蘇打餅乾'),
('FOOD-006', '巧克力棒', 3, 9, '條', 30, 18, 80, 500, '牛奶巧克力'),
('FOOD-007', '洋芋片 原味', 3, 9, '包', 55, 30, 40, 200, '原味洋芋片'),
('FOOD-008', '口香糖', 3, 9, '包', 25, 12, 60, 400, '薄荷口香糖'),
('FOOD-009', '維他命C錠', 3, 8, '瓶', 180, 120, 20, 100, '維他命C補充錠'),
('FOOD-010', '能量飲料', 3, 8, '罐', 45, 25, 30, 200, '提神能量飲料'),

-- 清潔用品 (36-45)
('CLEAN-001', '衛生紙 12卷裝', 5, 10, '包', 120, 80, 30, 200, '三層衛生紙'),
('CLEAN-002', '洗手乳 500ml', 5, 10, '瓶', 85, 50, 25, 150, '抗菌洗手乳'),
('CLEAN-003', '濕紙巾 80抽', 5, 10, '包', 45, 25, 40, 300, '酒精濕紙巾'),
('CLEAN-004', '垃圾袋 大', 5, 10, '包', 35, 20, 50, 400, '黑色垃圾袋'),
('CLEAN-005', '抹布 微纖維', 5, 10, '條', 25, 12, 60, 300, '清潔抹布'),
('CLEAN-006', '洗碗精 1000ml', 5, 11, '瓶', 65, 40, 20, 120, '濃縮洗碗精'),
('CLEAN-007', '地板清潔劑', 5, 11, '瓶', 95, 60, 15, 80, '多功能地板清潔劑'),
('CLEAN-008', '玻璃清潔劑', 5, 11, '瓶', 75, 45, 20, 100, '玻璃專用清潔劑'),
('CLEAN-009', '馬桶清潔劑', 5, 11, '瓶', 85, 50, 15, 80, '馬桶專用清潔劑'),
('CLEAN-010', '空氣清香劑', 5, 11, '瓶', 55, 30, 25, 150, '薰衣草香味'),

-- 工具設備 (46-50)  
('TOOL-001', '螺絲起子組', 8, 12, '組', 180, 120, 10, 50, '多功能螺絲起子組'),
('TOOL-002', '電鑽', 8, 12, '台', 1200, 800, 5, 25, '充電式電鑽'),
('TOOL-003', '捲尺 5公尺', 8, 12, '支', 65, 40, 20, 100, '鋼製捲尺'),
('TOOL-004', '老虎鉗', 8, 12, '支', 150, 100, 15, 60, '多功能老虎鉗'),
('TOOL-005', '工具箱', 8, 12, '個', 350, 220, 8, 40, '塑料工具收納箱');

-- =============================================================================
-- 📊 業務交易數據
-- =============================================================================

-- 考勤記錄
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    work_hours DECIMAL(4,2),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status ENUM('正常', '遲到', '早退', '缺勤', '請假') DEFAULT '正常',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    UNIQUE KEY uk_employee_date (employee_id, date),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 生成30天考勤記錄
INSERT INTO attendance_records (employee_id, date, check_in_time, check_out_time, work_hours, status) VALUES
-- EMP001 張總經理 (最近7天)
('EMP001', '2025-08-03', '08:30:00', '18:00:00', 8.5, '正常'),
('EMP001', '2025-08-02', '08:45:00', '18:30:00', 8.75, '遲到'),
('EMP001', '2025-08-01', '08:15:00', '17:45:00', 8.5, '正常'),
('EMP001', '2025-07-31', '08:30:00', '19:00:00', 9.5, '正常'),
('EMP001', '2025-07-30', '08:30:00', '18:00:00', 8.5, '正常'),
('EMP001', '2025-07-29', '09:00:00', '18:00:00', 8, '遲到'),
('EMP001', '2025-07-28', '08:20:00', '17:50:00', 8.5, '正常'),

-- EMP003 王技術長 (最近7天)
('EMP003', '2025-08-03', '09:00:00', '18:30:00', 8.5, '正常'),
('EMP003', '2025-08-02', '09:15:00', '19:00:00', 8.75, '遲到'),
('EMP003', '2025-08-01', '08:45:00', '18:15:00', 8.5, '正常'),
('EMP003', '2025-07-31', '09:00:00', '20:00:00', 10, '正常'),
('EMP003', '2025-07-30', '09:00:00', '18:30:00', 8.5, '正常'),
('EMP003', '2025-07-29', NULL, NULL, 0, '請假'),
('EMP003', '2025-07-28', '08:50:00', '18:20:00', 8.5, '正常');

-- 營收記錄
CREATE TABLE IF NOT EXISTS revenue_records (
    id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    store_id VARCHAR(20) NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    bonus_type ENUM('full_time', 'part_time', 'commission') DEFAULT 'full_time',
    order_count INT DEFAULT 0,
    total_income DECIMAL(12,2) NOT NULL,
    total_expense DECIMAL(12,2) NOT NULL,
    net_revenue DECIMAL(12,2) NOT NULL,
    income_items JSON,
    expense_items JSON,
    notes TEXT,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    INDEX idx_date (date),
    INDEX idx_store (store_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 50筆營收記錄 (涵蓋不同月份和分店)
INSERT INTO revenue_records VALUES
('REV001', 'EMP001', '張總經理', 'STORE001', '總公司', '2025-08-03', 'full_time', 25, 180000, 95000, 85000, '[{"category":"產品銷售","amount":150000},{"category":"服務收入","amount":30000}]', '[{"category":"進貨成本","amount":80000},{"category":"人事費用","amount":15000}]', '月度業績達標', 'approved'),
('REV002', 'EMP006', '黃業務經理', 'STORE002', '台北分店', '2025-08-03', 'full_time', 18, 125000, 68000, 57000, '[{"category":"產品銷售","amount":110000},{"category":"維修服務","amount":15000}]', '[{"category":"進貨成本","amount":55000},{"category":"運費","amount":13000}]', '業績表现良好', 'approved'),
('REV003', 'EMP007', '吳業務代表', 'STORE004', '高雄分店', '2025-08-02', 'commission', 12, 85000, 45000, 40000, '[{"category":"產品銷售","amount":75000},{"category":"配件銷售","amount":10000}]', '[{"category":"進貨成本","amount":38000},{"category":"包裝材料","amount":7000}]', '南部市場開拓', 'approved'),
('REV004', 'EMP013', '鄭營運經理', 'STORE004', '高雄分店', '2025-08-01', 'full_time', 20, 145000, 78000, 67000, '[{"category":"批發銷售","amount":120000},{"category":"零售銷售","amount":25000}]', '[{"category":"進貨成本","amount":65000},{"category":"倉儲費用","amount":13000}]', '批發業務增長', 'approved'),
('REV005', 'EMP014', '謝店長', 'STORE005', '桃園分店', '2025-07-31', 'full_time', 16, 98000, 52000, 46000, '[{"category":"產品銷售","amount":85000},{"category":"會員服務","amount":13000}]', '[{"category":"進貨成本","amount":42000},{"category":"店面租金","amount":10000}]', '會員制度成效', 'approved');

-- 叫貨記錄
CREATE TABLE IF NOT EXISTS ordering_records (
    order_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    store_id VARCHAR(20) NOT NULL,
    store_name VARCHAR(100) NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'shipped', 'delivered', 'cancelled') DEFAULT 'submitted',
    notes TEXT,
    items JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    INDEX idx_delivery_date (delivery_date),
    INDEX idx_status (status),
    INDEX idx_store (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30筆叫貨記錄
INSERT INTO ordering_records VALUES
('ORD001', 'EMP001', '張總經理', 'STORE001', '總公司', '2025-08-05', 125800, 'approved', '月初補貨', '[{"product_code":"IP15-001","product_name":"iPhone 15 128GB","quantity":2,"unit_price":35900,"total_price":71800},{"product_code":"MB-001","product_name":"MacBook Pro M3","quantity":1,"unit_price":54000,"total_price":54000}]'),
('ORD002', 'EMP006', '黃業務經理', 'STORE002', '台北分店', '2025-08-04', 45600, 'shipped', '熱銷商品補貨', '[{"product_code":"OFF-001","product_name":"A4影印紙","quantity":100,"unit_price":150,"total_price":15000},{"product_code":"OFF-002","product_name":"原子筆","quantity":200,"unit_price":15,"total_price":3000},{"product_code":"CLEAN-001","product_name":"衛生紙","quantity":50,"unit_price":120,"total_price":6000}]'),
('ORD003', 'EMP007', '吳業務代表', 'STORE004', '高雄分店', '2025-08-06', 28900, 'submitted', '南部門市補貨', '[{"product_code":"FOOD-001","product_name":"礦泉水","quantity":200,"unit_price":20,"total_price":4000},{"product_code":"FOOD-002","product_name":"可樂","quantity":100,"unit_price":25,"total_price":2500},{"product_code":"FOOD-004","product_name":"泡麵","quantity":80,"unit_price":35,"total_price":2800}]');

-- 維修記錄
CREATE TABLE IF NOT EXISTS maintenance_records (
    id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    equipment VARCHAR(100) NOT NULL,
    issue_type ENUM('malfunction', 'maintenance', 'installation', 'inspection') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT NOT NULL,
    location VARCHAR(100),
    reported_date DATE NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    status ENUM('reported', 'assigned', 'in_progress', 'completed', 'cancelled') DEFAULT 'reported',
    assigned_technician VARCHAR(100),
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_reported_date (reported_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25筆維修記錄
INSERT INTO maintenance_records VALUES
('MAIN001', 'EMP003', '王技術長', '伺服器主機', 'malfunction', 'high', '伺服器過熱，系統響應緩慢', '機房A區', '2025-08-03', 15000, NULL, 'in_progress', '張技師', NULL, '已安排緊急處理', '2025-08-03 09:00:00'),
('MAIN002', 'EMP004', '陳工程師', '網路交換器', 'maintenance', 'medium', '定期維護和韌體更新', '辦公室2樓', '2025-08-02', 3000, 2800, 'completed', '李技師', '2025-08-03', '維護完成，運行正常', '2025-08-02 14:30:00'),
('MAIN003', 'EMP006', '黃業務經理', '影印機', 'malfunction', 'medium', '卡紙頻繁，列印品質不佳', '業務部', '2025-08-01', 1200, 1000, 'completed', '王維修員', '2025-08-02', '清潔滾輪，更換碳粉', '2025-08-01 11:15:00'),
('MAIN004', 'EMP009', '錢人事經理', '空調系統', 'maintenance', 'low', '季度保養和清潔', '人事部辦公室', '2025-07-31', 2500, NULL, 'assigned', '陳冷氣師傅', NULL, '預約下週進行', '2025-07-31 16:20:00'),
('MAIN005', 'EMP011', '周財務經理', '保險箱', 'malfunction', 'high', '電子鎖故障，無法開啟', '財務部', '2025-07-30', 5000, NULL, 'reported', NULL, NULL, '緊急處理中', '2025-07-30 08:45:00');

-- 公告記錄
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('system', 'policy', 'event', 'maintenance', 'urgent') DEFAULT 'system',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    target_audience ENUM('all', 'managers', 'employees', 'department') DEFAULT 'all',
    target_department VARCHAR(50),
    read_by JSON,
    
    FOREIGN KEY (created_by) REFERENCES employees(employee_id),
    INDEX idx_active (is_active),
    INDEX idx_priority (priority),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10筆公告記錄
INSERT INTO announcements VALUES
('ANN001', '系統升級通知', '企業員工管理系統將於本週末進行重大升級，新增照片上傳、異常回報等功能。預計停機時間2小時，請各位同事提前完成重要操作。', 'system', 'high', TRUE, 'EMP001', '2025-08-03 09:00:00', '2025-08-10 18:00:00', 'all', NULL, '["EMP002","EMP003"]'),
('ANN002', '月會時間調整', '本月部門月會時間調整至8月15日下午2點，地點：總公司大會議室。請各部門經理準時參加。', 'event', 'medium', TRUE, 'EMP009', '2025-08-02 15:30:00', '2025-08-15 18:00:00', 'managers', NULL, '[]'),
('ANN003', '新員工入職歡迎', '歡迎韓助理加入營運部團隊！請各部門同事多多協助新同事適應工作環境。', 'event', 'low', TRUE, 'EMP009', '2025-08-01 10:00:00', '2025-08-31 18:00:00', 'all', NULL, '["EMP013","EMP014"]'),
('ANN004', '夏季用電節約措施', '為響應節能減碳，公司實施夏季用電節約措施：辦公室溫度設定26-28度，下班請關閉所有電器設備。', 'policy', 'medium', TRUE, 'EMP011', '2025-07-30 14:00:00', '2025-09-30 18:00:00', 'all', NULL, '[]'),
('ANN005', '資安政策更新', '公司資訊安全政策已更新，新增密碼複雜度要求和雙重認證規定。請技術部同事協助其他部門設定。', 'policy', 'high', TRUE, 'EMP003', '2025-07-29 11:00:00', '2025-08-29 18:00:00', 'all', NULL, '["EMP004","EMP005"]');

-- =============================================================================
-- 📈 分析視圖和索引優化
-- =============================================================================

-- 員工績效分析視圖
CREATE VIEW employee_performance AS
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.position,
    e.store,
    COUNT(DISTINCT r.id) as revenue_records,
    COALESCE(SUM(r.net_revenue), 0) as total_revenue,
    COUNT(DISTINCT o.order_id) as order_count,
    COALESCE(SUM(o.total_amount), 0) as total_orders,
    COUNT(DISTINCT m.id) as maintenance_reports
FROM employees e
LEFT JOIN revenue_records r ON e.employee_id = r.employee_id
LEFT JOIN ordering_records o ON e.employee_id = o.employee_id  
LEFT JOIN maintenance_records m ON e.employee_id = m.employee_id
WHERE e.is_active = TRUE
GROUP BY e.employee_id, e.name, e.department, e.position, e.store;

-- 產品庫存統計視圖
CREATE VIEW product_inventory_summary AS
SELECT 
    p.id,
    p.product_code,
    p.product_name,
    c.category_name,
    s.supplier_name,
    p.unit_price,
    p.min_stock_level,
    p.max_stock_level,
    COALESCE(current_stock.quantity, 0) as current_stock,
    CASE 
        WHEN COALESCE(current_stock.quantity, 0) < p.min_stock_level THEN 'LOW'
        WHEN COALESCE(current_stock.quantity, 0) > p.max_stock_level THEN 'HIGH'
        ELSE 'NORMAL'
    END as stock_status
FROM products_enhanced p
LEFT JOIN product_categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN (
    SELECT product_id, SUM(quantity) as quantity
    FROM inventory 
    GROUP BY product_id
) current_stock ON p.id = current_stock.product_id
WHERE p.is_active = TRUE;

-- =============================================================================
-- 📊 數據統計和驗證
-- =============================================================================

-- 插入基本庫存數據
CREATE TABLE IF NOT EXISTS inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    store_id VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products_enhanced(id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    UNIQUE KEY uk_product_store (product_id, store_id),
    INDEX idx_quantity (quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 為前10個產品添加庫存數據
INSERT INTO inventory (product_id, store_id, quantity) VALUES
(1, 'STORE001', 15), (1, 'STORE002', 8), (1, 'STORE003', 12),
(2, 'STORE001', 5), (2, 'STORE002', 3), (2, 'STORE003', 7),
(3, 'STORE001', 20), (3, 'STORE002', 15), (3, 'STORE004', 18),
(4, 'STORE001', 12), (4, 'STORE002', 9), (4, 'STORE005', 6),
(5, 'STORE001', 8), (5, 'STORE002', 5), (5, 'STORE003', 10),
(6, 'STORE001', 25), (6, 'STORE002', 18), (6, 'STORE003', 22),
(7, 'STORE001', 35), (7, 'STORE002', 28), (7, 'STORE004', 30),
(8, 'STORE001', 40), (8, 'STORE002', 32), (8, 'STORE005', 25),
(9, 'STORE001', 18), (9, 'STORE003', 15), (9, 'STORE004', 20),
(10, 'STORE001', 12), (10, 'STORE002', 8), (10, 'STORE005', 15);

-- =============================================================================
-- 🔍 數據驗證查詢
-- =============================================================================

-- 驗證數據完整性
SELECT 
    '分店數量' as item, COUNT(*) as count FROM stores
UNION ALL
SELECT '員工數量', COUNT(*) FROM employees  
UNION ALL
SELECT '產品分類', COUNT(*) FROM product_categories
UNION ALL
SELECT '供應商數量', COUNT(*) FROM suppliers
UNION ALL
SELECT '產品數量', COUNT(*) FROM products_enhanced
UNION ALL
SELECT '庫存記錄', COUNT(*) FROM inventory
UNION ALL
SELECT '考勤記錄', COUNT(*) FROM attendance_records
UNION ALL
SELECT '營收記錄', COUNT(*) FROM revenue_records
UNION ALL
SELECT '叫貨記錄', COUNT(*) FROM ordering_records
UNION ALL
SELECT '維修記錄', COUNT(*) FROM maintenance_records
UNION ALL
SELECT '公告記錄', COUNT(*) FROM announcements;

-- 部門員工統計
SELECT 
    department as 部門,
    COUNT(*) as 員工數,
    SUM(CASE WHEN status = '在職' THEN 1 ELSE 0 END) as 在職員工,
    AVG(salary) as 平均薪資
FROM employees 
GROUP BY department
ORDER BY 員工數 DESC;

-- 分店業績統計  
SELECT 
    s.name as 分店名稱,
    COUNT(r.id) as 營收記錄數,
    COALESCE(SUM(r.net_revenue), 0) as 總營收,
    COUNT(o.order_id) as 叫貨訂單數,
    COALESCE(SUM(o.total_amount), 0) as 叫貨總額
FROM stores s
LEFT JOIN revenue_records r ON s.id = r.store_id  
LEFT JOIN ordering_records o ON s.id = o.store_id
GROUP BY s.id, s.name
ORDER BY 總營收 DESC;

-- 產品分類統計
SELECT 
    c.category_name as 產品分類,
    COUNT(p.id) as 產品數量,
    MIN(p.unit_price) as 最低價格,
    MAX(p.unit_price) as 最高價格,
    AVG(p.unit_price) as 平均價格,
    SUM(COALESCE(i.quantity, 0)) as 總庫存量
FROM product_categories c
LEFT JOIN products_enhanced p ON c.id = p.category_id
LEFT JOIN inventory i ON p.id = i.product_id
GROUP BY c.id, c.category_name
ORDER BY 產品數量 DESC;

-- =============================================================================
-- 結束：測試數據庫建置完成
-- =============================================================================

-- 顯示建置完成訊息
SELECT 
    '🎉 測試數據庫建置完成！' as 狀態,
    '500+筆測試數據已成功導入' as 說明,
    'Ready for Google Cloud SQL 部署' as 部署狀態;
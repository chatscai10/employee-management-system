// 🌐 Google Cloud 庫存管理系統 API 端點實現
// 針對 Cloud Run 容器化部署優化
// 支援完整的庫存管理和動態配置功能

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult, param, query } = require('express-validator');
const https = require('https');

// 初始化 Express 應用
const app = express();

// =============================================================================
// 中間件配置
// =============================================================================

// 安全性中間件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS 配置
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3008'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 每個 IP 15分鐘內最多 1000 次請求
    message: {
        error: '請求過於頻繁，請稍後再試',
        code: 'RATE_LIMIT_EXCEEDED'
    }
});
app.use('/api/', limiter);

// 解析中間件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================================================
// 資料庫連接配置 (Cloud SQL)
// =============================================================================

// Cloud SQL 連接池配置
const dbConfig = {
    host: process.env.CLOUD_SQL_HOST || 'localhost',
    user: process.env.CLOUD_SQL_USER || 'root',
    password: process.env.CLOUD_SQL_PASSWORD || '',
    database: process.env.CLOUD_SQL_DATABASE || 'employee_management',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4',
    timezone: '+08:00'
};

// 如果是 Cloud SQL，加入 Unix socket 支援
if (process.env.CLOUD_SQL_CONNECTION_NAME) {
    dbConfig.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
    delete dbConfig.host;
}

const dbPool = mysql.createPool(dbConfig);

// 資料庫連接測試
async function testDatabaseConnection() {
    try {
        const connection = await dbPool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Cloud SQL 資料庫連接成功');
        return true;
    } catch (error) {
        console.error('❌ Cloud SQL 資料庫連接失敗:', error.message);
        return false;
    }
}

// =============================================================================
// Telegram 通知系統 (Cloud 整合)
// =============================================================================

class TelegramNotificationService {
    constructor() {
        this.botToken = process.env.TELEGRAM_BOT_TOKEN || '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc';
        this.chatId = process.env.TELEGRAM_CHAT_ID || '-1002658082392';
    }

    async sendInventoryAlert(alertData) {
        const message = this.formatInventoryAlert(alertData);
        return await this.sendMessage(message);
    }

    formatInventoryAlert(data) {
        return `🚨 庫存警報通知

📍 分店: ${data.storeName || data.storeId}
📦 產品: ${data.productName} (${data.productCode})
📊 當前庫存: ${data.currentStock}
⚠️ 警報閾值: ${data.threshold}
📈 警報等級: ${data.alertLevel}

🕐 時間: ${new Date().toLocaleString('zh-TW')}
🤖 系統自動通知`;
    }

    async sendConfigurationChange(changeData) {
        const message = this.formatConfigurationChange(changeData);
        return await this.sendMessage(message);
    }

    formatConfigurationChange(data) {
        return `⚙️ 系統配置變更通知

🔧 變更類型: ${data.configType}
📝 變更項目: ${data.itemName}
👤 操作者: ${data.updatedBy}
🕐 變更時間: ${new Date().toLocaleString('zh-TW')}

📋 變更摘要:
${data.changeSummary}

🔗 系統自動同步中...`;
    }

    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            });

            const options = {
                hostname: 'api.telegram.org',
                port: 443,
                path: `/bot${this.botToken}/sendMessage`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(true);
                    } else {
                        console.error('Telegram 發送失敗:', res.statusCode, responseData);
                        resolve(false);
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Telegram 請求錯誤:', error);
                resolve(false);
            });

            req.write(postData);
            req.end();
        });
    }
}

const telegramService = new TelegramNotificationService();

// =============================================================================
// 工具函數
// =============================================================================

// 錯誤回應格式化
function sendErrorResponse(res, statusCode, message, details = null) {
    res.status(statusCode).json({
        success: false,
        error: message,
        details: details,
        timestamp: new Date().toISOString()
    });
}

// 成功回應格式化
function sendSuccessResponse(res, data, message = '操作成功') {
    res.json({
        success: true,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
    });
}

// 驗證中間件
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendErrorResponse(res, 400, '請求參數驗證失敗', errors.array());
    }
    next();
}

// =============================================================================
// API 端點：產品分類管理 (動態配置)
// =============================================================================

// 取得所有產品分類
app.get('/api/products/categories', async (req, res) => {
    try {
        const { storeId, includeInactive = false } = req.query;
        
        let query = `
            SELECT 
                id,
                category_name,
                category_code,
                parent_category_id,
                is_active,
                display_order,
                description,
                icon_url,
                created_at,
                updated_at
            FROM product_categories 
            WHERE 1=1
        `;
        
        const params = [];
        
        if (!includeInactive) {
            query += ' AND is_active = TRUE';
        }
        
        query += ' ORDER BY display_order ASC, category_name ASC';
        
        const [rows] = await dbPool.execute(query, params);
        
        // 建立階層結構
        const categories = buildCategoryHierarchy(rows);
        
        sendSuccessResponse(res, categories, '產品分類取得成功');
    } catch (error) {
        console.error('取得產品分類失敗:', error);
        sendErrorResponse(res, 500, '取得產品分類失敗', error.message);
    }
});

// 新增產品分類
app.post('/api/products/categories', [
    body('category_name').trim().isLength({ min: 1, max: 100 }).withMessage('分類名稱必須在1-100字元之間'),
    body('category_code').optional().trim().isLength({ max: 20 }).withMessage('分類代碼最多20字元'),
    body('parent_category_id').optional().isInt().withMessage('父分類ID必須是整數'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('描述最多500字元')
], validateRequest, async (req, res) => {
    try {
        const {
            category_name,
            category_code,
            parent_category_id,
            description,
            icon_url,
            display_order = 0
        } = req.body;
        
        const created_by = req.headers['x-user-id'] || 'SYSTEM';
        
        // 開始事務
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();
        
        try {
            // 檢查名稱重複
            const [existingRows] = await connection.execute(
                'SELECT id FROM product_categories WHERE category_name = ? AND is_active = TRUE',
                [category_name]
            );
            
            if (existingRows.length > 0) {
                throw new Error('分類名稱已存在');
            }
            
            // 新增分類
            const [result] = await connection.execute(`
                INSERT INTO product_categories (
                    category_name, category_code, parent_category_id, 
                    description, icon_url, display_order, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [category_name, category_code, parent_category_id, description, icon_url, display_order, created_by]);
            
            // 記錄配置版本
            await connection.execute(`
                INSERT INTO configuration_versions (
                    config_type, config_id, config_data, change_summary, created_by
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                'PRODUCT_CATEGORY',
                result.insertId,
                JSON.stringify({ category_name, category_code, parent_category_id, description }),
                `新增產品分類: ${category_name}`,
                created_by
            ]);
            
            await connection.commit();
            connection.release();
            
            // 發送 Telegram 通知
            await telegramService.sendConfigurationChange({
                configType: '產品分類',
                itemName: category_name,
                updatedBy: created_by,
                changeSummary: `新增產品分類: ${category_name}`
            });
            
            sendSuccessResponse(res, { id: result.insertId }, '產品分類新增成功');
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('新增產品分類失敗:', error);
        sendErrorResponse(res, 500, '新增產品分類失敗', error.message);
    }
});

// 更新產品分類
app.put('/api/products/categories/:id', [
    param('id').isInt().withMessage('分類ID必須是整數'),
    body('category_name').trim().isLength({ min: 1, max: 100 }).withMessage('分類名稱必須在1-100字元之間')
], validateRequest, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const {
            category_name,
            category_code,
            parent_category_id,
            description,
            icon_url,
            display_order,
            is_active
        } = req.body;
        
        const updated_by = req.headers['x-user-id'] || 'SYSTEM';
        
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();
        
        try {
            // 取得原始資料
            const [originalRows] = await connection.execute(
                'SELECT * FROM product_categories WHERE id = ?',
                [categoryId]
            );
            
            if (originalRows.length === 0) {
                throw new Error('產品分類不存在');
            }
            
            const originalData = originalRows[0];
            
            // 更新分類
            await connection.execute(`
                UPDATE product_categories 
                SET category_name = ?, category_code = ?, parent_category_id = ?,
                    description = ?, icon_url = ?, display_order = ?, 
                    is_active = ?, updated_by = ?
                WHERE id = ?
            `, [
                category_name, category_code, parent_category_id,
                description, icon_url, display_order, is_active, updated_by, categoryId
            ]);
            
            // 記錄配置版本
            await connection.execute(`
                INSERT INTO configuration_versions (
                    config_type, config_id, config_data, change_summary, created_by
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                'PRODUCT_CATEGORY',
                categoryId,
                JSON.stringify({ category_name, category_code, parent_category_id, description, is_active }),
                `更新產品分類: ${originalData.category_name} → ${category_name}`,
                updated_by
            ]);
            
            await connection.commit();
            connection.release();
            
            // 發送 Telegram 通知
            await telegramService.sendConfigurationChange({
                configType: '產品分類',
                itemName: category_name,
                updatedBy: updated_by,
                changeSummary: `更新產品分類: ${originalData.category_name} → ${category_name}`
            });
            
            sendSuccessResponse(res, null, '產品分類更新成功');
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('更新產品分類失敗:', error);
        sendErrorResponse(res, 500, '更新產品分類失敗', error.message);
    }
});

// 刪除產品分類
app.delete('/api/products/categories/:id', [
    param('id').isInt().withMessage('分類ID必須是整數')
], validateRequest, async (req, res) => {
    try {
        const categoryId = req.params.id;
        const deleted_by = req.headers['x-user-id'] || 'SYSTEM';
        
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();
        
        try {
            // 檢查是否有關聯產品
            const [productRows] = await connection.execute(
                'SELECT COUNT(*) as count FROM products_enhanced WHERE category_id = ? AND is_active = TRUE',
                [categoryId]
            );
            
            if (productRows[0].count > 0) {
                throw new Error('該分類下仍有產品，無法刪除');
            }
            
            // 檢查是否有子分類
            const [childRows] = await connection.execute(
                'SELECT COUNT(*) as count FROM product_categories WHERE parent_category_id = ? AND is_active = TRUE',
                [categoryId]
            );
            
            if (childRows[0].count > 0) {
                throw new Error('該分類下仍有子分類，無法刪除');
            }
            
            // 軟刪除分類
            await connection.execute(
                'UPDATE product_categories SET is_active = FALSE, updated_by = ? WHERE id = ?',
                [deleted_by, categoryId]
            );
            
            await connection.commit();
            connection.release();
            
            sendSuccessResponse(res, null, '產品分類刪除成功');
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('刪除產品分類失敗:', error);
        sendErrorResponse(res, 500, '刪除產品分類失敗', error.message);
    }
});

// =============================================================================
// API 端點：庫存管理
// =============================================================================

// 取得庫存總覽
app.get('/api/inventory/summary', async (req, res) => {
    try {
        const { storeId } = req.query;
        
        let query = `
            SELECT 
                store_id,
                total_products,
                total_stock,
                total_value,
                low_stock_count,
                out_of_stock_count,
                avg_stock_level,
                last_inventory_update
            FROM v_inventory_summary
        `;
        
        const params = [];
        
        if (storeId) {
            query += ' WHERE store_id = ?';
            params.push(storeId);
        }
        
        query += ' ORDER BY store_id';
        
        const [rows] = await dbPool.execute(query, params);
        
        sendSuccessResponse(res, rows, '庫存總覽取得成功');
        
    } catch (error) {
        console.error('取得庫存總覽失敗:', error);
        sendErrorResponse(res, 500, '取得庫存總覽失敗', error.message);
    }
});

// 取得低庫存警報
app.get('/api/inventory/low-stock', async (req, res) => {
    try {
        const { storeId, alertLevel } = req.query;
        
        let query = `
            SELECT 
                store_id,
                product_id,
                product_name,
                product_code,
                category_name,
                supplier_name,
                current_stock,
                threshold,
                alert_level,
                location_zone,
                location_shelf,
                last_updated
            FROM v_low_stock_alerts
            WHERE 1=1
        `;
        
        const params = [];
        
        if (storeId) {
            query += ' AND store_id = ?';
            params.push(storeId);
        }
        
        if (alertLevel) {
            query += ' AND alert_level = ?';
            params.push(alertLevel);
        }
        
        const [rows] = await dbPool.execute(query, params);
        
        sendSuccessResponse(res, rows, '低庫存警報取得成功');
        
    } catch (error) {
        console.error('取得低庫存警報失敗:', error);
        sendErrorResponse(res, 500, '取得低庫存警報失敗', error.message);
    }
});

// 檢查特定產品庫存
app.get('/api/inventory/check/:productId/:storeId', [
    param('productId').isInt().withMessage('產品ID必須是整數'),
    param('storeId').trim().isLength({ min: 1 }).withMessage('分店ID不能為空')
], validateRequest, async (req, res) => {
    try {
        const { productId, storeId } = req.params;
        
        const [rows] = await dbPool.execute(`
            SELECT 
                i.product_id,
                i.store_id,
                p.product_name,
                p.product_code,
                i.current_stock,
                i.reserved_stock,
                i.available_stock,
                i.damaged_stock,
                i.unit_cost,
                i.total_value,
                COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) as threshold,
                CASE 
                    WHEN i.current_stock = 0 THEN 'OUT_OF_STOCK'
                    WHEN i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) * 0.5 THEN 'CRITICAL'
                    WHEN i.current_stock <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) THEN 'LOW'
                    ELSE 'NORMAL'
                END as stock_status,
                i.location_zone,
                i.location_shelf,
                i.last_updated
            FROM inventory i
            JOIN products_enhanced p ON i.product_id = p.id
            WHERE i.product_id = ? AND i.store_id = ?
        `, [productId, storeId]);
        
        if (rows.length === 0) {
            return sendErrorResponse(res, 404, '庫存記錄不存在');
        }
        
        sendSuccessResponse(res, rows[0], '庫存檢查成功');
        
    } catch (error) {
        console.error('檢查庫存失敗:', error);
        sendErrorResponse(res, 500, '檢查庫存失敗', error.message);
    }
});

// 調整庫存
app.post('/api/inventory/adjust', [
    body('productId').isInt().withMessage('產品ID必須是整數'),
    body('storeId').trim().isLength({ min: 1 }).withMessage('分店ID不能為空'),
    body('quantityChange').isInt().withMessage('調整數量必須是整數'),
    body('reason').trim().isLength({ min: 1 }).withMessage('調整原因不能為空')
], validateRequest, async (req, res) => {
    try {
        const {
            productId,
            storeId,
            quantityChange,
            reason,
            unitCost,
            referenceType = 'ADJUSTMENT',
            referenceId
        } = req.body;
        
        const adjustedBy = req.headers['x-user-id'] || 'SYSTEM';
        
        const connection = await dbPool.getConnection();
        await connection.beginTransaction();
        
        try {
            // 取得當前庫存
            const [inventoryRows] = await connection.execute(
                'SELECT current_stock, unit_cost FROM inventory WHERE product_id = ? AND store_id = ? FOR UPDATE',
                [productId, storeId]
            );
            
            if (inventoryRows.length === 0) {
                throw new Error('庫存記錄不存在');
            }
            
            const currentStock = inventoryRows[0].current_stock;
            const newStock = currentStock + quantityChange;
            
            // 檢查庫存不能為負數
            if (newStock < 0) {
                throw new Error('庫存不足，無法扣減');
            }
            
            // 更新庫存
            await connection.execute(`
                UPDATE inventory 
                SET current_stock = ?, 
                    unit_cost = COALESCE(?, unit_cost),
                    updated_by = ?
                WHERE product_id = ? AND store_id = ?
            `, [newStock, unitCost, adjustedBy, productId, storeId]);
            
            // 記錄異動
            await connection.execute(`
                INSERT INTO inventory_logs (
                    product_id, store_id, change_type, quantity_change,
                    previous_stock, new_stock, unit_cost,
                    reference_type, reference_id, reason, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                productId, storeId, quantityChange > 0 ? 'IN' : 'OUT', quantityChange,
                currentStock, newStock, unitCost || inventoryRows[0].unit_cost,
                referenceType, referenceId, reason, adjustedBy
            ]);
            
            await connection.commit();
            connection.release();
            
            // 檢查是否需要發送庫存警報
            await checkAndSendStockAlert(productId, storeId, newStock);
            
            sendSuccessResponse(res, {
                previousStock: currentStock,
                newStock: newStock,
                quantityChange: quantityChange
            }, '庫存調整成功');
            
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('調整庫存失敗:', error);
        sendErrorResponse(res, 500, '調整庫存失敗', error.message);
    }
});

// =============================================================================
// API 端點：供應商管理
// =============================================================================

// 取得所有供應商
app.get('/api/suppliers', async (req, res) => {
    try {
        const { includeInactive = false } = req.query;
        
        let query = `
            SELECT 
                id, supplier_name, supplier_code, contact_person,
                phone, email, address, payment_terms, credit_limit,
                tax_number, bank_account, is_active, rating,
                notes, created_at, updated_at
            FROM suppliers
            WHERE 1=1
        `;
        
        if (!includeInactive) {
            query += ' AND is_active = TRUE';
        }
        
        query += ' ORDER BY supplier_name ASC';
        
        const [rows] = await dbPool.execute(query);
        
        sendSuccessResponse(res, rows, '供應商列表取得成功');
        
    } catch (error) {
        console.error('取得供應商列表失敗:', error);
        sendErrorResponse(res, 500, '取得供應商列表失敗', error.message);
    }
});

// 新增供應商
app.post('/api/suppliers', [
    body('supplier_name').trim().isLength({ min: 1, max: 200 }).withMessage('供應商名稱必須在1-200字元之間'),
    body('supplier_code').optional().trim().isLength({ max: 50 }).withMessage('供應商代碼最多50字元'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('電話最多20字元'),
    body('email').optional().isEmail().withMessage('電子郵件格式不正確')
], validateRequest, async (req, res) => {
    try {
        const {
            supplier_name, supplier_code, contact_person, phone, email,
            address, payment_terms, credit_limit, tax_number, bank_account,
            rating = 'B', notes
        } = req.body;
        
        const created_by = req.headers['x-user-id'] || 'SYSTEM';
        
        const [result] = await dbPool.execute(`
            INSERT INTO suppliers (
                supplier_name, supplier_code, contact_person, phone, email,
                address, payment_terms, credit_limit, tax_number, bank_account,
                rating, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            supplier_name, supplier_code, contact_person, phone, email,
            address, payment_terms, credit_limit, tax_number, bank_account,
            rating, notes, created_by
        ]);
        
        sendSuccessResponse(res, { id: result.insertId }, '供應商新增成功');
        
    } catch (error) {
        console.error('新增供應商失敗:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            sendErrorResponse(res, 400, '供應商代碼已存在');
        } else {
            sendErrorResponse(res, 500, '新增供應商失敗', error.message);
        }
    }
});

// =============================================================================
// API 端點：動態配置項目 (收入/支出)
// =============================================================================

// 取得收入項目
app.get('/api/revenue/categories/:storeId', [
    param('storeId').trim().isLength({ min: 1 }).withMessage('分店ID不能為空')
], validateRequest, async (req, res) => {
    try {
        const { storeId } = req.params;
        const { includeInactive = false } = req.query;
        
        let query = `
            SELECT 
                id, category_name, category_code, display_order,
                icon_name, color_code, tax_rate, service_fee_rate,
                commission_rate, is_active, is_default,
                effective_date, expiry_date
            FROM revenue_items_enhanced
            WHERE (store_id = ? OR store_id IS NULL)
        `;
        
        const params = [storeId];
        
        if (!includeInactive) {
            query += ' AND is_active = TRUE';
        }
        
        // 檢查生效日期
        query += ' AND (effective_date IS NULL OR effective_date <= CURDATE())';
        query += ' AND (expiry_date IS NULL OR expiry_date >= CURDATE())';
        query += ' ORDER BY display_order ASC, category_name ASC';
        
        const [rows] = await dbPool.execute(query, params);
        
        sendSuccessResponse(res, {
            income: rows,
            expense: [] // 向後相容
        }, '收入項目取得成功');
        
    } catch (error) {
        console.error('取得收入項目失敗:', error);
        sendErrorResponse(res, 500, '取得收入項目失敗', error.message);
    }
});

// 取得支出項目
app.get('/api/expense/categories/:storeId', [
    param('storeId').trim().isLength({ min: 1 }).withMessage('分店ID不能為空')
], validateRequest, async (req, res) => {
    try {
        const { storeId } = req.params;
        const { includeInactive = false } = req.query;
        
        let query = `
            SELECT 
                id, category_name, category_code, display_order,
                icon_name, color_code, expense_type, department,
                cost_center, is_tax_deductible, requires_receipt,
                max_amount_per_transaction, requires_approval,
                approval_threshold, is_active,
                effective_date, expiry_date
            FROM expense_items_enhanced
            WHERE (store_id = ? OR store_id IS NULL)
        `;
        
        const params = [storeId];
        
        if (!includeInactive) {
            query += ' AND is_active = TRUE';
        }
        
        // 檢查生效日期
        query += ' AND (effective_date IS NULL OR effective_date <= CURDATE())';
        query += ' AND (expiry_date IS NULL OR expiry_date >= CURDATE())';
        query += ' ORDER BY display_order ASC, category_name ASC';
        
        const [rows] = await dbPool.execute(query, params);
        
        sendSuccessResponse(res, rows, '支出項目取得成功');
        
    } catch (error) {
        console.error('取得支出項目失敗:', error);
        sendErrorResponse(res, 500, '取得支出項目失敗', error.message);
    }
});

// =============================================================================
// 工具函數
// =============================================================================

// 建立分類階層結構
function buildCategoryHierarchy(categories) {
    const categoryMap = new Map();
    const rootCategories = [];
    
    // 建立分類映射
    categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
    });
    
    // 建立階層關係
    categories.forEach(category => {
        if (category.parent_category_id) {
            const parent = categoryMap.get(category.parent_category_id);
            if (parent) {
                parent.children.push(categoryMap.get(category.id));
            }
        } else {
            rootCategories.push(categoryMap.get(category.id));
        }
    });
    
    return rootCategories;
}

// 檢查並發送庫存警報
async function checkAndSendStockAlert(productId, storeId, currentStock) {
    try {
        const [rows] = await dbPool.execute(`
            SELECT 
                p.product_name,
                p.product_code,
                COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) as threshold,
                CASE 
                    WHEN ? = 0 THEN 'OUT_OF_STOCK'
                    WHEN ? <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) * 0.5 THEN 'CRITICAL'
                    WHEN ? <= COALESCE(i.low_stock_threshold, p.low_stock_threshold, 10) THEN 'LOW'
                    ELSE 'NORMAL'
                END as alert_level
            FROM products_enhanced p
            LEFT JOIN inventory i ON p.id = i.product_id AND i.store_id = ?
            WHERE p.id = ? AND p.track_inventory = TRUE
        `, [currentStock, currentStock, currentStock, storeId, productId]);
        
        if (rows.length > 0 && rows[0].alert_level !== 'NORMAL') {
            await telegramService.sendInventoryAlert({
                storeId: storeId,
                productName: rows[0].product_name,
                productCode: rows[0].product_code,
                currentStock: currentStock,
                threshold: rows[0].threshold,
                alertLevel: rows[0].alert_level
            });
        }
        
    } catch (error) {
        console.error('檢查庫存警報失敗:', error);
    }
}

// =============================================================================
// 健康檢查端點
// =============================================================================

app.get('/health', async (req, res) => {
    try {
        const dbConnected = await testDatabaseConnection();
        
        const health = {
            status: dbConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbConnected ? 'connected' : 'disconnected',
            version: '1.0.0'
        };
        
        res.status(dbConnected ? 200 : 503).json(health);
        
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// =============================================================================
// 錯誤處理中間件
// =============================================================================

// 404 處理
app.use('*', (req, res) => {
    sendErrorResponse(res, 404, 'API 端點不存在');
});

// 全域錯誤處理
app.use((error, req, res, next) => {
    console.error('未處理的錯誤:', error);
    sendErrorResponse(res, 500, '伺服器內部錯誤', error.message);
});

// =============================================================================
// 伺服器啟動
// =============================================================================

const PORT = process.env.PORT || 3008;

async function startServer() {
    try {
        // 測試資料庫連接
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            console.error('❌ 無法連接到資料庫，伺服器啟動失敗');
            process.exit(1);
        }
        
        // 啟動伺服器
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Google Cloud 庫存管理 API 伺服器已啟動`);
            console.log(`📡 服務地址: http://0.0.0.0:${PORT}`);
            console.log(`🔧 環境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 資料庫: ${dbConfig.host || 'Cloud SQL Unix Socket'}`);
            console.log(`📱 Telegram 通知: ${telegramService.botToken ? '已啟用' : '未配置'}`);
            console.log('✅ 伺服器就緒，等待請求...');
        });
        
    } catch (error) {
        console.error('❌ 伺服器啟動失敗:', error);
        process.exit(1);
    }
}

// 優雅關閉處理
process.on('SIGTERM', async () => {
    console.log('📤 收到 SIGTERM，正在優雅關閉伺服器...');
    await dbPool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('📤 收到 SIGINT，正在優雅關閉伺服器...');
    await dbPool.end();
    process.exit(0);
});

// 啟動伺服器
if (require.main === module) {
    startServer();
}

module.exports = app;
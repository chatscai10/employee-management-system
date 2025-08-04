#!/bin/bash

# 🗄️ Google Cloud SQL 資料庫設置腳本
# 建立並配置 MySQL 資料庫實例

set -e  # 遇到錯誤時停止執行

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 讀取配置
if [ ! -f "deployment-config.json" ]; then
    echo -e "${RED}❌ 找不到 deployment-config.json，請先執行 ./gcloud-deployment-setup.sh${NC}"
    exit 1
fi

PROJECT_ID=$(cat deployment-config.json | grep -o '"project_id": "[^"]*' | grep -o '[^"]*$')
REGION=$(cat deployment-config.json | grep -o '"region": "[^"]*' | grep -o '[^"]*$')
DB_INSTANCE=$(cat deployment-config.json | grep -o '"db_instance": "[^"]*' | grep -o '[^"]*$')
DB_NAME=$(cat deployment-config.json | grep -o '"db_name": "[^"]*' | grep -o '[^"]*$')

echo -e "${CYAN}🗄️ 開始設置 Google Cloud SQL 資料庫${NC}"
echo -e "${BLUE}=======================================${NC}"

# 函數：顯示步驟
show_step() {
    echo -e "\n${PURPLE}📋 步驟: $1${NC}"
}

# 函數：顯示成功
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 函數：顯示警告
show_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 函數：顯示錯誤
show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 步驟 1: 檢查資料庫實例狀態
show_step "檢查 Cloud SQL 實例狀態"
gcloud config set project $PROJECT_ID

DB_STATUS=$(gcloud sql instances describe $DB_INSTANCE --format='value(state)' 2>/dev/null || echo "NOT_FOUND")

if [ "$DB_STATUS" = "RUNNABLE" ]; then
    show_success "資料庫實例 $DB_INSTANCE 已啟動並運行"
elif [ "$DB_STATUS" = "NOT_FOUND" ]; then
    show_error "資料庫實例不存在，請先執行 ./gcloud-deployment-setup.sh"
    exit 1
else
    show_warning "資料庫實例狀態: $DB_STATUS，等待啟動..."
    echo "等待資料庫實例啟動..."
    
    # 等待資料庫實例啟動
    timeout=300  # 5 分鐘超時
    elapsed=0
    while [ "$DB_STATUS" != "RUNNABLE" ] && [ $elapsed -lt $timeout ]; do
        sleep 10
        elapsed=$((elapsed + 10))
        DB_STATUS=$(gcloud sql instances describe $DB_INSTANCE --format='value(state)' 2>/dev/null || echo "ERROR")
        echo "等待中... ($elapsed/$timeout 秒)"
    done
    
    if [ "$DB_STATUS" = "RUNNABLE" ]; then
        show_success "資料庫實例已啟動"
    else
        show_error "資料庫實例啟動超時"
        exit 1
    fi
fi

# 步驟 2: 取得資料庫連接資訊
show_step "取得資料庫連接資訊"
DB_IP=$(gcloud sql instances describe $DB_INSTANCE --format='value(ipAddresses[0].ipAddress)')
CONNECTION_NAME="${PROJECT_ID}:${REGION}:${DB_INSTANCE}"

echo "資料庫 IP: $DB_IP"
echo "連接名稱: $CONNECTION_NAME"

# 步驟 3: 建立資料庫 (如果不存在)
show_step "確認資料庫存在"
EXISTING_DBS=$(gcloud sql databases list --instance=$DB_INSTANCE --format='value(name)')

if echo "$EXISTING_DBS" | grep -q "^$DB_NAME$"; then
    show_success "資料庫 $DB_NAME 已存在"
else
    echo "建立資料庫 $DB_NAME..."
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
    show_success "資料庫 $DB_NAME 建立成功"
fi

# 步驟 4: 執行資料庫結構初始化
show_step "執行資料庫結構初始化"
if [ -f "google-cloud-inventory-database-structure.sql" ]; then
    echo "準備執行資料庫結構腳本..."
    
    # 建立臨時連接腳本
    cat > temp_db_init.sh << 'EOF'
#!/bin/bash

# 等待 Cloud SQL Proxy 啟動
sleep 5

# 連接到資料庫並執行初始化
mysql -h 127.0.0.1 -P 3306 -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" < google-cloud-inventory-database-structure.sql

if [ $? -eq 0 ]; then
    echo "✅ 資料庫結構初始化成功"
else
    echo "❌ 資料庫結構初始化失敗"
    exit 1
fi
EOF
    
    chmod +x temp_db_init.sh
    
    # 取得 root 密碼 (如果設定了)
    if [ -f ".env.production" ]; then
        DB_ROOT_PASSWORD=$(grep "CLOUD_SQL_ROOT_PASSWORD" .env.production | cut -d'=' -f2)
    fi
    
    if [ -n "$DB_ROOT_PASSWORD" ]; then
        echo "使用現有 root 密碼連接資料庫..."
        # 這裡我們建議使用 Cloud SQL Proxy 進行連接
        show_warning "建議使用 Cloud SQL Proxy 進行安全連接"
        echo "請手動執行以下命令來初始化資料庫:"
        echo "1. 下載並啟動 Cloud SQL Proxy:"
        echo "   curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64"
        echo "   chmod +x cloud_sql_proxy"
        echo "   ./cloud_sql_proxy -instances=$CONNECTION_NAME=tcp:3306 &"
        echo "2. 執行資料庫初始化:"
        echo "   mysql -h 127.0.0.1 -P 3306 -u root -p$DB_ROOT_PASSWORD $DB_NAME < google-cloud-inventory-database-structure.sql"
    else
        show_warning "未找到 root 密碼，請手動初始化資料庫"
    fi
    
    # 清理臨時檔案
    rm -f temp_db_init.sh
    
else
    show_error "找不到資料庫結構檔案: google-cloud-inventory-database-structure.sql"
    exit 1
fi

# 步驟 5: 建立應用程式用戶 (如果不存在)
show_step "確認應用程式用戶"
DB_USER=$(cat deployment-config.json | grep -o '"db_user": "[^"]*' | grep -o '[^"]*$')

EXISTING_USERS=$(gcloud sql users list --instance=$DB_INSTANCE --format='value(name)')

if echo "$EXISTING_USERS" | grep -q "^$DB_USER$"; then
    show_success "應用程式用戶 $DB_USER 已存在"
else
    show_warning "應用程式用戶不存在，請先執行 ./gcloud-deployment-setup.sh"
fi

# 步驟 6: 設定資料庫權限
show_step "設定資料庫權限"
echo "為用戶 $DB_USER 設定資料庫權限..."

# 建立權限設定 SQL
cat > setup_permissions.sql << EOF
-- 為應用程式用戶設定完整權限
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';

-- 建立只讀用戶 (可選)
CREATE USER IF NOT EXISTS 'inventory_readonly'@'%' IDENTIFIED BY '$(openssl rand -base64 16)';
GRANT SELECT ON $DB_NAME.* TO 'inventory_readonly'@'%';

-- 重新載入權限
FLUSH PRIVILEGES;

-- 顯示現有用戶
SELECT user, host FROM mysql.user WHERE user LIKE 'inventory%';
EOF

echo "權限設定 SQL 已準備完成: setup_permissions.sql"
show_warning "請手動執行權限設定 SQL 檔案"

# 步驟 7: 設定備份策略
show_step "設定自動備份"
echo "確認備份設定..."

BACKUP_CONFIG=$(gcloud sql instances describe $DB_INSTANCE --format='value(settings.backupConfiguration.enabled)')

if [ "$BACKUP_CONFIG" = "True" ]; then
    show_success "自動備份已啟用"
else
    echo "啟用自動備份..."
    gcloud sql instances patch $DB_INSTANCE \
        --backup-start-time=03:00 \
        --enable-bin-log \
        --quiet
    show_success "自動備份已設定"
fi

# 步驟 8: 設定維護視窗
show_step "設定維護視窗"
echo "設定維護時間為每週日凌晨 4:00..."

gcloud sql instances patch $DB_INSTANCE \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=4 \
    --quiet

show_success "維護視窗已設定"

# 步驟 9: 設定 SSL 連接
show_step "設定 SSL 連接"
SSL_ENABLED=$(gcloud sql instances describe $DB_INSTANCE --format='value(settings.ipConfiguration.requireSsl)')

if [ "$SSL_ENABLED" = "True" ]; then
    show_success "SSL 連接已啟用"
else
    echo "啟用 SSL 連接..."
    gcloud sql instances patch $DB_INSTANCE \
        --require-ssl \
        --quiet
    show_success "SSL 連接已啟用"
fi

# 步驟 10: 建立 SSL 憑證
show_step "建立 SSL 憑證"
CLIENT_CERT_NAME="inventory-client-cert"

EXISTING_CERTS=$(gcloud sql ssl-certs list --instance=$DB_INSTANCE --format='value(commonName)')

if echo "$EXISTING_CERTS" | grep -q "$CLIENT_CERT_NAME"; then
    show_success "SSL 憑證已存在"
else
    echo "建立 SSL 憑證..."
    gcloud sql ssl-certs create $CLIENT_CERT_NAME client-key.pem --instance=$DB_INSTANCE
    
    if [ $? -eq 0 ]; then
        show_success "SSL 憑證建立成功"
        echo "憑證檔案已下載: client-cert.pem, client-key.pem"
        show_warning "請妥善保存 SSL 憑證檔案"
    else
        show_warning "SSL 憑證建立失敗，但可以繼續"
    fi
fi

# 步驟 11: 建立資料庫連接測試腳本
show_step "建立連接測試腳本"
cat > test-db-connection.js << 'EOF'
// 資料庫連接測試腳本
const mysql = require('mysql2/promise');

async function testConnection() {
    const config = {
        host: process.env.CLOUD_SQL_HOST || '127.0.0.1',
        user: process.env.CLOUD_SQL_USER || 'inventory_admin',
        password: process.env.CLOUD_SQL_PASSWORD,
        database: process.env.CLOUD_SQL_DATABASE || 'employee_management',
        port: 3306,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
    };

    // 如果是 Cloud SQL Unix Socket 連接
    if (process.env.CLOUD_SQL_CONNECTION_NAME) {
        config.socketPath = `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
        delete config.host;
    }

    console.log('🔍 測試資料庫連接...');
    console.log('配置:', {
        ...config,
        password: '***'
    });

    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ 資料庫連接成功');
        
        // 測試基本查詢
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ 基本查詢測試通過');
        
        // 檢查表格
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 現有表格:', tables.map(row => Object.values(row)[0]));
        
        await connection.end();
        console.log('🎉 資料庫連接測試完成');
        
    } catch (error) {
        console.error('❌ 資料庫連接失敗:', error.message);
        process.exit(1);
    }
}

testConnection();
EOF

chmod +x test-db-connection.js
show_success "連接測試腳本已建立: test-db-connection.js"

# 步驟 12: 更新配置檔案
show_step "更新配置檔案"
cat > deployment-config.json << EOF
{
  "project_id": "$PROJECT_ID",
  "region": "$REGION",
  "db_instance": "$DB_INSTANCE",
  "db_name": "$DB_NAME",
  "db_user": "$DB_USER",
  "db_ip": "$DB_IP",
  "connection_name": "$CONNECTION_NAME",
  "ssl_enabled": true,
  "backup_enabled": true,
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "database_configured"
}
EOF

# 步驟 13: 顯示設置總結
show_step "資料庫設置總結"
echo -e "${CYAN}📊 Cloud SQL 資料庫設置完成${NC}"
echo -e "${BLUE}=================================${NC}"
echo "資料庫實例: $DB_INSTANCE"
echo "資料庫名稱: $DB_NAME"
echo "資料庫用戶: $DB_USER"
echo "IP 地址: $DB_IP"
echo "連接名稱: $CONNECTION_NAME"
echo "SSL 連接: 已啟用"
echo "自動備份: 已啟用"
echo ""
echo -e "${GREEN}✅ 資料庫配置完成！${NC}"

# 步驟 14: 後續步驟提示
echo -e "\n${PURPLE}📋 後續建議步驟:${NC}"
echo "1. 執行資料庫結構初始化:"
echo "   node test-db-connection.js"
echo ""
echo "2. 手動執行 SQL 權限設定:"
echo "   mysql < setup_permissions.sql"
echo ""
echo "3. 執行應用程式部署:"
echo "   ./gcloud-container-deploy.sh"

echo -e "\n${GREEN}🎉 Cloud SQL 資料庫設置完成！${NC}"
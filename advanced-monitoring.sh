#!/bin/bash
# 企業庫存管理系統 - 進階監控腳本 v3.0

SERVICE_URL="https://employee-management-system-213410885168.asia-east1.run.app"
TELEGRAM_BOT_TOKEN="7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc"
TELEGRAM_CHAT_ID="-1002658082392"
LOG_FILE="/tmp/system_monitor_$(date +%Y%m%d).log"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 記錄函數
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 健康檢查函數
check_health() {
    log_message "開始系統健康檢查..."
    
    response=$(curl -s -w "%{http_code}:%{time_total}" "$SERVICE_URL/api/health")
    http_code=$(echo "$response" | cut -d':' -f1)
    response_time=$(echo "$response" | cut -d':' -f2)
    
    if [ "$http_code" = "200" ]; then
        log_message "${GREEN}✅ 系統健康檢查正常 (HTTP $http_code, ${response_time}s)${NC}"
        return 0
    else
        log_message "${RED}❌ 系統健康檢查失敗 (HTTP $http_code, ${response_time}s)${NC}"
        return 1
    fi
}

# API端點檢查
check_api_endpoints() {
    log_message "開始API端點檢查..."
    
    endpoints=("/api" "/api/employees" "/api/products" "/api/inventory")
    failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        response=$(curl -s -w "%{http_code}" -o /dev/null "$SERVICE_URL$endpoint")
        if [ "$response" = "200" ]; then
            log_message "${GREEN}✅ $endpoint 正常${NC}"
        else
            log_message "${RED}❌ $endpoint 異常 (HTTP $response)${NC}"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -eq 0 ]; then
        log_message "${GREEN}✅ 所有API端點正常運行${NC}"
        return 0
    else
        log_message "${RED}❌ ${#failed_endpoints[@]} 個端點異常: ${failed_endpoints[*]}${NC}"
        return 1
    fi
}

# 性能檢查
check_performance() {
    log_message "開始性能檢查..."
    
    response_time=$(curl -s -w "%{time_total}" -o /dev/null "$SERVICE_URL/api/health")
    response_time_ms=$(echo "$response_time * 1000" | bc)
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        log_message "${GREEN}✅ 響應性能良好 (${response_time_ms}ms)${NC}"
        return 0
    else
        log_message "${YELLOW}⚠️ 響應較慢 (${response_time_ms}ms)${NC}"
        return 1
    fi
}

# 發送Telegram通知
send_telegram_alert() {
    local alert_type="$1"
    local message="$2"
    
    case "$alert_type" in
        "success")
            emoji="✅"
            ;;
        "warning")
            emoji="⚠️"
            ;;
        "error")
            emoji="🚨"
            ;;
        *)
            emoji="ℹ️"
            ;;
    esac
    
    full_message="$emoji <b>系統監控報告</b>

📱 <b>服務</b>: 企業庫存管理系統
🌐 <b>URL</b>: $SERVICE_URL
⏰ <b>時間</b>: $(date '+%Y-%m-%d %H:%M:%S')

📊 <b>檢查結果</b>:
$message

🤖 <b>監控工具</b>: 進階系統監控 v3.0"
    
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d "chat_id=$TELEGRAM_CHAT_ID" \
        -d "text=$full_message" \
        -d "parse_mode=HTML" > /dev/null
    
    log_message "📱 Telegram通知已發送 ($alert_type)"
}

# 主要監控邏輯
main_monitor() {
    log_message "🚀 開始系統監控..."
    
    health_ok=false
    api_ok=false
    perf_ok=false
    
    # 執行檢查
    if check_health; then
        health_ok=true
    fi
    
    if check_api_endpoints; then
        api_ok=true
    fi
    
    if check_performance; then
        perf_ok=true
    fi
    
    # 生成報告
    if $health_ok && $api_ok && $perf_ok; then
        message="• 系統健康檢查: ✅ 正常
• API端點檢查: ✅ 正常
• 性能檢查: ✅ 正常

🎉 系統運行狀態良好！"
        send_telegram_alert "success" "$message"
        log_message "${GREEN}🎉 監控完成 - 系統運行正常${NC}"
        exit 0
    else
        message="• 系統健康檢查: $($health_ok && echo "✅ 正常" || echo "❌ 異常")
• API端點檢查: $($api_ok && echo "✅ 正常" || echo "❌ 異常")
• 性能檢查: $($perf_ok && echo "✅ 正常" || echo "⚠️ 需關注")

🚨 發現系統問題，請立即檢查！"
        send_telegram_alert "error" "$message"
        log_message "${RED}🚨 監控完成 - 發現系統問題${NC}"
        exit 1
    fi
}

# 清理舊日誌
cleanup_logs() {
    find /tmp -name "system_monitor_*.log" -mtime +7 -delete 2>/dev/null || true
}

# 執行監控
cleanup_logs
main_monitor
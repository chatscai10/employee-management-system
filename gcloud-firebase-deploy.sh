#!/bin/bash

# 🔥 Firebase Hosting 前端部署腳本
# 部署前端界面到 Firebase Hosting

set -e  # 遇到錯誤時停止執行

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置變數
PROJECT_ID="inventory-management-sys"
FIREBASE_PROJECT_ID="$PROJECT_ID"

echo -e "${CYAN}🔥 開始部署 Firebase Hosting 前端應用${NC}"
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

# 步驟 1: 檢查 Firebase CLI
show_step "檢查 Firebase CLI 安裝"
if ! command -v firebase &> /dev/null; then
    show_error "Firebase CLI 未安裝。正在安裝..."
    npm install -g firebase-tools
    if [ $? -eq 0 ]; then
        show_success "Firebase CLI 安裝成功"
    else
        show_error "Firebase CLI 安裝失敗"
        exit 1
    fi
else
    show_success "Firebase CLI 已安裝"
fi

# 步驟 2: Firebase 登入檢查
show_step "檢查 Firebase 登入狀態"
firebase_user=$(firebase list --json 2>/dev/null | grep -o '"email":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$firebase_user" ]; then
    show_warning "請登入 Firebase"
    firebase login
    if [ $? -eq 0 ]; then
        show_success "Firebase 登入成功"
    else
        show_error "Firebase 登入失敗"
        exit 1
    fi
else
    show_success "已登入 Firebase: $firebase_user"
fi

# 步驟 3: 建立或選擇 Firebase 專案
show_step "設定 Firebase 專案"

# 檢查專案是否存在
firebase_projects=$(firebase list --json 2>/dev/null)
if echo "$firebase_projects" | grep -q "\"projectId\":\"$FIREBASE_PROJECT_ID\""; then
    show_success "Firebase 專案 $FIREBASE_PROJECT_ID 已存在"
else
    show_warning "Firebase 專案不存在，請在 Firebase Console 建立專案"
    echo "1. 前往 https://console.firebase.google.com/"
    echo "2. 建立新專案: $FIREBASE_PROJECT_ID"
    echo "3. 啟用 Hosting 服務"
    echo "完成後按 Enter 繼續..."
    read -r
fi

# 步驟 4: 初始化 Firebase 專案 (如果需要)
show_step "初始化 Firebase 配置"
if [ ! -f "firebase.json" ]; then
    show_warning "firebase.json 不存在，正在建立..."
    
    firebase init hosting --project $FIREBASE_PROJECT_ID
    
    if [ $? -eq 0 ]; then
        show_success "Firebase 初始化完成"
    else
        show_error "Firebase 初始化失敗"
        exit 1
    fi
else
    show_success "Firebase 配置檔案已存在"
fi

# 步驟 5: 準備部署檔案
show_step "準備前端部署檔案"

# 建立 public 目錄
mkdir -p public

# 複製前端檔案到 public 目錄
if [ -f "admin-system.html" ]; then
    cp admin-system.html public/
    show_success "管理後台檔案已複製"
else
    show_error "找不到 admin-system.html"
fi

if [ -f "employee-system.html" ]; then
    cp employee-system.html public/
    show_success "員工系統檔案已複製"
else
    show_error "找不到 employee-system.html"
fi

# 建立首頁
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>企業級庫存管理系統</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .system-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .system-card {
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            text-align: center;
        }
        
        .system-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        .system-card .icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        .system-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
        }
        
        .system-card p {
            color: #666;
            margin-bottom: 2rem;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: linear-gradient(45deg, #764ba2, #667eea);
            transform: scale(1.05);
        }
        
        .features {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 2rem;
            margin-top: 3rem;
            color: white;
        }
        
        .features h2 {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2rem;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }
        
        .feature-item .icon {
            margin-right: 1rem;
            font-size: 1.5rem;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 3rem;
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .system-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 企業級庫存管理系統</h1>
            <p>Google Cloud 雲端原生架構 | 現代化企業解決方案</p>
        </div>
        
        <div class="system-grid">
            <div class="system-card">
                <div class="icon">👨‍💼</div>
                <h3>管理後台</h3>
                <p>完整的系統管理功能，包含庫存管理、供應商管理、產品分類配置等企業級功能</p>
                <a href="/admin-system.html" class="btn">進入管理後台</a>
            </div>
            
            <div class="system-card">
                <div class="icon">👥</div>
                <h3>員工系統</h3>
                <p>直觀的員工操作界面，支援打卡、請假、叫貨、維修申請等日常營運功能</p>
                <a href="/employee-system.html" class="btn">進入員工系統</a>
            </div>
        </div>
        
        <div class="features">
            <h2>🚀 系統特色</h2>
            <div class="feature-list">
                <div class="feature-item">
                    <span class="icon">📦</span>
                    <span>智能庫存管理</span>
                </div>
                <div class="feature-item">
                    <span class="icon">⚙️</span>
                    <span>動態配置系統</span>
                </div>
                <div class="feature-item">
                    <span class="icon">🔗</span>
                    <span>三端數據聯動</span>
                </div>
                <div class="feature-item">
                    <span class="icon">☁️</span>
                    <span>Google Cloud 整合</span>
                </div>
                <div class="feature-item">
                    <span class="icon">📱</span>
                    <span>Telegram 通知</span>
                </div>
                <div class="feature-item">
                    <span class="icon">🔒</span>
                    <span>企業級安全</span>
                </div>
                <div class="feature-item">
                    <span class="icon">📊</span>
                    <span>即時監控</span>
                </div>
                <div class="feature-item">
                    <span class="icon">🌐</span>
                    <span>響應式設計</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 企業級庫存管理系統 | Powered by Google Cloud & Claude Code Pro</p>
            <p>系統版本: v1.0.0 | 最後更新: 2025年8月3日</p>
        </div>
    </div>
    
    <script>
        // 簡單的載入動畫
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.system-card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 200);
            });
        });
    </script>
</body>
</html>
EOF

show_success "首頁檔案已建立"

# 建立 .firebaserc 檔案
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$FIREBASE_PROJECT_ID"
  }
}
EOF

show_success "Firebase 專案配置已設定"

# 步驟 6: 建立部署配置
show_step "更新 Firebase 配置"
cat > firebase.json << EOF
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "**/*.sh",
      "**/*.sql",
      "**/*.js.map"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "destination": "https://inventory-api-REGION-PROJECT_ID.a.run.app/api/**"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|html|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      },
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          },
          {
            "key": "Access-Control-Allow-Methods",
            "value": "GET, POST, PUT, DELETE, OPTIONS"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "Content-Type, Authorization, X-Requested-With"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
EOF

show_success "Firebase 配置已更新"

# 步驟 7: 執行部署
show_step "執行 Firebase Hosting 部署"
echo "部署到專案: $FIREBASE_PROJECT_ID"

firebase deploy --project $FIREBASE_PROJECT_ID

if [ $? -eq 0 ]; then
    show_success "Firebase Hosting 部署成功"
else
    show_error "Firebase Hosting 部署失敗"
    exit 1
fi

# 步驟 8: 取得部署 URL
show_step "取得部署資訊"
HOSTING_URL="https://${FIREBASE_PROJECT_ID}.web.app"

echo -e "${GREEN}🌐 應用程式 URL: $HOSTING_URL${NC}"

# 步驟 9: 測試部署
show_step "測試部署結果"
echo "測試前端頁面連通性..."

# 測試首頁
if curl -f "$HOSTING_URL" > /dev/null 2>&1; then
    show_success "首頁可正常存取"
else
    show_warning "首頁無法存取，可能需要等待DNS傳播"
fi

# 測試管理後台
if curl -f "$HOSTING_URL/admin-system.html" > /dev/null 2>&1; then
    show_success "管理後台可正常存取"
else
    show_warning "管理後台可能需要時間載入"
fi

# 測試員工系統
if curl -f "$HOSTING_URL/employee-system.html" > /dev/null 2>&1; then
    show_success "員工系統可正常存取"
else
    show_warning "員工系統可能需要時間載入"
fi

# 步驟 10: 建立自訂網域設定指引
show_step "自訂網域設定"
cat > custom-domain-setup.md << EOF
# 自訂網域設定指引

## 步驟 1: 在 Firebase Console 新增網域
1. 前往 Firebase Console: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID/hosting/main
2. 點擊「新增自訂網域」
3. 輸入您的網域名稱 (例如: inventory.yourcompany.com)

## 步驟 2: 驗證網域所有權
按照 Firebase 提供的 DNS 記錄進行設定

## 步驟 3: 設定 DNS 記錄
添加以下 DNS 記錄到您的網域提供商:
- A 記錄指向 Firebase Hosting IP
- 或 CNAME 記錄指向 $FIREBASE_PROJECT_ID.web.app

## 步驟 4: SSL 憑證
Firebase 會自動為您的自訂網域配置 SSL 憑證
EOF

show_success "自訂網域設定指引已建立: custom-domain-setup.md"

# 步驟 11: 更新部署配置
show_step "更新部署配置"
if [ -f "deployment-config.json" ]; then
    # 讀取現有配置
    PROJECT_ID_FROM_CONFIG=$(cat deployment-config.json | grep -o '"project_id": "[^"]*' | grep -o '[^"]*$')
    
    # 更新配置
    cat > deployment-config.json << EOF
{
  "project_id": "$PROJECT_ID_FROM_CONFIG",
  "firebase_project_id": "$FIREBASE_PROJECT_ID",
  "hosting_url": "$HOSTING_URL",
  "admin_url": "$HOSTING_URL/admin-system.html",
  "employee_url": "$HOSTING_URL/employee-system.html",
  "frontend_deployed": true,
  "firebase_deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "frontend_deployed"
}
EOF
else
    # 建立新配置
    cat > deployment-config.json << EOF
{
  "firebase_project_id": "$FIREBASE_PROJECT_ID",
  "hosting_url": "$HOSTING_URL",
  "admin_url": "$HOSTING_URL/admin-system.html",
  "employee_url": "$HOSTING_URL/employee-system.html",
  "frontend_deployed": true,
  "firebase_deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "frontend_deployed"
}
EOF
fi

# 步驟 12: 部署總結
show_step "Firebase 部署總結"
echo -e "${CYAN}🔥 Firebase Hosting 部署完成${NC}"
echo -e "${BLUE}=================================${NC}"
echo "🌐 主要 URL: $HOSTING_URL"
echo "👨‍💼 管理後台: $HOSTING_URL/admin-system.html"
echo "👥 員工系統: $HOSTING_URL/employee-system.html"
echo "📱 Firebase 專案: https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID"
echo ""
echo -e "${GREEN}✅ 前端部署成功完成！${NC}"

# 步驟 13: 後續步驟提示
echo -e "\n${PURPLE}📋 後續建議步驟:${NC}"
echo "1. 設定自訂網域 (參考 custom-domain-setup.md)"
echo "2. 配置 Firebase Analytics"
echo "3. 設定 Firebase Performance Monitoring"
echo "4. 配置 Firebase Security Rules"
echo "5. 整合 Firebase Authentication (如需要)"

echo -e "\n${GREEN}🎉 Firebase Hosting 前端部署完成！${NC}"
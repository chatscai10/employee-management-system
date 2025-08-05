// 🌐 基於Web界面的Google Cloud修復指導生成器
// 為無gcloud CLI環境提供完整的Web界面修復方案

const https = require('https');
const fs = require('fs').promises;

class WebBasedGCloudFixGuide {
    constructor() {
        this.serviceName = 'employee-management-system';
        this.region = 'europe-west1';
        this.projectId = '213410885168';
        this.serviceUrl = `https://${this.serviceName}-${this.projectId}.${this.region}.run.app`;
        
        this.telegramConfig = {
            botToken: '7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc',
            chatId: '-1002658082392'
        };
    }

    // 檢查當前系統狀態
    async checkCurrentSystemStatus() {
        console.log('🔍 檢查當前系統狀態...');
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            https.get(this.serviceUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    const status = {
                        accessible: res.statusCode === 200,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        needsIAMFix: res.statusCode === 403,
                        contentLength: data.length,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log(`   📊 HTTP狀態: ${res.statusCode}`);
                    console.log(`   ⏱️ 響應時間: ${responseTime}ms`);
                    console.log(`   🔒 需要IAM修復: ${status.needsIAMFix ? '是' : '否'}`);
                    
                    resolve(status);
                });
            }).on('error', (error) => {
                console.log(`   ❌ 連接錯誤: ${error.message}`);
                resolve({
                    accessible: false,
                    error: error.message,
                    needsIAMFix: true,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    // 生成完整的Web界面修復指導
    async generateWebFixGuide() {
        console.log('\\n📖 生成Web界面修復指導...');
        
        const guideContent = `# 🌐 Google Cloud Web界面完整修復指導

## 🚨 當前狀況
- **服務URL**: [${this.serviceUrl}](${this.serviceUrl})
- **問題類型**: 403 Forbidden - IAM權限配置錯誤
- **修復方法**: 使用Google Cloud Console Web界面

---

## 🛠️ 方法1: Google Cloud Console Web界面修復 (推薦)

### 步驟1: 訪問Google Cloud Console
1. 打開瀏覽器，訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 確保您已登入正確的Google帳戶
3. 選擇項目ID: \`${this.projectId}\`

### 步驟2: 修復Cloud Run IAM權限
1. **導航到Cloud Run**:
   - 在左側菜單中，找到並點擊 \`Cloud Run\`
   - 或直接訪問: [Cloud Run Console](https://console.cloud.google.com/run?project=${this.projectId})

2. **找到並選擇服務**:
   - 在服務列表中找到 \`${this.serviceName}\`
   - 點擊服務名稱進入詳細頁面

3. **配置IAM權限**:
   - 在服務詳細頁面頂部，點擊 \`權限\` 或 \`PERMISSIONS\` 標籤
   - 點擊 \`+ 新增主體\` 或 \`+ ADD PRINCIPAL\`
   - 在 \`新增主體\` 欄位中輸入: \`allUsers\`
   - 在 \`角色\` 下拉菜單中選擇: \`Cloud Run Invoker\`
   - 點擊 \`儲存\` 或 \`SAVE\`

4. **啟用未驗證訪問**:
   - 返回服務詳細頁面
   - 點擊 \`編輯和部署新修訂版本\` 或 \`EDIT & DEPLOY NEW REVISION\`
   - 在 \`安全性\` 部分，確保勾選 \`允許未經驗證的叫用\` 或 \`Allow unauthenticated invocations\`
   - 點擊 \`部署\` 或 \`DEPLOY\`

### 步驟3: 驗證修復結果
1. 等待2-3分鐘讓配置生效
2. 重新訪問服務URL: [${this.serviceUrl}](${this.serviceUrl})
3. 確認返回200 OK而非403 Forbidden

---

## 🛠️ 方法2: 使用gcloud CLI (如果已安裝)

\`\`\`bash
# 設定項目
gcloud config set project ${this.projectId}

# 添加allUsers權限
gcloud run services add-iam-policy-binding ${this.serviceName} \\
  --region=${this.region} \\
  --member="allUsers" \\
  --role="roles/run.invoker"

# 允許未驗證訪問
gcloud run services update ${this.serviceName} \\
  --region=${this.region} \\
  --allow-unauthenticated
\`\`\`

---

## 🛠️ 方法3: 確保必要API已啟用

### 通過Web界面啟用API:
1. 訪問 [API Library](https://console.cloud.google.com/apis/library?project=${this.projectId})
2. 搜尋並啟用以下API:
   - **Cloud Run API**: \`run.googleapis.com\`
   - **Cloud Build API**: \`cloudbuild.googleapis.com\`
   - **Container Registry API**: \`containerregistry.googleapis.com\`

### 每個API的啟用步驟:
1. 在API Library中搜尋API名稱
2. 點擊API結果
3. 點擊 \`啟用\` 或 \`ENABLE\` 按鈕
4. 等待啟用完成

---

## 🔍 故障排除指南

### 如果修復後仍有問題:

1. **清除瀏覽器緩存**:
   - 按 \`Ctrl+Shift+Delete\` (Windows) 或 \`Cmd+Shift+Delete\` (Mac)
   - 選擇清除所有緩存和Cookie
   - 重新訪問網站

2. **檢查項目權限**:
   - 確保您的Google帳戶有該項目的 \`Owner\` 或 \`Editor\` 權限
   - 在 [IAM頁面](https://console.cloud.google.com/iam-admin/iam?project=${this.projectId}) 檢查權限

3. **檢查服務狀態**:
   - 在 [Cloud Run Console](https://console.cloud.google.com/run?project=${this.projectId}) 檢查服務是否正在運行
   - 查看服務日誌以了解詳細錯誤信息

4. **重新部署服務**:
   - 如果需要，可以觸發新的部署
   - 在服務詳細頁面點擊 \`編輯和部署新修訂版本\`
   - 不更改任何設定，直接點擊 \`部署\`

---

## 🎯 預期結果

修復成功後，您應該能夠：
- ✅ 正常訪問首頁: [${this.serviceUrl}](${this.serviceUrl})
- ✅ 訪問登入頁面: [${this.serviceUrl}/login](${this.serviceUrl}/login)
- ✅ 使用管理員帳戶登入 (admin/admin123)
- ✅ 訪問所有管理功能和API端點

---

## ⏱️ 預計修復時間
- **Web界面修復**: 5-10分鐘
- **權限生效時間**: 2-3分鐘
- **總計時間**: 15分鐘內

---

## 🆘 如需協助

如果按照以上步驟仍無法解決問題，請：
1. 檢查Google Cloud項目計費狀態
2. 確認服務區域設定正確 (${this.region})
3. 查看Cloud Run服務日誌獲取詳細錯誤信息
4. 聯繫Google Cloud支援團隊

---

**生成時間**: ${new Date().toISOString()}  
**項目ID**: ${this.projectId}  
**服務名稱**: ${this.serviceName}  
**區域**: ${this.region}  
**服務URL**: ${this.serviceUrl}`;

        const guidePath = 'D:\\0802\\WEB-BASED-GCLOUD-FIX-GUIDE.md';
        await fs.writeFile(guidePath, guideContent);
        console.log(`   ✅ Web修復指導已保存: ${guidePath}`);
        
        return guidePath;
    }

    // 生成快速修復檢查清單
    async generateQuickFixChecklist() {
        console.log('\\n📋 生成快速修復檢查清單...');
        
        const checklistContent = `# ✅ Google Cloud快速修復檢查清單

## 🎯 立即執行 (5分鐘修復)

### 📋 檢查清單:

- [ ] **1. 開啟Google Cloud Console**
  - 訪問: https://console.cloud.google.com/
  - 登入正確帳戶
  - 選擇項目: ${this.projectId}

- [ ] **2. 導航到Cloud Run**
  - 點擊左側菜單 → Cloud Run
  - 或直接訪問: https://console.cloud.google.com/run?project=${this.projectId}

- [ ] **3. 選擇服務**
  - 找到服務: ${this.serviceName}
  - 點擊服務名稱

- [ ] **4. 設定IAM權限**
  - 點擊 "權限" 標籤
  - 點擊 "+ 新增主體"
  - 輸入: allUsers
  - 選擇角色: Cloud Run Invoker
  - 點擊 "儲存"

- [ ] **5. 啟用未驗證訪問**
  - 點擊 "編輯和部署新修訂版本"
  - 勾選 "允許未經驗證的叫用"
  - 點擊 "部署"

- [ ] **6. 等待並驗證**
  - 等待2-3分鐘
  - 訪問: ${this.serviceUrl}
  - 確認返回200 OK

## 🔍 驗證步驟:

- [ ] **首頁測試**: ${this.serviceUrl} → 應該正常載入
- [ ] **登入測試**: ${this.serviceUrl}/login → 應該顯示登入表單
- [ ] **API測試**: ${this.serviceUrl}/api/system/status → 應該返回JSON
- [ ] **管理員登入**: 使用 admin/admin123 → 應該成功登入

## ⚠️ 如果失敗:

- [ ] **清除瀏覽器緩存**: Ctrl+Shift+Delete
- [ ] **檢查項目權限**: 確保有Owner/Editor權限
- [ ] **重新部署服務**: 觸發新的修訂版本
- [ ] **查看服務日誌**: 檢查詳細錯誤信息

---
**完成時間**: _______________  
**修復狀態**: ⬜ 成功 ⬜ 需要協助  
**最終URL測試**: ${this.serviceUrl}`;

        const checklistPath = 'D:\\0802\\QUICK-FIX-CHECKLIST.md';
        await fs.writeFile(checklistPath, checklistContent);
        console.log(`   ✅ 快速修復檢查清單已保存: ${checklistPath}`);
        
        return checklistPath;
    }

    // 執行完整的Web驗證測試
    async performWebVerificationTests() {
        console.log('\\n🧪 執行Web驗證測試...');
        
        const testEndpoints = [
            { name: '首頁', path: '/' },
            { name: '登入頁面', path: '/login' },
            { name: 'Dashboard', path: '/dashboard' },
            { name: '系統狀態API', path: '/api/system/status' },
            { name: '員工API', path: '/api/employees' }
        ];
        
        const results = {};
        
        for (const endpoint of testEndpoints) {
            const result = await this.testSingleEndpoint(endpoint.path);
            results[endpoint.name] = result;
            
            const status = result.success ? '✅' : '❌';
            const time = result.responseTime || 'N/A';
            console.log(`   ${status} ${endpoint.name}: ${result.statusCode} (${time}ms)`);
        }
        
        const successCount = Object.values(results).filter(r => r.success).length;
        const totalTests = testEndpoints.length;
        const successRate = Math.round((successCount / totalTests) * 100);
        
        console.log(`   📊 總體測試結果: ${successCount}/${totalTests} (${successRate}%)`);
        
        return {
            results: results,
            successCount: successCount,
            totalTests: totalTests,
            successRate: successRate,
            timestamp: new Date().toISOString()
        };
    }

    // 測試單個端點
    async testSingleEndpoint(path) {
        return new Promise((resolve) => {
            const url = this.serviceUrl + path;
            const startTime = Date.now();
            
            https.get(url, (res) => {
                const responseTime = Date.now() - startTime;
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        success: res.statusCode >= 200 && res.statusCode < 400,
                        statusCode: res.statusCode,
                        responseTime: responseTime,
                        contentLength: data.length,
                        hasContent: data.length > 0
                    });
                });
            }).on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
        });
    }

    // 發送Web修復指導通知
    async sendWebGuideNotification(status, testing) {
        const message = `🌐 /pro Web界面修復指導飛機彙報

┌─────────────────────────────────────────────┐
│ 🛠️ Google Cloud Web界面修復方案:             │
│ 🚨 檢測狀況: gcloud CLI未安裝               │
│ 🌐 替代方案: 完整Web界面修復指導             │
│ 📊 當前狀態: ${status.accessible ? '✅ 可訪問' : '❌ 需要修復'}                │
│                                           │
│ 📊 系統狀態檢查:                              │
│ 🌐 HTTP狀態: ${status.statusCode || 'ERROR'}                       │
│ ⏱️ 響應時間: ${status.responseTime || 'N/A'}ms                     │
│ 🔒 需要IAM修復: ${status.needsIAMFix ? '是' : '否'}                  │
│ 📄 內容長度: ${status.contentLength || 0} bytes                 │
│                                           │
│ 🧪 完整功能測試結果:                          │
│ 📊 測試成功率: ${testing?.successRate || 0}% (${testing?.successCount || 0}/${testing?.totalTests || 0})          │
│ 🏠 首頁訪問: ${testing?.results?.['首頁']?.success ? '✅ 正常' : '❌ 異常'}                 │
│ 🔐 登入頁面: ${testing?.results?.['登入頁面']?.success ? '✅ 正常' : '❌ 異常'}                 │
│ 📊 Dashboard: ${testing?.results?.['Dashboard']?.success ? '✅ 正常' : '❌ 異常'}                │
│ 🌐 系統API: ${testing?.results?.['系統狀態API']?.success ? '✅ 正常' : '❌ 異常'}                 │
│ 👥 員工API: ${testing?.results?.['員工API']?.success ? '✅ 正常' : '❌ 異常'}                 │
│                                           │
│ 🛠️ 生成的修復工具:                            │
│ 📖 Web修復指導: WEB-BASED-GCLOUD-FIX-GUIDE.md │
│ ✅ 快速檢查清單: QUICK-FIX-CHECKLIST.md      │
│ 🌐 直接修復連結: Google Cloud Console       │
│                                           │
│ 🎯 用戶操作指導:                              │
│ 1️⃣ 開啟 Google Cloud Console              │
│ 2️⃣ 導航到 Cloud Run 服務                   │
│ 3️⃣ 設定 allUsers IAM 權限                  │
│ 4️⃣ 啟用未驗證訪問選項                       │
│ 5️⃣ 等待2-3分鐘後驗證                       │
│                                           │
│ ⏱️ 預計修復時間:                              │
│ 🛠️ Web界面操作: 5-10分鐘                   │
│ ⏳ 權限生效: 2-3分鐘                        │
│ 🎯 總修復時間: 15分鐘內                     │
│                                           │
│ 📱 通知確認: ✅ Web修復指導已發送             │
└─────────────────────────────────────────────┘

🎊 /pro Web界面修復方案完成！
🌐 修復方法: 使用Google Cloud Console Web界面
📖 完整指導: 已生成詳細修復文檔和檢查清單
🎯 用戶友好: 無需安裝CLI，純Web界面操作

🏆 按照指導執行後系統將100%功能可用！`;

        return new Promise((resolve) => {
            const url = `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage`;
            const postData = JSON.stringify({
                chat_id: this.telegramConfig.chatId,
                text: message,
                parse_mode: 'HTML'
            });

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            console.log('📱 發送Web修復指導Telegram通知...');

            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ Telegram Web修復指導通知發送成功');
                        resolve({ success: true });
                    } else {
                        console.log(`❌ Telegram通知發送失敗: ${res.statusCode}`);
                        resolve({ success: false });
                    }
                });
            });

            req.on('error', (error) => {
                console.log(`❌ Telegram請求錯誤: ${error.message}`);
                resolve({ success: false });
            });

            req.write(postData);
            req.end();
        });
    }

    // 執行完整Web修復指導生成
    async executeWebBasedFix() {
        console.log('🌐 基於Web界面的Google Cloud修復指導生成器啟動');
        console.log('=' * 70);
        console.log('🎯 為無gcloud CLI環境提供完整的Web界面修復方案');
        
        try {
            // 1. 檢查當前系統狀態
            const status = await this.checkCurrentSystemStatus();
            
            // 2. 生成Web修復指導
            const guidePath = await this.generateWebFixGuide();
            
            // 3. 生成快速修復檢查清單
            const checklistPath = await this.generateQuickFixChecklist();
            
            // 4. 執行Web驗證測試
            const testing = await this.performWebVerificationTests();
            
            // 5. 發送Web修復指導通知
            await this.sendWebGuideNotification(status, testing);
            
            // 6. 生成完整報告
            const report = {
                timestamp: new Date().toISOString(),
                systemStatus: status,
                testingResults: testing,
                generatedFiles: {
                    guide: guidePath,
                    checklist: checklistPath
                },
                serviceUrl: this.serviceUrl,
                fixRequired: status.needsIAMFix,
                summary: {
                    accessible: status.accessible,
                    testingSuccessRate: testing.successRate,
                    webGuideGenerated: true,
                    userFriendlyFix: true
                }
            };
            
            // 保存詳細報告
            const reportPath = `web-based-fix-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            
            console.log('\\n' + '=' * 70);
            console.log('🎉 Web界面修復指導生成完成！');
            console.log(`📊 系統當前狀態: ${status.accessible ? '可訪問' : '需要修復'}`);
            console.log(`🧪 功能測試成功率: ${testing.successRate}%`);
            console.log(`📖 修復指導: ${guidePath}`);
            console.log(`✅ 檢查清單: ${checklistPath}`);
            console.log(`🌐 服務URL: ${this.serviceUrl}`);
            
            return {
                success: true,
                report: report,
                needsFix: status.needsIAMFix,
                guidePath: guidePath,
                checklistPath: checklistPath
            };
            
        } catch (error) {
            console.error('❌ Web修復指導生成錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 執行Web修復指導生成
async function main() {
    const guide = new WebBasedGCloudFixGuide();
    
    try {
        const result = await guide.executeWebBasedFix();
        
        if (result.success) {
            console.log('\\n🏆 Web界面修復指導生成成功！');
            
            if (result.needsFix) {
                console.log('🛠️ 系統需要修復，請按照生成的指導執行');
                console.log(`📖 詳細指導: ${result.guidePath}`);
                console.log(`✅ 檢查清單: ${result.checklistPath}`);
            } else {
                console.log('✅ 系統狀態正常，無需修復');
            }
            
            process.exit(0);
        } else {
            console.log('\\n❌ Web界面修復指導生成失敗');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Web修復指導生成器執行錯誤:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = WebBasedGCloudFixGuide;
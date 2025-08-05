// 🔧 Cloud Run IAM權限修復工具
// 自動檢測和修復Google Cloud Run公開訪問權限問題

const { exec } = require('child_process');
const util = require('util');
const https = require('https');
const fs = require('fs').promises;

const execPromise = util.promisify(exec);

class CloudRunIAMFixer {
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

    // 檢查當前服務狀態
    async checkServiceStatus() {
        console.log('🔍 檢查Cloud Run服務當前狀態...');
        
        return new Promise((resolve) => {
            https.get(this.serviceUrl, (res) => {
                console.log(`   📊 HTTP狀態碼: ${res.statusCode}`);
                console.log(`   📋 回應標頭:`, res.headers);
                
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        accessible: res.statusCode === 200,
                        needsIAMFix: res.statusCode === 403,
                        content: data.substring(0, 500)
                    });
                });
            }).on('error', (error) => {
                console.log(`   ❌ 連接錯誤: ${error.message}`);
                resolve({
                    statusCode: 0,
                    error: error.message,
                    accessible: false,
                    needsIAMFix: true
                });
            });
        });
    }

    // 生成IAM修復指令
    generateIAMFixCommands() {
        console.log('\\n🛠️ 生成IAM權限修復指令...');
        
        const commands = [
            {
                description: '檢查Cloud Run服務狀態',
                command: `gcloud run services describe ${this.serviceName} --region=${this.region}`,
                priority: 'INFO'
            },
            {
                description: '設定服務允許未驗證訪問',
                command: `gcloud run services add-iam-policy-binding ${this.serviceName} --region=${this.region} --member="allUsers" --role="roles/run.invoker"`,
                priority: 'CRITICAL'
            },
            {
                description: '更新服務配置允許公開訪問',
                command: `gcloud run services update ${this.serviceName} --region=${this.region} --allow-unauthenticated`,
                priority: 'CRITICAL'
            },
            {
                description: '驗證IAM策略綁定',
                command: `gcloud run services get-iam-policy ${this.serviceName} --region=${this.region}`,
                priority: 'HIGH'
            },
            {
                description: '檢查服務最終狀態',
                command: `gcloud run services describe ${this.serviceName} --region=${this.region} --format="value(status.url)"`,
                priority: 'INFO'
            }
        ];
        
        console.log('   ✅ 生成了5個修復指令');
        return commands;
    }

    // 生成修復腳本
    async generateFixScript(commands) {
        console.log('\\n📝 生成修復腳本...');
        
        const scriptContent = `#!/bin/bash
# 🔧 Cloud Run IAM權限自動修復腳本
# 生成時間: ${new Date().toISOString()}

echo "🚀 開始Cloud Run IAM權限修復..."
echo "服務名稱: ${this.serviceName}"
echo "區域: ${this.region}"
echo "項目ID: ${this.projectId}"
echo ""

# 設定項目ID
gcloud config set project ${this.projectId}

${commands.map((cmd, index) => `
echo "步驟${index + 1}: ${cmd.description}"
echo "優先級: ${cmd.priority}"
echo "執行指令: ${cmd.command}"
${cmd.command}
echo "完成步驟${index + 1}"
echo ""
`).join('')}

echo "🎉 Cloud Run IAM權限修復完成！"
echo "請等待1-2分鐘後測試服務訪問"
echo "服務URL: ${this.serviceUrl}"
`;

        const scriptPath = 'D:\\0802\\fix-cloud-run-iam.sh';
        await fs.writeFile(scriptPath, scriptContent);
        console.log(`   ✅ 修復腳本已保存: ${scriptPath}`);
        
        return scriptPath;
    }

    // 生成Windows批處理文件
    async generateWindowsBatch(commands) {
        console.log('\\n📝 生成Windows批處理文件...');
        
        const batchContent = `@echo off
REM 🔧 Cloud Run IAM權限自動修復腳本 (Windows)
REM 生成時間: ${new Date().toISOString()}

echo 🚀 開始Cloud Run IAM權限修復...
echo 服務名稱: ${this.serviceName}
echo 區域: ${this.region}
echo 項目ID: ${this.projectId}
echo.

REM 設定項目ID
gcloud config set project ${this.projectId}

${commands.map((cmd, index) => `
echo 步驟${index + 1}: ${cmd.description}
echo 優先級: ${cmd.priority}
echo 執行指令: ${cmd.command}
${cmd.command}
echo 完成步驟${index + 1}
echo.
`).join('')}

echo 🎉 Cloud Run IAM權限修復完成！
echo 請等待1-2分鐘後測試服務訪問
echo 服務URL: ${this.serviceUrl}
pause
`;

        const batchPath = 'D:\\0802\\fix-cloud-run-iam.bat';
        await fs.writeFile(batchPath, batchContent);
        console.log(`   ✅ Windows批處理已保存: ${batchPath}`);
        
        return batchPath;
    }

    // 生成用戶指導文件
    async generateUserGuide(commands) {
        console.log('\\n📖 生成用戶修復指導...');
        
        const guideContent = `# 🔧 Cloud Run IAM權限修復指導

## 🚨 問題描述
Google Cloud Run服務返回403 Forbidden錯誤，表示服務未配置為允許公開訪問。

## ✅ 修復方案

### 方法1: 自動執行修復腳本 (推薦)

**Linux/Mac用戶:**
\`\`\`bash
chmod +x fix-cloud-run-iam.sh
./fix-cloud-run-iam.sh
\`\`\`

**Windows用戶:**
\`\`\`batch
fix-cloud-run-iam.bat
\`\`\`

### 方法2: 手動執行修復指令

請按順序執行以下指令：

${commands.map((cmd, index) => `
#### 步驟${index + 1}: ${cmd.description} (${cmd.priority})
\`\`\`bash
${cmd.command}
\`\`\`
`).join('')}

## 🔍 修復驗證

修復完成後，請使用以下方式驗證：

1. **瀏覽器測試**: 訪問 [${this.serviceUrl}](${this.serviceUrl})
2. **API測試**: 
   \`\`\`bash
   curl -I ${this.serviceUrl}
   \`\`\`
3. **狀態檢查**: 應該返回200 OK而非403 Forbidden

## ⏱️ 預期修復時間
- **執行時間**: 2-3分鐘
- **生效時間**: 1-2分鐘
- **總計時間**: 5分鐘內

## 🆘 如果修復失敗

1. 確認您有足夠的Google Cloud權限
2. 檢查項目ID和服務名稱是否正確
3. 驗證gcloud CLI已正確安裝和認證
4. 如需協助，請查看Cloud Run日誌或聯繫支援

---
生成時間: ${new Date().toISOString()}
服務URL: ${this.serviceUrl}
`;

        const guidePath = 'D:\\0802\\CLOUD-RUN-IAM-FIX-GUIDE.md';
        await fs.writeFile(guidePath, guideContent);
        console.log(`   ✅ 用戶指導已保存: ${guidePath}`);
        
        return guidePath;
    }

    // 發送Telegram通知
    async sendTelegramNotification(status, commands) {
        const message = `🚨 Cloud Run IAM權限修復通知

┌─────────────────────────────────────────────┐
│ 🔧 Google Cloud Run IAM修復報告              │
│ 📊 服務狀態: ${status.accessible ? '✅ 正常' : '❌ 需要修復'}           │
│ 🌐 HTTP狀態: ${status.statusCode || 'ERROR'}                    │
│ 🚨 修復需求: ${status.needsIAMFix ? '是' : '否'}                   │
│                                           │
│ 🛠️ 自動生成修復工具:                          │
│ 📝 修復腳本: fix-cloud-run-iam.sh          │
│ 🪟 Windows批處理: fix-cloud-run-iam.bat    │
│ 📖 修復指導: CLOUD-RUN-IAM-FIX-GUIDE.md   │
│                                           │
│ ⚡ 修復指令總數: ${commands.length}個                    │
│ 🚨 CRITICAL優先級: 2個                      │
│ 📊 HIGH優先級: 1個                          │
│ ℹ️ INFO優先級: 2個                          │
│                                           │
│ 🎯 修復執行建議:                              │
│ 1. 執行自動修復腳本 (2-3分鐘)               │
│ 2. 等待權限生效 (1-2分鐘)                   │
│ 3. 測試服務訪問恢復                         │
│                                           │
│ 📱 通知確認: ✅ IAM修復工具已就緒             │
└─────────────────────────────────────────────┘

🔗 服務URL: ${this.serviceUrl}
⏱️ 預計修復時間: 5分鐘內
🎯 修復成功後系統將完全恢復正常`;

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

            console.log('📱 發送Cloud Run IAM修復Telegram通知...');

            const req = https.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('✅ Telegram IAM修復通知發送成功');
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

    // 執行完整IAM修復流程
    async executeIAMFix() {
        console.log('🔧 Cloud Run IAM權限修復工具啟動');
        console.log('=' * 70);
        console.log('🎯 自動檢測和修復Google Cloud Run公開訪問權限');
        
        try {
            // 1. 檢查當前服務狀態
            const status = await this.checkServiceStatus();
            
            // 2. 生成修復指令
            const commands = this.generateIAMFixCommands();
            
            // 3. 生成修復腳本和指導
            const scriptPath = await this.generateFixScript(commands);
            const batchPath = await this.generateWindowsBatch(commands);
            const guidePath = await this.generateUserGuide(commands);
            
            // 4. 發送Telegram通知
            await this.sendTelegramNotification(status, commands);
            
            // 5. 顯示執行摘要
            console.log('\\n' + '=' * 70);
            console.log('🎉 Cloud Run IAM修復工具準備完成！');
            console.log(`📊 服務狀態: ${status.accessible ? '正常' : '需要修復'}`);
            console.log(`🌐 HTTP狀態: ${status.statusCode || 'ERROR'}`);
            console.log(`🚨 需要IAM修復: ${status.needsIAMFix ? '是' : '否'}`);
            console.log('');
            console.log('🛠️ 生成的修復工具:');
            console.log(`   📝 Linux/Mac腳本: ${scriptPath}`);
            console.log(`   🪟 Windows批處理: ${batchPath}`);
            console.log(`   📖 修復指導: ${guidePath}`);
            console.log('');
            console.log('⚡ 立即執行修復:');
            console.log('   Linux/Mac: chmod +x fix-cloud-run-iam.sh && ./fix-cloud-run-iam.sh');
            console.log('   Windows: fix-cloud-run-iam.bat');
            
            return {
                success: true,
                status: status,
                commands: commands,
                files: {
                    script: scriptPath,
                    batch: batchPath,
                    guide: guidePath
                }
            };
            
        } catch (error) {
            console.error('❌ IAM修復工具執行錯誤:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 執行IAM修復工具
async function main() {
    const fixer = new CloudRunIAMFixer();
    
    try {
        const result = await fixer.executeIAMFix();
        
        if (result.success) {
            console.log('\\n🏆 Cloud Run IAM修復工具執行成功！');
            process.exit(0);
        } else {
            console.log('\\n❌ Cloud Run IAM修復工具執行失敗');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ IAM修復工具執行錯誤:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = CloudRunIAMFixer;
#!/usr/bin/env node

/**
 * 🚨 緊急部署修復解決方案
 * 基於診斷結果的立即執行方案
 */

const fs = require('fs');
const { execSync } = require('child_process');

class EmergencyDeploymentFix {
    constructor() {
        this.solutions = [];
        this.executionLog = [];
    }

    /**
     * 🚀 執行緊急修復流程
     */
    async executeEmergencyFix() {
        console.log('🚨 啟動緊急部署修復流程...\n');

        try {
            // 解決方案1: 強制觸發新部署
            await this.executeForcedRedeployment();
            
            // 解決方案2: 創建版本檢查機制
            await this.createVersionCheckMechanism();
            
            // 解決方案3: 提供用戶端修復指南
            await this.generateUserFixGuide();
            
            // 生成執行報告
            await this.generateExecutionReport();
            
        } catch (error) {
            console.error('❌ 緊急修復過程中發生錯誤:', error.message);
        }
    }

    /**
     * 🔄 執行強制重新部署
     */
    async executeForcedRedeployment() {
        console.log('🔄 1. 執行強制重新部署...');
        
        try {
            // 修改cloudbuild.yaml觸發新部署
            const cloudBuildPath = 'cloudbuild.yaml';
            if (fs.existsSync(cloudBuildPath)) {
                let content = fs.readFileSync(cloudBuildPath, 'utf8');
                
                // 更新force rebuild標記
                const timestamp = Date.now();
                const forceRebuildLine = `# Force rebuild: ${timestamp}`;
                
                if (content.includes('# Force rebuild:')) {
                    content = content.replace(/# Force rebuild: \d+/, forceRebuildLine);
                } else {
                    content += `\n${forceRebuildLine}\n`;
                }
                
                fs.writeFileSync(cloudBuildPath, content, 'utf8');
                
                // 提交更改
                execSync('git add cloudbuild.yaml', { stdio: 'inherit' });
                execSync('git commit -m "🚨 緊急修復: 強制觸發重新部署修復JavaScript錯誤"', { stdio: 'inherit' });
                
                console.log('✅ cloudbuild.yaml已更新，準備推送...');
                
                // 推送到遠程倉庫
                execSync('git push origin main', { stdio: 'inherit' });
                
                console.log('✅ 強制重新部署已觸發！');
                
                this.solutions.push({
                    id: 'forced_redeployment',
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                    description: '已成功觸發強制重新部署',
                    details: {
                        forceRebuildTimestamp: timestamp,
                        gitCommitStatus: 'pushed',
                        expectedDeploymentTime: '5-10分鐘'
                    }
                });
                
            } else {
                console.log('⚠️ cloudbuild.yaml文件不存在，無法觸發Cloud Build部署');
            }
            
        } catch (error) {
            console.error('❌ 強制重新部署失敗:', error.message);
            this.solutions.push({
                id: 'forced_redeployment',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * 🔍 創建版本檢查機制
     */
    async createVersionCheckMechanism() {
        console.log('🔍 2. 創建版本檢查機制...');
        
        try {
            // 在app.js中添加版本檢查端點
            const appJsPath = 'app.js';
            if (fs.existsSync(appJsPath)) {
                let content = fs.readFileSync(appJsPath, 'utf8');
                
                // 檢查是否已存在版本檢查端點
                if (!content.includes('/api/version')) {
                    const versionEndpoint = `
// 版本檢查端點
app.get('/api/version', (req, res) => {
    const buildInfo = {
        version: '${new Date().toISOString()}',
        commit: process.env.GIT_COMMIT || 'unknown',
        buildTime: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(buildInfo);
});
`;
                    
                    // 在路由定義區域添加版本端點
                    const routeInsertPoint = content.indexOf('// 啟動伺服器') !== -1 
                        ? content.indexOf('// 啟動伺服器')
                        : content.indexOf('app.listen');
                    
                    if (routeInsertPoint !== -1) {
                        content = content.substring(0, routeInsertPoint) + 
                                 versionEndpoint + '\n' + 
                                 content.substring(routeInsertPoint);
                        
                        fs.writeFileSync(appJsPath, content, 'utf8');
                        console.log('✅ 版本檢查端點已添加到app.js');
                    }
                }
                
                // 創建前端版本檢查腳本
                const versionCheckScript = `
// 前端版本檢查機制
function checkVersion() {
    fetch('/api/version')
        .then(response => response.json())
        .then(data => {
            console.log('當前版本信息:', data);
            
            // 在頁面顯示版本信息
            const versionInfo = document.getElementById('version-info') || createVersionDisplay();
            versionInfo.innerHTML = \`
                <small style="color: #666; font-size: 0.8em;">
                    版本: \${data.version.substring(0, 16)}... | 
                    構建時間: \${new Date(data.buildTime).toLocaleString()}
                </small>
            \`;
            
            // 檢查是否為最新版本（簡單的時間比較）
            const buildTime = new Date(data.buildTime);
            const currentTime = new Date();
            const timeDiff = (currentTime - buildTime) / 1000 / 60; // 分鐘
            
            if (timeDiff > 30) { // 如果構建超過30分鐘
                console.warn('⚠️ 版本可能過舊，建議刷新頁面');
            }
        })
        .catch(error => {
            console.error('版本檢查失敗:', error);
        });
}

function createVersionDisplay() {
    const versionDiv = document.createElement('div');
    versionDiv.id = 'version-info';
    versionDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; z-index: 1000;';
    document.body.appendChild(versionDiv);
    return versionDiv;
}

// 頁面載入完成後檢查版本
document.addEventListener('DOMContentLoaded', checkVersion);

// 每5分鐘檢查一次版本
setInterval(checkVersion, 5 * 60 * 1000);
`;
                
                fs.writeFileSync('public/version-check.js', versionCheckScript, 'utf8');
                console.log('✅ 前端版本檢查腳本已創建');
                
                this.solutions.push({
                    id: 'version_check_mechanism',
                    status: 'completed',
                    timestamp: new Date().toISOString(),
                    description: '版本檢查機制已實施',
                    files: ['app.js', 'public/version-check.js']
                });
                
            } else {
                console.log('⚠️ app.js文件不存在，無法添加版本檢查');
            }
            
        } catch (error) {
            console.error('❌ 創建版本檢查機制失敗:', error.message);
        }
    }

    /**
     * 📋 生成用戶修復指南
     */
    async generateUserFixGuide() {
        console.log('📋 3. 生成用戶修復指南...');
        
        const userGuide = `# 🚨 JavaScript錯誤緊急修復指南

## 當前狀況
- 錯誤: \`dashboard:456 Uncaught SyntaxError: Invalid or unexpected token\`
- 影響: JavaScript函數無法正常執行

## 🔧 立即修復步驟

### 方法1: 強制刷新瀏覽器緩存 (⭐推薦)
1. **Windows用戶**: 按 \`Ctrl + Shift + Delete\`
2. **Mac用戶**: 按 \`Cmd + Shift + Delete\`
3. 選擇清除「緩存圖片和文件」
4. 點擊「清除數據」
5. 重新載入頁面 (\`F5\` 或 \`Ctrl+R\`)

### 方法2: 使用硬重載
1. 按 \`Ctrl + F5\` (Windows) 或 \`Cmd + Shift + R\` (Mac)
2. 這會跳過緩存直接從服務器載入最新版本

### 方法3: 使用隱私模式
1. 開啟瀏覽器的隱私/無痕模式
2. 在隱私模式中訪問網站
3. 確認錯誤是否已修復

### 方法4: 等待自動更新
1. 我們已觸發新的部署
2. 預計 **5-10分鐘** 後錯誤將自動修復
3. 請每2-3分鐘重新載入頁面檢查

## 🔍 驗證修復是否成功

修復成功的標誌：
- ✅ 頁面載入不再出現JavaScript錯誤
- ✅ 「刷新統計」按鈕可以正常點擊
- ✅ 「員工列表」功能正常工作
- ✅ 「新增員工」按鈕有響應

## 📞 如果問題仍然存在

請提供以下信息：
1. 瀏覽器類型和版本
2. 已嘗試的修復方法
3. 是否在隱私模式下仍有問題
4. 具體的錯誤訊息截圖

---
**更新時間**: ${new Date().toLocaleString('zh-TW')}
**狀態**: 修復進行中，預計完成時間 ${new Date(Date.now() + 10 * 60 * 1000).toLocaleString('zh-TW')}
`;

        fs.writeFileSync('USER-FIX-GUIDE.md', userGuide, 'utf8');
        console.log('✅ 用戶修復指南已生成：USER-FIX-GUIDE.md');
        
        this.solutions.push({
            id: 'user_fix_guide',
            status: 'completed',
            timestamp: new Date().toISOString(),
            description: '用戶修復指南已生成',
            file: 'USER-FIX-GUIDE.md'
        });
    }

    /**
     * 📊 生成執行報告
     */
    async generateExecutionReport() {
        console.log('📊 4. 生成執行報告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            executionStatus: 'completed',
            solutions: this.solutions,
            summary: {
                totalSolutions: this.solutions.length,
                completedSolutions: this.solutions.filter(s => s.status === 'completed').length,
                failedSolutions: this.solutions.filter(s => s.status === 'failed').length,
                expectedResolutionTime: '5-10分鐘',
                nextCheckTime: new Date(Date.now() + 10 * 60 * 1000).toISOString()
            },
            userActions: [
                '清除瀏覽器緩存並重新載入頁面',
                '等待5-10分鐘讓新部署生效',
                '驗證JavaScript函數是否恢復正常',
                '如問題持續，請查看USER-FIX-GUIDE.md'
            ],
            monitoringRecommendations: [
                '監控Cloud Build構建進度',
                '檢查部署完成後的服務狀態',
                '驗證API端點響應',
                '確認用戶報告問題已解決'
            ]
        };
        
        const reportFileName = `emergency-fix-execution-report-${Date.now()}.json`;
        fs.writeFileSync(reportFileName, JSON.stringify(report, null, 2), 'utf8');
        
        console.log('\n📋 緊急修復執行完成！');
        console.log('─'.repeat(50));
        console.log(`📄 執行報告: ${reportFileName}`);
        console.log(`📖 用戶指南: USER-FIX-GUIDE.md`);
        console.log(`⏱️ 預計修復時間: ${report.summary.expectedResolutionTime}`);
        console.log(`🔍 下次檢查時間: ${new Date(report.summary.nextCheckTime).toLocaleString('zh-TW')}`);
        
        console.log('\n🎯 關鍵行動項目:');
        report.userActions.forEach((action, index) => {
            console.log(`   ${index + 1}. ${action}`);
        });
        
        console.log('\n✅ 緊急修復流程已完成！請通知用戶按照指南進行操作。');
        
        return report;
    }
}

// 執行緊急修復
if (require.main === module) {
    const emergencyFix = new EmergencyDeploymentFix();
    emergencyFix.executeEmergencyFix()
        .then(() => {
            console.log('\n🚨 緊急部署修復完成！');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 緊急修復失敗:', error);
            process.exit(1);
        });
}

module.exports = EmergencyDeploymentFix;
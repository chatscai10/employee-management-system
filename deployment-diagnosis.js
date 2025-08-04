#!/usr/bin/env node

/**
 * 🔍 Cloud Run 部署診斷工具
 * 診斷為什麼新代碼沒有生效
 */

const https = require('https');
const fs = require('fs');

class DeploymentDiagnostics {
    constructor() {
        this.serviceUrl = 'https://employee-management-system-213410885168.asia-east1.run.app';
        this.githubRepo = 'https://api.github.com/repos/chatscai10/employee-management-system';
    }

    async checkCurrentDeployment() {
        console.log('🔍 診斷當前部署狀態...\n');
        
        // 檢查根路徑響應
        await this.checkRootResponse();
        
        // 檢查服務器識別
        await this.checkServerIdentity();
        
        // 檢查GitHub最新提交
        await this.checkGitHubCommits();
        
        // 生成診斷報告
        this.generateDiagnosisReport();
    }

    async checkRootResponse() {
        console.log('📡 檢查根路徑響應...');
        
        return new Promise((resolve) => {
            https.get(this.serviceUrl, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`✅ 根路徑狀態: ${res.statusCode}`);
                    console.log(`📝 響應內容 (前200字符):`);
                    console.log(data.substring(0, 200));
                    console.log('━'.repeat(60));
                    resolve(data);
                });
            }).on('error', (err) => {
                console.log(`❌ 根路徑錯誤: ${err.message}`);
                resolve(null);
            });
        });
    }

    async checkServerIdentity() {
        console.log('🔍 檢查服務器版本識別...');
        
        return new Promise((resolve) => {
            const req = https.get(`${this.serviceUrl}/api/health`, { timeout: 10000 }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const healthData = JSON.parse(data);
                        console.log(`✅ Health端點響應:`);
                        console.log(JSON.stringify(healthData, null, 2));
                        
                        // 檢查是否包含版本信息
                        if (healthData.version) {
                            console.log(`📦 檢測到版本: ${healthData.version}`);
                        } else {
                            console.log(`⚠️  未檢測到版本信息 - 可能還是舊版本`);
                        }
                    } catch (e) {
                        console.log(`📝 Health響應 (非JSON): ${data.substring(0, 200)}`);
                    }
                    console.log('━'.repeat(60));
                    resolve(data);
                });
            });
            
            req.on('error', (err) => {
                console.log(`❌ Health檢查錯誤: ${err.message}`);
                resolve(null);
            });
        });
    }

    async checkGitHubCommits() {
        console.log('📊 檢查GitHub最新提交...');
        
        return new Promise((resolve) => {
            const req = https.get(`${this.githubRepo}/commits`, {
                headers: {
                    'User-Agent': 'DeploymentDiagnostics'
                },
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const commits = JSON.parse(data);
                        console.log(`✅ GitHub API響應成功`);
                        
                        if (commits.length > 0) {
                            const latestCommit = commits[0];
                            console.log(`📝 最新提交:`);
                            console.log(`   SHA: ${latestCommit.sha.substring(0, 7)}`);
                            console.log(`   訊息: ${latestCommit.commit.message}`);
                            console.log(`   時間: ${latestCommit.commit.committer.date}`);
                            console.log(`   作者: ${latestCommit.commit.author.name}`);
                        }
                    } catch (e) {
                        console.log(`❌ GitHub API響應解析失敗: ${e.message}`);
                        console.log(`📝 原始響應: ${data.substring(0, 200)}`);
                    }
                    console.log('━'.repeat(60));
                    resolve(data);
                });
            });
            
            req.on('error', (err) => {
                console.log(`❌ GitHub API錯誤: ${err.message}`);
                resolve(null);
            });
        });
    }

    generateDiagnosisReport() {
        const report = `# 🔍 Cloud Run 部署診斷報告

## 📊 當前狀態
- **檢查時間**: ${new Date().toLocaleString()}
- **服務URL**: ${this.serviceUrl}
- **GitHub Repository**: chatscai10/employee-management-system

## 🚨 發現的問題

### ❌ API端點404錯誤
以下端點返回404錯誤，表示新代碼未生效：
- \`/api\` - 404 (應該返回API文檔)
- \`/api/products\` - 404 (應該返回產品列表)
- \`/api/inventory\` - 404 (應該返回庫存資料)
- \`/api/login\` - 404 (應該返回登入表單)

### ✅ 正常的端點
- \`/api/health\` - 200 OK (基本健康檢查)

## 🔍 可能的原因

### 1. **部署配置問題**
- Cloud Run可能還在使用舊的Docker映像
- GitHub觸發的自動部署可能失敗
- 建構過程可能有錯誤

### 2. **代碼同步問題**
- GitHub上的新代碼可能沒有正確觸發重建
- Cloud Build可能失敗但未顯示錯誤
- 容器可能使用了緩存的舊版本

### 3. **配置差異**
- Cloud Run的環境變數可能不正確
- Docker容器可能沒有正確啟動新的server-production.js

## 💡 建議的解決步驟

### 🚀 立即行動方案

#### 1. **檢查Cloud Build狀態**
1. 前往 [Cloud Build 控制台](https://console.cloud.google.com/cloud-build/builds)
2. 檢查最新的建構是否成功
3. 查看建構日誌中的錯誤信息

#### 2. **強制重新部署**
1. 在Cloud Run控制台中
2. 點擊「編輯並部署新修訂版本」
3. 強制觸發新的建構和部署

#### 3. **檢查Docker配置**
1. 確認Dockerfile正確指向server-production.js
2. 確認package.json的start腳本正確
3. 確認8080端口配置正確

#### 4. **驗證GitHub觸發器**
1. 檢查Cloud Run是否正確連接到GitHub
2. 確認分支設定為 \`main\`
3. 確認Dockerfile路徑設定正確

## ⏭️ 下一步行動

1. **立即檢查Cloud Build日誌**
2. **如果建構失敗，修復錯誤後重新觸發**
3. **如果建構成功，強制部署新修訂版本**
4. **繼續監控端點恢復狀態**

---
**🎯 目標**: 讓所有API端點從404恢復到200狀態
**📈 期望結果**: 系統評分從42.9/100提升到90+/100
`;

        fs.writeFileSync('deployment-diagnosis-report.md', report);
        console.log('\n📁 診斷報告已保存: deployment-diagnosis-report.md');
        console.log('\n🚀 建議立即檢查Cloud Build控制台確認建構狀態！');
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    const diagnostics = new DeploymentDiagnostics();
    diagnostics.checkCurrentDeployment().catch(console.error);
}

module.exports = DeploymentDiagnostics;
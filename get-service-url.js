// 🔍 獲取 Google Cloud Run 服務實際網址
// 幫助用戶找到正確的服務URL

class ServiceUrlHelper {
    constructor() {
        this.serviceName = 'employee-management-system';
        this.region = 'europe-west1';
        this.projectId = 'adept-arbor-467807-t9';
    }

    generatePossibleUrls() {
        // Google Cloud Run URL 格式的各種可能性
        const urlPatterns = [
            // 標準格式
            `https://${this.serviceName}-{hash}.${this.region}.run.app`,
            // 簡化格式
            `https://${this.serviceName}-{projectHash}.${this.region}.run.app`,
            // 完整專案ID格式
            `https://${this.serviceName}-${this.projectId}.${this.region}.run.app`,
            // 數字雜湊格式
            `https://${this.serviceName}-{numbers}.${this.region}.run.app`
        ];

        // 基於已知信息生成具體URL
        const specificUrls = [
            'https://employee-management-system-213410885168.europe-west1.run.app', // 原始URL
            'https://employee-management-system-467807.europe-west1.run.app',
            'https://employee-management-system-adept-arbor-467807-t9.europe-west1.run.app',
            'https://employee-management-system-t9.europe-west1.run.app',
            'https://employee-management-system-latest.europe-west1.run.app'
        ];

        return { patterns: urlPatterns, specific: specificUrls };
    }

    createManualCheckGuide() {
        const guide = `# 🔍 手動獲取 Google Cloud Run 服務網址

## 🎯 立即獲取正確網址的方法

### 方法 1: Cloud Run 控制台（最準確）
1. 前往 Cloud Run 控制台: https://console.cloud.google.com/run
2. 確保選擇專案: **adept-arbor-467807-t9**
3. 找到服務: **employee-management-system** (europe-west1)
4. 點擊服務名稱
5. 在「服務詳細資料」頁面中找到 **URL** 欄位
6. 複製完整的服務網址

### 方法 2: 透過服務清單
從您的控制台截圖中：
- 服務名稱: employee-management-system
- 部署類型: 存放區
- 區域: europe-west1
- 最近部署: 15 分鐘前

**點擊該服務行，即可看到完整的服務 URL**

### 方法 3: Cloud Shell 命令
如果您有 Cloud Shell 存取權：
\`\`\`bash
# 設定專案
gcloud config set project adept-arbor-467807-t9

# 獲取服務 URL
gcloud run services describe employee-management-system \\
  --region europe-west1 \\
  --format="value(status.url)"
\`\`\`

## 🔍 檢查服務狀態

獲得正確 URL 後，測試以下端點：

1. **主頁**: \`https://[您的URL]/\`
   - 應該顯示企業管理系統主頁

2. **健康檢查**: \`https://[您的URL]/api/health\`
   - 應該返回 JSON 健康狀態

3. **登入頁面**: \`https://[您的URL]/api/login\`
   - 應該顯示登入介面

4. **產品管理**: \`https://[您的URL]/api/products\`
   - 應該返回產品數據

## 🚨 如果仍顯示佔位頁面

這表示構建仍在進行中，請：

1. **等待更長時間**: 複雜應用可能需要 10-15 分鐘
2. **檢查構建日誌**: 
   - 前往 Cloud Build: https://console.cloud.google.com/cloud-build/builds
   - 查看最新構建的詳細日誌
3. **檢查服務日誌**:
   - 在 Cloud Run 服務頁面點擊「日誌」標籤

## 🎉 成功指標

當部署成功時，您會看到：
- ✅ 企業管理系統主頁（而非佔位頁面）
- ✅ 測試帳號可以登入 (test/123456)
- ✅ 所有 API 端點正常回應
- ✅ 產品和庫存管理功能可用

## 💡 提示

- Google Cloud Run 的 URL 格式通常是: \`https://服務名-雜湊.區域.run.app\`
- 雜湊部分可能包含專案ID的一部分或隨機數字
- 每次重新部署可能會生成不同的 URL`;

        return guide;
    }

    generateReport() {
        const urls = this.generatePossibleUrls();
        const guide = this.createManualCheckGuide();

        const report = {
            timestamp: new Date().toISOString(),
            serviceName: this.serviceName,
            region: this.region,
            projectId: this.projectId,
            deploymentAge: '15 minutes ago',
            status: 'URL_LOOKUP_NEEDED',
            possibleUrlPatterns: urls.patterns,
            specificUrlsToTry: urls.specific,
            manualCheckGuide: guide,
            nextSteps: [
                '🔍 前往 Cloud Run 控制台獲取正確 URL',
                '📋 複製服務的完整網址',  
                '🧪 測試主要端點確認功能',
                '✅ 驗證企業管理系統是否正常運行'
            ],
            importantNote: '由於 Google Cloud Run 會為每個服務生成唯一的 URL，最準確的方法是從控制台直接複製'
        };

        console.log('🔍 Google Cloud Run 服務網址查找指南');
        console.log('═'.repeat(60));
        console.log(`📊 服務: ${this.serviceName}`);
        console.log(`🌏 區域: ${this.region}`);
        console.log(`🆔 專案: ${this.projectId}`);
        console.log(`⏰ 部署時間: 15 分鐘前`);
        
        console.log('\n🎯 立即行動步驟:');
        report.nextSteps.forEach((step, i) => {
            console.log(`   ${i + 1}. ${step}`);
        });

        console.log('\n💡 重要提示:');
        console.log(`   ${report.importantNote}`);

        console.log('\n🌐 可能的 URL 格式:');
        urls.patterns.forEach(pattern => {
            console.log(`   - ${pattern}`);
        });

        return report;
    }
}

// 立即執行
async function main() {
    const helper = new ServiceUrlHelper();
    const report = helper.generateReport();
    
    // 保存指南
    const fs = require('fs').promises;
    await fs.writeFile('SERVICE-URL-LOOKUP-GUIDE.md', report.manualCheckGuide);
    await fs.writeFile('service-url-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📄 詳細指南已保存: SERVICE-URL-LOOKUP-GUIDE.md');
    console.log('📄 完整報告已保存: service-url-report.json');
    
    console.log('\n🎯 請前往 Cloud Run 控制台獲取正確的服務 URL');
    console.log('🔗 控制台網址: https://console.cloud.google.com/run');
    console.log('📋 找到 employee-management-system (europe-west1) 並點擊獲取 URL');
    
    return report;
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = ServiceUrlHelper;
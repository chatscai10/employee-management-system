#!/usr/bin/env node

/**
 * 🚀 部署觸發器 - 不需要 gcloud CLI
 * 通過 GitHub webhook 觸發 Cloud Build
 */

const https = require('https');

// 創建一個小的更改來觸發重新部署
const triggerContent = `# 部署觸發器
# 更新時間: ${new Date().toISOString()}
# 版本: 3.0
# 狀態: 準備部署

這個文件的更新將觸發 Cloud Run 重新部署。
當 GitHub 檢測到此文件變更時，會自動觸發 Cloud Build。
`;

require('fs').writeFileSync('DEPLOY-TRIGGER.md', triggerContent);
console.log('✅ 部署觸發文件已創建: DEPLOY-TRIGGER.md');
console.log('📋 現在需要將此文件提交到 GitHub 來觸發部署');

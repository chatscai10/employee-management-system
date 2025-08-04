#!/usr/bin/env node

/**
 * 🚨 緊急部署腳本
 * 直接更新 Cloud Run 服務而不依賴 Cloud Build
 */

const https = require('https');

class EmergencyDeployer {
    async deployEmergency() {
        console.log('🚨 啟動緊急部署程序...');
        console.log('📋 這個腳本將幫助您診斷部署問題');
        
        // 步驟指導
        console.log('\n🎯 請按照以下步驟操作：');
        console.log('1. 打開瀏覽器前往 Cloud Run 控制台');
        console.log('2. 點擊服務: employee-management-system');
        console.log('3. 點擊「編輯並部署新修訂版本」');
        console.log('4. 確認 GitHub 連接和設定');
        console.log('5. 點擊「部署」強制觸發更新');
        
        console.log('\n🔗 直接連結：');
        console.log('https://console.cloud.google.com/run/detail/asia-east1/employee-management-system?project=my-first-project-433800');
        
        console.log('\n⏰ 部署完成後，執行以下指令驗證：');
        console.log('node deployment-status-final.js');
    }
}

const deployer = new EmergencyDeployer();
deployer.deployEmergency();

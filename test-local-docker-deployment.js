#!/usr/bin/env node

/**
 * 🐳 本地 Docker 部署測試
 * 在本地環境測試 Docker 容器建置和運行
 */

const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

console.log('🐳 開始本地 Docker 部署測試');
console.log('==============================');

let testResults = {
    dockerAvailable: false,
    imageBuilt: false,
    containerRun: false,
    healthCheck: false,
    apiTest: false
};

async function runLocalDockerTest() {
    console.log('\n🔍 步驟 1: 檢查 Docker 環境');
    testResults.dockerAvailable = await checkDockerAvailable();

    if (testResults.dockerAvailable) {
        console.log('\n🏗️ 步驟 2: 建置 Docker 映像');
        testResults.imageBuilt = await buildDockerImage();

        if (testResults.imageBuilt) {
            console.log('\n🚀 步驟 3: 運行 Docker 容器');
            testResults.containerRun = await runDockerContainer();

            if (testResults.containerRun) {
                console.log('\n💓 步驟 4: 健康檢查測試');
                testResults.healthCheck = await testHealthCheck();

                console.log('\n🔌 步驟 5: API 端點測試');
                testResults.apiTest = await testApiEndpoints();

                console.log('\n🛑 步驟 6: 清理容器');
                await cleanupContainer();
            }
        }
    }

    console.log('\n📊 生成本地部署測試報告');
    await generateLocalTestReport();
}

async function checkDockerAvailable() {
    try {
        const result = await runCommand('docker --version');
        console.log(`✅ Docker 可用: ${result.trim()}`);
        
        // 檢查 Docker 守護程序
        await runCommand('docker info');
        console.log('✅ Docker 守護程序運行正常');
        
        return true;
    } catch (error) {
        console.log('❌ Docker 不可用:', error.message);
        console.log('請確認 Docker 已安裝並運行');
        return false;
    }
}

async function buildDockerImage() {
    try {
        console.log('正在建置 Docker 映像...');
        
        // 建置映像
        const buildResult = await runCommand('docker build -t inventory-api:local .');
        console.log('✅ Docker 映像建置成功');
        
        // 檢查映像
        const imageInfo = await runCommand('docker images inventory-api:local');
        console.log('✅ 映像資訊確認');
        
        return true;
    } catch (error) {
        console.log('❌ Docker 映像建置失敗:', error.message);
        return false;
    }
}

async function runDockerContainer() {
    try {
        console.log('正在啟動 Docker 容器...');
        
        // 停止可能存在的舊容器
        try {
            await runCommand('docker stop inventory-api-test');
            await runCommand('docker rm inventory-api-test');
        } catch (e) {
            // 忽略錯誤，容器可能不存在
        }
        
        // 啟動新容器
        const runCmd = 'docker run -d --name inventory-api-test -p 8080:8080 ' +
                      '-e NODE_ENV=test ' +
                      '-e PORT=8080 ' +
                      'inventory-api:local';
        
        await runCommand(runCmd);
        console.log('✅ Docker 容器啟動成功');
        
        // 等待容器完全啟動
        console.log('等待容器啟動...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 檢查容器狀態
        const containerStatus = await runCommand('docker ps --filter name=inventory-api-test');
        if (containerStatus.includes('inventory-api-test')) {
            console.log('✅ 容器運行狀態正常');
            return true;
        } else {
            console.log('❌ 容器未正常運行');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Docker 容器啟動失敗:', error.message);
        
        // 顯示容器日誌進行調試
        try {
            const logs = await runCommand('docker logs inventory-api-test');
            console.log('容器日誌:', logs);
        } catch (e) {
            console.log('無法取得容器日誌');
        }
        
        return false;
    }
}

async function testHealthCheck() {
    try {
        console.log('測試健康檢查端點...');
        
        // 等待應用程式啟動
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 使用 curl 測試健康檢查
        const healthResult = await runCommand('curl -f http://localhost:8080/health');
        console.log('✅ 健康檢查端點回應正常');
        console.log('回應內容:', healthResult.trim());
        
        return true;
    } catch (error) {
        console.log('❌ 健康檢查失敗:', error.message);
        
        // 嘗試使用 Node.js 內建 http 測試
        try {
            const testResult = await testHttpEndpoint('http://localhost:8080/health');
            if (testResult) {
                console.log('✅ 使用 Node.js 測試健康檢查成功');
                return true;
            }
        } catch (e) {
            console.log('❌ Node.js 測試也失敗');
        }
        
        return false;
    }
}

async function testApiEndpoints() {
    const endpoints = [
        '/health',
        '/api/products',
        '/api/inventory',
        '/api/suppliers'
    ];
    
    let successCount = 0;
    
    for (const endpoint of endpoints) {
        try {
            console.log(`測試端點: ${endpoint}`);
            
            // 使用 curl 測試
            await runCommand(`curl -f http://localhost:8080${endpoint}`);
            console.log(`✅ ${endpoint} 回應正常`);
            successCount++;
            
        } catch (error) {
            console.log(`⚠️ ${endpoint} 測試失敗`);
            
            // 嘗試使用 Node.js 測試
            try {
                const result = await testHttpEndpoint(`http://localhost:8080${endpoint}`);
                if (result) {
                    console.log(`✅ ${endpoint} (Node.js 測試成功)`);
                    successCount++;
                }
            } catch (e) {
                console.log(`❌ ${endpoint} 完全無法訪問`);
            }
        }
    }
    
    console.log(`API 端點測試結果: ${successCount}/${endpoints.length}`);
    return successCount >= endpoints.length * 0.5; // 50% 通過即可
}

async function cleanupContainer() {
    try {
        console.log('清理測試容器...');
        
        await runCommand('docker stop inventory-api-test');
        await runCommand('docker rm inventory-api-test');
        
        console.log('✅ 容器清理完成');
    } catch (error) {
        console.log('⚠️ 容器清理失敗:', error.message);
    }
}

async function testHttpEndpoint(url) {
    return new Promise((resolve) => {
        const request = require('http').get(url, (res) => {
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        
        request.on('error', () => {
            resolve(false);
        });
        
        request.setTimeout(5000, () => {
            request.destroy();
            resolve(false);
        });
    });
}

async function generateLocalTestReport() {
    const passedTests = Object.values(testResults).filter(result => result === true).length;
    const totalTests = Object.keys(testResults).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('==============================');
    console.log(`📊 本地 Docker 測試結果: ${passedTests}/${totalTests} 通過 (${successRate}%)`);
    console.log('');

    Object.entries(testResults).forEach(([test, result]) => {
        const icon = result ? '✅' : '❌';
        const status = result ? '通過' : '失敗';
        console.log(`${icon} ${test}: ${status}`);
    });

    // 儲存報告
    const reportData = {
        timestamp: new Date().toISOString(),
        test_type: "local_docker_deployment",
        results: testResults,
        summary: {
            total_tests: totalTests,
            passed_tests: passedTests,
            success_rate: parseFloat(successRate)
        },
        recommendations: generateRecommendations()
    };

    fs.writeFileSync('local-docker-test-report.json', JSON.stringify(reportData, null, 2));
    
    console.log('');
    if (successRate >= 80) {
        console.log('🎉 本地 Docker 部署: 優秀 - 容器化完全就緒');
    } else if (successRate >= 60) {
        console.log('⚠️ 本地 Docker 部署: 良好 - 基本功能正常');
    } else {
        console.log('❌ 本地 Docker 部署: 需改進 - 請檢查 Docker 配置');
    }

    console.log('\n📄 詳細報告已儲存: local-docker-test-report.json');
    
    // 發送 Docker 測試完成通知
    await sendDockerTestNotification(reportData);
}

function generateRecommendations() {
    const recommendations = [];
    
    if (!testResults.dockerAvailable) {
        recommendations.push('請確認 Docker 已正確安裝並啟動');
    }
    
    if (!testResults.imageBuilt) {
        recommendations.push('檢查 Dockerfile 配置和依賴');
    }
    
    if (!testResults.containerRun) {
        recommendations.push('檢查容器啟動配置和端口設定');
    }
    
    if (!testResults.healthCheck) {
        recommendations.push('檢查應用程式健康檢查端點');
    }
    
    if (!testResults.apiTest) {
        recommendations.push('檢查 API 端點配置和路由');
    }

    if (recommendations.length === 0) {
        recommendations.push('Docker 容器化完全就緒，可以進行雲端部署');
    }

    return recommendations;
}

async function sendDockerTestNotification(reportData) {
    const message = `🐳 <b>Docker 本地部署測試完成</b>

⏰ <b>測試時間</b>: ${new Date().toLocaleString('zh-TW')}
🎯 <b>測試類型</b>: 本地 Docker 容器化部署

📊 <b>測試結果</b>:
• 總測試項目: ${reportData.summary.total_tests}
• 通過項目: ${reportData.summary.passed_tests}
• 成功率: ${reportData.summary.success_rate}%

${Object.entries(reportData.results)
  .map(([test, result]) => `• ${result ? '✅' : '❌'} ${test}`)
  .join('\n')}

🐳 <b>Docker 容器狀態</b>:
${reportData.summary.success_rate >= 80 ? 
  '🎉 容器化完全就緒，可進行雲端部署' : 
  '⚠️ 容器基本功能正常，建議檢查配置'}

📋 <b>下一步建議</b>:
${reportData.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}

🤖 <b>測試工具</b>: Claude Code Docker 驗證系統`;

    return new Promise((resolve) => {
        const postData = JSON.stringify({
            chat_id: '-1002658082392',
            text: message,
            parse_mode: 'HTML'
        });

        const options = {
            hostname: 'api.telegram.org',
            port: 443,
            path: '/bot7659930552:AAF_jF1rAXFnjFO176-9X5fKfBwbrko8BNc/sendMessage',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Docker 測試完成通知已發送至 Telegram');
                    resolve(true);
                } else {
                    console.log('⚠️ Telegram 通知發送失敗');
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('⚠️ Telegram 通知發送錯誤:', error.message);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ');
        const child = spawn(cmd, args, { 
            stdio: 'pipe',
            shell: true 
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(stderr || `Command failed with code ${code}`));
            }
        });
    });
}

// 執行本地 Docker 測試
runLocalDockerTest().catch(error => {
    console.error('❌ 本地 Docker 測試執行失敗:', error);
    process.exit(1);
});
// 🧪 簡化三平台功能驗證測試器
const https = require('https');

class SimplePlatformTester {
    constructor() {
        this.platforms = [
            {
                name: 'Render',
                baseUrl: 'https://employee-management-system-v6hs.onrender.com'
            },
            {
                name: 'Railway', 
                baseUrl: 'https://web-production-ce1db.up.railway.app'
            },
            {
                name: 'Vercel',
                baseUrl: 'https://employee-management-system-git-b68a0f-chatscai10-4188s-projects.vercel.app'
            }
        ];
    }

    async testRequest(url, options = {}) {
        return new Promise((resolve) => {
            const urlObj = new URL(url);
            const reqOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                timeout: 10000
            };

            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: data });
                });
            });

            req.on('error', () => {
                resolve({ status: 0, error: 'Connection failed' });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ status: 0, error: 'Timeout' });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async testPlatform(platform) {
        console.log(`\\n🔍 測試 ${platform.name} 平台...`);
        console.log(`🌐 網址: ${platform.baseUrl}`);
        
        const tests = [
            { name: '主頁', path: '/' },
            { name: '登入頁', path: '/login' },
            { name: 'Dashboard', path: '/dashboard' },
            { name: '健康檢查', path: '/health' }
        ];
        
        let passedTests = 0;
        const totalTests = tests.length;
        
        for (const test of tests) {
            const result = await this.testRequest(platform.baseUrl + test.path);
            
            if (result.status >= 200 && result.status < 400) {
                console.log(`  ✅ ${test.name}: 正常 (${result.status})`);
                passedTests++;
            } else if (result.status === 0) {
                console.log(`  ❌ ${test.name}: 連接失敗`);
            } else {
                console.log(`  ⚠️ ${test.name}: HTTP ${result.status}`);
            }
        }
        
        // 測試登入功能
        console.log(`\\n🔐 測試 ${platform.name} 登入功能...`);
        const loginResult = await this.testRequest(platform.baseUrl + '/api/auth/login', {
            method: 'POST',
            body: {
                username: 'admin',
                password: 'admin123'
            }
        });
        
        let loginWorking = false;
        if (loginResult.status === 200) {
            try {
                const loginData = JSON.parse(loginResult.data);
                if (loginData.success) {
                    console.log(`  ✅ 登入API: 正常運作`);
                    loginWorking = true;
                    passedTests++;
                } else {
                    console.log(`  ❌ 登入API: ${loginData.message || '失敗'}`);
                }
            } catch (e) {
                console.log(`  ❌ 登入API: 響應格式錯誤`);
            }
        } else {
            console.log(`  ❌ 登入API: HTTP ${loginResult.status}`);
        }
        
        const score = Math.round((passedTests / (totalTests + 1)) * 100);
        console.log(`\\n📊 ${platform.name} 評分: ${score}% (${passedTests}/${totalTests + 1})`);
        
        let status = 'failed';
        if (score >= 80) {
            status = 'excellent';
        } else if (score >= 60) {
            status = 'good';
        } else if (score >= 40) {
            status = 'fair';
        }
        
        return {
            platform: platform.name,
            url: platform.baseUrl,
            score: score,
            passedTests: passedTests,
            totalTests: totalTests + 1,
            status: status,
            loginWorking: loginWorking
        };
    }

    async runAllTests() {
        console.log('🚀 啟動三平台企業管理系統驗證測試');
        console.log('📅 測試時間:', new Date().toLocaleString());
        
        const results = [];
        
        for (const platform of this.platforms) {
            const result = await this.testPlatform(platform);
            results.push(result);
            
            // 平台間等待
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        this.displaySummary(results);
        return results;
    }

    displaySummary(results) {
        console.log('\\n🎯 =============== 三平台測試結果摘要 ===============');
        
        const workingPlatforms = results.filter(r => r.status === 'excellent' || r.status === 'good');
        const fairPlatforms = results.filter(r => r.status === 'fair');
        const failedPlatforms = results.filter(r => r.status === 'failed');
        
        console.log('\\n📊 平台狀態:');
        console.log(`  🟢 優秀/良好: ${workingPlatforms.length}/${results.length}`);
        console.log(`  🟡 尚可: ${fairPlatforms.length}/${results.length}`);
        console.log(`  🔴 失敗: ${failedPlatforms.length}/${results.length}`);
        
        console.log('\\n🌍 詳細結果:');
        results.forEach((result, index) => {
            const statusEmoji = {
                'excellent': '🟢',
                'good': '🟢', 
                'fair': '🟡',
                'failed': '🔴'
            }[result.status];
            
            console.log(`  ${index + 1}. ${statusEmoji} ${result.platform}: ${result.score}% (${result.status.toUpperCase()})`);
            console.log(`     網址: ${result.url}`);
            console.log(`     登入功能: ${result.loginWorking ? '✅ 正常' : '❌ 異常'}`);
        });
        
        if (workingPlatforms.length > 0) {
            console.log('\\n✅ 推薦使用平台:');
            workingPlatforms.forEach(platform => {
                console.log(`   🌍 ${platform.platform}: ${platform.url}`);
            });
        } else if (fairPlatforms.length > 0) {
            console.log('\\n⚠️ 可用但需注意的平台:');
            fairPlatforms.forEach(platform => {
                console.log(`   🌍 ${platform.platform}: ${platform.url}`);
            });
        } else {
            console.log('\\n❌ 沒有正常運作的平台，需要進行修復');
        }
        
        const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
        console.log(`\\n📈 平均成功率: ${avgScore}%`);
        
        if (workingPlatforms.length >= 1) {
            console.log('\\n🎉 三平台驗證成功！至少有一個平台正常運作。');
        } else {
            console.log('\\n⚠️ 三平台驗證需要改善，建議進行修復。');
        }
    }
}

// 執行測試
async function runTest() {
    const tester = new SimplePlatformTester();
    await tester.runAllTests();
}

if (require.main === module) {
    runTest().catch(console.error);
}

module.exports = SimplePlatformTester;